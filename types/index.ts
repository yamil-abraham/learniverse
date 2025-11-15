/**
 * Tipos globales para la aplicación Learniverse
 */

// Tipos de usuario
export type UserRole = 'student' | 'teacher' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Student extends User {
  role: 'student'
  grade: number
  teacherId: string
  progress: StudentProgress
}

export interface Teacher extends User {
  role: 'teacher'
  students: string[]
  school?: string
}

// Progreso del estudiante
export interface StudentProgress {
  level: number
  experience: number
  completedActivities: string[]
  currentActivity?: string
  stats: StudentStats
}

export interface StudentStats {
  correctAnswers: number
  incorrectAnswers: number
  totalActivities: number
  averageTime: number
  streak: number
}

// Actividades y ejercicios - General types
export type ActivityCategory = 'arithmetic' | 'geometry' | 'logic' | 'word-problem'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

// Phase 3: Math Activities - Specific types
export type MathActivityType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions'

// Phase 3: Math Activity interface for database
export interface MathActivity {
  id: string
  type: MathActivityType
  difficulty: DifficultyLevel
  question: string
  correctAnswer: string
  options?: string[] // For multiple choice
  explanation?: string
  hints?: string[]
  points: number
  timeLimitSeconds: number
  createdAt: Date
}

// Phase 3: Student Attempt interface
export interface StudentAttempt {
  id: string
  studentId: string
  activityId: string
  answerGiven: string
  isCorrect: boolean
  timeTakenSeconds: number
  hintsUsed: number
  pointsEarned: number
  attemptedAt: Date
}

// Phase 3: Badge types
export type BadgeType =
  | 'first_correct'
  | 'speed_demon'
  | 'persistent'
  | 'perfect_score'
  | 'level_up'
  | 'master_addition'
  | 'master_subtraction'
  | 'master_multiplication'
  | 'master_division'
  | 'master_fractions'

// Phase 3: Badge interface
export interface Badge {
  id: string
  studentId: string
  badgeType: BadgeType
  badgeName: string
  badgeDescription: string
  earnedAt: Date
}

// Phase 3: Game Stats interface
export interface GameStats {
  level: number
  experience: number
  totalPoints: number
  correctAnswers: number
  incorrectAnswers: number
  totalAttempts: number
  averageTimeSeconds: number
  streakDays: number
  badges: Badge[]
  attemptsByType: {
    addition: number
    subtraction: number
    multiplication: number
    division: number
    fractions: number
  }
}

// Legacy Activity interface (Phase 1 - keeping for compatibility)
export interface Activity {
  id: string
  type: ActivityCategory
  title: string
  description: string
  difficulty: DifficultyLevel
  points: number
  timeLimit?: number
  content: ActivityContent
}

export interface ActivityContent {
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation?: string
  hints?: string[]
}

// Avatar 3D Configuration
export interface AvatarConfig {
  // Body
  skinColor: string
  bodyColor: string
  shoeColor: string

  // Head
  hairStyle: 'short' | 'long' | 'curly' | 'spiky' | 'bald'
  hairColor: string
  eyeColor: string

  // Accessories
  hatStyle: 'none' | 'cap' | 'beanie' | 'crown'
  showGlasses: boolean

  // Clothing
  shirtStyle: 'tshirt' | 'hoodie' | 'vest'

  // Animation
  idleAnimation: 'bounce' | 'wave' | 'spin'
}

// Default avatar configuration
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinColor: '#f4c2a0',
  bodyColor: '#3b82f6',
  shoeColor: '#1e293b',
  hairStyle: 'short',
  hairColor: '#4a3c28',
  eyeColor: '#000000',
  hatStyle: 'none',
  showGlasses: false,
  shirtStyle: 'tshirt',
  idleAnimation: 'bounce'
}

// Configuración del juego
export interface GameState {
  isPlaying: boolean
  currentActivity: Activity | null
  score: number
  timeElapsed: number
  lives: number
}

// Tipos de autenticación
export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  studentId?: string
  teacherId?: string
  level?: number
  experience?: number
}

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
  studentId?: string
  teacherId?: string
  level?: number
  experience?: number
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  role: UserRole
  grade?: number
  school?: string
}

// ============================================
// Phase 4: AI-Powered Adaptive Learning System
// ============================================

// Learning speed classification
export type LearningSpeed = 'slow' | 'normal' | 'fast'

// AI feedback types
export type AIFeedbackType = 'explanation' | 'hint' | 'encouragement' | 'correction'

// Student Learning Profile
export interface StudentLearningProfile {
  id: string
  studentId: string

  // Performance by activity type (success rate 0-100)
  additionSuccessRate: number
  subtractionSuccessRate: number
  multiplicationSuccessRate: number
  divisionSuccessRate: number
  fractionsSuccessRate: number

  // Current difficulty preference per type
  additionDifficulty: DifficultyLevel
  subtractionDifficulty: DifficultyLevel
  multiplicationDifficulty: DifficultyLevel
  divisionDifficulty: DifficultyLevel
  fractionsDifficulty: DifficultyLevel

  // Attempt counts per type
  additionAttempts: number
  subtractionAttempts: number
  multiplicationAttempts: number
  divisionAttempts: number
  fractionsAttempts: number

  // Learning patterns
  averageTimePerQuestion: number
  hintsUsageRate: number
  commonMistakePatterns: string[]
  learningSpeed: LearningSpeed

  // Engagement metrics
  consecutiveCorrect: number
  consecutiveIncorrect: number
  sessionCount: number
  totalQuestionsAttempted: number

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// AI Feedback History
export interface AIFeedback {
  id: string
  studentId: string
  activityId: string
  attemptId?: string

  feedbackType: AIFeedbackType
  userAnswer?: string
  feedbackText: string
  wasHelpful?: boolean

  // AI metadata
  aiModel: string
  tokensUsed?: number
  generationTimeMs?: number

  createdAt: Date
}

// Adaptive Recommendation
export interface AdaptiveRecommendation {
  id: string
  studentId: string

  recommendedActivityType: MathActivityType
  recommendedDifficulty: DifficultyLevel
  reason: string
  confidenceScore: number // 0.00 to 1.00

  // Tracking
  wasUsed: boolean
  wasSuccessful?: boolean

  createdAt: Date
  usedAt?: Date
}

// Performance Data for Difficulty Adapter
export interface PerformanceData {
  totalAttempts: number
  correctAnswers: number
  incorrectAnswers: number
  successRate: number
  averageTime: number
  consecutiveCorrect: number
  consecutiveIncorrect: number
}

// Difficulty Recommendation Result
export interface DifficultyRecommendation {
  activityType: MathActivityType
  difficulty: DifficultyLevel
  confidence: number // 0-1
  reason: string
}

// Mistake Analysis Result
export interface MistakeAnalysis {
  mistakeType: string
  suggestion: string
  explanation?: string
}

// OpenAI Request Parameters
export interface GenerateExplanationParams {
  question: string
  correctAnswer: string
  studentAnswer: string
  activityType: MathActivityType
  difficulty: DifficultyLevel
}

export interface GenerateHintParams {
  question: string
  correctAnswer: string
  hintLevel: 1 | 2 | 3
  activityType: MathActivityType
}

export interface GenerateEncouragementParams {
  isCorrect: boolean
  consecutiveCorrect: number
  consecutiveIncorrect: number
  studentName: string
}

export interface AnalyzeMistakeParams {
  question: string
  correctAnswer: string
  studentAnswer: string
  activityType: MathActivityType
}

// Activity Type Performance Map
export interface ActivityTypePerformance {
  [key: string]: {
    successRate: number
    currentDifficulty: DifficultyLevel
    attemptsCount: number
  }
}
