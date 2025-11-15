/**
 * Points Calculation System
 * Phase 3 - Learniverse
 */

import type { DifficultyLevel } from '@/types'

/**
 * Base points for each difficulty level
 */
export const BASE_POINTS: Record<DifficultyLevel, number> = {
  easy: 10,
  medium: 15,
  hard: 20
}

/**
 * Calculate total points for an attempt
 * Includes bonuses and penalties
 */
export function calculatePointsForAttempt(
  isCorrect: boolean,
  basePoints: number,
  timeTaken: number,
  timeLimit: number,
  hintsUsed: number,
  difficulty: DifficultyLevel
): number {
  if (!isCorrect) {
    return 0
  }

  let points = basePoints

  // Time bonus (up to 50% more)
  const timeRatio = timeTaken / timeLimit

  if (timeRatio < 0.25) {
    points *= 1.5 // 50% bonus for ultra fast (< 25% of time)
  } else if (timeRatio < 0.5) {
    points *= 1.3 // 30% bonus for very fast (< 50% of time)
  } else if (timeRatio < 0.75) {
    points *= 1.15 // 15% bonus for fast (< 75% of time)
  }

  // Hint penalty (20% reduction per hint used)
  if (hintsUsed > 0) {
    points *= Math.pow(0.8, hintsUsed)
  }

  // Difficulty multiplier
  const difficultyMultiplier: Record<DifficultyLevel, number> = {
    easy: 1.0,
    medium: 1.2,
    hard: 1.5
  }

  points *= difficultyMultiplier[difficulty]

  // Round to nearest integer
  return Math.round(points)
}

/**
 * Calculate streak bonus
 * Rewards students for consecutive correct answers
 */
export function calculateStreakBonus(streakCount: number): number {
  if (streakCount < 3) return 0
  if (streakCount < 5) return 5
  if (streakCount < 10) return 10
  if (streakCount < 20) return 20
  return 50
}

/**
 * Calculate perfect score bonus
 * Awarded when all questions in a session are correct
 */
export function calculatePerfectScoreBonus(
  totalQuestions: number,
  correctAnswers: number
): number {
  if (totalQuestions === 0) return 0
  if (correctAnswers === totalQuestions && totalQuestions >= 5) {
    return totalQuestions * 10 // 10 points per question for perfect score
  }
  return 0
}

/**
 * Calculate total session points
 * Includes all bonuses
 */
export interface SessionPoints {
  basePoints: number
  timeBonus: number
  streakBonus: number
  perfectBonus: number
  totalPoints: number
}

export function calculateSessionPoints(
  questionPoints: number[],
  streakCount: number,
  totalQuestions: number,
  correctAnswers: number
): SessionPoints {
  const basePoints = questionPoints.reduce((sum, p) => sum + p, 0)
  const timeBonus = 0 // Time bonus already included in questionPoints
  const streakBonus = calculateStreakBonus(streakCount)
  const perfectBonus = calculatePerfectScoreBonus(totalQuestions, correctAnswers)

  return {
    basePoints,
    timeBonus,
    streakBonus,
    perfectBonus,
    totalPoints: basePoints + streakBonus + perfectBonus
  }
}

/**
 * Get points breakdown message
 */
export function getPointsBreakdown(session: SessionPoints): string {
  let message = `Puntos Base: ${session.basePoints}`

  if (session.streakBonus > 0) {
    message += `\nBono de Racha: +${session.streakBonus}`
  }

  if (session.perfectBonus > 0) {
    message += `\n¡Puntuación Perfecta!: +${session.perfectBonus}`
  }

  message += `\n\nTotal: ${session.totalPoints} puntos`

  return message
}
