/**
 * Avatar Load API Route
 * GET /api/avatar/load
 * Loads avatar configuration from database
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getStudentById, getStudentByUserId } from '@/lib/db/queries'
import { DEFAULT_AVATAR_CONFIG } from '@/types'

export async function GET(request: NextRequest) {
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
        { success: false, message: 'Solo estudiantes tienen avatares' },
        { status: 403 }
      )
    }

    // Get studentId from query params
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Se requiere studentId' },
        { status: 400 }
      )
    }

    // Verify the student belongs to the authenticated user
    const student = await getStudentByUserId(session.user.id)

    if (!student || student.id !== studentId) {
      return NextResponse.json(
        { success: false, message: 'No autorizado para ver este avatar' },
        { status: 403 }
      )
    }

    // Get student with avatar config
    const studentData = await getStudentById(studentId)

    if (!studentData) {
      return NextResponse.json(
        { success: false, message: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    // Return avatar config or default if not set
    const avatarConfig = studentData.avatar_config || DEFAULT_AVATAR_CONFIG

    return NextResponse.json({
      success: true,
      avatarConfig,
    })
  } catch (error) {
    console.error('Error in avatar load API:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
