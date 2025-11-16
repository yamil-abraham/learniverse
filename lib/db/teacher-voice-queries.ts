// @ts-nocheck - Complex SQL query building with Vercel Postgres
/**
 * Teacher Voice Database Queries
 * Handles voice interactions, caching, and settings
 */

import { sql } from '@vercel/postgres'
import type { LipsyncData } from '@/lib/speech/lip-sync'

/**
 * Voice interaction record
 */
export interface VoiceInteraction {
  id: string
  studentId: string
  activityId: string | null
  sessionId: string | null
  interactionType: 'question' | 'hint' | 'explanation' | 'encouragement' | 'introduction'
  studentInputText: string | null
  studentInputAudioDuration: number | null
  teacherResponseText: string
  teacherAudioDuration: number | null
  voiceUsed: string
  ttsModel: string
  language: string
  ttsCached: boolean
  lipsyncGenerated: boolean
  responseTimeMs: number | null
  createdAt: Date
}

/**
 * Voice cache record
 */
export interface VoiceCache {
  id: string
  textHash: string
  textContent: string
  textNormalized: string
  voice: string
  ttsModel: string
  language: string
  audioBase64: string
  audioDurationSeconds: number | null
  lipsyncJson: LipsyncData
  timesUsed: number
  lastUsedAt: Date
  createdAt: Date
  expiresAt: Date | null
}

/**
 * Class voice settings
 */
export interface ClassVoiceSettings {
  id: string
  classId: string
  teacherId: string
  defaultVoice: string
  defaultTeacherModel: string
  languageFormality: 'formal' | 'casual' | 'mixed'
  voiceInputEnabled: boolean
  whiteboardEnabled: boolean
  animationsEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================
// VOICE CACHE OPERATIONS
// ============================================

/**
 * Get cached voice response by text hash
 */
export async function getCachedVoiceResponse(
  textHash: string
): Promise<VoiceCache | null> {
  try {
    const result = await sql<VoiceCache>`
      SELECT *
      FROM teacher_voice_cache
      WHERE text_hash = ${textHash}
      AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return null
    }

    // Update last used timestamp and increment usage counter
    await sql`
      UPDATE teacher_voice_cache
      SET last_used_at = NOW(), times_used = times_used + 1
      WHERE text_hash = ${textHash}
    `

    return result.rows[0]
  } catch (error) {
    console.error('Error getting cached voice response:', error)
    return null
  }
}

/**
 * Save voice response to cache
 */
export async function cacheVoiceResponse(params: {
  textHash: string
  textContent: string
  textNormalized: string
  voice: string
  ttsModel: string
  language: string
  audioBase64: string
  audioDurationSeconds: number
  lipsyncJson: LipsyncData
}): Promise<void> {
  try {
    await sql`
      INSERT INTO teacher_voice_cache (
        text_hash,
        text_content,
        text_normalized,
        voice,
        tts_model,
        language,
        audio_base64,
        audio_duration_seconds,
        lipsync_json
      )
      VALUES (
        ${params.textHash},
        ${params.textContent},
        ${params.textNormalized},
        ${params.voice},
        ${params.ttsModel},
        ${params.language},
        ${params.audioBase64},
        ${params.audioDurationSeconds},
        ${JSON.stringify(params.lipsyncJson)}
      )
      ON CONFLICT (text_hash) DO UPDATE SET
        last_used_at = NOW(),
        times_used = teacher_voice_cache.times_used + 1
    `

    console.log(`💾 Voice response cached: ${params.textHash}`)
  } catch (error) {
    console.error('Error caching voice response:', error)
    throw error
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStatistics(): Promise<{
  totalEntries: number
  totalSize: number
  hitRate: number
  topCachedPhrases: Array<{
    text: string
    timesUsed: number
  }>
}> {
  try {
    const stats = await sql`
      SELECT
        COUNT(*) as total_entries,
        SUM(LENGTH(audio_base64)) as total_size,
        AVG(times_used) as avg_uses
      FROM teacher_voice_cache
    `

    const topPhrases = await sql`
      SELECT text_content, times_used
      FROM teacher_voice_cache
      ORDER BY times_used DESC
      LIMIT 10
    `

    return {
      totalEntries: parseInt(stats.rows[0].total_entries || '0'),
      totalSize: parseInt(stats.rows[0].total_size || '0'),
      hitRate: parseFloat(stats.rows[0].avg_uses || '1'),
      topCachedPhrases: topPhrases.rows.map(row => ({
        text: row.text_content,
        timesUsed: row.times_used,
      })),
    }
  } catch (error) {
    console.error('Error getting cache statistics:', error)
    return {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      topCachedPhrases: [],
    }
  }
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM teacher_voice_cache
      WHERE expires_at IS NOT NULL AND expires_at < NOW()
    `

    const deletedCount = result.rowCount || 0
    console.log(`🧹 Cleaned up ${deletedCount} expired cache entries`)
    return deletedCount
  } catch (error) {
    console.error('Error cleaning up expired cache:', error)
    return 0
  }
}

// ============================================
// VOICE INTERACTION TRACKING
// ============================================

/**
 * Save voice interaction
 */
export async function saveVoiceInteraction(params: {
  studentId: string
  activityId?: string | null
  sessionId?: string | null
  interactionType: VoiceInteraction['interactionType']
  studentInputText?: string | null
  studentInputAudioDuration?: number | null
  teacherResponseText: string
  teacherAudioDuration?: number | null
  voiceUsed: string
  ttsModel: string
  language: string
  ttsCached: boolean
  lipsyncGenerated: boolean
  responseTimeMs?: number | null
}): Promise<string> {
  try {
    const result = await sql`
      INSERT INTO teacher_voice_interactions (
        student_id,
        activity_id,
        session_id,
        interaction_type,
        student_input_text,
        student_input_audio_duration,
        teacher_response_text,
        teacher_audio_duration,
        voice_used,
        tts_model,
        language,
        tts_cached,
        lipsync_generated,
        response_time_ms
      )
      VALUES (
        ${params.studentId},
        ${params.activityId || null},
        ${params.sessionId || null},
        ${params.interactionType},
        ${params.studentInputText || null},
        ${params.studentInputAudioDuration || null},
        ${params.teacherResponseText},
        ${params.teacherAudioDuration || null},
        ${params.voiceUsed},
        ${params.ttsModel},
        ${params.language},
        ${params.ttsCached},
        ${params.lipsyncGenerated},
        ${params.responseTimeMs || null}
      )
      RETURNING id
    `

    const interactionId = result.rows[0].id
    console.log(`📝 Voice interaction saved: ${interactionId}`)
    return interactionId
  } catch (error) {
    console.error('Error saving voice interaction:', error)
    throw error
  }
}

/**
 * Get voice interactions for a student
 */
export async function getStudentVoiceInteractions(
  studentId: string,
  limit: number = 50
): Promise<VoiceInteraction[]> {
  try {
    const result = await sql<VoiceInteraction>`
      SELECT *
      FROM teacher_voice_interactions
      WHERE student_id = ${studentId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return result.rows
  } catch (error) {
    console.error('Error getting student voice interactions:', error)
    return []
  }
}

/**
 * Get voice interaction analytics for teacher dashboard
 */
export async function getVoiceAnalytics(params: {
  teacherId?: string
  classId?: string
  studentId?: string
  startDate?: Date
  endDate?: Date
}): Promise<{
  totalInteractions: number
  totalAudioDuration: number
  avgResponseTime: number
  cacheHitRate: number
  interactionsByType: Record<string, number>
  topStudents: Array<{
    studentId: string
    studentName: string
    interactions: number
  }>
}> {
  try {
    let query = sql`
      SELECT
        COUNT(*) as total_interactions,
        SUM(teacher_audio_duration) as total_audio_duration,
        AVG(response_time_ms) as avg_response_time,
        AVG(CASE WHEN tts_cached THEN 1.0 ELSE 0.0 END) as cache_hit_rate,
        interaction_type,
        COUNT(*) as type_count
      FROM teacher_voice_interactions
      WHERE 1=1
    `

    // @ts-ignore - Dynamic SQL query building
    if (params.studentId) {
      query = sql`${query} AND student_id = ${params.studentId}`
    }
    // @ts-ignore - Dynamic SQL query building

    if (params.startDate) {
      query = sql`${query} AND created_at >= ${params.startDate.toISOString()}`
    // @ts-ignore - Dynamic SQL query building
    }

    if (params.endDate) {
    // @ts-ignore - Dynamic SQL query building
      query = sql`${query} AND created_at <= ${params.endDate.toISOString()}`
    }

    query = sql`${query} GROUP BY interaction_type`

    const result = await query

    const interactionsByType: Record<string, number> = {}
    let totalInteractions = 0

    result.rows.forEach(row => {
      interactionsByType[row.interaction_type] = row.type_count
      totalInteractions += row.type_count
    })

    return {
      totalInteractions: totalInteractions,
      totalAudioDuration: parseFloat(result.rows[0]?.total_audio_duration || '0'),
      avgResponseTime: parseFloat(result.rows[0]?.avg_response_time || '0'),
      cacheHitRate: parseFloat(result.rows[0]?.cache_hit_rate || '0') * 100,
      interactionsByType: interactionsByType,
      topStudents: [], // TODO: Implement if needed
    }
  } catch (error) {
    console.error('Error getting voice analytics:', error)
    return {
      totalInteractions: 0,
      totalAudioDuration: 0,
      avgResponseTime: 0,
      cacheHitRate: 0,
      interactionsByType: {},
      topStudents: [],
    }
  }
}

// ============================================
// CLASS VOICE SETTINGS
// ============================================

/**
 * Get class voice settings
 */
export async function getClassVoiceSettings(
  classId: string
): Promise<ClassVoiceSettings | null> {
  try {
    const result = await sql<ClassVoiceSettings>`
      SELECT *
      FROM class_voice_settings
      WHERE class_id = ${classId}
      LIMIT 1
    `

    return result.rows[0] || null
  } catch (error) {
    console.error('Error getting class voice settings:', error)
    return null
  }
}

/**
 * Create or update class voice settings
 */
export async function upsertClassVoiceSettings(params: {
  classId: string
  teacherId: string
  defaultVoice?: string
  defaultTeacherModel?: string
  languageFormality?: 'formal' | 'casual' | 'mixed'
  voiceInputEnabled?: boolean
  whiteboardEnabled?: boolean
  animationsEnabled?: boolean
}): Promise<ClassVoiceSettings> {
  try {
    const result = await sql<ClassVoiceSettings>`
      INSERT INTO class_voice_settings (
        class_id,
        teacher_id,
        default_voice,
        default_teacher_model,
        language_formality,
        voice_input_enabled,
        whiteboard_enabled,
        animations_enabled
      )
      VALUES (
        ${params.classId},
        ${params.teacherId},
        ${params.defaultVoice || 'nova'},
        ${params.defaultTeacherModel || 'teacher1'},
        ${params.languageFormality || 'mixed'},
        ${params.voiceInputEnabled !== undefined ? params.voiceInputEnabled : true},
        ${params.whiteboardEnabled !== undefined ? params.whiteboardEnabled : true},
        ${params.animationsEnabled !== undefined ? params.animationsEnabled : true}
      )
      ON CONFLICT (class_id) DO UPDATE SET
        default_voice = COALESCE(${params.defaultVoice}, class_voice_settings.default_voice),
        default_teacher_model = COALESCE(${params.defaultTeacherModel}, class_voice_settings.default_teacher_model),
        language_formality = COALESCE(${params.languageFormality}, class_voice_settings.language_formality),
        voice_input_enabled = COALESCE(${params.voiceInputEnabled}, class_voice_settings.voice_input_enabled),
        whiteboard_enabled = COALESCE(${params.whiteboardEnabled}, class_voice_settings.whiteboard_enabled),
        animations_enabled = COALESCE(${params.animationsEnabled}, class_voice_settings.animations_enabled),
        updated_at = NOW()
      RETURNING *
    `

    console.log(`⚙️  Voice settings saved for class: ${params.classId}`)
    return result.rows[0]
  } catch (error) {
    console.error('Error upserting class voice settings:', error)
    throw error
  }
}

export default {
  getCachedVoiceResponse,
  cacheVoiceResponse,
  getCacheStatistics,
  cleanupExpiredCache,
  saveVoiceInteraction,
  getStudentVoiceInteractions,
  getVoiceAnalytics,
  getClassVoiceSettings,
  upsertClassVoiceSettings,
}
