import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorizedCronRequest, rejectUnauthorizedCron } from '../_lib/cronAuth.js';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME,
  getAppBaseUrl,
  getIstDateString
} from '../_lib/constants.js';
import { sendPortalEmail } from '../_lib/mailer.js';
import {
  getScheduledPublishedTests,
  reserveNotificationAtomically,
  finalizeNotification,
  isFirebaseAdminConfigured
} from '../_lib/firestoreAdmin.js';
import { renderTestReminderEmail, renderMorningPracticeReminderEmail } from '../_lib/emailTemplates.js';
import { sendJson } from '../_lib/response.js';

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  const isManual = req.query?.manual === 'true' || req.headers?.['x-manual-trigger'] === 'true';
  // 1. Verify Vercel Cron authentication (allow manual admin triggers)
  if (!isManual && !isAuthorizedCronRequest(req)) {
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
            sendPortalEmail({
              to: studentEmail,
              subject: mail.subject,
              html: mail.html,
              idempotencyKey: `${notifId}_student`,
              tags: ['bpsc-reminder-2h-student']
            }),
            sendPortalEmail({
              to: parentEmail,
              subject: mail.subject,
              html: mail.html,
              idempotencyKey: `${notifId}_parent`,
              tags: ['bpsc-reminder-2h-parent']
            })
          ]);

          const mainMsgId = sRes.messageId || pRes.messageId;
          await finalizeNotification(notifId, {
            status: sRes.success || pRes.success ? 'delivered' : 'failed',
            emailId: mainMsgId,
            brevoMessageId: mainMsgId,
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
          const sRes = await sendPortalEmail({
            to: studentEmail,
            subject: mail.subject,
            html: mail.html,
            idempotencyKey: `${notifId}_student`,
            tags: ['bpsc-reminder-soon-student']
          });

          await finalizeNotification(notifId, {
            status: sRes.success ? 'delivered' : 'failed',
            emailId: sRes.messageId,
            brevoMessageId: sRes.messageId,
            error: !sRes.success ? sRes.error : undefined
          }).catch(() => null);
          results.remindersSoonSent += 1;
        }
      }
    }

    // 2. If no scheduled tests were fired, send daily morning practice reminder
    if (results.reminders2hSent === 0 && results.remindersSoonSent === 0) {
      const dateStr = getIstDateString(now);
      const notifId = `morning_reminder_${DEFAULT_STUDENT_EMAIL}_${dateStr}`;
      let reserved = false;
      try {
        if (isFirebaseAdminConfigured()) {
          reserved = await reserveNotificationAtomically(notifId, {
            type: 'reminder_2h',
            recipients: [DEFAULT_STUDENT_EMAIL, DEFAULT_PARENT_EMAIL]
          });
        } else {
          reserved = true;
        }
      } catch {
        reserved = true;
      }

      if (reserved) {
        const mail = renderMorningPracticeReminderEmail(DEFAULT_STUDENT_NAME, getAppBaseUrl(req));
        await Promise.all([
          sendPortalEmail({
            to: DEFAULT_STUDENT_EMAIL,
            subject: mail.subject,
            html: mail.html,
            idempotencyKey: `${notifId}_student`,
            tags: ['bpsc-morning-practice-student']
          }),
          sendPortalEmail({
            to: DEFAULT_PARENT_EMAIL,
            subject: mail.subject,
            html: mail.html,
            idempotencyKey: `${notifId}_parent`,
            tags: ['bpsc-morning-practice-parent']
          })
        ]).catch(() => null);

        results.remindersSoonSent += 1;
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
