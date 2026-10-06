import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME
} from '../lib/constants';
import { sendBrevoEmail } from '../lib/brevo';
import {
  getPublishedTest,
  reserveNotificationAtomically,
  finalizeNotification
} from '../lib/firestoreAdmin';
import {
  renderStudentNewTestEmail,
  renderParentNewTestEmail
} from '../lib/emailTemplates';
import { sendJson } from '../lib/response';

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

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const body = parseRequestBody(req);
    const { testId, testData } = body;

    if (!testId || typeof testId !== 'string') {
      return sendJson(res, 400, { error: 'Missing or invalid testId' });
    }

    // 1. Verify test exists in Firestore or fallback to provided testData
    let test = await getPublishedTest(testId).catch(() => null);
    if (!test && testData) {
      test = testData;
    }

    if (!test) {
      return sendJson(res, 404, { error: `Test ${testId} not found in Firestore` });
    }

    // 2. MUST be explicitly published
    if (!test.isPublished) {
      return sendJson(res, 400, { error: 'Test is not published. Draft tests do not send emails.' });
    }

    // 3. Atomically reserve notification
    const notificationId = `publish_${testId}`;
    const studentEmail = test.studentEmail || DEFAULT_STUDENT_EMAIL;
    const parentEmail = test.parentEmail || DEFAULT_PARENT_EMAIL;
    const studentName = test.studentName || DEFAULT_STUDENT_NAME;

    let isReserved = false;
    try {
      isReserved = await reserveNotificationAtomically(notificationId, {
        type: 'new_test',
        recipients: [studentEmail, parentEmail],
        testId
      });
    } catch (dbErr: any) {
      console.warn('[notify-new-test] Reservation error:', dbErr?.message || dbErr);
      // If serverless Firestore is unavailable, allow proceeding without duplicate prevention
      isReserved = true;
    }

    if (!isReserved) {
      return sendJson(res, 200, {
        status: 'already_sent',
        message: 'Publish email already sent for this test.'
      });
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
      }).catch(() => null);

      return sendJson(res, 502, {
        error: 'Failed to send Brevo emails',
        details: {
          studentError: studentResult.error,
          parentError: parentResult.error
        }
      });
    }

    await finalizeNotification(notificationId, {
      status: 'delivered',
      brevoMessageId: studentResult.messageId || parentResult.messageId
    }).catch(() => null);

    return sendJson(res, 200, {
      success: true,
      notificationId,
      studentResult: {
        success: studentResult.success,
        messageId: studentResult.messageId
      },
      parentResult: {
        success: parentResult.success,
        messageId: parentResult.messageId
      }
    });
  } catch (err: any) {
    console.error('[notify-new-test error]:', err?.message || err);
    return sendJson(res, 500, {
      error: 'Internal server error processing notification',
      message: err?.message || 'Unknown error'
    });
  }
}
