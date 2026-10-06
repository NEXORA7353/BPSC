import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

const TARGET_DATABASE_ID = (firebaseConfig as any).firestoreDatabaseId || '(default)';

/**
 * Initializes and returns the server-side Firebase Admin Firestore client.
 * Strictly uses process.env.FIREBASE_SERVICE_ACCOUNT_KEY on server-side.
 */
export function getAdminFirestore(): Firestore {
  if (adminDb) return adminDb;

  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY is required in Vercel environment variables for server-side Firestore operations.'
    );
  }

  let serviceAccount: any;
  try {
    // Support either raw JSON string or base64 encoded JSON
    if (rawKey.trim().startsWith('{')) {
      serviceAccount = JSON.parse(rawKey);
    } else {
      const decoded = Buffer.from(rawKey, 'base64').toString('utf8');
      serviceAccount = JSON.parse(decoded);
    }
  } catch (err: any) {
    throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${err?.message || err}`);
  }

  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || (firebaseConfig as any).projectId
    });
  } else {
    adminApp = getApps()[0];
  }

  adminDb = getFirestore(adminApp, TARGET_DATABASE_ID);
  return adminDb;
}

/**
 * Atomically reserves a notification using a Firestore transaction.
 * Guarantees concurrent cron invocations cannot reserve the same notification twice.
 * Returns true if reservation was granted, false if already exists.
 */
export async function reserveNotificationAtomically(
  notificationId: string,
  metadata: {
    type: 'new_test' | 'test_result' | 'daily_inactivity' | 'reminder_2h' | 'reminder_soon' | 'weekly_report';
    recipients: string[];
    testId?: string;
    attemptId?: string;
  }
): Promise<boolean> {
  const db = getAdminFirestore();
  const docRef = db.collection('sent_notifications').doc(notificationId);

  try {
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(docRef);
      if (snapshot.exists) {
        // Notification was already sent or is currently being processed
        return false;
      }

      transaction.create(docRef, {
        notificationId,
        ...metadata,
        status: 'pending',
        reservedAt: new Date().toISOString()
      });

      return true;
    });
  } catch (err: any) {
    // If a concurrent transaction already created it, Firestore throws ALREADY_EXISTS
    if (err?.code === 6 || err?.message?.includes('ALREADY_EXISTS') || err?.message?.includes('already exists')) {
      return false;
    }
    console.error(`[Firestore Transaction Error] reserving ${notificationId}:`, err);
    throw err;
  }
}

/**
 * Updates a reserved notification with delivery confirmation or failure status.
 */
export async function finalizeNotification(
  notificationId: string,
  updates: {
    status: 'delivered' | 'failed';
    brevoMessageId?: string;
    error?: string;
  }
): Promise<void> {
  const db = getAdminFirestore();
  const docRef = db.collection('sent_notifications').doc(notificationId);
  await docRef.set(
    {
      ...updates,
      finalizedAt: new Date().toISOString()
    },
    { merge: true }
  );
}

/**
 * Releases a pending reservation if an irrecoverable pre-send error occurred, allowing retry.
 */
export async function releaseNotificationReservation(notificationId: string): Promise<void> {
  try {
    const db = getAdminFirestore();
    await db.collection('sent_notifications').doc(notificationId).delete();
  } catch (err) {
    console.warn(`Failed to release notification reservation ${notificationId}:`, err);
  }
}

/**
 * Fetches a persisted attempt record from Firestore to verify score data before emailing.
 */
export async function getPersistedAttempt(attemptId: string): Promise<any | null> {
  const db = getAdminFirestore();
  const docSnap = await db.collection('attempt_records').doc(attemptId).get();
  if (!docSnap.exists) {
    return null;
  }
  return docSnap.data();
}

/**
 * Fetches a published custom test by ID.
 */
export async function getPublishedTest(testId: string): Promise<any | null> {
  const db = getAdminFirestore();
  const docSnap = await db.collection('custom_tests').doc(testId).get();
  if (!docSnap.exists) {
    return null;
  }
  return docSnap.data();
}

/**
 * Queries attempt records for a student completed within a given ISO time range.
 */
export async function getStudentAttemptsInRange(
  studentEmail: string,
  startIso: string,
  endIso: string
): Promise<any[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('attempt_records')
    .where('studentEmail', '==', studentEmail)
    .where('completedAtIso', '>=', startIso)
    .where('completedAtIso', '<=', endIso)
    .get();

  return snap.docs.map((d) => d.data());
}

/**
 * Queries scheduled published tests whose start time is within [windowStartIso, windowEndIso].
 */
export async function getScheduledPublishedTests(
  windowStartIso: string,
  windowEndIso: string
): Promise<any[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('custom_tests')
    .where('isPublished', '==', true)
    .where('scheduledStartAt', '>=', windowStartIso)
    .where('scheduledStartAt', '<=', windowEndIso)
    .get();

  return snap.docs.map((d) => d.data());
}
