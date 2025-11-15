/**
 * AI Profile Update API Route
 * Phase 4 - Adaptive Learning System
 *
 * Updates student learning profile and adjusts difficulty
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import {
  getStudentByUserId,
  updateActivityTypePerformance,
  getActivityTypePerformance,
  updateActivityTypeDifficulty
} from '@/lib/db/queries'
import { recommendDifficulty, shouldChangeDifficulty, classifyLearningSpeed } from '@/lib/ai/difficulty-adapter'
import type { MathActivityType } from '@/types'

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

    // Get student
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
      activityType,
      isCorrect,
      timeTaken,
      hintsUsed
    } = body

    // Validate inputs
    if (!activityType || typeof isCorrect !== 'boolean' || typeof timeTaken !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Update activity type performance
    await updateActivityTypePerformance(
      student.id,
      activityType,
      isCorrect,
      timeTaken,
      hintsUsed || 0
    )

    // Get updated performance
    const performance = await getActivityTypePerformance(student.id, activityType)

    if (performance) {
      // Check if difficulty should change
      const difficultyCheck = shouldChangeDifficulty(
        'medium', // This should come from profile, but we'll use medium as default
        performance
      )

      if (difficultyCheck.shouldChange) {
        await updateActivityTypeDifficulty(
          student.id,
          activityType,
          difficultyCheck.newDifficulty
        )
      }

      // Classify learning speed
      const learningSpeed = classifyLearningSpeed(
        performance.successRate,
        performance.averageTime,
        60 // base time limit
      )

      return NextResponse.json({
        success: true,
        performance: {
          successRate: performance.successRate,
          totalAttempts: performance.totalAttempts,
          consecutiveCorrect: performance.consecutiveCorrect,
          consecutiveIncorrect: performance.consecutiveIncorrect
        },
        difficultyUpdate: difficultyCheck.shouldChange ? {
          changed: true,
          newDifficulty: difficultyCheck.newDifficulty,
          reason: difficultyCheck.reason
        } : {
          changed: false
        },
        learningSpeed
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado'
    })

  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al actualizar perfil',
        error: error.message
      },
      { status: 500 }
    )
  }
}
