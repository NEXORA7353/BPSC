import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME,
  getAppBaseUrl
} from '../_lib/constants.js';
import { sendPortalEmail } from '../_lib/mailer.js';
import {
  getPublishedTest,
  reserveNotificationAtomically,
  finalizeNotification,
  isFirebaseAdminConfigured
} from '../_lib/firestoreAdmin.js';
import {
  renderStudentNewTestEmail,
  renderParentNewTestEmail
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
    const { testId, testData, appBaseUrl, sendToParent = true, force = false } = body;

    if (!testId || typeof testId !== 'string') {
      return sendJson(res, 400, { error: 'Missing or invalid testId' });
    }

    // 1. Resolve canonical base URL avoiding unwanted vercel redirects
    const baseUrl = getAppBaseUrl(req, appBaseUrl);

    // 2. Verify test exists in Firestore or fallback to provided testData
    let test = await getPublishedTest(testId).catch(() => null);
    if (!test && testData) {
      test = testData;
    }

    if (!test) {
      return sendJson(res, 404, { error: `Test ${testId} not found in Firestore` });
    }

    // 3. MUST be explicitly published
    if (!test.isPublished) {
      return sendJson(res, 400, { error: 'Test is not published. Draft tests do not send emails.' });
    }

    // 4. Atomically reserve notification (or use timestamped ID if force is true)
    const notificationId = force ? `publish_${testId}_${Date.now()}` : `publish_${testId}`;
    const studentEmail = test.studentEmail || DEFAULT_STUDENT_EMAIL;
    const parentEmail = test.parentEmail || DEFAULT_PARENT_EMAIL;
    const studentName = test.studentName || DEFAULT_STUDENT_NAME;

    let isReserved = false;
    if (force) {
      isReserved = true;
    } else {
      try {
        if (isFirebaseAdminConfigured()) {
          isReserved = await reserveNotificationAtomically(notificationId, {
            type: 'new_test',
            recipients: sendToParent ? [studentEmail, parentEmail] : [studentEmail],
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
    }

    if (!isReserved) {
      return sendJson(res, 200, {
        success: true,
        alreadySent: true,
        status: 'already_sent',
        message: 'इस टेस्ट का नोटिफिकेशन ईमेल पहले ही भेजा जा चुका है। पुनः भेजने के लिए "पुनः भेजें (Force Resend)" चुनें।'
      });
    }

    // 5. Render email templates with direct URL
    const studentMail = renderStudentNewTestEmail({
      id: testId,
      title: test.title,
      subtitle: test.subtitle,
      totalQuestions: test.totalQuestions,
      totalTimeMinutes: test.totalTimeMinutes,
      scheduledStartAt: test.scheduledStartAt,
      studentName,
      baseUrl
    });

    const parentMail = renderParentNewTestEmail({
      id: testId,
      title: test.title,
      totalQuestions: test.totalQuestions,
      totalTimeMinutes: test.totalTimeMinutes,
      scheduledStartAt: test.scheduledStartAt,
      studentName,
      baseUrl
    });

    // 6. Send emails to both Student and Parent
    const sendPromises: [Promise<any>, Promise<any>?] = [
      sendPortalEmail({
        to: studentEmail,
        subject: studentMail.subject,
        html: studentMail.html,
        idempotencyKey: `${notificationId}_student`,
        tags: ['bpsc-new-test-student']
      })
    ];

    if (sendToParent && parentEmail && parentEmail !== studentEmail) {
      sendPromises.push(
        sendPortalEmail({
          to: parentEmail,
          subject: parentMail.subject,
          html: parentMail.html,
          idempotencyKey: `${notificationId}_parent`,
          tags: ['bpsc-new-test-parent']
        })
      );
    }

    const [studentResult, parentResult] = await Promise.all(sendPromises);

    if (!studentResult.success && (!parentResult || !parentResult.success)) {
      await finalizeNotification(notificationId, {
        status: 'failed',
        error: studentResult.error || parentResult?.error
      }).catch(() => null);

      return sendJson(res, 502, {
        error: 'Failed to dispatch email notifications',
        details: {
          studentError: studentResult.error,
          parentError: parentResult?.error
        }
      });
    }

    const mainMessageId = studentResult.messageId || parentResult?.messageId;
    await finalizeNotification(notificationId, {
      status: 'delivered',
      emailId: mainMessageId,
      brevoMessageId: mainMessageId
    }).catch(() => null);

    return sendJson(res, 200, {
      success: true,
      notificationId,
      provider: studentResult.provider || parentResult?.provider,
      testUrl: studentMail.testUrl,
      studentResult: {
        success: studentResult.success,
        messageId: studentResult.messageId,
        provider: studentResult.provider
      },
      parentResult: parentResult
        ? {
            success: parentResult.success,
            messageId: parentResult.messageId,
            provider: parentResult.provider
          }
        : null
    });
  } catch (err: any) {
    console.error('[notify-new-test error]:', err?.message || err);
    return sendJson(res, 500, {
      error: 'Internal server error processing notification',
      message: err?.message || 'Unknown error'
    });
  }
}
