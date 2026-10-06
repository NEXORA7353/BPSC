import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorizedCronRequest, rejectUnauthorizedCron } from '../_lib/cronAuth.js';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL,
  DEFAULT_STUDENT_NAME,
  getIstYearWeek,
  TopicPerformanceStat
} from '../_lib/constants.js';
import { sendBrevoEmail } from '../_lib/brevo.js';
import {
  getStudentAttemptsInRange,
  reserveNotificationAtomically,
  finalizeNotification
} from '../_lib/firestoreAdmin.js';
import {
  renderStudentWeeklyReportEmail,
  renderParentWeeklyReportEmail
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

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekKey = getIstYearWeek(now);
    const notificationId = `weekly_${studentEmail}_${weekKey}`;

    // 2. Query attempts in past 7 days
    let attempts: any[] = [];
    try {
      attempts = await getStudentAttemptsInRange(
        studentEmail,
        sevenDaysAgo.toISOString(),
        now.toISOString()
      );
    } catch (e: any) {
      console.warn('[cron/weekly-report] Attempts query warning:', e?.message || e);
    }

    // If zero attempts in past 7 days, don't generate empty weekly analysis
    if (attempts.length === 0) {
      return sendJson(res, 200, {
        success: true,
        week: weekKey,
        message: 'No attempts in past 7 days. Weekly report skipped.'
      });
    }

    // 3. Atomically reserve notification
    let reserved = false;
    try {
      reserved = await reserveNotificationAtomically(notificationId, {
        type: 'weekly_report',
        recipients: [studentEmail, parentEmail]
      });
    } catch {
      reserved = false;
    }

    if (!reserved) {
      return sendJson(res, 200, {
        success: true,
        week: weekKey,
        status: 'already_sent_this_week'
      });
    }

    // 4. Aggregate metrics across all attempts in past 7 days
    let totalQuestions = 0;
    let accuracySum = 0;
    let scorePctSum = 0;
    const aggregatedTopics: Record<string, TopicPerformanceStat> = {};

    for (const a of attempts) {
      const qCount = Number(a.totalQuestions) || 0;
      totalQuestions += qCount;
      accuracySum += Number(a.accuracy) || 0;
      const tMarks = Number(a.totalMarks) || 1;
      const score = Number(a.score) || 0;
      scorePctSum += Math.round((score / tMarks) * 100);

      if (a.topicBreakdown && typeof a.topicBreakdown === 'object') {
        for (const [key, stat] of Object.entries(a.topicBreakdown as Record<string, TopicPerformanceStat>)) {
          if (!aggregatedTopics[key]) {
            aggregatedTopics[key] = {
              topicKey: stat.topicKey || key,
              topicLabel: stat.topicLabel || key,
              topicLabelHindi: stat.topicLabelHindi,
              total: 0,
              correct: 0,
              incorrect: 0,
              skipped: 0,
              accuracy: 0
            };
          }
          aggregatedTopics[key].total += Number(stat.total) || 0;
          aggregatedTopics[key].correct += Number(stat.correct) || 0;
          aggregatedTopics[key].incorrect += Number(stat.incorrect) || 0;
          aggregatedTopics[key].skipped += Number(stat.skipped) || 0;
        }
      }
    }

    // Calculate aggregated topic accuracies
    for (const key of Object.keys(aggregatedTopics)) {
      const stat = aggregatedTopics[key];
      const attempted = stat.correct + stat.incorrect;
      stat.accuracy = attempted > 0 ? Math.round((stat.correct / attempted) * 100) : 0;
    }

    const topicList = Object.values(aggregatedTopics);
    // Strong topics: Accuracy >= 70% with at least 2 questions
    const strongTopics = topicList
      .filter((t) => t.accuracy >= 70 && t.total >= 2)
      .sort((a, b) => b.accuracy - a.accuracy);

    // Weak topics: Accuracy < 55% or highest mistakes
    const weakTopics = topicList
      .filter((t) => t.accuracy < 55 && t.total >= 2)
      .sort((a, b) => a.accuracy - b.accuracy);

    const statsSummary = {
      totalAttempts: attempts.length,
      totalQuestions,
      averageAccuracy: Math.round(accuracySum / attempts.length),
      averageScorePercentage: Math.round(scorePctSum / attempts.length),
      strongTopics,
      weakTopics,
      studentName
    };

    // 5. Render templates
    const studentMail = renderStudentWeeklyReportEmail(statsSummary);
    const parentMail = renderParentWeeklyReportEmail(statsSummary);

    // 6. Send emails via Brevo
    const [sRes, pRes] = await Promise.all([
      sendBrevoEmail({
        to: [{ email: studentEmail, name: studentName }],
        subject: studentMail.subject,
        htmlContent: studentMail.html,
        tags: ['bpsc-weekly-student']
      }),
      sendBrevoEmail({
        to: [{ email: parentEmail, name: 'Parent / Guardian' }],
        subject: parentMail.subject,
        htmlContent: parentMail.html,
        tags: ['bpsc-weekly-parent']
      })
    ]);

    await finalizeNotification(notificationId, {
      status: sRes.success || pRes.success ? 'delivered' : 'failed',
      brevoMessageId: sRes.messageId || pRes.messageId
    }).catch(() => null);

    return sendJson(res, 200, {
      success: true,
      week: weekKey,
      notificationId,
      studentResult: { success: sRes.success, messageId: sRes.messageId },
      parentResult: { success: pRes.success, messageId: pRes.messageId }
    });
  } catch (err: any) {
    console.error('[cron/weekly-report error]:', err?.message || err);
    return sendJson(res, 500, { error: err?.message || 'Internal server error' });
  }
}
