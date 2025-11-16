/**
 * API Route: /api/student/classes
 * GET: Get all classes for a student
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getStudentByUserId } from '@/lib/db/queries'
import { getStudentClasses } from '@/lib/db/teacher-queries'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verify user is a student
    if (session.user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Acceso denegado. Solo para estudiantes.' },
        { status: 403 }
      )
    }

    // Get student record
    const student = await getStudentByUserId(session.user.id)
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    // Get student's classes
    const classes = await getStudentClasses(student.id)

    return NextResponse.json({
      success: true,
      classes,
      count: classes.length
    })

  } catch (error) {
    console.error('Error in GET /api/student/classes:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener clases',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
