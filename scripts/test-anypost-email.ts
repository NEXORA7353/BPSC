import 'dotenv/config';
import { sendAnypostEmail } from '../api/_lib/anypost.js';
import { DEFAULT_SENDER_FORMATTED } from '../api/_lib/constants.js';

interface TestResultSummary {
  recipient: string;
  role: 'Student' | 'Parent';
  statusCode?: number;
  emailId?: string;
  success: boolean;
  error?: string;
}

function getStudentHtml(): string {
  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <title>BPSC TRE 4.0 Mock Portal - Anypost Test Email (Student)</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px; text-align: center; border-bottom: 3px solid #f59e0b;">
      <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800;">BPSC TRE 4.0 Mock Portal</h1>
      <p style="margin: 6px 0 0 0; color: #fbbf24; font-size: 13px; font-weight: 600; text-transform: uppercase;">Email Delivery Verification</p>
    </div>
    <div style="padding: 28px 24px;">
      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #1e40af;">
          यह BPSC TRE 4.0 Mock Portal की Anypost email delivery testing है. यदि यह email आपको प्राप्त हुआ है, तो student email delivery successfully working है.
        </p>
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
        <p style="margin: 6px 0; font-size: 14px;"><strong>Portal:</strong> BPSC TRE 4.0 Mock Portal</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Email Provider:</strong> Anypost</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Test Type:</strong> Student Email Delivery Test</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Recipient:</strong> patel000priya000@gmail.com</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Sender:</strong> BPSC TRE 4.0 Mock Portal &lt;noreply@bpsc.dpdns.org&gt;</p>
      </div>
    </div>
    <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
      BPSC TRE 4.0 Mathematics Real Exam Simulator · Verified Sending Domain: bpsc.dpdns.org
    </div>
  </div>
</body>
</html>`;
}

function getParentHtml(): string {
  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <title>BPSC TRE 4.0 Mock Portal - Anypost Test Email (Parent)</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px; text-align: center; border-bottom: 3px solid #f59e0b;">
      <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800;">BPSC TRE 4.0 Mock Portal</h1>
      <p style="margin: 6px 0 0 0; color: #fbbf24; font-size: 13px; font-weight: 600; text-transform: uppercase;">Email Delivery Verification</p>
    </div>
    <div style="padding: 28px 24px;">
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #15803d;">
          यह BPSC TRE 4.0 Mock Portal की Anypost email delivery testing है. यदि यह email आपको प्राप्त हुआ है, तो parent email delivery successfully working है.
        </p>
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
        <p style="margin: 6px 0; font-size: 14px;"><strong>Portal:</strong> BPSC TRE 4.0 Mock Portal</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Email Provider:</strong> Anypost</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Test Type:</strong> Parent Email Delivery Test</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Recipient:</strong> arjittreadingcompany@gmail.com</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Sender:</strong> BPSC TRE 4.0 Mock Portal &lt;noreply@bpsc.dpdns.org&gt;</p>
      </div>
    </div>
    <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
      BPSC TRE 4.0 Mathematics Real Exam Simulator · Verified Sending Domain: bpsc.dpdns.org
    </div>
  </div>
</body>
</html>`;
}

async function runEndToEndTest(): Promise<void> {
  const timestamp = Date.now();
  console.log('==================================================');
  console.log('BPSC TRE 4.0 - ANYPOST END-TO-END DELIVERY TEST');
  console.log('==================================================');
  console.log(`Sender: ${DEFAULT_SENDER_FORMATTED}`);
  console.log(`Execution Timestamp: ${new Date().toISOString()}`);
  console.log('--------------------------------------------------\n');

  if (!process.env.ANYPOST_API_KEY) {
    console.warn('[Warning] ANYPOST_API_KEY is not detected in local environment variables.');
    console.warn('[Note] Key is configured in Vercel. Proceeding with sendAnypostEmail invocation...\n');
  }

  const results: TestResultSummary[] = [];

  // --------------------------------------------------------------------------
  // EMAIL 1: Student
  // --------------------------------------------------------------------------
  const studentRecipient = 'patel000priya000@gmail.com';
  const studentSubject = 'BPSC TRE 4.0 Mock Portal - Anypost Test Email (Student)';
  const studentIdempotencyKey = `anypost_manual_test_student_${timestamp}`;

  console.log(`[Testing 1/2] Student Recipient: ${studentRecipient}`);
  console.log(`Idempotency Key: ${studentIdempotencyKey}`);

  try {
    const studentRes = await sendAnypostEmail({
      to: studentRecipient,
      subject: studentSubject,
      html: getStudentHtml(),
      idempotencyKey: studentIdempotencyKey
    });

    results.push({
      recipient: studentRecipient,
      role: 'Student',
      statusCode: studentRes.statusCode,
      emailId: studentRes.emailId,
      success: studentRes.success,
      error: studentRes.error
    });

    console.log(`Anypost HTTP Status: ${studentRes.statusCode ?? 'N/A'}`);
    console.log(`Anypost Email ID: ${studentRes.emailId ?? 'N/A'}`);
    console.log(`Result: ${studentRes.success ? 'ACCEPTED (HTTP 202)' : 'FAILED'}\n`);
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
  // EMAIL 2: Parent
  // --------------------------------------------------------------------------
  const parentRecipient = 'arjittreadingcompany@gmail.com';
  const parentSubject = 'BPSC TRE 4.0 Mock Portal - Anypost Test Email (Parent)';
  const parentIdempotencyKey = `anypost_manual_test_parent_${timestamp}`;

  console.log(`[Testing 2/2] Parent Recipient: ${parentRecipient}`);
  console.log(`Idempotency Key: ${parentIdempotencyKey}`);

  try {
    const parentRes = await sendAnypostEmail({
      to: parentRecipient,
      subject: parentSubject,
      html: getParentHtml(),
      idempotencyKey: parentIdempotencyKey
    });

    results.push({
      recipient: parentRecipient,
      role: 'Parent',
      statusCode: parentRes.statusCode,
      emailId: parentRes.emailId,
      success: parentRes.success,
      error: parentRes.error
    });

    console.log(`Anypost HTTP Status: ${parentRes.statusCode ?? 'N/A'}`);
    console.log(`Anypost Email ID: ${parentRes.emailId ?? 'N/A'}`);
    console.log(`Result: ${parentRes.success ? 'ACCEPTED (HTTP 202)' : 'FAILED'}\n`);
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
  console.log('ANYPOST REAL EMAIL DELIVERY TEST SUMMARY');
  console.log('==================================================');

  for (const r of results) {
    console.log(`\n${r.role} email:`);
    console.log(r.recipient);
    console.log(`Anypost status: ${r.statusCode ?? 'N/A'}`);
    console.log(`Anypost email ID: ${r.emailId ?? 'N/A'}`);
    console.log(`Submission: ${r.success ? 'SUCCESS' : 'FAILED'}`);
    if (r.error) {
      console.log(`Error detail: ${r.error}`);
    }
  }

  console.log('\n==================================================');
  console.log('WAITING FOR USER CONFIRMATION OF ACTUAL INBOX DELIVERY.');
  console.log('==================================================\n');
}

runEndToEndTest().catch((err) => {
  console.error('[Fatal Error running Anypost test script]:', err?.message || err);
  process.exit(1);
});
