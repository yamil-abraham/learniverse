/**
 * Teacher Store (Zustand)
 * Adapted from r3f-ai-language-teacher/src/hooks/useAITeacher.js
 *
 * Manages 3D teacher state, animations, audio playback, and lip-sync
 */

import { create } from 'zustand'
import type { LipsyncData } from '@/lib/speech/lip-sync'

// Available teachers
export const TEACHERS = ['Valentina', 'Mateo'] as const
export type TeacherType = typeof TEACHERS[number]

// Available classrooms
export const CLASSROOMS = ['default', 'alternative'] as const
export type ClassroomType = typeof CLASSROOMS[number]

// Teacher animations (from GLB files)
export type TeacherAnimation = 'Idle' | 'Thinking' | 'Talking' | 'Talking2' | 'Celebrating'

// Teacher expressions
export type TeacherExpression = 'default' | 'smile' | 'celebrating' | 'encouraging'

/**
 * Teacher message/explanation
 * Represents one explanation with audio and lip-sync
 */
export interface TeacherMessage {
  id: number
  problemText: string
  studentAnswer: string
  isCorrect: boolean
  explanation: {
    text: string
    steps?: string[]
  }
  audioPlayer: HTMLAudioElement | null
  lipsync: LipsyncData | null
  animation: TeacherAnimation
  expression: TeacherExpression
}

/**
 * Teacher Store State
 */
interface TeacherStore {
  // Scene configuration
  teacher: TeacherType
  classroom: ClassroomType

  // Message/Animation state
  messages: TeacherMessage[]
  currentMessage: TeacherMessage | null
  loading: boolean

  // Actions: Scene configuration
  setTeacher: (teacher: TeacherType) => void
  setClassroom: (classroom: ClassroomType) => void

  // Actions: Message handling
  requestExplanation: (
    problemText: string,
    studentAnswer: string,
    correctAnswer: string,
    isCorrect: boolean
  ) => Promise<void>
  requestQAResponse: (question: string) => Promise<void>
  playMessage: (message: TeacherMessage) => void
  stopMessage: (message: TeacherMessage) => void
  clearMessages: () => void
}

/**
 * Create teacher store
 */
export const useTeacherStore = create<TeacherStore>((set, get) => ({
  // Initial state
  teacher: 'Valentina',
  classroom: 'default',
  messages: [],
  currentMessage: null,
  loading: false,

  /**
   * Set teacher (switch between Valentina/Mateo)
   */
  setTeacher: (teacher: TeacherType) => {
    set(() => ({
      teacher,
      // Reset audio players when switching teacher (new voice)
      messages: get().messages.map((message) => ({
        ...message,
        audioPlayer: null,
      })),
    }))
  },

  /**
   * Set classroom environment
   */
  setClassroom: (classroom: ClassroomType) => {
    set(() => ({ classroom }))
  },

  /**
   * Request explanation from teacher
   * Adapted from askAI in reference project
   */
  requestExplanation: async (
    problemText: string,
    studentAnswer: string,
    correctAnswer: string,
    isCorrect: boolean
  ) => {
    set(() => ({ loading: true }))

    try {
      // Call explanation API
      const res = await fetch('/api/teacher/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: problemText,
          studentAnswer,
          correctAnswer,
          isCorrect,
        }),
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()

      // Create message
      const message: TeacherMessage = {
        id: get().messages.length,
        problemText,
        studentAnswer,
        isCorrect,
        explanation: {
          text: data.text,
          steps: data.steps,
        },
        audioPlayer: null,
        lipsync: data.lipsync,
        animation: data.animation || (isCorrect ? 'Celebrating' : 'Talking'),
        expression: data.expression || (isCorrect ? 'celebrating' : 'encouraging'),
      }

      // Add to messages
      set((state) => ({
        messages: [...state.messages, message],
        currentMessage: message,
        loading: false,
      }))

      // Auto-play the message
      get().playMessage(message)
    } catch (error) {
      console.error('❌ Error requesting explanation:', error)
      set(() => ({ loading: false }))
    }
  },

  /**
   * Request Q&A response from teacher
   * For freeform questions in Q&A mode
   */
  requestQAResponse: async (question: string) => {
    set(() => ({ loading: true }))

    try {
      // Call Q&A API
      const res = await fetch('/api/teacher/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()

      // Create message
      const message: TeacherMessage = {
        id: get().messages.length,
        problemText: question, // Store question as problem text
        studentAnswer: '', // No student answer in Q&A mode
        isCorrect: false, // Not an exercise answer, so not "correct/incorrect"
        explanation: {
          text: data.text,
          steps: data.steps || [],
        },
        audioPlayer: null,
        lipsync: data.lipsync,
        animation: data.animation || 'Talking',
        expression: data.expression || 'default',
      }

      // Add to messages
      set((state) => ({
        messages: [...state.messages, message],
        currentMessage: message,
        loading: false,
      }))

      // Auto-play the message
      get().playMessage(message)
    } catch (error) {
      console.error('❌ Error requesting Q&A response:', error)
      set(() => ({ loading: false }))
    }
  },

  /**
   * Play message audio with lip-sync
   * Adapted from playMessage in reference project
   */
  playMessage: async (message: TeacherMessage) => {
    set(() => ({ currentMessage: message }))

    // If audio not yet created
    if (!message.audioPlayer) {
      set(() => ({ loading: true }))

      try {
        // Fetch audio from API (already generated in requestExplanation)
        const res = await fetch('/api/teacher/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problem: message.problemText,
            studentAnswer: message.studentAnswer,
            correctAnswer: '', // Not needed for replay
            isCorrect: message.isCorrect,
          }),
        })

        const data = await res.json()

        // Convert base64 audio to blob
        const audioBlob = base64ToBlob(data.audio, 'audio/mpeg')
        const audioUrl = URL.createObjectURL(audioBlob)
        const audioPlayer = new Audio(audioUrl)

        // Update message with audio
        message.audioPlayer = audioPlayer
        message.lipsync = data.lipsync

        // Set end handler
        message.audioPlayer.onended = () => {
          set(() => ({ currentMessage: null }))
        }

        // Update messages array
        set(() => ({
          loading: false,
          messages: get().messages.map((m) => (m.id === message.id ? message : m)),
        }))
      } catch (error) {
        console.error('❌ Error loading audio:', error)
        set(() => ({ loading: false }))
        return
      }
    }

    // Play audio
    if (message.audioPlayer) {
      message.audioPlayer.currentTime = 0
      message.audioPlayer.play()
    }
  },

  /**
   * Stop message audio
   */
  stopMessage: (message: TeacherMessage) => {
    if (message.audioPlayer) {
      message.audioPlayer.pause()
    }
    set(() => ({ currentMessage: null }))
  },

  /**
   * Clear all messages
   */
  clearMessages: () => {
    // Stop current audio
    const current = get().currentMessage
    if (current?.audioPlayer) {
      current.audioPlayer.pause()
    }

    set(() => ({
      messages: [],
      currentMessage: null,
    }))
  },
}))

/**
 * Helper: Convert base64 to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}
