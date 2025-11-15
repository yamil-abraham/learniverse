/**
 * API Route: /api/teacher/analytics/overview
 * GET: Get teacher dashboard overview statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getTeacherByUserId } from '@/lib/db/queries'
import { getTeacherDashboardStats } from '@/lib/db/teacher-queries'

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

    // Get dashboard stats
    const stats = await getTeacherDashboardStats(teacher.id)

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Error in GET /api/teacher/analytics/overview:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener estadísticas del dashboard',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
