import { MockTestSet } from '../types';

/**
 * Super-Clean Professional BPSC Printable Exam Paper & OMR Sheet Exporter
 */
export function exportTestToPrintablePdf(testSet: MockTestSet): void {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Please allow popups to generate the printable PDF exam paper.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>${testSet.title} - BPSC TRE 4.0 Printable Exam Paper</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&family=Inter:wght@400;600;800&display=swap');
    
    @page {
      size: A4;
      margin: 15mm;
    }
    
    body {
      font-family: 'Tiro Devanagari Hindi', 'Inter', sans-serif;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 13px;
      line-height: 1.6;
    }

    .no-print-bar {
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Inter', sans-serif;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    
    .btn-print {
      background: #f59e0b;
      color: #0f172a;
      border: none;
      padding: 8px 18px;
      font-weight: 800;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
    }

    @media print {
      .no-print-bar { display: none !important; }
      body { padding: 0; }
      .page-break { page-break-before: always; }
    }

    .header-box {
      border: 2px solid #000;
      padding: 14px;
      text-align: center;
      margin-bottom: 20px;
      background: #fafafa;
    }

    .header-title {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .header-subtitle {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 12px;
    }

    .meta-table td {
      border: 1px solid #000;
      padding: 6px 10px;
      text-align: left;
    }

    .instructions {
      border: 1px solid #6b7280;
      padding: 10px 14px;
      font-size: 11px;
      margin-bottom: 20px;
      background: #f9fafb;
    }

    .instructions ol {
      margin: 4px 0 0 18px;
      padding: 0;
    }

    .questions-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .question-card {
      border-bottom: 1px dashed #d1d5db;
      padding-bottom: 12px;
      page-break-inside: avoid;
    }

    .question-header {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px 12px;
      margin-top: 6px;
      font-size: 12.5px;
    }

    .option-item {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .option-key {
      font-weight: 700;
    }

    /* OMR Sheet Styles */
    .omr-section {
      margin-top: 30px;
      page-break-before: always;
    }

    .omr-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 15px;
    }

    .omr-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      border: 1px solid #e5e7eb;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .omr-bubble {
      width: 16px;
      height: 16px;
      border: 1.5px solid #374151;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 800;
    }

    /* Answer Key Table */
    .answer-key-section {
      margin-top: 30px;
      page-break-before: always;
    }

    .key-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 10px;
    }

    .key-table th, .key-table td {
      border: 1px solid #374151;
      padding: 6px 8px;
      text-align: center;
    }

    .key-table th {
      background: #f3f4f6;
    }

    .explanation-card {
      border: 1px solid #e5e7eb;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 10px;
      background: #fafafa;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <div>
      <strong>BPSC TRE 4.0 Printable Exam Generator</strong> — ${testSet.title}
    </div>
    <button class="btn-print" onclick="window.print()">🖨️ Print Exam Paper (PDF)</button>
  </div>

  <div style="padding: 10px 0;">
    <!-- HEADER -->
    <div class="header-box">
      <div class="header-title">बिहार लोक सेवा आयोग (BPSC)</div>
      <div class="header-subtitle">TRE 4.0 विद्यालय अध्यापक प्रतियोगिता परीक्षा - गणित (Mathematics)</div>
      <div style="font-weight:700; font-size:14px; margin-top:4px;">${testSet.title}</div>

      <table class="meta-table">
        <tr>
          <td><strong>अनुक्रमांक (Roll No.):</strong> ____________________</td>
          <td><strong>समय (Time):</strong> ${testSet.totalTimeMinutes} मिनट</td>
        </tr>
        <tr>
          <td><strong>परीक्षार्थी का नाम:</strong> ____________________</td>
          <td><strong>कुल पूर्णांक (Max Marks):</strong> ${testSet.totalQuestions}</td>
        </tr>
      </table>
    </div>

    <!-- INSTRUCTIONS -->
    <div class="instructions">
      <strong>महत्वपूर्ण निर्देश (Important Instructions):</strong>
      <ol>
        <li>इस प्रश्न-पुस्तिका में कुल <strong>${testSet.totalQuestions}</strong> प्रश्न हैं। सभी प्रश्न अनिवार्य हैं।</li>
        <li>प्रत्येक प्रश्न के लिए 5 विकल्प - (a), (b), (c), (d), (e) दिए गए हैं।</li>
        <li>ऋणात्मक अंकन (Negative Marking): प्रत्येक गलत उत्तर के लिए <strong>0.33 अंक</strong> काटे जाएंगे।</li>
        <li>विकल्प (e) "उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक" सुरक्षित विकल्प है।</li>
      </ol>
    </div>

    <!-- QUESTIONS LIST -->
    <div class="questions-container">
      ${testSet.questions
        .map(
          (q, idx) => `
        <div class="question-card">
          <div class="question-header">
            प्रश्न ${idx + 1}. ${q.questionText}
          </div>
          <div class="options-grid">
            ${q.options
              .map(
                (opt) => `
              <div class="option-item">
                <span class="option-key">(${opt.key.toLowerCase()})</span>
                <span>${opt.text}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
        )
        .join('')}
    </div>

    <!-- OMR SHEET PAGE -->
    <div class="omr-section">
      <div class="header-box" style="margin-bottom:10px;">
        <div class="header-title" style="font-size:15px;">OFFICIAL BPSC 5-OPTION OMR RESPONSE SHEET</div>
        <div style="font-size:11px;">बॉल पेन से सही गोले को पूरी तरह काला करें (Use Black/Blue Ballpoint Pen Only)</div>
      </div>

      <div class="omr-grid">
        ${testSet.questions
          .map(
            (_, idx) => `
          <div class="omr-row">
            <strong style="width:24px;">Q${idx + 1}.</strong>
            <span class="omr-bubble">A</span>
            <span class="omr-bubble">B</span>
            <span class="omr-bubble">C</span>
            <span class="omr-bubble">D</span>
            <span class="omr-bubble">E</span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>

    <!-- ANSWER KEY & EXPLANATIONS -->
    <div class="answer-key-section">
      <h3 style="border-bottom:2px solid #000; padding-bottom:4px;">उत्तर कुंजी (Official Answer Key & Explanations)</h3>

      <table class="key-table">
        <thead>
          <tr>
            <th>Q.No</th>
            <th>Correct Ans</th>
            <th>Topic</th>
            <th>Exam Reference</th>
          </tr>
        </thead>
        <tbody>
          ${testSet.questions
            .map(
              (q, idx) => `
            <tr>
              <td><strong>Q${idx + 1}</strong></td>
              <td><strong style="text-transform:uppercase; color:#059669;">(${q.correctOption})</strong></td>
              <td>${q.topicNameHindi || 'सामान्य गणित'}</td>
              <td>${q.exam || 'BPSC TRE 4.0'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <h4 style="margin-top:20px;">चरणबद्ध व्याख्या (Detailed Solutions):</h4>
      ${testSet.questions
        .map(
          (q, idx) => `
        <div class="explanation-card">
          <strong>प्रश्न ${idx + 1}. (उत्तर: ${q.correctOption.toUpperCase()})</strong>
          <div style="margin-top:4px; font-size:12px;">${q.explanation || 'सही उत्तर ' + q.correctOption.toUpperCase() + ' है।'}</div>
        </div>
      `
        )
        .join('')}
    </div>

  </div>

</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
