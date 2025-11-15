/**
 * OpenAI Client
 * Phase 4 - Adaptive Learning System
 *
 * Provides AI-powered feedback, hints, encouragement, and mistake analysis
 */

import OpenAI from 'openai'
import type {
  GenerateExplanationParams,
  GenerateHintParams,
  GenerateEncouragementParams,
  AnalyzeMistakeParams,
  MistakeAnalysis
} from '@/types'
import { AI_CONFIG } from './config'
import { withFullProtection } from './error-handler'
import { getCached, setCache, generateCacheKey, generateNormalizedCacheKey } from './cache'
import { checkAllRateLimits } from './rate-limiter'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * Generate personalized explanation for incorrect answer
 */
export async function generateExplanation(
  params: GenerateExplanationParams
): Promise<string> {
  // Check cache first (normalized for similar questions)
  const cacheKey = generateNormalizedCacheKey(
    'explanation',
    params.question,
    params.activityType
  )
  const cached = getCached<string>(cacheKey)
  if (cached) {
    console.log('✨ Using cached explanation')
    return cached
  }

  // Check rate limit
  if (!checkAllRateLimits()) {
    return AI_CONFIG.fallbackExplanation
  }

  const operation = async () => {
    const prompt = `Eres un tutor de matemáticas amigable para niños de 9-11 años.

El estudiante respondió: "${params.question}"
La respuesta correcta es: ${params.correctAnswer}
El estudiante respondió: ${params.studentAnswer}

Proporciona una explicación clara y alentadora que incluya:
1. Por qué su respuesta es incorrecta (sin ser negativo)
2. Cómo resolver este problema paso a paso
3. La respuesta correcta

Mantén un tono amigable y apropiado para la edad. Usa un emoji ocasionalmente. Máximo 3-4 oraciones.`

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
    })

    const explanation = response.choices[0].message.content || AI_CONFIG.fallbackExplanation

    // Cache the result
    setCache(cacheKey, explanation)

    return explanation
  }

  return withFullProtection(
    operation,
    AI_CONFIG.fallbackExplanation,
    'Generate Explanation'
  )
}

/**
 * Generate progressive hint
 */
export async function generateHint(
  params: GenerateHintParams
): Promise<string> {
  // Check cache
  const cacheKey = generateCacheKey('hint', {
    question: params.question,
    level: params.hintLevel,
    type: params.activityType
  })
  const cached = getCached<string>(cacheKey)
  if (cached) {
    console.log('✨ Using cached hint')
    return cached
  }

  // Check rate limit
  if (!checkAllRateLimits()) {
    return AI_CONFIG.fallbackHint
  }

  const hintLevelText = {
    1: 'una pista muy sutil que les haga pensar',
    2: 'una pista más útil que los guíe hacia la solución',
    3: 'una pista muy clara que casi revele la respuesta'
  }

  const operation = async () => {
    const prompt = `Eres un tutor de matemáticas servicial para niños de 9-11 años.

Pregunta: "${params.question}"
Respuesta Correcta: ${params.correctAnswer}

Proporciona ${hintLevelText[params.hintLevel]} sin dar la respuesta completa.

Sé alentador y apropiado para la edad. Usa un emoji. Máximo 2 oraciones.`

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 100,
    })

    const hint = response.choices[0].message.content || AI_CONFIG.fallbackHint

    // Cache the result
    setCache(cacheKey, hint)

    return hint
  }

  return withFullProtection(
    operation,
    AI_CONFIG.fallbackHint,
    'Generate Hint'
  )
}

/**
 * Generate personalized encouragement
 */
export async function generateEncouragement(
  params: GenerateEncouragementParams
): Promise<string> {
  // Check cache (based on pattern, not specific values)
  const pattern = params.isCorrect
    ? params.consecutiveCorrect >= 3 ? 'streak' : 'correct'
    : params.consecutiveIncorrect >= 2 ? 'struggling' : 'incorrect'

  const cacheKey = `encouragement:${pattern}`
  const cached = getCached<string>(cacheKey, 60) // Cache for 1 minute only
  if (cached) {
    console.log('✨ Using cached encouragement')
    return cached
  }

  // Check rate limit
  if (!checkAllRateLimits()) {
    return AI_CONFIG.fallbackEncouragement
  }

  let context = ''

  if (params.isCorrect && params.consecutiveCorrect >= 3) {
    context = `El estudiante ${params.studentName} acaba de responder ${params.consecutiveCorrect} preguntas correctas seguidas! Celebra su racha.`
  } else if (params.isCorrect) {
    context = `El estudiante ${params.studentName} acaba de responder correctamente!`
  } else if (params.consecutiveIncorrect >= 2) {
    context = `El estudiante ${params.studentName} ha tenido ${params.consecutiveIncorrect} respuestas incorrectas. Anímalo a seguir intentando sin rendirse.`
  } else {
    context = `El estudiante ${params.studentName} respondió incorrectamente esta pregunta.`
  }

  const operation = async () => {
    const prompt = `Eres un tutor de matemáticas alentador para niños de 9-11 años.

${context}

Proporciona un mensaje corto y motivador (1-2 oraciones). Usa un emoji. Sé positivo y apropiado para la edad.`

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 80,
    })

    const encouragement = response.choices[0].message.content || AI_CONFIG.fallbackEncouragement

    // Cache briefly
    setCache(cacheKey, encouragement)

    return encouragement
  }

  return withFullProtection(
    operation,
    AI_CONFIG.fallbackEncouragement,
    'Generate Encouragement'
  )
}

/**
 * Analyze mistake pattern
 */
export async function analyzeMistakePattern(
  params: AnalyzeMistakeParams
): Promise<MistakeAnalysis> {
  // Check cache
  const cacheKey = generateNormalizedCacheKey(
    'mistake',
    params.question,
    params.activityType
  )
  const cached = getCached<MistakeAnalysis>(cacheKey)
  if (cached) {
    console.log('✨ Using cached mistake analysis')
    return cached
  }

  // Check rate limit
  if (!checkAllRateLimits()) {
    return {
      mistakeType: 'unknown',
      suggestion: '¡Sigue practicando!'
    }
  }

  const operation = async () => {
    const prompt = `Eres un experto en educación matemática analizando errores de estudiantes.

Pregunta: "${params.question}"
Respuesta Correcta: ${params.correctAnswer}
Respuesta del Estudiante: ${params.studentAnswer}
Tipo de Actividad: ${params.activityType}

Analiza qué tipo de error cometió el estudiante. Responde en formato JSON:
{
  "mistakeType": "categoría breve como 'error_calculo', 'malentendido_concepto', 'error_descuido'",
  "suggestion": "una cosa específica que el estudiante debería practicar"
}`

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 150,
      response_format: { type: 'json_object' }
    })

    try {
      const analysis = JSON.parse(response.choices[0].message.content || '{}') as MistakeAnalysis

      // Cache the result
      setCache(cacheKey, analysis)

      return analysis
    } catch {
      return {
        mistakeType: 'unknown',
        suggestion: '¡Sigue practicando!'
      }
    }
  }

  return withFullProtection(
    operation,
    {
      mistakeType: 'unknown',
      suggestion: '¡Sigue practicando!'
    },
    'Analyze Mistake'
  )
}

export default openai
