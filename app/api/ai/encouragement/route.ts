/**
 * AI Encouragement API Route
 * Phase 4 - Adaptive Learning System
 *
 * Generates personalized encouragement messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getStudentByUserId, getStudentLearningProfile } from '@/lib/db/queries'
import { generateEncouragement } from '@/lib/ai/openai-client'
import { saveAIFeedback } from '@/lib/db/queries'

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

    // Get learning profile for consecutive stats
    const profile = await getStudentLearningProfile(student.id)

    // Parse request body
    const body = await request.json()
    const {
      activityId,
      isCorrect
    } = body

    // Validate inputs
    if (!activityId || typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Generate AI encouragement
    const startTime = Date.now()
    const encouragement = await generateEncouragement({
      isCorrect,
      consecutiveCorrect: profile?.consecutive_correct || 0,
      consecutiveIncorrect: profile?.consecutive_incorrect || 0,
      studentName: session.user.name || 'Estudiante'
    })
    const generationTime = Date.now() - startTime

    // Save encouragement to database
    await saveAIFeedback(
      student.id,
      activityId,
      'encouragement',
      encouragement,
      undefined,
      undefined,
      'gpt-4o-mini',
      undefined,
      generationTime
    )

    return NextResponse.json({
      success: true,
      encouragement
    })

  } catch (error: any) {
    console.error('Error generating AI encouragement:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al generar mensaje de ánimo',
        error: error.message
      },
      { status: 500 }
    )
  }
}
