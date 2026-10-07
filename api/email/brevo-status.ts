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
    const [domainDetail] = await Promise.all([
      fetch(`https://api.brevo.com/v3/senders/domains/bpsc.dpdns.org`, { headers }).then((r) => r.json()).catch((e) => ({ error: e.message }))
    ]);

    return sendJson(res, 200, {
      domainDetail
    });
  } catch (err: any) {
    return sendJson(res, 500, { error: err?.message || err });
  }
}
