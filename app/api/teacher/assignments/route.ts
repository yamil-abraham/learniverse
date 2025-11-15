/**
 * API Route: /api/teacher/assignments
 * GET: Get all assignments for a teacher
 * POST: Create a new assignment
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getTeacherByUserId } from '@/lib/db/queries'
import { createActivityAssignment, getTeacherAssignments } from '@/lib/db/teacher-queries'
import type { CreateAssignmentParams } from '@/types'

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

    // Get all assignments
    const assignments = await getTeacherAssignments(teacher.id)

    return NextResponse.json({
      success: true,
      assignments,
      count: assignments.length
    })

  } catch (error) {
    console.error('Error in GET /api/teacher/assignments:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener asignaciones',
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
    const { studentId, classId, activityType, difficulty, quantity, dueDate } = body

    // Validate required fields
    if (!activityType || !difficulty) {
      return NextResponse.json(
        { success: false, message: 'Tipo de actividad y dificultad son requeridos' },
        { status: 400 }
      )
    }

    // Validate that either studentId or classId is provided
    if (!studentId && !classId) {
      return NextResponse.json(
        { success: false, message: 'Debe especificar un estudiante o una clase' },
        { status: 400 }
      )
    }

    // Create assignment
    const params: CreateAssignmentParams = {
      teacherId: teacher.id,
      studentId: studentId || undefined,
      classId: classId || undefined,
      activityType,
      difficulty,
      quantity: quantity || 5,
      dueDate: dueDate ? new Date(dueDate) : undefined
    }

    await createActivityAssignment(params)

    return NextResponse.json({
      success: true,
      message: 'Asignación creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/teacher/assignments:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al crear asignación',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
