/**
 * Activity Validator
 * Phase 3 - Learniverse
 *
 * Validates student answers and calculates points
 */

import type { MathActivityType, DifficultyLevel } from '@/types'
import { fractionsEqual } from './utils'

/**
 * Validate if an answer is correct
 */
export function validateAnswer(
  correctAnswer: string,
  givenAnswer: string,
  type: MathActivityType
): boolean {
  // Normalize inputs
  const correct = correctAnswer.trim().toLowerCase()
  const given = givenAnswer.trim().toLowerCase()

  // Exact match for most types
  if (type !== 'fractions') {
    return correct === given
  }

  // Special handling for fractions
  return fractionsEqual(correct, given)
}

/**
 * Check if answer is close enough for partial credit
 */
export function isAnswerClose(
  correctAnswer: string,
  givenAnswer: string,
  tolerance: number = 0
): boolean {
  const correct = parseFloat(correctAnswer)
  const given = parseFloat(givenAnswer)

  if (isNaN(correct) || isNaN(given)) {
    return false
  }

  return Math.abs(correct - given) <= tolerance
}

/**
 * Calculate points earned for an attempt
 * Considers difficulty, time taken, and hints used
 */
export function calculatePoints(
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

  // Time bonus (up to 50% more for very fast answers)
  const timeRatio = timeTaken / timeLimit

  if (timeRatio < 0.25) {
    points *= 1.5 // 50% bonus for super fast (< 25% of time)
  } else if (timeRatio < 0.5) {
    points *= 1.3 // 30% bonus for fast (< 50% of time)
  } else if (timeRatio < 0.75) {
    points *= 1.15 // 15% bonus for moderately fast (< 75% of time)
  }

  // Hint penalty (20% reduction per hint)
  if (hintsUsed > 0) {
    points *= Math.pow(0.8, hintsUsed)
  }

  // Difficulty multiplier (already in basePoints, but can adjust further)
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
 * Calculate experience points earned
 * Experience helps level up students
 */
export function calculateExperience(
  pointsEarned: number,
  isCorrect: boolean
): number {
  if (!isCorrect) {
    // Small XP even for incorrect answers (encouragement)
    return 1
  }

  // XP is typically equal to points earned
  return pointsEarned
}

/**
 * Determine if student should level up based on XP
 */
export function checkLevelUp(
  currentLevel: number,
  currentExperience: number
): { shouldLevelUp: boolean; newLevel: number; xpForNextLevel: number } {
  // Level formula: XP required = level^2 * 100
  // Level 1 -> 2: 100 XP
  // Level 2 -> 3: 400 XP
  // Level 3 -> 4: 900 XP
  // etc.

  const xpForNextLevel = Math.pow(currentLevel, 2) * 100

  if (currentExperience >= xpForNextLevel) {
    return {
      shouldLevelUp: true,
      newLevel: currentLevel + 1,
      xpForNextLevel: Math.pow(currentLevel + 1, 2) * 100
    }
  }

  return {
    shouldLevelUp: false,
    newLevel: currentLevel,
    xpForNextLevel
  }
}

/**
 * Validate activity completion and return feedback
 */
export interface ValidationResult {
  isCorrect: boolean
  pointsEarned: number
  experienceEarned: number
  feedback: string
  shouldLevelUp: boolean
  newLevel?: number
}

export function validateActivityCompletion(
  correctAnswer: string,
  givenAnswer: string,
  type: MathActivityType,
  difficulty: DifficultyLevel,
  basePoints: number,
  timeTaken: number,
  timeLimit: number,
  hintsUsed: number,
  currentLevel: number,
  currentExperience: number
): ValidationResult {
  const isCorrect = validateAnswer(correctAnswer, givenAnswer, type)

  let feedback: string

  if (isCorrect) {
    const responses = [
      '¡Excelente trabajo! 🎉',
      '¡Correcto! Sigue así 🌟',
      '¡Muy bien! 👏',
      '¡Perfecto! 🎯',
      '¡Increíble! Eres un genio 🧠'
    ]
    feedback = responses[Math.floor(Math.random() * responses.length)]
  } else {
    feedback = `No es correcto. La respuesta correcta es: ${correctAnswer}`
  }

  const pointsEarned = calculatePoints(
    isCorrect,
    basePoints,
    timeTaken,
    timeLimit,
    hintsUsed,
    difficulty
  )

  const experienceEarned = calculateExperience(pointsEarned, isCorrect)
  const newTotalExperience = currentExperience + experienceEarned
  const levelCheck = checkLevelUp(currentLevel, newTotalExperience)

  return {
    isCorrect,
    pointsEarned,
    experienceEarned,
    feedback,
    shouldLevelUp: levelCheck.shouldLevelUp,
    newLevel: levelCheck.newLevel
  }
}
