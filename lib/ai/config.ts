/**
 * AI Configuration
 * Phase 4 - Adaptive Learning System
 */

export const AI_CONFIG = {
  // OpenAI Configuration
  model: (process.env.AI_MODEL || 'gpt-4o-mini') as string,
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '200', 10),
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),

  // Fallback messages if AI fails
  fallbackExplanation: "¡Ups! Parece que algo salió mal. Intenta revisar tu respuesta paso a paso. ¿Puedes encontrar dónde estuvo el error? 🤔",
  fallbackHint: "Piensa en el problema paso a paso. Toma tu tiempo y ¡tú puedes hacerlo! 💪",
  fallbackEncouragement: "¡Sigue intentando! Cada error es una oportunidad para aprender algo nuevo. ¡Tú puedes! 🌟",

  // Rate limiting
  maxRequestsPerMinute: 20,
  maxRequestsPerHour: 100,

  // Caching
  cacheDuration: 300, // 5 minutes in seconds
  enableCache: true,

  // Timeouts
  requestTimeout: 10000, // 10 seconds

  // Cost optimization
  enableAggressiveCaching: true, // Cache similar requests
  minSimilarityThreshold: 0.9, // For similar request detection

  // Hint system
  maxHintsPerActivity: 3,
  hintPenaltyPercentage: 20, // 20% points reduction per hint

  // Adaptive difficulty
  minAttemptsBeforeAdapt: 5, // Minimum attempts before changing difficulty
  successRateThresholdUp: 0.8, // 80% success to move up
  successRateThresholdDown: 0.4, // Below 40% to move down
  consecutiveCorrectForLevelUp: 5,
  consecutiveIncorrectForLevelDown: 3,

  // Learning speed classification
  fastLearnerThreshold: 0.85, // >85% success rate
  slowLearnerThreshold: 0.50, // <50% success rate

  // Feedback configuration
  maxFeedbackLength: 200, // Max characters in AI feedback
  maxHintLength: 100, // Max characters in hints
  maxEncouragementLength: 80, // Max characters in encouragement

  // Recommendation confidence
  minConfidenceForRecommendation: 0.6, // 60% confidence minimum
} as const

// Validation
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not set in environment variables. AI features will use fallback messages.')
}

export type AIConfig = typeof AI_CONFIG
