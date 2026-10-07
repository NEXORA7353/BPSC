import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson } from '../_lib/response.js';

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, { error: 'BREVO_API_KEY not configured' });
  }

  const headers = {
    accept: 'application/json',
    'api-key': apiKey
  };

  try {
    const [studentLogs, parentLogs, accountInfo] = await Promise.all([
      fetch('https://api.brevo.com/v3/smtp/emails?email=patel000priya000@gmail.com&limit=5&sort=desc', { headers }).then((r) => r.json()).catch((e) => ({ error: e.message })),
      fetch('https://api.brevo.com/v3/smtp/emails?email=arjittreadingcompany@gmail.com&limit=5&sort=desc', { headers }).then((r) => r.json()).catch((e) => ({ error: e.message })),
      fetch('https://api.brevo.com/v3/account', { headers }).then((r) => r.json()).catch((e) => ({ error: e.message }))
    ]);

    return sendJson(res, 200, {
      accountInfo,
      studentLogs,
      parentLogs
    });
  } catch (err: any) {
    return sendJson(res, 500, { error: err?.message || err });
  }
}
