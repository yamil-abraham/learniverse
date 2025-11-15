/**
 * API Route: /api/teacher/students
 * GET: Get all students for a teacher (with optional filters)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getTeacherByUserId } from '@/lib/db/queries'
import { getTeacherStudents, getFilteredStudents } from '@/lib/db/teacher-queries'
import type { StudentFilterOptions } from '@/types'

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

    // Parse query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const classId = searchParams.get('classId') || undefined
    const performanceLevel = searchParams.get('performanceLevel') as any || undefined
    const searchQuery = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sortBy') as any || undefined
    const sortOrder = searchParams.get('sortOrder') as any || undefined

    // Check if any filters are applied
    const hasFilters = classId || performanceLevel || searchQuery || sortBy || sortOrder

    let students

    if (hasFilters) {
      // Use filtered query
      const filters: StudentFilterOptions = {
        classId,
        performanceLevel,
        searchQuery,
        sortBy,
        sortOrder
      }

      students = await getFilteredStudents(teacher.id, filters)
    } else {
      // Get all students
      students = await getTeacherStudents(teacher.id)
    }

    return NextResponse.json({
      success: true,
      students,
      count: students.length
    })

  } catch (error) {
    console.error('Error in GET /api/teacher/students:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener estudiantes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
