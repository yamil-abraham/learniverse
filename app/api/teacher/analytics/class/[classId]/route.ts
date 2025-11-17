/**
 * API Route: /api/teacher/analytics/class/[classId]
 * GET: Get detailed analytics for a specific class
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getTeacherByUserId } from '@/lib/db/queries'
import { getClassById, getClassAnalytics } from '@/lib/db/teacher-queries'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verify user is a teacher
    if (session.user.role !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'Acceso denegado. Solo para profesores.' },
        { status: 403 }
      )
    }

    // Get teacher record
    const teacher = await getTeacherByUserId(session.user.id)
    if (!teacher) {
      return NextResponse.json(
        { success: false, message: 'Profesor no encontrado' },
        { status: 404 }
      )
    }

    const { classId } = await params

    // Get class and verify teacher owns it
    const classData = await getClassById(classId)

    if (!classData) {
      return NextResponse.json(
        { success: false, message: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    if (classData.teacherId !== teacher.id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permiso para ver esta clase' },
        { status: 403 }
      )
    }

    // Get class analytics
    const analytics = await getClassAnalytics(classId)

    if (!analytics) {
      return NextResponse.json(
        { success: false, message: 'No se pudieron obtener las analíticas de la clase' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Error in GET /api/teacher/analytics/class/[classId]:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener analíticas de la clase',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
