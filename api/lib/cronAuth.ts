import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Validates that an incoming HTTP request to a /api/cron/* endpoint
 * is legitimately authorized by Vercel Cron using the CRON_SECRET token.
 */
export function isAuthorizedCronRequest(req: IncomingMessage): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn('[Cron Auth] Warning: CRON_SECRET is not configured in environment variables.');
    return false;
  }

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || typeof authHeader !== 'string') {
    return false;
  }

  const expectedHeader = `Bearer ${cronSecret.trim()}`;
  return authHeader.trim() === expectedHeader;
}

export function rejectUnauthorizedCron(res: ServerResponse): void {
  res.statusCode = 401;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Unauthorized: Invalid or missing CRON_SECRET' }));
}
