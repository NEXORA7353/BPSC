export const DEFAULT_STUDENT_EMAIL = process.env.DEFAULT_STUDENT_EMAIL || 'patel000priya000@gmail.com';
export const DEFAULT_PARENT_EMAIL = process.env.DEFAULT_PARENT_EMAIL || 'arjittreadingcompany@gmail.com';
export const DEFAULT_STUDENT_NAME = process.env.DEFAULT_STUDENT_NAME || 'Priya Patel';
export const DEFAULT_SENDER_EMAIL = 'noreply@bpsc.dpdns.org';
export const DEFAULT_SENDER_NAME = 'BPSC TRE 4.0 Mock Portal';
export const DEFAULT_SENDER_FORMATTED = `${DEFAULT_SENDER_NAME} <${DEFAULT_SENDER_EMAIL}>`;
export const TARGET_DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || 'ai-studio-bpsctre40mathema-bac5a725-5f5b-4cc5-98e4-dff6bbfc928b';
export const DEFAULT_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0764722018';

export interface TopicPerformanceStat {
  topicKey: string;
  topicLabel: string;
  topicLabelHindi?: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
}

export function getAppBaseUrl(): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
  }
  return 'https://bpsc.dpdns.org';
}

/**
 * Returns Indian Standard Time (IST) Date string representation and windows
 */
export function getIstDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function getIstIsoDayRange(date: Date = new Date()): { startIso: string; endIso: string; dateStr: string } {
  const dateStr = getIstDateString(date); // "YYYY-MM-DD"
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Construct UTC timestamps for 00:00:00.000 IST and 23:59:59.999 IST
  const startUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - 5.5 * 60 * 60 * 1000);
  const endUtc = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) - 5.5 * 60 * 60 * 1000);

  return {
    startIso: startUtc.toISOString(),
    endIso: endUtc.toISOString(),
    dateStr
  };
}

export function getIstYearWeek(date: Date = new Date()): string {
  const d = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const dNum = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = dNum.getUTCDay() || 7;
  dNum.setUTCDate(dNum.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dNum.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((dNum.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${dNum.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
}
