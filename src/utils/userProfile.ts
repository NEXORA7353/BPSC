export interface UserProfile {
  syncId: string;
  displayName: string;
  rollNumber?: string;
  email?: string;
}

export const DEFAULT_USER_SYNC_ID = 'BPSC-PRIYA-2026';
export const DEFAULT_USER_NAME = 'PrIyA PaTeL';

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
        email: parsed.email || 'priyapatel.bpsc@gmail.com'
      };
    }
  } catch {}
  return {
    syncId,
    displayName: DEFAULT_USER_NAME,
    rollNumber: 'BPSC-TRE4-2026',
    email: 'priyapatel.bpsc@gmail.com'
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
