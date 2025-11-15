/**
 * Error Logging Utility
 * Centralized logging system for errors and important events
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: any
}

/**
 * Logs an error with additional context
 * In production, this could be extended to send to external monitoring service
 */
export function logError(
  error: Error | string,
  context?: LogContext
) {
  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = typeof error === 'string' ? undefined : error.stack

  const logData = {
    level: 'error' as LogLevel,
    message: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    ...context
  }

  console.error('[ERROR]', logData)

  // In production, send to error tracking service
  // if (process.env.NODE_ENV === 'production') {
  //   sendToSentry(logData)
  //   sendToLogRocket(logData)
  // }
}

/**
 * Logs a warning message
 */
export function logWarning(
  message: string,
  context?: LogContext
) {
  const logData = {
    level: 'warn' as LogLevel,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    ...context
  }

  console.warn('[WARN]', logData)
}

/**
 * Logs an info message
 */
export function logInfo(
  message: string,
  context?: LogContext
) {
  const logData = {
    level: 'info' as LogLevel,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    ...context
  }

  console.info('[INFO]', logData)
}

/**
 * Logs a debug message (only in development)
 */
export function logDebug(
  message: string,
  context?: LogContext
) {
  if (process.env.NODE_ENV === 'development') {
    const logData = {
      level: 'debug' as LogLevel,
      message,
      timestamp: new Date().toISOString(),
      ...context
    }

    console.debug('[DEBUG]', logData)
  }
}

/**
 * Logs API errors with request details
 */
export function logApiError(
  endpoint: string,
  method: string,
  error: Error | string,
  statusCode?: number,
  userId?: string
) {
  logError(error, {
    type: 'api_error',
    endpoint,
    method,
    statusCode,
    userId
  })
}

/**
 * Logs database errors
 */
export function logDatabaseError(
  operation: string,
  error: Error | string,
  query?: string
) {
  logError(error, {
    type: 'database_error',
    operation,
    query: query ? query.substring(0, 200) : undefined // Truncate long queries
  })
}

/**
 * Logs authentication errors
 */
export function logAuthError(
  action: string,
  error: Error | string,
  email?: string
) {
  logError(error, {
    type: 'auth_error',
    action,
    email: email ? email.substring(0, 3) + '***' : undefined // Mask email for privacy
  })
}
