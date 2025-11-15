/**
 * Level System
 * Phase 3 - Learniverse
 */

/**
 * Calculate level from experience points
 * Formula: Level = floor(sqrt(experience / 100)) + 1
 */
export function calculateLevel(experience: number): number {
  if (experience < 0) return 1
  return Math.floor(Math.sqrt(experience / 100)) + 1
}

/**
 * Calculate experience required for a specific level
 */
export function getExperienceForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.pow(level - 1, 2) * 100
}

/**
 * Calculate experience required for next level
 */
export function getExperienceForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100
}

/**
 * Calculate progress percentage towards next level
 */
export function getExperienceProgress(
  currentExp: number,
  currentLevel: number
): number {
  const currentLevelExp = getExperienceForLevel(currentLevel)
  const nextLevelExp = getExperienceForNextLevel(currentLevel)
  const progress = ((currentExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
  return Math.min(Math.max(progress, 0), 100)
}

/**
 * Get level information
 */
export interface LevelInfo {
  level: number
  currentExp: number
  expForCurrentLevel: number
  expForNextLevel: number
  expNeeded: number
  progressPercent: number
}

export function getLevelInfo(experience: number): LevelInfo {
  const level = calculateLevel(experience)
  const expForCurrentLevel = getExperienceForLevel(level)
  const expForNextLevel = getExperienceForNextLevel(level)
  const expNeeded = expForNextLevel - experience
  const progressPercent = getExperienceProgress(experience, level)

  return {
    level,
    currentExp: experience,
    expForCurrentLevel,
    expForNextLevel,
    expNeeded,
    progressPercent
  }
}

/**
 * Get level title/name
 */
export function getLevelTitle(level: number): string {
  if (level >= 50) return 'Maestro Matemático'
  if (level >= 40) return 'Experto'
  if (level >= 30) return 'Avanzado'
  if (level >= 20) return 'Competente'
  if (level >= 10) return 'Aprendiz'
  if (level >= 5) return 'Principiante'
  return 'Novato'
}
