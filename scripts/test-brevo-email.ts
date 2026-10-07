import 'dotenv/config';
import { sendBrevoEmail } from '../api/_lib/brevo.js';
import { DEFAULT_SENDER_FORMATTED, DEFAULT_STUDENT_EMAIL, DEFAULT_PARENT_EMAIL } from '../api/_lib/constants.js';

interface TestResultSummary {
  recipient: string;
  role: 'Student' | 'Parent';
  statusCode?: number;
  messageId?: string;
  success: boolean;
  error?: string;
}

async function runEndToEndTest() {
  const timestamp = Date.now();
  console.log('==================================================');
  console.log('BPSC TRE 4.0 - BREVO END-TO-END DELIVERY TEST');
  console.log('==================================================');
  console.log(`Sender: ${DEFAULT_SENDER_FORMATTED}`);
  console.log(`Execution Timestamp: ${new Date().toISOString()}`);
  console.log('--------------------------------------------------\n');

  if (!process.env.BREVO_API_KEY) {
    console.warn('[Warning] BREVO_API_KEY is not detected in local environment variables.');
    console.warn('[Note] Key is configured in Vercel. Proceeding with sendBrevoEmail invocation...\n');
  }

  const results: TestResultSummary[] = [];

  // --------------------------------------------------------------------------
  // EMAIL 1: Student (patel000priya000@gmail.com)
  // --------------------------------------------------------------------------
  const studentRecipient = DEFAULT_STUDENT_EMAIL; // 'patel000priya000@gmail.com'
  const studentSubject = 'BPSC TRE 4.0 Mock Portal - Real Email Test';
  const studentIdempotencyKey = `brevo_manual_test_student_${timestamp}`;

  console.log(`[Testing 1/2] Student Recipient: ${studentRecipient}`);
  console.log(`Idempotency Key: ${studentIdempotencyKey}`);

  try {
    const studentRes = await sendBrevoEmail({
      to: studentRecipient,
      subject: studentSubject,
      htmlContent: `<h2>BPSC TRE 4.0 Mock Portal</h2><p>This is a real transactional email test from the production email system.</p><p>Student recipient test.</p>`,
      textContent: `BPSC TRE 4.0 Mock Portal - This is a real transactional email test from the production email system. Student recipient test.`,
      idempotencyKey: studentIdempotencyKey,
      tags: ['bpsc-real-email-test-student']
    });

    results.push({
      recipient: studentRecipient,
      role: 'Student',
      statusCode: studentRes.statusCode,
      messageId: studentRes.messageId,
      success: studentRes.success,
      error: studentRes.error
    });

    console.log(`Brevo HTTP Status: ${studentRes.statusCode ?? 'N/A'}`);
    console.log(`Brevo Message ID: ${studentRes.messageId ?? 'N/A'}`);
    console.log(`Result: ${studentRes.success ? 'SUCCESS (HTTP 201)' : 'FAILED'}\n`);
  } catch (err: any) {
    results.push({
      recipient: studentRecipient,
      role: 'Student',
      success: false,
      error: err?.message || 'Unexpected error'
    });
    console.error(`Student send threw error: ${err?.message || err}\n`);
  }

  // --------------------------------------------------------------------------
  // EMAIL 2: Parent (arjittreadingcompany@gmail.com)
  // --------------------------------------------------------------------------
  const parentRecipient = DEFAULT_PARENT_EMAIL; // 'arjittreadingcompany@gmail.com'
  const parentSubject = 'BPSC TRE 4.0 Mock Portal - Real Email Test';
  const parentIdempotencyKey = `brevo_manual_test_parent_${timestamp}`;

  console.log(`[Testing 2/2] Parent Recipient: ${parentRecipient}`);
  console.log(`Idempotency Key: ${parentIdempotencyKey}`);

  try {
    const parentRes = await sendBrevoEmail({
      to: parentRecipient,
      subject: parentSubject,
      htmlContent: `<h2>BPSC TRE 4.0 Mock Portal</h2><p>This is a real transactional email test from the production email system.</p><p>Parent recipient test.</p>`,
      textContent: `BPSC TRE 4.0 Mock Portal - This is a real transactional email test from the production email system. Parent recipient test.`,
      idempotencyKey: parentIdempotencyKey,
      tags: ['bpsc-real-email-test-parent']
    });

    results.push({
      recipient: parentRecipient,
      role: 'Parent',
      statusCode: parentRes.statusCode,
      messageId: parentRes.messageId,
      success: parentRes.success,
      error: parentRes.error
    });

    console.log(`Brevo HTTP Status: ${parentRes.statusCode ?? 'N/A'}`);
    console.log(`Brevo Message ID: ${parentRes.messageId ?? 'N/A'}`);
    console.log(`Result: ${parentRes.success ? 'SUCCESS (HTTP 201)' : 'FAILED'}\n`);
  } catch (err: any) {
    results.push({
      recipient: parentRecipient,
      role: 'Parent',
      success: false,
      error: err?.message || 'Unexpected error'
    });
    console.error(`Parent send threw error: ${err?.message || err}\n`);
  }

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('==================================================');
  console.log('BREVO REAL EMAIL DELIVERY TEST SUMMARY');
  console.log('==================================================');

  for (const r of results) {
    console.log(`\n${r.role} email:`);
    console.log(r.recipient);
    console.log(`Brevo status: ${r.statusCode ?? 'N/A'}`);
    console.log(`Brevo message ID: ${r.messageId ?? 'N/A'}`);
    console.log(`Submission: ${r.success ? 'SUCCESS' : 'FAILED'}`);
    if (r.error) {
      console.log(`Error detail: ${r.error}`);
    }
  }

  console.log('\n==================================================');
  console.log('TEST COMPLETE');
  console.log('==================================================\n');
}

runEndToEndTest().catch((err) => {
  console.error('[Fatal Error running Brevo test script]:', err?.message || err);
  process.exit(1);
});
