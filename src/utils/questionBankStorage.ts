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
import { mockTestSets as defaultMockSets } from '../data/mockSets';

const STORAGE_KEYS = {
  CUSTOM_QUESTIONS: 'bpsc_custom_questions',
  DELETED_QUESTION_IDS: 'bpsc_deleted_question_ids',
  CUSTOM_TESTS: 'bpsc_custom_mock_sets',
  BOOKMARKED_IDS: 'bpsc_bookmarked_questions',
  ATTEMPT_HISTORY: 'bpsc_attempt_records',
  FULL_SAVED_RESULTS: 'bpsc_full_results_archive',
  REGISTERED_TOPICS: 'bpsc_registered_topics',
  THEME: 'bpsc_app_theme'
};

export const DEFAULT_TOPICS: RegisteredTopic[] = [
  {
    key: 'lcm_hcf',
    labelHindi: 'लघुत्तम और महत्तम समापवर्तक (LCM & HCF)',
    labelEnglish: 'LCM & HCF'
  },
  {
    key: 'percentage',
    labelHindi: 'प्रतिशत (Percentage)',
    labelEnglish: 'Percentage'
  },
  {
    key: 'profit_loss',
    labelHindi: 'लाभ और हानि (Profit & Loss)',
    labelEnglish: 'Profit & Loss'
  },
  {
    key: 'custom',
    labelHindi: 'विविध / अन्य गणित (Custom Topics)',
    labelEnglish: 'Custom & Miscellaneous'
  }
];

// 🛡️ BULLETPROOF SANITIZERS (Prevents all .map crashes)
export function sanitizeQuestion(q: any): Question {
  if (!q || typeof q !== 'object') {
    return {
      id: `invalid_${Math.random()}`,
      text: '',
      options: [],
      correctAnswer: 'E',
      topic: 'custom',
      topicNameHindi: 'सामान्य'
    };
  }
  return {
    ...q,
    id: String(q.id || `q_${Math.random()}`),
    text: String(q.text || ''),
    options: Array.isArray(q.options)
      ? q.options.map((opt: any) => ({
          id: String(opt?.id || ''),
          textHindi: String(opt?.textHindi || ''),
          textEnglish: String(opt?.textEnglish || opt?.textHindi || '')
        }))
      : [],
    correctAnswer: q.correctAnswer || 'E',
    topic: q.topic || 'custom',
    topicNameHindi: q.topicNameHindi || 'सामान्य'
  };
}

export function sanitizeTestSet(t: any): MockTestSet {
  if (!t || typeof t !== 'object') {
    return {
      id: `invalid_set_${Math.random()}`,
      title: 'Untitled Test',
      subtitle: '',
      targetExam: 'BPSC TRE 4.0',
      category: 'all',
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
    category: t.category || 'all',
    categoryTitle: t.categoryTitle || 'General',
    topicBadges: Array.isArray(t.topicBadges) ? t.topicBadges.map(String) : [],
    questions: safeQuestions,
    totalQuestions: t.totalQuestions || safeQuestions.length,
    totalTimeMinutes: t.totalTimeMinutes || Math.max(5, safeQuestions.length)
  };
}

export function getDefaultQuestions(): Question[] {
  return [...lcmHcfQuestions, ...percentageQuestions, ...profitLossQuestions].map(sanitizeQuestion);
}

// --- TOPICS DATABASE ---
export function getAllRegisteredTopics(): RegisteredTopic[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_TOPICS);
    const userTopics: RegisteredTopic[] = raw ? JSON.parse(raw) : [];
    const safeUserTopics = Array.isArray(userTopics) ? userTopics : [];
    const existingKeys = new Set(DEFAULT_TOPICS.map((t) => t.key));
    const merged = [...DEFAULT_TOPICS, ...safeUserTopics.filter((t) => t && t.key && !existingKeys.has(t.key))];
    return merged;
  } catch {
    return DEFAULT_TOPICS;
  }
}

export function registerNewTopic(key: string, labelHindi: string, labelEnglish: string): RegisteredTopic {
  const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
  const newTopic: RegisteredTopic = {
    key: normalizedKey,
    labelHindi: labelHindi.trim(),
    labelEnglish: labelEnglish.trim() || labelHindi.trim(),
    isUserCreated: true
  };

  try {
    const existing = getAllRegisteredTopics();
    const filtered = existing.filter((t) => t.key !== normalizedKey);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_TOPICS, JSON.stringify([...filtered, newTopic]));
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
  saveCustomQuestions(custom);
  const deleted = new Set(getDeletedQuestionIds());
  deleted.add(id);
  saveDeletedQuestionIds(Array.from(deleted));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bpsc_questions_deleted', { detail: [id] }));
    window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
  }
}

export function deleteMultipleQuestions(ids: string[]): number {
  if (!Array.isArray(ids)) return 0;
  const idSet = new Set(ids);
  const custom = getCustomQuestions();
  const filtered = custom.filter((q) => !idSet.has(q.id));
  saveCustomQuestions(filtered);

  const deleted = new Set(getDeletedQuestionIds());
  ids.forEach((id) => deleted.add(id));
  saveDeletedQuestionIds(Array.from(deleted));

  if (typeof window !== 'undefined' && ids.length > 0) {
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

export function deleteCustomTest(testId: string): void {
  try {
    const filtered = getSavedCustomTests().filter((t) => t.id !== testId);
    liveCloudTestsCache = filtered;
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TESTS, JSON.stringify(filtered));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_test_deleted', { detail: testId }));
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
    }
  } catch (err) {
    console.error('Failed to delete custom test', err);
  }
}

export function getAllAvailableTests(): MockTestSet[] {
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

  return Array.from(testMap.values()).map(sanitizeTestSet);
}

export function createCustomMockTest(config: CustomTestConfig): MockTestSet {
  const allQuestions = getAllQuestionBank();
  let selected: Question[] = [];

  if (config.creationMode === 'direct_paste' && Array.isArray(config.directQuestions)) {
    selected = [...config.directQuestions].map(sanitizeQuestion);
  } else if (config.creationMode === 'handpick' && Array.isArray(config.specificQuestionIds)) {
    const idSet = new Set(config.specificQuestionIds);
    selected = allQuestions.filter((q) => idSet.has(q.id));
  } else if (config.topicDistribution && Object.keys(config.topicDistribution).length > 0) {
    Object.entries(config.topicDistribution).forEach(([tKey, reqCount]) => {
      if (reqCount <= 0) return;
      const topicPool = allQuestions.filter((q) => q.topic === tKey);
      const shuffled = config.selectionMode === 'random' ? [...topicPool].sort(() => Math.random() - 0.5) : topicPool;
      selected.push(...shuffled.slice(0, Math.min(reqCount, shuffled.length)));
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
    if (config.selectionMode === 'random' || config.selectionMode === 'bookmarked') {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      selected = shuffled.slice(0, Math.min(count, shuffled.length));
    } else {
      selected = pool.slice(0, Math.min(count, pool.length));
    }
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

// --- FULL TEST RESULTS DATABASE ---
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
    const existing = getSavedTestResults().filter((r) => r.id !== resultId);
    localStorage.setItem(STORAGE_KEYS.FULL_SAVED_RESULTS, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to delete saved result', err);
  }
}

// --- ATTEMPTS HISTORY ---
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

// --- FULL DATABASE BACKUP & RESTORE ---
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