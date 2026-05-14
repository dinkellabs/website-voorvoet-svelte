/**
 * Global setup: starts a minimal in-process SMTP catcher on port 2525.
 *
 * SMTP choice rationale
 * ─────────────────────
 * The production `email.ts` uses nodemailer with `requireTLS: true`, which
 * means it will issue STARTTLS and refuse to send if the server does not
 * support it.  We therefore spin up a plain TCP server that advertises STARTTLS,
 * performs a real TLS upgrade using a `selfsigned` certificate, and then handles
 * the SMTP conversation on the encrypted socket.
 *
 * `NODE_TLS_REJECT_UNAUTHORIZED=0` is set in the webServer env so nodemailer
 * accepts our self-signed certificate.
 *
 * Delivered messages are written to `e2e/smtp-inbox.json` so individual specs
 * can read and assert on them (subject line, recipient, etc.).
 */

import * as net from 'net';
import * as tls from 'tls';
import * as fs from 'fs';
import * as path from 'path';
import selfsigned from 'selfsigned';

const SMTP_PORT = 2525;
export const INBOX_FILE = path.resolve(import.meta.dirname, 'smtp-inbox.json');

export type SmtpMessage = {
  from: string;
  to: string[];
  subject: string;
  data: string;
};

export function writeInbox(messages: SmtpMessage[]) {
  fs.writeFileSync(INBOX_FILE, JSON.stringify(messages, null, 2));
}

export function readInbox(): SmtpMessage[] {
  if (!fs.existsSync(INBOX_FILE)) return [];
  return JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8')) as SmtpMessage[];
}

function extractSubject(rawData: string): string {
  const match = rawData.match(/^Subject:\s*(.+)$/im);
  return match ? match[1].trim() : '';
}

function createSmtpHandler(socket: net.Socket | tls.TLSSocket, sendGreeting = false) {
  let buffer = '';
  let from = '';
  const to: string[] = [];
  let inData = false;
  const dataLines: string[] = [];

  const send = (line: string) => {
    if (!socket.destroyed) socket.write(line + '\r\n');
  };

  if (sendGreeting) send('220 localhost SMTP catcher ready');

  socket.on('data', (chunk: Buffer) => {
    buffer += chunk.toString();
    const parts = buffer.split('\r\n');
    buffer = parts.pop() ?? '';

    for (const line of parts) {
      if (inData) {
        if (line === '.') {
          inData = false;
          const raw = dataLines.join('\n');
          const subject = extractSubject(raw);
          const current = readInbox();
          current.push({ from, to: [...to], subject, data: raw });
          writeInbox(current);
          from = '';
          to.length = 0;
          dataLines.length = 0;
          send('250 OK: message accepted');
        } else {
          dataLines.push(line.startsWith('..') ? line.slice(1) : line);
        }
        continue;
      }

      const upper = line.toUpperCase().trimEnd();

      if (upper.startsWith('EHLO') || upper.startsWith('HELO')) {
        send('250-localhost');
        send('250 OK');
      } else if (upper.startsWith('AUTH')) {
        send('235 Authentication successful');
      } else if (upper.startsWith('MAIL FROM')) {
        const m = line.match(/MAIL FROM:\s*<([^>]*)>/i);
        from = m ? m[1] : '';
        send('250 OK');
      } else if (upper.startsWith('RCPT TO')) {
        const m = line.match(/RCPT TO:\s*<([^>]*)>/i);
        to.push(m ? m[1] : '');
        send('250 OK');
      } else if (upper === 'DATA') {
        inData = true;
        send('354 End data with <CR><LF>.<CR><LF>');
      } else if (upper === 'QUIT') {
        send('221 Bye');
        socket.end();
      } else if (upper === 'RSET') {
        from = '';
        to.length = 0;
        send('250 OK');
      } else if (upper.startsWith('NOOP')) {
        send('250 OK');
      } else {
        send('502 Command not implemented');
      }
    }
  });

  socket.on('error', () => {
    /* swallow connection resets */
  });
}

let server: net.Server | undefined;

export default async function globalSetup() {
  writeInbox([]);

  const notAfterDate = new Date();
  notAfterDate.setFullYear(notAfterDate.getFullYear() + 1);
  const pems = await selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
    keySize: 2048,
    notAfterDate,
  });

  const secureContext = tls.createSecureContext({
    cert: pems.cert,
    key: pems.private,
  });

  server = net.createServer((plainSocket) => {
    let buf = '';
    let didStartTls = false;

    const sendPlain = (line: string) => {
      if (!plainSocket.destroyed) plainSocket.write(line + '\r\n');
    };

    sendPlain('220 localhost SMTP catcher ready');

    plainSocket.on('data', (chunk: Buffer) => {
      if (didStartTls) return;
      buf += chunk.toString();
      const parts = buf.split('\r\n');
      buf = parts.pop() ?? '';

      for (const line of parts) {
        const upper = line.toUpperCase().trimEnd();
        if (upper.startsWith('EHLO') || upper.startsWith('HELO')) {
          sendPlain('250-localhost');
          sendPlain('250 STARTTLS');
        } else if (upper === 'STARTTLS') {
          sendPlain('220 Ready to start TLS');
          didStartTls = true;
          plainSocket.removeAllListeners('data');

          const tlsSock = new tls.TLSSocket(plainSocket, {
            isServer: true,
            secureContext,
          });

          tlsSock.once('secure', () => createSmtpHandler(tlsSock, false));
          tlsSock.on('error', () => {
            /* swallow */
          });
        } else {
          sendPlain('502 Command not implemented before STARTTLS');
        }
      }
    });

    plainSocket.on('error', () => {});
  });

  await new Promise<void>((resolve, reject) => {
    server!.listen(SMTP_PORT, '127.0.0.1', () => resolve());
    server!.once('error', reject);
  });

  return async () => {
    await new Promise<void>((resolve) => server?.close(() => resolve()));
  };
}
