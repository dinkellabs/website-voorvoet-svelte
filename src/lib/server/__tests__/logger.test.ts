import { describe, it, expect, vi } from 'vitest';

vi.mock('$app/environment', () => ({
  dev: false,
  building: false,
}));

vi.mock('pino', () => {
  const childLogger = {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const child = vi.fn(() => childLogger);
  const logger = {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child,
  };
  return { default: vi.fn(() => logger) };
});

import { withRequestId } from '../logger.js';
import logger from '../logger.js';

describe('logger', () => {
  it('exports a default logger', () => {
    expect(logger).toBeDefined();
  });

  it('withRequestId returns a child logger bound to requestId', () => {
    const child = withRequestId('test-request-id-123');
    expect(child).toBeDefined();
    expect(typeof child.info).toBe('function');
  });

  it('child logger has the same interface as logger', () => {
    const child = withRequestId('another-id');
    expect(typeof child.info).toBe('function');
    expect(typeof child.debug).toBe('function');
    expect(typeof child.warn).toBe('function');
    expect(typeof child.error).toBe('function');
  });
});
