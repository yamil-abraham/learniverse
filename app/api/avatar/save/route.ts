/**
 * Avatar Save API Route
 * POST /api/avatar/save
 * Saves avatar configuration to database
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { updateStudentAvatar, getStudentByUserId } from '@/lib/db/queries'
import type { AvatarConfig } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      )
    }

    // Check if user is a student
    if (session.user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Solo estudiantes pueden personalizar avatares' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { studentId, avatarConfig } = body

    if (!studentId || !avatarConfig) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Verify the student belongs to the authenticated user
    const student = await getStudentByUserId(session.user.id)

    if (!student || student.id !== studentId) {
      return NextResponse.json(
        { success: false, message: 'No autorizado para modificar este avatar' },
        { status: 403 }
      )
    }

    // Save avatar configuration
    const updatedStudent = await updateStudentAvatar(studentId, avatarConfig)

    if (!updatedStudent) {
      return NextResponse.json(
        { success: false, message: 'Error al guardar avatar' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar guardado exitosamente',
      avatarConfig: updatedStudent.avatar_config,
    })
  } catch (error) {
    console.error('Error in avatar save API:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
