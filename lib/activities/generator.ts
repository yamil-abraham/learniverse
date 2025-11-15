/**
 * Activity Generator for Math Questions
 * Phase 3 - Learniverse
 *
 * Generates random math activities for:
 * - Addition
 * - Subtraction
 * - Multiplication
 * - Division
 * - Fractions
 */

import type { MathActivity, MathActivityType, DifficultyLevel } from '@/types'
import {
  shuffleArray,
  generateWrongOptions,
  randomInt,
  simplifyFraction,
  formatFraction,
  randomElement
} from './utils'

/**
 * Generate a random math activity based on type and difficulty
 */
export function generateActivity(
  type: MathActivityType,
  difficulty: DifficultyLevel
): Omit<MathActivity, 'id' | 'createdAt'> {
  switch (type) {
    case 'addition':
      return generateAdditionActivity(difficulty)
    case 'subtraction':
      return generateSubtractionActivity(difficulty)
    case 'multiplication':
      return generateMultiplicationActivity(difficulty)
    case 'division':
      return generateDivisionActivity(difficulty)
    case 'fractions':
      return generateFractionsActivity(difficulty)
    default:
      throw new Error(`Unknown activity type: ${type}`)
  }
}

/**
 * Generate Addition Activity
 */
export function generateAdditionActivity(difficulty: DifficultyLevel): Omit<MathActivity, 'id' | 'createdAt'> {
  let num1: number, num2: number, points: number

  switch (difficulty) {
    case 'easy':
      num1 = randomInt(1, 10)
      num2 = randomInt(1, 10)
      points = 10
      break
    case 'medium':
      num1 = randomInt(10, 50)
      num2 = randomInt(10, 50)
      points = 15
      break
    case 'hard':
      num1 = randomInt(50, 100)
      num2 = randomInt(50, 100)
      points = 20
      break
  }

  const correctAnswer = (num1 + num2).toString()
  const wrongOptions = generateWrongOptions(correctAnswer, 3)
  const options = shuffleArray([correctAnswer, ...wrongOptions])

  return {
    type: 'addition',
    difficulty,
    question: `¿Cuánto es ${num1} + ${num2}?`,
    correctAnswer,
    options,
    explanation: `${num1} + ${num2} = ${correctAnswer}`,
    hints: [
      `Intenta sumar paso a paso`,
      `Suma primero ${num1} + ${Math.floor(num2 / 2)}, luego añade ${Math.ceil(num2 / 2)}`
    ],
    points,
    timeLimitSeconds: 60
  }
}

/**
 * Generate Subtraction Activity
 */
export function generateSubtractionActivity(difficulty: DifficultyLevel): Omit<MathActivity, 'id' | 'createdAt'> {
  let num1: number, num2: number, points: number

  switch (difficulty) {
    case 'easy':
      num1 = randomInt(6, 10) // Ensure num1 > num2 for positive results
      num2 = randomInt(1, 5)
      points = 10
      break
    case 'medium':
      num1 = randomInt(20, 50)
      num2 = randomInt(10, 30)
      points = 15
      break
    case 'hard':
      num1 = randomInt(70, 100)
      num2 = randomInt(40, 70)
      points = 20
      break
  }

  // Ensure num1 >= num2 for positive result
  if (num2 > num1) {
    [num1, num2] = [num2, num1]
  }

  const correctAnswer = (num1 - num2).toString()
  const wrongOptions = generateWrongOptions(correctAnswer, 3)
  const options = shuffleArray([correctAnswer, ...wrongOptions])

  return {
    type: 'subtraction',
    difficulty,
    question: `¿Cuánto es ${num1} - ${num2}?`,
    correctAnswer,
    options,
    explanation: `${num1} - ${num2} = ${correctAnswer}`,
    hints: [
      `Cuenta hacia atrás desde ${num1}`,
      `Piensa: ¿Qué número más ${num2} es igual a ${num1}?`
    ],
    points,
    timeLimitSeconds: 60
  }
}

/**
 * Generate Multiplication Activity
 */
export function generateMultiplicationActivity(difficulty: DifficultyLevel): Omit<MathActivity, 'id' | 'createdAt'> {
  let num1: number, num2: number, points: number

  switch (difficulty) {
    case 'easy':
      num1 = randomInt(2, 9)
      num2 = randomInt(2, 9)
      points = 10
      break
    case 'medium':
      num1 = randomInt(6, 12)
      num2 = randomInt(6, 12)
      points = 15
      break
    case 'hard':
      num1 = randomInt(11, 20)
      num2 = randomInt(11, 20)
      points = 20
      break
  }

  const correctAnswer = (num1 * num2).toString()
  const wrongOptions = generateWrongOptions(correctAnswer, 3)
  const options = shuffleArray([correctAnswer, ...wrongOptions])

  return {
    type: 'multiplication',
    difficulty,
    question: `¿Cuánto es ${num1} × ${num2}?`,
    correctAnswer,
    options,
    explanation: `${num1} × ${num2} = ${correctAnswer}`,
    hints: [
      `Suma ${num1} consigo mismo ${num2} veces`,
      `Recuerda las tablas de multiplicar`
    ],
    points,
    timeLimitSeconds: 60
  }
}

/**
 * Generate Division Activity
 */
export function generateDivisionActivity(difficulty: DifficultyLevel): Omit<MathActivity, 'id' | 'createdAt'> {
  let divisor: number, quotient: number, points: number

  switch (difficulty) {
    case 'easy':
      divisor = randomInt(2, 5)
      quotient = randomInt(2, 10)
      points = 10
      break
    case 'medium':
      divisor = randomInt(6, 10)
      quotient = randomInt(5, 12)
      points = 15
      break
    case 'hard':
      divisor = randomInt(8, 15)
      quotient = randomInt(6, 15)
      points = 20
      break
  }

  const dividend = divisor * quotient
  const correctAnswer = quotient.toString()
  const wrongOptions = generateWrongOptions(correctAnswer, 3)
  const options = shuffleArray([correctAnswer, ...wrongOptions])

  return {
    type: 'division',
    difficulty,
    question: `¿Cuánto es ${dividend} ÷ ${divisor}?`,
    correctAnswer,
    options,
    explanation: `${dividend} ÷ ${divisor} = ${correctAnswer} (porque ${divisor} × ${correctAnswer} = ${dividend})`,
    hints: [
      `Piensa: ¿Cuántas veces cabe ${divisor} en ${dividend}?`,
      `Es lo opuesto a la multiplicación: ${divisor} × ? = ${dividend}`
    ],
    points,
    timeLimitSeconds: 60
  }
}

/**
 * Generate Fractions Activity
 */
export function generateFractionsActivity(difficulty: DifficultyLevel): Omit<MathActivity, 'id' | 'createdAt'> {
  let points: number
  let num1Num: number, num1Den: number, num2Num: number, num2Den: number
  let operation: '+' | '-' = '+'

  switch (difficulty) {
    case 'easy':
      // Same denominator
      num1Den = randomElement([2, 3, 4, 5])
      num2Den = num1Den
      num1Num = randomInt(1, num1Den - 1)
      num2Num = randomInt(1, num2Den - 1)
      points = 10
      break
    case 'medium':
      // Different denominators (multiples)
      const baseDen = randomElement([2, 3, 4])
      num1Den = baseDen
      num2Den = baseDen * 2
      num1Num = randomInt(1, num1Den - 1)
      num2Num = randomInt(1, num2Den - 1)
      operation = randomElement(['+', '-'])
      points = 15
      break
    case 'hard':
      // Different denominators (not necessarily multiples)
      num1Den = randomInt(2, 6)
      num2Den = randomInt(2, 6)
      num1Num = randomInt(1, num1Den - 1)
      num2Num = randomInt(1, num2Den - 1)
      operation = randomElement(['+', '-'])
      points = 20
      break
  }

  // Calculate answer
  let resultNum: number, resultDen: number

  if (num1Den === num2Den) {
    // Same denominator
    resultDen = num1Den
    resultNum = operation === '+' ? num1Num + num2Num : num1Num - num2Num

    // Ensure positive result for subtraction
    if (resultNum < 0) {
      [num1Num, num2Num] = [num2Num, num1Num]
      resultNum = Math.abs(resultNum)
    }
  } else {
    // Different denominators - find common denominator
    resultDen = num1Den * num2Den
    const adj1 = num1Num * num2Den
    const adj2 = num2Num * num1Den
    resultNum = operation === '+' ? adj1 + adj2 : adj1 - adj2

    // Ensure positive result for subtraction
    if (resultNum < 0) {
      [num1Num, num2Num] = [num2Num, num1Num];
      [num1Den, num2Den] = [num2Den, num1Den]
      resultNum = Math.abs(resultNum)
    }
  }

  // Simplify the result
  const simplified = simplifyFraction(resultNum, resultDen)
  const correctAnswer = formatFraction(simplified.numerator, simplified.denominator)

  // Generate fraction strings
  const frac1 = formatFraction(num1Num, num1Den)
  const frac2 = formatFraction(num2Num, num2Den)

  // Generate wrong options (modify numerator or denominator slightly)
  const wrongOptions: string[] = []
  wrongOptions.push(formatFraction(simplified.numerator + 1, simplified.denominator))
  wrongOptions.push(formatFraction(simplified.numerator, simplified.denominator + 1))
  wrongOptions.push(formatFraction(resultNum, resultDen)) // unsimplified version (if different)

  // Remove duplicates and correct answer
  const uniqueWrong = Array.from(new Set(wrongOptions))
    .filter(opt => opt !== correctAnswer)
    .slice(0, 3)

  const options = shuffleArray([correctAnswer, ...uniqueWrong])

  return {
    type: 'fractions',
    difficulty,
    question: `¿Cuánto es ${frac1} ${operation} ${frac2}? (Simplifica tu respuesta)`,
    correctAnswer,
    options,
    explanation: `${frac1} ${operation} ${frac2} = ${correctAnswer}`,
    hints: [
      num1Den === num2Den
        ? `Los denominadores son iguales, suma o resta solo los numeradores`
        : `Encuentra un denominador común`,
      `Simplifica la fracción final si es posible`
    ],
    points,
    timeLimitSeconds: 90 // More time for fractions
  }
}
