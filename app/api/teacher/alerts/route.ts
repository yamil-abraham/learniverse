/**
 * API Route: /api/teacher/alerts
 * GET: Get teacher alerts (with optional unread filter)
 * POST: Create a new alert manually
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getTeacherByUserId } from '@/lib/db/queries'
import { getTeacherAlerts, createTeacherAlert, markAllAlertsAsRead } from '@/lib/db/teacher-queries'
import type { CreateAlertParams } from '@/types'

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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Get alerts
    const alerts = await getTeacherAlerts(teacher.id, unreadOnly)

    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
      unreadCount: alerts.filter(a => !a.isRead).length
    })

  } catch (error) {
    console.error('Error in GET /api/teacher/alerts:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener alertas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { studentId, alertType, title, message, severity } = body

    // Validate required fields
    if (!studentId || !alertType || !title || !message) {
      return NextResponse.json(
        { success: false, message: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Create alert
    const params: CreateAlertParams = {
      teacherId: teacher.id,
      studentId,
      alertType,
      title,
      message,
      severity
    }

    await createTeacherAlert(params)

    return NextResponse.json({
      success: true,
      message: 'Alerta creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/teacher/alerts:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al crear alerta',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    // Mark all alerts as read
    await markAllAlertsAsRead(teacher.id)

    return NextResponse.json({
      success: true,
      message: 'Todas las alertas marcadas como leídas'
    })

  } catch (error) {
    console.error('Error in PUT /api/teacher/alerts:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al marcar alertas como leídas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
