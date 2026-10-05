import {
  Question,
  MockTestSet,
  TestAttemptRecord,
  ThemeMode,
  CustomTestConfig,
  RegisteredTopic,
  SavedTestResult
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

export function sanitizeTestSet(t: any): MockTestSet {
  if (!t || typeof t !== 'object') {
    return {
      id: `invalid_set_${Math.random()}`,
      title: 'Untitled Test',
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
    title: String(t.title || 'Untitled Test'),
    subtitle: String(t.subtitle || ''),
    category: t.category || 'tri_topic',
    categoryTitle: t.categoryTitle || 'General',
    topicBadges: Array.isArray(t.topicBadges) ? t.topicBadges.map(String) : [],
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
    const existingKeys = new Set(DEFAULT_TOPICS.map((t) => t.key));
    const merged = [...DEFAULT_TOPICS, ...safeUserTopics.filter((t) => !existingKeys.has(t.key))];
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
    const existing = getAllRegisteredTopics();
    const filtered = existing.filter((t) => t.key !== safeKey);
    const updated = [...filtered, newTopic];
    localStorage.setItem(STORAGE_KEYS.REGISTERED_TOPICS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_topic_added', { detail: newTopic }));
    }
  } catch (err) {
    console.error('Failed to register topic', err);
  }

  return newTopic;
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

export function getDeletedTestIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_TEST_IDS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
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
    // Filter out from custom tests
    const filteredCustom = getSavedCustomTests().filter((t) => t.id !== testId);
    liveCloudTestsCache = filteredCustom;
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TESTS, JSON.stringify(filteredCustom));

    // Record testId in deleted list
    const deleted = new Set(getDeletedTestIds());
    deleted.add(testId);
    saveDeletedTestIds(Array.from(deleted));

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
    .filter((t) => t && t.id && !deletedIds.has(t.id))
    .map(sanitizeTestSet);
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
      const unusedPool = pool.filter(isQuestionUnused);
      const usedPool = pool.filter((q) => !isQuestionUnused(q));
      if (config.selectionMode === 'random') {
        const shuffUnused = [...unusedPool].sort(() => Math.random() - 0.5);
        const shuffUsed = [...usedPool].sort(() => Math.random() - 0.5);
        return [...shuffUnused, ...shuffUsed].slice(0, Math.min(reqCount, pool.length));
      } else {
        return [...unusedPool, ...usedPool].slice(0, Math.min(reqCount, pool.length));
      }
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
    Object.entries(config.topicDistribution).forEach(([tKey, reqCount]) => {
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

  if (selected.length === 0) {
    selected = allQuestions.slice(0, Math.min(config.questionCount || 10, allQuestions.length));
  }

  const testId = `custom_test_${Date.now()}`;
  const distinctTopics = Array.from(new Set(selected.map((q) => q.topicNameHindi || q.topic)));

  const newTest: MockTestSet = {
    id: testId,
    title: config.title || `Custom Practice Test (${selected.length} Questions)`,
    subtitle: config.subtitle || `Topics: ${distinctTopics.join(', ')}`,
    targetExam: config.targetExam || 'BPSC TRE 4.0 Mathematics (Custom Generated)',
    category: 'custom',
    categoryTitle: 'Custom Generated Tests',
    topicBadges: distinctTopics.slice(0, 4),
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

  const newTest: MockTestSet = {
    id: testId,
    title: `Weak Spots Re-attempt: ${parentTest.title}`,
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
    const existing = getAttemptRecords();
    const updated = [record, ...existing.slice(0, 49)];
    localStorage.setItem(STORAGE_KEYS.ATTEMPT_HISTORY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_attempt_saved', { detail: record }));
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