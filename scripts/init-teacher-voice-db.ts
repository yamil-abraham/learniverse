/**
 * Initialize Teacher Voice Database Tables
 * Creates tables for voice interactions, caching, and class settings
 */

import { sql } from '@vercel/postgres'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function initTeacherVoiceDatabase() {
  try {
    console.log('╔════════════════════════════════════════════════╗')
    console.log('║   Teacher Voice Database Initialization       ║')
    console.log('╚════════════════════════════════════════════════╝\n')

    console.log('🗄️  Creating teacher voice database tables...\n')

    // Table 1: Teacher Voice Interactions
    console.log('📝 Creating table: teacher_voice_interactions...')
    await sql`
      CREATE TABLE IF NOT EXISTS teacher_voice_interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
        session_id VARCHAR(100),

        interaction_type VARCHAR(50) NOT NULL,
        student_input_text TEXT,
        student_input_audio_duration DECIMAL(5,2),
        teacher_response_text TEXT NOT NULL,
        teacher_audio_duration DECIMAL(5,2),

        voice_used VARCHAR(20) DEFAULT 'nova',
        tts_model VARCHAR(20) DEFAULT 'tts-1',
        language VARCHAR(5) DEFAULT 'es',

        tts_cached BOOLEAN DEFAULT false,
        lipsync_generated BOOLEAN DEFAULT true,
        response_time_ms INTEGER,

        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✅ Table created: teacher_voice_interactions\n')

    // Indexes for interactions table
    console.log('🔍 Creating indexes for teacher_voice_interactions...')
    await sql`
      CREATE INDEX IF NOT EXISTS idx_student_interactions
      ON teacher_voice_interactions(student_id, created_at DESC)
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_session_interactions
      ON teacher_voice_interactions(session_id, created_at)
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_activity_interactions
      ON teacher_voice_interactions(activity_id)
    `
    console.log('✅ Indexes created for teacher_voice_interactions\n')

    // Table 2: Teacher Voice Cache
    console.log('💾 Creating table: teacher_voice_cache...')
    await sql`
      CREATE TABLE IF NOT EXISTS teacher_voice_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        text_hash VARCHAR(64) UNIQUE NOT NULL,
        text_content TEXT NOT NULL,
        text_normalized TEXT NOT NULL,

        voice VARCHAR(20) NOT NULL,
        tts_model VARCHAR(20) NOT NULL,
        language VARCHAR(5) DEFAULT 'es',

        audio_base64 TEXT NOT NULL,
        audio_duration_seconds DECIMAL(5,2),
        lipsync_json JSONB NOT NULL,

        times_used INTEGER DEFAULT 1,
        last_used_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
      )
    `
    console.log('✅ Table created: teacher_voice_cache\n')

    // Indexes for cache table
    console.log('🔍 Creating indexes for teacher_voice_cache...')
    await sql`
      CREATE INDEX IF NOT EXISTS idx_text_hash
      ON teacher_voice_cache(text_hash)
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_last_used
      ON teacher_voice_cache(last_used_at DESC)
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_expires
      ON teacher_voice_cache(expires_at)
    `
    console.log('✅ Indexes created for teacher_voice_cache\n')

    // Table 3: Class Voice Settings
    console.log('⚙️  Creating table: class_voice_settings...')
    await sql`
      CREATE TABLE IF NOT EXISTS class_voice_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,

        default_voice VARCHAR(20) DEFAULT 'nova',
        default_teacher_model VARCHAR(50) DEFAULT 'teacher1',
        language_formality VARCHAR(20) DEFAULT 'mixed',

        voice_input_enabled BOOLEAN DEFAULT true,
        whiteboard_enabled BOOLEAN DEFAULT true,
        animations_enabled BOOLEAN DEFAULT true,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),

        UNIQUE(class_id)
      )
    `
    console.log('✅ Table created: class_voice_settings\n')

    // Indexes for settings table
    console.log('🔍 Creating indexes for class_voice_settings...')
    await sql`
      CREATE INDEX IF NOT EXISTS idx_teacher_settings
      ON class_voice_settings(teacher_id)
    `
    console.log('✅ Indexes created for class_voice_settings\n')

    // Verify table creation
    console.log('🔍 Verifying table creation...')
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('teacher_voice_interactions', 'teacher_voice_cache', 'class_voice_settings')
      ORDER BY table_name
    `

    console.log(`✅ Verified ${tables.rows.length}/3 tables created:\n`)
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`)
    })

    console.log('\n╔════════════════════════════════════════════════╗')
    console.log('║   ✅ Database Initialization Complete!         ║')
    console.log('╚════════════════════════════════════════════════╝')
    console.log('\n📊 Summary:')
    console.log('   - 3 tables created')
    console.log('   - 8 indexes created')
    console.log('   - Ready for teacher voice features\n')
    console.log('🎯 Next Steps:')
    console.log('   1. Place 3D models in public/models/teachers/')
    console.log('   2. Download Rhubarb lip-sync executable')
    console.log('   3. Start Phase 1 implementation\n')

  } catch (error: any) {
    console.error('\n❌ Error initializing teacher voice database:\n')
    console.error(error.message)
    console.error('\n📝 Details:')
    console.error(error)
    console.error('\n💡 Troubleshooting:')
    console.error('   - Verify POSTGRES_URL is correct in .env.local')
    console.error('   - Ensure database connection is active')
    console.error('   - Check that referenced tables exist (students, classes, etc.)')
    console.error('   - Run prerequisite migrations first (db:init-activities, db:init-ai, db:init-teacher)\n')
    process.exit(1)
  }
}

// Run the initialization
console.log('Starting teacher voice database initialization...\n')
initTeacherVoiceDatabase()
