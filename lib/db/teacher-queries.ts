/**
 * Database Queries for Phase 5: Teacher Dashboard and Analytics
 *
 * This file contains all database query functions for:
 * - Class management
 * - Student analytics
 * - Teacher alerts
 * - Activity assignments
 * - Performance reporting
 */

import { sql } from '@vercel/postgres'
import type {
  Class,
  ClassStudent,
  TeacherAlert,
  ActivityAssignment,
  StudentAnalytics,
  ClassAnalytics,
  StudentSummary,
  PerformanceOverTime,
  ActivityTypeDistribution,
  TeacherDashboardStats,
  StudentDetailAnalytics,
  ClassDetail,
  CreateAlertParams,
  CreateAssignmentParams,
  CreateClassParams,
  StudentFilterOptions,
  MathActivityType,
  DifficultyLevel,
  StudentAttempt,
  Badge,
  StudentLearningProfile
} from '@/types'

// ============================================
// CLASS MANAGEMENT QUERIES
// ============================================

/**
 * Get all classes for a teacher
 */
export async function getTeacherClasses(teacherId: string): Promise<Class[]> {
  try {
    const result = await sql`
      SELECT
        c.id,
        c.teacher_id AS "teacherId",
        c.name,
        c.description,
        c.grade,
        c.school_year AS "schoolYear",
        c.is_active AS "isActive",
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        COUNT(DISTINCT cs.student_id) AS "studentCount"
      FROM classes c
      LEFT JOIN class_students cs ON c.id = cs.class_id
      WHERE c.teacher_id = ${teacherId}
      GROUP BY c.id
      ORDER BY c.is_active DESC, c.created_at DESC
    `

    return result.rows.map((row: any) => ({
      id: row.id,
      teacherId: row.teacherId,
      name: row.name,
      description: row.description,
      grade: row.grade,
      schoolYear: row.schoolYear,
      isActive: row.isActive,
      studentCount: parseInt(row.studentCount || '0'),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }))
  } catch (error) {
    console.error('Error getting teacher classes:', error)
    throw error
  }
}

/**
 * Get a single class by ID
 */
export async function getClassById(classId: string): Promise<Class | null> {
  try {
    const result = await sql`
      SELECT
        c.id,
        c.teacher_id AS "teacherId",
        c.name,
        c.description,
        c.grade,
        c.school_year AS "schoolYear",
        c.is_active AS "isActive",
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        COUNT(DISTINCT cs.student_id) AS "studentCount"
      FROM classes c
      LEFT JOIN class_students cs ON c.id = cs.class_id
      WHERE c.id = ${classId}
      GROUP BY c.id
    `

    if (result.rows.length === 0) return null

    const row: any = result.rows[0]
    return {
      id: row.id,
      teacherId: row.teacherId,
      name: row.name,
      description: row.description,
      grade: row.grade,
      schoolYear: row.schoolYear,
      isActive: row.isActive,
      studentCount: parseInt(row.studentCount || '0'),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }
  } catch (error) {
    console.error('Error getting class:', error)
    throw error
  }
}

/**
 * Create a new class
 */
export async function createClass(params: CreateClassParams): Promise<Class> {
  try {
    const result = await sql`
      INSERT INTO classes (teacher_id, name, description, grade, school_year)
      VALUES (
        ${params.teacherId},
        ${params.name},
        ${params.description || null},
        ${params.grade || null},
        ${params.schoolYear || null}
      )
      RETURNING
        id,
        teacher_id AS "teacherId",
        name,
        description,
        grade,
        school_year AS "schoolYear",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `

    const row: any = result.rows[0]
    return {
      id: row.id,
      teacherId: row.teacherId,
      name: row.name,
      description: row.description,
      grade: row.grade,
      schoolYear: row.schoolYear,
      isActive: row.isActive,
      studentCount: 0,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }
  } catch (error) {
    console.error('Error creating class:', error)
    throw error
  }
}

/**
 * Update a class
 */
export async function updateClass(
  classId: string,
  updates: Partial<Omit<Class, 'id' | 'teacherId' | 'createdAt' | 'updatedAt' | 'studentCount'>>
): Promise<void> {
  try {
    await sql`
      UPDATE classes
      SET
        name = COALESCE(${updates.name}, name),
        description = COALESCE(${updates.description}, description),
        grade = COALESCE(${updates.grade}, grade),
        school_year = COALESCE(${updates.schoolYear}, school_year),
        is_active = COALESCE(${updates.isActive}, is_active)
      WHERE id = ${classId}
    `
  } catch (error) {
    console.error('Error updating class:', error)
    throw error
  }
}

/**
 * Delete a class
 */
export async function deleteClass(classId: string): Promise<void> {
  try {
    await sql`DELETE FROM classes WHERE id = ${classId}`
  } catch (error) {
    console.error('Error deleting class:', error)
    throw error
  }
}

/**
 * Get students in a class
 */
export async function getClassStudents(classId: string): Promise<StudentSummary[]> {
  try {
    const result = await sql`
      SELECT
        s.id,
        u.name,
        s.level,
        COALESCE(sp.success_rate, 0) AS "successRate",
        COALESCE(sp.total_attempts, 0) AS "totalAttempts",
        COALESCE(sp.last_active, s.created_at) AS "lastActive",
        CASE
          WHEN COALESCE(sp.success_rate, 0) < 50 THEN true
          ELSE false
        END AS "needsAttention"
      FROM class_students cs
      JOIN students s ON cs.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN student_performance_summary sp ON s.id = sp.student_id
      WHERE cs.class_id = ${classId}
      ORDER BY u.name
    `

    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      level: parseInt(row.level),
      successRate: parseFloat(row.successRate),
      totalAttempts: parseInt(row.totalAttempts),
      lastActive: new Date(row.lastActive),
      needsAttention: row.needsAttention
    }))
  } catch (error) {
    console.error('Error getting class students:', error)
    throw error
  }
}

/**
 * Add student to class
 */
export async function addStudentToClass(classId: string, studentId: string): Promise<void> {
  try {
    await sql`
      INSERT INTO class_students (class_id, student_id)
      VALUES (${classId}, ${studentId})
      ON CONFLICT (class_id, student_id) DO NOTHING
    `
  } catch (error) {
    console.error('Error adding student to class:', error)
    throw error
  }
}

/**
 * Remove student from class
 */
export async function removeStudentFromClass(classId: string, studentId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM class_students
      WHERE class_id = ${classId} AND student_id = ${studentId}
    `
  } catch (error) {
    console.error('Error removing student from class:', error)
    throw error
  }
}

// ============================================
// STUDENT QUERIES FOR TEACHERS
// ============================================

/**
 * Get all students for a teacher
 */
export async function getTeacherStudents(teacherId: string): Promise<StudentSummary[]> {
  try {
    const result = await sql`
      SELECT
        s.id,
        u.name,
        s.level,
        COALESCE(sp.success_rate, 0) AS "successRate",
        COALESCE(sp.total_attempts, 0) AS "totalAttempts",
        COALESCE(sp.last_active, s.created_at) AS "lastActive",
        CASE
          WHEN COALESCE(sp.success_rate, 0) < 50 THEN true
          ELSE false
        END AS "needsAttention"
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN student_performance_summary sp ON s.id = sp.student_id
      WHERE s.teacher_id = ${teacherId}
      ORDER BY u.name
    `

    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      level: parseInt(row.level),
      successRate: parseFloat(row.successRate),
      totalAttempts: parseInt(row.totalAttempts),
      lastActive: new Date(row.lastActive),
      needsAttention: row.needsAttention
    }))
  } catch (error) {
    console.error('Error getting teacher students:', error)
    throw error
  }
}

/**
 * Get filtered and sorted students
 */
export async function getFilteredStudents(
  teacherId: string,
  filters: StudentFilterOptions
): Promise<StudentSummary[]> {
  try {
    // Simplified version - always sort by name for type safety
    // For advanced sorting, use getTeacherStudents() and sort client-side

    // Build WHERE conditions as an array
    const baseSelect = `
      SELECT s.id, u.name, s.level, COALESCE(sp.success_rate, 0) AS "successRate",
        COALESCE(sp.total_attempts, 0) AS "totalAttempts",
        COALESCE(sp.last_active, s.created_at) AS "lastActive",
        CASE WHEN COALESCE(sp.success_rate, 0) < 50 THEN true ELSE false END AS "needsAttention"
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN student_performance_summary sp ON s.id = sp.student_id
    `

    // Build query based on filters
    let result

    if (filters.classId && filters.searchQuery && filters.performanceLevel === 'struggling') {
      result = await sql.query(`${baseSelect}
        JOIN class_students cs ON s.id = cs.student_id AND cs.class_id = $1
        WHERE s.teacher_id = $2 AND u.name ILIKE $3 AND COALESCE(sp.success_rate, 0) < 50
        ORDER BY u.name ASC`, [filters.classId, teacherId, `%${filters.searchQuery}%`])
    } else if (filters.classId && filters.searchQuery && filters.performanceLevel === 'excelling') {
      result = await sql.query(`${baseSelect}
        JOIN class_students cs ON s.id = cs.student_id AND cs.class_id = $1
        WHERE s.teacher_id = $2 AND u.name ILIKE $3 AND COALESCE(sp.success_rate, 0) >= 80
        ORDER BY u.name ASC`, [filters.classId, teacherId, `%${filters.searchQuery}%`])
    } else if (filters.classId && filters.searchQuery && filters.performanceLevel === 'average') {
      result = await sql.query(`${baseSelect}
        JOIN class_students cs ON s.id = cs.student_id AND cs.class_id = $1
        WHERE s.teacher_id = $2 AND u.name ILIKE $3 AND COALESCE(sp.success_rate, 0) BETWEEN 50 AND 79
        ORDER BY u.name ASC`, [filters.classId, teacherId, `%${filters.searchQuery}%`])
    } else if (filters.classId && filters.searchQuery) {
      result = await sql.query(`${baseSelect}
        JOIN class_students cs ON s.id = cs.student_id AND cs.class_id = $1
        WHERE s.teacher_id = $2 AND u.name ILIKE $3
        ORDER BY u.name ASC`, [filters.classId, teacherId, `%${filters.searchQuery}%`])
    } else if (filters.classId && filters.performanceLevel === 'struggling') {
      result = await sql.query(`${baseSelect}
        JOIN class_students cs ON s.id = cs.student_id AND cs.class_id = $1
        WHERE s.teacher_id = $2 AND COALESCE(sp.success_rate, 0) < 50
        ORDER BY u.name ASC`, [filters.classId, teacherId])
    } else if (filters.classId && filters.performanceLevel === 'excelling') {
      result = await sql.query(`${baseSelect}
        JOIN class_students cs ON s.id = cs.student_id AND cs.class_id = $1
        WHERE s.teacher_id = $2 AND COALESCE(sp.success_rate, 0) >= 80
        ORDER BY u.name ASC`, [filters.classId, teacherId])
    } else if (filters.classId && filters.performanceLevel === 'average') {
      result = await sql.query(`${baseSelect}
        JOIN class_students cs ON s.id = cs.student_id AND cs.class_id = $1
        WHERE s.teacher_id = $2 AND COALESCE(sp.success_rate, 0) BETWEEN 50 AND 79
        ORDER BY u.name ASC`, [filters.classId, teacherId])
    } else if (filters.classId) {
      result = await sql.query(`${baseSelect}
        JOIN class_students cs ON s.id = cs.student_id AND cs.class_id = $1
        WHERE s.teacher_id = $2
        ORDER BY u.name ASC`, [filters.classId, teacherId])
    } else if (filters.searchQuery && filters.performanceLevel === 'struggling') {
      result = await sql.query(`${baseSelect}
        WHERE s.teacher_id = $1 AND u.name ILIKE $2 AND COALESCE(sp.success_rate, 0) < 50
        ORDER BY u.name ASC`, [teacherId, `%${filters.searchQuery}%`])
    } else if (filters.searchQuery && filters.performanceLevel === 'excelling') {
      result = await sql.query(`${baseSelect}
        WHERE s.teacher_id = $1 AND u.name ILIKE $2 AND COALESCE(sp.success_rate, 0) >= 80
        ORDER BY u.name ASC`, [teacherId, `%${filters.searchQuery}%`])
    } else if (filters.searchQuery && filters.performanceLevel === 'average') {
      result = await sql.query(`${baseSelect}
        WHERE s.teacher_id = $1 AND u.name ILIKE $2 AND COALESCE(sp.success_rate, 0) BETWEEN 50 AND 79
        ORDER BY u.name ASC`, [teacherId, `%${filters.searchQuery}%`])
    } else if (filters.searchQuery) {
      result = await sql.query(`${baseSelect}
        WHERE s.teacher_id = $1 AND u.name ILIKE $2
        ORDER BY u.name ASC`, [teacherId, `%${filters.searchQuery}%`])
    } else if (filters.performanceLevel === 'struggling') {
      result = await sql.query(`${baseSelect}
        WHERE s.teacher_id = $1 AND COALESCE(sp.success_rate, 0) < 50
        ORDER BY u.name ASC`, [teacherId])
    } else if (filters.performanceLevel === 'excelling') {
      result = await sql.query(`${baseSelect}
        WHERE s.teacher_id = $1 AND COALESCE(sp.success_rate, 0) >= 80
        ORDER BY u.name ASC`, [teacherId])
    } else if (filters.performanceLevel === 'average') {
      result = await sql.query(`${baseSelect}
        WHERE s.teacher_id = $1 AND COALESCE(sp.success_rate, 0) BETWEEN 50 AND 79
        ORDER BY u.name ASC`, [teacherId])
    } else {
      result = await sql.query(`${baseSelect}
        WHERE s.teacher_id = $1
        ORDER BY u.name ASC`, [teacherId])
    }

    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      level: parseInt(row.level),
      successRate: parseFloat(row.successRate),
      totalAttempts: parseInt(row.totalAttempts),
      lastActive: new Date(row.lastActive),
      needsAttention: row.needsAttention
    }))
  } catch (error) {
    console.error('Error getting filtered students:', error)
    throw error
  }
}

// ============================================
// ANALYTICS QUERIES
// ============================================

/**
 * Get comprehensive student analytics
 */
export async function getStudentAnalytics(studentId: string): Promise<StudentAnalytics | null> {
  try {
    // Get basic stats from view
    const basicResult = await sql`
      SELECT * FROM student_performance_summary
      WHERE student_id = ${studentId}
    `

    if (basicResult.rows.length === 0) {
      // Student exists but has no attempts yet
      const studentResult = await sql`
        SELECT s.id, u.name, s.level, s.experience
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ${studentId}
      `

      if (studentResult.rows.length === 0) return null

      const student = studentResult.rows[0]

      // Return default analytics
      return {
        studentId: student.id,
        studentName: student.name,
        level: parseInt(student.level),
        totalPoints: parseInt(student.experience),
        totalAttempts: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        successRate: 0,
        averageTimeSeconds: 0,
        lastActive: new Date(),
        streakDays: 0,
        badgesEarned: 0,
        activitiesByType: {
          addition: { attempted: 0, correct: 0, successRate: 0 },
          subtraction: { attempted: 0, correct: 0, successRate: 0 },
          multiplication: { attempted: 0, correct: 0, successRate: 0 },
          division: { attempted: 0, correct: 0, successRate: 0 },
          fractions: { attempted: 0, correct: 0, successRate: 0 }
        },
        recentPerformanceTrend: 'stable',
        needsAttention: false
      }
    }

    const basic = basicResult.rows[0]

    // Get activity type breakdown
    const typeResult = await sql`
      SELECT
        a.type,
        COUNT(*) AS attempted,
        COUNT(*) FILTER (WHERE sa.is_correct = true) AS correct,
        CASE
          WHEN COUNT(*) > 0 THEN
            ROUND((COUNT(*) FILTER (WHERE sa.is_correct = true)::DECIMAL / COUNT(*)) * 100, 2)
          ELSE 0
        END AS success_rate
      FROM student_attempts sa
      JOIN activities a ON sa.activity_id = a.id
      WHERE sa.student_id = ${studentId}
      GROUP BY a.type
    `

    const activitiesByType: any = {
      addition: { attempted: 0, correct: 0, successRate: 0 },
      subtraction: { attempted: 0, correct: 0, successRate: 0 },
      multiplication: { attempted: 0, correct: 0, successRate: 0 },
      division: { attempted: 0, correct: 0, successRate: 0 },
      fractions: { attempted: 0, correct: 0, successRate: 0 }
    }

    typeResult.rows.forEach(row => {
      activitiesByType[row.type] = {
        attempted: parseInt(row.attempted),
        correct: parseInt(row.correct),
        successRate: parseFloat(row.success_rate)
      }
    })

    // Calculate trend (last 7 days vs previous 7 days)
    const trendResult = await sql`
      WITH recent AS (
        SELECT COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / NULLIF(COUNT(*), 0) AS rate
        FROM student_attempts
        WHERE student_id = ${studentId}
        AND attempted_at >= NOW() - INTERVAL '7 days'
      ),
      previous AS (
        SELECT COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / NULLIF(COUNT(*), 0) AS rate
        FROM student_attempts
        WHERE student_id = ${studentId}
        AND attempted_at >= NOW() - INTERVAL '14 days'
        AND attempted_at < NOW() - INTERVAL '7 days'
      )
      SELECT
        COALESCE(recent.rate, 0) AS recent_rate,
        COALESCE(previous.rate, 0) AS previous_rate
      FROM recent, previous
    `

    const trend = trendResult.rows[0]
    const recentRate = parseFloat(trend.recent_rate || 0)
    const previousRate = parseFloat(trend.previous_rate || 0)

    let recentPerformanceTrend: 'improving' | 'stable' | 'declining' = 'stable'
    if (recentRate > previousRate + 0.1) {
      recentPerformanceTrend = 'improving'
    } else if (recentRate < previousRate - 0.1) {
      recentPerformanceTrend = 'declining'
    }

    // Determine strongest and weakest areas
    const typeRates = Object.entries(activitiesByType)
      .filter(([_, data]: [string, any]) => data.attempted > 0)
      .map(([type, data]: [string, any]) => ({ type: type as MathActivityType, rate: data.successRate }))

    const strongestArea = typeRates.length > 0
      ? typeRates.reduce((max, curr) => curr.rate > max.rate ? curr : max).type
      : undefined

    const weakestArea = typeRates.length > 0
      ? typeRates.reduce((min, curr) => curr.rate < min.rate ? curr : min).type
      : undefined

    return {
      studentId: basic.student_id,
      studentName: basic.student_name,
      level: parseInt(basic.level),
      totalPoints: parseInt(basic.total_points),
      totalAttempts: parseInt(basic.total_attempts),
      correctAnswers: parseInt(basic.correct_answers),
      incorrectAnswers: parseInt(basic.incorrect_answers),
      successRate: parseFloat(basic.success_rate),
      averageTimeSeconds: parseFloat(basic.average_time_seconds),
      lastActive: new Date(basic.last_active),
      streakDays: 0, // TODO: Implement streak calculation
      badgesEarned: parseInt(basic.badges_earned),
      activitiesByType,
      recentPerformanceTrend,
      needsAttention: parseFloat(basic.success_rate) < 50,
      strongestArea,
      weakestArea
    }
  } catch (error) {
    console.error('Error getting student analytics:', error)
    throw error
  }
}

/**
 * Get performance over time for charts
 */
export async function getStudentPerformanceOverTime(
  studentId: string,
  days: number = 30
): Promise<PerformanceOverTime[]> {
  try {
    const result = await sql`
      SELECT
        DATE(attempted_at) AS date,
        COUNT(*) AS activities_completed,
        ROUND((COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / COUNT(*)) * 100, 2) AS success_rate,
        ROUND(AVG(time_taken_seconds), 2) AS average_time,
        SUM(points_earned) AS points_earned
      FROM student_attempts
      WHERE student_id = ${studentId}
      AND attempted_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(attempted_at)
      ORDER BY DATE(attempted_at)
    `

    return result.rows.map(row => ({
      date: row.date,
      successRate: parseFloat(row.success_rate || 0),
      activitiesCompleted: parseInt(row.activities_completed),
      averageTime: parseFloat(row.average_time || 0),
      pointsEarned: parseInt(row.points_earned || 0)
    }))
  } catch (error) {
    console.error('Error getting performance over time:', error)
    throw error
  }
}

/**
 * Get activity distribution for student
 */
export async function getStudentActivityDistribution(
  studentId: string
): Promise<ActivityTypeDistribution[]> {
  try {
    const result = await sql`
      SELECT
        a.type,
        COUNT(*) AS count,
        ROUND((COUNT(*) FILTER (WHERE sa.is_correct = true)::DECIMAL / COUNT(*)) * 100, 2) AS success_rate,
        ROUND(AVG(sa.time_taken_seconds), 2) AS average_time
      FROM student_attempts sa
      JOIN activities a ON sa.activity_id = a.id
      WHERE sa.student_id = ${studentId}
      GROUP BY a.type
      ORDER BY count DESC
    `

    return result.rows.map(row => ({
      type: row.type as MathActivityType,
      count: parseInt(row.count),
      successRate: parseFloat(row.success_rate),
      averageTime: parseFloat(row.average_time)
    }))
  } catch (error) {
    console.error('Error getting activity distribution:', error)
    throw error
  }
}

/**
 * Get class analytics
 */
export async function getClassAnalytics(classId: string): Promise<ClassAnalytics | null> {
  try {
    const result = await sql`
      SELECT * FROM class_performance_summary
      WHERE class_id = ${classId}
    `

    if (result.rows.length === 0) {
      // Class exists but has no data yet
      const classResult = await sql`SELECT name FROM classes WHERE id = ${classId}`
      if (classResult.rows.length === 0) return null

      return {
        classId,
        className: classResult.rows[0].name,
        totalStudents: 0,
        activeStudents: 0,
        averageLevel: 0,
        averageSuccessRate: 0,
        totalActivitiesCompleted: 0,
        strugglingStudents: 0,
        topPerformers: [],
        needsAttentionStudents: []
      }
    }

    const data: any = result.rows[0]

    // Get top performers
    const topResult = await sql`
      SELECT
        s.id,
        u.name,
        s.level,
        sp.success_rate AS "successRate",
        sp.total_attempts AS "totalAttempts",
        sp.last_active AS "lastActive",
        false AS "needsAttention"
      FROM class_students cs
      JOIN students s ON cs.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN student_performance_summary sp ON s.id = sp.student_id
      WHERE cs.class_id = ${classId}
      AND sp.total_attempts >= 5
      ORDER BY sp.success_rate DESC, sp.total_attempts DESC
      LIMIT 3
    `

    // Get students needing attention
    const needsAttentionResult = await sql`
      SELECT
        s.id,
        u.name,
        s.level,
        COALESCE(sp.success_rate, 0) AS "successRate",
        COALESCE(sp.total_attempts, 0) AS "totalAttempts",
        COALESCE(sp.last_active, s.created_at) AS "lastActive",
        true AS "needsAttention"
      FROM class_students cs
      JOIN students s ON cs.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN student_performance_summary sp ON s.id = sp.student_id
      WHERE cs.class_id = ${classId}
      AND COALESCE(sp.success_rate, 0) < 50
      ORDER BY COALESCE(sp.success_rate, 0) ASC
      LIMIT 5
    `

    return {
      classId: data.class_id,
      className: data.class_name,
      totalStudents: parseInt(data.total_students),
      activeStudents: parseInt(data.active_students_last_7_days),
      averageLevel: parseFloat(data.average_level || 0),
      averageSuccessRate: parseFloat(data.average_success_rate || 0),
      totalActivitiesCompleted: parseInt(data.total_activities_completed || 0),
      strugglingStudents: needsAttentionResult.rows.length,
      topPerformers: topResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        level: parseInt(row.level),
        successRate: parseFloat(row.successRate),
        totalAttempts: parseInt(row.totalAttempts),
        lastActive: new Date(row.lastActive),
        needsAttention: false
      })),
      needsAttentionStudents: needsAttentionResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        level: parseInt(row.level),
        successRate: parseFloat(row.successRate),
        totalAttempts: parseInt(row.totalAttempts),
        lastActive: new Date(row.lastActive),
        needsAttention: true
      }))
    }
  } catch (error) {
    console.error('Error getting class analytics:', error)
    throw error
  }
}

/**
 * Get teacher dashboard overview stats
 */
export async function getTeacherDashboardStats(teacherId: string): Promise<TeacherDashboardStats> {
  try {
    const result = await sql`
      WITH student_stats AS (
        SELECT
          s.id,
          sp.last_active,
          sp.success_rate
        FROM students s
        LEFT JOIN student_performance_summary sp ON s.id = sp.student_id
        WHERE s.teacher_id = ${teacherId}
      ),
      today_activities AS (
        SELECT COUNT(*) AS count
        FROM student_attempts sa
        JOIN students s ON sa.student_id = s.id
        WHERE s.teacher_id = ${teacherId}
        AND sa.attempted_at >= CURRENT_DATE
      )
      SELECT
        COUNT(DISTINCT ss.id) AS total_students,
        COUNT(DISTINCT ss.id) FILTER (WHERE ss.last_active >= CURRENT_DATE) AS active_today,
        COUNT(DISTINCT ss.id) FILTER (WHERE ss.last_active >= NOW() - INTERVAL '7 days') AS active_week,
        (SELECT COUNT(*) FROM classes WHERE teacher_id = ${teacherId} AND is_active = true) AS total_classes,
        (SELECT COUNT(*) FROM teacher_alerts WHERE teacher_id = ${teacherId} AND is_read = false) AS unread_alerts,
        ROUND(AVG(ss.success_rate), 2) AS avg_performance,
        (SELECT count FROM today_activities) AS activities_today,
        COUNT(DISTINCT ss.id) FILTER (WHERE COALESCE(ss.success_rate, 0) < 50) AS needs_attention
      FROM student_stats ss
      CROSS JOIN today_activities
    `

    const data = result.rows[0]

    return {
      totalStudents: parseInt(data.total_students || 0),
      activeStudentsToday: parseInt(data.active_today || 0),
      activeStudentsWeek: parseInt(data.active_week || 0),
      totalClasses: parseInt(data.total_classes || 0),
      unreadAlerts: parseInt(data.unread_alerts || 0),
      averageClassPerformance: parseFloat(data.avg_performance || 0),
      totalActivitiesCompletedToday: parseInt(data.activities_today || 0),
      studentsNeedingAttention: parseInt(data.needs_attention || 0)
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    throw error
  }
}

// ============================================
// ALERT QUERIES
// ============================================

/**
 * Get teacher alerts
 */
export async function getTeacherAlerts(
  teacherId: string,
  unreadOnly: boolean = false
): Promise<TeacherAlert[]> {
  try {
    // Build query based on unreadOnly filter
    const result = unreadOnly
      ? await sql`
        SELECT
          ta.id,
          ta.teacher_id AS "teacherId",
          ta.student_id AS "studentId",
          u.name AS "studentName",
          ta.alert_type AS "alertType",
          ta.title,
          ta.message,
          ta.severity,
          ta.is_read AS "isRead",
          ta.created_at AS "createdAt"
        FROM teacher_alerts ta
        JOIN students s ON ta.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE ta.teacher_id = ${teacherId} AND ta.is_read = false
        ORDER BY ta.created_at DESC LIMIT 50
      `
      : await sql`
        SELECT
          ta.id,
          ta.teacher_id AS "teacherId",
          ta.student_id AS "studentId",
          u.name AS "studentName",
          ta.alert_type AS "alertType",
          ta.title,
          ta.message,
          ta.severity,
          ta.is_read AS "isRead",
          ta.created_at AS "createdAt"
        FROM teacher_alerts ta
        JOIN students s ON ta.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE ta.teacher_id = ${teacherId}
        ORDER BY ta.created_at DESC LIMIT 50
      `

    return result.rows.map((row: any) => ({
      id: row.id,
      teacherId: row.teacherId,
      studentId: row.studentId,
      studentName: row.studentName,
      alertType: row.alertType,
      title: row.title,
      message: row.message,
      severity: row.severity,
      isRead: row.isRead,
      createdAt: new Date(row.createdAt)
    }))
  } catch (error) {
    console.error('Error getting teacher alerts:', error)
    throw error
  }
}

/**
 * Create a teacher alert
 */
export async function createTeacherAlert(params: CreateAlertParams): Promise<void> {
  try {
    await sql`
      INSERT INTO teacher_alerts (
        teacher_id,
        student_id,
        alert_type,
        title,
        message,
        severity
      )
      VALUES (
        ${params.teacherId},
        ${params.studentId},
        ${params.alertType},
        ${params.title},
        ${params.message},
        ${params.severity || 'info'}
      )
    `
  } catch (error) {
    console.error('Error creating alert:', error)
    throw error
  }
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(alertId: string): Promise<void> {
  try {
    await sql`
      UPDATE teacher_alerts
      SET is_read = true
      WHERE id = ${alertId}
    `
  } catch (error) {
    console.error('Error marking alert as read:', error)
    throw error
  }
}

/**
 * Mark all alerts as read for teacher
 */
export async function markAllAlertsAsRead(teacherId: string): Promise<void> {
  try {
    await sql`
      UPDATE teacher_alerts
      SET is_read = true
      WHERE teacher_id = ${teacherId} AND is_read = false
    `
  } catch (error) {
    console.error('Error marking all alerts as read:', error)
    throw error
  }
}

// ============================================
// ASSIGNMENT QUERIES
// ============================================

/**
 * Create activity assignment
 */
export async function createActivityAssignment(params: CreateAssignmentParams): Promise<void> {
  try {
    await sql`
      INSERT INTO activity_assignments (
        teacher_id,
        student_id,
        class_id,
        activity_type,
        difficulty,
        quantity,
        due_date
      )
      VALUES (
        ${params.teacherId},
        ${params.studentId || null},
        ${params.classId || null},
        ${params.activityType},
        ${params.difficulty},
        ${params.quantity},
        ${params.dueDate ? params.dueDate.toISOString() : null}
      )
    `
  } catch (error) {
    console.error('Error creating assignment:', error)
    throw error
  }
}

/**
 * Get assignments for student
 */
export async function getStudentAssignments(studentId: string): Promise<ActivityAssignment[]> {
  try {
    const result = await sql`
      SELECT
        id,
        teacher_id AS "teacherId",
        student_id AS "studentId",
        class_id AS "classId",
        activity_type AS "activityType",
        difficulty,
        quantity,
        due_date AS "dueDate",
        is_completed AS "isCompleted",
        completed_at AS "completedAt",
        created_at AS "createdAt"
      FROM activity_assignments
      WHERE student_id = ${studentId}
      OR class_id IN (
        SELECT class_id FROM class_students WHERE student_id = ${studentId}
      )
      ORDER BY due_date ASC NULLS LAST, created_at DESC
    `

    return result.rows.map((row: any) => ({
      id: row.id,
      teacherId: row.teacherId,
      studentId: row.studentId,
      classId: row.classId,
      activityType: row.activityType,
      difficulty: row.difficulty,
      quantity: row.quantity,
      dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
      isCompleted: row.isCompleted,
      completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
      createdAt: new Date(row.createdAt)
    }))
  } catch (error) {
    console.error('Error getting student assignments:', error)
    throw error
  }
}

/**
 * Get assignments for teacher
 */
export async function getTeacherAssignments(teacherId: string): Promise<ActivityAssignment[]> {
  try {
    const result = await sql`
      SELECT
        id,
        teacher_id AS "teacherId",
        student_id AS "studentId",
        class_id AS "classId",
        activity_type AS "activityType",
        difficulty,
        quantity,
        due_date AS "dueDate",
        is_completed AS "isCompleted",
        completed_at AS "completedAt",
        created_at AS "createdAt"
      FROM activity_assignments
      WHERE teacher_id = ${teacherId}
      ORDER BY due_date ASC NULLS LAST, created_at DESC
    `

    return result.rows.map((row: any) => ({
      id: row.id,
      teacherId: row.teacherId,
      studentId: row.studentId,
      classId: row.classId,
      activityType: row.activityType,
      difficulty: row.difficulty,
      quantity: row.quantity,
      dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
      isCompleted: row.isCompleted,
      completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
      createdAt: new Date(row.createdAt)
    }))
  } catch (error) {
    console.error('Error getting teacher assignments:', error)
    throw error
  }
}
