import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendBrevoEmail } from '../_lib/brevo.js';
import {
  DEFAULT_STUDENT_EMAIL,
  DEFAULT_PARENT_EMAIL
} from '../_lib/constants.js';
import { sendJson } from '../_lib/response.js';

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  const timestamp = Date.now();

  try {
    // --------------------------------------------------------------------------
    // EMAIL 1: Student (patel000priya000@gmail.com)
    // --------------------------------------------------------------------------
    const studentRes = await sendBrevoEmail({
      to: DEFAULT_STUDENT_EMAIL, // patel000priya000@gmail.com
      subject: 'BPSC TRE 4.0 Mock Portal - Real Email Test',
      htmlContent: '<h2>BPSC TRE 4.0 Mock Portal</h2><p>This is a real transactional email test from the production email system.</p><p>Student recipient test.</p>',
      textContent: 'BPSC TRE 4.0 Mock Portal - This is a real transactional email test from the production email system. Student recipient test.',
      idempotencyKey: `brevo_manual_test_student_${timestamp}`,
      tags: ['bpsc-real-email-test-student']
    });

    // --------------------------------------------------------------------------
    // EMAIL 2: Parent (arjittreadingcompany@gmail.com)
    // --------------------------------------------------------------------------
    const parentRes = await sendBrevoEmail({
      to: DEFAULT_PARENT_EMAIL, // arjittreadingcompany@gmail.com
      subject: 'BPSC TRE 4.0 Mock Portal - Real Email Test',
      htmlContent: '<h2>BPSC TRE 4.0 Mock Portal</h2><p>This is a real transactional email test from the production email system.</p><p>Parent recipient test.</p>',
      textContent: 'BPSC TRE 4.0 Mock Portal - This is a real transactional email test from the production email system. Parent recipient test.',
      idempotencyKey: `brevo_manual_test_parent_${timestamp}`,
      tags: ['bpsc-real-email-test-parent']
    });

    // Log only safe information as requested in Section 6
    console.log(
      JSON.stringify({
        recipient: DEFAULT_STUDENT_EMAIL,
        provider: 'brevo',
        status: studentRes.statusCode || (studentRes.success ? 201 : 500),
        messageId: studentRes.messageId || 'N/A',
        success: studentRes.success
      })
    );

    console.log(
      JSON.stringify({
        recipient: DEFAULT_PARENT_EMAIL,
        provider: 'brevo',
        status: parentRes.statusCode || (parentRes.success ? 201 : 500),
        messageId: parentRes.messageId || 'N/A',
        success: parentRes.success
      })
    );

    return sendJson(res, 200, {
      success: studentRes.success && parentRes.success,
      provider: 'brevo',
      studentTest: {
        recipient: DEFAULT_STUDENT_EMAIL,
        provider: 'brevo',
        status: studentRes.statusCode || (studentRes.success ? 201 : 500),
        messageId: studentRes.messageId,
        success: studentRes.success,
        error: studentRes.error
      },
      parentTest: {
        recipient: DEFAULT_PARENT_EMAIL,
        provider: 'brevo',
        status: parentRes.statusCode || (parentRes.success ? 201 : 500),
        messageId: parentRes.messageId,
        success: parentRes.success,
        error: parentRes.error
      }
    });
  } catch (err: any) {
    console.error('[test-brevo error]:', err?.message || err);
    return sendJson(res, 500, {
      error: 'Internal server error running Brevo test',
      message: err?.message || 'Unknown error'
    });
  }
}
