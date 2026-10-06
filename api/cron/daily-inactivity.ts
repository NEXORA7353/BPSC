import type { IncomingMessage, ServerResponse } from 'http';
import { isAuthorizedCronRequest, rejectUnauthorizedCron } from '../lib/cronAuth';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME,
  getIstIsoDayRange
} from '../lib/constants';
import { sendBrevoEmail } from '../lib/brevo';
import {
  getStudentAttemptsInRange,
  reserveNotificationAtomically,
  finalizeNotification
} from '../lib/firestoreAdmin';
import {
  renderStudentDailyInactivityEmail,
  renderParentDailyInactivityEmail
} from '../lib/emailTemplates';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
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
    const attempts = await getStudentAttemptsInRange(studentEmail, startIso, endIso);

    // 4. If student has already completed a test today, DO NOT SEND
    if (attempts.length > 0) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: true,
          date: dateStr,
          attemptsCompletedToday: attempts.length,
          action: 'skipped_active_today'
        })
      );
      return;
    }

    // 5. Zero attempts: Reserve notification atomically for today's date
    const notificationId = `daily_inactivity_${studentEmail}_${dateStr}`;
    const reserved = await reserveNotificationAtomically(notificationId, {
      type: 'daily_inactivity',
      recipients: [studentEmail, parentEmail]
    });

    if (!reserved) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: true,
          date: dateStr,
          status: 'already_sent_today'
        })
      );
      return;
    }

    // 6. Render templates
    const studentMail = renderStudentDailyInactivityEmail(studentName);
    const parentMail = renderParentDailyInactivityEmail(studentName);

    // 7. Send emails via Brevo
    const [sRes, pRes] = await Promise.all([
      sendBrevoEmail({
        to: [{ email: studentEmail, name: studentName }],
        subject: studentMail.subject,
        htmlContent: studentMail.html,
        tags: ['bpsc-daily-inactivity-student']
      }),
      sendBrevoEmail({
        to: [{ email: parentEmail, name: 'Parent / Guardian' }],
        subject: parentMail.subject,
        htmlContent: parentMail.html,
        tags: ['bpsc-daily-inactivity-parent']
      })
    ]);

    await finalizeNotification(notificationId, {
      status: sRes.success || pRes.success ? 'delivered' : 'failed',
      brevoMessageId: sRes.messageId || pRes.messageId
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        date: dateStr,
        notificationId,
        studentResult: sRes,
        parentResult: pRes
      })
    );
  } catch (err: any) {
    console.error('[cron/daily-inactivity error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
  }
}
