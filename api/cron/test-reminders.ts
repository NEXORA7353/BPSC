import type { IncomingMessage, ServerResponse } from 'http';
import { isAuthorizedCronRequest, rejectUnauthorizedCron } from '../lib/cronAuth';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME
} from '../lib/constants';
import { sendBrevoEmail } from '../lib/brevo';
import {
  getScheduledPublishedTests,
  reserveNotificationAtomically,
  finalizeNotification
} from '../lib/firestoreAdmin';
import { renderTestReminderEmail } from '../lib/emailTemplates';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
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
    const tests = await getScheduledPublishedTests(now.toISOString(), maxLookahead);

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
        const reserved = await reserveNotificationAtomically(notifId, {
          type: 'reminder_2h',
          recipients: [studentEmail, parentEmail],
          testId: test.id
        });

        if (reserved) {
          const mail = renderTestReminderEmail(test, '2h', studentName);
          const [sRes, pRes] = await Promise.all([
            sendBrevoEmail({
              to: [{ email: studentEmail, name: studentName }],
              subject: mail.subject,
              htmlContent: mail.html,
              tags: ['bpsc-reminder-2h-student']
            }),
            sendBrevoEmail({
              to: [{ email: parentEmail, name: 'Parent / Guardian' }],
              subject: mail.subject,
              htmlContent: mail.html,
              tags: ['bpsc-reminder-2h-parent']
            })
          ]);

          await finalizeNotification(notifId, {
            status: sRes.success || pRes.success ? 'delivered' : 'failed',
            brevoMessageId: sRes.messageId || pRes.messageId
          });
          results.reminders2hSent += 1;
        }
      }

      // --- Window 2: Shortly before (0 to 35 mins before) ---
      if (diffMinutes >= 0 && diffMinutes <= 35) {
        const notifId = `reminder_soon_${test.id}`;
        const reserved = await reserveNotificationAtomically(notifId, {
          type: 'reminder_soon',
          recipients: [studentEmail],
          testId: test.id
        });

        if (reserved) {
          const mail = renderTestReminderEmail(test, 'soon', studentName);
          const sRes = await sendBrevoEmail({
            to: [{ email: studentEmail, name: studentName }],
            subject: mail.subject,
            htmlContent: mail.html,
            tags: ['bpsc-reminder-soon-student']
          });

          await finalizeNotification(notifId, {
            status: sRes.success ? 'delivered' : 'failed',
            brevoMessageId: sRes.messageId
          });
          results.remindersSoonSent += 1;
        }
      }
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, timestamp: now.toISOString(), results }));
  } catch (err: any) {
    console.error('[cron/test-reminders error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
  }
}
