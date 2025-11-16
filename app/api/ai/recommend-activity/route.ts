/**
 * AI Activity Recommendation API
 * Recommends activity type and difficulty based on student's learning profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { executeQuery } from '@/lib/db/client'
import type { MathActivityType, DifficultyLevel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      // Guest mode: return default recommendation
      return NextResponse.json({
        success: true,
        recommendation: {
          type: 'addition' as MathActivityType,
          difficulty: 'easy' as DifficultyLevel,
          reason: 'Empecemos con sumas fáciles para practicar. ¡Puedes hacerlo! 🚀'
        }
      })
    }

    // Get student's recent performance
    const recentAttempts = await executeQuery<{
      activity_type: MathActivityType
      difficulty: DifficultyLevel
      is_correct: boolean
      created_at: Date
    }>(`
      SELECT
        a.type as activity_type,
        a.difficulty,
        sa.is_correct,
        sa.created_at
      FROM student_attempts sa
      JOIN activities a ON sa.activity_id = a.id
      WHERE sa.student_id = $1
      ORDER BY sa.created_at DESC
      LIMIT 10
    `, [session.user.id])

    // If no history, return default
    if (recentAttempts.length === 0) {
      return NextResponse.json({
        success: true,
        recommendation: {
          type: 'addition' as MathActivityType,
          difficulty: 'easy' as DifficultyLevel,
          reason: '¡Bienvenido! Comencemos con sumas fáciles para conocer tu nivel. 🎯'
        }
      })
    }

    // Analyze performance by type and difficulty
    const performance = {
      addition: { easy: 0, medium: 0, hard: 0, total: 0, correct: 0 },
      subtraction: { easy: 0, medium: 0, hard: 0, total: 0, correct: 0 },
      multiplication: { easy: 0, medium: 0, hard: 0, total: 0, correct: 0 },
      division: { easy: 0, medium: 0, hard: 0, total: 0, correct: 0 },
      fractions: { easy: 0, medium: 0, hard: 0, total: 0, correct: 0 },
    }

    recentAttempts.forEach((attempt) => {
      const typeData = performance[attempt.activity_type as MathActivityType]
      if (typeData) {
        typeData.total++
        if (attempt.is_correct) typeData.correct++
        typeData[attempt.difficulty as DifficultyLevel]++
      }
    })

    // Find weakest area (lowest success rate)
    let weakestType: MathActivityType = 'addition'
    let lowestRate = 1.0

    Object.entries(performance).forEach(([type, data]) => {
      if (data.total > 0) {
        const rate = data.correct / data.total
        if (rate < lowestRate) {
          lowestRate = rate
          weakestType = type as MathActivityType
        }
      }
    })

    // Determine difficulty based on recent success rate
    const recentSuccessRate = recentAttempts.filter((a) => a.is_correct).length / recentAttempts.length
    let recommendedDifficulty: DifficultyLevel

    if (recentSuccessRate >= 0.8) {
      recommendedDifficulty = 'hard'
    } else if (recentSuccessRate >= 0.5) {
      recommendedDifficulty = 'medium'
    } else {
      recommendedDifficulty = 'easy'
    }

    // Generate personalized reason
    const typeLabels = {
      addition: 'sumas',
      subtraction: 'restas',
      multiplication: 'multiplicación',
      division: 'división',
      fractions: 'fracciones',
    }

    const difficultyLabels = {
      easy: 'fáciles',
      medium: 'de nivel medio',
      hard: 'difíciles',
    }

    let reason = ''
    if (lowestRate < 0.6) {
      reason = `Veo que las ${typeLabels[weakestType]} necesitan más práctica. ¡Vamos a mejorar juntos! 💪`
    } else if (recentSuccessRate >= 0.8) {
      reason = `¡Excelente progreso! Estás listo para un desafío más difícil. 🌟`
    } else {
      reason = `Practiquemos ${typeLabels[weakestType]} ${difficultyLabels[recommendedDifficulty]} para fortalecer tus habilidades. 📚`
    }

    return NextResponse.json({
      success: true,
      recommendation: {
        type: weakestType,
        difficulty: recommendedDifficulty,
        reason,
      }
    })

  } catch (error) {
    console.error('❌ Error getting recommendation:', error)
    // Return default on error
    return NextResponse.json({
      success: true,
      recommendation: {
        type: 'addition' as MathActivityType,
        difficulty: 'medium' as DifficultyLevel,
        reason: 'Practiquemos sumas de nivel medio. ¡Tú puedes! 🎓'
      }
    })
  }
}
