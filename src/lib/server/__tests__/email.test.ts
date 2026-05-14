import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: {
    SMTP_HOST: 'smtp.test.local',
    SMTP_PORT: '587',
    SMTP_USERNAME: 'user@test.local',
    SMTP_PASSWORD: 'secret',
    SMTP_FROM_EMAIL: 'from@test.local',
    SMTP_TO_EMAIL: 'to@test.local',
  },
}));

const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' });
const mockCreateTransport = vi.fn(() => ({ sendMail: mockSendMail }));

vi.mock('nodemailer', () => ({
  default: { createTransport: mockCreateTransport },
}));

import type { ContactFormData } from '../../../lib/forms/contact-schema.js';
import type { OrderFormData } from '../../../lib/forms/order-schema.js';

function getLastCallArg(): Record<string, unknown> {
  const lastCall = mockSendMail.mock.calls[mockSendMail.mock.calls.length - 1];
  if (!lastCall) throw new Error('sendMail was not called');
  return lastCall[0] as Record<string, unknown>;
}

describe('email service', () => {
  beforeEach(() => {
    vi.resetModules();
    mockSendMail.mockClear();
    mockCreateTransport.mockClear();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('sendContactEmail', () => {
    it('sends with correct subject containing request_type', async () => {
      const { sendContactEmail } = await import('../email.js');

      const data: ContactFormData = {
        request_type: 'Bel mij terug',
        name: 'Jan',
        last_name: 'de Vries',
        email: 'jan@example.nl',
        phone: '0612345678',
        description: 'Testbericht',
        turnstileToken: 'token',
      };

      await sendContactEmail(data);

      expect(mockSendMail).toHaveBeenCalledOnce();
      expect(getLastCallArg().subject).toBe('Nieuw contactformulier: Bel mij terug');
    });

    it('uses subject with "Contact per email" request_type', async () => {
      const { sendContactEmail } = await import('../email.js');

      const data: ContactFormData = {
        request_type: 'Contact per email',
        name: 'Maria',
        last_name: 'Jansen',
        email: 'maria@example.nl',
        phone: '',
        description: 'Vraag over vergoeding',
        turnstileToken: 'token',
      };

      await sendContactEmail(data);

      expect(getLastCallArg().subject).toBe('Nieuw contactformulier: Contact per email');
    });

    it('sends to configured SMTP_TO_EMAIL', async () => {
      const { sendContactEmail } = await import('../email.js');

      const data: ContactFormData = {
        request_type: 'Bel mij terug',
        name: 'Jan',
        last_name: 'Doe',
        email: 'jan@example.nl',
        phone: '0612345678',
        description: 'Test',
        turnstileToken: 'tok',
      };

      await sendContactEmail(data);

      expect(getLastCallArg().to).toBe('to@test.local');
    });

    it('sets Reply-To to sanitized user email', async () => {
      const { sendContactEmail } = await import('../email.js');

      const data: ContactFormData = {
        request_type: 'Contact per email',
        name: 'Jan',
        last_name: 'Doe',
        email: 'jan@example.nl',
        phone: '',
        description: 'Test',
        turnstileToken: 'tok',
      };

      await sendContactEmail(data);

      expect(getLastCallArg().replyTo).toBe('jan@example.nl');
    });

    it('strips CR/LF from email in Reply-To', async () => {
      const { sendContactEmail } = await import('../email.js');

      const data: ContactFormData = {
        request_type: 'Contact per email',
        name: 'Attacker',
        last_name: 'Test',
        email: 'bad@example.nl\r\nBcc: victim@example.nl',
        phone: '',
        description: 'Inject',
        turnstileToken: 'tok',
      };

      // sanitizeHeader removes CR/LF/TAB; the result is then validated as a
      // single mailbox. The crafted value will fail that check and throw.
      await expect(sendContactEmail(data)).rejects.toThrow();
    });

    it('includes name and description in body', async () => {
      const { sendContactEmail } = await import('../email.js');

      const data: ContactFormData = {
        request_type: 'Bel mij terug',
        name: 'Piet',
        last_name: 'Bakker',
        email: 'piet@example.nl',
        phone: '0698765432',
        description: 'Mijn voet doet pijn',
        turnstileToken: 'tok',
      };

      await sendContactEmail(data);

      const callArg = getLastCallArg();
      expect(String(callArg.text)).toContain('Piet Bakker');
      expect(String(callArg.text)).toContain('Mijn voet doet pijn');
      expect(String(callArg.html)).toContain('Piet Bakker');
    });
  });

  describe('sendOrderEmail', () => {
    it('sends with correct subject containing first and last name', async () => {
      const { sendOrderEmail } = await import('../email.js');

      const data: OrderFormData = {
        first_name: 'Anna',
        last_name: 'Smit',
        email: 'anna@example.nl',
        phone: '0611223344',
        birth_date: '15-06-1990',
        insole_type: 'Sportzolen',
        quantity: 2,
        notes: '',
        turnstileToken: 'token',
      };

      await sendOrderEmail(data);

      expect(mockSendMail).toHaveBeenCalledOnce();
      expect(getLastCallArg().subject).toBe('Nieuw bestelling extra paar zolen: Anna Smit');
    });

    it('sends to configured SMTP_TO_EMAIL', async () => {
      const { sendOrderEmail } = await import('../email.js');

      const data: OrderFormData = {
        first_name: 'Anna',
        last_name: 'Smit',
        email: 'anna@example.nl',
        phone: '',
        birth_date: '15-06-1990',
        insole_type: 'Dagelijkse zolen',
        quantity: 1,
        notes: 'Geen opmerkingen',
        turnstileToken: 'token',
      };

      await sendOrderEmail(data);

      expect(getLastCallArg().to).toBe('to@test.local');
    });

    it('includes insole_type, quantity and birth_date in text body', async () => {
      const { sendOrderEmail } = await import('../email.js');

      const data: OrderFormData = {
        first_name: 'Kees',
        last_name: 'Bakker',
        email: 'kees@example.nl',
        phone: '0699887766',
        birth_date: '20-03-1975',
        insole_type: 'Zolen voor werkschoenen',
        quantity: 3,
        notes: '',
        turnstileToken: 'tok',
      };

      await sendOrderEmail(data);

      const callArg = getLastCallArg();
      expect(String(callArg.text)).toContain('Zolen voor werkschoenen');
      expect(String(callArg.text)).toContain('3');
      expect(String(callArg.text)).toContain('20-03-1975');
    });

    it('shows "(geen opmerkingen)" when notes is empty', async () => {
      const { sendOrderEmail } = await import('../email.js');

      const data: OrderFormData = {
        first_name: 'Kees',
        last_name: 'Bakker',
        email: 'kees@example.nl',
        phone: '',
        birth_date: '01-01-1980',
        insole_type: 'Dagelijkse zolen',
        quantity: 1,
        notes: '',
        turnstileToken: 'tok',
      };

      await sendOrderEmail(data);

      expect(String(getLastCallArg().text)).toContain('(geen opmerkingen)');
    });

    it('throws when sendMail rejects', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP refused'));

      const { sendOrderEmail } = await import('../email.js');

      const data: OrderFormData = {
        first_name: 'Err',
        last_name: 'Test',
        email: 'err@example.nl',
        phone: '',
        birth_date: '01-01-1980',
        insole_type: 'Dagelijkse zolen',
        quantity: 1,
        notes: '',
        turnstileToken: 'tok',
      };

      await expect(sendOrderEmail(data)).rejects.toThrow('SMTP refused');
    });
  });
});
