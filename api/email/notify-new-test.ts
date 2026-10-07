import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_STUDENT_NAME
} from '../_lib/constants.js';
import { sendBrevoEmail } from '../_lib/brevo.js';
import {
  getPublishedTest,
  reserveNotificationAtomically,
  finalizeNotification,
  isFirebaseAdminConfigured
} from '../_lib/firestoreAdmin.js';
import {
  renderStudentNewTestEmail
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
    const studentName = test.studentName || DEFAULT_STUDENT_NAME;

    let isReserved = false;
    try {
      if (isFirebaseAdminConfigured()) {
        isReserved = await reserveNotificationAtomically(notificationId, {
          type: 'new_test',
          recipients: [studentEmail],
          testId
        });
      } else {
        isReserved = true;
      }
    } catch (dbErr: any) {
      console.warn('[notify-new-test] Reservation error:', dbErr?.message || dbErr);
      if (dbErr?.code === 6 || dbErr?.message?.includes('ALREADY_EXISTS') || dbErr?.message?.includes('already exists')) {
        isReserved = false;
      } else {
        isReserved = true;
      }
    }

    if (!isReserved) {
      return sendJson(res, 200, {
        status: 'already_sent',
        message: 'Publish email already sent for this test.'
      });
    }

    // 4. Render student template (Publish notification sends exactly ONE student email)
    const studentMail = renderStudentNewTestEmail({
      id: testId,
      title: test.title,
      subtitle: test.subtitle,
      totalQuestions: test.totalQuestions,
      totalTimeMinutes: test.totalTimeMinutes,
      scheduledStartAt: test.scheduledStartAt,
      studentName
    });

    // 5. Send single student email via Brevo with idempotency key
    const studentResult = await sendBrevoEmail({
      to: studentEmail,
      subject: studentMail.subject,
      htmlContent: studentMail.html,
      idempotencyKey: `${notificationId}_student`,
      tags: ['bpsc-new-test-student']
    });

    if (!studentResult.success) {
      await finalizeNotification(notificationId, {
        status: 'failed',
        error: studentResult.error
      }).catch(() => null);

      return sendJson(res, 502, {
        error: 'Failed to send Brevo email to student',
        details: {
          studentError: studentResult.error
        }
      });
    }

    await finalizeNotification(notificationId, {
      status: 'delivered',
      emailId: studentResult.messageId,
      brevoMessageId: studentResult.messageId
    }).catch(() => null);

    return sendJson(res, 200, {
      success: true,
      notificationId,
      provider: 'brevo',
      studentResult: {
        success: studentResult.success,
        messageId: studentResult.messageId,
        statusCode: studentResult.statusCode
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
