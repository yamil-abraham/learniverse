/**
 * API Route: Get Student Stats
 * GET /api/stats/student?studentId=xxx
 *
 * Returns comprehensive game statistics for a student
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import {
  getStudentGameStats,
  getStudentBadges,
  getStudentByUserId,
  getStudentById
} from '@/lib/db/queries'
import { getLevelInfo } from '@/lib/gamification/levels'
import type { GameStats } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 403 }
      )
    }

    // Get student ID from query or session
    const { searchParams } = new URL(request.url)
    const requestedStudentId = searchParams.get('studentId')

    // Verify student belongs to authenticated user
    const student = await getStudentByUserId(session.user.id)

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    // Security check: student can only view their own stats
    if (requestedStudentId && requestedStudentId !== student.id) {
      return NextResponse.json(
        { success: false, message: 'No autorizado para ver estos datos' },
        { status: 403 }
      )
    }

    // Get comprehensive stats from database
    const dbStats = await getStudentGameStats(student.id)

    if (!dbStats) {
      return NextResponse.json(
        { success: false, message: 'No se pudieron obtener las estadísticas' },
        { status: 500 }
      )
    }

    // Get badges
    const badges = await getStudentBadges(student.id)

    // Get current student data for fresh level/experience
    const currentStudent = await getStudentById(student.id)

    if (!currentStudent) {
      return NextResponse.json(
        { success: false, message: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    // Get level information
    const levelInfo = getLevelInfo(currentStudent.experience)

    // Calculate streak (simplified - would need daily tracking in production)
    const streakDays = 0 // TODO: Implement daily streak tracking

    // Build response
    const stats: GameStats = {
      level: currentStudent.level,
      experience: currentStudent.experience,
      totalPoints: parseInt(dbStats.total_points) || 0,
      correctAnswers: parseInt(dbStats.correct_answers) || 0,
      incorrectAnswers: parseInt(dbStats.incorrect_answers) || 0,
      totalAttempts: parseInt(dbStats.total_attempts) || 0,
      averageTimeSeconds: parseFloat(dbStats.average_time_seconds) || 0,
      streakDays,
      badges: badges.map(b => ({
        id: b.id,
        studentId: b.student_id,
        badgeType: b.badge_type as any,
        badgeName: b.badge_name,
        badgeDescription: b.badge_description || '',
        earnedAt: b.earned_at
      })),
      attemptsByType: {
        addition: 0,
        subtraction: 0,
        multiplication: 0,
        division: 0,
        fractions: 0
      }
    }

    // Return stats with level details
    return NextResponse.json({
      success: true,
      stats,
      levelInfo: {
        level: levelInfo.level,
        currentExp: levelInfo.currentExp,
        expForNextLevel: levelInfo.expForNextLevel,
        expNeeded: levelInfo.expNeeded,
        progressPercent: levelInfo.progressPercent
      }
    })

  } catch (error) {
    console.error('Error fetching student stats:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
