import { MockTestSet } from '../types';

export function generateStandaloneHtml(set: MockTestSet): string {
  const jsonQuestions = JSON.stringify(set.questions).replace(/<\/script>/g, '<\\/script>');
  const setTitle = set.title;
  const setSubtitle = set.subtitle;
  const totalQ = set.questions.length;
  const totalMin = set.totalTimeMinutes;

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BPSC TRE 4.0 - ${setTitle} | गणित (Mathematics)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-dark: #172554;
      --secondary: #0284c7;
      --accent: #d97706;
      --success: #15803d;
      --danger: #b91c1c;
      --review: #7e22ce;
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-300: #cbd5e1;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-800: #1e293b;
      --slate-900: #0f172a;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    body {
      font-family: 'Noto Sans Devanagari', 'Plus Jakarta Sans', system-ui, sans-serif;
      background-color: var(--slate-100);
      color: var(--slate-900);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header.exam-header {
      background: #ffffff;
      border-bottom: 2px solid var(--slate-200);
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .brand-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--primary-dark);
      letter-spacing: -0.01em;
    }
    .brand-sub {
      font-size: 0.8rem;
      color: var(--slate-600);
      margin-top: 2px;
    }
    .timer-badge {
      display: flex;
      align-items: center;
      gap: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .time-box {
      background: var(--slate-50);
      border: 1px solid var(--slate-300);
      padding: 6px 12px;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .time-label {
      font-size: 0.68rem;
      color: var(--slate-600);
      text-transform: uppercase;
      font-family: 'Noto Sans Devanagari', sans-serif;
    }
    .time-value {
      color: var(--danger);
      font-size: 1.1rem;
      font-weight: 700;
    }
    .q-time-value {
      color: var(--primary);
      font-size: 0.95rem;
    }
    main.cbt-container {
      display: flex;
      flex: 1;
      height: calc(100vh - 72px);
      overflow: hidden;
    }
    @media (max-width: 900px) {
      main.cbt-container {
        flex-direction: column;
        height: auto;
        overflow: visible;
      }
    }
    .question-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-right: 1px solid var(--slate-200);
      overflow-y: auto;
      padding: 24px;
    }
    .palette-pane {
      width: 340px;
      background: var(--slate-50);
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--slate-200);
      overflow-y: auto;
    }
    @media (max-width: 900px) {
      .palette-pane {
        width: 100%;
        border-left: none;
        border-top: 1px solid var(--slate-200);
      }
    }
    .q-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--slate-200);
      margin-bottom: 16px;
    }
    .q-num {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--slate-800);
    }
    .marks-info {
      font-size: 0.8rem;
      color: var(--slate-600);
    }
    .marks-pos { color: var(--success); font-weight: 600; }
    .marks-neg { color: var(--danger); font-weight: 600; }
    .exam-tag {
      display: inline-block;
      font-size: 0.75rem;
      color: var(--primary);
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 3px 8px;
      border-radius: 4px;
      margin-bottom: 14px;
      font-weight: 500;
    }
    .topic-tag {
      display: inline-block;
      font-size: 0.75rem;
      color: var(--slate-700);
      background: var(--slate-100);
      border: 1px solid var(--slate-300);
      padding: 3px 8px;
      border-radius: 4px;
      margin-bottom: 14px;
      margin-left: 6px;
    }
    .q-text {
      font-size: 1.1rem;
      line-height: 1.65;
      font-weight: 500;
      color: var(--slate-900);
      margin-bottom: 24px;
      white-space: pre-wrap;
    }
    .options-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 30px;
    }
    .option-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border: 1.5px solid var(--slate-200);
      border-radius: 8px;
      background: #ffffff;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .option-item:hover {
      border-color: var(--primary);
      background: #f8fafc;
    }
    .option-item.selected {
      border-color: var(--primary);
      background: #eff6ff;
    }
    .option-item.e-option {
      border-style: dashed;
    }
    .option-item.e-option.selected {
      border-color: #64748b;
      background: #f1f5f9;
    }
    .option-radio {
      margin-top: 3px;
      cursor: pointer;
      accent-color: var(--primary);
      width: 18px;
      height: 18px;
    }
    .option-key {
      font-weight: 700;
      color: var(--slate-700);
      min-width: 24px;
    }
    .option-text {
      font-size: 1rem;
      color: var(--slate-800);
      line-height: 1.45;
    }
    .rule-alert {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-left: 4px solid var(--accent);
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 0.8rem;
      color: #92400e;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .q-actions {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid var(--slate-200);
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn {
      padding: 8px 16px;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }
    .btn-secondary {
      background: #ffffff;
      border-color: var(--slate-300);
      color: var(--slate-700);
    }
    .btn-secondary:hover {
      background: var(--slate-100);
    }
    .btn-review {
      background: #f3e8ff;
      border-color: #d8b4fe;
      color: #6b21a8;
    }
    .btn-review:hover {
      background: #e9d5ff;
    }
    .btn-primary {
      background: var(--primary);
      color: #ffffff;
    }
    .btn-primary:hover {
      background: var(--primary-dark);
    }
    .btn-submit {
      background: var(--success);
      color: #ffffff;
      width: 100%;
      padding: 12px;
      font-size: 1rem;
    }
    .btn-submit:hover {
      background: #14532d;
    }
    /* Palette styles */
    .palette-header {
      padding: 16px;
      border-bottom: 1px solid var(--slate-200);
      background: #ffffff;
    }
    .palette-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--slate-800);
      margin-bottom: 12px;
    }
    .legend-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      font-size: 0.75rem;
      color: var(--slate-700);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge-icon {
      width: 22px;
      height: 22px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 700;
      color: #ffffff;
      font-family: 'JetBrains Mono', monospace;
    }
    .badge-ans { background: var(--success); }
    .badge-not-ans { background: var(--danger); }
    .badge-review { background: var(--review); }
    .badge-ans-rev { background: var(--review); position: relative; }
    .badge-not-visit { background: #e2e8f0; color: #475569; }
    .palette-body {
      padding: 16px;
      flex: 1;
    }
    .palette-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .q-btn {
      aspect-ratio: 1;
      border: 1px solid var(--slate-300);
      border-radius: 6px;
      background: #ffffff;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
    }
    .q-btn.active {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }
    .q-btn.status-answered {
      background: var(--success);
      color: #ffffff;
      border-color: var(--success);
    }
    .q-btn.status-not_answered {
      background: var(--danger);
      color: #ffffff;
      border-color: var(--danger);
    }
    .q-btn.status-marked_review {
      background: var(--review);
      color: #ffffff;
      border-color: var(--review);
    }
    .q-btn.status-answered_marked_review {
      background: var(--review);
      color: #ffffff;
      border-color: var(--review);
      position: relative;
    }
    .q-btn.status-answered_marked_review::after {
      content: '';
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 6px;
      height: 6px;
      background: #22c55e;
      border-radius: 50%;
    }
    .palette-footer {
      padding: 16px;
      background: #ffffff;
      border-top: 1px solid var(--slate-200);
    }
    /* Results View */
    #results-view {
      display: none;
      padding: 28px 20px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    .score-card {
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      margin-bottom: 28px;
    }
    .score-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-top: 20px;
    }
    .stat-box {
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      padding: 16px;
      border-radius: 8px;
    }
    .stat-num {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--slate-900);
      font-family: 'JetBrains Mono', monospace;
    }
    .stat-title {
      font-size: 0.8rem;
      color: var(--slate-600);
      margin-top: 4px;
    }
    .solutions-section {
      margin-top: 30px;
    }
    .sol-card {
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .sol-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .sol-correct { background: #dcfce7; color: #15803d; }
    .sol-wrong { background: #fee2e2; color: #b91c1c; }
    .sol-skip { background: #f1f5f9; color: #475569; }
    .sol-penalty { background: #ffedd5; color: #c2410c; }
    .sol-exp-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px;
      margin-top: 14px;
      font-size: 0.92rem;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .time-table-wrap {
      overflow-x: auto;
      margin-top: 16px;
    }
    table.time-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    table.time-table th, table.time-table td {
      border: 1px solid var(--slate-200);
      padding: 8px 12px;
      text-align: left;
    }
    table.time-table th {
      background: var(--slate-100);
      font-weight: 600;
    }
    .modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal.active { display: flex; }
    .modal-content {
      background: #ffffff;
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
      padding: 24px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>

  <!-- Test CBT Header -->
  <header class="exam-header" id="test-header">
    <div>
      <div class="brand-title">BPSC TRE 4.0 | गणित (Mathematics) - ${setTitle}</div>
      <div class="brand-sub">${setSubtitle} · कुल प्रश्न: ${totalQ} · समय: ${totalMin} मिनट</div>
    </div>
    <div class="timer-badge">
      <div class="time-box">
        <span class="time-label">इस प्रश्न का समय</span>
        <span class="time-value q-time-value" id="q-timer">00:00</span>
      </div>
      <div class="time-box">
        <span class="time-label">कुल शेष समय</span>
        <span class="time-value" id="total-timer">${totalMin}:00</span>
      </div>
    </div>
  </header>

  <!-- CBT Main Area -->
  <main class="cbt-container" id="cbt-view">
    <!-- Left Question Pane -->
    <section class="question-pane">
      <div class="q-top-bar">
        <div class="q-num" id="q-number-display">प्रश्न 1 / ${totalQ}</div>
        <div class="marks-info">
          अंक: <span class="marks-pos">+1.00</span> | नकारात्मक: <span class="marks-neg">-0.33</span>
        </div>
      </div>

      <div>
        <span class="exam-tag" id="q-exam-source">Exam Source</span>
        <span class="topic-tag" id="q-topic-name">Topic</span>
      </div>

      <div class="rule-alert">
        <strong>BPSC TRE 4.0 महत्वपूर्ण नियम:</strong> यदि आप किसी प्रश्न का उत्तर नहीं देना चाहते हैं, तो अनिवार्य रूप से <strong>विकल्प (E)</strong> चुनें। A/B/C/D/E में से कोई भी विकल्प नहीं चुनने पर <strong>-1/3 अंक</strong> का दंड (नेगेटिव मार्किंग) काटा जाएगा।
      </div>

      <div class="q-text" id="q-text-display">Question text goes here...</div>

      <div class="options-list" id="options-container">
        <!-- Rendered via JS -->
      </div>

      <div class="q-actions">
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary" id="btn-prev" onclick="goToPrev()">पिछला (Previous)</button>
          <button class="btn btn-secondary" id="btn-clear" onclick="clearCurrentResponse()">प्रतिक्रिया साफ़ करें</button>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-review" id="btn-review" onclick="markForReviewAndNext()">समीक्षा हेतु चिह्नित करें एवं अगला</button>
          <button class="btn btn-primary" id="btn-save-next" onclick="saveAndNext()">सहेजें एवं अगला (Save & Next)</button>
        </div>
      </div>
    </section>

    <!-- Right Question Palette Pane -->
    <aside class="palette-pane">
      <div class="palette-header">
        <div class="palette-title">प्रश्न स्थिति (Question Palette)</div>
        <div class="legend-grid">
          <div class="legend-item"><span class="badge-icon badge-ans" id="leg-ans">0</span> उत्तर दिया</div>
          <div class="legend-item"><span class="badge-icon badge-not-ans" id="leg-not-ans">0</span> उत्तर नहीं दिया</div>
          <div class="legend-item"><span class="badge-icon badge-review" id="leg-rev">0</span> समीक्षा हेतु</div>
          <div class="legend-item"><span class="badge-icon badge-ans-rev" id="leg-ans-rev">0</span> उत्तरित व समीक्षा</div>
          <div class="legend-item"><span class="badge-icon badge-not-visit" id="leg-not-vis">${totalQ}</span> नहीं देखा</div>
        </div>
      </div>

      <div class="palette-body">
        <div class="palette-grid" id="palette-buttons">
          <!-- 1..N buttons rendered via JS -->
        </div>
      </div>

      <div class="palette-footer">
        <button class="btn btn-submit" onclick="promptSubmit()">परीक्षा समाप्त करें (Submit Test)</button>
      </div>
    </aside>
  </main>

  <!-- Submit Confirmation Modal -->
  <div class="modal" id="submit-modal">
    <div class="modal-content">
      <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 12px; color: var(--slate-900);">क्या आप परीक्षा जमा करना चाहते हैं?</h3>
      <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">
        कृपया अपनी उत्तर स्थिति की समीक्षा करें:
      </p>
      <div id="modal-summary-text" style="font-size: 0.85rem; line-height: 1.8; margin-bottom: 20px; background: var(--slate-50); padding: 12px; border-radius: 6px;">
        <!-- Filled by JS -->
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary" onclick="closeSubmitModal()">वापस जाएँ (Resume)</button>
        <button class="btn btn-submit" style="width: auto; padding: 8px 20px;" onclick="confirmSubmit()">हाँ, जमा करें (Confirm Submit)</button>
      </div>
    </div>
  </div>

  <!-- Results Section -->
  <section id="results-view">
    <div class="score-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700; color: var(--primary);">परीक्षा परिणाम एवं विस्तृत विश्लेषण</h2>
          <p style="font-size: 0.85rem; color: var(--slate-600); margin-top: 4px;">BPSC TRE 4.0 गणित - ${setTitle}</p>
        </div>
        <button class="btn btn-primary" onclick="restartTest()">पुनः परीक्षा दें (Re-test)</button>
      </div>

      <div class="score-grid">
        <div class="stat-box">
          <div class="stat-num" id="res-score">0.00</div>
          <div class="stat-title">प्राप्तांक (कुल पूर्णांक: ${totalQ})</div>
        </div>
        <div class="stat-box">
          <div class="stat-num" id="res-accuracy">0%</div>
          <div class="stat-title">सटीकता (Accuracy %)</div>
        </div>
        <div class="stat-box">
          <div class="stat-num" style="color: var(--success);" id="res-correct">0</div>
          <div class="stat-title">सही उत्तर (+1 अंक)</div>
        </div>
        <div class="stat-box">
          <div class="stat-num" style="color: var(--danger);" id="res-incorrect">0</div>
          <div class="stat-title">गलत उत्तर (-1/3 दंड)</div>
        </div>
        <div class="stat-box">
          <div class="stat-num" style="color: var(--slate-600);" id="res-safe-skip">0</div>
          <div class="stat-title">सुरक्षित छोड़े गए (विकल्प E - 0 अंक)</div>
        </div>
        <div class="stat-box">
          <div class="stat-num" style="color: var(--accent);" id="res-blank-penalty">0</div>
          <div class="stat-title">रिक्त/अनुत्तरित बिना E (-1/3 दंड)</div>
        </div>
        <div class="stat-box">
          <div class="stat-num" id="res-total-time">00:00</div>
          <div class="stat-title">कुल व्यतीत समय</div>
        </div>
        <div class="stat-box">
          <div class="stat-num" id="res-avg-time">0s</div>
          <div class="stat-title">औसत समय प्रति प्रश्न</div>
        </div>
      </div>
    </div>

    <!-- Time Analysis Table -->
    <div class="score-card">
      <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 12px; color: var(--slate-900);">प्रति प्रश्न समय एवं स्थिति विश्लेषण</h3>
      <div class="time-table-wrap">
        <table class="time-table">
          <thead>
            <tr>
              <th>प्र. सं.</th>
              <th>विषय</th>
              <th>परीक्षा स्रोत</th>
              <th>व्यतीत समय</th>
              <th>चुना गया विकल्प</th>
              <th>सही विकल्प</th>
              <th>प्राप्त अंक</th>
              <th>गति</th>
            </tr>
          </thead>
          <tbody id="time-table-body">
            <!-- Rendered by JS -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Step by Step Solutions -->
    <div class="solutions-section">
      <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; color: var(--slate-900);">विस्तृत हल एवं व्याख्या (Step-by-Step Solutions)</h3>
      <div id="solutions-container">
        <!-- Rendered by JS -->
      </div>
    </div>
  </section>

  <script>
    const questions = ${jsonQuestions};
    const totalTimeSeconds = ${totalMin} * 60;
    let currentIdx = 0;
    let remainingTime = totalTimeSeconds;
    let questionTimes = new Array(questions.length).fill(0);
    let responses = {};
    let testFinished = false;

    // Initialize responses
    questions.forEach((q, i) => {
      responses[q.id] = {
        selectedOption: null,
        status: i === 0 ? 'not_answered' : 'not_visited',
        timeSpent: 0
      };
    });

    // Timers
    const totalTimerEl = document.getElementById('total-timer');
    const qTimerEl = document.getElementById('q-timer');

    const timerInterval = setInterval(() => {
      if (testFinished) return;
      if (remainingTime > 0) {
        remainingTime--;
        const m = Math.floor(remainingTime / 60);
        const s = remainingTime % 60;
        totalTimerEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      } else {
        clearInterval(timerInterval);
        alert('समय समाप्त हो गया है! परीक्षा स्वतः जमा की जा रही है।');
        finishTest();
      }

      // Increment time on current question
      questionTimes[currentIdx]++;
      const qm = Math.floor(questionTimes[currentIdx] / 60);
      const qs = questionTimes[currentIdx] % 60;
      qTimerEl.textContent = String(qm).padStart(2, '0') + ':' + String(qs).padStart(2, '0');
    }, 1000);

    function renderCurrentQuestion() {
      const q = questions[currentIdx];
      document.getElementById('q-number-display').textContent = 'प्रश्न ' + (currentIdx + 1) + ' / ' + questions.length;
      document.getElementById('q-exam-source').textContent = q.exam;
      document.getElementById('q-topic-name').textContent = q.topicNameHindi;
      document.getElementById('q-text-display').textContent = q.questionText;

      const resp = responses[q.id];
      if (resp.status === 'not_visited') {
        resp.status = 'not_answered';
      }

      const container = document.getElementById('options-container');
      container.innerHTML = '';

      q.options.forEach(opt => {
        const item = document.createElement('div');
        const isE = opt.key === 'e';
        item.className = 'option-item' + (isE ? ' e-option' : '') + (resp.selectedOption === opt.key ? ' selected' : '');

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'q_opt_' + q.id;
        radio.className = 'option-radio';
        radio.checked = resp.selectedOption === opt.key;

        const keySpan = document.createElement('span');
        keySpan.className = 'option-key';
        keySpan.textContent = '(' + opt.key + ')';

        const textSpan = document.createElement('span');
        textSpan.className = 'option-text';
        textSpan.textContent = opt.text;

        item.appendChild(radio);
        item.appendChild(keySpan);
        item.appendChild(textSpan);

        item.onclick = () => {
          resp.selectedOption = opt.key;
          if (resp.status === 'marked_review') {
            resp.status = 'answered_marked_review';
          } else {
            resp.status = 'answered';
          }
          renderCurrentQuestion();
          updatePalette();
        };

        container.appendChild(item);
      });

      // Update Q timer display for this question
      const qm = Math.floor(questionTimes[currentIdx] / 60);
      const qs = questionTimes[currentIdx] % 60;
      qTimerEl.textContent = String(qm).padStart(2, '0') + ':' + String(qs).padStart(2, '0');

      updatePalette();
    }

    function saveAndNext() {
      const q = questions[currentIdx];
      const resp = responses[q.id];
      if (resp.selectedOption !== null && resp.status !== 'answered_marked_review') {
        resp.status = 'answered';
      } else if (resp.selectedOption === null && resp.status !== 'marked_review') {
        resp.status = 'not_answered';
      }
      if (currentIdx < questions.length - 1) {
        currentIdx++;
        renderCurrentQuestion();
      } else {
        promptSubmit();
      }
    }

    function markForReviewAndNext() {
      const q = questions[currentIdx];
      const resp = responses[q.id];
      if (resp.selectedOption !== null) {
        resp.status = 'answered_marked_review';
      } else {
        resp.status = 'marked_review';
      }
      if (currentIdx < questions.length - 1) {
        currentIdx++;
        renderCurrentQuestion();
      }
      updatePalette();
    }

    function clearCurrentResponse() {
      const q = questions[currentIdx];
      responses[q.id].selectedOption = null;
      responses[q.id].status = 'not_answered';
      renderCurrentQuestion();
      updatePalette();
    }

    function goToPrev() {
      if (currentIdx > 0) {
        currentIdx--;
        renderCurrentQuestion();
      }
    }

    function jumpToQuestion(idx) {
      currentIdx = idx;
      renderCurrentQuestion();
    }

    function updatePalette() {
      const pGrid = document.getElementById('palette-buttons');
      pGrid.innerHTML = '';

      let cAns = 0, cNotAns = 0, cRev = 0, cAnsRev = 0, cNotVis = 0;

      questions.forEach((q, i) => {
        const resp = responses[q.id];
        const btn = document.createElement('button');
        btn.className = 'q-btn status-' + resp.status + (i === currentIdx ? ' active' : '');
        btn.textContent = i + 1;
        btn.onclick = () => jumpToQuestion(i);
        pGrid.appendChild(btn);

        if (resp.status === 'answered') cAns++;
        else if (resp.status === 'not_answered') cNotAns++;
        else if (resp.status === 'marked_review') cRev++;
        else if (resp.status === 'answered_marked_review') cAnsRev++;
        else if (resp.status === 'not_visited') cNotVis++;
      });

      document.getElementById('leg-ans').textContent = cAns;
      document.getElementById('leg-not-ans').textContent = cNotAns;
      document.getElementById('leg-rev').textContent = cRev;
      document.getElementById('leg-ans-rev').textContent = cAnsRev;
      document.getElementById('leg-not-vis').textContent = cNotVis;
    }

    function promptSubmit() {
      let cAns = 0, cNotAns = 0, cRev = 0, cAnsRev = 0, cNotVis = 0;
      questions.forEach(q => {
        const resp = responses[q.id];
        if (resp.status === 'answered') cAns++;
        else if (resp.status === 'not_answered') cNotAns++;
        else if (resp.status === 'marked_review') cRev++;
        else if (resp.status === 'answered_marked_review') cAnsRev++;
        else if (resp.status === 'not_visited') cNotVis++;
      });

      const summaryHtml = '• कुल प्रश्न: ' + questions.length + '<br>' +
        '• उत्तर दिए गए प्रश्न: ' + (cAns + cAnsRev) + '<br>' +
        '• अनुत्तरित प्रश्न (बिना विकल्प चुने): ' + (cNotAns + cNotVis) + ' (प्रत्येक पर -1/3 दंड)<br>' +
        '• केवल समीक्षा के लिए चिह्नित: ' + cRev + '<br>' +
        '• कुल समय शेष: ' + totalTimerEl.textContent;

      document.getElementById('modal-summary-text').innerHTML = summaryHtml;
      document.getElementById('submit-modal').classList.add('active');
    }

    function closeSubmitModal() {
      document.getElementById('submit-modal').classList.remove('active');
    }

    function confirmSubmit() {
      closeSubmitModal();
      finishTest();
    }

    function finishTest() {
      testFinished = true;
      clearInterval(timerInterval);

      // Hide CBT UI & Header
      document.getElementById('cbt-view').style.display = 'none';
      document.getElementById('test-header').style.display = 'none';
      document.getElementById('results-view').style.display = 'block';

      // Calculate score according to BPSC TRE 4.0 rules:
      // +1 for correct
      // -1/3 for incorrect (wrong answer selected)
      // 0 for safe skip (option 'e' selected when question's answer wasn't 'e')
      // -1/3 for blank / unattempted (no option chosen at all)
      let correct = 0;
      let incorrect = 0;
      let safeSkip = 0;
      let blankPenalty = 0;

      questions.forEach(q => {
        const sel = responses[q.id].selectedOption;
        if (sel === null) {
          blankPenalty++;
        } else if (sel === q.correctOption) {
          correct++;
        } else if (sel === 'e' && q.correctOption !== 'e') {
          safeSkip++;
        } else {
          incorrect++;
        }
      });

      const totalPenaltyCount = incorrect + blankPenalty;
      const totalScore = (correct * 1) - (totalPenaltyCount * (1/3));
      const accuracy = (correct + incorrect > 0) ? Math.round((correct / (correct + incorrect)) * 100) : 0;

      const totalSpentSec = totalTimeSeconds - remainingTime;
      const totalM = Math.floor(totalSpentSec / 60);
      const totalS = totalSpentSec % 60;
      const avgSec = Math.round(totalSpentSec / questions.length);

      document.getElementById('res-score').textContent = (totalScore > 0 ? totalScore.toFixed(2) : '0.00');
      document.getElementById('res-accuracy').textContent = accuracy + '%';
      document.getElementById('res-correct').textContent = correct;
      document.getElementById('res-incorrect').textContent = incorrect;
      document.getElementById('res-safe-skip').textContent = safeSkip;
      document.getElementById('res-blank-penalty').textContent = blankPenalty;
      document.getElementById('res-total-time').textContent = String(totalM).padStart(2, '0') + ':' + String(totalS).padStart(2, '0');
      document.getElementById('res-avg-time').textContent = avgSec + 's';

      // Time table render
      const tbody = document.getElementById('time-table-body');
      tbody.innerHTML = '';
      questions.forEach((q, i) => {
        const resp = responses[q.id];
        const tSec = questionTimes[i];
        const sel = resp.selectedOption;
        let scoreStr = '';
        let statusBadge = '';
        let paceStr = tSec <= 40 ? 'तेज़ (Fast)' : (tSec <= 75 ? 'मध्यम (Moderate)' : 'धीमा (Slow)');

        if (sel === null) {
          scoreStr = '<span style="color:var(--danger);">-0.33</span>';
          statusBadge = '<span class="sol-badge sol-penalty">रिक्त दंड (Blank -1/3)</span>';
        } else if (sel === q.correctOption) {
          scoreStr = '<span style="color:var(--success);">+1.00</span>';
          statusBadge = '<span class="sol-badge sol-correct">सही (Correct)</span>';
        } else if (sel === 'e' && q.correctOption !== 'e') {
          scoreStr = '<span style="color:var(--slate-600);">0.00</span>';
          statusBadge = '<span class="sol-badge sol-skip">सुरक्षित छोड़ा (Safe Left E)</span>';
        } else {
          scoreStr = '<span style="color:var(--danger);">-0.33</span>';
          statusBadge = '<span class="sol-badge sol-wrong">गलत (Incorrect)</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + (i + 1) + '</strong></td>' +
          '<td>' + q.topicNameHindi + '</td>' +
          '<td><span style="font-size:0.75rem; color:#475569;">' + q.exam + '</span></td>' +
          '<td style="font-family:monospace; font-weight:600;">' + tSec + 's</td>' +
          '<td>' + (sel ? '(' + sel + ')' : 'कोई नहीं') + '</td>' +
          '<td style="font-weight:700; color:var(--primary);">(' + q.correctOption + ')</td>' +
          '<td>' + scoreStr + '</td>' +
          '<td>' + paceStr + '</td>';
        tbody.appendChild(tr);
      });

      // Render Solutions
      const solContainer = document.getElementById('solutions-container');
      solContainer.innerHTML = '';
      questions.forEach((q, i) => {
        const resp = responses[q.id];
        const sel = resp.selectedOption;
        const card = document.createElement('div');
        card.className = 'sol-card';

        let badgeHtml = '';
        if (sel === null) {
          badgeHtml = '<span class="sol-badge sol-penalty">कोई विकल्प नहीं चुना गया: -1/3 दंड लागू</span>';
        } else if (sel === q.correctOption) {
          badgeHtml = '<span class="sol-badge sol-correct">सही उत्तर (+1.00)</span>';
        } else if (sel === 'e' && q.correctOption !== 'e') {
          badgeHtml = '<span class="sol-badge sol-skip">विकल्प (E) चुना गया (सुरक्षित, 0 अंक)</span>';
        } else {
          badgeHtml = '<span class="sol-badge sol-wrong">गलत उत्तर (-0.33)</span>';
        }

        card.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">' +
          '<div><strong style="font-size:1.05rem;">प्रश्न ' + (i + 1) + '</strong> <span style="font-size:0.8rem; color:#64748b; margin-left:8px;">' + q.topicNameHindi + '</span></div>' +
          '<div>' + badgeHtml + '</div>' +
          '</div>' +
          '<div style="font-size:0.75rem; color:var(--primary); margin-bottom:10px;">स्रोत: ' + q.exam + '</div>' +
          '<div style="font-size:1rem; margin-bottom:14px; font-weight:500;">' + q.questionText + '</div>' +
          '<div style="font-size:0.9rem; margin-bottom:10px;"><strong>सही उत्तर:</strong> (' + q.correctOption + ')</div>' +
          '<div style="font-size:0.9rem; margin-bottom:10px;"><strong>आपका उत्तर:</strong> ' + (sel ? '(' + sel + ')' : 'कोई नहीं') + ' | <strong>व्यतीत समय:</strong> ' + questionTimes[i] + ' सेकंड</div>' +
          '<div class="sol-exp-box"><strong>विस्तृत व्याख्या एवं हल:</strong>\\n' + q.explanation + '</div>';

        solContainer.appendChild(card);
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function restartTest() {
      location.reload();
    }

    // Start
    renderCurrentQuestion();
  </script>
</body>
</html>`;
}
