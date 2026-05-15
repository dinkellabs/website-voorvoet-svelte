import pino from 'pino';
import { dev } from '$app/environment';

const logger = pino({
  level: dev ? 'debug' : 'info',
  redact: {
    paths: [
      '*.password',
      '*.SMTP_PASSWORD',
      '*.CAP_SECRET',
      '*.auth.pass',
      '*.headers.authorization',
      '*.headers.cookie',
      '*.req.headers.authorization',
      'err.config.auth',
      'err.options.auth',
      'err.options.auth.pass',
    ],
    remove: true,
  },
  ...(dev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
        },
      }
    : {}),
});

/**
 * Returns a child logger bound to a specific requestId.
 *
 * @param requestId - UUID v4 identifying the request
 */
export function withRequestId(requestId: string): pino.Logger {
  return logger.child({ requestId });
}

export default logger;
