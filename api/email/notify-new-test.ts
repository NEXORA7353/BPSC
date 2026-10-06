import type { IncomingMessage, ServerResponse } from 'http';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME
} from '../lib/constants';
import { sendBrevoEmail } from '../lib/brevo';
import {
  getPublishedTest,
  reserveNotificationAtomically,
  finalizeNotification,
  releaseNotificationReservation
} from '../lib/firestoreAdmin';
import {
  renderStudentNewTestEmail,
  renderParentNewTestEmail
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

export default async function handler(req: any, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const body = await parseBody(req);
    const { testId, testData } = body;

    if (!testId || typeof testId !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing or invalid testId' }));
      return;
    }

    // 1. Verify test exists in Firestore or fallback to provided testData
    let test = await getPublishedTest(testId).catch(() => null);
    if (!test && testData) {
      test = testData;
    }

    if (!test) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Test ${testId} not found in Firestore` }));
      return;
    }

    // 2. MUST be explicitly published
    if (!test.isPublished) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Test is not published. Draft tests do not send emails.' }));
      return;
    }

    // 3. Atomically reserve notification
    const notificationId = `publish_${testId}`;
    const studentEmail = test.studentEmail || DEFAULT_STUDENT_EMAIL;
    const parentEmail = test.parentEmail || DEFAULT_PARENT_EMAIL;
    const studentName = test.studentName || DEFAULT_STUDENT_NAME;

    const isReserved = await reserveNotificationAtomically(notificationId, {
      type: 'new_test',
      recipients: [studentEmail, parentEmail],
      testId
    });

    if (!isReserved) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'already_sent', message: 'Publish email already sent for this test.' }));
      return;
    }

    // 4. Render student and parent templates
    const studentMail = renderStudentNewTestEmail({
      id: testId,
      title: test.title,
      subtitle: test.subtitle,
      totalQuestions: test.totalQuestions,
      totalTimeMinutes: test.totalTimeMinutes,
      scheduledStartAt: test.scheduledStartAt,
      studentName
    });

    const parentMail = renderParentNewTestEmail({
      id: testId,
      title: test.title,
      totalQuestions: test.totalQuestions,
      totalTimeMinutes: test.totalTimeMinutes,
      scheduledStartAt: test.scheduledStartAt,
      studentName
    });

    // 5. Send emails via Brevo
    const [studentResult, parentResult] = await Promise.all([
      sendBrevoEmail({
        to: [{ email: studentEmail, name: studentName }],
        subject: studentMail.subject,
        htmlContent: studentMail.html,
        tags: ['bpsc-new-test-student']
      }),
      sendBrevoEmail({
        to: [{ email: parentEmail, name: 'Parent / Guardian' }],
        subject: parentMail.subject,
        htmlContent: parentMail.html,
        tags: ['bpsc-new-test-parent']
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
    console.error('[notify-new-test error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
  }
}
