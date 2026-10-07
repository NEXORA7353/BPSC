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
    const uuid = '0bb0d861-e8bd-4fe1-bf9d-808ef5ddaab9';
    const [emailDetail, eventLogs] = await Promise.all([
      fetch(`https://api.brevo.com/v3/smtp/emails/${uuid}`, { headers }).then((r) => r.json()).catch((e) => ({ error: e.message })),
      fetch(`https://api.brevo.com/v3/smtp/statistics/events?limit=10&email=arjittreadingcompany@gmail.com`, { headers }).then((r) => r.json()).catch((e) => ({ error: e.message }))
    ]);

    return sendJson(res, 200, {
      emailDetail,
      eventLogs
    });
  } catch (err: any) {
    return sendJson(res, 500, { error: err?.message || err });
  }
}
