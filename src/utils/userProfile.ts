export interface UserProfile {
  syncId: string;
  displayName: string;
  rollNumber?: string;
  email?: string;
  parentEmail?: string;
  parentPhone?: string;
  mobileNotificationEnabled?: boolean;
  hourlyDisciplineEnabled?: boolean;
  strictRealityCheckEnabled?: boolean;
  notificationIntervalHours?: number;
}

export const DEFAULT_USER_SYNC_ID = 'BPSC-PRIYA-2026';
export const DEFAULT_USER_NAME = 'PrIyA PaTeL';
export const DEFAULT_STUDENT_EMAIL = 'patel000priya000@gmail.com';
export const DEFAULT_PARENT_EMAIL = 'arjittreadingcompany@gmail.com';

const STORAGE_KEYS = {
  USER_SYNC_ID: 'bpsc_user_sync_id',
  USER_PROFILE: 'bpsc_user_profile'
};

export function getUserSyncId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SYNC_ID);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch {}
  return DEFAULT_USER_SYNC_ID;
}

export function setUserSyncId(newId: string): void {
  try {
    const cleanId = (newId || DEFAULT_USER_SYNC_ID).trim();
    localStorage.setItem(STORAGE_KEYS.USER_SYNC_ID, cleanId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_user_sync_id_changed', { detail: cleanId }));
      window.dispatchEvent(new CustomEvent('bpsc_cloud_data_updated'));
    }
  } catch (err) {
    console.error('Failed to save user sync id', err);
  }
}

export function getUserProfile(): UserProfile {
  const syncId = getUserSyncId();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        syncId,
        displayName: parsed.displayName || DEFAULT_USER_NAME,
        rollNumber: parsed.rollNumber || 'BPSC-TRE4-2026',
        email: parsed.email || DEFAULT_STUDENT_EMAIL,
        parentEmail: parsed.parentEmail || DEFAULT_PARENT_EMAIL,
        parentPhone: parsed.parentPhone || '',
        mobileNotificationEnabled: parsed.mobileNotificationEnabled ?? true,
        hourlyDisciplineEnabled: parsed.hourlyDisciplineEnabled ?? true,
        strictRealityCheckEnabled: parsed.strictRealityCheckEnabled ?? true,
        notificationIntervalHours: parsed.notificationIntervalHours || 1
      };
    }
  } catch {}
  return {
    syncId,
    displayName: DEFAULT_USER_NAME,
    rollNumber: 'BPSC-TRE4-2026',
    email: DEFAULT_STUDENT_EMAIL,
    parentEmail: DEFAULT_PARENT_EMAIL,
    parentPhone: '',
    mobileNotificationEnabled: true,
    hourlyDisciplineEnabled: true,
    strictRealityCheckEnabled: true,
    notificationIntervalHours: 1
  };
}

export function saveUserProfile(profile: Partial<UserProfile>): void {
  try {
    const current = getUserProfile();
    const updated: UserProfile = {
      ...current,
      ...profile,
      syncId: profile.syncId || current.syncId
    };
    if (profile.syncId) {
      setUserSyncId(profile.syncId);
    }
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_user_profile_updated', { detail: updated }));
    }
  } catch (err) {
    console.error('Failed to save user profile', err);
  }
}
