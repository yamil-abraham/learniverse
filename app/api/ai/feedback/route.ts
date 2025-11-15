/**
 * AI Feedback API Route
 * Phase 4 - Adaptive Learning System
 *
 * Generates personalized explanations for incorrect answers
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getStudentByUserId } from '@/lib/db/queries'
import { generateExplanation } from '@/lib/ai/openai-client'
import { saveAIFeedback } from '@/lib/db/queries'
import type { MathActivityType, DifficultyLevel } from '@/types'

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
      activityId,
      question,
      correctAnswer,
      studentAnswer,
      activityType,
      difficulty,
      attemptId
    } = body

    // Validate inputs
    if (!activityId || !question || !correctAnswer || !studentAnswer || !activityType) {
      return NextResponse.json(
        { success: false, message: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Generate AI explanation
    const startTime = Date.now()
    const feedback = await generateExplanation({
      question,
      correctAnswer,
      studentAnswer,
      activityType: activityType as MathActivityType,
      difficulty: (difficulty || 'easy') as DifficultyLevel
    })
    const generationTime = Date.now() - startTime

    // Save feedback to database
    await saveAIFeedback(
      student.id,
      activityId,
      'explanation',
      feedback,
      attemptId,
      studentAnswer,
      'gpt-4o-mini',
      undefined, // tokens not tracked for simplicity
      generationTime
    )

    return NextResponse.json({
      success: true,
      feedback
    })

  } catch (error: any) {
    console.error('Error generating AI feedback:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al generar feedback',
        error: error.message
      },
      { status: 500 }
    )
  }
}
