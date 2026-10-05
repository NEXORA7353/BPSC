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
  saveFullTestResult as saveLocalFullTestResult
} from '../utils/questionBankStorage';

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

    if (!questionsSnap || cloudQuestions.length === 0) {
      console.log('No cloud questions found. Automatically seeding built-in database to Firestore...');
      await seedAllQuestionsToCloud().catch((err) => console.warn('Auto-seed failed:', err));
    } else {
      const questionMap = new Map<string, Question>();
      getCustomQuestions().forEach((q) => questionMap.set(q.id, q));
      cloudQuestions.forEach((q) => questionMap.set(q.id, q));
      const finalQuestions = Array.from(questionMap.values()).filter((q) => !deletedQuestionSet.has(q.id));
      setLiveCloudQuestions(finalQuestions);
    }

    // 3. Fetch Custom Tests from Firestore
    const testsSnap = await getDocs(collection(db, 'custom_tests')).catch((err) => {
      console.warn('custom_tests fetch warning:', err);
      return null;
    });
    const cloudTests: MockTestSet[] = [];
    testsSnap?.forEach((d) => {
      cloudTests.push(d.data() as MockTestSet);
    });

    if (cloudTests.length > 0) {
      const cloudTestMap = new Map<string, MockTestSet>();
      cloudTests.forEach((t) => cloudTestMap.set(t.id, t));

      const localTests = getSavedCustomTests();
      const testMap = new Map<string, MockTestSet>();
      localTests.forEach((t) => {
        if (!deletedTestSet.has(t.id) && cloudTestMap.has(t.id)) {
          testMap.set(t.id, t);
        }
      });
      cloudTests.forEach((t) => {
        if (!deletedTestSet.has(t.id)) testMap.set(t.id, t);
      });

      const finalTests = Array.from(testMap.values());
      setLiveCloudTests(finalTests);
    }

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
      snapshot.forEach((d) => cloudTests.push(d.data() as MockTestSet));
      const deletedTestIds = new Set<string>(getDeletedTestIds());
      const cloudTestIdSet = new Set(cloudTests.map((t) => t.id));

      const localTests = getSavedCustomTests();
      const testMap = new Map<string, MockTestSet>();

      localTests.forEach((t) => {
        if (!deletedTestIds.has(t.id) && (cloudTests.length === 0 || cloudTestIdSet.has(t.id))) {
          testMap.set(t.id, t);
        }
      });
      cloudTests.forEach((t) => {
        if (!deletedTestIds.has(t.id)) testMap.set(t.id, t);
      });

      const finalTests = Array.from(testMap.values());
      setLiveCloudTests(finalTests);
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
export async function saveAttemptRecordToCloud(record: TestAttemptRecord): Promise<void> {
  if (!record || !record.testId) return;
  const recordId = `${record.testId}_${Date.now()}`;
  const path = `attempt_records/${recordId}`;
  try {
    const cleanRecord = cleanPayload({
      ...record,
      id: recordId,
      userId: auth.currentUser?.uid || 'guest',
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'attempt_records', recordId), cleanRecord);
  } catch (err) {
    console.warn(`Cloud write attempt record failed (${path}):`, err);
  }
}

/**
 * Publish / Seed all built-in base questions to Firestore so the database is populated for all users
 */
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

  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('bpsc_')) {
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
    }
  });
}
