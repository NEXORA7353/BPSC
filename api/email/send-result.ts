import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME,
  getAppBaseUrl
} from '../_lib/constants.js';
import { sendPortalEmail } from '../_lib/mailer.js';
import {
  getPersistedAttempt,
  reserveNotificationAtomically,
  finalizeNotification,
  isFirebaseAdminConfigured
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
    const { attemptId, attemptData, appBaseUrl, force = false } = body;

    if (!attemptId || typeof attemptId !== 'string') {
      return sendJson(res, 400, { error: 'Missing or invalid attemptId' });
    }

    // 1. Resolve canonical base URL
    const baseUrl = getAppBaseUrl(req, appBaseUrl);

    // 2. Verify persisted attempt record in Firestore (with attemptData fallback)
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

    // 3. Atomically reserve notification
    const notificationId = force ? `result_${attemptId}_${Date.now()}` : `result_${attemptId}`;
    const studentEmail = attempt.studentEmail || DEFAULT_STUDENT_EMAIL;
    const parentEmail = attempt.parentEmail || DEFAULT_PARENT_EMAIL;
    const studentName = attempt.studentName || DEFAULT_STUDENT_NAME;

    let isReserved = false;
    if (force) {
      isReserved = true;
    } else {
      try {
        if (isFirebaseAdminConfigured()) {
          isReserved = await reserveNotificationAtomically(notificationId, {
            type: 'test_result',
            recipients: [studentEmail, parentEmail],
            attemptId,
            testId: attempt.testId
          });
        } else {
          isReserved = true;
        }
      } catch (dbErr: any) {
        console.warn('[send-result] Reservation error:', dbErr?.message || dbErr);
        if (dbErr?.code === 6 || dbErr?.message?.includes('ALREADY_EXISTS') || dbErr?.message?.includes('already exists')) {
          isReserved = false;
        } else {
          isReserved = true;
        }
      }
    }

    if (!isReserved) {
      return sendJson(res, 200, {
        success: true,
        alreadySent: true,
        status: 'already_sent',
        message: 'इस परीक्षा परिणाम का ईमेल पहले ही भेजा जा चुका है।'
      });
    }

    // 4. Render verified results
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
      studentName,
      baseUrl
    });

    const parentMail = renderParentResultEmail({
      testTitle: attempt.testTitle || 'Mathematics Mock Test',
      score: Number(attempt.score) || 0,
      totalMarks: Number(attempt.totalMarks) || 0,
      accuracy: Math.round(Number(attempt.accuracy) || 0),
      correctCount: Number(attempt.correctCount) || 0,
      incorrectCount: Number(attempt.incorrectCount) || 0,
      studentName,
      baseUrl,
      testId: attempt.testId
    });

    // 5. Send emails via unified sender
    const [studentResult, parentResult] = await Promise.all([
      sendPortalEmail({
        to: studentEmail,
        subject: studentMail.subject,
        html: studentMail.html,
        idempotencyKey: `${notificationId}_student`,
        tags: ['bpsc-result-student']
      }),
      sendPortalEmail({
        to: parentEmail,
        subject: parentMail.subject,
        html: parentMail.html,
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
        error: 'Failed to send result emails',
        details: {
          studentError: studentResult.error,
          parentError: parentResult.error
        }
      });
    }

    const mainMessageId = studentResult.messageId || parentResult.messageId;
    await finalizeNotification(notificationId, {
      status: 'delivered',
      emailId: mainMessageId,
      brevoMessageId: mainMessageId
    }).catch(() => null);

    return sendJson(res, 200, {
      success: true,
      notificationId,
      provider: studentResult.provider || parentResult.provider,
      reviewUrl: studentMail.reviewUrl,
      studentResult: {
        success: studentResult.success,
        messageId: studentResult.messageId,
        provider: studentResult.provider
      },
      parentResult: {
        success: parentResult.success,
        messageId: parentResult.messageId,
        provider: parentResult.provider
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
