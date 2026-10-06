import { DEFAULT_SENDER_FORMATTED } from './constants.js';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendAnypostEmailOptions {
  to: string | string[] | EmailRecipient | EmailRecipient[];
  subject: string;
  html?: string;
  htmlContent?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  idempotencyKey?: string;
  tags?: string[];
}

export interface AnypostSendResult {
  success: boolean;
  emailId?: string;
  status?: string;
  statusCode?: number;
  error?: string;
}

/**
 * Converts HTML content to a clean plain text fallback representation.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';

  let text = html;

  // Remove <style>...</style> and <script>...</script>
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

  // Convert link tags: <a href="url">text</a> -> text (url)
  text = text.replace(/<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)');

  // Convert block / break tags to newlines
  text = text.replace(/<br\s*[\/]?>/gi, '\n');
  text = text.replace(/<\/(p|div|h[1-6]|tr|li|blockquote)>/gi, '\n');
  text = text.replace(/<(p|div|h[1-6]|tr|li|blockquote)\b[^>]*>/gi, '\n');

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&copy;/gi, '©');

  // Normalize newlines and trim whitespace
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line, index, arr) => line.length > 0 || (index > 0 && arr[index - 1].length > 0));

  return lines.join('\n').trim();
}

/**
 * Normalizes various recipient representations into an array of trimmed email strings.
 */
function normalizeRecipients(to: SendAnypostEmailOptions['to']): string[] {
  if (Array.isArray(to)) {
    return to
      .map((item) => (typeof item === 'string' ? item.trim() : item.email.trim()))
      .filter((email) => email.length > 0);
  }
  if (typeof to === 'string') {
    const trimmed = to.trim();
    return trimmed ? [trimmed] : [];
  }
  if (to && typeof to === 'object' && 'email' in to) {
    const trimmed = to.email.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
}

/**
 * Sends a transactional email using Anypost's HTTP API (POST https://api.anypost.com/v1/email).
 * Uses process.env.ANYPOST_API_KEY server-side only.
 * Supports Idempotency-Key header for safe retries and deduplication.
 * Returns HTTP 202 on successful submission (accepted/queued).
 */
export async function sendAnypostEmail(options: SendAnypostEmailOptions): Promise<AnypostSendResult> {
  const apiKey = process.env.ANYPOST_API_KEY;
  if (!apiKey) {
    console.error('[Anypost] Missing ANYPOST_API_KEY in environment variables.');
    return {
      success: false,
      error: 'ANYPOST_API_KEY is not configured in environment variables'
    };
  }

  const recipients = normalizeRecipients(options.to);
  if (recipients.length === 0) {
    console.error('[Anypost] No valid recipients provided.');
    return {
      success: false,
      error: 'No valid recipient email address provided'
    };
  }

  const htmlBody = options.html || options.htmlContent || '';
  const textBody = options.text || htmlToPlainText(htmlBody) || options.subject;
  const from = options.from || DEFAULT_SENDER_FORMATTED;

  const payload: Record<string, any> = {
    from,
    to: recipients,
    subject: options.subject,
    html: htmlBody,
    text: textBody
  };

  if (options.replyTo) {
    payload.replyTo = options.replyTo;
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey.trim();
  }

  try {
    const response = await fetch('https://api.anypost.com/v1/email', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    // Anypost returns HTTP 202 upon accepting the email request
    if (response.status === 202 || (response.status >= 200 && response.status < 300)) {
      let emailId: string | undefined;
      try {
        const data = await response.json();
        emailId = data?.id || data?.emailId || data?.messageId || data?.data?.id;
      } catch {
        // Response may be empty or non-JSON
      }

      console.log(
        `[Anypost] Email submission accepted/queued (HTTP ${response.status}). Email ID: ${emailId || 'acknowledged'}`
      );

      return {
        success: true,
        emailId: emailId || 'accepted',
        status: 'accepted',
        statusCode: response.status
      };
    }

    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch {
      errorBody = 'Unable to read error response';
    }

    console.error(`[Anypost API Error] HTTP ${response.status}: ${errorBody}`);
    return {
      success: false,
      statusCode: response.status,
      error: `Anypost API returned status ${response.status}: ${errorBody}`
    };
  } catch (err: any) {
    console.error('[Anypost Network Error]:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Failed to connect to Anypost API'
    };
  }
}
