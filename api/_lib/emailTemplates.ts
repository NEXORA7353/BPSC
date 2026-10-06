import { getAppBaseUrl, TopicPerformanceStat } from './constants.js';

const PORTAL_NAME = 'BPSC TRE 4.0 Mathematics Portal';
const PRIMARY_COLOR = '#d97706'; // Amber-600
const DARK_BG = '#0f172a'; // Slate-900

function baseEmailWrapper(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 600px; margin: 24px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #f59e0b; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0 0; color: #fbbf24; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 24px; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .btn { display: inline-block; background-color: #f59e0b; color: #0f172a !important; font-weight: 800; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; text-align: center; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3); }
    .btn-secondary { background-color: #0f172a; color: #ffffff !important; box-shadow: none; }
    .stat-box { display: inline-block; width: 45%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin: 1%; text-align: center; vertical-align: top; box-sizing: border-box; }
    .stat-val { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
    .stat-lbl { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin: 4px 0 0 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .badge-success { background-color: #dcfce7; color: #15803d; }
    .badge-warning { background-color: #fef3c7; color: #b45309; }
    .badge-danger { background-color: #fee2e2; color: #b91c1c; }
    .footer { background-color: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${PORTAL_NAME}</h1>
      <p>Target: BPSC TRE 4.0 Teacher Examination</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px 0; font-weight: 700; color: #475569;">BPSC TRE 4.0 Mathematics Real Exam Simulator</p>
      <p style="margin: 0;">Automated email from <span style="font-family: monospace;">noreply@bpsc.dpdns.org</span> · Do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// 1. NEW TEST AVAILABLE
// -------------------------------------------------------------
export function renderStudentNewTestEmail(test: {
  id: string;
  title: string;
  subtitle?: string;
  totalQuestions: number;
  totalTimeMinutes: number;
  scheduledStartAt?: string | null;
  studentName?: string;
}): { subject: string; html: string } {
  const baseUrl = getAppBaseUrl();
  const testUrl = `${baseUrl}/?testId=${encodeURIComponent(test.id)}`;
  const candidateName = test.studentName || 'Priya Patel';

  const scheduledText = test.scheduledStartAt
    ? `<div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin: 16px 0; font-size: 14px; color: #92400e;">
        <strong>⏰ Scheduled Time:</strong> ${new Date(test.scheduledStartAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)
       </div>`
    : `<div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; margin: 16px 0; font-size: 14px; color: #065f46;">
        <strong>⚡ Status:</strong> Available Now for immediate attempt.
       </div>`;

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">New Mock Test Published!</h2>
    <p style="font-size: 15px; color: #475569; margin: 0 0 16px 0;">Dear <strong>${candidateName}</strong>, a new mathematics examination has been published for your practice.</p>

    <div class="card">
      <h3 style="margin: 0 0 6px 0; font-size: 18px; color: #0f172a;">${test.title}</h3>
      <p style="margin: 0 0 14px 0; font-size: 13px; color: #64748b;">${test.subtitle || 'BPSC TRE 4.0 Targeted Mathematics Mock'}</p>
      
      <div style="margin: 12px 0;">
        <span class="badge badge-warning" style="margin-right: 6px;">📝 ${test.totalQuestions} Questions</span>
        <span class="badge badge-warning">⏱️ ${test.totalTimeMinutes} Minutes</span>
      </div>

      ${scheduledText}

      <div style="margin-top: 14px; font-size: 13px; color: #475569; line-height: 1.5;">
        • <strong>Negative Marking:</strong> 0.33 mark penalty for wrong options.<br>
        • <strong>Option (E) Safe Skip:</strong> Attempt (E) for untackled questions to safely avoid blank penalties.
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${testUrl}" class="btn">🚀 Start CBT Test Now</a>
    </div>
  `;

  return {
    subject: `[New Mock Test] ${test.title} is now available`,
    html: baseEmailWrapper('New Mock Test Available', content)
  };
}

export function renderParentNewTestEmail(test: {
  id: string;
  title: string;
  totalQuestions: number;
  totalTimeMinutes: number;
  scheduledStartAt?: string | null;
  studentName?: string;
}): { subject: string; html: string } {
  const candidateName = test.studentName || 'Priya Patel';
  const scheduledInfo = test.scheduledStartAt
    ? `scheduled for <strong>${new Date(test.scheduledStartAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</strong>`
    : `available for practice today`;

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a;">New Practice Test Alert for ${candidateName}</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      A new full-length mathematics mock test has been added to the portal:
    </p>

    <div class="card" style="border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #0f172a;">${test.title}</h3>
      <p style="margin: 0; font-size: 13px; color: #475569;">
        • Total Questions: <strong>${test.totalQuestions}</strong><br>
        • Duration: <strong>${test.totalTimeMinutes} Minutes</strong><br>
        • Timing: ${scheduledInfo}
      </p>
    </div>

    <p style="font-size: 13px; color: #64748b; margin: 16px 0 0 0;">
      Please ensure ${candidateName} completes this mock test in a distraction-free environment to simulate actual exam pressure.
    </p>
  `;

  return {
    subject: `[Study Update] New test published for ${candidateName}: ${test.title}`,
    html: baseEmailWrapper('New Test Notification', content)
  };
}

// -------------------------------------------------------------
// 2. TEST COMPLETED / RESULT SCORECARD
// -------------------------------------------------------------
export function renderStudentResultEmail(attempt: {
  testId: string;
  testTitle: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  safeSkipCount?: number;
  blankPenaltyCount?: number;
  totalTimeSpentSeconds?: number;
  topicBreakdown?: Record<string, TopicPerformanceStat>;
  studentName?: string;
}): { subject: string; html: string } {
  const baseUrl = getAppBaseUrl();
  const reviewUrl = `${baseUrl}/?reviewTestId=${encodeURIComponent(attempt.testId)}`;
  const candidateName = attempt.studentName || 'Priya Patel';

  const timeMin = attempt.totalTimeSpentSeconds
    ? Math.round(attempt.totalTimeSpentSeconds / 60)
    : 0;

  let topicRows = '';
  if (attempt.topicBreakdown && Object.keys(attempt.topicBreakdown).length > 0) {
    topicRows = Object.values(attempt.topicBreakdown)
      .map((t) => {
        const badgeClass = t.accuracy >= 70 ? 'badge-success' : t.accuracy >= 45 ? 'badge-warning' : 'badge-danger';
        return `
          <tr style="border-bottom: 1px solid #f1f5f9; font-size: 13px;">
            <td style="padding: 10px 8px; font-weight: 600; color: #0f172a;">${t.topicLabel}</td>
            <td style="padding: 10px 8px; text-align: center;">${t.total}</td>
            <td style="padding: 10px 8px; text-align: center; color: #16a34a; font-weight: 700;">${t.correct}</td>
            <td style="padding: 10px 8px; text-align: center; color: #dc2626; font-weight: 700;">${t.incorrect}</td>
            <td style="padding: 10px 8px; text-align: right;"><span class="badge ${badgeClass}">${t.accuracy}%</span></td>
          </tr>
        `;
      })
      .join('');
  }

  const content = `
    <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #0f172a;">Your Exam Scorecard</h2>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">Candidate: <strong>${candidateName}</strong> · Test: <em>${attempt.testTitle}</em></p>

    <!-- Stat boxes -->
    <div style="margin-bottom: 24px;">
      <div class="stat-box">
        <p class="stat-val" style="color: #d97706;">${attempt.score.toFixed(2)}</p>
        <p class="stat-lbl">Final Marks / ${attempt.totalMarks}</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: ${attempt.accuracy >= 70 ? '#16a34a' : '#d97706'};">${attempt.accuracy}%</p>
        <p class="stat-lbl">Accuracy</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: #16a34a;">${attempt.correctCount}</p>
        <p class="stat-lbl">Correct Answers</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: #dc2626;">${attempt.incorrectCount}</p>
        <p class="stat-lbl">Incorrect (-0.33 each)</p>
      </div>
    </div>

    <div class="card" style="margin: 20px 0; font-size: 13px;">
      <strong>Exam Telemetry:</strong> Total Questions: <strong>${attempt.totalQuestions}</strong> · Time Taken: <strong>${timeMin} mins</strong> · Safe Option (E) Skips: <strong>${attempt.safeSkipCount || 0}</strong>
    </div>

    ${
      topicRows
        ? `
      <h3 style="font-size: 15px; margin: 24px 0 12px 0; color: #0f172a;">Topic-wise Performance Breakdown</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f1f5f9; font-size: 11px; text-transform: uppercase; color: #64748b;">
            <th style="padding: 8px; text-align: left;">Chapter</th>
            <th style="padding: 8px; text-align: center;">Total</th>
            <th style="padding: 8px; text-align: center;">Correct</th>
            <th style="padding: 8px; text-align: center;">Wrong</th>
            <th style="padding: 8px; text-align: right;">Accuracy</th>
          </tr>
        </thead>
        <tbody>
          ${topicRows}
        </tbody>
      </table>
      `
        : ''
    }

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${reviewUrl}" class="btn">🔍 Review Question Explanations</a>
    </div>
  `;

  return {
    subject: `[Scorecard] ${attempt.testTitle} — Score: ${attempt.score.toFixed(2)}/${attempt.totalMarks} (${attempt.accuracy}%)`,
    html: baseEmailWrapper('Mock Test Result', content)
  };
}

export function renderParentResultEmail(attempt: {
  testTitle: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  studentName?: string;
}): { subject: string; html: string } {
  const candidateName = attempt.studentName || 'Priya Patel';
  const percentage = Math.round((attempt.score / attempt.totalMarks) * 100);

  let statusRemark = 'Satisfactory performance. Continue regular practice.';
  if (attempt.accuracy >= 80) {
    statusRemark = '🌟 Outstanding accuracy! Priya is mastering this syllabus.';
  } else if (attempt.accuracy >= 65) {
    statusRemark = '👍 Good performance. With dedicated error revision, this will improve further.';
  } else {
    statusRemark = '⚠️ Needs revision on missed questions. Targeted chapter practice is recommended.';
  }

  const content = `
    <h2 style="margin: 0 0 6px 0; font-size: 18px; color: #0f172a;">Test Result Summary for ${candidateName}</h2>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">${candidateName} has just completed a mock test: <strong>${attempt.testTitle}</strong>.</p>

    <div class="card" style="border-left: 4px solid #10b981; padding: 18px;">
      <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
        ${attempt.score.toFixed(2)} / ${attempt.totalMarks} Marks <span style="font-size: 14px; color: #64748b; font-weight: 500;">(${percentage}%)</span>
      </div>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569;">
        Accuracy: <strong>${attempt.accuracy}%</strong> · Correct: <strong>${attempt.correctCount}</strong> · Incorrect: <strong>${attempt.incorrectCount}</strong>
      </p>
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #1e293b;">
        <strong>Evaluation:</strong> ${statusRemark}
      </div>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
      Encourage ${candidateName} to review the step-by-step explanations for all incorrect answers on the portal to avoid repeating similar mistakes.
    </p>
  `;

  return {
    subject: `[Result Summary] ${candidateName} scored ${attempt.score.toFixed(2)}/${attempt.totalMarks} in ${attempt.testTitle}`,
    html: baseEmailWrapper('Result Summary for Parent', content)
  };
}

// -------------------------------------------------------------
// 3. DAILY INACTIVITY REMINDER (8 PM IST)
// -------------------------------------------------------------
export function renderStudentDailyInactivityEmail(studentName?: string): { subject: string; html: string } {
  const baseUrl = getAppBaseUrl();
  const candidateName = studentName || 'Priya Patel';

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">Keep Your Preparation Streak Alive! 🔥</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
      Dear <strong>${candidateName}</strong>, we noticed that you have not attempted any BPSC TRE 4.0 mathematics mock test today yet.
    </p>

    <div class="card" style="background-color: #fffbeb; border: 1px solid #fde68a;">
      <h3 style="margin: 0 0 6px 0; font-size: 15px; color: #92400e;">💡 Why Daily Practice Matters:</h3>
      <p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.5;">
        Consistent 15-minute daily drill improves question-solving speed and reduces calculation errors on exam day. Don't let today slip without solving at least 10–15 questions.
      </p>
    </div>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${baseUrl}" class="btn">⚡ Take a Quick 15-Min Mock Test</a>
    </div>
  `;

  return {
    subject: `[Daily Practice Reminder] Don't break your BPSC streak today, ${candidateName}!`,
    html: baseEmailWrapper('Daily Practice Reminder', content)
  };
}

export function renderParentDailyInactivityEmail(studentName?: string): { subject: string; html: string } {
  const candidateName = studentName || 'Priya Patel';

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a;">Daily Study Update: No Test Recorded Today</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      This is a quick status update regarding <strong>${candidateName}</strong>'s BPSC TRE 4.0 preparation for today.
    </p>

    <div class="card" style="border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
        • As of 8:00 PM IST today, no mock test attempt was registered.<br>
        • Regular daily practice is vital for building speed and high accuracy in Mathematics.
      </p>
    </div>

    <p style="font-size: 13px; color: #64748b;">
      A gentle encouragement to solve a short 15-minute drill tonight will help maintain preparation momentum.
    </p>
  `;

  return {
    subject: `[Daily Update] ${candidateName} has not attempted a mock test today`,
    html: baseEmailWrapper('Daily Status Update', content)
  };
}

// -------------------------------------------------------------
// 4. WEEKLY PERFORMANCE REPORT (Sunday 8 PM IST)
// -------------------------------------------------------------
export function renderStudentWeeklyReportEmail(stats: {
  totalAttempts: number;
  totalQuestions: number;
  averageAccuracy: number;
  averageScorePercentage: number;
  strongTopics: TopicPerformanceStat[];
  weakTopics: TopicPerformanceStat[];
  studentName?: string;
}): { subject: string; html: string } {
  const baseUrl = getAppBaseUrl();
  const candidateName = stats.studentName || 'Priya Patel';

  let strongList = stats.strongTopics.length
    ? stats.strongTopics
        .map((t) => `<li><strong>${t.topicLabel}:</strong> ${t.accuracy}% accuracy (${t.correct}/${t.total} correct)</li>`)
        .join('')
    : '<li>Keep practicing all chapters to build strong areas!</li>';

  let weakList = stats.weakTopics.length
    ? stats.weakTopics
        .map((t) => `<li><strong>${t.topicLabel}:</strong> ${t.accuracy}% accuracy (${t.incorrect} mistakes)</li>`)
        .join('')
    : '<li>No severe weak spots detected this week. Excellent balance!</li>';

  const content = `
    <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #0f172a;">Your Weekly Performance Analysis 📊</h2>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">Summary of all mock tests completed in the past 7 days for <strong>${candidateName}</strong>.</p>

    <div>
      <div class="stat-box">
        <p class="stat-val" style="color: #0f172a;">${stats.totalAttempts}</p>
        <p class="stat-lbl">Tests Attempted</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: #0f172a;">${stats.totalQuestions}</p>
        <p class="stat-lbl">Questions Solved</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: #16a34a;">${stats.averageAccuracy}%</p>
        <p class="stat-lbl">Avg Accuracy</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: #d97706;">${stats.averageScorePercentage}%</p>
        <p class="stat-lbl">Avg Score</p>
      </div>
    </div>

    <!-- Strong areas -->
    <div class="card" style="border-left: 4px solid #16a34a; margin-top: 24px;">
      <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #15803d;">🏆 Strong Areas (Mastered Topics):</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e293b; line-height: 1.6;">
        ${strongList}
      </ul>
    </div>

    <!-- Weak areas -->
    <div class="card" style="border-left: 4px solid #dc2626;">
      <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #b91c1c;">🎯 Focus Areas for Next Week:</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e293b; line-height: 1.6;">
        ${weakList}
      </ul>
    </div>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${baseUrl}" class="btn">🚀 Start New Weekly Drill</a>
    </div>
  `;

  return {
    subject: `[Weekly Report] Performance Digest for ${candidateName} — Accuracy: ${stats.averageAccuracy}%`,
    html: baseEmailWrapper('Weekly Performance Report', content)
  };
}

export function renderParentWeeklyReportEmail(stats: {
  totalAttempts: number;
  totalQuestions: number;
  averageAccuracy: number;
  averageScorePercentage: number;
  strongTopics: TopicPerformanceStat[];
  weakTopics: TopicPerformanceStat[];
  studentName?: string;
}): { subject: string; html: string } {
  const candidateName = stats.studentName || 'Priya Patel';

  const strongSummary = stats.strongTopics.map((t) => t.topicLabel).slice(0, 3).join(', ') || 'General Mathematics';
  const weakSummary = stats.weakTopics.map((t) => t.topicLabel).slice(0, 3).join(', ') || 'None';

  const content = `
    <h2 style="margin: 0 0 6px 0; font-size: 18px; color: #0f172a;">Weekly Progress Summary for ${candidateName}</h2>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">Weekly overview of preparation progress for BPSC TRE 4.0.</p>

    <div class="card" style="border-left: 4px solid #3b82f6; padding: 18px;">
      <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Weekly Snapshot:</div>
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569; line-height: 1.5;">
        • Total Tests Solved: <strong>${stats.totalAttempts}</strong><br>
        • Total Questions Practiced: <strong>${stats.totalQuestions}</strong><br>
        • Overall Accuracy: <strong>${stats.averageAccuracy}%</strong><br>
        • Average Score: <strong>${stats.averageScorePercentage}%</strong>
      </p>
      <div style="margin-top: 12px; font-size: 13px; color: #1e293b; background-color: #f1f5f9; padding: 10px; border-radius: 8px;">
        <strong>Key Strengths:</strong> ${strongSummary}<br>
        <strong>Chapters Needing Revision:</strong> ${weakSummary}
      </div>
    </div>
  `;

  return {
    subject: `[Weekly Digest] ${candidateName}'s BPSC TRE 4.0 Preparation Summary`,
    html: baseEmailWrapper('Weekly Progress Summary', content)
  };
}

// -------------------------------------------------------------
// 5. SCHEDULED TEST REMINDERS
// -------------------------------------------------------------
export function renderTestReminderEmail(
  test: { id: string; title: string; scheduledStartAt: string; totalQuestions: number; totalTimeMinutes: number },
  type: '2h' | 'soon',
  studentName?: string
): { subject: string; html: string } {
  const baseUrl = getAppBaseUrl();
  const testUrl = `${baseUrl}/?testId=${encodeURIComponent(test.id)}`;
  const candidateName = studentName || 'Priya Patel';
  const istTimeStr = new Date(test.scheduledStartAt).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isSoon = type === 'soon';
  const heading = isSoon ? 'Exam Starts in 15 Minutes! 🚨' : 'Scheduled Test Reminder (2 Hours Before) ⏰';
  const badgeText = isSoon ? 'Starts in 15 Mins' : 'Starting in ~2 Hours';

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">${heading}</h2>
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">Dear <strong>${candidateName}</strong>, your scheduled examination is approaching.</p>

    <div class="card" style="border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 6px 0; font-size: 17px; color: #0f172a;">${test.title}</h3>
      <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b;">Scheduled Time: <strong>${istTimeStr} (IST)</strong></p>
      
      <div style="font-size: 13px; color: #475569; line-height: 1.5;">
        • Questions: <strong>${test.totalQuestions}</strong> · Duration: <strong>${test.totalTimeMinutes} Minutes</strong><br>
        • Please sit with a rough sheet and pen ready for calculations.
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${testUrl}" class="btn">🚀 Enter Exam Room</a>
    </div>
  `;

  return {
    subject: `[${badgeText}] ${test.title} starts at ${istTimeStr} IST`,
    html: baseEmailWrapper('Scheduled Test Reminder', content)
  };
}
