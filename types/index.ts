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

// Actividades y ejercicios
export type ActivityType = 'arithmetic' | 'geometry' | 'logic' | 'word-problem'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface Activity {
  id: string
  type: ActivityType
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
