#!/usr/bin/env node

/**
 * Database Migration Script for Phase 5 - Teacher Dashboard System
 *
 * Creates tables for:
 * - Teacher-Student relationships
 * - Classes and class assignments
 * - Teacher alerts and notifications
 * - Activity assignments
 * - Analytics views
 *
 * Usage: npm run db:init-teacher
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function verifyTables() {
  log('\n4. Verifying tables created...', 'blue')

  const tables = [
    'classes',
    'class_students',
    'teacher_alerts',
    'activity_assignments'
  ]

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
}

async function verifyViews() {
  log('\n5. Verifying views created...', 'blue')

  const views = [
    'student_performance_summary',
    'class_performance_summary'
  ]

  for (const view of views) {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.views
        WHERE table_schema = 'public'
        AND table_name = ${view}
      );
    `

    const exists = result.rows[0].exists

    if (exists) {
      log(`   ✓ View "${view}" verified`, 'green')
    } else {
      log(`   ⚠ View "${view}" not found`, 'yellow')
    }
  }
}

async function verifyIndexes() {
  log('\n6. Verifying indexes...', 'blue')

  const indexResult = await sql`
    SELECT indexname
    FROM pg_indexes
    WHERE tablename IN (
      'students',
      'classes',
      'class_students',
      'teacher_alerts',
      'activity_assignments'
    )
    AND schemaname = 'public'
    AND indexname NOT LIKE '%_pkey'
    ORDER BY indexname
  `

  log(`   ✓ ${indexResult.rows.length} indexes created`, 'green')

  if (indexResult.rows.length > 0) {
    log('   Indexes:', 'cyan')
    indexResult.rows.forEach(row => {
      log(`     - ${row.indexname}`, 'cyan')
    })
  }
}

async function verifyTriggers() {
  log('\n7. Verifying triggers...', 'blue')

  const triggerResult = await sql`
    SELECT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE event_object_table IN ('classes', 'student_learning_profile')
    AND trigger_schema = 'public'
  `

  if (triggerResult.rows.length > 0) {
    log(`   ✓ ${triggerResult.rows.length} trigger(s) found`, 'green')
    triggerResult.rows.forEach(row => {
      log(`     - ${row.trigger_name} on ${row.event_object_table}`, 'cyan')
    })
  } else {
    log('   ℹ No triggers found', 'yellow')
  }
}

async function checkTeacherStudentRelationship() {
  log('\n8. Verifying teacher-student relationship...', 'blue')

  const columnCheck = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'students'
      AND column_name = 'teacher_id'
    );
  `

  if (columnCheck.rows[0].exists) {
    log('   ✓ teacher_id column exists in students table', 'green')
  } else {
    log('   ⚠ teacher_id column not found in students table', 'yellow')
  }
}

async function createSampleData() {
  log('\n9. Checking for sample data creation...', 'blue')

  try {
    // Check if there are any teachers
    const teacherCount = await sql`SELECT COUNT(*) FROM teachers`
    const count = parseInt(teacherCount.rows[0].count)

    if (count === 0) {
      log('   ℹ No teachers found - skipping sample data', 'cyan')
      return
    }

    log(`   ℹ Found ${count} teacher(s)`, 'cyan')

    // Check if any classes exist
    const classCount = await sql`SELECT COUNT(*) FROM classes`
    const existingClasses = parseInt(classCount.rows[0].count)

    if (existingClasses > 0) {
      log(`   ℹ ${existingClasses} classes already exist - skipping sample data`, 'cyan')
      return
    }

    log('   ℹ You can create sample classes using the app or API', 'cyan')

  } catch (error: any) {
    log(`   ⚠ Could not check sample data: ${error.message}`, 'yellow')
  }
}

async function displayStats() {
  log('\n10. Database statistics...', 'blue')

  try {
    const stats = await Promise.all([
      sql`SELECT COUNT(*) FROM teachers`,
      sql`SELECT COUNT(*) FROM students`,
      sql`SELECT COUNT(*) FROM classes`,
      sql`SELECT COUNT(*) FROM teacher_alerts`,
      sql`SELECT COUNT(*) FROM activity_assignments`
    ])

    log('   Current record counts:', 'cyan')
    log(`     - Teachers: ${stats[0].rows[0].count}`, 'cyan')
    log(`     - Students: ${stats[1].rows[0].count}`, 'cyan')
    log(`     - Classes: ${stats[2].rows[0].count}`, 'cyan')
    log(`     - Alerts: ${stats[3].rows[0].count}`, 'cyan')
    log(`     - Assignments: ${stats[4].rows[0].count}`, 'cyan')

  } catch (error: any) {
    log(`   ⚠ Could not fetch statistics: ${error.message}`, 'yellow')
  }
}

async function main() {
  log('\n╔════════════════════════════════════════╗', 'magenta')
  log('║   Phase 5: Teacher Dashboard Setup    ║', 'magenta')
  log('╚════════════════════════════════════════╝\n', 'magenta')

  try {
    // Check database connection
    log('1. Verifying database connection...', 'blue')

    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL not configured in .env.local')
    }

    log('   ✓ POSTGRES_URL environment variable found', 'green')

    // Read SQL schema file
    log('\n2. Reading SQL schema file...', 'blue')
    const schemaPath = path.join(__dirname, '..', 'lib', 'db', 'teacher-schema.sql')

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`)
    }

    const schema = fs.readFileSync(schemaPath, 'utf8')
    log('   ✓ SQL schema loaded successfully', 'green')
    log(`   📄 Schema size: ${(schema.length / 1024).toFixed(2)} KB`, 'cyan')

    // Execute schema
    log('\n3. Executing database migration...', 'blue')
    log('   Creating tables:', 'yellow')
    log('   - classes (teacher class groups)', 'yellow')
    log('   - class_students (student assignments)', 'yellow')
    log('   - teacher_alerts (notifications)', 'yellow')
    log('   - activity_assignments (homework)', 'yellow')
    log('   - Analytics views', 'yellow')

    await sql.query(schema)

    log('   ✓ Migration executed successfully', 'green')

    // Verify tables
    await verifyTables()

    // Verify views
    await verifyViews()

    // Verify indexes
    await verifyIndexes()

    // Verify triggers
    await verifyTriggers()

    // Check teacher-student relationship
    await checkTeacherStudentRelationship()

    // Sample data
    await createSampleData()

    // Display stats
    await displayStats()

    // Success summary
    log('\n╔════════════════════════════════════════╗', 'green')
    log('║     ✓ Migration Completed             ║', 'green')
    log('╚════════════════════════════════════════╝\n', 'green')

    log('Phase 5 Database Setup Complete!', 'green')
    log('\nNext steps:', 'cyan')
    log('1. Implement database query functions', 'cyan')
    log('2. Create API routes for teacher dashboard', 'cyan')
    log('3. Build UI components and pages', 'cyan')
    log('4. Test teacher analytics features\n', 'cyan')

    process.exit(0)

  } catch (error: any) {
    log('\n✗ Error during migration:', 'red')
    log(`  ${error.message}`, 'red')

    if (error.stack) {
      log('\nStack trace:', 'yellow')
      console.error(error.stack)
    }

    log('\nTroubleshooting tips:', 'cyan')
    log('- Verify POSTGRES_URL is configured in .env.local', 'cyan')
    log('- Ensure you have internet connection', 'cyan')
    log('- Check that the database is accessible', 'cyan')
    log('- Review the schema SQL for syntax errors', 'cyan')
    log('- Make sure Phase 1 database is already set up\n', 'cyan')

    process.exit(1)
  }
}

// Run migration
main()
