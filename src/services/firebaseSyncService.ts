import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import {
  Question,
  MockTestSet,
  TestAttemptRecord,
  RegisteredTopic,
  SavedTestResult
} from '../types';
import {
  getCustomQuestions,
  saveCustomQuestions,
  setLiveCloudQuestions,
  setLiveCloudTests,
  getDeletedQuestionIds,
  saveDeletedQuestionIds,
  getDeletedTestIds,
  saveDeletedTestIds,
  getSavedCustomTests,
  saveCustomTest as saveLocalCustomTest,
  getAllRegisteredTopics,
  getDefaultQuestions,
  getAttemptRecords,
  saveAttemptRecord as saveLocalAttemptRecord,
  getSavedTestResults,
  saveFullTestResult as saveLocalFullTestResult,
  normalizeTestTitle
} from '../utils/questionBankStorage';
import { getUserSyncId, getUserProfile } from '../utils/userProfile';

export interface CloudSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  cloudQuestionCount: number;
  cloudTestCount: number;
  error: string | null;
}

type SyncListener = (state: CloudSyncState) => void;
const listeners: Set<SyncListener> = new Set();

let syncState: CloudSyncState = {
  isConnected: true,
  isSyncing: false,
  lastSyncedAt: null,
  cloudQuestionCount: 0,
  cloudTestCount: 0,
  error: null
};

function notifyState() {
  listeners.forEach((fn) => fn({ ...syncState }));
}

export function subscribeToSyncState(listener: SyncListener): () => void {
  listeners.add(listener);
  listener({ ...syncState });
  return () => {
    listeners.delete(listener);
  };
}

function cleanPayload<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        result[key] = value.map((item) => (typeof item === 'object' && item !== null ? cleanPayload(item) : item));
      } else if (typeof value === 'object' && value !== null) {
        result[key] = cleanPayload(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

/**
 * Syncs cloud questions, custom tests, topics, and deleted markers into local storage
 */
export async function syncFromFirestore(): Promise<void> {
  syncState = { ...syncState, isSyncing: true, error: null };
  notifyState();

  try {
    // 1. Fetch Deleted Question IDs tombstones
    const deletedSnap = await getDocs(collection(db, 'deleted_question_ids')).catch((err) => {
      console.warn('deleted_question_ids fetch warning:', err);
      return null;
    });
    const cloudDeletedIds: string[] = [];
    deletedSnap?.forEach((d) => {
      const data = d.data();
      if (data.questionId) cloudDeletedIds.push(data.questionId);
    });
    const localDeleted = getDeletedQuestionIds();
    const mergedDeleted = Array.from(new Set([...localDeleted, ...cloudDeletedIds]));
    saveDeletedQuestionIds(mergedDeleted);

    // 1b. Fetch Deleted Test IDs tombstones
    const deletedTestsSnap = await getDocs(collection(db, 'deleted_test_ids')).catch((err) => {
      console.warn('deleted_test_ids fetch warning:', err);
      return null;
    });
    const cloudDeletedTestIds: string[] = [];
    deletedTestsSnap?.forEach((d) => {
      const data = d.data();
      if (data.testId) cloudDeletedTestIds.push(data.testId);
    });
    const localDeletedTests = getDeletedTestIds();
    const mergedDeletedTests = Array.from(new Set([...localDeletedTests, ...cloudDeletedTestIds]));
    saveDeletedTestIds(mergedDeletedTests);

    const deletedQuestionSet = new Set(mergedDeleted);
    const deletedTestSet = new Set(mergedDeletedTests);

    // 2. Fetch Questions from Firestore
    const questionsSnap = await getDocs(collection(db, 'questions')).catch((err) => {
      console.warn('questions fetch warning:', err);
      return null;
    });
    const cloudQuestions: Question[] = [];
    questionsSnap?.forEach((d) => {
      cloudQuestions.push(d.data() as Question);
    });

    const questionMap = new Map<string, Question>();
    getCustomQuestions().forEach((q) => questionMap.set(q.id, q));
    cloudQuestions.forEach((q) => questionMap.set(q.id, q));
    const finalQuestions = Array.from(questionMap.values()).filter((q) => !deletedQuestionSet.has(q.id));
    setLiveCloudQuestions(finalQuestions);

    // 3. Fetch Custom Tests from Firestore
    const testsSnap = await getDocs(collection(db, 'custom_tests')).catch((err) => {
      console.warn('custom_tests fetch warning:', err);
      return null;
    });
    const cloudTests: MockTestSet[] = [];
    const cloudTestIdSet = new Set<string>();
    testsSnap?.forEach((d) => {
      const data = d.data();
      const testId = data?.id || d.id;
      const testObj = { ...data, id: testId } as MockTestSet;
      cloudTests.push(testObj);
      cloudTestIdSet.add(testId);
    });

    const isDeletedTest = (t: MockTestSet) => {
      if (!t || !t.id) return true;
      if (deletedTestSet.has(t.id)) return true;
      return false;
    };

    const localTests = getSavedCustomTests();
    const testMap = new Map<string, MockTestSet>();
    localTests.forEach((t) => {
      if (!isDeletedTest(t)) {
        testMap.set(t.id, t);
      }
    });
    cloudTests.forEach((t) => {
      if (!isDeletedTest(t)) {
        testMap.set(t.id, t);
      }
    });

    const finalTests = Array.from(testMap.values());
    setLiveCloudTests(finalTests);
    try {
      localStorage.setItem('bpsc_custom_test_sets', JSON.stringify(finalTests));
    } catch (e) {
      console.warn('Failed to cache custom tests in localStorage:', e);
    }

    // Bidirectional sync: Push local custom tests that are missing in Firestore
    // so both bpsc.dpdns.org and bpsc-chi.vercel.app have the exact same mock tests
    localTests.forEach((t) => {
      if (t && t.id && !cloudTestIdSet.has(t.id) && !isDeletedTest(t)) {
        saveTestSetToCloud(t).catch((err) => console.warn('Sync test to cloud error:', err));
      }
    });

    // 4. Fetch Registered Topics from Firestore
    const topicsSnap = await getDocs(collection(db, 'topics')).catch((err) => {
      console.warn('topics fetch warning:', err);
      return null;
    });
    const cloudTopics: RegisteredTopic[] = [];
    topicsSnap?.forEach((d) => {
      cloudTopics.push(d.data() as RegisteredTopic);
    });

    if (cloudTopics.length > 0) {
      const localTopics = getAllRegisteredTopics();
      const topicMap = new Map<string, RegisteredTopic>();
      localTopics.forEach((t) => topicMap.set(t.key, t));
      cloudTopics.forEach((t) => topicMap.set(t.key, t));
      localStorage.setItem('bpsc_registered_topics', JSON.stringify(Array.from(topicMap.values())));
    }

    // 5. Fetch Attempt Records & History from Firestore
    // Ensures all devices, browsers, and URLs have the exact same results history
    const attemptsSnap = await getDocs(collection(db, 'attempt_records')).catch((err) => {
      console.warn('attempt_records fetch warning:', err);
      return null;
    });
    const cloudAttempts: TestAttemptRecord[] = [];
    const cloudAttemptIdSet = new Set<string>();
    attemptsSnap?.forEach((d) => {
      const data = d.data();
      const attemptId = data?.id || d.id;
      cloudAttempts.push({ ...data, id: attemptId } as TestAttemptRecord);
      cloudAttemptIdSet.add(attemptId);
    });

    // Merge with local attempt records
    const localAttempts = getAttemptRecords();
    const attemptMap = new Map<string, TestAttemptRecord>();

    cloudAttempts.forEach((a) => {
      if (a && a.id) attemptMap.set(a.id, a);
    });

    localAttempts.forEach((a) => {
      if (a && a.id) {
        const existing = attemptMap.get(a.id);
        if (!existing) {
          attemptMap.set(a.id, a);
          // Push local attempt to cloud if missing in cloud!
          if (!cloudAttemptIdSet.has(a.id)) {
            saveAttemptRecordToCloud(a).catch((err) => console.warn('Sync local attempt to cloud error:', err));
          }
        } else {
          // Merge to retain questions or responses if one has them and the other doesn't
          attemptMap.set(a.id, {
            ...existing,
            ...a,
            responses: a.responses || existing.responses,
            questions: a.questions || existing.questions
          });
        }
      }
    });

    const finalAttempts = Array.from(attemptMap.values()).sort((a, b) => {
      const timeA = new Date(a.completedAtIso || a.date).getTime() || 0;
      const timeB = new Date(b.completedAtIso || b.date).getTime() || 0;
      return timeB - timeA;
    });

    try {
      localStorage.setItem('bpsc_attempt_records', JSON.stringify(finalAttempts.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to cache attempt records in localStorage:', e);
    }

    // Reconstruct / merge into FULL SAVED RESULTS ARCHIVE so ResultsHistoryView & ResultAnalytics immediately display them
    const localFullResults = getSavedTestResults();
    const fullResultMap = new Map<string, SavedTestResult>();
    localFullResults.forEach((r) => { if (r && r.id) fullResultMap.set(r.id, r); });

    finalAttempts.forEach((att) => {
      const existingKey = Array.from(fullResultMap.keys()).find((k) => {
        const r = fullResultMap.get(k);
        return r && (r.setId === att.testId || r.setTitle === att.testTitle) && (r.dateFormatted === att.date || r.completedAtIso === att.completedAtIso);
      });

      if (!existingKey) {
        const synthesizedResult: SavedTestResult = {
          id: att.id || `result_${Date.now()}_${Math.random()}`,
          setId: att.testId,
          setTitle: att.testTitle,
          totalQuestions: att.totalQuestions || 20,
          attemptedCount: (att.correctCount || 0) + (att.incorrectCount || 0),
          correctCount: att.correctCount || 0,
          incorrectCount: att.incorrectCount || 0,
          safeSkipCount: att.safeSkipCount || 0,
          score: att.score || 0,
          totalMarks: att.totalMarks || (att.totalQuestions || 20),
          blankPenaltyCount: att.blankPenaltyCount || 0,
          totalTimeSpentSeconds: att.totalTimeSpentSeconds || 60,
          accuracy: att.accuracy || 0,
          responses: att.responses || {},
          completedAt: att.date || new Date().toLocaleDateString('hi-IN'),
          dateFormatted: att.date || new Date().toLocaleDateString('hi-IN'),
          completedAtIso: att.completedAtIso || new Date().toISOString(),
          topicBreakdown: att.topicBreakdown,
          questions: att.questions || []
        };
        fullResultMap.set(synthesizedResult.id, synthesizedResult);
      }
    });

    const finalFullResults = Array.from(fullResultMap.values()).sort((a, b) => {
      const timeA = new Date(a.completedAtIso || 0).getTime();
      const timeB = new Date(b.completedAtIso || 0).getTime();
      return timeB - timeA;
    });

    try {
      localStorage.setItem('bpsc_full_results_archive', JSON.stringify(finalFullResults.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to cache full results archive in localStorage:', e);
    }

    syncState = {
      isConnected: true,
      isSyncing: false,
      lastSyncedAt: new Date(),
      cloudQuestionCount: cloudQuestions.length,
      cloudTestCount: cloudTests.length,
      error: null
    };
    notifyState();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
      window.dispatchEvent(new CustomEvent('bpsc_history_updated'));
    }
  } catch (err: any) {
    console.error('Failed to sync from Firestore:', err);
    syncState = {
      ...syncState,
      isSyncing: false,
      error: err?.message || 'Sync failed'
    };
    notifyState();
  }
}

/**
 * Real-time listener for questions, tests, deleted markers, and topics added across browsers/devices
 */
export function setupRealtimeSync(onDataChange: () => void): () => void {
  const unsubQuestions = onSnapshot(
    collection(db, 'questions'),
    (snapshot) => {
      const updated: Question[] = [];
      snapshot.forEach((d) => updated.push(d.data() as Question));
      const deletedSet = new Set(getDeletedQuestionIds());
      const cloudQIdSet = new Set(updated.map((q) => q.id));

      const localCustom = getCustomQuestions();
      const map = new Map<string, Question>();

      localCustom.forEach((q) => {
        if (!deletedSet.has(q.id) && (updated.length === 0 || cloudQIdSet.has(q.id))) {
          map.set(q.id, q);
        }
      });
      updated.forEach((q) => {
        if (!deletedSet.has(q.id)) map.set(q.id, q);
      });

      const filtered = Array.from(map.values());
      setLiveCloudQuestions(filtered);
      syncState = {
        ...syncState,
        cloudQuestionCount: filtered.length,
        lastSyncedAt: new Date()
      };
      notifyState();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
      }
      onDataChange();
    },
    (err) => {
      console.warn('Realtime sync questions listener:', err);
    }
  );

  const unsubTests = onSnapshot(
    collection(db, 'custom_tests'),
    (snapshot) => {
      const cloudTests: MockTestSet[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        const testId = data?.id || d.id;
        cloudTests.push({ ...data, id: testId } as MockTestSet);
      });
      const deletedTestIds = new Set<string>(getDeletedTestIds());
      const isDeletedTest = (t: MockTestSet) => {
        if (!t || !t.id) return true;
        if (deletedTestIds.has(t.id)) return true;
        return false;
      };

      const localTests = getSavedCustomTests();
      const testMap = new Map<string, MockTestSet>();

      localTests.forEach((t) => {
        if (!isDeletedTest(t)) {
          testMap.set(t.id, t);
        }
      });
      cloudTests.forEach((t) => {
        if (!isDeletedTest(t)) {
          testMap.set(t.id, t);
        }
      });

      const finalTests = Array.from(testMap.values());
      setLiveCloudTests(finalTests);
      try {
        localStorage.setItem('bpsc_custom_test_sets', JSON.stringify(finalTests));
      } catch (e) {
        console.warn('Failed to cache custom tests in localStorage:', e);
      }
      syncState = {
        ...syncState,
        cloudTestCount: finalTests.length,
        lastSyncedAt: new Date()
      };
      notifyState();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
      }
      onDataChange();
    },
    (err) => {
      console.warn('Realtime sync custom_tests listener:', err);
    }
  );

  const unsubAttempts = onSnapshot(
    collection(db, 'attempt_records'),
    (snapshot) => {
      const cloudAttempts: TestAttemptRecord[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        const attemptId = data?.id || d.id;
        cloudAttempts.push({ ...data, id: attemptId } as TestAttemptRecord);
      });

      const localAttempts = getAttemptRecords();
      const attemptMap = new Map<string, TestAttemptRecord>();

      cloudAttempts.forEach((a) => {
        if (a && a.id) attemptMap.set(a.id, a);
      });

      localAttempts.forEach((a) => {
        if (a && a.id) {
          const existing = attemptMap.get(a.id);
          if (!existing) {
            attemptMap.set(a.id, a);
          } else {
            attemptMap.set(a.id, {
              ...existing,
              ...a,
              responses: a.responses || existing.responses,
              questions: a.questions || existing.questions
            });
          }
        }
      });

      const finalAttempts = Array.from(attemptMap.values()).sort((a, b) => {
        const timeA = new Date(a.completedAtIso || a.date).getTime() || 0;
        const timeB = new Date(b.completedAtIso || b.date).getTime() || 0;
        return timeB - timeA;
      });

      try {
        localStorage.setItem('bpsc_attempt_records', JSON.stringify(finalAttempts.slice(0, 50)));
      } catch (e) {
        console.warn('Failed to cache attempt records in localStorage:', e);
      }

      // Reconstruct / merge into FULL SAVED RESULTS ARCHIVE
      const localFullResults = getSavedTestResults();
      const fullResultMap = new Map<string, SavedTestResult>();
      localFullResults.forEach((r) => { if (r && r.id) fullResultMap.set(r.id, r); });

      finalAttempts.forEach((att) => {
        const existingKey = Array.from(fullResultMap.keys()).find((k) => {
          const r = fullResultMap.get(k);
          return r && (r.setId === att.testId || r.setTitle === att.testTitle) && (r.dateFormatted === att.date || r.completedAtIso === att.completedAtIso);
        });

        if (!existingKey) {
          const synthesizedResult: SavedTestResult = {
            id: att.id || `result_${Date.now()}_${Math.random()}`,
            setId: att.testId,
            setTitle: att.testTitle,
            totalQuestions: att.totalQuestions || 20,
            attemptedCount: (att.correctCount || 0) + (att.incorrectCount || 0),
            correctCount: att.correctCount || 0,
            incorrectCount: att.incorrectCount || 0,
            safeSkipCount: att.safeSkipCount || 0,
            score: att.score || 0,
            totalMarks: att.totalMarks || (att.totalQuestions || 20),
            blankPenaltyCount: att.blankPenaltyCount || 0,
            totalTimeSpentSeconds: att.totalTimeSpentSeconds || 60,
            accuracy: att.accuracy || 0,
            responses: att.responses || {},
            completedAt: att.date || new Date().toLocaleDateString('hi-IN'),
            dateFormatted: att.date || new Date().toLocaleDateString('hi-IN'),
            completedAtIso: att.completedAtIso || new Date().toISOString(),
            topicBreakdown: att.topicBreakdown,
            questions: att.questions || []
          };
          fullResultMap.set(synthesizedResult.id, synthesizedResult);
        }
      });

      const finalFullResults = Array.from(fullResultMap.values()).sort((a, b) => {
        const timeA = new Date(a.completedAtIso || 0).getTime();
        const timeB = new Date(b.completedAtIso || 0).getTime();
        return timeB - timeA;
      });

      try {
        localStorage.setItem('bpsc_full_results_archive', JSON.stringify(finalFullResults.slice(0, 50)));
      } catch (e) {
        console.warn('Failed to cache full results archive in localStorage:', e);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
        window.dispatchEvent(new CustomEvent('bpsc_history_updated'));
      }
      onDataChange();
    },
    (err) => {
      console.warn('Realtime sync attempt_records listener:', err);
    }
  );

  const unsubDeletedQuestions = onSnapshot(
    collection(db, 'deleted_question_ids'),
    (snapshot) => {
      const deletedIds = new Set<string>(getDeletedQuestionIds());
      let hasChanges = false;
      snapshot.forEach((d) => {
        const qId = d.data()?.questionId;
        if (qId && !deletedIds.has(qId)) {
          deletedIds.add(qId);
          hasChanges = true;
        }
      });
      if (hasChanges) {
        saveDeletedQuestionIds(Array.from(deletedIds));
        const localCustom = getCustomQuestions().filter((q) => !deletedIds.has(q.id));
        setLiveCloudQuestions(localCustom);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
        }
        onDataChange();
      }
    },
    (err) => {
      console.warn('Realtime sync deleted_question_ids listener:', err);
    }
  );

  const unsubDeletedTests = onSnapshot(
    collection(db, 'deleted_test_ids'),
    (snapshot) => {
      const deletedTestIds = new Set<string>(getDeletedTestIds());
      let hasChanges = false;
      snapshot.forEach((d) => {
        const tId = d.data()?.testId;
        if (tId && !deletedTestIds.has(tId)) {
          deletedTestIds.add(tId);
          hasChanges = true;
        }
      });
      if (hasChanges) {
        saveDeletedTestIds(Array.from(deletedTestIds));
        const filteredCustomTests = getSavedCustomTests().filter((t) => !deletedTestIds.has(t.id));
        setLiveCloudTests(filteredCustomTests);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
        }
        onDataChange();
      }
    },
    (err) => {
      console.warn('Realtime sync deleted_test_ids listener:', err);
    }
  );

  const unsubTopics = onSnapshot(
    collection(db, 'topics'),
    (snapshot) => {
      const updatedTopics: RegisteredTopic[] = [];
      snapshot.forEach((d) => updatedTopics.push(d.data() as RegisteredTopic));
      if (updatedTopics.length > 0) {
        const localTopics = getAllRegisteredTopics();
        const map = new Map<string, RegisteredTopic>();
        localTopics.forEach((t) => map.set(t.key, t));
        updatedTopics.forEach((t) => map.set(t.key, t));
        localStorage.setItem('bpsc_registered_topics', JSON.stringify(Array.from(map.values())));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
        }
        onDataChange();
      }
    },
    (err) => {
      console.warn('Realtime sync topics listener:', err);
    }
  );

  return () => {
    unsubQuestions();
    unsubTests();
    unsubAttempts();
    unsubDeletedQuestions();
    unsubDeletedTests();
    unsubTopics();
  };
}

/**
 * Save a question to Firestore cloud database
 */
export async function saveQuestionToCloud(question: Question): Promise<void> {
  const path = `questions/${question.id}`;
  try {
    const cleanQuestion = cleanPayload({
      ...question,
      authorId: auth.currentUser?.uid || 'community_user',
      createdAt: question.createdAt || new Date().toISOString()
    });
    await setDoc(doc(db, 'questions', question.id), cleanQuestion);
    syncState = {
      ...syncState,
      cloudQuestionCount: syncState.cloudQuestionCount + 1,
      lastSyncedAt: new Date()
    };
    notifyState();
  } catch (err) {
    console.warn(`Cloud write question failed (${path}):`, err);
  }
}

/**
 * Save multiple questions in a batch to Firestore
 */
export async function saveBatchQuestionsToCloud(questions: Question[]): Promise<void> {
  if (questions.length === 0) return;
  try {
    // Firestore batch limit is 500 operations
    const chunks = [];
    for (let i = 0; i < questions.length; i += 250) {
      chunks.push(questions.slice(i, i + 250));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((q) => {
        const ref = doc(db, 'questions', q.id);
        const cleanQ = cleanPayload({
          ...q,
          authorId: auth.currentUser?.uid || 'community_user',
          createdAt: q.createdAt || new Date().toISOString()
        });
        batch.set(ref, cleanQ);
      });
      await batch.commit();
    }

    syncState = {
      ...syncState,
      lastSyncedAt: new Date()
    };
    notifyState();
  } catch (err) {
    console.warn('Cloud write batch questions failed:', err);
  }
}

/**
 * Delete a question from Firestore and write tombstone so other clients sync the deletion
 */
export async function deleteQuestionFromCloud(questionId: string): Promise<void> {
  const qPath = `questions/${questionId}`;
  try {
    // 1. Delete from questions collection
    await deleteDoc(doc(db, 'questions', questionId));
    // 2. Add to deleted tombstones collection
    await setDoc(doc(db, 'deleted_question_ids', questionId), {
      id: questionId,
      questionId,
      deletedAt: new Date().toISOString(),
      deletedBy: auth.currentUser?.uid || 'user'
    });
    syncState = {
      ...syncState,
      lastSyncedAt: new Date()
    };
    notifyState();
  } catch (err) {
    console.warn(`Cloud delete question failed (${qPath}):`, err);
  }
}

/**
 * Delete multiple questions from Firestore
 */
export async function deleteBatchQuestionsFromCloud(questionIds: string[]): Promise<void> {
  if (questionIds.length === 0) return;
  try {
    const chunks = [];
    for (let i = 0; i < questionIds.length; i += 200) {
      chunks.push(questionIds.slice(i, i + 200));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((id) => {
        const qRef = doc(db, 'questions', id);
        batch.delete(qRef);
        const tombRef = doc(db, 'deleted_question_ids', id);
        batch.set(tombRef, {
          id,
          questionId: id,
          deletedAt: new Date().toISOString(),
          deletedBy: auth.currentUser?.uid || 'user'
        });
      });
      await batch.commit();
    }

    syncState = {
      ...syncState,
      lastSyncedAt: new Date()
    };
    notifyState();
  } catch (err) {
    console.warn('Cloud delete batch questions failed:', err);
  }
}

/**
 * Save custom test set to Firestore
 */
export async function saveTestSetToCloud(testSet: MockTestSet): Promise<void> {
  if (!testSet || !testSet.id) return;
  const path = `custom_tests/${testSet.id}`;
  try {
    const cleanTest = cleanPayload({
      ...testSet,
      authorId: auth.currentUser?.uid || 'community_user',
      createdAt: testSet.createdAt || new Date().toISOString()
    });
    await setDoc(doc(db, 'custom_tests', testSet.id), cleanTest);
    syncState = {
      ...syncState,
      cloudTestCount: syncState.cloudTestCount + 1,
      lastSyncedAt: new Date()
    };
    notifyState();
  } catch (err) {
    console.warn(`Cloud write test set failed (${path}):`, err);
  }
}

/**
 * Delete custom test from Firestore
 */
export async function deleteTestSetFromCloud(testId: string): Promise<void> {
  if (!testId) return;
  const path = `custom_tests/${testId}`;
  try {
    await deleteDoc(doc(db, 'custom_tests', testId));
    await setDoc(doc(db, 'deleted_test_ids', testId), {
      id: testId,
      testId,
      deletedAt: new Date().toISOString(),
      deletedBy: auth.currentUser?.uid || 'user'
    });
    syncState = {
      ...syncState,
      lastSyncedAt: new Date()
    };
    notifyState();
  } catch (err) {
    console.warn(`Cloud delete test set failed (${path}):`, err);
  }
}

/**
 * Save topic to Firestore
 */
export async function saveTopicToCloud(topic: RegisteredTopic): Promise<void> {
  if (!topic || !topic.key || !/[a-z0-9]/i.test(topic.key) || topic.key === '_____') {
    console.warn('Skipping saveTopicToCloud for invalid topic key:', topic);
    return;
  }
  const path = `topics/${topic.key}`;
  try {
    const cleanTopic = cleanPayload({
      ...topic,
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'topics', topic.key), cleanTopic);
  } catch (err) {
    console.warn(`Cloud write topic failed (${path}):`, err);
  }
}

/**
 * Save attempt record to Firestore
 */
export async function saveAttemptRecordToCloud(record: TestAttemptRecord): Promise<string | null> {
  if (!record || !record.testId) return null;
  const recordId = record.id || `${record.testId}_${Date.now()}`;
  const path = `attempt_records/${recordId}`;
  try {
    const profile = getUserProfile();
    const cleanRecord = cleanPayload({
      ...record,
      id: recordId,
      userId: record.userId || getUserSyncId(),
      studentName: record.studentName || profile.displayName || 'PrIyA PaTeL',
      completedAtIso: record.completedAtIso || new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'attempt_records', recordId), cleanRecord);

    // Non-blocking trigger to send result email to student & parent
    try {
      fetch('/api/email/send-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: recordId,
          attemptData: cleanRecord
        })
      }).catch((emailErr) => {
        console.warn('[send-result] Background trigger warning:', emailErr);
      });
    } catch {
      // ignore
    }

    return recordId;
  } catch (err) {
    console.warn(`Cloud write attempt record failed (${path}):`, err);
    return null;
  }
}

/**
 * Delete an attempt record from Firestore
 */
export async function deleteAttemptRecordFromCloud(attemptId: string): Promise<void> {
  if (!attemptId) return;
  try {
    await deleteDoc(doc(db, 'attempt_records', attemptId));
  } catch (err) {
    console.warn(`Cloud delete attempt record failed (${attemptId}):`, err);
  }
}

/**
 * Publish / Seed all built-in base questions to Firestore so the database is populated for all users
 */
/**
 * Clear all questions, custom tests, and tombstones from cloud Firestore and local database
 */
export async function clearCloudDatabase(): Promise<void> {
  try {
    const collectionsToClear = ['questions', 'custom_tests', 'deleted_question_ids', 'deleted_test_ids', 'topics', 'attempt_records'];
    for (const colName of collectionsToClear) {
      try {
        const snap = await getDocs(collection(db, colName));
        if (snap && !snap.empty) {
          // Firestore batch limit is 500 operations, chunk accordingly
          const docs = snap.docs;
          for (let i = 0; i < docs.length; i += 400) {
            const chunk = docs.slice(i, i + 400);
            const batch = writeBatch(db);
            chunk.forEach((d) => batch.delete(d.ref));
            await batch.commit();
          }
          console.log(`[ClearDB] Cleared ${docs.length} docs from ${colName}`);
        }
      } catch (colErr) {
        console.warn(`[ClearDB] Error clearing collection ${colName}:`, colErr);
      }
    }
  } catch (err) {
    console.warn('Failed to clear cloud database:', err);
  }
  
  // Always clear local database regardless of cloud errors
  try {
    const { clearEntireDatabase } = await import('../utils/questionBankStorage');
    clearEntireDatabase();
    console.log('[ClearDB] Local database cleared successfully');
  } catch (localErr) {
    console.warn('[ClearDB] Error clearing local database:', localErr);
  }
}

export async function seedAllQuestionsToCloud(): Promise<{ count: number; testsCount: number }> {
  // Deduplicate by ID so count is 100% accurate and no duplicate writes occur
  const questionMap = new Map<string, Question>();
  getDefaultQuestions().forEach((q) => questionMap.set(q.id, q));
  getCustomQuestions().forEach((q) => questionMap.set(q.id, q));

  const deletedSet = new Set(getDeletedQuestionIds());
  const activeQuestions = Array.from(questionMap.values()).filter((q) => !deletedSet.has(q.id));

  await saveBatchQuestionsToCloud(activeQuestions);

  // Also sync topics
  const topics = getAllRegisteredTopics();
  for (const t of topics) {
    await saveTopicToCloud(t);
  }

  // Also sync custom tests
  const tests = getSavedCustomTests();
  for (const t of tests) {
    await saveTestSetToCloud(t);
  }

  setLiveCloudQuestions(activeQuestions);
  if (tests.length > 0) {
    setLiveCloudTests(tests);
  }

  syncState = {
    ...syncState,
    cloudQuestionCount: activeQuestions.length,
    cloudTestCount: tests.length,
    lastSyncedAt: new Date()
  };
  notifyState();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
  }

  return { count: activeQuestions.length, testsCount: tests.length };
}

// Global auto-sync event listeners so questionBankStorage triggers cloud writes seamlessly
if (typeof window !== 'undefined') {
  window.addEventListener('bpsc_questions_added', ((e: CustomEvent<Question[]>) => {
    if (e.detail && e.detail.length > 0) {
      saveBatchQuestionsToCloud(e.detail).catch((err) => console.warn('Cloud sync error (add questions):', err));
    }
  }) as EventListener);

  window.addEventListener('bpsc_question_updated', ((e: CustomEvent<Question>) => {
    if (e.detail) {
      saveQuestionToCloud(e.detail).catch((err) => console.warn('Cloud sync error (update question):', err));
    }
  }) as EventListener);

  window.addEventListener('bpsc_questions_deleted', ((e: CustomEvent<string[]>) => {
    if (e.detail && e.detail.length > 0) {
      deleteBatchQuestionsFromCloud(e.detail).catch((err) => console.warn('Cloud sync error (delete questions):', err));
    }
  }) as EventListener);

  window.addEventListener('bpsc_test_saved', ((e: CustomEvent<MockTestSet>) => {
    if (e.detail) {
      saveTestSetToCloud(e.detail).catch((err) => console.warn('Cloud sync error (save test):', err));
    }
  }) as EventListener);

  window.addEventListener('bpsc_test_deleted', ((e: CustomEvent<string>) => {
    if (e.detail) {
      deleteTestSetFromCloud(e.detail).catch((err) => console.warn('Cloud sync error (delete test):', err));
    }
  }) as EventListener);

  window.addEventListener('bpsc_topic_added', ((e: CustomEvent<RegisteredTopic>) => {
    if (e.detail) {
      saveTopicToCloud(e.detail).catch((err) => console.warn('Cloud sync error (save topic):', err));
    }
  }) as EventListener);

  window.addEventListener('bpsc_attempt_saved', ((e: CustomEvent<TestAttemptRecord>) => {
    if (e.detail) {
      saveAttemptRecordToCloud(e.detail).catch((err) => console.warn('Cloud sync error (save attempt):', err));
    }
  }) as EventListener);

  window.addEventListener('bpsc_history_deleted', ((e: CustomEvent<string>) => {
    if (e.detail) {
      deleteAttemptRecordFromCloud(e.detail).catch((err) => console.warn('Cloud sync error (delete attempt):', err));
    }
  }) as EventListener);

  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('bpsc_')) {
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
    }
  });
}
