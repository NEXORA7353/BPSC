export const DEFAULT_STUDENT_EMAIL = process.env.DEFAULT_STUDENT_EMAIL || 'patel000priya000@gmail.com';
export const DEFAULT_PARENT_EMAIL = process.env.DEFAULT_PARENT_EMAIL || 'arjittreadingcompany@gmail.com';
export const DEFAULT_STUDENT_NAME = process.env.DEFAULT_STUDENT_NAME || 'Priya Patel';
export const DEFAULT_SENDER_EMAIL = 'noreply@bpsc.dpdns.org';
export const DEFAULT_SENDER_NAME = 'BPSC TRE 4.0 Mock Portal';

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
  // Format YYYY-MM-DD in Asia/Kolkata timezone
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function getIstIsoDayRange(date: Date = new Date()): { startIso: string; endIso: string; dateStr: string } {
  const dateStr = getIstDateString(date); // "YYYY-MM-DD"
  // IST is UTC+5:30 -> midnight IST is 18:30 UTC of previous day
  // To avoid boundary quirks, calculate exact UTC epoch milliseconds for 00:00:00.000 IST and 23:59:59.999 IST
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Construct UTC midnight corresponding to IST:
  // IST = UTC + 5.5 hours, so UTC = IST - 5.5 hours
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
  return `${dNum.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}
