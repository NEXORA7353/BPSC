import { MockTestSet, Question } from '../types';
import { renderMathToHtml } from './mathFormatter';

const DEFAULT_OPTION_E_TEXT = 'उपयुक्त में से कोई नहीं / उपयुक्त में से एक से अधिक';

export interface PrintPaperOmrOptions {
  includeSolutions?: boolean;
  bookletSeries?: 'A' | 'B' | 'C' | 'D';
}

/**
 * Generates an authentic BPSC TRE 4.0 printable Question Paper with
 * a 5-Option (A, B, C, D, E) OMR Answer Sheet and optional Answer Key.
 */
export function generateQuestionPaperWithOmrHtml(
  set: MockTestSet,
  options: PrintPaperOmrOptions = {}
): string {
  const { includeSolutions = true, bookletSeries = 'A' } = options;
  const questions: Question[] = set.questions || [];
  const totalQuestions = questions.length;
  const totalMarks = totalQuestions;
  const timeMinutes = set.totalTimeMinutes || Math.max(20, Math.round(totalQuestions * 1.25));

  // Category & topic information
  const topicCountsMap = new Map<string, number>();
  questions.forEach((q) => {
    const name = q.topicNameHindi || q.topicName || q.topic || 'गणित (Mathematics)';
    topicCountsMap.set(name, (topicCountsMap.get(name) || 0) + 1);
  });
  const topicListStr = Array.from(topicCountsMap.entries())
    .map(([name, count]) => `${name} (${count})`)
    .join(' • ');

  // Render questions HTML
  const renderedQuestionsHtml = questions
    .map((q, idx) => {
      const qNum = idx + 1;
      const qTopic = q.topicNameHindi || q.topicName || q.topic || '';
      const formattedQText = renderMathToHtml(q.questionText || '');

      // Ensure 5 options (A, B, C, D, E)
      const opts = [...(q.options || [])];
      const hasE = opts.some((o) => o.key.toLowerCase() === 'e');
      if (!hasE) {
        opts.push({
          key: 'e',
          text: DEFAULT_OPTION_E_TEXT
        });
      }

      // If less than 5 options, pad
      const letters: ('a' | 'b' | 'c' | 'd' | 'e')[] = ['a', 'b', 'c', 'd', 'e'];
      const finalOpts = letters.map((letter) => {
        const found = opts.find((o) => o.key.toLowerCase() === letter);
        if (found) return found;
        if (letter === 'e') return { key: 'e' as const, text: DEFAULT_OPTION_E_TEXT };
        return { key: letter, text: '-' };
      });

      const optionsHtml = finalOpts
        .map((opt) => {
          const upperKey = opt.key.toUpperCase();
          const formattedOptText = renderMathToHtml(opt.text);
          return `
            <div class="option-item">
              <span class="option-key">(${upperKey})</span>
              <span class="option-text">${formattedOptText}</span>
            </div>
          `;
        })
        .join('');

      const imageHtml = q.imageUrl
        ? `<div class="question-image-box"><img src="${q.imageUrl}" alt="Figure Q${qNum}" /></div>`
        : '';

      return `
        <div class="question-card" id="q-${qNum}">
          <div class="question-header">
            <span class="question-num">प्र. ${qNum}.</span>
            ${qTopic ? `<span class="question-topic-badge">${qTopic}</span>` : ''}
            <span class="question-marks">[1 अंक]</span>
          </div>
          <div class="question-body">
            ${formattedQText}
          </div>
          ${imageHtml}
          <div class="options-grid">
            ${optionsHtml}
          </div>
        </div>
      `;
    })
    .join('');

  // Render OMR Sheet Bubble Grid
  // Columns of 25 questions each for standard A4 layout
  const omrQuestionsPerCol = 25;
  const totalOmrCols = Math.ceil(totalQuestions / omrQuestionsPerCol);
  let omrColumnsHtml = '';

  for (let col = 0; col < totalOmrCols; col++) {
    const startQ = col * omrQuestionsPerCol;
    const endQ = Math.min(startQ + omrQuestionsPerCol, totalQuestions);

    let rowsHtml = '';
    for (let i = startQ; i < endQ; i++) {
      const qNum = i + 1;
      const isAlt = qNum % 2 === 0 ? 'alt-row' : '';
      rowsHtml += `
        <div class="omr-row ${isAlt}">
          <span class="omr-qnum">${String(qNum).padStart(2, '0')}</span>
          <div class="omr-bubbles">
            <span class="omr-bubble"><span class="omr-bubble-letter">A</span></span>
            <span class="omr-bubble"><span class="omr-bubble-letter">B</span></span>
            <span class="omr-bubble"><span class="omr-bubble-letter">C</span></span>
            <span class="omr-bubble"><span class="omr-bubble-letter">D</span></span>
            <span class="omr-bubble omr-bubble-e"><span class="omr-bubble-letter">E</span></span>
          </div>
        </div>
      `;
    }

    omrColumnsHtml += `
      <div class="omr-column">
        <div class="omr-col-header">
          <span class="col-header-q">Q.No.</span>
          <div class="col-header-options">
            <span>A</span>
            <span>B</span>
            <span>C</span>
            <span>D</span>
            <span class="text-amber-800">E</span>
          </div>
        </div>
        <div class="omr-col-body">
          ${rowsHtml}
        </div>
      </div>
    `;
  }

  // Answer Key & Solutions Section (Optional, page break before)
  let solutionsSectionHtml = '';
  if (includeSolutions) {
    const keyRows = questions
      .map((q, idx) => {
        const qNum = idx + 1;
        const correct = (q.correctOption || 'A').toUpperCase();
        const expl = renderMathToHtml(q.explanation || 'विवरण उपलब्ध नहीं है।');
        return `
          <div class="sol-item">
            <div class="sol-top">
              <span class="sol-num">प्रश्न ${qNum}</span>
              <span class="sol-ans">सही उत्तर: <strong>(${correct})</strong></span>
              ${q.topicNameHindi ? `<span class="sol-topic">${q.topicNameHindi}</span>` : ''}
            </div>
            <div class="sol-expl">
              <strong>व्याख्या:</strong> ${expl}
            </div>
          </div>
        `;
      })
      .join('');

    // Answer Key quick matrix
    const keyMatrixPills = questions
      .map((q, idx) => {
        const qNum = idx + 1;
        const correct = (q.correctOption || 'A').toUpperCase();
        return `<div class="key-pill"><span class="kp-num">${qNum}</span><span class="kp-ans">${correct}</span></div>`;
      })
      .join('');

    solutionsSectionHtml = `
      <div class="page-break"></div>
      <section class="solutions-section">
        <div class="section-title-banner">
          <h2>BPSC TRE 4.0 - उत्तर कुंजी एवं विस्तृत व्याख्या (Official Answer Key & Solutions)</h2>
          <p>${set.title} • कुल प्रश्न: ${totalQuestions} • शृंखला: ${bookletSeries}</p>
        </div>

        <div class="quick-key-box">
          <h3>त्वरित उत्तर कुंजी (Quick Answer Key)</h3>
          <div class="quick-key-grid">
            ${keyMatrixPills}
          </div>
        </div>

        <div class="detailed-solutions-list">
          <h3>विस्तृत हल व चरणबद्ध व्याख्या (Step-by-Step Hindi Explanations)</h3>
          ${keyRows}
        </div>
      </section>
    `;
  }

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BPSC TRE 4.0 - ${set.title} | Question Paper & OMR Sheet</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  
  <!-- KaTeX CSS for authentic vector math equations -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" crossorigin="anonymous">

  <style>
    /* CSS Variables & Reset */
    :root {
      --primary-navy: #0f172a;
      --bpsc-red: #991b1b;
      --bpsc-gold: #b45309;
      --slate-800: #1e293b;
      --slate-700: #334155;
      --slate-600: #475569;
      --slate-300: #cbd5e1;
      --slate-200: #e2e8f0;
      --slate-100: #f1f5f9;
      --slate-50: #f8fafc;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    body {
      font-family: 'Noto Sans Devanagari', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      line-height: 1.55;
      font-size: 13.5px;
    }

    /* Floating Print & Control Toolbar (Screen Only) */
    .screen-toolbar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    }
    .toolbar-title {
      display: flex;
      flex-direction: column;
    }
    .toolbar-title strong {
      font-size: 14px;
      color: #fbbf24;
      letter-spacing: 0.5px;
    }
    .toolbar-title span {
      font-size: 11px;
      color: #94a3b8;
    }
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-action {
      cursor: pointer;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 12.5px;
      font-weight: 700;
      font-family: inherit;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn-print {
      background: #d97706;
      color: #ffffff;
    }
    .btn-print:hover {
      background: #b45309;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: #334155;
      color: #e2e8f0;
    }
    .btn-secondary:hover {
      background: #475569;
    }

    /* Paper Page Container */
    .paper-sheet {
      max-width: 900px;
      margin: 24px auto;
      background: #ffffff;
      padding: 36px 42px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      border-radius: 4px;
      position: relative;
    }

    /* Page Breaks for Print */
    .page-break {
      page-break-before: always;
      break-before: page;
      clear: both;
      height: 0;
      margin: 0;
      padding: 0;
    }

    /* ================================================================
       1. QUESTION PAPER HEADER & INSTRUCTIONS
       ================================================================ */
    .bpsc-header {
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 18px;
      text-align: center;
    }
    .commission-name {
      font-size: 20px;
      font-weight: 800;
      color: #991b1b;
      letter-spacing: 0.5px;
    }
    .exam-name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }
    .test-title-sub {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-top: 2px;
    }

    .exam-meta-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      padding: 6px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
    }
    .meta-item {
      display: flex;
      gap: 4px;
    }
    .meta-item span.label {
      color: #64748b;
    }
    .meta-item span.val {
      color: #0f172a;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Candidate Particulars Form */
    .candidate-info-box {
      border: 1.5px solid #94a3b8;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 16px;
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr;
      gap: 12px;
      font-size: 11.5px;
    }
    .info-field {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .info-label {
      font-weight: 700;
      color: #475569;
    }
    .info-line {
      border-bottom: 1px dashed #64748b;
      height: 20px;
      width: 100%;
    }

    /* Instructions Box */
    .instructions-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 20px;
      font-size: 11px;
      line-height: 1.45;
      color: #78350f;
    }
    .instructions-box h4 {
      font-size: 12px;
      font-weight: 800;
      color: #92400e;
      margin-bottom: 4px;
    }
    .instructions-box ol {
      padding-left: 18px;
    }
    .instructions-box li {
      margin-bottom: 2px;
    }

    /* Questions Layout: 2 Columns for maximum space efficiency */
    .questions-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px 24px;
      column-rule: 1px solid #e2e8f0;
    }

    .question-card {
      break-inside: avoid;
      page-break-inside: avoid;
      padding-bottom: 14px;
      border-bottom: 1px dashed #cbd5e1;
    }
    .question-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }
    .question-num {
      font-size: 13.5px;
      font-weight: 800;
      color: #0f172a;
    }
    .question-topic-badge {
      font-size: 10px;
      font-weight: 600;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 1px 6px;
      border-radius: 4px;
      color: #475569;
    }
    .question-marks {
      margin-left: auto;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
    }
    .question-body {
      font-size: 13px;
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 8px;
      line-height: 1.5;
    }
    .question-body .katex {
      font-size: 1.05em;
    }
    .question-image-box {
      margin: 6px 0;
      text-align: center;
    }
    .question-image-box img {
      max-height: 140px;
      max-width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
    }

    .options-grid {
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding-left: 4px;
    }
    .option-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 12.5px;
    }
    .option-key {
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      color: #0f172a;
      flex-shrink: 0;
      min-width: 26px;
    }
    .option-text {
      color: #334155;
    }

    /* ================================================================
       2. AUTHENTIC BPSC 5-OPTION OMR ANSWER SHEET
       ================================================================ */
    .omr-sheet-wrapper {
      max-width: 900px;
      margin: 24px auto;
      background: #ffffff;
      padding: 28px 36px;
      border: 2px solid #0f172a;
      border-radius: 4px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      position: relative;
    }

    .omr-header-box {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .omr-header-box h1 {
      font-size: 18px;
      font-weight: 900;
      color: #991b1b;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .omr-header-box h2 {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 1px;
    }
    .omr-badge-strip {
      display: inline-block;
      margin-top: 4px;
      background: #0f172a;
      color: #ffffff;
      padding: 3px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    /* Top Grid: Booklet Series + Roll Number Bubble Matrix */
    .omr-top-controls {
      display: grid;
      grid-template-columns: 1fr 1.6fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
      border: 1.5px solid #0f172a;
      padding: 12px;
      background: #fafafa;
      border-radius: 4px;
    }
    .omr-control-card {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      padding: 8px 10px;
      border-radius: 4px;
      text-align: center;
    }
    .omr-control-card h5 {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
    }

    /* Booklet Series Selector */
    .series-bubbles {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 6px;
    }
    .series-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .series-letter {
      font-size: 11px;
      font-weight: 800;
    }
    .series-bubble {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1.5px solid #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 800;
    }
    .series-bubble.selected {
      background: #0f172a;
      color: #ffffff;
    }

    /* Roll Number Grid Mockup */
    .roll-grid {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin-top: 4px;
    }
    .roll-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .roll-digit-box {
      width: 18px;
      height: 18px;
      border: 1px solid #0f172a;
      margin-bottom: 3px;
    }
    .roll-bubble {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid #64748b;
      font-size: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #475569;
    }

    /* Important Filling Instructions */
    .omr-notice-box {
      font-size: 10.5px;
      color: #334155;
      line-height: 1.4;
      text-align: left;
    }
    .omr-notice-box strong {
      color: #991b1b;
    }

    /* Main OMR Bubble Grid (Columns) */
    .omr-grid-container {
      display: grid;
      grid-template-columns: repeat(${Math.min(totalOmrCols, 4)}, 1fr);
      gap: 12px;
      border: 1.5px solid #0f172a;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    .omr-column {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      background: #ffffff;
      overflow: hidden;
    }
    .omr-col-header {
      background: #0f172a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 8px;
      font-size: 10px;
      font-weight: 800;
    }
    .col-header-q {
      width: 28px;
    }
    .col-header-options {
      display: flex;
      gap: 9px;
      padding-right: 2px;
    }
    .col-header-options span {
      width: 17px;
      text-align: center;
    }
    .col-header-options span.text-amber-800 {
      color: #fde047;
    }

    .omr-col-body {
      display: flex;
      flex-direction: column;
    }
    .omr-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 3.5px 8px;
      border-bottom: 1px solid #f1f5f9;
    }
    .omr-row.alt-row {
      background: #f8fafc;
    }
    .omr-qnum {
      font-size: 10.5px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      color: #0f172a;
      width: 28px;
    }
    .omr-bubbles {
      display: flex;
      gap: 9px;
      align-items: center;
    }
    .omr-bubble {
      width: 17px;
      height: 17px;
      border-radius: 50%;
      border: 1.3px solid #0f172a;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
    }
    .omr-bubble-letter {
      font-size: 8.5px;
      font-weight: 800;
      color: #0f172a;
      font-family: 'JetBrains Mono', monospace;
      line-height: 1;
    }
    .omr-bubble-e {
      border-color: #b45309;
    }
    .omr-bubble-e .omr-bubble-letter {
      color: #b45309;
    }

    /* Bottom Signatures Box */
    .omr-signatures-box {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1.5px solid #0f172a;
    }
    .sig-field {
      border: 1px dashed #64748b;
      height: 60px;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      padding: 4px;
      background: #fafafa;
    }
    .sig-field span {
      font-size: 10px;
      font-weight: 700;
      color: #475569;
    }

    /* ================================================================
       3. SOLUTIONS & ANSWER KEY SECTION
       ================================================================ */
    .solutions-section {
      max-width: 900px;
      margin: 24px auto;
      background: #ffffff;
      padding: 32px 38px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      border-radius: 4px;
    }
    .section-title-banner {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .section-title-banner h2 {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
    .section-title-banner p {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }

    .quick-key-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 20px;
    }
    .quick-key-box h3 {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .quick-key-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .key-pill {
      display: inline-flex;
      align-items: center;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      border-radius: 4px;
      overflow: hidden;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
    }
    .kp-num {
      padding: 2px 5px;
      background: #e2e8f0;
      font-weight: 700;
      color: #334155;
    }
    .kp-ans {
      padding: 2px 7px;
      font-weight: 800;
      color: #0f172a;
    }

    .detailed-solutions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .detailed-solutions-list h3 {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .sol-item {
      break-inside: avoid;
      page-break-inside: avoid;
      border: 1px solid #e2e8f0;
      border-left: 3px solid #d97706;
      border-radius: 4px;
      padding: 10px 14px;
      background: #fafafa;
    }
    .sol-top {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .sol-num {
      font-weight: 800;
      color: #0f172a;
      font-size: 12px;
    }
    .sol-ans {
      font-weight: 700;
      color: #15803d;
      font-size: 12px;
    }
    .sol-topic {
      font-size: 10px;
      color: #64748b;
      margin-left: auto;
      background: #e2e8f0;
      padding: 1px 6px;
      border-radius: 3px;
    }
    .sol-expl {
      font-size: 12.5px;
      color: #334155;
      line-height: 1.5;
    }
    .sol-expl .katex {
      font-size: 1.05em;
    }

    /* ================================================================
       4. STRICT PRINT STYLES FOR PDF / PRINT
       ================================================================ */
    @media print {
      @page {
        size: A4;
        margin: 12mm 12mm 12mm 12mm;
      }
      body {
        background: #ffffff !important;
        color: #000000 !important;
        font-size: 12px !important;
      }
      .screen-toolbar {
        display: none !important;
      }
      .paper-sheet,
      .omr-sheet-wrapper,
      .solutions-section {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
      .page-break {
        page-break-before: always !important;
        break-before: page !important;
      }
      .question-card {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .sol-item {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .omr-grid-container {
        border-color: #000000 !important;
      }
      .omr-bubble {
        border-color: #000000 !important;
      }
    }
  </style>
</head>
<body>

  <!-- Floating Screen Toolbar -->
  <div class="screen-toolbar">
    <div class="toolbar-title">
      <strong>BPSC TRE 4.0 • प्रश्न पत्र एवं 5-विकल्प OMR शीट</strong>
      <span>${set.title} • ${totalQuestions} प्रश्न • ${timeMinutes} मिनट</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn-action btn-secondary" onclick="window.close()">
        ✕ बंद करें (Close)
      </button>
      <button class="btn-action btn-print" onclick="window.print()">
        🖨️ PDF सेव करें / प्रिंट करें (Print / Save PDF)
      </button>
    </div>
  </div>

  <!-- SECTION 1: QUESTION PAPER BOOKLET -->
  <main class="paper-sheet">
    <header class="bpsc-header">
      <div class="commission-name">बिहार लोक सेवा आयोग, पटना (BPSC)</div>
      <div class="exam-name">BPSC TRE 4.0 विद्यालय अध्यापक नियुक्ति प्रतियोगिता परीक्षा</div>
      <div class="test-title-sub">${set.title} • विषय: गणित (Mathematics)</div>
      
      <div class="exam-meta-strip">
        <div class="meta-item"><span class="label">पुस्तिका शृंखला:</span> <span class="val">${bookletSeries}</span></div>
        <div class="meta-item"><span class="label">समय:</span> <span class="val">${timeMinutes} मिनट</span></div>
        <div class="meta-item"><span class="label">पूर्णांक:</span> <span class="val">${totalMarks}</span></div>
        <div class="meta-item"><span class="label">कुल प्रश्न:</span> <span class="val">${totalQuestions}</span></div>
        <div class="meta-item"><span class="label">ऋणात्मक अंकन:</span> <span class="val">BPSC नियमानुसार</span></div>
      </div>
    </header>

    <!-- Candidate Particulars Box -->
    <div class="candidate-info-box">
      <div class="info-field">
        <span class="info-label">परीक्षार्थी का नाम (Candidate's Name):</span>
        <div class="info-line"></div>
      </div>
      <div class="info-field">
        <span class="info-label">अनुक्रमांक (Roll Number):</span>
        <div class="info-line"></div>
      </div>
      <div class="info-field">
        <span class="info-label">परीक्षा केंद्र (Examination Center):</span>
        <div class="info-line"></div>
      </div>
    </div>

    <!-- Instructions Box -->
    <div class="instructions-box">
      <h4>महत्वपूर्ण निर्देश (Important Instructions for Candidates):</h4>
      <ol>
        <li>इस प्रश्न पुस्तिका में कुल <strong>${totalQuestions}</strong> बहुविकल्पीय प्रश्न हैं। प्रत्येक प्रश्न <strong>1 अंक</strong> का है।</li>
        <li>प्रत्येक प्रश्न के <strong>पाँच विकल्प (A), (B), (C), (D) एवं (E)</strong> दिए गए हैं। सही विकल्प का चयन कर OMR शीट में भरें।</li>
        <li>विकल्प <strong>(E)</strong> 'उपयुक्त में से कोई नहीं / उपयुक्त में से एक से अधिक' (None / More than one) हेतु निर्धारित है।</li>
        <li>उत्तर अंकित करने के लिए केवल <strong>नीले अथवा काले बॉल पॉइंट पेन</strong> का ही प्रयोग करें। जेल पेन या पेंसिल का प्रयोग वर्जित है।</li>
      </ol>
    </div>

    <!-- Questions 2-Column Grid -->
    <div class="questions-container">
      ${renderedQuestionsHtml}
    </div>
  </main>

  <!-- PAGE BREAK BEFORE OMR SHEET -->
  <div class="page-break"></div>

  <!-- SECTION 2: OFFICIAL 5-OPTION BPSC OMR ANSWER SHEET -->
  <section class="omr-sheet-wrapper">
    <div class="omr-header-box">
      <h1>BIHAR PUBLIC SERVICE COMMISSION (BPSC)</h1>
      <h2>BPSC TRE 4.0 - OMR ANSWER SHEET (ओ.एम.आर. उत्तर पत्रक)</h2>
      <div class="omr-badge-strip">5 OPTIONS (A, B, C, D, E) OFFICIAL FORMAT</div>
    </div>

    <!-- Top Metadata: Series + Roll + Instructions -->
    <div class="omr-top-controls">
      <!-- Booklet Series -->
      <div class="omr-control-card">
        <h5>Test Booklet Series / शृंखला</h5>
        <div class="series-bubbles">
          ${['A', 'B', 'C', 'D']
            .map(
              (s) => `
            <div class="series-item">
              <span class="series-letter">${s}</span>
              <div class="series-bubble ${s === bookletSeries ? 'selected' : ''}">${s}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Roll Number Bubble Box -->
      <div class="omr-control-card">
        <h5>Candidate Roll Number / अनुक्रमांक</h5>
        <div class="roll-grid">
          ${[1, 2, 3, 4, 5, 6]
            .map(
              () => `
            <div class="roll-col">
              <div class="roll-digit-box"></div>
              ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                .map((d) => `<div class="roll-bubble">${d}</div>`)
                .join('')}
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- OMR Instructions Notice -->
      <div class="omr-control-card omr-notice-box">
        <h5>महत्वपूर्ण नियम</h5>
        <p>• केवल <strong>नीले/काले बॉल पेन</strong> से गोले को पूर्ण रूप से भरें।</p>
        <p>• सही तरीका: <strong>[ ● ]</strong></p>
        <p>• गलत तरीका: <strong>[ ✕ ] [ ✔ ] [ ◐ ]</strong></p>
        <p>• प्रत्येक प्रश्न में <strong>(A) से (E)</strong> तक 5 विकल्प हैं।</p>
      </div>
    </div>

    <!-- Main OMR Bubbles Grid -->
    <div class="omr-grid-container">
      ${omrColumnsHtml}
    </div>

    <!-- Signatures Section -->
    <div class="omr-signatures-box">
      <div class="sig-field">
        <span>परीक्षार्थी का हस्ताक्षर (हिन्दी में)</span>
      </div>
      <div class="sig-field">
        <span>Candidate's Signature (in English)</span>
      </div>
      <div class="sig-field">
        <span>वीक्षक का हस्ताक्षर (Invigilator's Sign)</span>
      </div>
    </div>
  </section>

  <!-- SECTION 3: ANSWER KEY & DETAILED SOLUTIONS (OPTIONAL) -->
  ${solutionsSectionHtml}

  <script>
    // Automatically focus window and prompt print if desired
    window.addEventListener('load', () => {
      // Delay slightly for KaTeX font glyph rendering
      setTimeout(() => {
        // Ready for clean vector print
      }, 300);
    });
  </script>
</body>
</html>
  `;
}

/**
 * Triggers the print / PDF dialog for the question paper with 5-option OMR sheet.
 */
export function printQuestionPaperWithOmr(
  set: MockTestSet,
  options: PrintPaperOmrOptions = {}
): void {
  const html = generateQuestionPaperWithOmrHtml(set, options);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('पॉप-अप ब्लॉक हो गया है! कृपया ब्राउज़र सेटिंग्स में पॉप-अप की अनुमति दें।');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
