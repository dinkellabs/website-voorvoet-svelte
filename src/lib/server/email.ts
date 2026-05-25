import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '$env/dynamic/private';
import type { ContactFormData } from '$lib/forms/contact-schema.js';
import type { OrderFormData } from '$lib/forms/order-schema.js';
import { withRequestId } from '$lib/server/logger.js';

function sanitizeHeader(value: string): string {
  return value
    .replace(/[\r\n\t]/g, ' ')
    .trim()
    .slice(0, 200);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeHtmlMultiline(value: string): string {
  return escapeHtml(value).replace(/\n/g, '<br>');
}

// Single RFC-5321 mailbox: localpart@domain. No commas, semicolons,
// whitespace, brackets, or quotes — anything that could fan out into
// multiple recipients or smuggle headers.
const SINGLE_MAILBOX_REGEX = /^[^\s,;<>"'()[\]\\]+@[^\s,;<>"'()[\]\\]+\.[^\s,;<>"'()[\]\\]+$/;

/**
 * Rejects multi-address inputs that could be smuggled past Zod's `.email()`.
 * Defence-in-depth: we already trust Zod, but nodemailer's `replyTo` is
 * tolerant enough that header injection via a crafted display-name is worth
 * blocking at the application layer.
 */
function singleAddressOrThrow(raw: string): string {
  if (!SINGLE_MAILBOX_REGEX.test(raw)) {
    throw new Error('reply-to must be a single address');
  }
  return raw;
}

// Pooled, lazily-created transport. createTransport is called once per
// process; previously this ran on every form submission and incurred a
// fresh TCP + TLS handshake. Lazy creation keeps tests that mock
// nodemailer from triggering construction at module import.
let cachedTransport: Transporter | null = null;

function getTransport(): Transporter {
  if (cachedTransport) return cachedTransport;
  cachedTransport = nodemailer.createTransport({
    host: env.SMTP_HOST ?? 'smtp.protonmail.ch',
    port: parseInt(env.SMTP_PORT ?? '587', 10),
    secure: false,
    requireTLS: true,
    auth: {
      user: env.SMTP_USERNAME,
      pass: env.SMTP_PASSWORD,
    },
    pool: true,
    maxConnections: 3,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return cachedTransport;
}

function formatDutchDatetime(dt: Date): string {
  const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const months = [
    'januari',
    'februari',
    'maart',
    'april',
    'mei',
    'juni',
    'juli',
    'augustus',
    'september',
    'oktober',
    'november',
    'december',
  ];
  const dayName = days[dt.getDay()];
  const day = dt.getDate();
  const monthName = months[dt.getMonth()];
  const year = dt.getFullYear();
  const time = dt.toTimeString().slice(0, 5);
  return `${dayName} ${day} ${monthName} ${year} om ${time}`;
}

export async function sendContactEmail(data: ContactFormData, requestId?: string): Promise<void> {
  const log = withRequestId(requestId ?? 'no-request-id');
  const transport = getTransport();
  const fromEmail = env.SMTP_FROM_EMAIL ?? '';
  const toEmail = env.SMTP_TO_EMAIL ?? '';
  const safeReplyTo = singleAddressOrThrow(sanitizeHeader(data.email));
  const safeFirstName = sanitizeHeader(data.name);
  const safeLastName = sanitizeHeader(data.last_name);
  const safeRequestType = sanitizeHeader(data.request_type);
  const timestamp = formatDutchDatetime(new Date());

  const contactMethodLabel = data.request_type === 'Bel mij terug' ? 'Telefoonnummer' : 'E-mail';
  const contactMethodValue = data.request_type === 'Bel mij terug' ? data.phone : data.email;

  const textBody = `Nieuw contactformulier inzending

Ontvangen: ${timestamp}

Naam: ${safeFirstName} ${safeLastName}
Verzoek type: ${safeRequestType}
${contactMethodLabel}: ${contactMethodValue}

Bericht:
${data.description}`;

  const htmlBody = `<html>
<head></head>
<body>
  <h2>Nieuw contactformulier inzending</h2>
  <p><em>Ontvangen: ${escapeHtml(timestamp)}</em></p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 1rem 0;">
  <p><strong>Naam:</strong> ${escapeHtml(safeFirstName)} ${escapeHtml(safeLastName)}</p>
  <p><strong>Verzoek type:</strong> ${escapeHtml(safeRequestType)}</p>
  <p><strong>${escapeHtml(contactMethodLabel)}:</strong> ${escapeHtml(contactMethodValue)}</p>
  <h3>Bericht:</h3>
  <p>${escapeHtmlMultiline(data.description)}</p>
</body>
</html>`;

  log.info({ type: 'contact', requestType: safeRequestType }, 'sending contact email');

  await transport.sendMail({
    from: fromEmail,
    to: toEmail,
    replyTo: safeReplyTo,
    subject: `Nieuw contactformulier: ${safeRequestType}`,
    text: textBody,
    html: htmlBody,
  });

  log.info({ type: 'contact' }, 'contact email sent');
}

export async function sendOrderEmail(data: OrderFormData, requestId?: string): Promise<void> {
  const log = withRequestId(requestId ?? 'no-request-id');
  const transport = getTransport();
  const fromEmail = env.SMTP_FROM_EMAIL ?? '';
  const toEmail = env.SMTP_TO_EMAIL ?? '';
  const safeReplyTo = singleAddressOrThrow(sanitizeHeader(data.email));
  const safeFirstName = sanitizeHeader(data.first_name);
  const safeLastName = sanitizeHeader(data.last_name);
  const timestamp = formatDutchDatetime(new Date());
  const comments = data.notes?.trim() ? data.notes : '';

  const textBody = `Nieuwe zoolbestelling

Ontvangen: ${timestamp}

Naam: ${safeFirstName} ${safeLastName}
E-mail: ${data.email}
Geboortedatum: ${data.birth_date}
Soort zolen: ${data.insole_type}
Aantal: ${data.quantity}

Opmerkingen:
${comments || '(geen opmerkingen)'}`;

  const htmlBody = `<html>
<head></head>
<body>
  <h2>Nieuwe zoolbestelling</h2>
  <p><em>Ontvangen: ${escapeHtml(timestamp)}</em></p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 1rem 0;">
  <p><strong>Naam:</strong> ${escapeHtml(safeFirstName)} ${escapeHtml(safeLastName)}</p>
  <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
  <p><strong>Geboortedatum:</strong> ${escapeHtml(data.birth_date)}</p>
  <p><strong>Soort zolen:</strong> ${escapeHtml(data.insole_type)}</p>
  <p><strong>Aantal:</strong> ${escapeHtml(String(data.quantity))}</p>
  <h3>Opmerkingen:</h3>
  <p>${comments ? escapeHtmlMultiline(comments) : '<em>(geen opmerkingen)</em>'}</p>
</body>
</html>`;

  log.info(
    { type: 'order', insoleType: data.insole_type, quantity: data.quantity },
    'sending order email',
  );

  await transport.sendMail({
    from: fromEmail,
    to: toEmail,
    replyTo: safeReplyTo,
    subject: `Nieuw bestelling extra paar zolen: ${safeFirstName} ${safeLastName}`,
    text: textBody,
    html: htmlBody,
  });

  log.info({ type: 'order' }, 'order email sent');
}
