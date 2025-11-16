/**
 * Teacher Voice - Health Check Endpoint
 * GET /api/teacher-voice/health
 *
 * Checks the status of TTS, STT, and lip-sync services
 */

import { NextResponse } from 'next/server'
import { testRhubarbInstallation } from '@/lib/speech/lip-sync'
import { getCacheStatistics } from '@/lib/db/teacher-voice-queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const checks = {
      openai: false,
      rhubarb: false,
      database: false,
    }

    // 1. Check OpenAI API key
    checks.openai = !!process.env.OPENAI_API_KEY

    // 2. Check Rhubarb installation
    checks.rhubarb = await testRhubarbInstallation()

    // 3. Check database connection
    try {
      const stats = await getCacheStatistics()
      checks.database = true
    } catch (error) {
      checks.database = false
    }

    // Determine overall status
    const allHealthy = checks.openai && checks.rhubarb && checks.database
    const status = allHealthy ? 'ok' : 'degraded'

    // Get cache statistics
    let cacheStats = {
      entries: 0,
      hitRate: '0%',
    }

    if (checks.database) {
      try {
        const stats = await getCacheStatistics()
        cacheStats = {
          entries: stats.totalEntries,
          hitRate: `${Math.round(stats.hitRate * 100)}%`,
        }
      } catch (error) {
        // Ignore cache stats errors
      }
    }

    return NextResponse.json({
      status: status,
      services: checks,
      cache: cacheStats,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        services: {
          openai: false,
          rhubarb: false,
          database: false,
        },
        error: error.message,
      },
      { status: 500 }
    )
  }
}
