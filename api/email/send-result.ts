import type { IncomingMessage, ServerResponse } from 'http';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME
} from '../lib/constants';
import { sendBrevoEmail } from '../lib/brevo';
import {
  getPersistedAttempt,
  reserveNotificationAtomically,
  finalizeNotification
} from '../lib/firestoreAdmin';
import {
  renderStudentResultEmail,
  renderParentResultEmail
} from '../lib/emailTemplates';

async function parseBody(req: any): Promise<any> {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req: any, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const body = await parseBody(req);
    const { attemptId, attemptData } = body;

    if (!attemptId || typeof attemptId !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing or invalid attemptId' }));
      return;
    }

    // 1. Verify persisted attempt record in Firestore (with attemptData fallback)
    let attempt = await getPersistedAttempt(attemptId).catch(() => null);
    if (!attempt && attemptData) {
      attempt = attemptData;
    }
    if (!attempt) {
      await sleep(1000);
      attempt = await getPersistedAttempt(attemptId).catch(() => null);
    }
    if (!attempt && attemptData) {
      attempt = attemptData;
    }

    if (!attempt) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: `Attempt record ${attemptId} not found in Firestore. Result email can only be sent after attempt is persisted.`
        })
      );
      return;
    }

    // 2. Atomically reserve notification
    const notificationId = `result_${attemptId}`;
    const studentEmail = attempt.studentEmail || DEFAULT_STUDENT_EMAIL;
    const parentEmail = attempt.parentEmail || DEFAULT_PARENT_EMAIL;
    const studentName = attempt.studentName || DEFAULT_STUDENT_NAME;

    const isReserved = await reserveNotificationAtomically(notificationId, {
      type: 'test_result',
      recipients: [studentEmail, parentEmail],
      attemptId,
      testId: attempt.testId
    });

    if (!isReserved) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'already_sent', message: 'Result email already dispatched for this attempt.' }));
      return;
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

    // 4. Send emails via Brevo
    const [studentResult, parentResult] = await Promise.all([
      sendBrevoEmail({
        to: [{ email: studentEmail, name: studentName }],
        subject: studentMail.subject,
        htmlContent: studentMail.html,
        tags: ['bpsc-result-student']
      }),
      sendBrevoEmail({
        to: [{ email: parentEmail, name: 'Parent / Guardian' }],
        subject: parentMail.subject,
        htmlContent: parentMail.html,
        tags: ['bpsc-result-parent']
      })
    ]);

    if (!studentResult.success && !parentResult.success) {
      await finalizeNotification(notificationId, {
        status: 'failed',
        error: studentResult.error || parentResult.error
      });
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to send Brevo emails', details: { studentResult, parentResult } }));
      return;
    }

    await finalizeNotification(notificationId, {
      status: 'delivered',
      brevoMessageId: studentResult.messageId || parentResult.messageId
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, notificationId, studentResult, parentResult }));
  } catch (err: any) {
    console.error('[send-result error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
  }
}
