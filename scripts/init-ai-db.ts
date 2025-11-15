#!/usr/bin/env node

/**
 * Database Migration Script for Phase 4 - AI Adaptive Learning System
 *
 * Creates tables for:
 * - student_learning_profile (performance tracking)
 * - ai_feedback_history (AI-generated feedback)
 * - adaptive_recommendations (AI suggestions)
 *
 * Usage: npm run db:init-ai
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { sql } from '@vercel/postgres'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function initializeLearningProfiles() {
  // Initialize learning profiles for existing students
  log('\n5. Initializing learning profiles for existing students...', 'blue')

  try {
    const result = await sql`
      INSERT INTO student_learning_profile (student_id)
      SELECT id FROM students
      WHERE id NOT IN (SELECT student_id FROM student_learning_profile)
      ON CONFLICT (student_id) DO NOTHING
    `

    const count = result.rowCount || 0
    if (count > 0) {
      log(`   ✓ Initialized ${count} learning profile(s)`, 'green')
    } else {
      log(`   ℹ No new profiles needed (already initialized)`, 'cyan')
    }
  } catch (error: any) {
    log(`   ⚠ Could not initialize profiles: ${error.message}`, 'yellow')
    log('   This is okay if no students exist yet', 'yellow')
  }
}

async function main() {
  log('\n╔═══════════════════════════════════════╗', 'cyan')
  log('║   Phase 4: AI System DB Migration    ║', 'cyan')
  log('╚═══════════════════════════════════════╝\n', 'cyan')

  try {
    // Check database connection
    log('1. Verifying database connection...', 'blue')

    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL not configured in .env.local')
    }

    log('   ✓ POSTGRES_URL environment variable found', 'green')

    // Read SQL schema file
    log('\n2. Reading SQL schema file...', 'blue')
    const schemaPath = path.join(__dirname, '..', 'lib', 'db', 'ai-schema.sql')

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`)
    }

    const schema = fs.readFileSync(schemaPath, 'utf8')
    log('   ✓ SQL schema loaded successfully', 'green')

    // Execute schema
    log('\n3. Executing database migration...', 'blue')
    log('   Creating tables:', 'yellow')
    log('   - student_learning_profile', 'yellow')
    log('   - ai_feedback_history', 'yellow')
    log('   - adaptive_recommendations', 'yellow')

    await sql.query(schema)

    log('   ✓ Tables created successfully', 'green')

    // Verify tables were created
    log('\n4. Verifying tables created...', 'blue')

    const tables = ['student_learning_profile', 'ai_feedback_history', 'adaptive_recommendations']

    for (const table of tables) {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${table}
        );
      `

      const exists = result.rows[0].exists

      if (exists) {
        log(`   ✓ Table "${table}" verified`, 'green')
      } else {
        throw new Error(`Table "${table}" was not created correctly`)
      }
    }

    // Initialize learning profiles for existing students
    await initializeLearningProfiles()

    // Check indexes
    log('\n6. Verifying indexes...', 'blue')

    const indexResult = await sql`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename IN ('student_learning_profile', 'ai_feedback_history', 'adaptive_recommendations')
      AND schemaname = 'public'
    `

    log(`   ✓ ${indexResult.rows.length} indexes created`, 'green')
    indexResult.rows.forEach(row => {
      log(`     - ${row.indexname}`, 'cyan')
    })

    // Check trigger
    log('\n7. Verifying triggers...', 'blue')

    const triggerResult = await sql`
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE event_object_table = 'student_learning_profile'
      AND trigger_schema = 'public'
    `

    if (triggerResult.rows.length > 0) {
      log(`   ✓ ${triggerResult.rows.length} trigger(s) created`, 'green')
      triggerResult.rows.forEach(row => {
        log(`     - ${row.trigger_name}`, 'cyan')
      })
    }

    // Success summary
    log('\n╔═══════════════════════════════════════╗', 'green')
    log('║     ✓ Migration Completed            ║', 'green')
    log('╚═══════════════════════════════════════╝\n', 'green')

    log('Next steps:', 'cyan')
    log('1. Set up OpenAI API key in .env.local')
    log('2. Implement AI service functions')
    log('3. Test adaptive learning system\n')

    process.exit(0)

  } catch (error: any) {
    log('\n✗ Error during migration:', 'red')
    log(`  ${error.message}`, 'red')

    if (error.stack) {
      log('\nStack trace:', 'yellow')
      console.error(error.stack)
    }

    log('\nTroubleshooting tips:', 'cyan')
    log('- Verify POSTGRES_URL is configured in .env.local')
    log('- Ensure you have internet connection')
    log('- Check that the database is accessible')
    log('- Review the schema SQL for syntax errors\n')

    process.exit(1)
  }
}

// Run migration
main()
