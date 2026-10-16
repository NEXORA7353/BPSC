import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminFirestore, isFirebaseAdminConfigured } from '../_lib/firestoreAdmin.js';
import { sendJson } from '../_lib/response.js';

function parseRequestBody(req: any): any {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }
  return {};
}

/**
 * Endpoint to register student device push subscriptions for offline notifications.
 * Works even when student is completely offline / website is closed.
 */
export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const body = parseRequestBody(req);
    const { subscription, studentName = 'Priya Patel', deviceId } = body;

    if (!subscription || !subscription.endpoint) {
      return sendJson(res, 400, { error: 'Missing or invalid push subscription object' });
    }

    const endpoint = String(subscription.endpoint);
    // Create a deterministic safe doc ID from endpoint
    const endpointHash = Buffer.from(endpoint).toString('base64url').slice(-40);
    const docId = deviceId || `sub_${endpointHash}`;

    if (isFirebaseAdminConfigured()) {
      try {
        const db = getAdminFirestore();
        await db.collection('push_subscriptions').doc(docId).set(
          {
            docId,
            endpoint,
            keys: subscription.keys || {},
            studentName,
            userAgent: req.headers['user-agent'] || 'unknown',
            updatedAt: new Date().toISOString(),
            active: true
          },
          { merge: true }
        );
      } catch (err: any) {
        console.warn('[push/subscribe] Firestore save warning:', err?.message || err);
      }
    }

    return sendJson(res, 200, {
      success: true,
      message: 'Device registered for automatic offline notifications',
      docId
    });
  } catch (err: any) {
    console.error('[push/subscribe] Unexpected error:', err?.message || err);
    return sendJson(res, 500, { error: err?.message || 'Failed to register push subscription' });
  }
}
