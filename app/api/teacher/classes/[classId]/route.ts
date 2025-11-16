/**
 * API Route: /api/teacher/classes/[classId]
 * GET: Get a specific class with details
 * PUT: Update a class
 * DELETE: Delete a class
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getTeacherByUserId } from '@/lib/db/queries'
import {
  getClassById,
  updateClass,
  deleteClass,
  getClassStudents,
  getClassAnalytics
} from '@/lib/db/teacher-queries'

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

    // Get class
    const classData = await getClassById(classId)

    if (!classData) {
      return NextResponse.json(
        { success: false, message: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    // Verify teacher owns this class
    if (classData.teacherId !== teacher.id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permiso para acceder a esta clase' },
        { status: 403 }
      )
    }

    // Get students and analytics
    const [students, analytics] = await Promise.all([
      getClassStudents(classId),
      getClassAnalytics(classId)
    ])

    return NextResponse.json({
      success: true,
      class: {
        ...classData,
        students,
        analytics
      }
    })

  } catch (error) {
    console.error('Error in GET /api/teacher/classes/[classId]:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener clase',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    // Get class
    const classData = await getClassById(classId)

    if (!classData) {
      return NextResponse.json(
        { success: false, message: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    // Verify teacher owns this class
    if (classData.teacherId !== teacher.id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permiso para modificar esta clase' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, description, grade, schoolYear, isActive } = body

    // Validate grade if provided
    if (grade !== undefined && grade !== null && ![4, 5].includes(grade)) {
      return NextResponse.json(
        { success: false, message: 'El grado debe ser 4 o 5' },
        { status: 400 }
      )
    }

    // Update class
    const updates: any = {}
    if (name !== undefined) updates.name = name.trim()
    if (description !== undefined) updates.description = description?.trim()
    if (grade !== undefined) updates.grade = grade
    if (schoolYear !== undefined) updates.schoolYear = schoolYear
    if (isActive !== undefined) updates.isActive = isActive

    await updateClass(classId, updates)

    // Get updated class
    const updatedClass = await getClassById(classId)

    return NextResponse.json({
      success: true,
      message: 'Clase actualizada exitosamente',
      class: updatedClass
    })

  } catch (error) {
    console.error('Error in PUT /api/teacher/classes/[classId]:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al actualizar clase',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Get class
    const classData = await getClassById(classId)

    if (!classData) {
      return NextResponse.json(
        { success: false, message: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    // Verify teacher owns this class
    if (classData.teacherId !== teacher.id) {
      return NextResponse.json(
        { success: false, message: 'No tienes permiso para eliminar esta clase' },
        { status: 403 }
      )
    }

    // Delete class
    await deleteClass(classId)

    return NextResponse.json({
      success: true,
      message: 'Clase eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error in DELETE /api/teacher/classes/[classId]:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al eliminar clase',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
