import {
  Question,
  MockTestSet,
  TestAttemptRecord,
  ThemeMode,
  CustomTestConfig,
  RegisteredTopic,
  SavedTestResult,
  QuestionResponse,
  TopicPerformanceStat
} from '../types';
import { lcmHcfQuestions } from '../data/lcmQuestions';
import { percentageQuestions } from '../data/percentageQuestions';
import { profitLossQuestions } from '../data/profitLossQuestions';
import { coordinateGeometryQuestions } from '../data/coordinateGeometryQuestions';
import { mensurationQuestions } from '../data/mensurationQuestions';
import { mockTestSets as defaultMockSets } from '../data/mockSets';

const STORAGE_KEYS = {
  CUSTOM_QUESTIONS: 'bpsc_custom_questions',
  DELETED_QUESTION_IDS: 'bpsc_deleted_question_ids',
  CUSTOM_TESTS: 'bpsc_custom_mock_sets',
  DELETED_TEST_IDS: 'bpsc_deleted_test_ids',
  BOOKMARKED_IDS: 'bpsc_bookmarked_questions',
  ATTEMPT_HISTORY: 'bpsc_attempt_records',
  FULL_SAVED_RESULTS: 'bpsc_full_results_archive',
  REGISTERED_TOPICS: 'bpsc_registered_topics',
  THEME: 'bpsc_app_theme'
};

export const DEFAULT_TOPICS: RegisteredTopic[] = [
  { key: 'number_system', labelHindi: 'संख्या पद्धति (Number System)', labelEnglish: 'Number System' },
  { key: 'lcm_hcf', labelHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)', labelEnglish: 'LCM & HCF' },
  { key: 'equations', labelHindi: 'रैखिक / द्विघात समीकरण (Linear / Quadratic Equations)', labelEnglish: 'Linear / Quadratic Equations' },
  { key: 'ratio_proportion', labelHindi: 'अनुपात और समानुपात (Ratio & Proportion)', labelEnglish: 'Ratio & Proportion' },
  { key: 'age_problems', labelHindi: 'आयु संबंधित प्रश्न (Age Related Questions)', labelEnglish: 'Age Related Questions' },
  { key: 'partnership', labelHindi: 'साझेदारी (Partnership)', labelEnglish: 'Partnership' },
  { key: 'average', labelHindi: 'औसत (Average)', labelEnglish: 'Average' },
  { key: 'percentage', labelHindi: 'प्रतिशत (Percentage)', labelEnglish: 'Percentage' },
  { key: 'profit_loss', labelHindi: 'लाभ और हानि (Profit & Loss)', labelEnglish: 'Profit & Loss' },
  { key: 'discount', labelHindi: 'बट्टा / छूट (Discount)', labelEnglish: 'Discount' },
  { key: 'simple_interest', labelHindi: 'साधारण ब्याज (Simple Interest)', labelEnglish: 'Simple Interest' },
  { key: 'compound_interest', labelHindi: 'चक्रवृद्धि ब्याज (Compound Interest)', labelEnglish: 'Compound Interest' },
  { key: 'time_work', labelHindi: 'कार्य और समय (Time & Work)', labelEnglish: 'Time & Work' },
  { key: 'pipe_cistern', labelHindi: 'पाइप और टंकी (Pipe & Cistern)', labelEnglish: 'Pipe & Cistern' },
  { key: 'time_distance', labelHindi: 'समय और दूरी (Time & Distance)', labelEnglish: 'Time & Distance' },
  { key: 'boats_stream', labelHindi: 'नाव और धारा (Boats & Stream)', labelEnglish: 'Boats & Stream' },
  { key: 'mixture', labelHindi: 'मिश्रण (Mixture / Alligation)', labelEnglish: 'Mixture' },
  { key: 'statistics', labelHindi: 'आंकड़े (Statistics)', labelEnglish: 'Statistics' },
  { key: 'stocks_shares', labelHindi: 'स्टॉक और शेयर (Stock & Shares)', labelEnglish: 'Stock & Shares' },
  { key: 'probability_perm_comb', labelHindi: 'प्रायिकता / क्रमचय और संचय (Probability / Permutation & Combination)', labelEnglish: 'Probability & Combination' },
  { key: 'progression', labelHindi: 'श्रेणी (Progression AP/GP)', labelEnglish: 'Progression' },
  { key: 'trigonometry', labelHindi: 'त्रिकोणमिति (Trigonometry)', labelEnglish: 'Trigonometry' },
  { key: 'height_distance', labelHindi: 'ऊंचाई और दूरी (Height & Distance)', labelEnglish: 'Height & Distance' },
  { key: 'mensuration', labelHindi: 'क्षेत्रमिति (Mensuration)', labelEnglish: 'Mensuration' },
  { key: 'geometry', labelHindi: 'ज्यामिति (Geometry)', labelEnglish: 'Geometry' },
  { key: 'coordinate_geometry', labelHindi: 'निर्देशांक ज्यामिति (Co-Ordinate Geometry)', labelEnglish: 'Coordinate Geometry' },
  { key: 'miscellaneous', labelHindi: 'विविध गणित (Miscellaneous)', labelEnglish: 'Miscellaneous' },
  { key: 'custom', labelHindi: 'विविध / अन्य गणित (Custom Topics)', labelEnglish: 'Custom & Miscellaneous' }
];

// Helper functions for multi-answer support
export function getQuestionCorrectKeys(q?: { correctOption?: string; correctOptions?: string[] } | null): ('a' | 'b' | 'c' | 'd' | 'e')[] {
  if (!q) return ['a'];
  if (Array.isArray(q.correctOptions) && q.correctOptions.length > 0) {
    const valid = q.correctOptions
      .map((k) => String(k).trim().toLowerCase())
      .filter((k) => ['a', 'b', 'c', 'd', 'e'].includes(k)) as ('a' | 'b' | 'c' | 'd' | 'e')[];
    if (valid.length > 0) return Array.from(new Set(valid));
  }
  const raw = String(q.correctOption || 'a').trim().toLowerCase();
  const split = raw
    .split(/[,/&+\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((k) => ['a', 'b', 'c', 'd', 'e'].includes(k)) as ('a' | 'b' | 'c' | 'd' | 'e')[];
  return split.length > 0 ? Array.from(new Set(split)) : ['a'];
}

export function isQuestionAnswerCorrect(
  q?: { correctOption?: string; correctOptions?: string[] } | null,
  selectedOption?: string | null
): boolean {
  if (!q || !selectedOption) return false;
  const sel = String(selectedOption).trim().toLowerCase();
  const keys = getQuestionCorrectKeys(q);
  return keys.includes(sel as any);
}

export function getQuestionCorrectDisplay(q?: { correctOption?: string; correctOptions?: string[] } | null): string {
  const keys = getQuestionCorrectKeys(q);
  return keys.map((k) => k.toUpperCase()).join(', ');
}

export function calculateTopicBreakdown(
  questions: Question[],
  responses: Record<string, QuestionResponse>
): Record<string, TopicPerformanceStat> {
  const breakdown: Record<string, TopicPerformanceStat> = {};

  for (const q of questions) {
    if (!q || !q.id) continue;
    const topicKey = q.topic || 'miscellaneous';
    const topicMeta = DEFAULT_TOPICS.find((t: RegisteredTopic) => t.key === topicKey);
    const topicLabel = topicMeta?.labelEnglish || topicKey;
    const topicLabelHindi = topicMeta?.labelHindi || q.topicNameHindi || topicKey;

    if (!breakdown[topicKey]) {
      breakdown[topicKey] = {
        topicKey,
        topicLabel,
        topicLabelHindi,
        total: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        accuracy: 0
      };
    }

    const stat = breakdown[topicKey];
    stat.total += 1;

    const userResp = responses ? responses[q.id] : undefined;
    const selected = userResp?.selectedOption;

    if (!selected) {
      stat.skipped += 1;
    } else if (isQuestionAnswerCorrect(q, selected)) {
      stat.correct += 1;
    } else {
      stat.incorrect += 1;
    }
  }

  for (const key of Object.keys(breakdown)) {
    const stat = breakdown[key];
    const attempted = stat.correct + stat.incorrect;
    stat.accuracy = attempted > 0 ? Math.round((stat.correct / attempted) * 100) : 0;
  }

  return breakdown;
}

// BULLETPROOF SANITIZERS (Prevents all .map crashes)
export function sanitizeQuestion(q: any): Question {
  if (!q || typeof q !== 'object') {
    return {
      id: `invalid_${Math.random()}`,
      exam: 'BPSC TRE 4.0',
      questionText: '',
      options: [
        { key: 'a', text: '' },
        { key: 'b', text: '' },
        { key: 'c', text: '' },
        { key: 'd', text: '' },
        { key: 'e', text: 'अनुत्तरित प्रश्न' }
      ],
      correctOption: 'e',
      correctOptions: ['e'],
      explanation: '',
      topic: 'custom',
      topicNameHindi: 'सामान्य'
    };
  }

  let safeCorrectOptions: ('a' | 'b' | 'c' | 'd' | 'e')[] = [];
  if (Array.isArray(q.correctOptions) && q.correctOptions.length > 0) {
    safeCorrectOptions = q.correctOptions
      .map((k: any) => String(k).trim().toLowerCase())
      .filter((k: string) => ['a', 'b', 'c', 'd', 'e'].includes(k)) as any;
  }

  if (safeCorrectOptions.length === 0) {
    const rawKey = String(q.correctOption || q.correctAnswer || q.answer || q.correct || 'e').trim().toLowerCase();
    const split = rawKey
      .split(/[,/&+\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((k) => ['a', 'b', 'c', 'd', 'e'].includes(k)) as any;
    if (split.length > 0) {
      safeCorrectOptions = split;
    } else {
      safeCorrectOptions = ['e'];
    }
  }

  safeCorrectOptions = Array.from(new Set(safeCorrectOptions));
  const safeCorrectOption = safeCorrectOptions.join(',') || 'e';

  const safeOptions = Array.isArray(q.options)
    ? q.options.map((opt: any) => ({
        key: String(opt?.key || 'a').toLowerCase() as 'a' | 'b' | 'c' | 'd' | 'e',
        text: String(opt?.text || opt?.textHindi || '')
      }))
    : [];

  return {
    ...q,
    id: String(q.id || `q_${Math.random()}`),
    exam: String(q.exam || 'BPSC TRE 4.0'),
    questionText: String(q.questionText || q.text || ''),
    options: safeOptions,
    correctOption: safeCorrectOption,
    correctOptions: safeCorrectOptions,
    explanation: String(q.explanation || ''),
    topic: String(q.topic || 'custom'),
    topicNameHindi: String(q.topicNameHindi || 'सामान्य')
  };
}

export function cleanTitleToEnglish(rawTitle: string): string {
  if (!rawTitle || typeof rawTitle !== 'string') return 'BPSC TRE 4.0: Mathematics Mock Test';

  let title = rawTitle;

  // Replace common Hindi mathematical terms with English
  title = title
    .replace(/क्षेत्रमिति/g, 'Mensuration')
    .replace(/निर्देशांक ज्यामिति/g, 'Coordinate Geometry')
    .replace(/ज्यामिति/g, 'Geometry')
    .replace(/त्रिकोणमिति/g, 'Trigonometry')
    .replace(/संख्या पद्धति/g, 'Number System')
    .replace(/ल\.स\. और म\.स\.|ल\.स\. व म\.स\.|ल\.स\.|म\.स\./g, 'LCM & HCF')
    .replace(/प्रतिशत/g, 'Percentage')
    .replace(/लाभ और हानि|लाभ व हानि/g, 'Profit & Loss')
    .replace(/अनुपात और समानुपात|अनुपात व समानुपात/g, 'Ratio & Proportion')
    .replace(/औसत/g, 'Average')
    .replace(/साधारण ब्याज/g, 'Simple Interest')
    .replace(/चक्रवृद्धि ब्याज/g, 'Compound Interest')
    .replace(/समय और कार्य|समय व कार्य/g, 'Time & Work')
    .replace(/नल और टंकी|नल व टंकी/g, 'Pipes & Cisterns')
    .replace(/चाल, समय और दूरी|समय, चाल और दूरी/g, 'Speed, Time & Distance')
    .replace(/नाव और धारा|नाव व धारा/g, 'Boats & Streams')
    .replace(/साझेदारी/g, 'Partnership')
    .replace(/छूट|बट्टा/g, 'Discount')
    .replace(/द्विघात समीकरण|समीकरण/g, 'Equations')
    .replace(/समानांतर श्रेणी/g, 'Progression')
    .replace(/सांख्यिकी/g, 'Statistics')
    .replace(/प्रायिकता/g, 'Probability')
    .replace(/चित्र सहित|चित्र आधारित/g, 'Diagram-Based')
    .replace(/गणित/g, 'Mathematics')
    .replace(/मॉक टेस्ट/g, 'Mock Test')
    .replace(/पावर टेस्ट/g, 'Power Test')
    .replace(/स्पीड स्प्रिंट/g, 'Speed Sprint')
    .replace(/स्पेशल/g, 'Special')
    .replace(/प्रामाणिक प्रश्न/g, 'Real Questions')
    .replace(/प्रश्न/g, 'Questions')
    .replace(/एवं|व|और/g, '&');

  // Remove any remaining Devanagari characters
  title = title.replace(/[\u0900-\u097F]/g, '');

  // Clean empty parentheses, duplicated separators, leading/trailing hyphens/colons
  title = title
    .replace(/\(\s*\)/g, '')
    .replace(/:\s*:/g, ':')
    .replace(/-\s*-/g, '-')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/^[:\-\s]+|[:\-\s]+$/g, '');

  if (!title || title.length < 3) {
    return 'BPSC TRE 4.0: Mathematics Mock Test';
  }
  return title;
}

export function sanitizeTestSet(t: any): MockTestSet {
  if (!t || typeof t !== 'object') {
    return {
      id: `invalid_set_${Math.random()}`,
      title: 'BPSC TRE 4.0: Mathematics Mock Test',
      subtitle: '',
      targetExam: 'BPSC TRE 4.0',
      category: 'tri_topic',
      categoryTitle: 'General',
      topicBadges: [],
      totalQuestions: 0,
      totalTimeMinutes: 30,
      questions: []
    };
  }
  const safeQuestions = Array.isArray(t.questions)
    ? t.questions.map(sanitizeQuestion)
    : [];
  return {
    ...t,
    id: String(t.id || `set_${Math.random()}`),
    title: cleanTitleToEnglish(String(t.title || 'BPSC TRE 4.0: Mathematics Mock Test')),
    subtitle: String(t.subtitle || ''),
    category: t.category || 'tri_topic',
    categoryTitle: t.categoryTitle || 'General',
    topicBadges: Array.isArray(t.topicBadges)
      ? t.topicBadges.map((b: any) => cleanTitleToEnglish(String(b || ''))).filter(Boolean)
      : [],
    questions: safeQuestions,
    totalQuestions: t.totalQuestions || safeQuestions.length,
    totalTimeMinutes: t.totalTimeMinutes || Math.max(5, safeQuestions.length)
  };
}

export function getDefaultQuestions(): Question[] {
  return [
    ...lcmHcfQuestions,
    ...percentageQuestions,
    ...profitLossQuestions,
    ...coordinateGeometryQuestions,
    ...mensurationQuestions
  ].map(sanitizeQuestion);
}

export function generateTopicKey(labelHindi: string, labelEnglish?: string, keyHint?: string): string {
  if (keyHint) {
    const cleaned = keyHint.trim().toLowerCase().replace(/[^a-z0-9_]/gi, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    if (cleaned.length > 0 && /[a-z0-9]/.test(cleaned)) {
      return cleaned;
    }
  }

  if (labelEnglish) {
    const cleaned = labelEnglish.trim().toLowerCase().replace(/[^a-z0-9_]/gi, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    if (cleaned.length > 0 && /[a-z0-9]/.test(cleaned)) {
      return cleaned;
    }
  }

  if (labelHindi) {
    const cleaned = labelHindi.trim().toLowerCase().replace(/[^a-z0-9_]/gi, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    if (cleaned.length > 0 && /[a-z0-9]/.test(cleaned)) {
      return cleaned;
    }
  }

  return `topic_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// --- TOPICS DATABASE ---
export function getAllRegisteredTopics(): RegisteredTopic[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_TOPICS);
    const userTopics: RegisteredTopic[] = raw ? JSON.parse(raw) : [];
    const safeUserTopics = (Array.isArray(userTopics) ? userTopics : []).filter(
      (t) => t && t.key && typeof t.key === 'string' && /[a-z0-9]/i.test(t.key) && t.key !== '_____'
    );
    const userTopicsMap = new Map<string, RegisteredTopic>();
    safeUserTopics.forEach((t) => userTopicsMap.set(t.key, t));

    // Merge overrides with DEFAULT_TOPICS preserving original order
    const merged = DEFAULT_TOPICS.map((t) => {
      if (userTopicsMap.has(t.key)) {
        return { ...t, ...userTopicsMap.get(t.key) };
      }
      return t;
    });

    // Append any custom registered topics not present in DEFAULT_TOPICS
    safeUserTopics.forEach((t) => {
      if (!merged.some((m) => m.key === t.key)) {
        merged.push(t);
      }
    });

    return merged;
  } catch {
    return DEFAULT_TOPICS;
  }
}

export function registerNewTopic(key: string, labelHindi: string, labelEnglish: string): RegisteredTopic {
  const safeKey = generateTopicKey(labelHindi, labelEnglish, key);
  const newTopic: RegisteredTopic = {
    key: safeKey,
    labelHindi: labelHindi.trim(),
    labelEnglish: (labelEnglish || labelHindi).trim(),
    isUserCreated: true
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_TOPICS);
    const userTopics: RegisteredTopic[] = raw ? JSON.parse(raw) : [];
    const filtered = (Array.isArray(userTopics) ? userTopics : []).filter((t) => t.key !== safeKey);
    const updated = [...filtered, newTopic];
    localStorage.setItem(STORAGE_KEYS.REGISTERED_TOPICS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_topic_added', { detail: newTopic }));
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
    }
  } catch (err) {
    console.error('Failed to register topic', err);
  }

  return newTopic;
}

export function updateRegisteredTopic(
  key: string,
  newLabelHindi: string,
  newLabelEnglish: string
): RegisteredTopic {
  const existing = getAllRegisteredTopics();
  const current = existing.find((t) => t.key === key);
  const updatedTopic: RegisteredTopic = {
    key,
    labelHindi: newLabelHindi.trim() || (current?.labelHindi || key),
    labelEnglish: newLabelEnglish.trim() || (current?.labelEnglish || key),
    isUserCreated: current?.isUserCreated ?? false
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_TOPICS);
    const userTopics: RegisteredTopic[] = raw ? JSON.parse(raw) : [];
    const filtered = (Array.isArray(userTopics) ? userTopics : []).filter((t) => t.key !== key);
    filtered.push(updatedTopic);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_TOPICS, JSON.stringify(filtered));

    // Also update custom questions that reference this topic key
    const custom = getCustomQuestions();
    let questionsChanged = false;
    const updatedQuestions = custom.map((q) => {
      if (q.topic === key) {
        questionsChanged = true;
        return {
          ...q,
          topicNameHindi: updatedTopic.labelHindi
        };
      }
      return q;
    });

    if (questionsChanged) {
      saveCustomQuestions(updatedQuestions);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_topic_updated', { detail: updatedTopic }));
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
    }
  } catch (err) {
    console.error('Failed to update topic', err);
  }

  return updatedTopic;
}

// --- QUESTIONS DATABASE & LIVE CLOUD CACHE ---
let liveCloudQuestionsCache: Question[] | null = null;
let liveCloudTestsCache: MockTestSet[] | null = null;

export function setLiveCloudQuestions(questions: Question[]): void {
  const safeQuestions = Array.isArray(questions) ? questions.map(sanitizeQuestion) : [];
  liveCloudQuestionsCache = safeQuestions;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(safeQuestions));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

export function setLiveCloudTests(tests: MockTestSet[]): void {
  const safeTests = Array.isArray(tests) ? tests.map(sanitizeTestSet) : [];
  liveCloudTestsCache = safeTests;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TESTS, JSON.stringify(safeTests));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

export function getLiveCloudQuestionsCache(): Question[] | null {
  return liveCloudQuestionsCache;
}

export function getCustomQuestions(): Question[] {
  if (liveCloudQuestionsCache && Array.isArray(liveCloudQuestionsCache) && liveCloudQuestionsCache.length > 0) {
    return liveCloudQuestionsCache;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(sanitizeQuestion) : [];
  } catch {
    return [];
  }
}

export function saveCustomQuestions(questions: Question[]): void {
  const safeQuestions = Array.isArray(questions) ? questions.map(sanitizeQuestion) : [];
  liveCloudQuestionsCache = safeQuestions;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(safeQuestions));
  } catch (err) {
    console.error('Failed to save questions to localStorage', err);
  }
}

export function getDeletedQuestionIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_QUESTION_IDS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDeletedQuestionIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DELETED_QUESTION_IDS, JSON.stringify(Array.isArray(ids) ? ids : []));
  } catch (err) {
    console.error('Failed to save deleted question ids', err);
  }
}

export function getAllQuestionBank(): Question[] {
  const deletedIds = new Set(getDeletedQuestionIds());
  let rawList: Question[] = [];

  if (liveCloudQuestionsCache && Array.isArray(liveCloudQuestionsCache) && liveCloudQuestionsCache.length > 0) {
    const map = new Map<string, Question>();
    liveCloudQuestionsCache.forEach((q) => {
      if (q && q.id) map.set(q.id, sanitizeQuestion(q));
    });
    getDefaultQuestions().forEach((q) => {
      if (q && q.id && !map.has(q.id)) map.set(q.id, sanitizeQuestion(q));
    });
    rawList = Array.from(map.values());
  } else {
    const custom = getCustomQuestions();
    const defaults = getDefaultQuestions();

    const map = new Map<string, Question>();
    defaults.forEach((q) => {
      if (q && q.id) map.set(q.id, sanitizeQuestion(q));
    });
    if (Array.isArray(custom)) {
      custom.forEach((q) => {
        if (q && q.id) map.set(q.id, sanitizeQuestion(q));
      });
    }
    rawList = Array.from(map.values());
  }

  return rawList
    .filter((q) => q && q.id && !deletedIds.has(q.id))
    .map(sanitizeQuestion);
}

export function addQuestionsToBank(newQuestions: Question[]): { count: number; total: number } {
  const currentBank = getAllQuestionBank();
  const existingIds = new Set(currentBank.map((q) => q.id));
  
  const prepared: Question[] = (Array.isArray(newQuestions) ? newQuestions : []).map((q, idx) => {
    const safeQ = sanitizeQuestion(q);
    if (!safeQ.id || existingIds.has(safeQ.id)) {
      return {
        ...safeQ,
        id: `custom_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`
      };
    }
    return safeQ;
  });

  const updated = [...currentBank, ...prepared];
  saveCustomQuestions(updated);

  const deletedIds = new Set(getDeletedQuestionIds());
  prepared.forEach((q) => deletedIds.delete(q.id));
  saveDeletedQuestionIds(Array.from(deletedIds));

  if (typeof window !== 'undefined' && prepared.length > 0) {
    window.dispatchEvent(new CustomEvent('bpsc_questions_added', { detail: prepared }));
    window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
  }

  return { count: prepared.length, total: getAllQuestionBank().length };
}

export function updateQuestionInBank(updatedQuestion: Question): void {
  const custom = getCustomQuestions();
  const safeQ = sanitizeQuestion(updatedQuestion);
  const index = custom.findIndex((q) => q.id === safeQ.id);
  
  if (index !== -1) {
    custom[index] = safeQ;
    saveCustomQuestions(custom);
  } else {
    saveCustomQuestions([safeQ, ...custom]);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bpsc_question_updated', { detail: safeQ }));
    window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
  }
}

export function deleteCustomQuestion(id: string): void {
  const custom = getCustomQuestions().filter((q) => q.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(custom));
  } catch (err) {
    console.error('Failed to save custom questions', err);
  }

  if (liveCloudQuestionsCache && Array.isArray(liveCloudQuestionsCache)) {
    liveCloudQuestionsCache = liveCloudQuestionsCache.filter((q) => q.id !== id);
  }

  const deleted = new Set(getDeletedQuestionIds());
  deleted.add(id);
  saveDeletedQuestionIds(Array.from(deleted));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bpsc_questions_deleted', { detail: [id] }));
    window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
  }
}

export function deleteMultipleQuestions(ids: string[]): number {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  const idSet = new Set(ids);
  const custom = getCustomQuestions().filter((q) => !idSet.has(q.id));
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(custom));
  } catch (err) {
    console.error('Failed to save custom questions', err);
  }

  if (liveCloudQuestionsCache && Array.isArray(liveCloudQuestionsCache)) {
    liveCloudQuestionsCache = liveCloudQuestionsCache.filter((q) => !idSet.has(q.id));
  }

  const deleted = new Set(getDeletedQuestionIds());
  ids.forEach((id) => deleted.add(id));
  saveDeletedQuestionIds(Array.from(deleted));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bpsc_questions_deleted', { detail: ids }));
    window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
  }

  return ids.length;
}

// --- BOOKMARKS ---
export function getBookmarkedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKED_IDS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleBookmarkQuestion(questionId: string): boolean {
  const ids = new Set(getBookmarkedIds());
  let isBookmarked = false;
  if (ids.has(questionId)) {
    ids.delete(questionId);
    isBookmarked = false;
  } else {
    ids.add(questionId);
    isBookmarked = true;
  }
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKED_IDS, JSON.stringify(Array.from(ids)));
  } catch (err) {
    console.error('Failed to update bookmarks', err);
  }
  return isBookmarked;
}

// --- CUSTOM GENERATED TESTS ---
export function getSavedCustomTests(): MockTestSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_TESTS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(sanitizeTestSet) : [];
  } catch {
    return [];
  }
}

export function saveCustomTest(testSet: MockTestSet): void {
  try {
    const safeSet = sanitizeTestSet(testSet);
    const existing = getSavedCustomTests().filter((t) => t.id !== safeSet.id);
    const updated = [safeSet, ...existing];
    liveCloudTestsCache = updated;
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TESTS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_test_saved', { detail: safeSet }));
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
    }
  } catch (err) {
    console.error('Failed to save custom test', err);
  }
}

export function normalizeTestTitle(title?: string): string {
  if (!title) return '';
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function getDeletedTestIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_TEST_IDS);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Sanitize: filter out legacy generic 'title_' and 'sub_' masks that broke test counts
    const cleanIds = parsed.filter(
      (id: string) => typeof id === 'string' && !id.startsWith('title_') && !id.startsWith('sub_')
    );
    if (cleanIds.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEYS.DELETED_TEST_IDS, JSON.stringify(cleanIds));
    }
    return cleanIds;
  } catch {
    return [];
  }
}

export function saveDeletedTestIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DELETED_TEST_IDS, JSON.stringify(Array.isArray(ids) ? ids : []));
  } catch (err) {
    console.error('Failed to save deleted test ids', err);
  }
}

export function deleteTest(testId: string): void {
  try {
    const allKnown = getAllAvailableTests();
    const target = allKnown.find((t) => t.id === testId);

    // Record testId in deleted list strictly by ID (never mask tests by generic title)
    const deleted = new Set(getDeletedTestIds());
    deleted.add(testId);
    if (target?.id) deleted.add(target.id);
    saveDeletedTestIds(Array.from(deleted));

    // Filter out from local custom tests strictly by ID
    const filteredCustom = getSavedCustomTests().filter((t) => {
      if (t.id === testId) return false;
      if (target?.id && t.id === target.id) return false;
      return true;
    });
    liveCloudTestsCache = filteredCustom;
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TESTS, JSON.stringify(filteredCustom));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_test_deleted', { detail: testId }));
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
    }
  } catch (err) {
    console.error('Failed to delete test', err);
  }
}

export function deleteCustomTest(testId: string): void {
  deleteTest(testId);
}

export function restoreAllDefaultTests(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DELETED_TEST_IDS);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
    }
  } catch (err) {
    console.error('Failed to restore default tests', err);
  }
}

export function getAllAvailableTests(): MockTestSet[] {
  const deletedIds = new Set(getDeletedTestIds());
  const testMap = new Map<string, MockTestSet>();
  
  if (Array.isArray(defaultMockSets)) {
    defaultMockSets.forEach((t) => { if (t && t.id) testMap.set(t.id, sanitizeTestSet(t)); });
  }

  const customTests = getSavedCustomTests();
  if (Array.isArray(customTests)) {
    customTests.forEach((t) => { if (t && t.id) testMap.set(t.id, sanitizeTestSet(t)); });
  }

  if (liveCloudTestsCache && Array.isArray(liveCloudTestsCache)) {
    liveCloudTestsCache.forEach((t) => { if (t && t.id) testMap.set(t.id, sanitizeTestSet(t)); });
  }

  return Array.from(testMap.values())
    .filter((t) => {
      if (!t || !t.id) return false;
      if (deletedIds.has(t.id)) return false;
      return true;
    })
    .map(sanitizeTestSet);
}

export function getTestsForTopic(
  topicKey: string,
  topicLabelEn?: string,
  topicLabelHi?: string
): MockTestSet[] {
  const allTests = getAllAvailableTests();
  const lowerEn = (topicLabelEn || '').trim().toLowerCase();
  const lowerHi = (topicLabelHi || '').trim().toLowerCase();
  const keyLower = topicKey.trim().toLowerCase();

  return allTests.filter((test) => {
    // 1. Check topicBreakdown
    if (Array.isArray(test.topicBreakdown)) {
      for (const seg of test.topicBreakdown) {
        if (seg && typeof seg === 'object' && seg.count > 0) {
          const kLower = (seg.topicKey || seg.label || '').toLowerCase();
          if (kLower === keyLower || (lowerEn && kLower.includes(lowerEn)) || (lowerHi && kLower.includes(lowerHi))) {
            return true;
          }
        }
      }
    }
    // 2. Check topicBadges
    if (Array.isArray(test.topicBadges)) {
      for (const badge of test.topicBadges) {
        const bLower = badge.toLowerCase();
        if (bLower === keyLower || (lowerEn && bLower.includes(lowerEn)) || (lowerHi && bLower.includes(lowerHi))) {
          return true;
        }
      }
    }
    // 3. Check title & subtitle
    const titleLower = (test.title || '').toLowerCase();
    const subLower = (test.subtitle || '').toLowerCase();
    if (lowerEn && (titleLower.includes(lowerEn) || subLower.includes(lowerEn))) {
      return true;
    }
    if (lowerHi && (titleLower.includes(lowerHi) || subLower.includes(lowerHi))) {
      return true;
    }
    // 4. Check questions inside the test
    if (Array.isArray(test.questions) && test.questions.length > 0) {
      const matchCount = test.questions.filter((q) => {
        if (!q) return false;
        if (q.topic && q.topic.toLowerCase() === keyLower) return true;
        if (lowerEn && q.topic && q.topic.toLowerCase().includes(lowerEn)) return true;
        if (lowerHi && q.topicNameHindi && q.topicNameHindi.toLowerCase().includes(lowerHi)) return true;
        return false;
      }).length;
      if (matchCount >= 2 || (test.questions.length > 0 && matchCount / test.questions.length >= 0.25)) {
        return true;
      }
    }
    return false;
  });
}

export interface TestTopicBreakdownItem {
  topicKey: string;
  topicName: string;
  count: number;
  percentage: number;
}

export function getTestTopicBreakdown(test?: MockTestSet | null): TestTopicBreakdownItem[] {
  if (!test) return [];

  // 1. If questions array exists and has elements, calculate directly from actual questions
  if (Array.isArray(test.questions) && test.questions.length > 0) {
    const map = new Map<string, { topicName: string; count: number }>();
    const registered = getAllRegisteredTopics();
    const registeredMap = new Map(registered.map((r) => [r.key, r.labelHindi]));

    for (const q of test.questions) {
      if (!q) continue;
      const key = q.topic || 'general';
      const name = q.topicNameHindi || registeredMap.get(key) || q.topicName || q.topic || 'विविध गणित';
      if (!map.has(key)) {
        map.set(key, { topicName: name, count: 0 });
      }
      map.get(key)!.count += 1;
    }

    const total = test.questions.length;
    return Array.from(map.entries())
      .map(([topicKey, val]) => ({
        topicKey,
        topicName: val.topicName,
        count: val.count,
        percentage: Math.round((val.count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  // 2. Fallback to topicBreakdown array if stored
  if (Array.isArray(test.topicBreakdown) && test.topicBreakdown.length > 0) {
    const total = test.topicBreakdown.reduce((sum, s) => sum + (s.count || 0), 0) || test.totalQuestions || 1;
    return test.topicBreakdown.map((tb) => ({
      topicKey: tb.topicKey,
      topicName: tb.label,
      count: tb.count,
      percentage: Math.round((tb.count / total) * 100)
    }));
  }

  return [];
}

export function getUsedQuestionsInfo(): {
  usedIds: Set<string>;
  usedTextSet: Set<string>;
  questionUsageMap: Map<string, string[]>;
} {
  const tests = getAllAvailableTests();
  const usedIds = new Set<string>();
  const usedTextSet = new Set<string>();
  const questionUsageMap = new Map<string, string[]>();

  tests.forEach((t) => {
    if (Array.isArray(t.questions)) {
      t.questions.forEach((q) => {
        if (q && q.id) {
          usedIds.add(q.id);
          const current = questionUsageMap.get(q.id) || [];
          if (!current.includes(t.title)) {
            current.push(t.title);
          }
          questionUsageMap.set(q.id, current);
        }
        if (q && q.questionText) {
          const norm = q.questionText.trim().toLowerCase().replace(/\s+/g, ' ');
          if (norm.length > 5) {
            usedTextSet.add(norm);
          }
        }
      });
    }
  });

  return { usedIds, usedTextSet, questionUsageMap };
}

export function createCustomMockTest(config: CustomTestConfig): MockTestSet {
  const allQuestions = getAllQuestionBank();
  let selected: Question[] = [];

  const { usedIds, usedTextSet } = getUsedQuestionsInfo();
  const isQuestionUnused = (q: Question) => {
    if (usedIds.has(q.id)) return false;
    const norm = q.questionText.trim().toLowerCase().replace(/\s+/g, ' ');
    if (norm.length > 5 && usedTextSet.has(norm)) return false;
    return true;
  };

  const processPool = (pool: Question[], reqCount: number) => {
    if (config.preferUnused) {
      // Strictly fresh questions only - never reuse already tested questions
      const unusedPool = pool.filter(isQuestionUnused);
      const candidates = [...unusedPool].sort(() => Math.random() - 0.5);
      return candidates.slice(0, Math.min(reqCount, candidates.length));
    } else {
      const candidates = config.selectionMode === 'random' ? [...pool].sort(() => Math.random() - 0.5) : pool;
      return candidates.slice(0, Math.min(reqCount, pool.length));
    }
  };

  if (config.creationMode === 'direct_paste' && Array.isArray(config.directQuestions)) {
    selected = [...config.directQuestions].map(sanitizeQuestion);
  } else if (config.creationMode === 'handpick' && Array.isArray(config.specificQuestionIds)) {
    const idSet = new Set(config.specificQuestionIds);
    selected = allQuestions.filter((q) => idSet.has(q.id));
  } else if (config.topicDistribution && Object.keys(config.topicDistribution).length > 0) {
    // Only process topics that are currently selected (filter out stale keys from other topics)
    const allowedKeys = Array.isArray(config.selectedTopics) && config.selectedTopics.length > 0 && !config.selectedTopics.includes('all')
      ? new Set(config.selectedTopics)
      : null;

    Object.entries(config.topicDistribution).forEach(([tKey, reqCount]) => {
      if (allowedKeys && !allowedKeys.has(tKey)) return;
      if (reqCount <= 0) return;
      const topicPool = allQuestions.filter((q) => q.topic === tKey);
      selected.push(...processPool(topicPool, reqCount));
    });
  } else {
    let pool = allQuestions;
    if (Array.isArray(config.selectedTopics) && config.selectedTopics.length > 0 && !config.selectedTopics.includes('all')) {
      pool = pool.filter((q) => config.selectedTopics.includes(q.topic));
    }
    if (config.selectionMode === 'bookmarked') {
      const bIds = new Set(getBookmarkedIds());
      pool = pool.filter((q) => bIds.has(q.id));
    }
    const count = config.questionCount || 20;
    selected = processPool(pool, count);
  }

  // Ensure total questions count strictly respects user request limit if defined
  if (config.questionCount && config.questionCount > 0 && selected.length > config.questionCount) {
    selected = selected.slice(0, config.questionCount);
  }

  if (selected.length === 0 && config.creationMode !== 'handpick') {
    const fallbackPool = config.preferUnused ? allQuestions.filter(isQuestionUnused) : allQuestions;
    const targetPool = fallbackPool.length > 0 ? fallbackPool : allQuestions;
    selected = targetPool.slice(0, Math.min(config.questionCount || 10, targetPool.length));
  }

  // Universal Random Shuffle: Always mix & shuffle questions so tests are unpredictable and realistic
  if (config.selectionMode !== 'sequential') {
    selected = [...selected].sort(() => Math.random() - 0.5);
  }

  const testId = `custom_test_${Date.now()}`;
  const topicsMap = new Map(getAllRegisteredTopics().map((t) => [t.key, t.labelEnglish]));
  const distinctTopicLabels = Array.from(
    new Set(
      selected.map((q) => (q.topic && topicsMap.get(q.topic)) ? topicsMap.get(q.topic)! : (q.topic || 'Mathematics'))
    )
  );

  const cleanTitle = cleanTitleToEnglish(config.title || `BPSC TRE 4.0 Custom Practice Test (${selected.length} Qs)`);

  const newTest: MockTestSet = {
    id: testId,
    title: cleanTitle,
    subtitle: config.subtitle || `Chapters: ${distinctTopicLabels.join(', ')}`,
    targetExam: config.targetExam || 'BPSC TRE 4.0 Mathematics (Custom Generated)',
    category: 'custom',
    categoryTitle: 'Custom Generated Tests',
    topicBadges: distinctTopicLabels.slice(0, 4),
    totalQuestions: selected.length,
    totalTimeMinutes: config.timeMinutes > 0 ? config.timeMinutes : selected.length,
    questions: selected,
    negativeMarkingValue: config.negativeMarking ?? 0.33,
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  saveCustomTest(newTest);
  return newTest;
}

export function createReattemptMissedQuestionsTest(parentTest: MockTestSet, missedQuestionIds: string[]): MockTestSet {
  const missedSet = new Set(Array.isArray(missedQuestionIds) ? missedQuestionIds : []);
  const questions = (Array.isArray(parentTest.questions) ? parentTest.questions : []).filter((q) => missedSet.has(q.id));
  const testId = `reattempt_${Date.now()}`;

  const cleanTitle = cleanTitleToEnglish(`Weak Spots Re-attempt: ${parentTest.title}`);

  const newTest: MockTestSet = {
    id: testId,
    title: cleanTitle,
    subtitle: `Targeted practice for ${questions.length} incorrect & skipped questions`,
    targetExam: parentTest.targetExam,
    category: 'custom',
    categoryTitle: 'Targeted Re-attempt Tests',
    topicBadges: ['Mistakes Review', 'Targeted Re-attempt'],
    totalQuestions: questions.length,
    totalTimeMinutes: Math.max(5, questions.length),
    questions,
    negativeMarkingValue: parentTest.negativeMarkingValue ?? 0.33,
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  saveCustomTest(newTest);
  return newTest;
}

// --- FULL TEST RESULTS & ATTEMPTS DATABASE ---
export function getSavedTestResults(): SavedTestResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FULL_SAVED_RESULTS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFullTestResult(result: SavedTestResult): void {
  try {
    const existing = getSavedTestResults();
    const updated = [result, ...existing.slice(0, 49)];
    localStorage.setItem(STORAGE_KEYS.FULL_SAVED_RESULTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save full test result', err);
  }
}

export function deleteSavedTestResult(resultId: string): void {
  try {
    const existingResults = getSavedTestResults();
    const targetResult = existingResults.find((r) => r.id === resultId);
    const filteredResults = existingResults.filter((r) => r.id !== resultId);
    localStorage.setItem(STORAGE_KEYS.FULL_SAVED_RESULTS, JSON.stringify(filteredResults));

    // Also remove corresponding record from attempt history if matching
    if (targetResult) {
      const attempts = getAttemptRecords().filter(
        (a) => !(a.testId === targetResult.setId && a.date === targetResult.dateFormatted)
      );
      localStorage.setItem(STORAGE_KEYS.ATTEMPT_HISTORY, JSON.stringify(attempts));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_history_deleted', { detail: resultId }));
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
    }
  } catch (err) {
    console.error('Failed to delete saved result', err);
  }
}

export function getAttemptRecords(): TestAttemptRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPT_HISTORY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAttemptRecord(record: TestAttemptRecord): void {
  try {
    const enrichedRecord: TestAttemptRecord = {
      ...record,
      completedAtIso: record.completedAtIso || new Date().toISOString(),
      studentName: record.studentName || 'Priya Patel'
    };
    const existing = getAttemptRecords();
    const updated = [enrichedRecord, ...existing.slice(0, 49)];
    localStorage.setItem(STORAGE_KEYS.ATTEMPT_HISTORY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_attempt_saved', { detail: enrichedRecord }));
    }
  } catch (err) {
    console.error('Failed to save attempt record', err);
  }
}

export function deleteAttemptRecord(index: number): void {
  try {
    const attempts = getAttemptRecords();
    if (index >= 0 && index < attempts.length) {
      attempts.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.ATTEMPT_HISTORY, JSON.stringify(attempts));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bpsc_history_deleted'));
        window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
      }
    }
  } catch (err) {
    console.error('Failed to delete attempt record', err);
  }
}

export function clearAllHistoryRecords(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.FULL_SAVED_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.ATTEMPT_HISTORY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_history_deleted'));
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
    }
  } catch (err) {
    console.error('Failed to clear history records', err);
  }
}

// --- FULL DATABASE BACKUP & RESTORE ---
export function clearEntireDatabase(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_QUESTION_IDS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_TESTS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_TEST_IDS);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKED_IDS);
    localStorage.removeItem(STORAGE_KEYS.ATTEMPT_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.FULL_SAVED_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.REGISTERED_TOPICS);

    liveCloudQuestionsCache = [];
    liveCloudTestsCache = [];

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
      window.dispatchEvent(new CustomEvent('bpsc_database_cleared'));
    }
  } catch (err) {
    console.error('Failed to clear entire database:', err);
  }
}

export function exportFullDatabaseJson(): string {
  const dbDump = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    registeredTopics: getAllRegisteredTopics(),
    customQuestions: getCustomQuestions(),
    deletedQuestionIds: getDeletedQuestionIds(),
    customTests: getSavedCustomTests(),
    bookmarks: getBookmarkedIds(),
    attemptHistory: getAttemptRecords(),
    savedResults: getSavedTestResults()
  };
  return JSON.stringify(dbDump, null, 2);
}

export function importFullDatabaseJson(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (data.customQuestions && Array.isArray(data.customQuestions)) {
      saveCustomQuestions(data.customQuestions);
    }
    if (data.deletedQuestionIds && Array.isArray(data.deletedQuestionIds)) {
      saveDeletedQuestionIds(data.deletedQuestionIds);
    }
    if (data.registeredTopics && Array.isArray(data.registeredTopics)) {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_TOPICS, JSON.stringify(data.registeredTopics));
    }
    if (data.customTests && Array.isArray(data.customTests)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TESTS, JSON.stringify(data.customTests));
    }
    if (data.bookmarks && Array.isArray(data.bookmarks)) {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKED_IDS, JSON.stringify(data.bookmarks));
    }
    if (data.attemptHistory && Array.isArray(data.attemptHistory)) {
      localStorage.setItem(STORAGE_KEYS.ATTEMPT_HISTORY, JSON.stringify(data.attemptHistory));
    }
    if (data.savedResults && Array.isArray(data.savedResults)) {
      localStorage.setItem(STORAGE_KEYS.FULL_SAVED_RESULTS, JSON.stringify(data.savedResults));
    }
    return { success: true, message: 'Database successfully imported!' };
  } catch (err: any) {
    return { success: false, message: `Import failed: ${err.message}` };
  }
}

// --- THEME ---
export function getStoredTheme(): ThemeMode {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (theme === 'dark' || theme === 'light') return theme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

export function setStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (err) {
    console.error('Failed to set theme', err);
  }
}