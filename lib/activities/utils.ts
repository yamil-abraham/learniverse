/**
 * Utility Functions for Activity Generation
 * Phase 3 - Learniverse
 */

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Generate wrong options for multiple choice questions
 * @param correctAnswer The correct answer
 * @param count Number of wrong options to generate
 * @returns Array of wrong options
 */
export function generateWrongOptions(correctAnswer: string, count: number = 3): string[] {
  const correct = parseFloat(correctAnswer)
  const wrongOptions: Set<string> = new Set()

  while (wrongOptions.size < count) {
    // Strategy 1: Off by a small amount (±1 to ±5)
    const offset = Math.floor(Math.random() * 5) + 1
    const direction = Math.random() < 0.5 ? -1 : 1
    const option1 = (correct + (offset * direction)).toString()

    // Strategy 2: Off by a factor
    const factor = Math.random() < 0.5 ? 2 : 0.5
    const option2 = Math.round(correct * factor).toString()

    // Strategy 3: Common mistake (e.g., adding instead of multiplying)
    const option3 = (correct + Math.floor(Math.random() * 10) + 1).toString()

    // Add options if they're different from correct answer
    if (option1 !== correctAnswer && parseFloat(option1) > 0) {
      wrongOptions.add(option1)
    }
    if (option2 !== correctAnswer && parseFloat(option2) > 0 && wrongOptions.size < count) {
      wrongOptions.add(option2)
    }
    if (option3 !== correctAnswer && parseFloat(option3) > 0 && wrongOptions.size < count) {
      wrongOptions.add(option3)
    }
  }

  return Array.from(wrongOptions).slice(0, count)
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Get a random element from an array
 */
export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Generate Greatest Common Divisor (GCD)
 */
export function gcd(a: number, b: number): number {
  if (b === 0) return a
  return gcd(b, a % b)
}

/**
 * Simplify a fraction
 */
export function simplifyFraction(numerator: number, denominator: number): { numerator: number; denominator: number } {
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator))
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor
  }
}

/**
 * Format a fraction as a string
 */
export function formatFraction(numerator: number, denominator: number): string {
  if (denominator === 1) return numerator.toString()
  if (numerator === 0) return '0'
  return `${numerator}/${denominator}`
}

/**
 * Parse a fraction string to numbers
 */
export function parseFraction(fractionStr: string): { numerator: number; denominator: number } | null {
  if (!fractionStr.includes('/')) {
    const num = parseInt(fractionStr)
    return isNaN(num) ? null : { numerator: num, denominator: 1 }
  }

  const parts = fractionStr.split('/')
  if (parts.length !== 2) return null

  const numerator = parseInt(parts[0].trim())
  const denominator = parseInt(parts[1].trim())

  if (isNaN(numerator) || isNaN(denominator) || denominator === 0) return null

  return { numerator, denominator }
}

/**
 * Check if two fractions are equal
 */
export function fractionsEqual(frac1: string, frac2: string): boolean {
  const f1 = parseFraction(frac1)
  const f2 = parseFraction(frac2)

  if (!f1 || !f2) return false

  // Simplify both fractions and compare
  const simplified1 = simplifyFraction(f1.numerator, f1.denominator)
  const simplified2 = simplifyFraction(f2.numerator, f2.denominator)

  return simplified1.numerator === simplified2.numerator &&
         simplified1.denominator === simplified2.denominator
}

/**
 * Generate number word representations for word problems
 */
export const numberWords: Record<number, string> = {
  1: 'uno',
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
  6: 'seis',
  7: 'siete',
  8: 'ocho',
  9: 'nueve',
  10: 'diez',
  11: 'once',
  12: 'doce',
  13: 'trece',
  14: 'catorce',
  15: 'quince',
  16: 'dieciséis',
  17: 'diecisiete',
  18: 'dieciocho',
  19: 'diecinueve',
  20: 'veinte'
}

/**
 * Convert number to word (Spanish)
 */
export function numberToWord(num: number): string {
  if (num <= 20) {
    return numberWords[num] || num.toString()
  }
  return num.toString()
}
