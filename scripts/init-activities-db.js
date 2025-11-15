#!/usr/bin/env node

/**
 * Database Migration Script for Phase 3 - Activities System
 *
 * Creates tables for:
 * - activities (math questions)
 * - student_attempts (tracking answers)
 * - student_badges (achievements)
 *
 * Usage: node scripts/init-activities-db.js
 */

const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Import database client
const { sql } = require('@vercel/postgres')

// Colors for terminal output
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

async function main() {
  log('\n╔═══════════════════════════════════════╗', 'cyan')
  log('║   Phase 3: Activities DB Migration   ║', 'cyan')
  log('╚═══════════════════════════════════════╝\n', 'cyan')

  try {
    // Check database connection
    log('1. Verificando conexión a base de datos...', 'blue')

    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL no está configurado en .env.local')
    }

    log('   ✓ Variable de entorno POSTGRES_URL encontrada', 'green')

    // Read SQL schema file
    log('\n2. Leyendo archivo de esquema SQL...', 'blue')
    const schemaPath = path.join(__dirname, '..', 'lib', 'db', 'activities-schema.sql')

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Archivo de esquema no encontrado: ${schemaPath}`)
    }

    const schema = fs.readFileSync(schemaPath, 'utf8')
    log('   ✓ Esquema SQL cargado correctamente', 'green')

    // Execute schema
    log('\n3. Ejecutando migración de base de datos...', 'blue')
    log('   Creando tablas:', 'yellow')
    log('   - activities', 'yellow')
    log('   - student_attempts', 'yellow')
    log('   - student_badges', 'yellow')

    await sql.query(schema)

    log('   ✓ Tablas creadas exitosamente', 'green')

    // Verify tables were created
    log('\n4. Verificando tablas creadas...', 'blue')

    const tables = ['activities', 'student_attempts', 'student_badges']

    for (const table of tables) {
      const result = await sql.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        );
      `, [table])

      const exists = result.rows[0].exists

      if (exists) {
        log(`   ✓ Tabla "${table}" verificada`, 'green')
      } else {
        throw new Error(`Tabla "${table}" no fue creada correctamente`)
      }
    }

    // Check indexes
    log('\n5. Verificando índices...', 'blue')

    const indexResult = await sql.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename IN ('activities', 'student_attempts', 'student_badges')
      AND schemaname = 'public'
    `)

    log(`   ✓ ${indexResult.rows.length} índices creados`, 'green')
    indexResult.rows.forEach(row => {
      log(`     - ${row.indexname}`, 'cyan')
    })

    // Success summary
    log('\n╔═══════════════════════════════════════╗', 'green')
    log('║     ✓ Migración Completada           ║', 'green')
    log('╚═══════════════════════════════════════╝\n', 'green')

    log('Próximos pasos:', 'cyan')
    log('1. Ejecutar seed script: npm run db:seed-activities')
    log('2. Verificar tablas en tu dashboard de base de datos')
    log('3. Comenzar a implementar las API routes\n')

    process.exit(0)

  } catch (error) {
    log('\n✗ Error durante la migración:', 'red')
    log(`  ${error.message}`, 'red')

    if (error.stack) {
      log('\nStack trace:', 'yellow')
      console.error(error.stack)
    }

    log('\nConsejos de solución:', 'cyan')
    log('- Verifica que POSTGRES_URL esté configurado en .env.local')
    log('- Asegúrate de tener conexión a internet')
    log('- Verifica que la base de datos esté accesible')
    log('- Revisa que el esquema SQL no tenga errores de sintaxis\n')

    process.exit(1)
  }
}

// Run migration
main()
