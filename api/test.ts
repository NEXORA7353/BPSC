import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson } from './_lib/response.js';

export default function handler(req: VercelRequest | any, res: VercelResponse | any) {
  sendJson(res, 200, {
    status: 'ok',
    message: 'BPSC TRE 4.0 Serverless API online',
    timestamp: new Date().toISOString()
  });
}
