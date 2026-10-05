import { Question } from '../types';
import { normalizeMathSyntax } from './mathFormatter';

export interface ParseResult {
  questions: Question[];
  errors: string[];
  totalDetected: number;
}

export function getFormattedImportDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Super-Smart 100% Zero-Loss Multi-Engine Question Parser
 */
export function parseBulkQuestionText(
  rawText: string,
  topicKey: string = 'custom',
  topicNameHindi: string = 'विविध गणित (Custom Topics)'
): ParseResult {
  if (!rawText || !rawText.trim()) {
    return { questions: [], errors: ['No text provided.'], totalDetected: 0 };
  }

  const trimmed = normalizeMathSyntax(rawText.trim());
  const dateFormatted = getFormattedImportDate();

  // 1. Direct JSON Check
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validated: Question[] = parsed.map((item, idx) => ({
          id: item.id || `custom_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
          originalNumber: item.originalNumber || idx + 1,
          topic: topicKey,
          topicNameHindi: topicNameHindi,
          exam: item.exam || 'Imported Question',
          questionText: item.questionText || item.question || item.text || '',
          options: Array.isArray(item.options) && item.options.length >= 4
            ? item.options.map((opt: any) => ({
                key: (opt.key || 'a').toLowerCase() as any,
                text: String(opt.text || opt.textHindi || '')
              }))
            : [
                { key: 'a', text: String(item.optA || item.a || 'Option A') },
                { key: 'b', text: String(item.optB || item.b || 'Option B') },
                { key: 'c', text: String(item.optC || item.c || 'Option C') },
                { key: 'd', text: String(item.optD || item.d || 'Option D') },
                { key: 'e', text: String(item.optE || item.e || 'उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक') }
              ],
          correctOption: (item.correctOption || item.answer || item.correct || 'a').toLowerCase() as any,
          explanation: String(item.explanation || item.solution || item.solutionHindi || 'सही उत्तर व्याख्या सहित।'),
          isUserAdded: true,
          createdAt: item.createdAt || dateFormatted
        }));

        return {
          questions: validated.filter((q) => q.questionText.trim().length > 1),
          errors: [],
          totalDetected: validated.length
        };
      }
    } catch {
      // Not valid JSON, proceed to text parser
    }
  }

  // 2. Pre-process text
  let text = trimmed
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[\u200B-\u200D\uFEFF]/g, '');

  const rawBlocks = smartSplitQuestionBlocks(text);

  const questions: Question[] = [];
  const errors: string[] = [];

  rawBlocks.forEach((block, index) => {
    try {
      const q = parseSingleQuestionBlock(block, index + 1, topicKey, topicNameHindi, dateFormatted);
      if (q) {
        // Discard phantom dummy questions (blocks with no real question text or only placeholder dummy options)
        const isDummyQuestion =
          (!q.questionText || q.questionText.trim().length < 3) ||
          (q.questionText.startsWith('Question #') && q.options[0]?.text === 'Option A' && q.options[1]?.text === 'Option B') ||
          (q.options[0]?.text === 'Option A' && q.options[1]?.text === 'Option B' && q.options[2]?.text === 'Option C');

        if (!isDummyQuestion) {
          questions.push(q);
        }
      }
    } catch (err: any) {
      errors.push(`Block #${index + 1}: ${err.message || 'Warning parsing block'}`);
    }
  });

  return {
    questions,
    errors,
    totalDetected: questions.length
  };
}

/**
 * Checks whether text contains recognizable MCQ options
 */
function hasRecognizableOptions(t: string): boolean {
  // Option (a)/(A) followed by Option (b)/(B)
  const set1 = /(?:^|\n|\s)(?:\((?:[aA]|अ|क)\)|(?:[aA]|अ|क)[\.\)])\s*[\s\S]*?(?:^|\n|\s)(?:\((?:[bB]|ब|ख)\)|(?:[bB]|ब|ख)[\.\)])/i;
  // Option (1) followed by Option (2)
  const set2 = /(?:^|\n|\s)(?:\((?:1)\)(?!\/)|(?:1)[\.\)](?!\/))\s*[\s\S]*?(?:^|\n|\s)(?:\((?:2)\)(?!\/)|(?:2)[\.\)](?!\/))/i;
  return set1.test(t) || set2.test(t);
}

/**
 * Universal smart question splitter & consolidator.
 * Handles 100, 200, 500+ questions seamlessly without creating phantom questions
 * from multi-line explanations or numbered math statements.
 */
export function smartSplitQuestionBlocks(text: string): string[] {
  // Pre-normalize gaps before explicit question starts
  const withNormalizedGaps = text.replace(
    /(?:\n)(?=\s*(?:(?:प्रश्न|Q(?:uestion)?|Prashna|Q\.)\s*[:\-]?\s*\d+|\d{1,4}\s*[\.:\)]\s+[^\n]{3,}))/gi,
    '\n\n'
  );

  const paragraphs = withNormalizedGaps
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 3);

  if (paragraphs.length <= 1) {
    // If no double-line breaks exist, fallback to line-start question markers
    const fallbackDelim = /(?:\n+|^)(?=\s*(?:(?:प्रश्न|Q(?:uestion)?|Prashna)\s*[:\-]?\s*\d+|\d{1,4}\s*[\.:\)]\s+))/i;
    const blocks = text.split(fallbackDelim).map((b) => b.trim()).filter((b) => b.length > 5);
    if (blocks.length > 1) {
      return blocks;
    }
    return [text];
  }

  const isExplicitQuestionStart = (t: string) =>
    /^(?:प्रश्न\s*[:\-]?\s*\d+|Q(?:uestion)?\s*[\.:\-]?\s*\d+|\d{1,4}\s*[\.:\)]\s+)/i.test(t);

  const isMetadataOrExplanation = (t: string) =>
    /(?:^|\n)\s*(?:व्याख्या|Explanation|Solution|हल|उत्तर|Ans|Key|परीक्षा|Exam|Source)\s*[:\-]/i.test(t);

  const questions: string[] = [];
  let currentQ = '';

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];

    if (!currentQ) {
      currentQ = p;
      continue;
    }

    // 1. Explicit start of next question (e.g. प्रश्न 2, Q2, 16.)
    if (isExplicitQuestionStart(p)) {
      questions.push(currentQ);
      currentQ = p;
    }
    // 2. Explanation, Answer Key or Exam tag of current question (MUST merge into current question)
    else if (isMetadataOrExplanation(p)) {
      currentQ += '\n\n' + p;
    }
    // 3. Both have real options -> p must be a new question
    else if (hasRecognizableOptions(p) && hasRecognizableOptions(currentQ)) {
      questions.push(currentQ);
      currentQ = p;
    }
    // 4. Current question does not have options yet -> merge into current
    else if (!hasRecognizableOptions(currentQ)) {
      currentQ += '\n\n' + p;
    }
    // 5. Lookahead: if p is not metadata AND subsequent paragraph has options -> p is the stem of next question
    else if (!isMetadataOrExplanation(p) && i + 1 < paragraphs.length && hasRecognizableOptions(paragraphs[i + 1])) {
      questions.push(currentQ);
      currentQ = p;
    }
    // 6. Otherwise it's continuation/explanation of current question
    else {
      currentQ += '\n\n' + p;
    }
  }

  if (currentQ) {
    questions.push(currentQ);
  }

  return questions;
}

/**
 * Parses a single text block with 100% zero-loss fallback guarantees.
 */
function parseSingleQuestionBlock(
  block: string,
  index: number,
  topicKey: string,
  topicNameHindi: string,
  dateFormatted: string
): Question {
  let body = block.trim();

  // 1. Extract Question Number
  const numMatch = body.match(/^(?:प्रश्न|Q(?:uestion)?\.?)?\s*[:\-]?\s*(\d+)[\.:\)\-\]\}\s]*/i);
  const originalNumber = numMatch ? parseInt(numMatch[1], 10) : index;
  if (numMatch) {
    body = body.replace(/^(?:प्रश्न|Q(?:uestion)?\.?)?\s*[:\-]?\s*\d+[\.:\)\-\]\}\s]*/i, '').trim();
  }

  // 2. Extract Answer Key (safe against Hindi option text like 'उत्तर नहीं देना चाहते')
  let correctOption: 'a' | 'b' | 'c' | 'd' | 'e' = 'a';
  const safeAnsRegex = /(?:^|\n)\s*(?:उत्तर|Ans(?:wer)?|Key|Correct|सही उत्तर)\s*(?:[:\-]\s*\(?|\s*\()\s*([a-eA-E1-5]|अ|ब|स|द|य|क|ख|ग|घ|ङ)\s*\)?/i;
  const ansMatch = body.match(safeAnsRegex);

  if (ansMatch) {
    const keyStr = ansMatch[1].toLowerCase();
    if (['a', 'b', 'c', 'd', 'e'].includes(keyStr)) {
      correctOption = keyStr as any;
    } else if (keyStr === '1' || keyStr === 'अ' || keyStr === 'क') correctOption = 'a';
    else if (keyStr === '2' || keyStr === 'ब' || keyStr === 'ख') correctOption = 'b';
    else if (keyStr === '3' || keyStr === 'स' || keyStr === 'ग') correctOption = 'c';
    else if (keyStr === '4' || keyStr === 'द' || keyStr === 'घ') correctOption = 'd';
    else if (keyStr === '5' || keyStr === 'य' || keyStr === 'ङ') correctOption = 'e';
  }

  // 3. Extract Explanation / Solution
  let explanation = '';
  const expRegex = /(?:^|\n)\s*(?:व्याख्या|हल|Explanation|Solution|Reason|तर्क)\s*[:\-]?\s*([\s\S]+)$/i;
  const expMatch = body.match(expRegex);

  if (expMatch) {
    explanation = expMatch[1].trim();
    body = body.slice(0, expMatch.index).trim();
  } else if (ansMatch) {
    const afterAns = body.slice((ansMatch.index || 0) + ansMatch[0].length);
    const trimmedAfter = afterAns.replace(/^[:\-\s]+/, '').trim();
    if (trimmedAfter.length > 3) {
      explanation = trimmedAfter;
    }
  }

  if (ansMatch) {
    body = body.replace(safeAnsRegex, '').trim();
  }

  if (!explanation) {
    explanation = `सही उत्तर विकल्प (${correctOption.toUpperCase()}) है।`;
  }

  // 4. Extract Exam Tag
  let exam = 'BPSC TRE 4.0 / STET';
  const examRegex = /(?:परीक्षा|Exam|Source)\s*[:\-]?\s*([^\n\r]+)/i;
  const examMatch = body.match(examRegex);
  if (examMatch) {
    exam = examMatch[1].trim();
    body = body.replace(examRegex, '').trim();
  }

  // 5. Multi-Pattern Options Extractor
  const { questionText, optA, optB, optC, optD, optE } = extractOptionsAndText(body);

  const finalOptE = optE || 'अनुत्तरित प्रश्न (यदि किसी प्रश्न का उत्तर नहीं देना चाहते, तो विकल्प E चुनें — इससे न अंक मिलेगा, न कटेगा।)';

  return {
    id: `custom_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
    originalNumber,
    topic: topicKey,
    topicNameHindi,
    exam,
    questionText: questionText || `Question #${index}`,
    options: [
      { key: 'a', text: optA || 'Option A' },
      { key: 'b', text: optB || 'Option B' },
      { key: 'c', text: optC || 'Option C' },
      { key: 'd', text: optD || 'Option D' },
      { key: 'e', text: finalOptE }
    ],
    correctOption,
    explanation,
    isCustomE: finalOptE.includes('उपर्युक्त में से कोई नहीं') || finalOptE.includes('अनुत्तरित') || finalOptE.includes('उत्तर नहीं देना चाहते'),
    isUserAdded: true,
    createdAt: dateFormatted
  };
}

function extractOptionsAndText(body: string) {
  let questionText = body;
  let optA = '', optB = '', optC = '', optD = '', optE = '';

  const patternSets = [
    // (a) (b) (c) (d) (e) or (A) (B) (C) (D) (E) or (अ) (ब) (स) (द) (य)
    {
      a: /(?:\((?:a|A|अ|क)\)|(?:^|\s)(?:a|A|अ|क)[\.\)])\s*([\s\S]*?)(?=(?:\((?:b|B|ब|ख)\)|(?:^|\s)(?:b|B|ब|ख)[\.\)]))/i,
      b: /(?:\((?:b|B|ब|ख)\)|(?:^|\s)(?:b|B|ब|ख)[\.\)])\s*([\s\S]*?)(?=(?:\((?:c|C|स|ग)\)|(?:^|\s)(?:c|C|स|ग)[\.\)]))/i,
      c: /(?:\((?:c|C|स|ग)\)|(?:^|\s)(?:c|C|स|ग)[\.\)])\s*([\s\S]*?)(?=(?:\((?:d|D|द|घ)\)|(?:^|\s)(?:d|D|द|घ)[\.\)]))/i,
      d: /(?:\((?:d|D|द|घ)\)|(?:^|\s)(?:d|D|द|घ)[\.\)])\s*([\s\S]*?)(?=(?:\((?:e|E|य|ङ)\)|(?:^|\s)(?:e|E|य|ङ)[\.\)]|(?:\n\s*(?:परीक्षा|Exam)|(?:उत्तर|Ans|Answer|Key)\s*[:\-]|(?:व्याख्या|Solution|हल)\s*[:\-]|$)))/i,
      e: /(?:\((?:e|E|य|ङ)\)|(?:^|\s)(?:e|E|य|ङ)[\.\)])\s*([\s\S]*?)(?=(?:\n\s*(?:परीक्षा|Exam)|(?:उत्तर|Ans|Answer|Key)\s*[:\-]|(?:व्याख्या|Solution|हल)\s*[:\-]|$))/i,
      splitRegex: /(?:\((?:a|A|अ|क)\)|(?:^|\s)(?:a|A|अ|क)[\.\)])/i
    },
    // (1) (2) (3) (4) (5) or 1) 2) 3) 4) 5) (excluding fractions like (1/3) or (2/5))
    {
      a: /(?:\((?:1)\)(?!\/)|(?:^|\s)(?:1)[\.\)](?!\/))\s*([\s\S]*?)(?=(?:\((?:2)\)(?!\/)|(?:^|\s)(?:2)[\.\)](?!\/)))/i,
      b: /(?:\((?:2)\)(?!\/)|(?:^|\s)(?:2)[\.\)](?!\/))\s*([\s\S]*?)(?=(?:\((?:3)\)(?!\/)|(?:^|\s)(?:3)[\.\)](?!\/)))/i,
      c: /(?:\((?:3)\)(?!\/)|(?:^|\s)(?:3)[\.\)](?!\/))\s*([\s\S]*?)(?=(?:\((?:4)\)(?!\/)|(?:^|\s)(?:4)[\.\)](?!\/)))/i,
      d: /(?:\((?:4)\)(?!\/)|(?:^|\s)(?:4)[\.\)](?!\/))\s*([\s\S]*?)(?=(?:\((?:5)\)(?!\/)|(?:^|\s)(?:5)[\.\)](?!\/)|(?:\n\s*(?:परीक्षा|Exam)|(?:उत्तर|Ans|Answer|Key)\s*[:\-]|(?:व्याख्या|Solution|हल)\s*[:\-]|$)))/i,
      e: /(?:\((?:5)\)(?!\/)|(?:^|\s)(?:5)[\.\)](?!\/))\s*([\s\S]*?)(?=(?:\n\s*(?:परीक्षा|Exam)|(?:उत्तर|Ans|Answer|Key)\s*[:\-]|(?:व्याख्या|Solution|हल)\s*[:\-]|$))/i,
      splitRegex: /(?:\((?:1)\)(?!\/)|(?:^|\s)(?:1)[\.\)](?!\/))/i
    }
  ];

  for (const set of patternSets) {
    const mA = body.match(set.a);
    const mB = body.match(set.b);
    const mC = body.match(set.c);
    const mD = body.match(set.d);
    if (mA && mB && mC && mD) {
      optA = cleanOptionText(mA[1]);
      optB = cleanOptionText(mB[1]);
      optC = cleanOptionText(mC[1]);
      optD = cleanOptionText(mD[1]);
      const mE = body.match(set.e);
      if (mE) optE = cleanOptionText(mE[1]);

      const idx = body.search(set.splitRegex);
      if (idx !== -1) {
        questionText = body.slice(0, idx).trim();
      }
      return { questionText, optA, optB, optC, optD, optE };
    }
  }

  // Fallback line-by-line extractor
  const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 5) {
    questionText = lines[0];
    optA = cleanOptionText(lines[1]);
    optB = cleanOptionText(lines[2]);
    optC = cleanOptionText(lines[3]);
    optD = cleanOptionText(lines[4]);
    if (lines[5]) optE = cleanOptionText(lines[5]);
  } else if (lines.length > 1) {
    questionText = lines[0];
    optA = cleanOptionText(lines[1] || 'Option A');
    optB = cleanOptionText(lines[2] || 'Option B');
    optC = cleanOptionText(lines[3] || 'Option C');
    optD = cleanOptionText(lines[4] || 'Option D');
  }

  return { questionText, optA, optB, optC, optD, optE };
}

function cleanOptionText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/(?:\n\s*(?:परीक्षा|Exam):?.*$)/i, '')
    .replace(/(?:उत्तर|Ans|Answer|Key)\s*[:\-]\s*\(?[a-eA-E1-5].*$/i, '')
    .replace(/(?:व्याख्या|Solution|हल|Explanation)\s*[:\-].*$/i, '')
    .trim();
}

/**
 * Smart AI Auto-Fixer
 */
export function aiSmartFormatText(text: string): string {
  if (!text) return '';
  let formatted = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/Q\s*(\d+)/gi, 'प्रश्न $1.')
    .replace(/Question\s*(\d+)/gi, 'प्रश्न $1.')
    .replace(/\b([A-Ea-e1-5])[\)\.]/g, '($1)')
    .replace(/(Ans|Answer|Key|Correct|उत्तर)\s*[:\-]?\s*([a-eA-E1-5])/gi, '\nउत्तर: ($2)')
    .replace(/(Explanation|Solution|व्याख्या|हल)\s*[:\-]?/gi, '\nव्याख्या: ')
    .replace(/\n\s*\n+/g, '\n\n');
  return formatted;
}

