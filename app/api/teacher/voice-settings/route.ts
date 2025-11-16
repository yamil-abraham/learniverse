/**
 * Voice Settings API
 * GET/POST/PUT /api/teacher/voice-settings
 *
 * Manage voice settings per class
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { executeQuery, executeInsert, executeUpdate } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

/**
 * GET - Fetch voice settings for a class
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Only teachers can access settings
    if (session.user.role !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'Solo los profesores pueden acceder a esta configuración' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json(
        { success: false, message: 'Se requiere classId' },
        { status: 400 }
      )
    }

    // Fetch settings
    const result = await executeQuery<{
      id: string
      class_id: string
      teacher_id: string
      default_voice: string
      default_teacher_model: string
      language_formality: string
      voice_input_enabled: boolean
      whiteboard_enabled: boolean
      animations_enabled: boolean
      created_at: Date
      updated_at: Date
    }>(`
      SELECT *
      FROM class_voice_settings
      WHERE class_id = $1
      LIMIT 1
    `, [classId])

    if (result.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        settings: {
          classId: classId,
          defaultVoice: 'nova',
          defaultTeacherModel: 'teacher1',
          languageFormality: 'mixed',
          voiceInputEnabled: true,
          whiteboardEnabled: true,
          animationsEnabled: true,
        },
        isDefault: true,
      })
    }

    const settings = result[0]

    return NextResponse.json({
      success: true,
      settings: {
        classId: settings.class_id,
        defaultVoice: settings.default_voice,
        defaultTeacherModel: settings.default_teacher_model,
        languageFormality: settings.language_formality,
        voiceInputEnabled: settings.voice_input_enabled,
        whiteboardEnabled: settings.whiteboard_enabled,
        animationsEnabled: settings.animations_enabled,
        createdAt: settings.created_at,
        updatedAt: settings.updated_at,
      },
      isDefault: false,
    })

  } catch (error: any) {
    console.error('Error fetching voice settings:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create voice settings for a class
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'Solo los profesores pueden crear configuración' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      classId,
      defaultVoice = 'nova',
      defaultTeacherModel = 'teacher1',
      languageFormality = 'mixed',
      voiceInputEnabled = true,
      whiteboardEnabled = true,
      animationsEnabled = true,
    } = body

    if (!classId) {
      return NextResponse.json(
        { success: false, message: 'Se requiere classId' },
        { status: 400 }
      )
    }

    if (!session.user.teacherId) {
      return NextResponse.json(
        { success: false, message: 'Profesor no encontrado' },
        { status: 400 }
      )
    }

    // Insert settings
    const result = await executeInsert(`
      INSERT INTO class_voice_settings (
        class_id,
        teacher_id,
        default_voice,
        default_teacher_model,
        language_formality,
        voice_input_enabled,
        whiteboard_enabled,
        animations_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      classId,
      session.user.teacherId,
      defaultVoice,
      defaultTeacherModel,
      languageFormality,
      voiceInputEnabled,
      whiteboardEnabled,
      animationsEnabled,
    ])

    return NextResponse.json({
      success: true,
      message: 'Configuración creada correctamente',
      settingsId: result.id,
    })

  } catch (error: any) {
    console.error('Error creating voice settings:', error)

    // Handle unique constraint violation
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { success: false, message: 'Ya existe configuración para esta clase. Usa PUT para actualizar.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Error al crear configuración' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update voice settings for a class
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'Solo los profesores pueden actualizar configuración' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      classId,
      defaultVoice,
      defaultTeacherModel,
      languageFormality,
      voiceInputEnabled,
      whiteboardEnabled,
      animationsEnabled,
    } = body

    if (!classId) {
      return NextResponse.json(
        { success: false, message: 'Se requiere classId' },
        { status: 400 }
      )
    }

    if (!session.user.teacherId) {
      return NextResponse.json(
        { success: false, message: 'Profesor no encontrado' },
        { status: 400 }
      )
    }

    // Check if settings exist
    const existing = await executeQuery<{ id: string }>(`
      SELECT id FROM class_voice_settings WHERE class_id = $1
    `, [classId])

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Configuración no encontrada. Usa POST para crear.' },
        { status: 404 }
      )
    }

    // Update settings
    await executeUpdate(`
      UPDATE class_voice_settings
      SET
        default_voice = $1,
        default_teacher_model = $2,
        language_formality = $3,
        voice_input_enabled = $4,
        whiteboard_enabled = $5,
        animations_enabled = $6,
        updated_at = NOW()
      WHERE class_id = $7
    `, [
      defaultVoice,
      defaultTeacherModel,
      languageFormality,
      voiceInputEnabled,
      whiteboardEnabled,
      animationsEnabled,
      classId,
    ])

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada correctamente',
    })

  } catch (error: any) {
    console.error('Error updating voice settings:', error)
    return NextResponse.json(
      { success: false, message: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}
