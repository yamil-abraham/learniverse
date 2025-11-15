/**
 * AI Error Handling
 * Phase 4 - Adaptive Learning System
 */

import { AI_CONFIG } from './config'

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: any
  ) {
    super(message)
    this.name = 'AIServiceError'
  }
}

/**
 * Wraps AI operations with error handling and fallback values
 */
export async function withAIErrorHandling<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string = 'AI Operation'
): Promise<T> {
  try {
    return await operation()
  } catch (error: any) {
    console.error(`[AI Error] ${operationName}:`, error)

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      console.error('❌ OpenAI quota exceeded. Using fallback.')
    } else if (error.code === 'rate_limit_exceeded') {
      console.error('⚠️  OpenAI rate limit hit. Using fallback.')
    } else if (error.code === 'invalid_api_key') {
      console.error('❌ Invalid OpenAI API key. Check your configuration.')
    } else if (error.code === 'context_length_exceeded') {
      console.error('⚠️  Request too large. Using fallback.')
    } else if (error.message?.includes('timeout')) {
      console.error('⏱️  Request timed out. Using fallback.')
    }

    // Return fallback value instead of failing the request
    return fallback
  }
}

/**
 * Retry logic for transient failures
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error

      // Don't retry on certain errors
      if (
        error.code === 'insufficient_quota' ||
        error.code === 'invalid_api_key' ||
        error.code === 'context_length_exceeded'
      ) {
        throw error
      }

      // If not last attempt, wait and retry
      if (attempt < maxRetries) {
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)))
      }
    }
  }

  throw lastError
}

/**
 * Timeout wrapper
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = AI_CONFIG.requestTimeout
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ])
}

/**
 * Combined error handling with retry and timeout
 */
export async function withFullProtection<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string = 'AI Operation'
): Promise<T> {
  return withAIErrorHandling(
    () => withRetry(
      () => withTimeout(operation),
      2,
      1000
    ),
    fallback,
    operationName
  )
}
