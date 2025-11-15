/**
 * AI Hint API Route
 * Phase 4 - Adaptive Learning System
 *
 * Generates progressive hints (3 levels)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getStudentByUserId } from '@/lib/db/queries'
import { generateHint } from '@/lib/ai/openai-client'
import { saveAIFeedback } from '@/lib/db/queries'
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
      activityId,
      question,
      correctAnswer,
      activityType,
      hintLevel // 1, 2, or 3
    } = body

    // Validate inputs
    if (!activityId || !question || !correctAnswer || !activityType || !hintLevel) {
      return NextResponse.json(
        { success: false, message: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Validate hint level
    if (hintLevel < 1 || hintLevel > 3) {
      return NextResponse.json(
        { success: false, message: 'Nivel de pista inválido (1-3)' },
        { status: 400 }
      )
    }

    // Generate AI hint
    const startTime = Date.now()
    const hint = await generateHint({
      question,
      correctAnswer,
      hintLevel: hintLevel as 1 | 2 | 3,
      activityType: activityType as MathActivityType
    })
    const generationTime = Date.now() - startTime

    // Save hint to database
    await saveAIFeedback(
      student.id,
      activityId,
      'hint',
      hint,
      undefined,
      undefined,
      'gpt-4o-mini',
      undefined,
      generationTime
    )

    return NextResponse.json({
      success: true,
      hint,
      hintLevel
    })

  } catch (error: any) {
    console.error('Error generating AI hint:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al generar pista',
        error: error.message
      },
      { status: 500 }
    )
  }
}
