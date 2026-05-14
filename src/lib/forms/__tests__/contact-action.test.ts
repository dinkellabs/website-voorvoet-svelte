import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMock = createFetchMock(vi);

vi.mock('$env/dynamic/private', () => ({
  env: {
    TURNSTILE_ENABLED: 'false',
    SMTP_HOST: 'smtp.test.local',
    SMTP_PORT: '587',
    SMTP_USERNAME: 'user',
    SMTP_PASSWORD: 'pass',
    SMTP_FROM_EMAIL: 'from@test.local',
    SMTP_TO_EMAIL: 'to@test.local',
  },
}));

vi.mock('$env/dynamic/public', () => ({ env: {} }));

const mockTrackEvent = vi.fn().mockResolvedValue(undefined);
vi.mock('$lib/server/umami', () => ({
  trackEvent: mockTrackEvent,
}));

const mockSendContactEmail = vi.fn().mockResolvedValue(undefined);
vi.mock('$lib/server/email', () => ({
  sendContactEmail: mockSendContactEmail,
  sendOrderEmail: vi.fn().mockResolvedValue(undefined),
}));

const mockVerifyTurnstile = vi.fn().mockResolvedValue(true);
vi.mock('$lib/server/turnstile', () => ({
  verifyTurnstileToken: mockVerifyTurnstile,
}));

const mockIsLimited = vi.fn().mockResolvedValue(false);
vi.mock('$lib/server/rate-limiter', () => ({
  contactLimiter: { isLimited: mockIsLimited },
  orderLimiter: { isLimited: vi.fn().mockResolvedValue(false) },
}));

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v);
  }
  return fd;
}

function buildEvent(
  formData: FormData,
  lang = 'nl',
): Parameters<typeof import('../contact/action.js').contactAction>[0] {
  const url = new URL(`https://voorvoet.nl/${lang}/contact`);
  return {
    request: new Request(url, { method: 'POST', body: formData }),
    url,
    params: { lang },
    getClientAddress: () => '127.0.0.1',
    locals: { requestId: 'test' },
    cookies: {} as never,
    fetch: fetch,
    platform: undefined,
    setHeaders: vi.fn(),
    isDataRequest: false,
    isSubRequest: false,
    route: { id: '/[lang=lang]/contact' },
  } as unknown as Parameters<typeof import('../contact/action.js').contactAction>[0];
}

const validFields = {
  request_type: 'Bel mij terug',
  name: 'Jan',
  last_name: 'de Vries',
  email: 'jan@example.nl',
  phone: '0612345678',
  description: 'Testbericht over mijn voeten.',
  turnstileToken: 'valid-token',
};

describe('contactAction', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
    mockTrackEvent.mockClear();
    mockSendContactEmail.mockClear();
    mockVerifyTurnstile.mockClear();
    mockVerifyTurnstile.mockResolvedValue(true);
    mockSendContactEmail.mockResolvedValue(undefined);
    mockIsLimited.mockClear();
    mockIsLimited.mockResolvedValue(false);
  });

  afterEach(() => {
    fetchMock.disableMocks();
    vi.resetModules();
  });

  it('returns success with form on valid submission', async () => {
    const { contactAction } = await import('../contact/action.js');
    const event = buildEvent(buildFormData(validFields));
    const result = await contactAction(event);

    expect(result).toMatchObject({ success: true });
    expect(result).toHaveProperty('form');
  });

  it('calls trackEvent once on success', async () => {
    const { contactAction } = await import('../contact/action.js');
    const event = buildEvent(buildFormData(validFields));
    await contactAction(event);

    await new Promise((r) => setTimeout(r, 10));
    expect(mockTrackEvent).toHaveBeenCalledOnce();
    expect(mockTrackEvent.mock.calls[0]?.[0]).toMatchObject({ name: 'contact_form_submitted' });
  });

  it('returns 400 when validation fails', async () => {
    const { contactAction } = await import('../contact/action.js');
    const event = buildEvent(buildFormData({ ...validFields, email: 'not-an-email' }));
    const result = await contactAction(event);

    expect(result).toMatchObject({ status: 400 });
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('returns 400 with code turnstile_failed when Turnstile fails', async () => {
    mockVerifyTurnstile.mockResolvedValue(false);

    const { contactAction } = await import('../contact/action.js');
    const event = buildEvent(buildFormData(validFields));
    const result = await contactAction(event);

    expect(result).toMatchObject({
      status: 400,
      data: expect.objectContaining({ code: 'turnstile_failed' }),
    });
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('returns generic 400 submission_failed when SMTP throws (no backend leak)', async () => {
    mockSendContactEmail.mockRejectedValueOnce(new Error('SMTP down'));

    const { contactAction } = await import('../contact/action.js');
    const event = buildEvent(buildFormData(validFields));
    const result = await contactAction(event);

    expect(result).toMatchObject({
      status: 400,
      data: expect.objectContaining({ code: 'submission_failed' }),
    });
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('does not call trackEvent on validation failure', async () => {
    const { contactAction } = await import('../contact/action.js');
    const event = buildEvent(buildFormData({ ...validFields, name: 'X' }));
    await contactAction(event);

    await new Promise((r) => setTimeout(r, 10));
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('throws 429 when rate limiter trips', async () => {
    mockIsLimited.mockResolvedValueOnce(true);

    const { contactAction } = await import('../contact/action.js');
    const event = buildEvent(buildFormData(validFields));

    await expect(contactAction(event)).rejects.toMatchObject({ status: 429 });
    expect(mockSendContactEmail).not.toHaveBeenCalled();
    expect(mockVerifyTurnstile).not.toHaveBeenCalled();
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });
});
