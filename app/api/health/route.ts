/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Monitors system health including database and external service connectivity
 */

import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {
      database: 'unknown',
      openai: 'unknown'
    },
    responseTime: 0
  }

  // Check database connection
  try {
    await sql`SELECT 1 as health_check`
    health.services.database = 'connected'
  } catch (error) {
    health.services.database = 'disconnected'
    health.status = 'unhealthy'
    console.error('Database health check failed:', error)
  }

  // Check OpenAI API key configuration
  if (process.env.OPENAI_API_KEY) {
    health.services.openai = 'configured'
  } else {
    health.services.openai = 'not-configured'
    health.status = 'degraded'
  }

  health.responseTime = Date.now() - startTime

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
