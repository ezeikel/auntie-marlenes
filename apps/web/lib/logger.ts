import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: string | number | boolean | undefined | null;
}

interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, error?: Error, context?: LogContext) => void;
}

/**
 * Determine if we should log to PostHog based on level
 */
const shouldLogToPostHog = (level: LogLevel): boolean => {
  // Only log warnings and errors to PostHog to avoid noise
  return level === 'warn' || level === 'error';
};

/**
 * Determine if we should log to Sentry based on level
 */
const shouldLogToSentry = (level: LogLevel): boolean => {
  // Only log warnings and errors to Sentry
  return level === 'warn' || level === 'error';
};

/**
 * Log to PostHog (client-side only)
 */
const logToPostHog = (
  level: LogLevel,
  message: string,
  context?: LogContext,
) => {
  if (typeof window === 'undefined') return;

  try {
    // Dynamically import to avoid issues with server-side rendering
    import('posthog-js').then((posthog) => {
      // Check if PostHog is initialized before capturing events
      if (posthog.default && typeof posthog.default.capture === 'function') {
        posthog.default.capture(`log_${level}`, {
          message,
          level,
          ...context,
        });
      }
    });
  } catch (error) {
    // Silently fail if PostHog is not available
    console.warn('PostHog logging failed:', error);
  }
};

/**
 * Log to Sentry
 */
const logToSentry = (
  level: LogLevel,
  message: string,
  error?: Error,
  context?: LogContext,
) => {
  try {
    if (context) {
      Sentry.setContext('log_context', context);
    }

    if (level === 'error' && error) {
      Sentry.captureException(error, {
        level: 'error',
        contexts: {
          log: {
            message,
            ...context,
          },
        },
      });
    } else if (level === 'warn') {
      Sentry.captureMessage(message, {
        level: 'warning',
        contexts: {
          log: context,
        },
      });
    }
  } catch (err) {
    console.warn('Sentry logging failed:', err);
  }
};

/**
 * Log to console with formatting
 */
const logToConsole = (
  level: LogLevel,
  message: string,
  error?: Error,
  context?: LogContext,
) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  switch (level) {
    case 'debug':
      console.debug(prefix, message, context || '');
      break;
    case 'info':
      console.info(prefix, message, context || '');
      break;
    case 'warn':
      console.warn(prefix, message, context || '');
      break;
    case 'error':
      console.error(prefix, message, error || '', context || '');
      break;
  }
};

/**
 * Main logging function that routes to all destinations
 */
const log = (
  level: LogLevel,
  message: string,
  error?: Error,
  context?: LogContext,
) => {
  // Always log to console
  logToConsole(level, message, error, context);

  // Log to Sentry for warnings and errors
  if (shouldLogToSentry(level)) {
    logToSentry(level, message, error, context);
  }

  // Log to PostHog for warnings and errors
  if (shouldLogToPostHog(level)) {
    logToPostHog(level, message, context);
  }
};

/**
 * Comprehensive logger with multiple destinations:
 * - Console: All levels
 * - Sentry: Warnings and errors
 * - PostHog: Warnings and errors
 *
 * Usage:
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Payment failed', new Error('Card declined'), { amount: 100 });
 */
export const logger: Logger = {
  debug: (message: string, context?: LogContext) => {
    log('debug', message, undefined, context);
  },

  info: (message: string, context?: LogContext) => {
    log('info', message, undefined, context);
  },

  warn: (message: string, context?: LogContext) => {
    log('warn', message, undefined, context);
  },

  error: (message: string, error?: Error, context?: LogContext) => {
    log('error', message, error, context);
  },
};

export default logger;
