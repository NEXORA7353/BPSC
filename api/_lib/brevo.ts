import { sendAnypostEmail } from './anypost.js';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  replyTo?: EmailRecipient;
  tags?: string[];
}

export interface BrevoSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * @deprecated Brevo email provider has been deprecated and migrated to Anypost (POST https://api.anypost.com/v1/email).
 * All active workflows now use sendAnypostEmail directly.
 * This compatibility wrapper safely routes to Anypost instead of calling Brevo APIs.
 */
export async function sendBrevoEmail(options: SendEmailOptions): Promise<BrevoSendResult> {
  console.warn('[Deprecated] sendBrevoEmail was called. Safely routing via Anypost.');
  const result = await sendAnypostEmail({
    to: options.to,
    subject: options.subject,
    html: options.htmlContent,
    replyTo: options.replyTo ? options.replyTo.email : undefined,
    tags: options.tags
  });

  return {
    success: result.success,
    messageId: result.emailId,
    error: result.error
  };
}
