/**
 * API Route: /api/teacher/analytics/student/[studentId]
 * GET: Get detailed analytics for a specific student
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getTeacherByUserId, getStudentById } from '@/lib/db/queries'
import {
  getStudentAnalytics,
  getStudentPerformanceOverTime,
  getStudentActivityDistribution
} from '@/lib/db/teacher-queries'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
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

    const { studentId } = await params

    // Get student and verify teacher owns this student
    const student = await getStudentById(studentId)

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    if (student.teacher_id !== teacher.id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permiso para ver este estudiante' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')
    const includeHistory = searchParams.get('includeHistory') !== 'false' // Default true
    const includeDistribution = searchParams.get('includeDistribution') !== 'false' // Default true

    // Get analytics
    const analytics = await getStudentAnalytics(studentId)

    if (!analytics) {
      return NextResponse.json(
        { success: false, message: 'No se pudieron obtener las analíticas del estudiante' },
        { status: 500 }
      )
    }

    // Optionally include performance history and distribution
    const result: any = { analytics }

    if (includeHistory) {
      result.performanceHistory = await getStudentPerformanceOverTime(studentId, days)
    }

    if (includeDistribution) {
      result.activityDistribution = await getStudentActivityDistribution(studentId)
    }

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Error in GET /api/teacher/analytics/student/[studentId]:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener analíticas del estudiante',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
