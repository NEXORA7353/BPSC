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

/**
 * Returns all built-in base questions (155+ high quality questions)
 */
export function getDefaultQuestions(): Question[] {
  return [...lcmHcfQuestions, ...percentageQuestions, ...profitLossQuestions];
}

// --- TOPICS DATABASE ---
export function getAllRegisteredTopics(): RegisteredTopic[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_TOPICS);
    const userTopics: RegisteredTopic[] = raw ? JSON.parse(raw) : [];
    const existingKeys = new Set(DEFAULT_TOPICS.map((t) => t.key));
    const merged = [...DEFAULT_TOPICS, ...userTopics.filter((t) => !existingKeys.has(t.key))];
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
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_TOPICS);
    const existing: RegisteredTopic[] = raw ? JSON.parse(raw) : [];
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
  liveCloudQuestionsCache = questions;
  // Also keep local storage updated as offline backup
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(questions));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

export function setLiveCloudTests(tests: MockTestSet[]): void {
  liveCloudTestsCache = tests;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TESTS, JSON.stringify(tests));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

export function getLiveCloudQuestionsCache(): Question[] | null {
  return liveCloudQuestionsCache;
}

export function getCustomQuestions(): Question[] {
  if (liveCloudQuestionsCache && liveCloudQuestionsCache.length > 0) {
    return liveCloudQuestionsCache;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomQuestions(questions: Question[]): void {
  liveCloudQuestionsCache = questions;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save questions to localStorage', err);
  }
}

export function getDeletedQuestionIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_QUESTION_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDeletedQuestionIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DELETED_QUESTION_IDS, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save deleted question ids', err);
  }
}

export function getAllQuestionBank(): Question[] {
  const deletedIds = new Set(getDeletedQuestionIds());

  let rawList: Question[] = [];

  // If live cloud cache is present, it is the primary unified source of truth!
  if (liveCloudQuestionsCache && Array.isArray(liveCloudQuestionsCache) && liveCloudQuestionsCache.length > 0) {
    const map = new Map<string, Question>();
    liveCloudQuestionsCache.forEach((q) => {
      if (q && q.id) map.set(q.id, q);
    });
    // Also include default questions if somehow missing
    getDefaultQuestions().forEach((q) => {
      if (q && q.id && !map.has(q.id)) map.set(q.id, q);
    });
    rawList = Array.from(map.values());
  } else {
    const custom = getCustomQuestions();
    const defaults = getDefaultQuestions();

    const map = new Map<string, Question>();
    defaults.forEach((q) => {
      if (q && q.id) map.set(q.id, q);
    });
    if (Array.isArray(custom)) {
      custom.forEach((q) => {
        if (q && q.id) map.set(q.id, q);
      });
    }
    rawList = Array.from(map.values());
  }

  return rawList
    .filter((q) => q && q.id && !deletedIds.has(q.id))
    .map((q) => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : []
    }));
}

export function addQuestionsToBank(newQuestions: Question[]): { count: number; total: number } {
  const currentBank = getAllQuestionBank();
  const existingIds = new Set(currentBank.map((q) => q.id));
  
  // Guarantee unique IDs for all incoming questions so none are silently dropped
  const prepared: Question[] = newQuestions.map((q, idx) => {
    if (!q.id || existingIds.has(q.id)) {
      return {
        ...q,
        id: `custom_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`
      };
    }
    return q;
  });

  const updated = [...currentBank, ...prepared];
  saveCustomQuestions(updated);

  // If re-adding previously deleted questions, un-delete them
  const deletedIds = new Set(getDeletedQuestionIds());
  prepared.forEach((q) => deletedIds.delete(q.id));
  saveDeletedQuestionIds(Array.from(deletedIds));

  if (typeof window !== 'undefined' && prepared.length > 0) {
    window.dispatchEvent(new CustomEvent('bpsc_questions_added', { detail: prepared }));
    window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
  }

  return {
    count: prepared.length,
    total: getAllQuestionBank().length
  };
}

export function updateQuestionInBank(updatedQuestion: Question): void {
  const custom = getCustomQuestions();
  const index = custom.findIndex((q) => q.id === updatedQuestion.id);
  if (index !== -1) {
    custom[index] = updatedQuestion;
    saveCustomQuestions(custom);
  } else {
    // If it was a default question being edited, save as custom override
    saveCustomQuestions([updatedQuestion, ...custom]);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bpsc_question_updated', { detail: updatedQuestion }));
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
  const idSet = new Set(ids);
  const custom = getCustomQuestions();
  const filtered = custom.filter((q) => !idSet.has(q.id));
  saveCustomQuestions(filtered);

  // Mark in deleted IDs so default/built-in questions also vanish
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
    return raw ? JSON.parse(raw) : [];
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
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomTest(testSet: MockTestSet): void {
  try {
    const existing = getSavedCustomTests().filter((t) => t.id !== testSet.id);
    const updated = [testSet, ...existing];
    liveCloudTestsCache = updated;
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TESTS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_test_saved', { detail: testSet }));
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
  defaultMockSets.forEach((t) => testMap.set(t.id, t));

  const customTests = getSavedCustomTests();
  customTests.forEach((t) => testMap.set(t.id, t));

  if (liveCloudTestsCache && liveCloudTestsCache.length > 0) {
    liveCloudTestsCache.forEach((t) => testMap.set(t.id, t));
  }

  return Array.from(testMap.values());
}

/**
 * Advanced Custom Mock Test Generator
 * Supports:
 * - Exact topic distribution map (e.g. 10 from Topic A, 5 from Topic B)
 * - Handpicked specific question IDs
 * - Direct question list
 * - Random shuffle or sequential order
 */
export function createCustomMockTest(config: CustomTestConfig): MockTestSet {
  const allQuestions = getAllQuestionBank();
  let selected: Question[] = [];

  // 1. Direct questions mode
  if (config.creationMode === 'direct_paste' && config.directQuestions && config.directQuestions.length > 0) {
    selected = [...config.directQuestions];
  }
  // 2. Hand-pick mode by specific IDs
  else if (config.creationMode === 'handpick' && config.specificQuestionIds && config.specificQuestionIds.length > 0) {
    const idSet = new Set(config.specificQuestionIds);
    selected = allQuestions.filter((q) => idSet.has(q.id));
  }
  // 3. Topic distribution mode (e.g. { lcm_hcf: 10, profit_loss: 5 })
  else if (config.topicDistribution && Object.keys(config.topicDistribution).length > 0) {
    Object.entries(config.topicDistribution).forEach(([tKey, reqCount]) => {
      if (reqCount <= 0) return;
      const topicPool = allQuestions.filter((q) => q.topic === tKey);
      const shuffled = config.selectionMode === 'random' ? [...topicPool].sort(() => Math.random() - 0.5) : topicPool;
      selected.push(...shuffled.slice(0, Math.min(reqCount, shuffled.length)));
    });
  }
  // 4. General topic selection mode
  else {
    let pool = allQuestions;
    if (config.selectedTopics && config.selectedTopics.length > 0 && !config.selectedTopics.includes('all')) {
      pool = pool.filter((q) => config.selectedTopics.includes(q.topic));
    }

    if (config.selectionMode === 'bookmarked') {
      const bIds = new Set(getBookmarkedIds());
      const bPool = pool.filter((q) => bIds.has(q.id));
      if (bPool.length > 0) pool = bPool;
    }

    const count = config.questionCount || 20;
    if (config.selectionMode === 'random' || config.selectionMode === 'bookmarked') {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      selected = shuffled.slice(0, Math.min(count, shuffled.length));
    } else {
      selected = pool.slice(0, Math.min(count, pool.length));
    }
  }

  // Fallback if pool was empty
  if (selected.length === 0) {
    selected = allQuestions.slice(0, Math.min(config.questionCount || 10, allQuestions.length));
  }

  const testId = `custom_test_${Date.now()}`;
  const totalQuestions = selected.length;
  const timeMinutes = config.timeMinutes > 0 ? config.timeMinutes : totalQuestions;

  // Build topic badges
  const distinctTopics = Array.from(new Set(selected.map((q) => q.topicNameHindi || q.topic)));

  const newTest: MockTestSet = {
    id: testId,
    title: config.title || `Custom Practice Test (${totalQuestions} Questions)`,
    subtitle: config.subtitle || `Topics: ${distinctTopics.join(', ')}`,
    targetExam: config.targetExam || 'BPSC TRE 4.0 Mathematics (Custom Generated)',
    category: 'custom',
    categoryTitle: 'Custom Generated Tests',
    topicBadges: distinctTopics.slice(0, 4),
    totalQuestions,
    totalTimeMinutes: timeMinutes,
    questions: selected,
    negativeMarkingValue: config.negativeMarking ?? 0.33,
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  saveCustomTest(newTest);
  return newTest;
}

/**
 * Targeted Re-attempt Test for missed questions
 */
export function createReattemptMissedQuestionsTest(
  parentTest: MockTestSet,
  missedQuestionIds: string[]
): MockTestSet {
  const missedSet = new Set(missedQuestionIds);
  const questions = parentTest.questions.filter((q) => missedSet.has(q.id));
  const testId = `reattempt_${Date.now()}`;
  const totalQuestions = questions.length;

  const newTest: MockTestSet = {
    id: testId,
    title: `Weak Spots Re-attempt: ${parentTest.title}`,
    subtitle: `Targeted practice for ${totalQuestions} incorrect & skipped questions`,
    targetExam: parentTest.targetExam,
    category: 'custom',
    categoryTitle: 'Targeted Re-attempt Tests',
    topicBadges: ['Mistakes Review', 'Targeted Re-attempt'],
    totalQuestions,
    totalTimeMinutes: Math.max(5, totalQuestions),
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
    return raw ? JSON.parse(raw) : [];
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
    return raw ? JSON.parse(raw) : [];
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
