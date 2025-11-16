/**
 * Voice Usage Analytics API
 * GET /api/teacher/analytics/voice-usage
 *
 * Provides voice interaction analytics for teacher dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { executeQuery } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

/**
 * GET - Fetch voice usage analytics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Only teachers can access analytics
    if (session.user.role !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'Solo los profesores pueden acceder a las analíticas' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const studentId = searchParams.get('studentId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build base query
    let whereConditions: string[] = []
    let params: any[] = []
    let paramIndex = 1

    // Filter by class (join through students)
    if (classId) {
      whereConditions.push(`s.class_id = $${paramIndex}`)
      params.push(classId)
      paramIndex++
    }

    // Filter by student
    if (studentId) {
      whereConditions.push(`tvi.student_id = $${paramIndex}`)
      params.push(studentId)
      paramIndex++
    }

    // Filter by date range
    if (startDate) {
      whereConditions.push(`tvi.created_at >= $${paramIndex}`)
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      whereConditions.push(`tvi.created_at <= $${paramIndex}`)
      params.push(endDate)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : ''

    // 1. Total interactions
    const totalResult = await executeQuery<{ count: number }>(`
      SELECT COUNT(*) as count
      FROM teacher_voice_interactions tvi
      JOIN students s ON tvi.student_id = s.id
      ${whereClause}
    `, params)

    const totalInteractions = parseInt(totalResult[0]?.count?.toString() || '0')

    // 2. Total duration
    const durationResult = await executeQuery<{ total_duration: number }>(`
      SELECT COALESCE(SUM(teacher_audio_duration), 0) as total_duration
      FROM teacher_voice_interactions tvi
      JOIN students s ON tvi.student_id = s.id
      ${whereClause}
    `, params)

    const totalDuration = parseFloat(durationResult[0]?.total_duration?.toString() || '0')

    // 3. Average response time
    const avgTimeResult = await executeQuery<{ avg_time: number }>(`
      SELECT COALESCE(AVG(response_time_ms), 0) as avg_time
      FROM teacher_voice_interactions tvi
      JOIN students s ON tvi.student_id = s.id
      ${whereClause}
    `, params)

    const avgResponseTime = parseFloat(avgTimeResult[0]?.avg_time?.toString() || '0')

    // 4. Cache hit rate
    const cacheResult = await executeQuery<{ cached: number; total: number }>(`
      SELECT
        SUM(CASE WHEN tts_cached = true THEN 1 ELSE 0 END) as cached,
        COUNT(*) as total
      FROM teacher_voice_interactions tvi
      JOIN students s ON tvi.student_id = s.id
      ${whereClause}
    `, params)

    const cached = parseInt(cacheResult[0]?.cached?.toString() || '0')
    const total = parseInt(cacheResult[0]?.total?.toString() || '0')
    const cacheHitRate = total > 0 ? (cached / total) * 100 : 0

    // 5. Interactions by type
    const typeResult = await executeQuery<{ interaction_type: string; count: number }>(`
      SELECT interaction_type, COUNT(*) as count
      FROM teacher_voice_interactions tvi
      JOIN students s ON tvi.student_id = s.id
      ${whereClause}
      GROUP BY interaction_type
    `, params)

    const interactionsByType = typeResult.reduce((acc: Record<string, number>, row) => {
      acc[row.interaction_type] = parseInt(row.count.toString())
      return acc
    }, {} as Record<string, number>)

    // 6. Interactions by day (last 30 days or date range)
    const dayResult = await executeQuery<{ date: string; count: number }>(`
      SELECT
        DATE(tvi.created_at) as date,
        COUNT(*) as count
      FROM teacher_voice_interactions tvi
      JOIN students s ON tvi.student_id = s.id
      ${whereClause}
      GROUP BY DATE(tvi.created_at)
      ORDER BY date DESC
      LIMIT 30
    `, params)

    const interactionsByDay = dayResult.map((row) => ({
      date: row.date,
      count: parseInt(row.count.toString()),
    }))

    // 7. Top students by interactions
    const topStudentsResult = await executeQuery<{
      student_id: string
      student_name: string
      interactions: number
    }>(`
      SELECT
        tvi.student_id,
        u.name as student_name,
        COUNT(*) as interactions
      FROM teacher_voice_interactions tvi
      JOIN students s ON tvi.student_id = s.id
      JOIN users u ON s.user_id = u.id
      ${whereClause}
      GROUP BY tvi.student_id, u.name
      ORDER BY interactions DESC
      LIMIT 10
    `, params)

    const topStudents = topStudentsResult.map((row) => ({
      studentId: row.student_id,
      studentName: row.student_name,
      interactions: parseInt(row.interactions.toString()),
    }))

    // 8. Voice usage breakdown
    const voiceResult = await executeQuery<{ voice_used: string; count: number }>(`
      SELECT voice_used, COUNT(*) as count
      FROM teacher_voice_interactions tvi
      JOIN students s ON tvi.student_id = s.id
      ${whereClause}
      GROUP BY voice_used
    `, params)

    const voiceUsageBreakdown = voiceResult.reduce((acc: Record<string, number>, row) => {
      acc[row.voice_used] = parseInt(row.count.toString())
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      data: {
        totalInteractions,
        totalDuration,
        avgResponseTime,
        cacheHitRate,
        interactionsByType,
        interactionsByDay,
        topStudents,
        voiceUsageBreakdown,
      },
    })

  } catch (error: any) {
    console.error('Error fetching voice usage analytics:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener analíticas' },
      { status: 500 }
    )
  }
}
