/**
 * AI Response Caching System
 * Phase 4 - Adaptive Learning System
 *
 * Simple in-memory cache to reduce OpenAI API calls and costs
 */

import { AI_CONFIG } from './config'

interface CacheEntry<T> {
  data: T
  timestamp: number
  hits: number
}

// In-memory cache storage
const cache = new Map<string, CacheEntry<any>>()

/**
 * Get cached data if available and not expired
 */
export function getCached<T>(
  key: string,
  ttlSeconds: number = AI_CONFIG.cacheDuration
): T | null {
  if (!AI_CONFIG.enableCache) {
    return null
  }

  const cached = cache.get(key)
  if (!cached) {
    return null
  }

  const age = (Date.now() - cached.timestamp) / 1000
  if (age > ttlSeconds) {
    cache.delete(key)
    return null
  }

  // Update hit count
  cached.hits++

  return cached.data as T
}

/**
 * Store data in cache
 */
export function setCache<T>(key: string, data: T): void {
  if (!AI_CONFIG.enableCache) {
    return
  }

  cache.set(key, {
    data,
    timestamp: Date.now(),
    hits: 0
  })

  // Cleanup old entries if cache gets too large
  if (cache.size > 1000) {
    cleanupCache()
  }
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(
  operation: string,
  params: Record<string, any>
): string {
  // Sort keys for consistent cache keys
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key]
      return acc
    }, {} as Record<string, any>)

  return `${operation}:${JSON.stringify(sortedParams)}`
}

/**
 * Generate normalized cache key (for similar requests)
 */
export function generateNormalizedCacheKey(
  operation: string,
  question: string,
  activityType: string
): string {
  // Normalize question by removing numbers for similar questions
  const normalizedQuestion = question
    .replace(/\d+/g, 'N') // Replace all numbers with 'N'
    .toLowerCase()
    .trim()

  return `${operation}:${activityType}:${normalizedQuestion}`
}

/**
 * Check if two strings are similar (for aggressive caching)
 */
export function areSimilar(str1: string, str2: string): boolean {
  if (!AI_CONFIG.enableAggressiveCaching) {
    return false
  }

  const normalize = (str: string) =>
    str.replace(/\d+/g, 'N').toLowerCase().trim()

  const normalized1 = normalize(str1)
  const normalized2 = normalize(str2)

  // Simple similarity check
  return normalized1 === normalized2
}

/**
 * Remove old/unused cache entries
 */
export function cleanupCache(): void {
  const now = Date.now()
  const maxAge = AI_CONFIG.cacheDuration * 1000

  let removed = 0
  for (const [key, entry] of cache.entries()) {
    const age = now - entry.timestamp
    if (age > maxAge) {
      cache.delete(key)
      removed++
    }
  }

  if (removed > 0) {
    console.log(`🧹 Cleaned up ${removed} expired cache entries`)
  }

  // If still too large, remove least-used entries
  if (cache.size > 1000) {
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].hits - b[1].hits)
      .slice(0, 200) // Remove 200 least-used entries

    entries.forEach(([key]) => cache.delete(key))
    console.log(`🧹 Removed ${entries.length} least-used cache entries`)
  }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear()
  console.log('🗑️  Cache cleared')
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  let totalHits = 0
  let oldestEntry = Date.now()
  let newestEntry = 0

  for (const entry of cache.values()) {
    totalHits += entry.hits
    oldestEntry = Math.min(oldestEntry, entry.timestamp)
    newestEntry = Math.max(newestEntry, entry.timestamp)
  }

  return {
    size: cache.size,
    totalHits,
    oldestAge: oldestEntry ? (Date.now() - oldestEntry) / 1000 : 0,
    newestAge: newestEntry ? (Date.now() - newestEntry) / 1000 : 0,
    avgHitsPerEntry: cache.size > 0 ? totalHits / cache.size : 0
  }
}

// Cleanup cache every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupCache()
  }, 10 * 60 * 1000)
}
