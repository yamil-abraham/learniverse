/**
 * AI Adaptive Recommendation API Route
 * Phase 4 - Adaptive Learning System
 *
 * Recommends next activity based on student performance
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import {
  getStudentByUserId,
  getAllActivityTypesPerformance,
  saveAdaptiveRecommendation
} from '@/lib/db/queries'
import { recommendNextActivityType } from '@/lib/ai/difficulty-adapter'
import type { ActivityTypePerformance } from '@/types'

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

    // Get all activity types performance
    const performanceData = await getAllActivityTypesPerformance(student.id) as ActivityTypePerformance

    // Get recommendation using adaptive algorithm
    const recommendation = recommendNextActivityType(performanceData)

    // Save recommendation to database
    await saveAdaptiveRecommendation(
      student.id,
      recommendation.activityType,
      recommendation.difficulty,
      recommendation.reason,
      recommendation.confidence
    )

    return NextResponse.json({
      success: true,
      recommendation: {
        activityType: recommendation.activityType,
        difficulty: recommendation.difficulty,
        reason: recommendation.reason,
        confidence: recommendation.confidence
      }
    })

  } catch (error: any) {
    console.error('Error generating recommendation:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al generar recomendación',
        error: error.message
      },
      { status: 500 }
    )
  }
}
