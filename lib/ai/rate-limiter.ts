/**
 * AI Rate Limiting System
 * Phase 4 - Adaptive Learning System
 *
 * Prevents abuse of OpenAI API and manages costs
 */

import { AI_CONFIG } from './config'

// Store request timestamps
const requestTimestamps: number[] = []
const hourlyTimestamps: number[] = []

/**
 * Check if request is within rate limits
 */
export function checkRateLimit(
  maxPerMinute: number = AI_CONFIG.maxRequestsPerMinute
): boolean {
  const now = Date.now()
  const oneMinuteAgo = now - 60000

  // Remove timestamps older than 1 minute
  while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
    requestTimestamps.shift()
  }

  // Check if limit exceeded
  if (requestTimestamps.length >= maxPerMinute) {
    console.warn(`⚠️  Rate limit exceeded: ${requestTimestamps.length}/${maxPerMinute} requests per minute`)
    return false
  }

  // Add current timestamp
  requestTimestamps.push(now)
  return true
}

/**
 * Check hourly rate limit
 */
export function checkHourlyRateLimit(
  maxPerHour: number = AI_CONFIG.maxRequestsPerHour
): boolean {
  const now = Date.now()
  const oneHourAgo = now - 3600000

  // Remove timestamps older than 1 hour
  while (hourlyTimestamps.length > 0 && hourlyTimestamps[0] < oneHourAgo) {
    hourlyTimestamps.shift()
  }

  // Check if limit exceeded
  if (hourlyTimestamps.length >= maxPerHour) {
    console.warn(`⚠️  Hourly rate limit exceeded: ${hourlyTimestamps.length}/${maxPerHour} requests per hour`)
    return false
  }

  // Add current timestamp
  hourlyTimestamps.push(now)
  return true
}

/**
 * Check both minute and hourly rate limits
 */
export function checkAllRateLimits(): boolean {
  const minuteOk = checkRateLimit()
  const hourlyOk = checkHourlyRateLimit()

  return minuteOk && hourlyOk
}

/**
 * Get current rate limit stats
 */
export function getRateLimitStats() {
  const now = Date.now()
  const oneMinuteAgo = now - 60000
  const oneHourAgo = now - 3600000

  const recentMinute = requestTimestamps.filter(ts => ts > oneMinuteAgo).length
  const recentHour = hourlyTimestamps.filter(ts => ts > oneHourAgo).length

  return {
    requestsThisMinute: recentMinute,
    requestsThisHour: recentHour,
    minuteLimit: AI_CONFIG.maxRequestsPerMinute,
    hourlyLimit: AI_CONFIG.maxRequestsPerHour,
    minuteRemaining: Math.max(0, AI_CONFIG.maxRequestsPerMinute - recentMinute),
    hourlyRemaining: Math.max(0, AI_CONFIG.maxRequestsPerHour - recentHour)
  }
}

/**
 * Reset rate limit counters
 */
export function resetRateLimits(): void {
  requestTimestamps.length = 0
  hourlyTimestamps.length = 0
  console.log('🔄 Rate limits reset')
}

/**
 * Wait until rate limit allows another request
 */
export async function waitForRateLimit(): Promise<void> {
  const maxWaitTime = 60000 // 1 minute max wait
  const checkInterval = 1000 // Check every second
  const startTime = Date.now()

  while (!checkAllRateLimits()) {
    if (Date.now() - startTime > maxWaitTime) {
      throw new Error('Rate limit wait timeout')
    }

    await new Promise(resolve => setTimeout(resolve, checkInterval))
  }
}

/**
 * Execute function with rate limiting
 */
export async function withRateLimit<T>(
  operation: () => Promise<T>,
  waitIfLimited: boolean = false
): Promise<T> {
  if (!checkAllRateLimits()) {
    if (waitIfLimited) {
      console.log('⏳ Rate limit reached, waiting...')
      await waitForRateLimit()
    } else {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
  }

  return operation()
}
