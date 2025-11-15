/**
 * AI Mistake Analysis API Route
 * Phase 4 - Adaptive Learning System
 *
 * Analyzes mistake patterns using AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getStudentByUserId, getStudentLearningProfile, updateLearningProfile } from '@/lib/db/queries'
import { analyzeMistakePattern } from '@/lib/ai/openai-client'
import type { MathActivityType } from '@/types'

export const dynamic = 'force-dynamic'

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
      question,
      correctAnswer,
      studentAnswer,
      activityType
    } = body

    // Validate inputs
    if (!question || !correctAnswer || !studentAnswer || !activityType) {
      return NextResponse.json(
        { success: false, message: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Analyze mistake using AI
    const analysis = await analyzeMistakePattern({
      question,
      correctAnswer,
      studentAnswer,
      activityType: activityType as MathActivityType
    })

    // Get current profile
    const profile = await getStudentLearningProfile(student.id)
    if (profile) {
      // Add mistake pattern to profile if not already present
      const currentPatterns = profile.common_mistake_patterns as string[] || []

      if (!currentPatterns.includes(analysis.mistakeType)) {
        const updatedPatterns = [...currentPatterns, analysis.mistakeType].slice(-10) // Keep last 10

        await updateLearningProfile(student.id, {
          common_mistake_patterns: updatedPatterns as any
        })
      }
    }

    return NextResponse.json({
      success: true,
      analysis: {
        mistakeType: analysis.mistakeType,
        suggestion: analysis.suggestion
      }
    })

  } catch (error: any) {
    console.error('Error analyzing mistake:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al analizar error',
        error: error.message
      },
      { status: 500 }
    )
  }
}
