import { Question } from '../types';

export interface ParseResult {
  questions: Question[];
  errors: string[];
  totalDetected: number;
}

/**
 * Enhanced multi-pattern parser for questions copied from competitive exam PDFs,
 * Word docs, web portals, or OCR scans.
 * Supports:
 * - Direct JSON input (array of Question objects)
 * - Questions with (a)-(e) or (A)-(E) or A) - E) or A. - E.
 * - Hindi letter options: (अ)-(य) or (क)-(ङ)
 * - Numbered options: (1)-(5) or 1) - 5)
 * - Answer key indicators: उत्तर, Ans, Answer, Key, उत्तर कुंजी, Ans:
 * - Solution / Explanation: व्याख्या, हल, Solution, Explanation, Reason
 * - Exam tags: परीक्षा, Exam, BPSC, STET, CTET, आदि.
 * - Missing Option E fallback: automatically provides official BPSC Option E
 */
export function parseBulkQuestionText(
  rawText: string,
  topicKey: string = 'custom',
  topicNameHindi: string = 'विविध गणित (Custom Topics)'
): ParseResult {
  const errors: string[] = [];
  const questions: Question[] = [];

  if (!rawText || !rawText.trim()) {
    return { questions: [], errors: ['No text provided to parse.'], totalDetected: 0 };
  }

  const trimmed = rawText.trim();

  // 1. Direct JSON detection
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validated: Question[] = parsed.map((item, idx) => ({
          id: item.id || `custom_${Date.now()}_${idx}`,
          originalNumber: item.originalNumber || idx + 1,
          topic: item.topic || topicKey,
          topicNameHindi: item.topicNameHindi || topicNameHindi,
          exam: item.exam || 'Imported Question',
          questionText: item.questionText || item.question || '',
          options: Array.isArray(item.options) && item.options.length >= 4
            ? item.options
            : [
                { key: 'a', text: item.optA || item.a || '' },
                { key: 'b', text: item.optB || item.b || '' },
                { key: 'c', text: item.optC || item.c || '' },
                { key: 'd', text: item.optD || item.d || '' },
                { key: 'e', text: item.optE || item.e || 'उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक' }
              ],
          correctOption: (item.correctOption || item.answer || 'a').toLowerCase() as any,
          explanation: item.explanation || item.solution || 'सही उत्तर व्याख्या सहित।',
          isUserAdded: true,
          createdAt: new Date().toISOString()
        }));

        return {
          questions: validated.filter((q) => q.questionText.length > 5),
          errors: [],
          totalDetected: validated.length
        };
      }
    } catch {
      // not valid JSON, proceed to regex text parser
    }
  }

  // 2. Normalize text and line endings
  const normalized = trimmed
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");

  // Regex pattern to split by question start markers:
  // e.g. "प्रश्न 1", "Q1.", "Q 1", "Question 1", or "\n\n1." or "\n[0-9]{1,3}\."
  const questionSplitRegex = /(?:^|\n)(?=(?:प्रश्न\s*[:\-]?\s*\d+|Q\s*\.?\s*\d+|Question\s*\d+|\b\d{1,3}\.\s+|Q\d+[\.:\-\s]))/i;

  let rawBlocks = normalized
    .split(questionSplitRegex)
    .map((b) => b.trim())
    .filter((b) => b.length > 15);

  // If questionSplitRegex didn't find multiple questions, try splitting by blank lines
  if (rawBlocks.length <= 1 && normalized.includes('\n\n')) {
    const doubleNewlineBlocks = normalized
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter((b) => b.length > 20 && (b.includes('(a)') || b.includes('(A)') || b.includes('A)')));
    if (doubleNewlineBlocks.length > 1) {
      rawBlocks = doubleNewlineBlocks;
    }
  }

  let counter = 1;

  for (const block of rawBlocks) {
    try {
      const q = parseSingleBlock(block, counter, topicKey, topicNameHindi);
      if (q) {
        questions.push(q);
        counter++;
      } else {
        errors.push(`Could not find options (A-D) for: "${block.slice(0, 50)}..."`);
      }
    } catch {
      errors.push(`Failed to parse: "${block.slice(0, 45)}..."`);
    }
  }

  return {
    questions,
    errors,
    totalDetected: rawBlocks.length
  };
}

function parseSingleBlock(
  block: string,
  index: number,
  topicKey: string,
  topicNameHindi: string
): Question | null {
  // 1. Extract Question Number
  const numMatch = block.match(/^(?:प्रश्न|Q\.?|Question)?\s*[:\-]?\s*(\d+)[\.:\-\s]/i);
  const originalNumber = numMatch ? parseInt(numMatch[1], 10) : index;

  let body = block;
  if (numMatch) {
    body = body.replace(/^(?:प्रश्न|Q\.?|Question)?\s*[:\-]?\s*\d+[\.:\-\s]*/i, '').trim();
  }

  // 2. Extract Answer Key
  // Handles: उत्तर: (a), Ans. (b), Ans: c, Answer: (d), उत्तर- a, Ans (e), Ans. (b):
  let correctOption: 'a' | 'b' | 'c' | 'd' | 'e' = 'a';
  const ansRegex = /(?:उत्तर|Ans(?:wer)?|Key|सही उत्तर)\s*[:\-]?\s*\(?([a-eA-E1-5अ-यक-ङ])\)?/i;
  const ansMatch = body.match(ansRegex);
  if (ansMatch) {
    const rawAns = ansMatch[1].toLowerCase();
    if (['a', 'b', 'c', 'd', 'e'].includes(rawAns)) {
      correctOption = rawAns as any;
    } else if (rawAns === '1' || rawAns === 'अ' || rawAns === 'क') correctOption = 'a';
    else if (rawAns === '2' || rawAns === 'ब' || rawAns === 'ख') correctOption = 'b';
    else if (rawAns === '3' || rawAns === 'स' || rawAns === 'ग') correctOption = 'c';
    else if (rawAns === '4' || rawAns === 'द' || rawAns === 'घ') correctOption = 'd';
    else if (rawAns === '5' || rawAns === 'य' || rawAns === 'ङ') correctOption = 'e';
  }

  // 3. Extract Explanation
  let explanation = '';
  const expRegex = /(?:व्याख्या|हल|Explanation|Solution|कारण)\s*[:\-]?\s*([\s\S]+)$/i;
  const expMatch = body.match(expRegex);

  if (expMatch) {
    explanation = expMatch[1].trim();
  } else if (ansMatch) {
    const afterAnsMatch = body.slice((ansMatch.index || 0) + ansMatch[0].length);
    const trimmedAfter = afterAnsMatch.replace(/^[:\-\s]+/, '').trim();
    if (trimmedAfter.length > 5) {
      explanation = trimmedAfter;
    }
  }

  if (!explanation) {
    explanation = `सही उत्तर विकल्प (${correctOption.toUpperCase()}) है। दिए गए मानों के अनुसार हल करने पर विकल्प (${correctOption.toUpperCase()}) प्राप्त होता है।`;
  }

  // 4. Extract Exam Source
  let exam = 'BPSC TRE 4.0 / Bihar STET';
  const examRegex = /(?:परीक्षा|Exam|Source)\s*[:\-]?\s*([^\n\r]+)/i;
  const examMatch = body.match(examRegex);
  if (examMatch) {
    exam = examMatch[1].trim();
  } else {
    const rawExamMatch = body.match(/(Bihar\s+STET[^\n\r]+|BPSC\s+Tre[^\n\r]+|STET\s+\d{4}[^\n\r]*)/i);
    if (rawExamMatch) {
      exam = rawExamMatch[1].trim();
    }
  }

  // 5. Locate Options Start
  // Multiple formats: (a) or (A) or A) or a) or (1)
  const optionPatterns = [
    /\((?:[aA]|1|अ|क)\)/,
    /(?:^|\s)[aA]\)\s+/,
    /(?:^|\s)[aA]\.\s+/
  ];

  let optStartIndex = -1;
  let matchedPatternType = 0;

  for (let i = 0; i < optionPatterns.length; i++) {
    const idx = body.search(optionPatterns[i]);
    if (idx !== -1) {
      optStartIndex = idx;
      matchedPatternType = i;
      break;
    }
  }

  if (optStartIndex === -1) {
    return null;
  }

  const questionText = body.slice(0, optStartIndex).trim();
  const optionsPart = body.slice(optStartIndex);

  let optA = '';
  let optB = '';
  let optC = '';
  let optD = '';
  let optE = '';

  const cleanOpt = (s: string) =>
    s
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/(?:उत्तर|Ans|परीक्षा|Exam|व्याख्या).*$/i, '')
      .trim();

  // Pattern A: Standard (a) ... (b) ... (c) ... (d) ... (e)
  if (matchedPatternType === 0) {
    const optAMatch = optionsPart.match(/\((?:[aA]|1|अ|क)\)\s*([\s\S]*?)(?=\((?:[bB]|2|ब|ख)\))/);
    const optBMatch = optionsPart.match(/\((?:[bB]|2|ब|ख)\)\s*([\s\S]*?)(?=\((?:[cC]|3|स|ग)\))/);
    const optCMatch = optionsPart.match(/\((?:[cC]|3|स|ग)\)\s*([\s\S]*?)(?=\((?:[dD]|4|द|घ)\))/);
    const optDMatch = optionsPart.match(/\((?:[dD]|4|द|घ)\)\s*([\s\S]*?)(?=(?:\((?:[eE]|5|य|ङ)\)|(?:उत्तर|Ans|परीक्षा|Bihar|व्याख्या)|$))/);
    const optEMatch = optionsPart.match(/\((?:[eE]|5|य|ङ)\)\s*([\s\S]*?)(?=(?:उत्तर|Ans|परीक्षा|Bihar|व्याख्या)|$)/);

    if (optAMatch && optBMatch && optCMatch && optDMatch) {
      optA = cleanOpt(optAMatch[1]);
      optB = cleanOpt(optBMatch[1]);
      optC = cleanOpt(optCMatch[1]);
      optD = cleanOpt(optDMatch[1]);
      if (optEMatch) optE = cleanOpt(optEMatch[1]);
    }
  } else {
    // Pattern B: A) ... B) ... C) ... D)
    const optAMatch = optionsPart.match(/[aA][\)\.]\s*([\s\S]*?)(?=[bB][\)\.])/);
    const optBMatch = optionsPart.match(/[bB][\)\.]\s*([\s\S]*?)(?=[cC][\)\.])/);
    const optCMatch = optionsPart.match(/[cC][\)\.]\s*([\s\S]*?)(?=[dD][\)\.])/);
    const optDMatch = optionsPart.match(/[dD][\)\.]\s*([\s\S]*?)(?=(?:[eE][\)\.]|(?:उत्तर|Ans|परीक्षा|Bihar|व्याख्या)|$))/);
    const optEMatch = optionsPart.match(/[eE][\)\.]\s*([\s\S]*?)(?=(?:उत्तर|Ans|परीक्षा|Bihar|व्याख्या)|$)/);

    if (optAMatch && optBMatch && optCMatch && optDMatch) {
      optA = cleanOpt(optAMatch[1]);
      optB = cleanOpt(optBMatch[1]);
      optC = cleanOpt(optCMatch[1]);
      optD = cleanOpt(optDMatch[1]);
      if (optEMatch) optE = cleanOpt(optEMatch[1]);
    }
  }

  // Fallback if not found
  if (!optA || !optB || !optC || !optD) {
    return null;
  }

  // Official BPSC Option E fallback if exam only provided 4 options
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
    isCustomE: !optE || optE.includes('उपर्युक्त में से कोई नहीं'),
    isUserAdded: true,
    createdAt: new Date().toISOString()
  };
}
