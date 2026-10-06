import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorizedCronRequest, rejectUnauthorizedCron } from '../_lib/cronAuth.js';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME
} from '../_lib/constants.js';
import { sendAnypostEmail } from '../_lib/anypost.js';
import {
  getScheduledPublishedTests,
  reserveNotificationAtomically,
  finalizeNotification
} from '../_lib/firestoreAdmin.js';
import { renderTestReminderEmail } from '../_lib/emailTemplates.js';
import { sendJson } from '../_lib/response.js';

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  // 1. Verify Vercel Cron authentication
  if (!isAuthorizedCronRequest(req)) {
    rejectUnauthorizedCron(res);
    return;
  }

  try {
    const now = new Date();
    const nowMs = now.getTime();

    // Query tests scheduled between now and next 3.5 hours
    const maxLookahead = new Date(nowMs + 3.5 * 60 * 60 * 1000).toISOString();
    let tests: any[] = [];
    try {
      tests = await getScheduledPublishedTests(now.toISOString(), maxLookahead);
    } catch (e: any) {
      console.warn('[cron/test-reminders] Firestore query warning:', e?.message || e);
    }

    const results = {
      evaluatedCount: tests.length,
      reminders2hSent: 0,
      remindersSoonSent: 0
    };

    for (const test of tests) {
      if (!test.scheduledStartAt || !test.id) continue;
      const startMs = new Date(test.scheduledStartAt).getTime();
      const diffMinutes = Math.round((startMs - nowMs) / (60 * 1000));

      const studentEmail = test.studentEmail || DEFAULT_STUDENT_EMAIL;
      const parentEmail = test.parentEmail || DEFAULT_PARENT_EMAIL;
      const studentName = test.studentName || DEFAULT_STUDENT_NAME;

      // --- Window 1: 2 to 3 hours before (110 mins to 190 mins) ---
      if (diffMinutes >= 110 && diffMinutes <= 190) {
        const notifId = `reminder_2h_${test.id}`;
        let reserved = false;
        try {
          reserved = await reserveNotificationAtomically(notifId, {
            type: 'reminder_2h',
            recipients: [studentEmail, parentEmail],
            testId: test.id
          });
        } catch {
          reserved = false;
        }

        if (reserved) {
          const mail = renderTestReminderEmail(test, '2h', studentName);
          const [sRes, pRes] = await Promise.all([
            sendAnypostEmail({
              to: studentEmail,
              subject: mail.subject,
              html: mail.html,
              idempotencyKey: `${notifId}_student`,
              tags: ['bpsc-reminder-2h-student']
            }),
            sendAnypostEmail({
              to: parentEmail,
              subject: mail.subject,
              html: mail.html,
              idempotencyKey: `${notifId}_parent`,
              tags: ['bpsc-reminder-2h-parent']
            })
          ]);

          const anypostId = sRes.emailId || pRes.emailId;
          await finalizeNotification(notifId, {
            status: sRes.success || pRes.success ? 'accepted' : 'failed',
            emailId: anypostId,
            anypostEmailId: anypostId,
            error: !sRes.success && !pRes.success ? (sRes.error || pRes.error) : undefined
          }).catch(() => null);
          results.reminders2hSent += 1;
        }
      }

      // --- Window 2: Shortly before (0 to 35 mins before) ---
      if (diffMinutes >= 0 && diffMinutes <= 35) {
        const notifId = `reminder_soon_${test.id}`;
        let reserved = false;
        try {
          reserved = await reserveNotificationAtomically(notifId, {
            type: 'reminder_soon',
            recipients: [studentEmail],
            testId: test.id
          });
        } catch {
          reserved = false;
        }

        if (reserved) {
          const mail = renderTestReminderEmail(test, 'soon', studentName);
          const sRes = await sendAnypostEmail({
            to: studentEmail,
            subject: mail.subject,
            html: mail.html,
            idempotencyKey: `${notifId}_student`,
            tags: ['bpsc-reminder-soon-student']
          });

          await finalizeNotification(notifId, {
            status: sRes.success ? 'accepted' : 'failed',
            emailId: sRes.emailId,
            anypostEmailId: sRes.emailId,
            error: !sRes.success ? sRes.error : undefined
          }).catch(() => null);
          results.remindersSoonSent += 1;
        }
      }
    }

    return sendJson(res, 200, {
      success: true,
      timestamp: now.toISOString(),
      results
    });
  } catch (err: any) {
    console.error('[cron/test-reminders error]:', err?.message || err);
    return sendJson(res, 500, { error: err?.message || 'Internal server error' });
  }
}
