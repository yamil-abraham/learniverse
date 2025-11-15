/**
 * API Route: /api/teacher/classes/[classId]/students
 * POST: Add student to class
 * DELETE: Remove student from class
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getTeacherByUserId } from '@/lib/db/queries'
import {
  getClassById,
  addStudentToClass,
  removeStudentFromClass
} from '@/lib/db/teacher-queries'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { classId: string } }
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

    const { classId } = params

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
    const { studentId } = body

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'El ID del estudiante es requerido' },
        { status: 400 }
      )
    }

    // Add student to class
    await addStudentToClass(classId, studentId)

    return NextResponse.json({
      success: true,
      message: 'Estudiante agregado a la clase exitosamente'
    })

  } catch (error) {
    console.error('Error in POST /api/teacher/classes/[classId]/students:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al agregar estudiante a la clase',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { classId: string } }
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

    const { classId } = params

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

    // Get studentId from query params
    const studentId = request.nextUrl.searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'El ID del estudiante es requerido' },
        { status: 400 }
      )
    }

    // Remove student from class
    await removeStudentFromClass(classId, studentId)

    return NextResponse.json({
      success: true,
      message: 'Estudiante removido de la clase exitosamente'
    })

  } catch (error) {
    console.error('Error in DELETE /api/teacher/classes/[classId]/students:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al remover estudiante de la clase',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
