/**
 * Game Store
 * Zustand store for game state management
 * Phase 3 - Learniverse
 */

import { create } from 'zustand'
import type { MathActivity, MathActivityType, DifficultyLevel, GameStats, Badge } from '@/types'

interface ActivityResult {
  isCorrect: boolean
  correctAnswer?: string
  pointsEarned: number
  experienceEarned: number
  feedback: string
  levelUp?: boolean
  newLevel?: number
  currentLevel: number
  currentExperience: number
  badgesEarned: Badge[]
  aiFeedback?: string // Phase 4: AI-generated explanation
  aiEncouragement?: string // Phase 4: AI motivation
}

interface GameState {
  // Current activity
  currentActivity: MathActivity | null
  isActivityLoading: boolean
  activityError: string | null

  // Answer submission
  isSubmitting: boolean
  lastResult: ActivityResult | null
  showFeedback: boolean

  // Game stats
  stats: GameStats | null
  isStatsLoading: boolean

  // Timer
  timeRemaining: number
  timerActive: boolean
  timeElapsed: number

  // Hints
  hintsUsed: number
  currentHintIndex: number

  // Session stats
  sessionCorrect: number
  sessionIncorrect: number
  sessionPoints: number

  // Phase 4: AI Features
  aiHints: string[]
  isLoadingAIHint: boolean

  // Actions
  loadActivity: (type: MathActivityType, difficulty: DifficultyLevel) => Promise<void>
  submitAnswer: (answer: string) => Promise<void>
  useHint: () => string | null
  getAIHint: (activityId: string, question: string, correctAnswer: string, activityType: string) => Promise<void>
  loadStats: (studentId: string) => Promise<void>
  startTimer: () => void
  stopTimer: () => void
  tick: () => void
  resetActivity: () => void
  closeFeedback: () => void
  resetSession: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  currentActivity: null,
  isActivityLoading: false,
  activityError: null,

  isSubmitting: false,
  lastResult: null,
  showFeedback: false,

  stats: null,
  isStatsLoading: false,

  timeRemaining: 60,
  timerActive: false,
  timeElapsed: 0,

  hintsUsed: 0,
  currentHintIndex: 0,

  sessionCorrect: 0,
  sessionIncorrect: 0,
  sessionPoints: 0,

  // Phase 4: AI initial state
  aiHints: [],
  isLoadingAIHint: false,

  // Load a new activity
  loadActivity: async (type: MathActivityType, difficulty: DifficultyLevel) => {
    set({ isActivityLoading: true, activityError: null })

    try {
      const response = await fetch('/api/activities/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, difficulty })
      })

      if (!response.ok) {
        throw new Error('Failed to load activity')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to load activity')
      }

      const activity: MathActivity = data.activity

      set({
        currentActivity: activity,
        isActivityLoading: false,
        timeRemaining: activity.timeLimitSeconds,
        hintsUsed: 0,
        currentHintIndex: 0,
        lastResult: null,
        showFeedback: false
      })

      // Start timer
      get().startTimer()

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      set({
        isActivityLoading: false,
        activityError: message
      })
    }
  },

  // Submit an answer
  submitAnswer: async (answer: string) => {
    const state = get()
    const activity = state.currentActivity

    if (!activity) {
      console.error('No current activity')
      return
    }

    // Stop timer
    state.stopTimer()

    set({ isSubmitting: true })

    try {
      const response = await fetch('/api/activities/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: activity.id,
          answer,
          timeTaken: state.timeElapsed,
          hintsUsed: state.hintsUsed,
          // Include activity data for dynamically generated activities
          activityData: !activity.id ? {
            type: activity.type,
            difficulty: activity.difficulty,
            correctAnswer: activity.correctAnswer,
            points: activity.points,
            timeLimitSeconds: activity.timeLimitSeconds
          } : undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to submit answer')
      }

      const result: ActivityResult = data.result

      // Phase 4: Get AI feedback and encouragement if incorrect
      if (!result.isCorrect && activity.correctAnswer) {
        try {
          // Get AI explanation (don't wait, run in parallel)
          const feedbackPromise = fetch('/api/ai/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activityId: activity.id,
              question: activity.question,
              correctAnswer: activity.correctAnswer,
              studentAnswer: answer,
              activityType: activity.type,
              difficulty: activity.difficulty
            })
          }).then(res => res.json())

          // Get AI encouragement
          const encouragementPromise = fetch('/api/ai/encouragement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activityId: activity.id,
              isCorrect: false
            })
          }).then(res => res.json())

          // Phase 4 Adaptive: Update learning profile
          const profilePromise = fetch('/api/ai/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activityType: activity.type,
              isCorrect: false,
              timeTaken: state.timeElapsed,
              hintsUsed: state.hintsUsed
            })
          }).then(res => res.json())

          // Phase 4 Adaptive: Analyze mistake pattern
          const mistakePromise = fetch('/api/ai/analyze-mistake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: activity.question,
              correctAnswer: activity.correctAnswer,
              studentAnswer: answer,
              activityType: activity.type
            })
          }).then(res => res.json())

          // Wait for all AI calls in parallel
          const [feedbackData, encouragementData, profileData, mistakeData] = await Promise.all([
            feedbackPromise,
            encouragementPromise,
            profilePromise,
            mistakePromise
          ])

          if (feedbackData.success) {
            result.aiFeedback = feedbackData.feedback
          }
          if (encouragementData.success) {
            result.aiEncouragement = encouragementData.encouragement
          }

          // Log adaptive learning results (optional)
          if (profileData.success && profileData.difficultyUpdate?.changed) {
            console.log(`✨ Difficulty adjusted to: ${profileData.difficultyUpdate.newDifficulty}`)
          }
          if (mistakeData.success) {
            console.log(`📊 Mistake type: ${mistakeData.analysis.mistakeType}`)
          }
        } catch (error) {
          console.error('Error getting AI feedback:', error)
          // Continue anyway with basic feedback
        }
      } else if (result.isCorrect) {
        // Get encouragement for correct answers too
        try {
          const encouragementPromise = fetch('/api/ai/encouragement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activityId: activity.id,
              isCorrect: true
            })
          }).then(res => res.json())

          // Phase 4 Adaptive: Update learning profile for correct answers
          const profilePromise = fetch('/api/ai/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activityType: activity.type,
              isCorrect: true,
              timeTaken: state.timeElapsed,
              hintsUsed: state.hintsUsed
            })
          }).then(res => res.json())

          // Wait for both
          const [encouragementData, profileData] = await Promise.all([
            encouragementPromise,
            profilePromise
          ])

          if (encouragementData.success) {
            result.aiEncouragement = encouragementData.encouragement
          }

          // Log adaptive learning results (optional)
          if (profileData.success && profileData.difficultyUpdate?.changed) {
            console.log(`✨ Difficulty adjusted to: ${profileData.difficultyUpdate.newDifficulty}`)
          }
        } catch (error) {
          console.error('Error getting AI encouragement:', error)
        }
      }

      // Update session stats
      const newSessionCorrect = result.isCorrect ? state.sessionCorrect + 1 : state.sessionCorrect
      const newSessionIncorrect = !result.isCorrect ? state.sessionIncorrect + 1 : state.sessionIncorrect
      const newSessionPoints = state.sessionPoints + result.pointsEarned

      set({
        isSubmitting: false,
        lastResult: result,
        showFeedback: true,
        sessionCorrect: newSessionCorrect,
        sessionIncorrect: newSessionIncorrect,
        sessionPoints: newSessionPoints
      })

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      set({
        isSubmitting: false,
        activityError: message
      })
    }
  },

  // Use a hint
  useHint: () => {
    const state = get()
    const activity = state.currentActivity

    if (!activity || !activity.hints || activity.hints.length === 0) {
      return null
    }

    const hintIndex = state.currentHintIndex

    if (hintIndex >= activity.hints.length) {
      return null // No more hints
    }

    const hint = activity.hints[hintIndex]

    set({
      hintsUsed: state.hintsUsed + 1,
      currentHintIndex: hintIndex + 1
    })

    return hint
  },

  // Phase 4: Get AI-generated hint
  getAIHint: async (activityId: string, question: string, correctAnswer: string, activityType: string) => {
    set({ isLoadingAIHint: true })

    try {
      const state = get()
      const hintLevel = (state.aiHints.length + 1) as 1 | 2 | 3

      if (hintLevel > 3) {
        console.log('Maximum AI hints reached')
        set({ isLoadingAIHint: false })
        return
      }

      const response = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          question,
          correctAnswer,
          activityType,
          hintLevel
        })
      })

      const data = await response.json()

      if (data.success) {
        set({
          aiHints: [...state.aiHints, data.hint],
          hintsUsed: state.hintsUsed + 1,
          isLoadingAIHint: false
        })
      } else {
        set({ isLoadingAIHint: false })
      }

    } catch (error) {
      console.error('Error getting AI hint:', error)
      set({ isLoadingAIHint: false })
    }
  },

  // Load student stats
  loadStats: async (studentId: string) => {
    set({ isStatsLoading: true })

    try {
      const response = await fetch(`/api/stats/student?studentId=${studentId}`)

      if (!response.ok) {
        throw new Error('Failed to load stats')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to load stats')
      }

      set({
        stats: data.stats,
        isStatsLoading: false
      })

    } catch (error) {
      console.error('Error loading stats:', error)
      set({ isStatsLoading: false })
    }
  },

  // Start timer
  startTimer: () => {
    set({ timerActive: true, timeElapsed: 0 })
  },

  // Stop timer
  stopTimer: () => {
    set({ timerActive: false })
  },

  // Timer tick (called every second)
  tick: () => {
    const state = get()

    if (!state.timerActive) return

    const newElapsed = state.timeElapsed + 1
    const newRemaining = Math.max(0, (state.currentActivity?.timeLimitSeconds || 60) - newElapsed)

    set({
      timeElapsed: newElapsed,
      timeRemaining: newRemaining
    })

    // Auto-submit if time runs out
    if (newRemaining === 0) {
      state.stopTimer()
      // Could auto-submit here, but let's just stop the timer
    }
  },

  // Reset current activity
  resetActivity: () => {
    set({
      currentActivity: null,
      timeRemaining: 60,
      timerActive: false,
      timeElapsed: 0,
      hintsUsed: 0,
      currentHintIndex: 0,
      lastResult: null,
      showFeedback: false,
      activityError: null,
      aiHints: [], // Phase 4: Reset AI hints
      isLoadingAIHint: false
    })
  },

  // Close feedback modal
  closeFeedback: () => {
    set({ showFeedback: false })
  },

  // Reset session stats
  resetSession: () => {
    set({
      sessionCorrect: 0,
      sessionIncorrect: 0,
      sessionPoints: 0
    })
  }
}))

// Timer interval setup (call this in your game component)
export function startGameTimer() {
  const interval = setInterval(() => {
    useGameStore.getState().tick()
  }, 1000)

  return () => clearInterval(interval)
}
