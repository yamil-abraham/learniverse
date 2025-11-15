/**
 * API Route: /api/teacher/classes
 * GET: Get all classes for a teacher
 * POST: Create a new class
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getTeacherByUserId } from '@/lib/db/queries'
import { getTeacherClasses, createClass } from '@/lib/db/teacher-queries'
import type { CreateClassParams } from '@/types'

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

    // Get all classes
    const classes = await getTeacherClasses(teacher.id)

    return NextResponse.json({
      success: true,
      classes,
      count: classes.length
    })

  } catch (error) {
    console.error('Error in GET /api/teacher/classes:', error)
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
    const { name, description, grade, schoolYear } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'El nombre de la clase es requerido' },
        { status: 400 }
      )
    }

    // Validate grade if provided
    if (grade !== undefined && grade !== null && ![4, 5].includes(grade)) {
      return NextResponse.json(
        { success: false, message: 'El grado debe ser 4 o 5' },
        { status: 400 }
      )
    }

    // Create class
    const params: CreateClassParams = {
      teacherId: teacher.id,
      name: name.trim(),
      description: description?.trim(),
      grade,
      schoolYear
    }

    const newClass = await createClass(params)

    return NextResponse.json({
      success: true,
      message: 'Clase creada exitosamente',
      class: newClass
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/teacher/classes:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al crear clase',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
