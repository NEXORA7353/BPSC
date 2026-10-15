import { sendBrevoEmail, SendBrevoEmailOptions, BrevoSendResult } from './brevo.js';
import { sendAnypostEmail, SendAnypostEmailOptions, AnypostSendResult } from './anypost.js';

export interface PortalEmailOptions {
  to: string | string[] | { email: string; name?: string } | Array<{ email: string; name?: string }>;
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
  tags?: string[];
  replyTo?: string;
}

export interface PortalEmailResult {
  success: boolean;
  provider: 'brevo' | 'anypost' | 'none';
  messageId?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Unified transactional email dispatcher for BPSC TRE 4.0 Portal.
 * Automatically tries Brevo first (if configured), and falls back seamlessly to Anypost
 * if Brevo fails or is not configured.
 */
export async function sendPortalEmail(options: PortalEmailOptions): Promise<PortalEmailResult> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const anypostApiKey = process.env.ANYPOST_API_KEY;

  // 1. Try Brevo if key is present
  if (brevoApiKey) {
    try {
      const brevoRes: BrevoSendResult = await sendBrevoEmail({
        to: options.to,
        subject: options.subject,
        htmlContent: options.html,
        text: options.text,
        idempotencyKey: options.idempotencyKey,
        tags: options.tags,
        replyTo: options.replyTo
      });

      if (brevoRes.success) {
        return {
          success: true,
          provider: 'brevo',
          messageId: brevoRes.messageId,
          statusCode: brevoRes.statusCode
        };
      }

      console.warn('[Mailer] Brevo failed, checking fallback to Anypost...', brevoRes.error);
    } catch (err: any) {
      console.warn('[Mailer] Brevo unexpected exception:', err?.message || err);
    }
  }

  // 2. Fallback to Anypost
  if (anypostApiKey) {
    try {
      const anypostRes: AnypostSendResult = await sendAnypostEmail({
        to: options.to as any,
        subject: options.subject,
        html: options.html,
        text: options.text,
        idempotencyKey: options.idempotencyKey,
        tags: options.tags,
        replyTo: options.replyTo
      });

      if (anypostRes.success) {
        return {
          success: true,
          provider: 'anypost',
          messageId: anypostRes.emailId,
          statusCode: anypostRes.statusCode
        };
      }

      return {
        success: false,
        provider: 'anypost',
        error: anypostRes.error || 'Anypost delivery failed',
        statusCode: anypostRes.statusCode
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'anypost',
        error: err?.message || 'Anypost unexpected exception'
      };
    }
  }

  return {
    success: false,
    provider: 'none',
    error: 'Neither BREVO_API_KEY nor ANYPOST_API_KEY is configured in server environment'
  };
}
