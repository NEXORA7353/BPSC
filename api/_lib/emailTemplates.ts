import { getAppBaseUrl, TopicPerformanceStat } from './constants.js';

const PORTAL_NAME = '🎯 BPSC TRE 4.0 गणित मॉक टेस्ट पोर्टल';
const PORTAL_TAGLINE = '⚡ बिहार शिक्षक भर्ती परीक्षा 4.0 - रियल परीक्षा सिमुलेटर';

function baseEmailWrapper(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Devanagari', Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 620px; margin: 24px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #312e81 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #f59e0b; }
    .header h1 { margin: 0; color: #ffffff; font-size: 21px; font-weight: 800; letter-spacing: 0.3px; }
    .header p { margin: 8px 0 0 0; color: #fde047; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 30px 24px; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 18px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #0f172a !important; font-weight: 800; font-size: 15px; padding: 14px 30px; border-radius: 10px; text-decoration: none; text-align: center; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35); transition: transform 0.15s ease; }
    .btn-secondary { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff !important; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25); }
    .stat-grid { margin: 18px 0; text-align: center; }
    .stat-box { display: inline-block; width: 47%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 10px; margin: 1%; text-align: center; vertical-align: top; box-sizing: border-box; box-shadow: 0 2px 4px rgba(0,0,0,0.03); }
    .stat-val { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
    .stat-lbl { font-size: 12px; font-weight: 700; color: #64748b; margin: 4px 0 0 0; }
    .badge { display: inline-block; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; margin: 2px 4px 2px 0; }
    .badge-success { background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-warning { background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-danger { background-color: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
    .badge-neutral { background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .alert-box { border-radius: 10px; padding: 16px 18px; margin: 18px 0; font-size: 14px; line-height: 1.6; }
    .alert-danger { background-color: #fef2f2; border: 1px solid #f87171; color: #991b1b; }
    .alert-warning { background-color: #fffbeb; border: 1px solid #fbbf24; color: #92400e; }
    .alert-success { background-color: #f0fdf4; border: 1px solid #4ade80; color: #166534; }
    .direct-link-box { background-color: #f8fafc; border: 1px dashed #94a3b8; border-radius: 10px; padding: 14px 16px; margin-top: 22px; font-size: 12px; color: #475569; word-break: break-all; }
    .footer { background-color: #f8fafc; padding: 22px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${PORTAL_NAME}</h1>
      <p>${PORTAL_TAGLINE}</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">🇮🇳 BPSC TRE 4.0 मैथमेटिक्स रियल एग्जाम सिमुलेटर</p>
      <p style="margin: 0;">स्वचालित ई-मेल अधिसूचना · प्रेषक: <span style="font-family: monospace; color: #2563eb;">noreply@bpsc.dpdns.org</span> · कृपया इस ई-मेल का सीधा उत्तर न दें।</p>
    </div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// 1. NEW TEST AVAILABLE (STUDENT - हिंदी)
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
  const candidateName = test.studentName || 'प्रिया पटेल';

  const scheduledText = test.scheduledStartAt
    ? `<div class="alert-box alert-warning">
        ⏰ <strong>[निर्धारित समय]:</strong> यह परीक्षा <strong>${new Date(test.scheduledStartAt).toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' })} (IST)</strong> पर शुरू होगी।
       </div>`
    : `<div class="alert-box alert-success">
        ⚡ <strong>[परीक्षा सक्रिय है]:</strong> यह टेस्ट अभी अभ्यास के लिए उपलब्ध है।
       </div>`;

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 21px; color: #0f172a;">📢 नया मॉक टेस्ट प्रकाशित हुआ है!</h2>
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">
      👤 <strong>अभ्यर्थी:</strong> ${candidateName} &nbsp;|&nbsp; 🎯 <strong>लक्ष्य:</strong> BPSC TRE 4.0 शिक्षक चयन
    </p>

    <div class="card" style="border-left: 5px solid #f59e0b;">
      <h3 style="margin: 0 0 6px 0; font-size: 18px; color: #0f172a;">📝 ${test.title}</h3>
      <p style="margin: 0 0 14px 0; font-size: 13px; color: #64748b;">${test.subtitle || 'BPSC TRE 4.0 गणित उच्च-स्तरीय अभ्यास प्रश्न पत्र'}</p>
      
      <div style="margin: 14px 0;">
        <span class="badge badge-warning">📚 ${test.totalQuestions} प्रश्न</span>
        <span class="badge badge-warning">⏱️ ${test.totalTimeMinutes} मिनट</span>
        <span class="badge badge-danger">⚠️ -0.33 नेगेटिव मार्किंग</span>
        <span class="badge badge-success">🛡️ Option (E) सेफ स्किप</span>
      </div>

      ${scheduledText}

      <div style="margin-top: 16px; font-size: 13px; color: #334155; line-height: 1.7; border-top: 1px solid #e2e8f0; padding-top: 14px;">
        📌 <strong>परीक्षा के मुख्य निर्देश:</strong><br>
        • ❌ <strong>नेगेटिव मार्किंग:</strong> प्रत्येक गलत उत्तर पर <strong>0.33 अंक</strong> काट लिए जाएंगे।<br>
        • 🛡️ <strong>Option (E) का उपयोग:</strong> जिस प्रश्न का उत्तर ज्ञात न हो, उसमें Option (E) सेलेक्ट करें ताकि ब्लैंक पेनाल्टी से बचा जा सके।<br>
        • 📊 <strong>रियल एग्जाम टाइमर:</strong> वास्तविक परीक्षा की तरह टाइमर चलेगा। समय समाप्त होने से पहले टेस्ट सबमिट करें।
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0 18px 0;">
      <a href="${testUrl}" class="btn">🚀 अभी CBT मॉक टेस्ट शुरू करें</a>
    </div>

    <div class="direct-link-box">
      🔗 <strong>सीधा टेस्ट लिंक (क्लिक करें या ब्राउज़र में कॉपी करें):</strong><br>
      <a href="${testUrl}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">${testUrl}</a>
    </div>
  `;

  return {
    subject: `[BPSC TRE 4.0] New Mock Test Available: ${test.title}`,
    html: baseEmailWrapper('नया मॉक टेस्ट उपलब्ध', content),
    testUrl
  };
}

// -------------------------------------------------------------
// 1b. NEW TEST AVAILABLE (PARENT - हिंदी)
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
  const candidateName = test.studentName || 'प्रिया पटेल';

  const scheduledInfo = test.scheduledStartAt
    ? `निर्धारित समय: <strong>${new Date(test.scheduledStartAt).toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' })} (IST)</strong>`
    : `आज अभ्यास के लिए उपलब्ध`;

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 19px; color: #0f172a;">👨‍👩‍👧 अभिभावक अध्ययन अपडेट: नया टेस्ट जारी</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      आदरणीय अभिभावक, <strong>${candidateName}</strong> के लिए BPSC TRE 4.0 गणित का एक नया अभ्यास प्रश्न पत्र पोर्टल पर प्रकाशित कर दिया गया है।
    </p>

    <div class="card" style="border-left: 5px solid #3b82f6;">
      <h3 style="margin: 0 0 6px 0; font-size: 17px; color: #0f172a;">📋 ${test.title}</h3>
      <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.7;">
        • 📚 कुल प्रश्न: <strong>${test.totalQuestions} प्रश्न</strong><br>
        • ⏱️ आवंटित समय: <strong>${test.totalTimeMinutes} मिनट</strong><br>
        • ⏰ स्थिति: ${scheduledInfo}
      </p>
    </div>

    <p style="font-size: 13px; color: #475569; line-height: 1.6;">
      💡 <strong>सुझाव:</strong> कृपया सुनिश्चित करें कि ${candidateName} इस मॉक टेस्ट को बिना किसी रुकावट के शांत वातावरण में पेन-पेपर के साथ हल करें। टेस्ट सबमिट होते ही उनका विस्तृत परिणाम एवं एक्यूरेसी रिपोर्ट आपको ईमेल द्वारा भेज दी जाएगी।
    </p>

    <div style="text-align: center; margin: 26px 0 16px 0;">
      <a href="${testUrl}" class="btn btn-secondary">📊 पोर्टल पर टेस्ट विवरण देखें</a>
    </div>

    <div class="direct-link-box">
      🔗 <strong>सीधा पोर्टल लिंक:</strong><br>
      <a href="${testUrl}" style="color: #2563eb; text-decoration: underline;">${testUrl}</a>
    </div>
  `;

  return {
    subject: `[BPSC TRE 4.0] New Mathematics Practice Test for ${candidateName}`,
    html: baseEmailWrapper('अभिभावक के लिए नया टेस्ट सूचना', content),
    testUrl
  };
}

// -------------------------------------------------------------
// 2. TEST COMPLETED / RESULT SCORECARD (STUDENT - हिंदी)
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
  const candidateName = attempt.studentName || 'प्रिया पटेल';

  const timeMin = attempt.totalTimeSpentSeconds
    ? Math.round(attempt.totalTimeSpentSeconds / 60)
    : 0;

  const percentage = Math.round((attempt.score / (attempt.totalMarks || 1)) * 100);
  const isPoorResult = attempt.accuracy < 50 || percentage < 45;

  let topicRows = '';
  if (attempt.topicBreakdown && Object.keys(attempt.topicBreakdown).length > 0) {
    topicRows = Object.values(attempt.topicBreakdown)
      .map((t) => {
        const badgeClass = t.accuracy >= 70 ? 'badge-success' : t.accuracy >= 45 ? 'badge-warning' : 'badge-danger';
        const label = t.topicLabelHindi || t.topicLabel;
        return `
          <tr style="border-bottom: 1px solid #f1f5f9; font-size: 13px;">
            <td style="padding: 10px 8px; font-weight: 600; color: #0f172a;">${label}</td>
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
      <strong style="display: block; margin-bottom: 6px; font-size: 15px;">🚨 [सावधान: रिजल्ट असंतोषजनक - इस तरह BPSC TRE 4.0 Qualify नहीं होगा!] ⚠️</strong>
      BPSC शिक्षक भर्ती में कट-ऑफ 70%+ रहता है, जबकि आपका वर्तमान स्कोर केवल <strong>${attempt.score.toFixed(2)} / ${attempt.totalMarks} (${percentage}%)</strong> है और एक्यूरेसी <strong>${attempt.accuracy}%</strong> है।<br>
      आपके <strong>${attempt.incorrectCount}</strong> प्रश्न गलत हुए हैं, जिसके कारण <strong>-${((attempt.incorrectCount) * 0.33).toFixed(2)} अंक</strong> नेगेटिव मार्किंग में कट गए!<br>
      💡 <strong>तुरंत कार्यवाही करें:</strong> नीचे दिए गए लिंक से सभी गलत प्रश्नों के व्याख्यात्मक हल देखें और उन अध्यायों का गहन रिविजन करें।
    </div>
    `
    : `
    <div class="alert-box alert-success">
      <strong style="display: block; margin-bottom: 4px; font-size: 15px;">🏆 [शानदार प्रदर्शन - लक्ष्य की ओर सही दिशा] 🎯</strong>
      बहुत अच्छा प्रयास! आपने <strong>${attempt.score.toFixed(2)} / ${attempt.totalMarks} अंक</strong> और <strong>${attempt.accuracy}% एक्यूरेसी</strong> अर्जित की है। इस निरंतरता को बनाए रखें और अगले टेस्ट में 80%+ एक्यूरेसी का लक्ष्य साधें।
    </div>
    `;

  const content = `
    <h2 style="margin: 0 0 6px 0; font-size: 21px; color: #0f172a;">📊 आधिकारिक CBT परीक्षा स्कोरकार्ड</h2>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 18px 0;">👤 अभ्यर्थी: <strong>${candidateName}</strong> · 📝 टेस्ट: <em>${attempt.testTitle}</em></p>

    ${realityCheckWarning}

    <!-- Stat boxes -->
    <div class="stat-grid">
      <div class="stat-box">
        <p class="stat-val" style="color: ${attempt.score >= (attempt.totalMarks * 0.6) ? '#16a34a' : '#d97706'};">${attempt.score.toFixed(2)}</p>
        <p class="stat-lbl">🎯 कुल प्राप्तांक / ${attempt.totalMarks}</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: ${attempt.accuracy >= 65 ? '#16a34a' : '#dc2626'};">${attempt.accuracy}%</p>
        <p class="stat-lbl">📈 कुल एक्यूरेसी</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: #16a34a;">${attempt.correctCount}</p>
        <p class="stat-lbl">✅ सही उत्तर</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: #dc2626;">${attempt.incorrectCount}</p>
        <p class="stat-lbl">❌ गलत (-0.33 अंक)</p>
      </div>
    </div>

    <div class="card" style="margin: 18px 0; font-size: 13px; color: #334155;">
      ⚡ <strong>टेस्ट सांख्यिकी:</strong> कुल प्रश्न: <strong>${attempt.totalQuestions}</strong> &nbsp;|&nbsp; ⏱️ समय लिया: <strong>${timeMin} मिनट</strong> &nbsp;|&nbsp; 🛡️ Option (E) सेफ स्किप: <strong>${attempt.safeSkipCount || 0}</strong>
    </div>

    ${
      topicRows
        ? `
      <h3 style="font-size: 16px; margin: 24px 0 12px 0; color: #0f172a;">📚 अध्याय-वार प्रदर्शन विश्लेषण (Topic Breakdown)</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f1f5f9; font-size: 12px; color: #64748b;">
            <th style="padding: 8px; text-align: left;">अध्याय (Chapter)</th>
            <th style="padding: 8px; text-align: center;">कुल</th>
            <th style="padding: 8px; text-align: center;">सही ✅</th>
            <th style="padding: 8px; text-align: center;">गलत ❌</th>
            <th style="padding: 8px; text-align: right;">एक्यूरेसी 📈</th>
          </tr>
        </thead>
        <tbody>
          ${topicRows}
        </tbody>
      </table>
      `
        : ''
    }

    <div style="text-align: center; margin: 28px 0 18px 0;">
      <a href="${reviewUrl}" class="btn">🔍 सभी प्रश्नों के व्याख्यात्मक हल देखें (Review Solutions)</a>
    </div>

    <div class="direct-link-box">
      🔗 <strong>सीधा प्रश्न समीक्षा लिंक (Step-by-step Solutions):</strong><br>
      <a href="${reviewUrl}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">${reviewUrl}</a>
    </div>
  `;

  const subjectPrefix = isPoorResult ? '[Scorecard Alert - Action Required]' : '[Scorecard]';

  return {
    subject: `${subjectPrefix} ${attempt.testTitle} — Score: ${attempt.score.toFixed(2)}/${attempt.totalMarks} (${attempt.accuracy}%)`,
    html: baseEmailWrapper('मॉक टेस्ट परीक्षा परिणाम', content),
    reviewUrl
  };
}

// -------------------------------------------------------------
// 2b. TEST COMPLETED / RESULT SUMMARY (PARENT - हिंदी)
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
  const candidateName = attempt.studentName || 'प्रिया पटेल';
  const percentage = Math.round((attempt.score / (attempt.totalMarks || 1)) * 100);
  const isPoorResult = attempt.accuracy < 50 || percentage < 45;

  let statusRemark = '';
  if (attempt.accuracy >= 75) {
    statusRemark = '🌟 <strong>[उत्कृष्ट प्रदर्शन]:</strong> प्रिया का स्कोर बहुत सराहनीय है और मूल अवधारणाएं मजबूत हैं। इसी निरंतरता को बनाए रखें।';
  } else if (attempt.accuracy >= 55) {
    statusRemark = '⚠️ <strong>[सामान्य प्रदर्शन]:</strong> प्रदर्शन ठीक है, लेकिन नेगेटिव मार्किंग से बचने हेतु कठिन प्रश्नों के कैलकुलेशन अभ्यास की आवश्यकता है।';
  } else {
    statusRemark = '🚨 <strong>[असंतोषजनक - विशेष मार्गदर्शन आवश्यक]:</strong> प्रिया का स्कोर कट-ऑफ अपेक्षा से काफी कम है। इस तरह के परिणाम से BPSC TRE 4.0 क्वालिफाई करना कठिन होगा। कृपया उन्हें कमजोर अध्यायों पर विशेष समय देने हेतु प्रेरित करें।';
  }

  const alertClass = isPoorResult ? 'alert-danger' : attempt.accuracy >= 75 ? 'alert-success' : 'alert-warning';

  const content = `
    <h2 style="margin: 0 0 6px 0; font-size: 19px; color: #0f172a;">👨‍👩‍👧 ${candidateName} की मॉक टेस्ट परीक्षा परिणाम रिपोर्ट</h2>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 18px 0;">${candidateName} ने अभी-अभी कंप्यूटर आधारित मॉक टेस्ट पूरा किया: <strong>${attempt.testTitle}</strong>.</p>

    <div class="card" style="border-left: 5px solid ${isPoorResult ? '#dc2626' : '#10b981'}; padding: 20px;">
      <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
        🎯 ${attempt.score.toFixed(2)} / ${attempt.totalMarks} अंक <span style="font-size: 15px; color: #64748b; font-weight: 500;">(${percentage}%)</span>
      </div>
      <p style="margin: 0 0 14px 0; font-size: 14px; color: #475569;">
        📈 एक्यूरेसी: <strong>${attempt.accuracy}%</strong> &nbsp;|&nbsp; ✅ सही: <strong>${attempt.correctCount}</strong> &nbsp;|&nbsp; ❌ गलत: <strong>${attempt.incorrectCount}</strong> (-0.33 अंक पेनाल्टी)
      </p>
      
      <div class="alert-box ${alertClass}" style="margin: 12px 0 0 0;">
        ${statusRemark}
      </div>
    </div>

    <p style="font-size: 13px; color: #475569; line-height: 1.7;">
      💡 <strong>अभिभावक सुझाव:</strong> कृपया ${candidateName} से कहें कि वे पोर्टल पर जाकर गलत हुए सभी प्रश्नों का स्टेप-बाय-स्टेप सॉल्यूशन देखें ताकि वास्तविक परीक्षा में वही गलतियां न दोहराई जाएं।
    </p>

    <div style="text-align: center; margin: 24px 0 16px 0;">
      <a href="${baseUrl}" class="btn btn-secondary">🌐 छात्र पोर्टल खोलें और प्रगति देखें</a>
    </div>
  `;

  return {
    subject: `[BPSC Progress Report] ${candidateName} completed ${attempt.testTitle} — Score: ${attempt.score.toFixed(2)}/${attempt.totalMarks}`,
    html: baseEmailWrapper('अभिभावक के लिए परीक्षा परिणाम', content)
  };
}

// -------------------------------------------------------------
// 3. DAILY INACTIVITY ALERT (STUDENT & PARENT - हिंदी)
// -------------------------------------------------------------
export function renderStudentDailyInactivityEmail(studentName?: string, baseUrlOverride?: string): { subject: string; html: string; portalUrl: string } {
  const baseUrl = baseUrlOverride ? baseUrlOverride.replace(/\/+$/, '') : getAppBaseUrl();
  const candidateName = studentName || 'प्रिया पटेल';

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 21px; color: #0f172a;">🚨 [अनुशासन चेतावनी]: आज का अभ्यास अधूरा है!</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
      👤 <strong>अभ्यर्थी:</strong> ${candidateName}, आज पूरा दिन बीत चुका है परंतु पोर्टल पर आपका एक भी गणित मॉक टेस्ट या प्रैक्टिस सेट दर्ज नहीं हुआ है।
    </p>

    <div class="alert-box alert-danger">
      <strong style="display: block; margin-bottom: 6px; font-size: 15px;">⚠️ [परीक्षा चेतावनी: इस तरह BPSC TRE 4.0 Qualify नहीं होगा!]:</strong>
      बिहार शिक्षक भर्ती परीक्षा में लाखों अभ्यर्थी कड़ी मेहनत कर रहे हैं। बिना दैनिक निरंतर अभ्यास के गणित में कट-ऑफ पार करना असंभव है। एक दिन का आलस्य आपकी रैंक को हजारों स्थान पीछे धकेल सकता है।
    </div>

    <div class="card" style="border-left: 5px solid #f59e0b;">
      <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #92400e;">🔥 [आज का अनिवार्य लक्ष्य]:</h3>
      <p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.7;">
        आज का दिन बिना कम से कम 20 प्रश्न हल किए समाप्त न होने दें! अभी पोर्टल खोलें और कम से कम एक 15-मिनट का क्विक मॉक टेस्ट हल करें।
      </p>
    </div>

    <div style="text-align: center; margin: 28px 0 18px 0;">
      <a href="${baseUrl}" class="btn">⚡ अभी दैनिक मॉक टेस्ट शुरू करें</a>
    </div>

    <div class="direct-link-box">
      🔗 <strong>सीधा पोर्टल लिंक:</strong><br>
      <a href="${baseUrl}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">${baseUrl}</a>
    </div>
  `;

  return {
    subject: `[Urgent Reminder] Incomplete Daily Practice for ${candidateName} - BPSC TRE 4.0`,
    html: baseEmailWrapper('दैनिक अभ्यास चेतावनी', content),
    portalUrl: baseUrl
  };
}

export function renderParentDailyInactivityEmail(studentName?: string, baseUrlOverride?: string): { subject: string; html: string } {
  const baseUrl = baseUrlOverride ? baseUrlOverride.replace(/\/+$/, '') : getAppBaseUrl();
  const candidateName = studentName || 'प्रिया पटेल';

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 19px; color: #0f172a;">👨‍👩‍👧 दैनिक अध्ययन सूचना: आज कोई टेस्ट नहीं दिया गया</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      यह आवश्यक सूचना <strong>${candidateName}</strong> की BPSC TRE 4.0 गणित तैयारी की दैनिक मॉनिटरिंग के संबंध में है।
    </p>

    <div class="alert-box alert-danger">
      <strong style="display: block; margin-bottom: 4px; font-size: 14px;">⚠️ [दैनिक स्थिति: आज शून्य टेस्ट]:</strong>
      आज शाम तक ${candidateName} द्वारा पोर्टल पर एक भी मॉक टेस्ट या गणित प्रैक्टिस सेट पूरा नहीं किया गया है।
    </div>

    <div class="card" style="border-left: 5px solid #f59e0b;">
      <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.7;">
        • गणित में उच्च कट-ऑफ पार करने के लिए प्रतिदिन कम से कम 30-40 प्रश्न हल करना अनिवार्य है।<br>
        • कृपया ${candidateName} को प्रेरित करें कि वे आज सोने से पूर्व पोर्टल पर कम से कम 15 प्रश्न अवश्य हल करें।
      </p>
    </div>

    <div style="text-align: center; margin: 26px 0 16px 0;">
      <a href="${baseUrl}" class="btn btn-secondary">🌐 छात्र की तैयारी स्थिति देखें</a>
    </div>

    <div class="direct-link-box">
      🔗 <strong>सीधा पोर्टल लिंक:</strong><br>
      <a href="${baseUrl}" style="color: #2563eb; text-decoration: underline;">${baseUrl}</a>
    </div>
  `;

  return {
    subject: `[Daily Alert] No Test Attempted Today by ${candidateName} - BPSC TRE 4.0`,
    html: baseEmailWrapper('अभिभावक दैनिक अध्ययन सूचना', content)
  };
}

// -------------------------------------------------------------
// 4. WEEKLY PERFORMANCE REPORT (हिंदी)
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
  const candidateName = stats.studentName || 'प्रिया पटेल';

  let strongList = stats.strongTopics.length
    ? stats.strongTopics
        .map((t) => `<li><strong>${t.topicLabelHindi || t.topicLabel}:</strong> ${t.accuracy}% एक्यूरेसी (${t.correct}/${t.total} सही)</li>`)
        .join('')
    : '<li>सभी अध्यायों में संतुलित अभ्यास जारी रखें।</li>';

  let weakList = stats.weakTopics.length
    ? stats.weakTopics
        .map((t) => `<li><strong>${t.topicLabelHindi || t.topicLabel}:</strong> ${t.accuracy}% एक्यूरेसी (${t.incorrect} गलतियां)</li>`)
        .join('')
    : '<li>इस सप्ताह कोई गंभीर कमजोर अध्याय नहीं पाया गया। बहुत अच्छा!</li>';

  const content = `
    <h2 style="margin: 0 0 6px 0; font-size: 21px; color: #0f172a;">📊 साप्ताहिक प्रदर्शन विश्लेषण (Weekly Digest)</h2>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">👤 <strong>${candidateName}</strong> के पिछले 7 दिनों के सभी मॉक टेस्ट का सारांश।</p>

    <div class="stat-grid">
      <div class="stat-box">
        <p class="stat-val" style="color: #0f172a;">${stats.totalAttempts}</p>
        <p class="stat-lbl">📝 कुल टेस्ट दिए</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: #0f172a;">${stats.totalQuestions}</p>
        <p class="stat-lbl">📚 हल किए गए प्रश्न</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: #16a34a;">${stats.averageAccuracy}%</p>
        <p class="stat-lbl">📈 औसत एक्यूरेसी</p>
      </div>
      <div class="stat-box">
        <p class="stat-val" style="color: #d97706;">${stats.averageScorePercentage}%</p>
        <p class="stat-lbl">🎯 औसत स्कोर %</p>
      </div>
    </div>

    <!-- Strong areas -->
    <div class="card" style="border-left: 5px solid #16a34a; margin-top: 22px;">
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #15803d;">💪 [मजबूत अध्याय - सराहनीय पकड़]:</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e293b; line-height: 1.7;">
        ${strongList}
      </ul>
    </div>

    <!-- Weak areas -->
    <div class="card" style="border-left: 5px solid #dc2626;">
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #b91c1c;">⚠️ [कमजोर अध्याय - तुरंत रिविजन आवश्यक]:</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e293b; line-height: 1.7;">
        ${weakList}
      </ul>
    </div>

    <div style="text-align: center; margin: 28px 0 18px 0;">
      <a href="${baseUrl}" class="btn">🚀 नया साप्ताहिक मॉक टेस्ट शुरू करें</a>
    </div>

    <div class="direct-link-box">
      🔗 <strong>सीधा पोर्टल लिंक:</strong><br>
      <a href="${baseUrl}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">${baseUrl}</a>
    </div>
  `;

  return {
    subject: `[Weekly Report] Performance Summary for ${candidateName} — Accuracy: ${stats.averageAccuracy}%`,
    html: baseEmailWrapper('साप्ताहिक प्रदर्शन रिपोर्ट', content)
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
  const candidateName = stats.studentName || 'प्रिया पटेल';

  const strongSummary = stats.strongTopics.map((t) => t.topicLabelHindi || t.topicLabel).slice(0, 3).join(', ') || 'गणित के आधारभूत अध्याय';
  const weakSummary = stats.weakTopics.map((t) => t.topicLabelHindi || t.topicLabel).slice(0, 3).join(', ') || 'कोई गंभीर कमजोरी नहीं';

  const content = `
    <h2 style="margin: 0 0 6px 0; font-size: 19px; color: #0f172a;">👨‍👩‍👧 ${candidateName} की साप्ताहिक अध्ययन प्रगति समीक्षा</h2>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">BPSC TRE 4.0 परीक्षा की साप्ताहिक प्रगति का आधिकारिक विवरण।</p>

    <div class="card" style="border-left: 5px solid #3b82f6; padding: 20px;">
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">📊 साप्ताहिक प्रदर्शन झलक:</div>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #334155; line-height: 1.7;">
        • 📝 कुल टेस्ट दिए: <strong>${stats.totalAttempts}</strong><br>
        • 📚 हल किए गए प्रश्न: <strong>${stats.totalQuestions}</strong><br>
        • 📈 औसत एक्यूरेसी: <strong>${stats.averageAccuracy}%</strong><br>
        • 🎯 औसत स्कोर: <strong>${stats.averageScorePercentage}%</strong>
      </p>
      <div style="margin-top: 14px; font-size: 13px; color: #1e293b; background-color: #f1f5f9; padding: 12px; border-radius: 8px;">
        💪 <strong>मजबूत विषय:</strong> ${strongSummary}<br>
        ⚠️ <strong>विशेष अभ्यास योग्य विषय:</strong> ${weakSummary}
      </div>
    </div>

    <div style="text-align: center; margin: 26px 0 16px 0;">
      <a href="${baseUrl}" class="btn btn-secondary">🌐 पोर्टल पर पूरा रिकॉर्ड देखें</a>
    </div>
  `;

  return {
    subject: `[Weekly Digest] Weekly Mathematics Progress for ${candidateName} - BPSC TRE 4.0`,
    html: baseEmailWrapper('अभिभावक साप्ताहिक रिपोर्ट', content)
  };
}

// -------------------------------------------------------------
// 5. SCHEDULED TEST REMINDERS (हिंदी)
// -------------------------------------------------------------
export function renderTestReminderEmail(
  test: { id: string; title: string; scheduledStartAt: string; totalQuestions: number; totalTimeMinutes: number },
  type: '2h' | 'soon',
  studentName?: string,
  baseUrlOverride?: string
): { subject: string; html: string; testUrl: string } {
  const baseUrl = baseUrlOverride ? baseUrlOverride.replace(/\/+$/, '') : getAppBaseUrl();
  const testUrl = `${baseUrl}/?testId=${encodeURIComponent(test.id)}`;
  const candidateName = studentName || 'प्रिया पटेल';
  const istTimeStr = new Date(test.scheduledStartAt).toLocaleTimeString('hi-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isSoon = type === 'soon';
  const heading = isSoon ? '⏰ [अत्यंत आवश्यक]: परीक्षा केवल 15 मिनट में शुरू हो रही है!' : '⏰ [स्मरण]: निर्धारित परीक्षा 2 घंटे में शुरू होगी';
  const badgeText = isSoon ? '⏳ 15 मिनट शेष' : '⏰ 2 घंटे शेष';

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 21px; color: #0f172a;">${heading}</h2>
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">प्रिय <strong>${candidateName}</strong>, आपका निर्धारित गणित मॉक टेस्ट प्रारंभ होने वाला है।</p>

    <div class="card" style="border-left: 5px solid #f59e0b;">
      <h3 style="margin: 0 0 6px 0; font-size: 18px; color: #0f172a;">📝 ${test.title}</h3>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b;">⏰ निर्धारित समय: <strong>${istTimeStr} (IST)</strong></p>
      
      <div style="font-size: 13px; color: #334155; line-height: 1.7;">
        • 📚 कुल प्रश्न: <strong>${test.totalQuestions}</strong> &nbsp;|&nbsp; ⏱️ समय: <strong>${test.totalTimeMinutes} मिनट</strong><br>
        • ⚠️ नेगेटिव मार्किंग: प्रत्येक गलत उत्तर पर <strong>0.33 अंक</strong> की कटौती होगी।<br>
        • 📝 कृपया तेजी से गणना के लिए रफ पेपर और पेन तैयार रखें।
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0 18px 0;">
      <a href="${testUrl}" class="btn">🚀 परीक्षा कक्ष में प्रवेश करें (Enter Test Room)</a>
    </div>

    <div class="direct-link-box">
      🔗 <strong>सीधा टेस्ट लिंक:</strong><br>
      <a href="${testUrl}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">${testUrl}</a>
    </div>
  `;

  const reminderBadge = isSoon ? '[Urgent 15m Reminder]' : '[Exam Reminder]';

  return {
    subject: `${reminderBadge} ${test.title} starts at ${istTimeStr} IST`,
    html: baseEmailWrapper('निर्धारित परीक्षा स्मरण', content),
    testUrl
  };
}

// -------------------------------------------------------------
// 6. DAILY MORNING PRACTICE REMINDER (हिंदी)
// -------------------------------------------------------------
export function renderMorningPracticeReminderEmail(
  studentName?: string,
  baseUrlOverride?: string
): { subject: string; html: string; portalUrl: string } {
  const baseUrl = baseUrlOverride ? baseUrlOverride.replace(/\/+$/, '') : getAppBaseUrl();
  const candidateName = studentName || 'प्रिया पटेल';

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 21px; color: #0f172a;">☀️ सुप्रभात! आज का गणित अभ्यास लक्ष्य तैयार है</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
      👤 <strong>अभ्यर्थी:</strong> ${candidateName} &nbsp;|&nbsp; 🎯 <strong>लक्ष्य:</strong> BPSC TRE 4.0 शिक्षक चयन परीक्षा
    </p>

    <div class="card" style="border-left: 5px solid #2563eb;">
      <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #1e3a8a;">📝 आज के पहले सत्र में कम से कम 20 प्रश्न हल करें:</h3>
      <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.7;">
        • परीक्षा में सफलता निरंतर दैनिक अभ्यास से मिलती है।<br>
        • पोर्टल पर 677+ प्रामाणिक प्रश्न और नए मॉक टेस्ट उपलब्ध हैं।<br>
        • -0.33 नेगेटिव मार्किंग से बचने के लिए Option (E) सेफ स्किप का अभ्यास करें।
      </p>
    </div>

    <div style="text-align: center; margin: 28px 0 18px 0;">
      <a href="${baseUrl}" class="btn">⚡ अभी सुबह का मॉक टेस्ट शुरू करें</a>
    </div>

    <div class="direct-link-box">
      🔗 <strong>सीधा पोर्टल लिंक:</strong><br>
      <a href="${baseUrl}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">${baseUrl}</a>
    </div>
  `;

  return {
    subject: `[Morning Practice Alert] Daily Mock Test Ready for ${candidateName} - BPSC TRE 4.0`,
    html: baseEmailWrapper('दैनिक सुबह का मॉक टेस्ट', content),
    portalUrl: baseUrl
  };
}

