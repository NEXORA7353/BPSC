import type { IncomingMessage, ServerResponse } from 'http';
import { sendJson } from './response.js';

/**
 * Validates that an incoming HTTP request to a /api/cron/* endpoint
 * is legitimately authorized by Vercel Cron using the CRON_SECRET token.
 */
export function isAuthorizedCronRequest(req: IncomingMessage | any): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn('[Cron Auth] Warning: CRON_SECRET is not configured in environment variables.');
    return false;
  }

  const headers = req.headers || {};
  const authHeader = headers['authorization'] || headers['Authorization'];
  if (!authHeader || typeof authHeader !== 'string') {
    return false;
  }

  const expectedHeader = `Bearer ${cronSecret.trim()}`;
  return authHeader.trim() === expectedHeader;
}

export function rejectUnauthorizedCron(res: ServerResponse | any): void {
  sendJson(res, 401, { error: 'Unauthorized: Invalid or missing CRON_SECRET' });
}
