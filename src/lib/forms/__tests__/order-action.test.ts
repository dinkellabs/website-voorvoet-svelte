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

const mockSendOrderEmail = vi.fn().mockResolvedValue(undefined);
vi.mock('$lib/server/email', () => ({
  sendContactEmail: vi.fn().mockResolvedValue(undefined),
  sendOrderEmail: mockSendOrderEmail,
}));

const mockVerifyTurnstile = vi.fn().mockResolvedValue(true);
vi.mock('$lib/server/turnstile', () => ({
  verifyTurnstileToken: mockVerifyTurnstile,
}));

const mockIsLimited = vi.fn().mockResolvedValue(false);
vi.mock('$lib/server/rate-limiter', () => ({
  contactLimiter: { isLimited: vi.fn().mockResolvedValue(false) },
  orderLimiter: { isLimited: mockIsLimited },
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
): Parameters<typeof import('../order/action.js').orderAction>[0] {
  const url = new URL(`https://voorvoet.nl/${lang}/zolen-bestellen`);
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
    route: { id: '/[lang=lang]/zolen-bestellen' },
  } as unknown as Parameters<typeof import('../order/action.js').orderAction>[0];
}

const validFields = {
  first_name: 'Anna',
  last_name: 'Smit',
  email: 'anna@example.nl',
  phone: '0612345678',
  birth_date: '15-06-1990',
  insole_type: 'Dagelijkse zolen',
  quantity: '2',
  notes: '',
  turnstileToken: 'valid-token',
};

describe('orderAction', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
    mockTrackEvent.mockClear();
    mockSendOrderEmail.mockClear();
    mockVerifyTurnstile.mockClear();
    mockVerifyTurnstile.mockResolvedValue(true);
    mockSendOrderEmail.mockResolvedValue(undefined);
    mockIsLimited.mockClear();
    mockIsLimited.mockResolvedValue(false);
  });

  afterEach(() => {
    fetchMock.disableMocks();
    vi.resetModules();
  });

  it('returns success with form on valid submission', async () => {
    const { orderAction } = await import('../order/action.js');
    const event = buildEvent(buildFormData(validFields));
    const result = await orderAction(event);

    expect(result).toMatchObject({ success: true });
    expect(result).toHaveProperty('form');
  });

  it('calls trackEvent once on success with correct event name', async () => {
    const { orderAction } = await import('../order/action.js');
    const event = buildEvent(buildFormData(validFields));
    await orderAction(event);

    await new Promise((r) => setTimeout(r, 10));
    expect(mockTrackEvent).toHaveBeenCalledOnce();
    expect(mockTrackEvent.mock.calls[0]?.[0]).toMatchObject({ name: 'order_insoles_submitted' });
  });

  it('returns 400 when validation fails (invalid email)', async () => {
    const { orderAction } = await import('../order/action.js');
    const event = buildEvent(buildFormData({ ...validFields, email: 'bad-email' }));
    const result = await orderAction(event);

    expect(result).toMatchObject({ status: 400 });
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('returns 400 when validation fails (quantity out of range)', async () => {
    const { orderAction } = await import('../order/action.js');
    const event = buildEvent(buildFormData({ ...validFields, quantity: '5' }));
    const result = await orderAction(event);

    expect(result).toMatchObject({ status: 400 });
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('returns 400 with code turnstile_failed when Turnstile fails', async () => {
    mockVerifyTurnstile.mockResolvedValue(false);

    const { orderAction } = await import('../order/action.js');
    const event = buildEvent(buildFormData(validFields));
    const result = await orderAction(event);

    expect(result).toMatchObject({
      status: 400,
      data: expect.objectContaining({ code: 'turnstile_failed' }),
    });
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('returns generic 400 submission_failed when SMTP throws (no backend leak)', async () => {
    mockSendOrderEmail.mockRejectedValueOnce(new Error('SMTP connection refused'));

    const { orderAction } = await import('../order/action.js');
    const event = buildEvent(buildFormData(validFields));
    const result = await orderAction(event);

    expect(result).toMatchObject({
      status: 400,
      data: expect.objectContaining({ code: 'submission_failed' }),
    });
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('does not call trackEvent on Turnstile failure', async () => {
    mockVerifyTurnstile.mockResolvedValue(false);

    const { orderAction } = await import('../order/action.js');
    const event = buildEvent(buildFormData(validFields));
    await orderAction(event);

    await new Promise((r) => setTimeout(r, 10));
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('throws 429 when rate limiter trips', async () => {
    mockIsLimited.mockResolvedValueOnce(true);

    const { orderAction } = await import('../order/action.js');
    const event = buildEvent(buildFormData(validFields));

    await expect(orderAction(event)).rejects.toMatchObject({ status: 429 });
    expect(mockSendOrderEmail).not.toHaveBeenCalled();
    expect(mockVerifyTurnstile).not.toHaveBeenCalled();
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });
});
