import { NextResponse } from 'next/server'

/**
 * Health Check Endpoint
 * Verifica que la aplicación esté funcionando correctamente
 *
 * Accesible vía: GET /health o GET /api/health
 */
export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'not_configured', // Se actualizará cuando configures la BD
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      azureSpeech: process.env.AZURE_SPEECH_KEY ? 'configured' : 'not_configured',
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    }
  }

  return NextResponse.json(healthCheck, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  })
}

// Permitir OPTIONS para CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}
