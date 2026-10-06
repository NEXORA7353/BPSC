import { DEFAULT_SENDER_EMAIL, DEFAULT_SENDER_NAME } from './constants.js';

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
 * Sends a transactional email using Brevo's v3 SMTP REST API.
 * Uses process.env.BREVO_API_KEY server-side.
 */
export async function sendBrevoEmail(options: SendEmailOptions): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('[Brevo] Missing BREVO_API_KEY in environment variables.');
    return {
      success: false,
      error: 'BREVO_API_KEY is not configured in environment variables'
    };
  }

  const payload = {
    sender: {
      name: DEFAULT_SENDER_NAME,
      email: DEFAULT_SENDER_EMAIL
    },
    to: options.to.map((recipient) => ({
      email: recipient.email.trim(),
      name: recipient.name || recipient.email.trim()
    })),
    subject: options.subject,
    htmlContent: options.htmlContent,
    replyTo: options.replyTo ? {
      email: options.replyTo.email.trim(),
      name: options.replyTo.name || options.replyTo.email.trim()
    } : undefined,
    tags: options.tags || ['bpsc-tre4-notification']
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Brevo API Error] HTTP ${response.status}: ${errorBody}`);
      return {
        success: false,
        error: `Brevo API returned status ${response.status}: ${errorBody}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId || 'sent'
    };
  } catch (err: any) {
    console.error('[Brevo Network Error]:', err);
    return {
      success: false,
      error: err?.message || 'Failed to connect to Brevo API'
    };
  }
}
