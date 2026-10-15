import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorizedCronRequest, rejectUnauthorizedCron } from '../_lib/cronAuth.js';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME,
  getIstIsoDayRange,
  getAppBaseUrl
} from '../_lib/constants.js';
import { sendPortalEmail } from '../_lib/mailer.js';
import {
  getStudentAttemptsInRange,
  reserveNotificationAtomically,
  finalizeNotification,
  isFirebaseAdminConfigured
} from '../_lib/firestoreAdmin.js';
import {
  renderStudentDailyInactivityEmail,
  renderParentDailyInactivityEmail
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
  const isPost = req.method === 'POST';
  const body = parseRequestBody(req);
  const isManualTrigger = req.query?.manual === 'true' || body?.manual === true || req.headers?.['x-manual-trigger'] === 'true';

  // 1. Verify Vercel Cron authentication (allow manual portal trigger for admin/testing)
  if (!isManualTrigger && !isAuthorizedCronRequest(req)) {
    rejectUnauthorizedCron(res);
    return;
  }

  try {
    const studentEmail = body?.studentEmail || DEFAULT_STUDENT_EMAIL;
    const parentEmail = body?.parentEmail || DEFAULT_PARENT_EMAIL;
    const studentName = body?.studentName || DEFAULT_STUDENT_NAME;
    const baseUrl = getAppBaseUrl(req, body?.appBaseUrl);
    const forceSend = body?.forceSend === true || req.query?.force === 'true';

    // 2. Compute today's IST window (00:00:00 IST to 23:59:59 IST)
    const { startIso, endIso, dateStr } = getIstIsoDayRange();

    // 3. Query student attempts today
    let attempts: any[] = [];
    try {
      if (isFirebaseAdminConfigured()) {
        attempts = await getStudentAttemptsInRange(studentEmail, startIso, endIso);
      }
    } catch (e: any) {
      console.warn('[cron/daily-inactivity] Firestore attempts query warning:', e?.message || e);
    }

    // 4. If student has already completed a test today, skip unless forced
    if (attempts.length > 0 && !forceSend) {
      return sendJson(res, 200, {
        success: true,
        date: dateStr,
        attemptsCompletedToday: attempts.length,
        action: 'skipped_active_today',
        message: `${studentName} has already attempted ${attempts.length} mock test(s) today. Inactivity alert not required.`
      });
    }

    // 5. Zero attempts: Reserve notification atomically for today's date
    const notificationId = `daily_inactivity_${studentEmail}_${dateStr}${forceSend ? `_${Date.now()}` : ''}`;
    let reserved = false;
    try {
      if (isFirebaseAdminConfigured() && !forceSend) {
        reserved = await reserveNotificationAtomically(notificationId, {
          type: 'daily_inactivity',
          recipients: [studentEmail, parentEmail]
        });
      } else {
        reserved = true;
      }
    } catch {
      reserved = forceSend;
    }

    if (!reserved && !forceSend) {
      return sendJson(res, 200, {
        success: true,
        date: dateStr,
        status: 'already_sent_today',
        message: 'Daily inactivity alert has already been sent to student and parent today.'
      });
    }

    // 6. Render templates (zero emojis, direct links)
    const studentMail = renderStudentDailyInactivityEmail(studentName, baseUrl);
    const parentMail = renderParentDailyInactivityEmail(studentName, baseUrl);

    // 7. Send emails via unified mailer
    const [sRes, pRes] = await Promise.all([
      sendPortalEmail({
        to: studentEmail,
        subject: studentMail.subject,
        html: studentMail.html,
        idempotencyKey: `${notificationId}_student`,
        tags: ['bpsc-daily-inactivity-student']
      }),
      sendPortalEmail({
        to: parentEmail,
        subject: parentMail.subject,
        html: parentMail.html,
        idempotencyKey: `${notificationId}_parent`,
        tags: ['bpsc-daily-inactivity-parent']
      })
    ]);

    const mainMessageId = sRes.messageId || pRes.messageId;
    await finalizeNotification(notificationId, {
      status: sRes.success || pRes.success ? 'delivered' : 'failed',
      emailId: mainMessageId,
      brevoMessageId: mainMessageId,
      error: !sRes.success && !pRes.success ? (sRes.error || pRes.error) : undefined
    }).catch(() => null);

    return sendJson(res, 200, {
      success: sRes.success || pRes.success,
      date: dateStr,
      notificationId,
      portalUrl: studentMail.portalUrl,
      studentResult: {
        success: sRes.success,
        messageId: sRes.messageId,
        provider: sRes.provider
      },
      parentResult: {
        success: pRes.success,
        messageId: pRes.messageId,
        provider: pRes.provider
      }
    });
  } catch (err: any) {
    console.error('[cron/daily-inactivity error]:', err?.message || err);
    return sendJson(res, 500, { error: err?.message || 'Internal server error' });
  }
}
