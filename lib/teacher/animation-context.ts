/**
 * Animation Context System
 * Determines appropriate animations based on conversation context
 */

import type { TeacherAnimationType } from '@/components/game/teacher/types'

/**
 * Conversation sentiment/type
 */
export type ConversationSentiment =
  | 'greeting'
  | 'explaining'
  | 'encouraging'
  | 'correcting'
  | 'celebrating'
  | 'sympathizing'
  | 'thinking'
  | 'pointing'
  | 'questioning'
  | 'idle'

/**
 * Map sentiment to animation
 */
export const SENTIMENT_TO_ANIMATION: Record<ConversationSentiment, TeacherAnimationType> = {
  greeting: 'TalkingOne',
  explaining: 'Explaining',
  encouraging: 'Happy',
  correcting: 'Thinking',
  celebrating: 'Happy',
  sympathizing: 'Sad',
  thinking: 'Thinking',
  pointing: 'Pointing',
  questioning: 'TalkingThree',
  idle: 'Idle',
}

/**
 * Keywords for sentiment detection
 */
const SENTIMENT_KEYWORDS: Record<ConversationSentiment, string[]> = {
  greeting: ['hola', 'buenos días', 'buenas tardes', 'bienvenido', 'encantado', 'mucho gusto'],
  explaining: ['porque', 'razón', 'explicación', 'significa', 'paso a paso', 'primero', 'segundo', 'luego'],
  encouraging: ['muy bien', 'excelente', 'genial', 'perfecto', 'bravo', 'sigue así', 'buen trabajo', 'magnífico'],
  correcting: ['no es correcto', 'intenta de nuevo', 'revisa', 'piensa de nuevo', 'recuerda', 'error'],
  celebrating: ['correcto', 'acertaste', 'lo lograste', 'conseguiste', '¡bien!', '🎉', '🎊'],
  sympathizing: ['no te preocupes', 'está bien', 'entiendo', 'tranquilo', 'sigue intentando'],
  thinking: ['hmm', 'déjame pensar', 'veamos', 'interesante', 'analicemos'],
  pointing: ['mira', 'observa', 'fíjate', 'aquí', 'allí', 'esto', 'eso', 'pizarra'],
  questioning: ['qué', 'cuánto', 'cómo', 'cuál', 'por qué', 'dónde'],
  idle: [],
}

/**
 * Detect sentiment from text
 */
export function detectSentiment(text: string): ConversationSentiment {
  const normalizedText = text.toLowerCase()

  // Check each sentiment's keywords
  for (const [sentiment, keywords] of Object.entries(SENTIMENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        return sentiment as ConversationSentiment
      }
    }
  }

  // Default to idle if no sentiment detected
  return 'idle'
}

/**
 * Get animation based on teacher response text
 */
export function getAnimationForResponse(responseText: string): TeacherAnimationType {
  const sentiment = detectSentiment(responseText)
  return SENTIMENT_TO_ANIMATION[sentiment] || 'TalkingOne'
}

/**
 * Get animation based on interaction type
 */
export function getAnimationForInteraction(interactionType: string): TeacherAnimationType {
  switch (interactionType) {
    case 'question':
      return 'TalkingThree'
    case 'hint':
      return 'Explaining'
    case 'explanation':
      return 'Explaining'
    case 'encouragement':
      return 'Happy'
    case 'correction':
      return 'Thinking'
    default:
      return 'TalkingOne'
  }
}

/**
 * Check if response should show whiteboard
 */
export function shouldShowWhiteboard(responseText: string): boolean {
  const whiteboardKeywords = [
    'pizarra',
    'mira',
    'observa',
    'dibuja',
    'suma',
    'resta',
    'multiplica',
    'divide',
    'paso a paso',
    'solución',
    'ejemplo',
  ]

  const normalizedText = responseText.toLowerCase()
  return whiteboardKeywords.some(keyword => normalizedText.includes(keyword))
}

/**
 * Extract math problem from response (if any)
 */
export function extractMathProblem(responseText: string): {
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions' | null
  operand1: number | null
  operand2: number | null
} | null {
  // Pattern for basic math operations
  const additionPattern = /(\d+)\s*\+\s*(\d+)/
  const subtractionPattern = /(\d+)\s*-\s*(\d+)/
  const multiplicationPattern = /(\d+)\s*[×x*]\s*(\d+)/
  const divisionPattern = /(\d+)\s*[÷/]\s*(\d+)/
  const fractionPattern = /(\d+)\s*\/\s*(\d+)/

  let match: RegExpMatchArray | null

  // Check addition
  match = responseText.match(additionPattern)
  if (match) {
    return {
      operation: 'addition',
      operand1: parseInt(match[1]),
      operand2: parseInt(match[2]),
    }
  }

  // Check subtraction
  match = responseText.match(subtractionPattern)
  if (match) {
    return {
      operation: 'subtraction',
      operand1: parseInt(match[1]),
      operand2: parseInt(match[2]),
    }
  }

  // Check multiplication
  match = responseText.match(multiplicationPattern)
  if (match) {
    return {
      operation: 'multiplication',
      operand1: parseInt(match[1]),
      operand2: parseInt(match[2]),
    }
  }

  // Check division
  match = responseText.match(divisionPattern)
  if (match) {
    return {
      operation: 'division',
      operand1: parseInt(match[1]),
      operand2: parseInt(match[2]),
    }
  }

  // Check fractions
  match = responseText.match(fractionPattern)
  if (match) {
    return {
      operation: 'fractions',
      operand1: parseInt(match[1]),
      operand2: parseInt(match[2]),
    }
  }

  return null
}

/**
 * Get recommended expression based on sentiment
 */
export function getExpressionForSentiment(sentiment: ConversationSentiment): string {
  const expressionMap: Record<ConversationSentiment, string> = {
    greeting: 'smile',
    explaining: 'default',
    encouraging: 'happy',
    correcting: 'thinking',
    celebrating: 'happy',
    sympathizing: 'sad',
    thinking: 'thinking',
    pointing: 'default',
    questioning: 'surprised',
    idle: 'default',
  }

  return expressionMap[sentiment] || 'default'
}

export default {
  detectSentiment,
  getAnimationForResponse,
  getAnimationForInteraction,
  shouldShowWhiteboard,
  extractMathProblem,
  getExpressionForSentiment,
  SENTIMENT_TO_ANIMATION,
}
