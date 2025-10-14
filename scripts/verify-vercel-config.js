#!/usr/bin/env node

/**
 * Script de Verificación de Configuración de Vercel
 *
 * Valida que vercel.json esté correctamente configurado
 *
 * Uso: node scripts/verify-vercel-config.js
 */

const fs = require('fs')
const path = require('path')

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkmark(passed) {
  return passed ? '✓' : '✗'
}

// Leer vercel.json
const vercelConfigPath = path.join(process.cwd(), 'vercel.json')

if (!fs.existsSync(vercelConfigPath)) {
  log('✗ vercel.json no encontrado', 'red')
  process.exit(1)
}

const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'))

log('\n╔═══════════════════════════════════════╗', 'cyan')
log('║   Verificación de Vercel Config      ║', 'cyan')
log('╚═══════════════════════════════════════╝\n', 'cyan')

let errors = 0
let warnings = 0

// 1. Verificar configuración básica
log('1. Configuración Básica', 'blue')

const hasFramework = vercelConfig.framework === 'nextjs'
log(`  ${checkmark(hasFramework)} Framework: ${vercelConfig.framework || 'no especificado'}`, hasFramework ? 'green' : 'red')
if (!hasFramework) errors++

const hasOutputDir = vercelConfig.outputDirectory === '.next'
log(`  ${checkmark(hasOutputDir)} Output Directory: ${vercelConfig.outputDirectory || 'no especificado'}`, hasOutputDir ? 'green' : 'red')
if (!hasOutputDir) errors++

// 2. Verificar funciones serverless
log('\n2. Funciones Serverless', 'blue')

const hasFunctions = vercelConfig.functions && Object.keys(vercelConfig.functions).length > 0
log(`  ${checkmark(hasFunctions)} Funciones configuradas: ${hasFunctions ? 'Sí' : 'No'}`, hasFunctions ? 'green' : 'yellow')
if (!hasFunctions) warnings++

if (hasFunctions) {
  Object.entries(vercelConfig.functions).forEach(([route, config]) => {
    const hasTimeout = config.maxDuration !== undefined
    const hasMemory = config.memory !== undefined

    log(`  ${checkmark(hasTimeout && hasMemory)} ${route}`, hasTimeout && hasMemory ? 'green' : 'yellow')
    log(`    - Timeout: ${config.maxDuration || 'no especificado'}s`, hasTimeout ? 'green' : 'yellow')
    log(`    - Memory: ${config.memory || 'no especificado'}MB`, hasMemory ? 'green' : 'yellow')

    if (config.maxDuration > 60) {
      log('    ⚠ Timeout > 60s requiere plan Pro o Enterprise', 'yellow')
      warnings++
    }
  })
}

// 3. Verificar headers
log('\n3. Headers', 'blue')

const hasHeaders = vercelConfig.headers && vercelConfig.headers.length > 0
log(`  ${checkmark(hasHeaders)} Headers configurados: ${hasHeaders ? 'Sí' : 'No'}`, hasHeaders ? 'green' : 'yellow')
if (!hasHeaders) warnings++

// Verificar headers específicos importantes
const headerTypes = {
  api: false,
  models: false,
  security: false,
  glb: false
}

if (hasHeaders) {
  vercelConfig.headers.forEach(headerConfig => {
    if (headerConfig.source.includes('/api/')) headerTypes.api = true
    if (headerConfig.source.includes('/models')) headerTypes.models = true
    if (headerConfig.source.includes('.glb') || headerConfig.source.includes('.gltf')) headerTypes.glb = true

    const securityHeaders = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection']
    const hasSecurityHeader = headerConfig.headers?.some(h =>
      securityHeaders.includes(h.key)
    )
    if (hasSecurityHeader) headerTypes.security = true
  })

  log(`  ${checkmark(headerTypes.api)} Headers de API/CORS`, headerTypes.api ? 'green' : 'yellow')
  log(`  ${checkmark(headerTypes.models)} Headers de cache para modelos`, headerTypes.models ? 'green' : 'yellow')
  log(`  ${checkmark(headerTypes.glb)} Headers para archivos GLB/GLTF`, headerTypes.glb ? 'green' : 'yellow')
  log(`  ${checkmark(headerTypes.security)} Headers de seguridad`, headerTypes.security ? 'green' : 'yellow')

  if (!headerTypes.security) warnings++
}

// 4. Verificar GitHub integration
log('\n4. Integración con GitHub', 'blue')

const hasGithub = vercelConfig.github !== undefined
log(`  ${checkmark(hasGithub)} GitHub configurado: ${hasGithub ? 'Sí' : 'No'}`, hasGithub ? 'green' : 'yellow')

if (hasGithub) {
  const githubConfig = vercelConfig.github
  log(`  ${checkmark(githubConfig.enabled)} Enabled: ${githubConfig.enabled}`, 'green')
  log(`  ${checkmark(githubConfig.autoAlias)} Auto Alias: ${githubConfig.autoAlias}`, 'green')
  log(`  ${checkmark(githubConfig.autoJobCancelation)} Auto Job Cancelation: ${githubConfig.autoJobCancelation}`, 'green')
} else {
  warnings++
}

// 5. Verificar regiones
log('\n5. Regiones', 'blue')

const hasRegions = vercelConfig.regions && vercelConfig.regions.length > 0
log(`  ${checkmark(hasRegions)} Regiones configuradas: ${hasRegions ? vercelConfig.regions.join(', ') : 'No'}`, hasRegions ? 'green' : 'yellow')

if (hasRegions) {
  const region = vercelConfig.regions[0]
  const regionInfo = {
    'iad1': 'Washington D.C., USA (Óptimo para República Dominicana)',
    'sfo1': 'San Francisco, USA',
    'gru1': 'São Paulo, Brasil (Bueno para Latinoamérica)',
    'fra1': 'Frankfurt, Alemania',
    'hnd1': 'Tokio, Japón',
    'syd1': 'Sídney, Australia'
  }

  log(`  ℹ ${regionInfo[region] || region}`, 'cyan')
}

// 6. Verificar variables de entorno
log('\n6. Variables de Entorno', 'blue')

const envPath = path.join(process.cwd(), '.env.example')
const hasEnvExample = fs.existsSync(envPath)
log(`  ${checkmark(hasEnvExample)} .env.example existe: ${hasEnvExample ? 'Sí' : 'No'}`, hasEnvExample ? 'green' : 'yellow')

if (hasEnvExample) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  const requiredVars = [
    'POSTGRES_URL',
    'OPENAI_API_KEY',
    'AZURE_SPEECH_KEY',
    'NEXTAUTH_SECRET'
  ]

  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName)
    log(`  ${checkmark(hasVar)} ${varName}`, hasVar ? 'green' : 'yellow')
    if (!hasVar) warnings++
  })
}

// 7. Verificar archivos de API
log('\n7. API Routes', 'blue')

const apiPath = path.join(process.cwd(), 'app', 'api')
const hasApiDir = fs.existsSync(apiPath)
log(`  ${checkmark(hasApiDir)} Directorio app/api existe: ${hasApiDir ? 'Sí' : 'No'}`, hasApiDir ? 'green' : 'yellow')

if (hasApiDir) {
  const healthCheckPath = path.join(apiPath, 'health', 'route.ts')
  const hasHealthCheck = fs.existsSync(healthCheckPath)
  log(`  ${checkmark(hasHealthCheck)} Health check configurado: ${hasHealthCheck ? 'Sí' : 'No'}`, hasHealthCheck ? 'green' : 'yellow')

  const aiPath = path.join(apiPath, 'ai')
  const hasAiRoutes = fs.existsSync(aiPath)
  log(`  ${checkmark(hasAiRoutes)} Rutas de IA configuradas: ${hasAiRoutes ? 'Sí' : 'No'}`, hasAiRoutes ? 'green' : 'yellow')
}

// 8. Verificar public/models
log('\n8. Modelos 3D', 'blue')

const modelsPath = path.join(process.cwd(), 'public', 'models')
const hasModelsDir = fs.existsSync(modelsPath)
log(`  ${checkmark(hasModelsDir)} Directorio public/models existe: ${hasModelsDir ? 'Sí' : 'No'}`, hasModelsDir ? 'green' : 'yellow')

// Resumen
log('\n╔═══════════════════════════════════════╗', 'cyan')
log('║           Resumen                     ║', 'cyan')
log('╚═══════════════════════════════════════╝\n', 'cyan')

if (errors === 0 && warnings === 0) {
  log('✓ Configuración perfecta! No se encontraron problemas.', 'green')
} else {
  if (errors > 0) {
    log(`✗ ${errors} error(es) encontrado(s)`, 'red')
  }
  if (warnings > 0) {
    log(`⚠ ${warnings} advertencia(s)`, 'yellow')
  }
}

log('\nRecomendaciones:', 'cyan')
log('- Asegúrate de configurar las variables de entorno en el dashboard de Vercel')
log('- Verifica que tu plan de Vercel soporte los timeouts configurados')
log('- Prueba los endpoints localmente antes de desplegar')

log('\nPróximos pasos:', 'cyan')
log('1. npm run dev - Probar localmente')
log('2. Configurar variables de entorno en Vercel')
log('3. Conectar repositorio de GitHub')
log('4. vercel --prod - Desplegar a producción')

process.exit(errors > 0 ? 1 : 0)
