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
    .container { max-width: 620px; margin: 24px auto; background-color: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 26px 24px; text-align: center; border-bottom: 3px solid #f59e0b; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0 0; color: #fbbf24; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; }
    .content { padding: 30px 24px; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 18px 0; }
    .btn { display: inline-block; background-color: #f59e0b; color: #0f172a !important; font-weight: 800; font-size: 15px; padding: 13px 28px; border-radius: 8px; text-decoration: none; text-align: center; box-shadow: 0 2px 6px rgba(245, 158, 11, 0.25); }
    .btn-secondary { background-color: #0f172a; color: #ffffff !important; box-shadow: none; }
    .stat-box { display: inline-block; width: 46%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 1%; text-align: center; vertical-align: top; box-sizing: border-box; }
    .stat-val { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
    .stat-lbl { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin: 4px 0 0 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; }
    .badge-success { background-color: #dcfce7; color: #15803d; }
    .badge-warning { background-color: #fef3c7; color: #b45309; }
    .badge-danger { background-color: #fee2e2; color: #b91c1c; }
    .badge-neutral { background-color: #f1f5f9; color: #334155; }
    .alert-box { border-radius: 8px; padding: 14px 16px; margin: 18px 0; font-size: 13px; line-height: 1.5; }
    .alert-danger { background-color: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
    .alert-warning { background-color: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
    .alert-success { background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .direct-link-box { background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px 14px; margin-top: 22px; font-size: 12px; color: #475569; word-break: break-all; }
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
      <p style="margin: 0;">Automated notification from <span style="font-family: monospace;">noreply@bpsc.dpdns.org</span> · Do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// 1. NEW TEST AVAILABLE (STUDENT)
// -------------------------------------------------------------
export function renderStudentNewTestEmail(test: {
  id: string;
  title: string;
  subtitle?: string;
  totalQuestions: number;
  totalTimeMinutes: number;
  scheduledStartAt?: string | null;
  studentName?: string;
  baseUrl?: string;
}): { subject: string; html: string; testUrl: string } {
  const baseUrl = test.baseUrl ? test.baseUrl.replace(/\/+$/, '') : getAppBaseUrl();
  const testUrl = `${baseUrl}/?testId=${encodeURIComponent(test.id)}`;
  const candidateName = test.studentName || 'Priya Patel';

  const scheduledText = test.scheduledStartAt
    ? `<div class="alert-box alert-warning">
        <strong>[TIMING]:</strong> Scheduled for <strong>${new Date(test.scheduledStartAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</strong>
       </div>`
    : `<div class="alert-box alert-success">
        <strong>[STATUS: ACTIVE]:</strong> This test is available right now for immediate attempt.
       </div>`;

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">New Mock Test Published</h2>
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">Candidate: <strong>${candidateName}</strong></p>

    <div class="card" style="border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 6px 0; font-size: 17px; color: #0f172a;">${test.title}</h3>
      <p style="margin: 0 0 14px 0; font-size: 13px; color: #64748b;">${test.subtitle || 'Targeted BPSC TRE 4.0 Mathematics Practice Set'}</p>
      
      <div style="margin: 12px 0;">
        <span class="badge badge-warning" style="margin-right: 6px;">[QUESTIONS]: ${test.totalQuestions} Questions</span>
        <span class="badge badge-warning">[DURATION]: ${test.totalTimeMinutes} Minutes</span>
      </div>

      ${scheduledText}

      <div style="margin-top: 14px; font-size: 13px; color: #334155; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 12px;">
        • <strong>Negative Marking:</strong> 0.33 marks deducted per incorrect answer.<br>
        • <strong>Option (E) Safe Skip:</strong> Mark Option (E) for unattempted questions to avoid blank penalties.<br>
        • <strong>Real Exam Interface:</strong> Instant evaluation, question timer, and chapter accuracy breakdown.
      </div>
    </div>

    <div style="text-align: center; margin: 26px 0 16px 0;">
      <a href="${testUrl}" class="btn">START CBT MOCK TEST</a>
    </div>

    <div class="direct-link-box">
      <strong>Direct Test Link (Click or Copy into Browser):</strong><br>
      <a href="${testUrl}" style="color: #2563eb; text-decoration: underline; word-break: break-all;">${testUrl}</a>
    </div>
  `;

  return {
    subject: `[BPSC TRE 4.0] New Mock Test Available: ${test.title}`,
    html: baseEmailWrapper('New Mock Test Available', content),
    testUrl
  };
}

// -------------------------------------------------------------
// 1b. NEW TEST AVAILABLE (PARENT)
// -------------------------------------------------------------
export function renderParentNewTestEmail(test: {
  id: string;
  title: string;
  totalQuestions: number;
  totalTimeMinutes: number;
  scheduledStartAt?: string | null;
  studentName?: string;
  baseUrl?: string;
}): { subject: string; html: string; testUrl: string } {
  const baseUrl = test.baseUrl ? test.baseUrl.replace(/\/+$/, '') : getAppBaseUrl();
  const testUrl = `${baseUrl}/?testId=${encodeURIComponent(test.id)}`;
  const candidateName = test.studentName || 'Priya Patel';

  const scheduledInfo = test.scheduledStartAt
    ? `Scheduled for <strong>${new Date(test.scheduledStartAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</strong>`
    : `Available for practice today`;

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a;">New Practice Test Alert for ${candidateName}</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      A new full-length mathematics examination has been published on the portal for <strong>${candidateName}</strong>.
    </p>

    <div class="card" style="border-left: 4px solid #3b82f6;">
      <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #0f172a;">${test.title}</h3>
      <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.6;">
        • Total Questions: <strong>${test.totalQuestions} Questions</strong><br>
        • Allocated Time: <strong>${test.totalTimeMinutes} Minutes</strong><br>
        • Status: ${scheduledInfo}
      </p>
    </div>

    <p style="font-size: 13px; color: #475569; line-height: 1.6;">
      Kripya sunishchit karein ki ${candidateName} is mock test ko shanti-purna vatavaran mein attempt karein aur time management ka dhyan rakhein. Test pura hote hi scorecard aapko dispatch ho jayega.
    </p>

    <div style="text-align: center; margin: 24px 0 16px 0;">
      <a href="${testUrl}" class="btn btn-secondary">VIEW TEST DETAILS ON PORTAL</a>
    </div>

    <div class="direct-link-box">
      <strong>Direct Portal Access URL:</strong><br>
      <a href="${testUrl}" style="color: #2563eb; text-decoration: underline;">${testUrl}</a>
    </div>
  `;

  return {
    subject: `[BPSC Study Update] New Mathematics Mock Test Published for ${candidateName}`,
    html: baseEmailWrapper('New Test Notification for Parent', content),
    testUrl
  };
}

// -------------------------------------------------------------
// 2. TEST COMPLETED / RESULT SCORECARD (STUDENT)
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
  baseUrl?: string;
}): { subject: string; html: string; reviewUrl: string } {
  const baseUrl = attempt.baseUrl ? attempt.baseUrl.replace(/\/+$/, '') : getAppBaseUrl();
  const reviewUrl = `${baseUrl}/?reviewTestId=${encodeURIComponent(attempt.testId)}`;
  const candidateName = attempt.studentName || 'Priya Patel';

  const timeMin = attempt.totalTimeSpentSeconds
    ? Math.round(attempt.totalTimeSpentSeconds / 60)
    : 0;

  const isPoorResult = attempt.accuracy < 50 || (attempt.score / (attempt.totalMarks || 1)) < 0.45;

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

  const realityCheckWarning = isPoorResult
    ? `
    <div class="alert-box alert-danger">
      <strong style="display: block; margin-bottom: 4px; font-size: 14px;">[SAVDHAN: RESULT ASANTOSHJANK - EXAM QUALIFY KARNA KATHIN HOGA]</strong>
      Is score aur accuracy ke sath BPSC TRE 4.0 qualify karna asambhav hai. Aapke <strong>${attempt.incorrectCount}</strong> prashna galat hue hain (-0.33 negative marking se ${((attempt.incorrectCount) * 0.33).toFixed(2)} marks kat gaye). Turant niche diye link se sabhi galat prashno ka vishleshan karein aur dohrana shuru karein.
    </div>
    `
    : `
    <div class="alert-box alert-success">
      <strong>[PRADARSHAN STATUS: SANTOSHJANK]</strong> Acchi mehnat. Agle mock test mein aur behtar timing ke sath 80%+ accuracy ka lakshya rakhein.
    </div>
    `;

  const content = `
    <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #0f172a;">Official CBT Examination Scorecard</h2>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 18px 0;">Candidate: <strong>${candidateName}</strong> · Test: <em>${attempt.testTitle}</em></p>

    ${realityCheckWarning}

    <!-- Stat boxes -->
    <div style="margin: 18px 0;">
      <div class="stat-box">
        <p class="stat-val" style="color: ${attempt.score >= (attempt.totalMarks * 0.6) ? '#16a34a' : '#d97706'};">${attempt.score.toFixed(2)}</p>
        <p class="stat-lbl">Final Marks / ${attempt.totalMarks}</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: ${attempt.accuracy >= 65 ? '#16a34a' : '#dc2626'};">${attempt.accuracy}%</p>
        <p class="stat-lbl">Overall Accuracy</p>
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

    <div class="card" style="margin: 18px 0; font-size: 13px; color: #334155;">
      <strong>Test Telemetry:</strong> Questions: <strong>${attempt.totalQuestions}</strong> · Time Taken: <strong>${timeMin} mins</strong> · Option (E) Safe Skips: <strong>${attempt.safeSkipCount || 0}</strong>
    </div>

    ${
      topicRows
        ? `
      <h3 style="font-size: 15px; margin: 22px 0 10px 0; color: #0f172a;">Topic-wise Performance Breakdown</h3>
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

    <div style="text-align: center; margin: 26px 0 16px 0;">
      <a href="${reviewUrl}" class="btn">REVIEW QUESTION EXPLANATIONS</a>
    </div>

    <div class="direct-link-box">
      <strong>Direct Review Link (Step-by-step solutions):</strong><br>
      <a href="${reviewUrl}" style="color: #2563eb; text-decoration: underline;">${reviewUrl}</a>
    </div>
  `;

  return {
    subject: `[BPSC Scorecard] ${attempt.testTitle} - Score: ${attempt.score.toFixed(2)}/${attempt.totalMarks} (${attempt.accuracy}%)`,
    html: baseEmailWrapper('Mock Test Result Scorecard', content),
    reviewUrl
  };
}

// -------------------------------------------------------------
// 2b. TEST COMPLETED / RESULT SUMMARY (PARENT)
// -------------------------------------------------------------
export function renderParentResultEmail(attempt: {
  testTitle: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  studentName?: string;
  baseUrl?: string;
  testId?: string;
}): { subject: string; html: string } {
  const baseUrl = attempt.baseUrl ? attempt.baseUrl.replace(/\/+$/, '') : getAppBaseUrl();
  const candidateName = attempt.studentName || 'Priya Patel';
  const percentage = Math.round((attempt.score / (attempt.totalMarks || 1)) * 100);
  const isPoorResult = attempt.accuracy < 50 || percentage < 45;

  let statusRemark = '';
  if (attempt.accuracy >= 75) {
    statusRemark = '[UTKRISHT PRADARSHAN]: Priya ka score shandar hai aur concept clear hain. Isi consistency ko banaye rakhein.';
  } else if (attempt.accuracy >= 55) {
    statusRemark = '[SAMANYA PRADARSHAN]: Pradarshan theek hai, lekin negative marking se bachne ke liye calculation practice badhani hogi.';
  } else {
    statusRemark = '[ASANTOSHJANK - VISHOESH DHYAN KI ZAROORAT]: Priya ka score cut-off apeksha se kafi kam hai. Is tarah ke result se BPSC qualify karna asambhav hoga. Galtiyon ka vishleshan anivarya hai.';
  }

  const alertClass = isPoorResult ? 'alert-danger' : attempt.accuracy >= 75 ? 'alert-success' : 'alert-warning';

  const content = `
    <h2 style="margin: 0 0 6px 0; font-size: 18px; color: #0f172a;">Mock Test Result for ${candidateName}</h2>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 18px 0;">${candidateName} ne abhi-abhi ek CBT Mock Test submit kiya hai: <strong>${attempt.testTitle}</strong>.</p>

    <div class="card" style="border-left: 4px solid ${isPoorResult ? '#dc2626' : '#10b981'}; padding: 18px;">
      <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
        ${attempt.score.toFixed(2)} / ${attempt.totalMarks} Marks <span style="font-size: 14px; color: #64748b; font-weight: 500;">(${percentage}%)</span>
      </div>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569;">
        Accuracy: <strong>${attempt.accuracy}%</strong> · Correct: <strong>${attempt.correctCount}</strong> · Wrong: <strong>${attempt.incorrectCount}</strong> (-0.33 marking)
      </p>
      
      <div class="alert-box ${alertClass}" style="margin: 10px 0 0 0;">
        <strong>Evaluation Report:</strong> ${statusRemark}
      </div>
    </div>

    <p style="font-size: 13px; color: #475569; line-height: 1.6;">
      Kripya ${candidateName} ko portal par jakar har galat prashna ka step-by-step solution dekhne ko kahein, taki aane wali pariksha mein wahi galtiyan na dohrayi jayein.
    </p>

    <div style="text-align: center; margin: 22px 0 14px 0;">
      <a href="${baseUrl}" class="btn btn-secondary">OPEN STUDENT PORTAL</a>
    </div>
  `;

  return {
    subject: `[BPSC Progress Report] ${candidateName} scored ${attempt.score.toFixed(2)}/${attempt.totalMarks} in ${attempt.testTitle}`,
    html: baseEmailWrapper('Result Summary for Parent', content)
  };
}

// -------------------------------------------------------------
// 3. DAILY INACTIVITY ALERT (STUDENT & PARENT)
// -------------------------------------------------------------
export function renderStudentDailyInactivityEmail(studentName?: string, baseUrlOverride?: string): { subject: string; html: string; portalUrl: string } {
  const baseUrl = baseUrlOverride ? baseUrlOverride.replace(/\/+$/, '') : getAppBaseUrl();
  const candidateName = studentName || 'Priya Patel';

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">[DISCIPLINE ALERT]: Aaj Ka Abhyas Adhura Hai</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
      Candidate: <strong>${candidateName}</strong>, aaj pura din nikal gaya lekin aapne BPSC TRE 4.0 Ganit ka koi bhi mock test ya practice set attempt nahi kiya hai.
    </p>

    <div class="alert-box alert-danger">
      <strong style="display: block; margin-bottom: 4px; font-size: 14px;">[REALITY CHECK - BPSC TRE 4.0 QUALIFICATION]:</strong>
      BPSC Teacher Recruitment pariksha mein lakho candidates hissa le rahe hain. Bina lagatar rozana mock tests aur question practice ke qualify karna asambhav hai. Calculation speed aur accuracy rozana abhyas se hi banti hai.
    </div>

    <div class="card" style="border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 6px 0; font-size: 15px; color: #92400e;">[LAKSHYA NIYAM]:</h3>
      <p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.6;">
        Aaj ka din bina kam se kam 15-20 prashna hal kiye khatam mat hone dijiye. Portal par abhi login karein aur kam se kam ek 15-minute quick mock test attempt karein.
      </p>
    </div>

    <div style="text-align: center; margin: 26px 0 16px 0;">
      <a href="${baseUrl}" class="btn">START DAILY MOCK TEST NOW</a>
    </div>

    <div class="direct-link-box">
      <strong>Direct Portal Access URL:</strong><br>
      <a href="${baseUrl}" style="color: #2563eb; text-decoration: underline;">${baseUrl}</a>
    </div>
  `;

  return {
    subject: `[BPSC Discipline Alert] Aaj koi test attempt nahi hua hai, ${candidateName}`,
    html: baseEmailWrapper('Daily Inactivity Alert', content),
    portalUrl: baseUrl
  };
}

export function renderParentDailyInactivityEmail(studentName?: string, baseUrlOverride?: string): { subject: string; html: string } {
  const baseUrl = baseUrlOverride ? baseUrlOverride.replace(/\/+$/, '') : getAppBaseUrl();
  const candidateName = studentName || 'Priya Patel';

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a;">Daily Study Alert: No Mock Test Recorded Today</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Yeh suchna <strong>${candidateName}</strong> ki BPSC TRE 4.0 taiyari ke sambandh mein hai.
    </p>

    <div class="alert-box alert-danger">
      <strong style="display: block; margin-bottom: 4px; font-size: 14px;">[STATUS UPDATE: ZERO TESTS ATTEMPTED TODAY]:</strong>
      Aaj sham tak ${candidateName} dwara portal par ek bhi mathematics mock test ya practice set complete nahi kiya gaya hai.
    </div>

    <div class="card" style="border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.6;">
        • Ganit vishay mein high cutoff qualify karne ke liye rozana abhyas atyavashyak hai.<br>
        • Kripya ${candidateName} ko preit karein ki ve abhi sone se pehle kam se kam 15-20 prashna solve karein.
      </p>
    </div>

    <div style="text-align: center; margin: 24px 0 16px 0;">
      <a href="${baseUrl}" class="btn btn-secondary">CHECK PORTAL PROGRESS</a>
    </div>

    <div class="direct-link-box">
      <strong>Direct Portal Access URL:</strong><br>
      <a href="${baseUrl}" style="color: #2563eb; text-decoration: underline;">${baseUrl}</a>
    </div>
  `;

  return {
    subject: `[BPSC Study Alert] ${candidateName} has not attempted any mock test today`,
    html: baseEmailWrapper('Daily Study Alert for Parent', content)
  };
}

// -------------------------------------------------------------
// 4. WEEKLY PERFORMANCE REPORT
// -------------------------------------------------------------
export function renderStudentWeeklyReportEmail(stats: {
  totalAttempts: number;
  totalQuestions: number;
  averageAccuracy: number;
  averageScorePercentage: number;
  strongTopics: TopicPerformanceStat[];
  weakTopics: TopicPerformanceStat[];
  studentName?: string;
  baseUrl?: string;
}): { subject: string; html: string } {
  const baseUrl = stats.baseUrl ? stats.baseUrl.replace(/\/+$/, '') : getAppBaseUrl();
  const candidateName = stats.studentName || 'Priya Patel';

  let strongList = stats.strongTopics.length
    ? stats.strongTopics
        .map((t) => `<li><strong>${t.topicLabel}:</strong> ${t.accuracy}% accuracy (${t.correct}/${t.total} correct)</li>`)
        .join('')
    : '<li>Continue balanced practice across all chapters to build strong topics.</li>';

  let weakList = stats.weakTopics.length
    ? stats.weakTopics
        .map((t) => `<li><strong>${t.topicLabel}:</strong> ${t.accuracy}% accuracy (${t.incorrect} mistakes)</li>`)
        .join('')
    : '<li>No severe weak spots detected this week. Good baseline!</li>';

  const content = `
    <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #0f172a;">Weekly Performance Analysis</h2>
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
    <div class="card" style="border-left: 4px solid #16a34a; margin-top: 22px;">
      <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #15803d;">[STRONG CHAPTERS]: Mastered Areas</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e293b; line-height: 1.6;">
        ${strongList}
      </ul>
    </div>

    <!-- Weak areas -->
    <div class="card" style="border-left: 4px solid #dc2626;">
      <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #b91c1c;">[FOCUS REVISION]: High Error Chapters</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e293b; line-height: 1.6;">
        ${weakList}
      </ul>
    </div>

    <div style="text-align: center; margin: 26px 0 16px 0;">
      <a href="${baseUrl}" class="btn">START NEW WEEKLY DRILL</a>
    </div>

    <div class="direct-link-box">
      <strong>Direct Portal Access URL:</strong><br>
      <a href="${baseUrl}" style="color: #2563eb; text-decoration: underline;">${baseUrl}</a>
    </div>
  `;

  return {
    subject: `[BPSC Weekly Report] Performance Digest for ${candidateName} - Accuracy: ${stats.averageAccuracy}%`,
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
  baseUrl?: string;
}): { subject: string; html: string } {
  const baseUrl = stats.baseUrl ? stats.baseUrl.replace(/\/+$/, '') : getAppBaseUrl();
  const candidateName = stats.studentName || 'Priya Patel';

  const strongSummary = stats.strongTopics.map((t) => t.topicLabel).slice(0, 3).join(', ') || 'General Mathematics';
  const weakSummary = stats.weakTopics.map((t) => t.topicLabel).slice(0, 3).join(', ') || 'None';

  const content = `
    <h2 style="margin: 0 0 6px 0; font-size: 18px; color: #0f172a;">Weekly Progress Summary for ${candidateName}</h2>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">Weekly overview of preparation progress for BPSC TRE 4.0.</p>

    <div class="card" style="border-left: 4px solid #3b82f6; padding: 18px;">
      <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Weekly Performance Snapshot:</div>
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155; line-height: 1.6;">
        • Tests Attempted: <strong>${stats.totalAttempts}</strong><br>
        • Questions Practiced: <strong>${stats.totalQuestions}</strong><br>
        • Average Accuracy: <strong>${stats.averageAccuracy}%</strong><br>
        • Average Score: <strong>${stats.averageScorePercentage}%</strong>
      </p>
      <div style="margin-top: 12px; font-size: 13px; color: #1e293b; background-color: #f1f5f9; padding: 10px; border-radius: 6px;">
        <strong>Key Strengths:</strong> ${strongSummary}<br>
        <strong>Chapters Needing Dedicated Revision:</strong> ${weakSummary}
      </div>
    </div>

    <div style="text-align: center; margin: 24px 0 16px 0;">
      <a href="${baseUrl}" class="btn btn-secondary">OPEN BPSC PORTAL</a>
    </div>
  `;

  return {
    subject: `[BPSC Weekly Digest] ${candidateName}'s Preparation Summary`,
    html: baseEmailWrapper('Weekly Progress Summary for Parent', content)
  };
}

// -------------------------------------------------------------
// 5. SCHEDULED TEST REMINDERS
// -------------------------------------------------------------
export function renderTestReminderEmail(
  test: { id: string; title: string; scheduledStartAt: string; totalQuestions: number; totalTimeMinutes: number },
  type: '2h' | 'soon',
  studentName?: string,
  baseUrlOverride?: string
): { subject: string; html: string; testUrl: string } {
  const baseUrl = baseUrlOverride ? baseUrlOverride.replace(/\/+$/, '') : getAppBaseUrl();
  const testUrl = `${baseUrl}/?testId=${encodeURIComponent(test.id)}`;
  const candidateName = studentName || 'Priya Patel';
  const istTimeStr = new Date(test.scheduledStartAt).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isSoon = type === 'soon';
  const heading = isSoon ? '[URGENT]: Exam Starts in 15 Minutes' : '[REMINDER]: Scheduled Test Starts in 2 Hours';
  const badgeText = isSoon ? 'Starts in 15 Mins' : 'Starting in ~2 Hours';

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #0f172a;">${heading}</h2>
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">Dear <strong>${candidateName}</strong>, your scheduled mathematics mock test is approaching.</p>

    <div class="card" style="border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 6px 0; font-size: 17px; color: #0f172a;">${test.title}</h3>
      <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b;">Scheduled Time: <strong>${istTimeStr} (IST)</strong></p>
      
      <div style="font-size: 13px; color: #334155; line-height: 1.6;">
        • Questions: <strong>${test.totalQuestions}</strong> · Duration: <strong>${test.totalTimeMinutes} Minutes</strong><br>
        • Negative Marking: <strong>0.33 marks penalty</strong> for incorrect options.<br>
        • Please keep rough paper and pen ready for rapid calculations.
      </div>
    </div>

    <div style="text-align: center; margin: 26px 0 16px 0;">
      <a href="${testUrl}" class="btn">ENTER EXAMINATION ROOM</a>
    </div>

    <div class="direct-link-box">
      <strong>Direct Test Link:</strong><br>
      <a href="${testUrl}" style="color: #2563eb; text-decoration: underline;">${testUrl}</a>
    </div>
  `;

  return {
    subject: `[${badgeText}] ${test.title} starts at ${istTimeStr} IST`,
    html: baseEmailWrapper('Scheduled Test Reminder', content),
    testUrl
  };
}
