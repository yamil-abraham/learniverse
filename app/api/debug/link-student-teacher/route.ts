/**
 * DEBUG API: Link test student to test teacher
 * This ensures student@test.com is assigned to teacher@test.com
 */

import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 1. Get teacher ID for teacher@test.com
    const teacherResult = await sql`
      SELECT t.id, t.user_id, u.email, u.name
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.email = 'teacher@test.com'
    `

    if (teacherResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Teacher not found'
      })
    }

    const teacher = teacherResult.rows[0]

    // 2. Get student ID for student@test.com
    const studentResult = await sql`
      SELECT s.id, s.user_id, s.teacher_id, u.email, u.name
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.email = 'student@test.com'
    `

    if (studentResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Student not found'
      })
    }

    const student = studentResult.rows[0]

    // 3. Check if already linked
    if (student.teacher_id === teacher.id) {
      return NextResponse.json({
        success: true,
        message: 'Student already linked to teacher',
        data: {
          student: { id: student.id, name: student.name, email: student.email },
          teacher: { id: teacher.id, name: teacher.name, email: teacher.email },
          alreadyLinked: true
        }
      })
    }

    // 4. Link student to teacher
    await sql`
      UPDATE students
      SET teacher_id = ${teacher.id}
      WHERE id = ${student.id}
    `

    return NextResponse.json({
      success: true,
      message: 'Student successfully linked to teacher',
      data: {
        student: { id: student.id, name: student.name, email: student.email },
        teacher: { id: teacher.id, name: teacher.name, email: teacher.email },
        alreadyLinked: false
      }
    })

  } catch (error) {
    console.error('Error linking student to teacher:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
