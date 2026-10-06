import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorizedCronRequest, rejectUnauthorizedCron } from '../_lib/cronAuth.js';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME,
  getIstIsoDayRange
} from '../_lib/constants.js';
import { sendAnypostEmail } from '../_lib/anypost.js';
import {
  getStudentAttemptsInRange,
  reserveNotificationAtomically,
  finalizeNotification
} from '../_lib/firestoreAdmin.js';
import {
  renderStudentDailyInactivityEmail,
  renderParentDailyInactivityEmail
} from '../_lib/emailTemplates.js';
import { sendJson } from '../_lib/response.js';

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  // 1. Verify Vercel Cron authentication
  if (!isAuthorizedCronRequest(req)) {
    rejectUnauthorizedCron(res);
    return;
  }

  try {
    const studentEmail = DEFAULT_STUDENT_EMAIL;
    const parentEmail = DEFAULT_PARENT_EMAIL;
    const studentName = DEFAULT_STUDENT_NAME;

    // 2. Compute today's IST window (00:00:00 IST to 23:59:59 IST)
    const { startIso, endIso, dateStr } = getIstIsoDayRange();

    // 3. Query student attempts today
    let attempts: any[] = [];
    try {
      attempts = await getStudentAttemptsInRange(studentEmail, startIso, endIso);
    } catch (e: any) {
      console.warn('[cron/daily-inactivity] Firestore attempts query warning:', e?.message || e);
    }

    // 4. If student has already completed a test today, DO NOT SEND
    if (attempts.length > 0) {
      return sendJson(res, 200, {
        success: true,
        date: dateStr,
        attemptsCompletedToday: attempts.length,
        action: 'skipped_active_today'
      });
    }

    // 5. Zero attempts: Reserve notification atomically for today's date
    const notificationId = `daily_inactivity_${studentEmail}_${dateStr}`;
    let reserved = false;
    try {
      reserved = await reserveNotificationAtomically(notificationId, {
        type: 'daily_inactivity',
        recipients: [studentEmail, parentEmail]
      });
    } catch {
      reserved = false;
    }

    if (!reserved) {
      return sendJson(res, 200, {
        success: true,
        date: dateStr,
        status: 'already_sent_today'
      });
    }

    // 6. Render templates
    const studentMail = renderStudentDailyInactivityEmail(studentName);
    const parentMail = renderParentDailyInactivityEmail(studentName);

    // 7. Send emails via Anypost with distinct idempotency keys
    const [sRes, pRes] = await Promise.all([
      sendAnypostEmail({
        to: studentEmail,
        subject: studentMail.subject,
        html: studentMail.html,
        idempotencyKey: `${notificationId}_student`,
        tags: ['bpsc-daily-inactivity-student']
      }),
      sendAnypostEmail({
        to: parentEmail,
        subject: parentMail.subject,
        html: parentMail.html,
        idempotencyKey: `${notificationId}_parent`,
        tags: ['bpsc-daily-inactivity-parent']
      })
    ]);

    const anypostId = sRes.emailId || pRes.emailId;
    await finalizeNotification(notificationId, {
      status: sRes.success || pRes.success ? 'accepted' : 'failed',
      emailId: anypostId,
      anypostEmailId: anypostId,
      error: !sRes.success && !pRes.success ? (sRes.error || pRes.error) : undefined
    }).catch(() => null);

    return sendJson(res, 200, {
      success: true,
      date: dateStr,
      notificationId,
      studentResult: { success: sRes.success, emailId: sRes.emailId, messageId: sRes.emailId },
      parentResult: { success: pRes.success, emailId: pRes.emailId, messageId: pRes.emailId }
    });
  } catch (err: any) {
    console.error('[cron/daily-inactivity error]:', err?.message || err);
    return sendJson(res, 500, { error: err?.message || 'Internal server error' });
  }
}
