/**
 * Badge System
 * Phase 3 - Learniverse
 */

import type { BadgeType, StudentAttempt } from '@/types'

/**
 * Badge definitions with metadata
 */
export const BADGE_DEFINITIONS: Record<BadgeType, {
  name: string
  description: string
  icon: string
}> = {
  first_correct: {
    name: 'Primera Victoria',
    description: '¡Respondiste tu primera pregunta correctamente!',
    icon: '🎯'
  },
  speed_demon: {
    name: 'Rayo Veloz',
    description: 'Respondiste 5 preguntas en menos de 30 segundos cada una',
    icon: '⚡'
  },
  persistent: {
    name: 'Nunca Te Rindas',
    description: 'Intentaste la misma pregunta 3 veces hasta acertar',
    icon: '💪'
  },
  perfect_score: {
    name: 'Puntuación Perfecta',
    description: 'Acertaste 10 preguntas seguidas',
    icon: '🌟'
  },
  level_up: {
    name: '¡Subiste de Nivel!',
    description: 'Alcanzaste un nuevo nivel',
    icon: '🚀'
  },
  master_addition: {
    name: 'Maestro de Suma',
    description: 'Completaste 20 actividades de suma correctamente',
    icon: '➕'
  },
  master_subtraction: {
    name: 'Maestro de Resta',
    description: 'Completaste 20 actividades de resta correctamente',
    icon: '➖'
  },
  master_multiplication: {
    name: 'Maestro de Multiplicación',
    description: 'Completaste 20 actividades de multiplicación correctamente',
    icon: '✖️'
  },
  master_division: {
    name: 'Maestro de División',
    description: 'Completaste 20 actividades de división correctamente',
    icon: '➗'
  },
  master_fractions: {
    name: 'Maestro de Fracciones',
    description: 'Completaste 20 actividades de fracciones correctamente',
    icon: '🍕'
  }
}

/**
 * Check which badges should be awarded based on attempts
 */
export async function checkBadgeConditions(
  studentId: string,
  allAttempts: StudentAttempt[],
  existingBadges: BadgeType[]
): Promise<BadgeType[]> {
  const newBadges: BadgeType[] = []

  // first_correct: First correct answer
  if (!existingBadges.includes('first_correct')) {
    const hasCorrectAnswer = allAttempts.some(a => a.isCorrect)
    if (hasCorrectAnswer) {
      newBadges.push('first_correct')
    }
  }

  // speed_demon: 5 fast correct answers
  if (!existingBadges.includes('speed_demon')) {
    const fastCorrect = allAttempts.filter(a => a.isCorrect && a.timeTakenSeconds < 30)
    if (fastCorrect.length >= 5) {
      newBadges.push('speed_demon')
    }
  }

  // perfect_score: 10 correct in a row
  if (!existingBadges.includes('perfect_score')) {
    let streak = 0
    let maxStreak = 0

    const sortedAttempts = [...allAttempts].sort((a, b) =>
      new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime()
    )

    for (const attempt of sortedAttempts) {
      if (attempt.isCorrect) {
        streak++
        maxStreak = Math.max(maxStreak, streak)
      } else {
        streak = 0
      }
    }

    if (maxStreak >= 10) {
      newBadges.push('perfect_score')
    }
  }

  // Master badges: 20 correct of each type
  const masteryBadges: Array<{ badge: BadgeType; type: string }> = [
    { badge: 'master_addition', type: 'addition' },
    { badge: 'master_subtraction', type: 'subtraction' },
    { badge: 'master_multiplication', type: 'multiplication' },
    { badge: 'master_division', type: 'division' },
    { badge: 'master_fractions', type: 'fractions' }
  ]

  for (const { badge, type } of masteryBadges) {
    if (!existingBadges.includes(badge) && !newBadges.includes(badge)) {
      // Note: This requires activity type info, which we'd need to join from activities table
      // For now, this is a placeholder - the actual implementation would be in the database query
      // or we'd need to pass activity types with attempts
    }
  }

  return newBadges
}

/**
 * Get badge info by type
 */
export function getBadgeInfo(badgeType: BadgeType) {
  return BADGE_DEFINITIONS[badgeType]
}

/**
 * Get all badge types
 */
export function getAllBadgeTypes(): BadgeType[] {
  return Object.keys(BADGE_DEFINITIONS) as BadgeType[]
}

/**
 * Calculate badge completion percentage
 */
export function getBadgeProgress(earnedBadges: BadgeType[]): number {
  const totalBadges = getAllBadgeTypes().length
  return (earnedBadges.length / totalBadges) * 100
}
