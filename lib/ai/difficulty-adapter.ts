/**
 * Adaptive Difficulty Algorithm
 * Phase 4 - Adaptive Learning System
 *
 * Determines when students should move up/down in difficulty
 * and recommends next activities based on performance
 */

import type {
  MathActivityType,
  DifficultyLevel,
  PerformanceData,
  DifficultyRecommendation,
  ActivityTypePerformance
} from '@/types'
import { AI_CONFIG } from './config'

/**
 * Determine if student should move up, down, or stay at current difficulty
 */
export function recommendDifficulty(
  currentDifficulty: DifficultyLevel,
  performance: PerformanceData
): DifficultyLevel {
  const { totalAttempts, successRate, consecutiveCorrect, consecutiveIncorrect } = performance

  // Need minimum attempts before adjusting
  if (totalAttempts < AI_CONFIG.minAttemptsBeforeAdapt) {
    return currentDifficulty
  }

  // Move up if consistently performing well
  if (
    successRate >= AI_CONFIG.successRateThresholdUp &&
    consecutiveCorrect >= AI_CONFIG.consecutiveCorrectForLevelUp &&
    currentDifficulty !== 'hard'
  ) {
    console.log(`📈 Recommending difficulty increase: ${successRate * 100}% success rate, ${consecutiveCorrect} consecutive correct`)
    return currentDifficulty === 'easy' ? 'medium' : 'hard'
  }

  // Move down if struggling
  if (
    (successRate < AI_CONFIG.successRateThresholdDown ||
      consecutiveIncorrect >= AI_CONFIG.consecutiveIncorrectForLevelDown) &&
    currentDifficulty !== 'easy'
  ) {
    console.log(`📉 Recommending difficulty decrease: ${successRate * 100}% success rate, ${consecutiveIncorrect} consecutive incorrect`)
    return currentDifficulty === 'hard' ? 'medium' : 'easy'
  }

  // Stay at current level
  return currentDifficulty
}

/**
 * Calculate overall student skill level across all activity types
 */
export function calculateOverallSkillLevel(
  profileData: ActivityTypePerformance
): number {
  let totalScore = 0
  const activityTypes = Object.keys(profileData) as MathActivityType[]

  if (activityTypes.length === 0) return 1

  for (const type of activityTypes) {
    const data = profileData[type]
    let score = data.successRate // Base on success rate (0-100)

    // Weight by difficulty
    if (data.currentDifficulty === 'medium') score *= 1.5
    if (data.currentDifficulty === 'hard') score *= 2

    totalScore += score
  }

  const averageScore = totalScore / activityTypes.length

  // Return level 1-10
  return Math.min(10, Math.max(1, Math.round(averageScore / 20)))
}

/**
 * Recommend next activity type based on performance
 */
export function recommendNextActivityType(
  profileData: ActivityTypePerformance
): DifficultyRecommendation {
  const activityTypes: MathActivityType[] = [
    'addition',
    'subtraction',
    'multiplication',
    'division',
    'fractions'
  ]

  // Find activity with lowest success rate that needs practice
  let weakestType: MathActivityType = 'addition'
  let lowestRate = 100
  let weakestData = profileData[weakestType]

  for (const type of activityTypes) {
    const data = profileData[type]
    if (!data) continue

    if (data.attemptsCount > 3 && data.successRate < lowestRate) {
      lowestRate = data.successRate
      weakestType = type
      weakestData = data
    }
  }

  // If success rate is good everywhere (>60%), rotate through types
  if (lowestRate > 60) {
    // Find least practiced type
    let leastPracticed: MathActivityType = 'addition'
    let minAttempts = Infinity

    for (const type of activityTypes) {
      const data = profileData[type]
      if (!data) continue

      if (data.attemptsCount < minAttempts) {
        minAttempts = data.attemptsCount
        leastPracticed = type
      }
    }

    weakestType = leastPracticed
    weakestData = profileData[weakestType]
  }

  // Determine confidence
  const confidence = weakestData?.attemptsCount >= 5
    ? 0.8
    : weakestData?.attemptsCount >= 3
      ? 0.6
      : 0.4

  // Generate reason
  let reason = ''
  if (lowestRate < 60) {
    reason = `Necesitas más práctica en ${getActivityTypeName(weakestType)}. Tu tasa de éxito actual es ${lowestRate.toFixed(0)}%.`
  } else if (weakestData?.attemptsCount < 5) {
    reason = `Vamos a practicar más ${getActivityTypeName(weakestType)} para mejorar tus habilidades.`
  } else {
    reason = `¡Estás haciendo muy bien! Continuemos con ${getActivityTypeName(weakestType)}.`
  }

  return {
    activityType: weakestType,
    difficulty: weakestData?.currentDifficulty || 'easy',
    confidence,
    reason
  }
}

/**
 * Adaptive time limit based on student's average speed
 */
export function calculateAdaptiveTimeLimit(
  baseTimeLimit: number,
  studentAverageTime: number,
  difficulty: DifficultyLevel
): number {
  // Give students more time if they're slower on average
  let adjustedTime = baseTimeLimit

  if (studentAverageTime > baseTimeLimit * 1.5) {
    adjustedTime *= 1.3 // 30% more time
  } else if (studentAverageTime > baseTimeLimit) {
    adjustedTime *= 1.15 // 15% more time
  }

  // Adjust for difficulty
  const difficultyMultiplier: Record<DifficultyLevel, number> = {
    easy: 1,
    medium: 1.2,
    hard: 1.5
  }

  return Math.round(adjustedTime * difficultyMultiplier[difficulty])
}

/**
 * Classify learning speed
 */
export function classifyLearningSpeed(
  averageSuccessRate: number,
  averageTimePerQuestion: number,
  baseTimeLimit: number
): 'slow' | 'normal' | 'fast' {
  const speedRatio = averageTimePerQuestion / baseTimeLimit

  if (averageSuccessRate >= AI_CONFIG.fastLearnerThreshold && speedRatio < 0.7) {
    return 'fast'
  } else if (averageSuccessRate < AI_CONFIG.slowLearnerThreshold || speedRatio > 1.3) {
    return 'slow'
  } else {
    return 'normal'
  }
}

/**
 * Get activity type display name in Spanish
 */
function getActivityTypeName(type: MathActivityType): string {
  const names: Record<MathActivityType, string> = {
    addition: 'suma',
    subtraction: 'resta',
    multiplication: 'multiplicación',
    division: 'división',
    fractions: 'fracciones'
  }
  return names[type]
}

/**
 * Calculate confidence for a recommendation
 */
export function calculateRecommendationConfidence(
  attemptsCount: number,
  successRate: number
): number {
  // More attempts = more confidence
  let confidence = 0

  if (attemptsCount >= 20) confidence = 0.9
  else if (attemptsCount >= 10) confidence = 0.8
  else if (attemptsCount >= 5) confidence = 0.7
  else if (attemptsCount >= 3) confidence = 0.6
  else confidence = 0.4

  // Adjust based on success rate consistency
  if (successRate < 30 || successRate > 90) {
    confidence += 0.1 // Very clear signal
  }

  return Math.min(1.0, confidence)
}

/**
 * Determine if difficulty change is recommended
 */
export function shouldChangeDifficulty(
  currentDifficulty: DifficultyLevel,
  performance: PerformanceData
): {
  shouldChange: boolean
  newDifficulty: DifficultyLevel
  reason: string
} {
  const recommended = recommendDifficulty(currentDifficulty, performance)
  const shouldChange = recommended !== currentDifficulty

  let reason = ''
  if (shouldChange) {
    if (recommended > currentDifficulty) {
      reason = `¡Excelente trabajo! Estás listo para un desafío mayor. Pasando a nivel ${recommended}.`
    } else {
      reason = `Practiquemos un poco más en un nivel más cómodo. Ajustando a nivel ${recommended}.`
    }
  }

  return {
    shouldChange,
    newDifficulty: recommended,
    reason
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(performance: PerformanceData): string {
  const { successRate, totalAttempts, consecutiveCorrect, consecutiveIncorrect } = performance

  if (successRate >= 0.85) {
    return '¡Excelente! Estás dominando este tema.'
  } else if (successRate >= 0.70) {
    return 'Muy bien! Sigue así.'
  } else if (successRate >= 0.50) {
    return 'Buen progreso. Sigue practicando.'
  } else if (consecutiveIncorrect >= 3) {
    return 'No te rindas! Cada error es una oportunidad para aprender.'
  } else {
    return 'Sigue intentando! Tú puedes lograrlo.'
  }
}
