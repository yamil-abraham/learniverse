/**
 * API Route: Submit Activity Answer
 * POST /api/activities/submit
 *
 * Validates answer, calculates points, updates progress, awards badges
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { validateActivityCompletion } from '@/lib/activities/validator'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badges'
import {
  saveStudentAttempt,
  getStudentByUserId,
  updateStudentLevelAndExperience,
  awardBadge,
  getStudentAttempts,
  getActivityById
} from '@/lib/db/queries'
import type { MathActivityType, DifficultyLevel, Badge } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 403 }
      )
    }

    // Get student info
    const student = await getStudentByUserId(session.user.id)

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      activityId,
      answer,
      timeTaken,
      hintsUsed = 0
    } = body as {
      activityId: string | null
      answer: string
      timeTaken: number
      hintsUsed?: number
      // For dynamically generated activities without DB ID
      activityData?: {
        type: MathActivityType
        difficulty: DifficultyLevel
        correctAnswer: string
        points: number
        timeLimitSeconds: number
      }
    }

    // Validate required fields
    if (!answer || typeof timeTaken !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Datos incompletos' },
        { status: 400 }
      )
    }

    let activityType: MathActivityType
    let difficulty: DifficultyLevel
    let correctAnswer: string
    let basePoints: number
    let timeLimit: number
    let finalActivityId: string | null = activityId

    // Get activity details
    if (activityId) {
      // Activity from database
      const activity = await getActivityById(activityId)

      if (!activity) {
        return NextResponse.json(
          { success: false, message: 'Actividad no encontrada' },
          { status: 404 }
        )
      }

      activityType = activity.type as MathActivityType
      difficulty = activity.difficulty as DifficultyLevel
      correctAnswer = activity.correct_answer
      basePoints = activity.points
      timeLimit = activity.time_limit_seconds
    } else if (body.activityData) {
      // Dynamically generated activity
      activityType = body.activityData.type
      difficulty = body.activityData.difficulty
      correctAnswer = body.activityData.correctAnswer
      basePoints = body.activityData.points
      timeLimit = body.activityData.timeLimitSeconds
      finalActivityId = null // No DB record
    } else {
      return NextResponse.json(
        { success: false, message: 'Actividad no especificada' },
        { status: 400 }
      )
    }

    // Validate answer and calculate points
    const validation = validateActivityCompletion(
      correctAnswer,
      answer,
      activityType,
      difficulty,
      basePoints,
      timeTaken,
      timeLimit,
      hintsUsed,
      student.level,
      student.experience
    )

    // Save attempt to database (only if we have an activity ID)
    let attemptId: string | null = null

    if (finalActivityId) {
      try {
        const attempt = await saveStudentAttempt(
          student.id,
          finalActivityId,
          answer,
          validation.isCorrect,
          timeTaken,
          hintsUsed,
          validation.pointsEarned
        )
        attemptId = attempt.id
      } catch (error) {
        console.error('Failed to save attempt:', error)
        // Continue anyway - don't fail the request
      }
    }

    // Update student level and experience
    const newExperience = student.experience + validation.experienceEarned
    const newLevel = validation.shouldLevelUp ? validation.newLevel! : student.level

    try {
      await updateStudentLevelAndExperience(student.id, newLevel, newExperience)
    } catch (error) {
      console.error('Failed to update student progress:', error)
      // Continue anyway
    }

    // Check and award badges
    const newBadges: Badge[] = []

    try {
      // Get all student attempts for badge checking
      const allAttempts = await getStudentAttempts(student.id, 100)

      // Check for first correct answer badge
      if (validation.isCorrect && allAttempts.length === 1) {
        const badge = await awardBadge(
          student.id,
          'first_correct',
          BADGE_DEFINITIONS.first_correct.name,
          BADGE_DEFINITIONS.first_correct.description
        )
        if (badge) {
          newBadges.push({
            id: badge.id,
            studentId: badge.student_id,
            badgeType: badge.badge_type as any,
            badgeName: badge.badge_name,
            badgeDescription: badge.badge_description || '',
            earnedAt: badge.earned_at
          })
        }
      }

      // Check for level up badge
      if (validation.shouldLevelUp) {
        const badge = await awardBadge(
          student.id,
          'level_up',
          BADGE_DEFINITIONS.level_up.name,
          BADGE_DEFINITIONS.level_up.description
        )
        if (badge) {
          newBadges.push({
            id: badge.id,
            studentId: badge.student_id,
            badgeType: badge.badge_type as any,
            badgeName: badge.badge_name,
            badgeDescription: badge.badge_description || '',
            earnedAt: badge.earned_at
          })
        }
      }

      // Check for speed demon badge (5 fast correct answers)
      if (validation.isCorrect && timeTaken < 30) {
        const fastAttempts = allAttempts.filter(
          a => a.is_correct && a.time_taken_seconds < 30
        )
        if (fastAttempts.length >= 5) {
          const badge = await awardBadge(
            student.id,
            'speed_demon',
            BADGE_DEFINITIONS.speed_demon.name,
            BADGE_DEFINITIONS.speed_demon.description
          )
          if (badge) {
            newBadges.push({
              id: badge.id,
              studentId: badge.student_id,
              badgeType: badge.badge_type as any,
              badgeName: badge.badge_name,
              badgeDescription: badge.badge_description || '',
              earnedAt: badge.earned_at
            })
          }
        }
      }

      // Check for perfect score badge (10 correct in a row)
      if (validation.isCorrect) {
        let streak = 1
        for (let i = 0; i < Math.min(allAttempts.length, 9); i++) {
          if (allAttempts[i].is_correct) {
            streak++
          } else {
            break
          }
        }

        if (streak >= 10) {
          const badge = await awardBadge(
            student.id,
            'perfect_score',
            BADGE_DEFINITIONS.perfect_score.name,
            BADGE_DEFINITIONS.perfect_score.description
          )
          if (badge) {
            newBadges.push({
              id: badge.id,
              studentId: badge.student_id,
              badgeType: badge.badge_type as any,
              badgeName: badge.badge_name,
              badgeDescription: badge.badge_description || '',
              earnedAt: badge.earned_at
            })
          }
        }
      }
    } catch (badgeError) {
      console.error('Error checking/awarding badges:', badgeError)
      // Continue anyway - badges are nice-to-have
    }

    // Return response
    return NextResponse.json({
      success: true,
      result: {
        isCorrect: validation.isCorrect,
        correctAnswer: validation.isCorrect ? undefined : correctAnswer,
        pointsEarned: validation.pointsEarned,
        experienceEarned: validation.experienceEarned,
        feedback: validation.feedback,
        levelUp: validation.shouldLevelUp,
        newLevel: validation.shouldLevelUp ? validation.newLevel : undefined,
        currentLevel: newLevel,
        currentExperience: newExperience,
        badgesEarned: newBadges,
        attemptId
      }
    })

  } catch (error) {
    console.error('Error submitting activity:', error)
    return NextResponse.json(
      { success: false, message: 'Error al enviar respuesta' },
      { status: 500 }
    )
  }
}
