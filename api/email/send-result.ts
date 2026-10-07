import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME
} from '../_lib/constants.js';
import { sendBrevoEmail } from '../_lib/brevo.js';
import {
  getPersistedAttempt,
  reserveNotificationAtomically,
  finalizeNotification
} from '../_lib/firestoreAdmin.js';
import {
  renderStudentResultEmail,
  renderParentResultEmail
} from '../_lib/emailTemplates.js';
import { sendJson } from '../_lib/response.js';

function parseRequestBody(req: any): any {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }
  return {};
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const body = parseRequestBody(req);
    const { attemptId, attemptData } = body;

    if (!attemptId || typeof attemptId !== 'string') {
      return sendJson(res, 400, { error: 'Missing or invalid attemptId' });
    }

    // 1. Verify persisted attempt record in Firestore (with attemptData fallback)
    let attempt = await getPersistedAttempt(attemptId).catch(() => null);
    if (!attempt && attemptData) {
      attempt = attemptData;
    }
    if (!attempt) {
      await sleep(800);
      attempt = await getPersistedAttempt(attemptId).catch(() => null);
    }
    if (!attempt && attemptData) {
      attempt = attemptData;
    }

    if (!attempt) {
      return sendJson(res, 404, {
        error: `Attempt record ${attemptId} not found in Firestore. Result email can only be sent after attempt is persisted.`
      });
    }

    // 2. Atomically reserve notification
    const notificationId = `result_${attemptId}`;
    const studentEmail = attempt.studentEmail || DEFAULT_STUDENT_EMAIL;
    const parentEmail = attempt.parentEmail || DEFAULT_PARENT_EMAIL;
    const studentName = attempt.studentName || DEFAULT_STUDENT_NAME;

    let isReserved = false;
    try {
      isReserved = await reserveNotificationAtomically(notificationId, {
        type: 'test_result',
        recipients: [studentEmail, parentEmail],
        attemptId,
        testId: attempt.testId
      });
    } catch (dbErr: any) {
      console.warn('[send-result] Reservation error:', dbErr?.message || dbErr);
      isReserved = false;
    }

    if (!isReserved) {
      return sendJson(res, 200, {
        status: 'already_sent',
        message: 'Result email already dispatched for this attempt.'
      });
    }

    // 3. Render verified results
    const studentMail = renderStudentResultEmail({
      testId: attempt.testId,
      testTitle: attempt.testTitle || 'Mathematics Mock Test',
      score: Number(attempt.score) || 0,
      totalMarks: Number(attempt.totalMarks) || 0,
      accuracy: Math.round(Number(attempt.accuracy) || 0),
      totalQuestions: Number(attempt.totalQuestions) || 0,
      correctCount: Number(attempt.correctCount) || 0,
      incorrectCount: Number(attempt.incorrectCount) || 0,
      safeSkipCount: Number(attempt.safeSkipCount) || 0,
      blankPenaltyCount: Number(attempt.blankPenaltyCount) || 0,
      totalTimeSpentSeconds: Number(attempt.totalTimeSpentSeconds) || 0,
      topicBreakdown: attempt.topicBreakdown || undefined,
      studentName
    });

    const parentMail = renderParentResultEmail({
      testTitle: attempt.testTitle || 'Mathematics Mock Test',
      score: Number(attempt.score) || 0,
      totalMarks: Number(attempt.totalMarks) || 0,
      accuracy: Math.round(Number(attempt.accuracy) || 0),
      correctCount: Number(attempt.correctCount) || 0,
      incorrectCount: Number(attempt.incorrectCount) || 0,
      studentName
    });

    // 4. Send emails via Brevo with distinct idempotency keys
    const [studentResult, parentResult] = await Promise.all([
      sendBrevoEmail({
        to: studentEmail,
        subject: studentMail.subject,
        htmlContent: studentMail.html,
        idempotencyKey: `${notificationId}_student`,
        tags: ['bpsc-result-student']
      }),
      sendBrevoEmail({
        to: parentEmail,
        subject: parentMail.subject,
        htmlContent: parentMail.html,
        idempotencyKey: `${notificationId}_parent`,
        tags: ['bpsc-result-parent']
      })
    ]);

    if (!studentResult.success && !parentResult.success) {
      await finalizeNotification(notificationId, {
        status: 'failed',
        error: studentResult.error || parentResult.error
      }).catch(() => null);

      return sendJson(res, 502, {
        error: 'Failed to send Brevo emails',
        details: {
          studentError: studentResult.error,
          parentError: parentResult.error
        }
      });
    }

    const brevoId = studentResult.messageId || parentResult.messageId;
    await finalizeNotification(notificationId, {
      status: 'delivered',
      emailId: brevoId,
      brevoMessageId: brevoId
    }).catch(() => null);

    return sendJson(res, 200, {
      success: true,
      notificationId,
      provider: 'brevo',
      studentResult: {
        success: studentResult.success,
        messageId: studentResult.messageId,
        statusCode: studentResult.statusCode
      },
      parentResult: {
        success: parentResult.success,
        messageId: parentResult.messageId,
        statusCode: parentResult.statusCode
      }
    });
  } catch (err: any) {
    console.error('[send-result error]:', err?.message || err);
    return sendJson(res, 500, {
      error: 'Internal server error processing result email',
      message: err?.message || 'Unknown error'
    });
  }
}
