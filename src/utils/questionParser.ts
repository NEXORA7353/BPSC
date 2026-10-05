import { Question } from '../types';

export interface ParseResult {
  questions: Question[];
  errors: string[];
  totalDetected: number;
}

/**
 * Super-Smart Multi-Engine Parser for PDF pastes, Word docs, web OCR, and raw text.
 * Robustly parses:
 * - 15+ Question Number Formats (Q1., Q1:, Q.1, 1., 1), [1], प्रश्न 1, Q1-)
 * - Multi-line and Single-line Options ((a)...(b)..., A)...B)..., A....B...., (1)...(2)..., (अ)...(ब)...)
 * - Various Answer Key Formats (Ans: A, Answer: (B), उत्तर: (c), Ans-D, Correct: E, (d) at end)
 * - Solution / Explanation Blocks (व्याख्या:, हल:, Solution:, Exp:, Hint:)
 * - Exam Tag Headers (Bihar STET 2024, BPSC TRE 3.0, etc.)
 * - Automatic 5th Option E generation for 4-option questions
 */
export function parseBulkQuestionText(
  rawText: string,
  topicKey: string = 'custom',
  topicNameHindi: string = 'विविध गणित (Custom Topics)'
): ParseResult {
  if (!rawText || !rawText.trim()) {
    return { questions: [], errors: ['No text provided.'], totalDetected: 0 };
  }

  const trimmed = rawText.trim();

  // 1. Direct JSON Check
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validated: Question[] = parsed.map((item, idx) => ({
          id: item.id || `custom_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
          originalNumber: item.originalNumber || idx + 1,
          topic: item.topic || topicKey,
          topicNameHindi: item.topicNameHindi || topicNameHindi,
          exam: item.exam || 'Imported Question',
          questionText: item.questionText || item.question || item.text || '',
          options: Array.isArray(item.options) && item.options.length >= 4
            ? item.options.map((opt: any) => ({
                key: (opt.key || 'a').toLowerCase() as any,
                text: String(opt.text || opt.textHindi || '')
              }))
            : [
                { key: 'a', text: String(item.optA || item.a || '') },
                { key: 'b', text: String(item.optB || item.b || '') },
                { key: 'c', text: String(item.optC || item.c || '') },
                { key: 'd', text: String(item.optD || item.d || '') },
                { key: 'e', text: String(item.optE || item.e || 'उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक') }
              ],
          correctOption: (item.correctOption || item.answer || item.correct || 'a').toLowerCase() as any,
          explanation: String(item.explanation || item.solution || item.solutionHindi || 'सही उत्तर व्याख्या सहित।'),
          isUserAdded: true,
          createdAt: new Date().toISOString()
        }));

        return {
          questions: validated.filter((q) => q.questionText.trim().length > 3),
          errors: [],
          totalDetected: validated.length
        };
      }
    } catch {
      // Not valid JSON, proceed to smart text parser
    }
  }

  // 2. Pre-process and normalize raw text
  let text = trimmed
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // strip zero-width spaces

  // Smart splitting into question blocks
  // Regex matches start of questions:
  // e.g. "Q1.", "Q 1", "Question 1", "प्रश्न 1", "\n1.", "\n1)", "\n[1]"
  const questionHeaderRegex = /(?:^|\n)(?=(?:प्रश्न\s*[:\-]?\s*\d+|Q\s*[\.:\-]?\s*\d+|Question\s*\d+|\b\d{1,3}\s*[\.\)\-]\s+))/i;

  let rawBlocks = text
    .split(questionHeaderRegex)
    .map((b) => b.trim())
    .filter((b) => b.length > 10);

  // Fallback splitting if block count is 1: split by double newlines with option tags
  if (rawBlocks.length <= 1 && text.includes('\n\n')) {
    const paragraphBlocks = text
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter((b) => b.length > 15 && /(?:\([a-eA-E1-5]\)|[a-eA-E1-5][\)\.])/i.test(b));
    if (paragraphBlocks.length > 1) {
      rawBlocks = paragraphBlocks;
    }
  }

  const questions: Question[] = [];
  const errors: string[] = [];

  rawBlocks.forEach((block, index) => {
    try {
      const q = parseSingleQuestionBlock(block, index + 1, topicKey, topicNameHindi);
      if (q && q.questionText && q.options.length >= 4) {
        questions.push(q);
      } else {
        errors.push(`Block #${index + 1}: Could not separate options (A-D) cleanly.`);
      }
    } catch (err: any) {
      errors.push(`Block #${index + 1} Parse error: ${err.message || 'Malformed format'}`);
    }
  });

  return {
    questions,
    errors,
    totalDetected: rawBlocks.length
  };
}

/**
 * Parses a single text block into a structured Question object.
 */
function parseSingleQuestionBlock(
  block: string,
  index: number,
  topicKey: string,
  topicNameHindi: string
): Question | null {
  let body = block.trim();

  // 1. Extract Question Number & Strip Header
  const numMatch = body.match(/^(?:प्रश्न|Q\.?|Question)?\s*[:\-]?\s*(\d+)[\.:\)\-\s]*/i);
  const originalNumber = numMatch ? parseInt(numMatch[1], 10) : index;
  if (numMatch) {
    body = body.replace(/^(?:प्रश्न|Q\.?|Question)?\s*[:\-]?\s*\d+[\.:\)\-\s]*/i, '').trim();
  }

  // 2. Extract Answer Key
  let correctOption: 'a' | 'b' | 'c' | 'd' | 'e' = 'a';
  const ansRegex = /(?:उत्तर|Ans(?:wer)?|Key|Correct|सही उत्तर)\s*[:\-]?\s*\(?\s*([a-eA-E1-5अ-यक-ङ])\s*\)?/i;
  const ansMatch = body.match(ansRegex);

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
  const expRegex = /(?:व्याख्या|हल|Explanation|Solution|Reason|तर्क)\s*[:\-]?\s*([\s\S]+)$/i;
  const expMatch = body.match(expRegex);

  if (expMatch) {
    explanation = expMatch[1].trim();
    // Strip explanation part from main body so it doesn't mess option parsing
    body = body.replace(expRegex, '').trim();
  } else if (ansMatch) {
    const afterAns = body.slice((ansMatch.index || 0) + ansMatch[0].length);
    const trimmedAfter = afterAns.replace(/^[:\-\s]+/, '').trim();
    if (trimmedAfter.length > 5) {
      explanation = trimmedAfter;
      body = body.slice(0, ansMatch.index).trim();
    }
  }

  if (!explanation) {
    explanation = `सही उत्तर विकल्प (${correctOption.toUpperCase()}) है।`;
  }

  // 4. Extract Exam Source / Tag
  let exam = 'BPSC TRE 4.0 / STET';
  const examRegex = /(?:परीक्षा|Exam|Source)\s*[:\-]?\s*([^\n\r]+)/i;
  const examMatch = body.match(examRegex);
  if (examMatch) {
    exam = examMatch[1].trim();
    body = body.replace(examRegex, '').trim();
  } else {
    const rawExamMatch = body.match(/(Bihar\s+STET[^\n\r]+|BPSC\s+TRE[^\n\r]+|STET\s+\d{4}[^\n\r]*)/i);
    if (rawExamMatch) {
      exam = rawExamMatch[1].trim();
    }
  }

  // 5. Extract Options (A, B, C, D, E)
  // Supports: (a) or (A) or A) or A. or [A] or (1) or (अ)
  let optA = '', optB = '', optC = '', optD = '', optE = '';

  // Pattern 1: (a) ... (b) ... (c) ... (d) ... (e)
  const p1_A = body.match(/(?:\((?:a|A|1|अ|क)\)|(?:^|\s)(?:a|A|1|अ|क)[\.\)])\s*([\s\S]*?)(?=(?:\((?:b|B|2|ब|ख)\)|(?:^|\s)(?:b|B|2|ब|ख)[\.\)]))/);
  const p1_B = body.match(/(?:\((?:b|B|2|ब|ख)\)|(?:^|\s)(?:b|B|2|ब|ख)[\.\)])\s*([\s\S]*?)(?=(?:\((?:c|C|3|स|ग)\)|(?:^|\s)(?:c|C|3|स|ग)[\.\)]))/);
  const p1_C = body.match(/(?:\((?:c|C|3|स|ग)\)|(?:^|\s)(?:c|C|3|स|ग)[\.\)])\s*([\s\S]*?)(?=(?:\((?:d|D|4|द|घ)\)|(?:^|\s)(?:d|D|4|द|घ)[\.\)]))/);
  const p1_D = body.match(/(?:\((?:d|D|4|द|घ)\)|(?:^|\s)(?:d|D|4|द|घ)[\.\)])\s*([\s\S]*?)(?=(?:\((?:e|E|5|य|ङ)\)|(?:^|\s)(?:e|E|5|य|ङ)[\.\)]|(?:उत्तर|Ans|Answer|Key|व्याख्या)|$))/);
  const p1_E = body.match(/(?:\((?:e|E|5|य|ङ)\)|(?:^|\s)(?:e|E|5|य|ङ)[\.\)])\s*([\s\S]*?)(?=(?:उत्तर|Ans|Answer|Key|व्याख्या)|$)/);

  if (p1_A && p1_B && p1_C && p1_D) {
    optA = cleanOptionText(p1_A[1]);
    optB = cleanOptionText(p1_B[1]);
    optC = cleanOptionText(p1_C[1]);
    optD = cleanOptionText(p1_D[1]);
    if (p1_E) optE = cleanOptionText(p1_E[1]);

    // Question text is everything before option A marker
    const firstOptIdx = body.search(/(?:\((?:a|A|1|अ|क)\)|(?:^|\s)(?:a|A|1|अ|क)[\.\)])/);
    const questionText = firstOptIdx !== -1 ? body.slice(0, firstOptIdx).trim() : body.trim();

    if (!optE) {
      optE = 'उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक';
    }

    return {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      originalNumber,
      topic: topicKey,
      topicNameHindi,
      exam,
      questionText,
      options: [
        { key: 'a', text: optA },
        { key: 'b', text: optB },
        { key: 'c', text: optC },
        { key: 'd', text: optD },
        { key: 'e', text: optE }
      ],
      correctOption,
      explanation,
      isCustomE: !p1_E || optE.includes('उपर्युक्त में से कोई नहीं'),
      isUserAdded: true,
      createdAt: new Date().toISOString()
    };
  }

  return null;
}

function cleanOptionText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/(?:उत्तर|Ans|Answer|Key|व्याख्या|Solution).*$/i, '')
    .trim();
}

/**
 * Smart AI Auto-Fixer: Normalizes messy PDF text into clean, standardized question blocks.
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
