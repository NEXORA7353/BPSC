/**
 * Advanced Mobile & Browser Notification Engine for BPSC TRE 4.0 Portal.
 * Handles Service Worker push notifications, audio alert tones, vibration patterns,
 * hourly motivation scheduler, and poor result reality check alarms.
 * Strict Constraint: ZERO EMOJIS used in any notification title or body.
 */

export interface PortalNotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  category: 'hourly_motivation' | 'reality_check' | 'new_test' | 'daily_inactivity' | 'system';
  severity: 'info' | 'warning' | 'urgent';
  url?: string;
  read: boolean;
}

const STORAGE_KEYS = {
  HISTORY: 'bpsc_notification_history',
  SETTINGS: 'bpsc_notification_settings',
  LAST_HOURLY_TIMESTAMP: 'bpsc_last_hourly_notif_time'
};

export interface NotificationSettings {
  pushEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  hourlyMotivationEnabled: boolean;
  hourlyIntervalHours: number; // 1, 2, 3, or 4
  strictRealityCheckEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  hourlyMotivationEnabled: true,
  hourlyIntervalHours: 1,
  strictRealityCheckEnabled: true
};

const HOURLY_MOTIVATION_MESSAGES = [
  {
    title: '[BPSC ANUSHASAN]: Pratyek Ghanta Mahatvapurna Hai',
    body: 'BPSC TRE 4.0 ganit pariksha kareeb hai. Pichle 1 ghante mein kitne prashna hal kiye? Abhi 15-minute quick mock test attempt karein.'
  },
  {
    title: '[SAMAY KI KIMAT]: Calculation Speed Badhayein',
    body: 'Ganit mein tukka lagana mana hai (-0.33 negative marking). Pen-paper uthayein aur 10 prashno ka abhyas drill turant karein.'
  },
  {
    title: '[LAKSHYA SMARAN]: Rozana Abhyas Se Hi Selection Hoga',
    body: 'Lakho candidates pariksha de rahe hain. Pratyek din aur pratyek ghante ka sahi upyog aapko merit list mein laayega. Practice shuru karein.'
  },
  {
    title: '[SAVDHAN]: Kamzor Chapters Ka Revision Karein',
    body: 'Geometry, Algebra aur Arithmetic ke formulas ka revision karein aur mock test dekar apni accuracy 80%+ karein.'
  },
  {
    title: '[PARIKSHA READY]: Aaj Ka Target Pura Hua?',
    body: 'Shikshak bharti qualify karne ke liye anushasan zaroori hai. Aalsya tyagein aur portal par naya mock test shuru karein.'
  },
  {
    title: '[SPEED DRILL]: Time Management Sudharein',
    body: 'Real exam mein har sawaal ke liye lagbhag 1 minute milta hai. Portal par timer ke sath test dekar apni gati badhayein.'
  }
];

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveNotificationSettings(settings: Partial<NotificationSettings>): void {
  try {
    const current = getNotificationSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_notification_settings_changed', { detail: updated }));
    }
  } catch (err) {
    console.error('Failed to save notification settings', err);
  }
}

export function getNotificationHistory(): PortalNotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

export function saveNotificationToHistory(item: Omit<PortalNotificationItem, 'id' | 'timestamp' | 'read'>): PortalNotificationItem {
  const newItem: PortalNotificationItem = {
    ...item,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    read: false
  };

  try {
    const history = getNotificationHistory();
    const updated = [newItem, ...history].slice(0, 40); // Keep last 40 notifications
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_notification_history_updated', { detail: updated }));
    }
  } catch (err) {
    console.error('Failed to save notification history', err);
  }

  return newItem;
}

export function markNotificationAsRead(id: string): void {
  try {
    const history = getNotificationHistory();
    const updated = history.map((item) => (item.id === id ? { ...item, read: true } : item));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_notification_history_updated', { detail: updated }));
    }
  } catch {}
}

export function clearNotificationHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpsc_notification_history_updated', { detail: [] }));
    }
  } catch {}
}

/**
 * Web Audio synthesizer for clean mobile sound alerts without external MP3 files.
 */
function playAudioAlert(type: 'motivation' | 'urgent_reality_check' | 'normal'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'urgent_reality_check') {
      // Staccato dual-tone warning alarm for poor results
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.setValueAtTime(330, now + 0.15);
      osc1.frequency.setValueAtTime(440, now + 0.3);

      osc2.frequency.setValueAtTime(220, now);
      osc2.frequency.setValueAtTime(165, now + 0.15);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.55);
    } else {
      // High-clarity pleasant bell chime for motivation
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (err) {
    // Audio context may be restricted by autoplay policy
  }
}

/**
 * Trigger vibration pattern on mobile devices.
 */
function triggerVibration(pattern: number[]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {}
}

/**
 * Request system notification permission.
 */
export async function requestMobileNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      saveNotificationSettings({ pushEnabled: true });
    }
    return permission;
  } catch {
    return 'denied';
  }
}

/**
 * Main dispatcher to show a notification across OS, Service Worker, and In-App banner.
 */
export async function dispatchPortalNotification(options: {
  title: string;
  body: string;
  category: 'hourly_motivation' | 'reality_check' | 'new_test' | 'daily_inactivity' | 'system';
  severity?: 'info' | 'warning' | 'urgent';
  url?: string;
}): Promise<PortalNotificationItem> {
  const settings = getNotificationSettings();
  const severity = options.severity || (options.category === 'reality_check' ? 'urgent' : 'info');

  // 1. Play sound if enabled
  if (settings.soundEnabled) {
    playAudioAlert(options.category === 'reality_check' ? 'urgent_reality_check' : 'motivation');
  }

  // 2. Trigger vibration on mobile
  if (settings.vibrationEnabled) {
    if (options.category === 'reality_check') {
      triggerVibration([250, 100, 250, 100, 400]);
    } else {
      triggerVibration([150, 80, 150]);
    }
  }

  // 3. Save to in-app notification center history
  const savedItem = saveNotificationToHistory({
    title: options.title,
    body: options.body,
    category: options.category,
    severity,
    url: options.url
  });

  // 4. Trigger In-App floating alert banner event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('bpsc_in_app_notification', {
        detail: savedItem
      })
    );
  }

  // 5. Native OS / Browser Push Notification
  if (settings.pushEnabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notifOptions: NotificationOptions = {
        body: options.body,
        icon: '/logo.svg',
        badge: '/favicon.svg',
        tag: `bpsc_${options.category}`,
        data: {
          url: options.url || window.location.origin
        }
      };

      // Try ServiceWorkerRegistration first (supports background / mobile lockscreen)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready.catch(() => null);
        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(options.title, notifOptions);
          return savedItem;
        }
      }

      // Fallback to standard Notification API
      const notif = new Notification(options.title, notifOptions);
      notif.onclick = () => {
        window.focus();
        if (options.url) {
          window.location.href = options.url;
        }
        notif.close();
      };
    } catch (e) {
      console.warn('Native notification dispatch warning:', e);
    }
  }

  return savedItem;
}

/**
 * Dispatches the hourly motivation and discipline check.
 */
export async function triggerHourlyMotivation(force = false): Promise<boolean> {
  const settings = getNotificationSettings();
  if (!settings.hourlyMotivationEnabled && !force) {
    return false;
  }

  const now = Date.now();
  const lastTimeStr = localStorage.getItem(STORAGE_KEYS.LAST_HOURLY_TIMESTAMP);
  const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;
  const intervalMs = (settings.hourlyIntervalHours || 1) * 60 * 60 * 1000;

  if (!force && now - lastTime < intervalMs) {
    return false;
  }

  // Pick next motivation message
  const index = Math.floor(Math.random() * HOURLY_MOTIVATION_MESSAGES.length);
  const msg = HOURLY_MOTIVATION_MESSAGES[index];

  await dispatchPortalNotification({
    title: msg.title,
    body: msg.body,
    category: 'hourly_motivation',
    severity: 'info',
    url: typeof window !== 'undefined' ? window.location.origin : undefined
  });

  localStorage.setItem(STORAGE_KEYS.LAST_HOURLY_TIMESTAMP, String(now));
  return true;
}

/**
 * Triggers the stern Reality Check Alert on a poor test attempt.
 */
export async function triggerPoorResultRealityCheck(params: {
  testTitle: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  incorrectCount: number;
  testId?: string;
}): Promise<void> {
  const isPoor = params.accuracy < 50 || (params.score / (params.totalMarks || 1)) < 0.45;
  if (!isPoor) return;

  const title = '[SAVDHAN: RESULT ASANTOSHJANK]';
  const body = `Is pradarshan ke sath BPSC TRE 4.0 qualify karna asambhav hai! ${params.incorrectCount} prashna galat hue hain (-0.33 negative marking). Turant apni galtiyon ka vishleshan karein aur chapter revision karein.`;
  const url = params.testId
    ? `${window.location.origin}/?reviewTestId=${encodeURIComponent(params.testId)}`
    : window.location.origin;

  await dispatchPortalNotification({
    title,
    body,
    category: 'reality_check',
    severity: 'urgent',
    url
  });
}

/**
 * Background watcher that checks every 60 seconds if hourly motivation is due.
 */
let watcherInterval: number | null = null;

export function startNotificationWatcher(): void {
  if (typeof window === 'undefined') return;
  if (watcherInterval !== null) return;

  // Check on boot after 15 seconds
  setTimeout(() => {
    triggerHourlyMotivation(false).catch(() => null);
  }, 15000);

  // Check periodically
  watcherInterval = window.setInterval(() => {
    triggerHourlyMotivation(false).catch(() => null);
  }, 60000);
}

export function stopNotificationWatcher(): void {
  if (watcherInterval !== null) {
    clearInterval(watcherInterval);
    watcherInterval = null;
  }
}
