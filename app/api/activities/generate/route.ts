/**
 * API Route: Generate Activity
 * POST /api/activities/generate
 *
 * Generates a random math activity or retrieves from database
 * Updated: Fixed JSONB parsing issue
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { generateActivity } from '@/lib/activities/generator'
import { getRandomActivity, createActivity } from '@/lib/db/queries'
import type { MathActivityType, DifficultyLevel } from '@/types'

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

    // Parse request body
    const body = await request.json()
    const { type, difficulty, useDatabase = true } = body as {
      type: MathActivityType
      difficulty: DifficultyLevel
      useDatabase?: boolean
    }

    // Validate input
    const validTypes: MathActivityType[] = ['addition', 'subtraction', 'multiplication', 'division', 'fractions']
    const validDifficulties: DifficultyLevel[] = ['easy', 'medium', 'hard']

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Tipo de actividad inválido' },
        { status: 400 }
      )
    }

    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { success: false, message: 'Nivel de dificultad inválido' },
        { status: 400 }
      )
    }

    // Try to get from database first (if enabled)
    if (useDatabase) {
      const dbActivity = await getRandomActivity(type, difficulty)

      if (dbActivity) {
        // JSONB fields are already parsed by Vercel Postgres
        const activity = {
          id: dbActivity.id,
          type: dbActivity.type as MathActivityType,
          difficulty: dbActivity.difficulty as DifficultyLevel,
          question: dbActivity.question,
          correctAnswer: dbActivity.correct_answer,
          options: dbActivity.options as string[] | undefined,
          explanation: dbActivity.explanation || undefined,
          hints: dbActivity.hints as string[] | undefined,
          points: dbActivity.points,
          timeLimitSeconds: dbActivity.time_limit_seconds,
          createdAt: dbActivity.created_at
        }

        return NextResponse.json({
          success: true,
          activity,
          source: 'database'
        })
      }
    }

    // Generate new activity
    const generatedActivity = generateActivity(type, difficulty)

    // Optionally save to database for future use
    if (useDatabase) {
      try {
        const saved = await createActivity(
          generatedActivity.type,
          generatedActivity.difficulty,
          generatedActivity.question,
          generatedActivity.correctAnswer,
          generatedActivity.points,
          generatedActivity.timeLimitSeconds,
          generatedActivity.options,
          generatedActivity.explanation,
          generatedActivity.hints
        )

        const activity = {
          id: saved.id,
          type: saved.type as MathActivityType,
          difficulty: saved.difficulty as DifficultyLevel,
          question: saved.question,
          correctAnswer: saved.correct_answer,
          options: saved.options as string[] | undefined,
          explanation: saved.explanation || undefined,
          hints: saved.hints as string[] | undefined,
          points: saved.points,
          timeLimitSeconds: saved.time_limit_seconds,
          createdAt: saved.created_at
        }

        return NextResponse.json({
          success: true,
          activity,
          source: 'generated-and-saved'
        })
      } catch (saveError) {
        // If save fails, still return generated activity
        console.error('Failed to save generated activity:', saveError)
      }
    }

    // Return generated activity without ID
    return NextResponse.json({
      success: true,
      activity: {
        ...generatedActivity,
        id: null,
        createdAt: new Date()
      },
      source: 'generated'
    })

  } catch (error) {
    console.error('Error generating activity:', error)
    return NextResponse.json(
      { success: false, message: 'Error al generar actividad' },
      { status: 500 }
    )
  }
}
