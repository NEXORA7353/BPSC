import {
  DEFAULT_SENDER_NAME,
  DEFAULT_SENDER_EMAIL
} from './constants.js';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendBrevoEmailOptions {
  to: string | string[] | EmailRecipient | EmailRecipient[];
  subject: string;
  html?: string;
  htmlContent?: string;
  text?: string;
  textContent?: string;
  replyTo?: string | EmailRecipient;
  idempotencyKey?: string;
  tags?: string[];
}

export interface BrevoSendResult {
  success: boolean;
  messageId?: string;
  statusCode?: number;
  error?: string;
  recipient?: string;
  provider: 'brevo';
}

/**
 * Converts HTML content to a clean plain text fallback representation.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';

  let text = html;
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)');
  text = text.replace(/<br\s*[\/]?>/gi, '\n');
  text = text.replace(/<\/(p|div|h[1-6]|tr|li|blockquote)>/gi, '\n');
  text = text.replace(/<(p|div|h[1-6]|tr|li|blockquote)\b[^>]*>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&copy;/gi, '©');

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line, index, arr) => line.length > 0 || (index > 0 && arr[index - 1].length > 0));

  return lines.join('\n').trim();
}

/**
 * Normalizes various recipient representations into Brevo's expected format: Array<{ email: string, name?: string }>
 */
function normalizeBrevoRecipients(to: SendBrevoEmailOptions['to']): EmailRecipient[] {
  if (Array.isArray(to)) {
    return to
      .map((item) => {
        if (typeof item === 'string') {
          const email = item.trim();
          return email ? { email } : null;
        }
        if (item && typeof item === 'object' && item.email) {
          const email = item.email.trim();
          return email ? { email, name: item.name ? item.name.trim() : undefined } : null;
        }
        return null;
      })
      .filter((r): r is EmailRecipient => r !== null);
  }

  if (typeof to === 'string') {
    const email = to.trim();
    return email ? [{ email }] : [];
  }

  if (to && typeof to === 'object' && to.email) {
    const email = to.email.trim();
    return email ? [{ email, name: to.name ? to.name.trim() : undefined }] : [];
  }

  return [];
}

/**
 * Sends a transactional email using Brevo's SMTP API (POST https://api.brevo.com/v3/smtp/email).
 * Uses process.env.BREVO_API_KEY server-side only.
 * Logs only safe metadata (never API keys).
 */
export async function sendBrevoEmail(options: SendBrevoEmailOptions): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('[Brevo] Missing BREVO_API_KEY in server environment variables.');
    return {
      success: false,
      provider: 'brevo',
      error: 'BREVO_API_KEY is not configured in server environment variables'
    };
  }

  const recipients = normalizeBrevoRecipients(options.to);
  if (recipients.length === 0) {
    console.error('[Brevo] No valid recipients provided.');
    return {
      success: false,
      provider: 'brevo',
      error: 'No valid recipient email address provided'
    };
  }

  const htmlContent = options.htmlContent || options.html || '';
  const textContent = options.textContent || options.text || htmlToPlainText(htmlContent);
  const primaryRecipient = recipients[0]?.email || 'unknown';

  const payload: Record<string, any> = {
    sender: {
      name: DEFAULT_SENDER_NAME,
      email: DEFAULT_SENDER_EMAIL
    },
    to: recipients,
    subject: options.subject,
    htmlContent,
    textContent
  };

  if (options.replyTo) {
    if (typeof options.replyTo === 'string') {
      payload.replyTo = { email: options.replyTo.trim() };
    } else if (options.replyTo.email) {
      payload.replyTo = { email: options.replyTo.email.trim(), name: options.replyTo.name };
    }
  }

  if (options.tags && Array.isArray(options.tags) && options.tags.length > 0) {
    payload.tags = options.tags;
  }

  if (options.idempotencyKey) {
    payload.headers = {
      'X-Idempotency-Key': options.idempotencyKey
    };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const statusCode = response.status;
    const responseText = await response.text();

    let responseData: any = {};
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (response.ok || statusCode === 200 || statusCode === 201) {
      const messageId = responseData?.messageId || responseData?.['message-id'] || 'acknowledged';

      // Safe logging (NEVER logs secrets)
      console.log(
        JSON.stringify({
          recipient: primaryRecipient,
          provider: 'brevo',
          status: statusCode,
          messageId,
          success: true
        })
      );

      return {
        success: true,
        provider: 'brevo',
        statusCode,
        messageId,
        recipient: primaryRecipient
      };
    }

    // Handle error safely without logging any secret
    const errorMessage =
      responseData?.message || responseData?.code || responseText || `HTTP ${statusCode}`;

    console.error(
      JSON.stringify({
        recipient: primaryRecipient,
        provider: 'brevo',
        status: statusCode,
        error: errorMessage,
        success: false
      })
    );

    return {
      success: false,
      provider: 'brevo',
      statusCode,
      error: `Brevo API error (${statusCode}): ${errorMessage}`,
      recipient: primaryRecipient
    };
  } catch (err: any) {
    console.error('[Brevo Network Error]:', err?.message || err);
    return {
      success: false,
      provider: 'brevo',
      error: err?.message || 'Failed to connect to Brevo API',
      recipient: primaryRecipient
    };
  }
}
