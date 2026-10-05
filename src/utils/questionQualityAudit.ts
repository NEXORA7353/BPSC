import { Question } from '../types';

export type IssueType =
  | 'EMPTY_STEM'
  | 'EMPTY_OPTION'
  | 'EMPTY_EXPLANATION'
  | 'GENERIC_EXPLANATION'
  | 'DUMMY_OPTIONS'
  | 'DUPLICATE_OPTIONS'
  | 'INVALID_ANSWER_KEY'
  | 'EXACT_DUPLICATE'
  | 'NEAR_DUPLICATE'
  | 'BANK_DUPLICATE';

export interface QuestionIssue {
  type: IssueType;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  field?: 'questionText' | 'explanation' | 'options' | 'correctOption';
  optionKey?: string;
}

export interface DuplicateMatchInfo {
  similarity: number; // 0 to 100
  isExact: boolean;
  matchedId: string;
  matchedIndex?: number;
  matchedText: string;
  source: 'current_batch' | 'question_bank';
}

export interface AuditedQuestionItem {
  id: string;
  originalIndex: number;
  question: Question;
  issues: QuestionIssue[];
  duplicateInfo?: DuplicateMatchInfo;
  hasErrors: boolean;
  hasWarnings: boolean;
  isDuplicate: boolean;
}

export interface BatchAuditReport {
  totalQuestions: number;
  healthyCount: number;
  problemCount: number;
  duplicateCount: number;
  blankOptionCount: number;
  blankExplanationCount: number;
  items: AuditedQuestionItem[];
}

/**
 * Advanced Hindi & Math String Normalization for Duplicate Detection
 */
export function normalizeTextForDuplicateCheck(text: string): string {
  if (!text) return '';

  return (
    text
      // 1. Remove markdown, HTML and LaTeX commands
      .replace(/\\(?:frac|sqrt|times|cdot|div|pm|le|ge|neq|approx|pi|theta)\b/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/[\$\{\}\[\]\(\)\\_^]/g, ' ')
      // 2. Strip Question number prefixes (e.g. प्रश्न 12., Q. 12, 12., १२.)
      .replace(/^\s*(?:(?:प्रश्न|प्रश्नावली|Q(?:uestion)?|Prashna|Q\.)\s*[:\-.]?\s*[\d०-९]+|[\d०-९]{1,4}[\.\)\-]|\[[\d०-९]{1,4}\])\s*/i, '')
      // 3. Normalize Hindi numerals to English digits
      .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 2406))
      // 4. Strip punctuation, quotes, symbols, danda (।)
      .replace(/[,;:\.!\?।॥\-"'“”‘’]/g, ' ')
      // 5. Remove zero-width spaces & control chars
      .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
      // 6. Lowercase & collapse all whitespaces
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Computes N-Gram Dice Coefficient Similarity (0 to 100)
 * Highly resilient against minor spacing, typos, and slight rephrasing in Hindi/Math.
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeTextForDuplicateCheck(str1);
  const s2 = normalizeTextForDuplicateCheck(str2);

  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;
  if (s1.length < 3 || s2.length < 3) return s1 === s2 ? 100 : 0;

  // Length difference filter: if lengths differ by more than 40%, similarity cannot be >= 80%
  const lenRatio = Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
  if (lenRatio < 0.6) return Math.round(lenRatio * 50);

  // Bigram Dice Coefficient
  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.slice(i, i + 2);
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);

  let intersection = 0;
  for (const [bg, count1] of b1.entries()) {
    const count2 = b2.get(bg) || 0;
    intersection += Math.min(count1, count2);
  }

  const totalBigrams = (s1.length - 1) + (s2.length - 1);
  if (totalBigrams <= 0) return 0;

  const score = (2 * intersection) / totalBigrams;
  return Math.round(score * 100);
}

/**
 * Checks individual question for quality issues
 */
export function auditSingleQuestion(q: Question): QuestionIssue[] {
  const issues: QuestionIssue[] = [];

  // 1. Question Stem Check
  const stem = (q.questionText || '').trim();
  if (!stem || stem.length < 3) {
    issues.push({
      type: 'EMPTY_STEM',
      severity: 'critical',
      title: 'प्रश्न विवरण खाली है (Empty Question Stem)',
      description: 'इस प्रश्न का मुख्य विवरण (Stem) खाली या बहुत छोटा है।',
      field: 'questionText'
    });
  }

  // 2. Options Check
  const options = Array.isArray(q.options) ? q.options : [];
  const requiredKeys = ['a', 'b', 'c', 'd'];
  const presentKeys = new Set(options.map((o) => (o.key || '').toLowerCase()));

  // Check missing options
  for (const key of requiredKeys) {
    const opt = options.find((o) => (o.key || '').toLowerCase() === key);
    if (!opt || !opt.text || opt.text.trim() === '') {
      issues.push({
        type: 'EMPTY_OPTION',
        severity: 'critical',
        title: `विकल्प (${key.toUpperCase()}) खाली है (Option ${key.toUpperCase()} is Empty)`,
        description: `विकल्प (${key.toUpperCase()}) का मान खाली छूटा हुआ है।`,
        field: 'options',
        optionKey: key
      });
    }
  }

  // Check dummy options (Option A, Option B, Option C, Option D)
  const dummyOptCount = options.filter(
    (o) => o.text.trim().toLowerCase() === `option ${o.key.toLowerCase()}`
  ).length;
  if (dummyOptCount >= 2) {
    issues.push({
      type: 'DUMMY_OPTIONS',
      severity: 'warning',
      title: 'फ़र्ज़ी डमी विकल्प (Placeholder Dummy Options)',
      description: `${dummyOptCount} विकल्पों में केवल 'Option A/B/C' जैसा डमी टेक्स्ट भरा हुआ है।`,
      field: 'options'
    });
  }

  // Check duplicate options within question
  const optTexts = options
    .map((o) => normalizeTextForDuplicateCheck(o.text))
    .filter((t) => t.length > 1);
  const uniqueTexts = new Set(optTexts);
  if (optTexts.length >= 3 && uniqueTexts.size < optTexts.length) {
    issues.push({
      type: 'DUPLICATE_OPTIONS',
      severity: 'warning',
      title: 'समान विकल्प मौजूद हैं (Duplicate Options in Question)',
      description: 'इस प्रश्न में एक से अधिक विकल्पों का मान बिल्कुल एक जैसा है।',
      field: 'options'
    });
  }

  // 3. Explanation Check
  const exp = (q.explanation || '').trim();
  if (!exp) {
    issues.push({
      type: 'EMPTY_EXPLANATION',
      severity: 'critical',
      title: 'व्याख्या खाली है (Blank Explanation)',
      description: 'इस प्रश्न के लिए कोई व्याख्या / हल नहीं दी गई है।',
      field: 'explanation'
    });
  } else if (
    exp === 'सही उत्तर व्याख्या सहित।' ||
    exp === `सही उत्तर विकल्प (${(q.correctOption || 'a').toUpperCase()}) है।` ||
    exp.length < 5
  ) {
    issues.push({
      type: 'GENERIC_EXPLANATION',
      severity: 'info',
      title: 'सामान्य डिफ़ॉल्ट व्याख्या (Default Fallback Explanation)',
      description: 'व्याख्या में विस्तृत चरण नहीं हैं, केवल डिफ़ॉल्ट संदेश है।',
      field: 'explanation'
    });
  }

  // 4. Correct Answer Key Check
  const key = (q.correctOption || '').toLowerCase();
  if (!['a', 'b', 'c', 'd', 'e'].includes(key)) {
    issues.push({
      type: 'INVALID_ANSWER_KEY',
      severity: 'critical',
      title: 'अमान्य उत्तर कुंजी (Invalid Answer Key)',
      description: `उत्तर कुंजी '${q.correctOption}' मान्य (A, B, C, D, E) नहीं है।`,
      field: 'correctOption'
    });
  }

  return issues;
}

/**
 * Highly Advanced Duplicate Detector & Full Quality Auditor
 */
export function auditQuestionBatch(
  batch: Question[],
  existingBank: Question[] = []
): BatchAuditReport {
  const items: AuditedQuestionItem[] = [];

  // Normalized map for intra-batch duplicate detection
  const seenBatchStems: { id: string; index: number; text: string; norm: string }[] = [];

  // Normalized existing bank map
  const bankIndex = existingBank.map((b) => ({
    id: b.id,
    text: b.questionText,
    norm: normalizeTextForDuplicateCheck(b.questionText)
  }));

  batch.forEach((q, index) => {
    const issues = auditSingleQuestion(q);
    let duplicateInfo: DuplicateMatchInfo | undefined;

    const normStem = normalizeTextForDuplicateCheck(q.questionText);

    if (normStem.length > 5) {
      // 1. Check against previous questions in current batch
      for (const seen of seenBatchStems) {
        if (normStem === seen.norm) {
          duplicateInfo = {
            similarity: 100,
            isExact: true,
            matchedId: seen.id,
            matchedIndex: seen.index,
            matchedText: seen.text,
            source: 'current_batch'
          };
          issues.push({
            type: 'EXACT_DUPLICATE',
            severity: 'critical',
            title: `हूबहू डुप्लीकेट प्रश्न #${seen.index + 1} (100% Exact Match)`,
            description: `यह प्रश्न इसी सूची के प्रश्न #${seen.index + 1} जैसा ही है।`,
            field: 'questionText'
          });
          break;
        }

        const sim = calculateStringSimilarity(normStem, seen.norm);
        if (sim >= 85) {
          duplicateInfo = {
            similarity: sim,
            isExact: false,
            matchedId: seen.id,
            matchedIndex: seen.index,
            matchedText: seen.text,
            source: 'current_batch'
          };
          issues.push({
            type: 'NEAR_DUPLICATE',
            severity: 'warning',
            title: `मिलता-जुलता प्रश्न #${seen.index + 1} (${sim}% Match)`,
            description: `यह प्रश्न #${seen.index + 1} से ${sim}% मिलता है।`,
            field: 'questionText'
          });
          break;
        }
      }

      // 2. Check against already existing Question Bank
      if (!duplicateInfo) {
        for (const bankItem of bankIndex) {
          if (normStem === bankItem.norm) {
            duplicateInfo = {
              similarity: 100,
              isExact: true,
              matchedId: bankItem.id,
              matchedText: bankItem.text,
              source: 'question_bank'
            };
            issues.push({
              type: 'BANK_DUPLICATE',
              severity: 'warning',
              title: 'बैंक में पहले से मौजूद है (Already in Question Bank)',
              description: `यह प्रश्न आपके प्रश्न बैंक में पहले से सुरक्षित है: "${bankItem.text.slice(0, 45)}..."`,
              field: 'questionText'
            });
            break;
          }

          const sim = calculateStringSimilarity(normStem, bankItem.norm);
          if (sim >= 88) {
            duplicateInfo = {
              similarity: sim,
              isExact: false,
              matchedId: bankItem.id,
              matchedText: bankItem.text,
              source: 'question_bank'
            };
            issues.push({
              type: 'BANK_DUPLICATE',
              severity: 'info',
              title: `बैंक प्रश्न से मिलता-जुलता (${sim}% Match with Bank)`,
              description: `यह प्रश्न बैंक के प्रश्न से ${sim}% मिलता है: "${bankItem.text.slice(0, 45)}..."`,
              field: 'questionText'
            });
            break;
          }
        }
      }

      // Add to seen batch
      seenBatchStems.push({
        id: q.id,
        index,
        text: q.questionText,
        norm: normStem
      });
    }

    const hasErrors = issues.some((i) => i.severity === 'critical');
    const hasWarnings = issues.some((i) => i.severity === 'warning');
    const isDuplicate = Boolean(duplicateInfo);

    items.push({
      id: q.id,
      originalIndex: index,
      question: q,
      issues,
      duplicateInfo,
      hasErrors,
      hasWarnings,
      isDuplicate
    });
  });

  const totalQuestions = batch.length;
  const problemCount = items.filter((it) => it.issues.length > 0).length;
  const duplicateCount = items.filter((it) => it.isDuplicate).length;
  const blankOptionCount = items.filter((it) =>
    it.issues.some((i) => i.type === 'EMPTY_OPTION')
  ).length;
  const blankExplanationCount = items.filter((it) =>
    it.issues.some((i) => i.type === 'EMPTY_EXPLANATION')
  ).length;
  const healthyCount = totalQuestions - problemCount;

  return {
    totalQuestions,
    healthyCount,
    problemCount,
    duplicateCount,
    blankOptionCount,
    blankExplanationCount,
    items
  };
}

/**
 * Auto-Heal Helpers
 */
export function autoHealQuestion(q: Question): Question {
  const updated = { ...q, options: [...q.options] };

  // 1. Fill empty explanation
  if (!updated.explanation || updated.explanation.trim() === '') {
    updated.explanation = `सही उत्तर विकल्प (${(updated.correctOption || 'a').toUpperCase()}) है।`;
  }

  // 2. Ensure Option E is present (BPSC standard)
  const optEIndex = updated.options.findIndex((o) => (o.key || '').toLowerCase() === 'e');
  const defaultOptEText =
    'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)';

  if (optEIndex !== -1) {
    if (!updated.options[optEIndex].text || updated.options[optEIndex].text.trim() === '') {
      updated.options[optEIndex].text = defaultOptEText;
    }
  } else {
    updated.options.push({ key: 'e', text: defaultOptEText });
  }

  // 3. Ensure Options A-D have non-empty text
  for (const key of ['a', 'b', 'c', 'd']) {
    const idx = updated.options.findIndex((o) => (o.key || '').toLowerCase() === key);
    if (idx !== -1 && (!updated.options[idx].text || updated.options[idx].text.trim() === '')) {
      updated.options[idx].text = `विकल्प (${key.toUpperCase()})`;
    }
  }

  return updated;
}
