/**
 * MathBlackboard Component
 * Adapted from r3f-ai-language-teacher/src/components/MessagesList.jsx
 *
 * Displays math problems and explanations on 3D blackboard
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { useTeacherStore, type ClassroomType } from '@/stores/teacherStore'
import type { MathActivityType, DifficultyLevel } from '@/types'

interface MathBlackboardProps {
  classroom?: ClassroomType
  studentName?: string // Pass student name as prop instead of using useSession
}

interface Recommendation {
  type: MathActivityType
  difficulty: DifficultyLevel
  reason: string
}

interface Exercise {
  question: string
  options: string[]
  correctAnswer: string
  type: MathActivityType
  difficulty: DifficultyLevel
}

export function MathBlackboard({ classroom = 'default', studentName }: MathBlackboardProps) {
  const messages = useTeacherStore((state) => state.messages)
  const currentMessage = useTeacherStore((state) => state.currentMessage)
  const playMessage = useTeacherStore((state) => state.playMessage)
  const stopMessage = useTeacherStore((state) => state.stopMessage)
  const requestExplanation = useTeacherStore((state) => state.requestExplanation)

  const container = useRef<HTMLDivElement>(null!)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load AI recommendation
  useEffect(() => {
    const loadRecommendation = async () => {
      try {
        console.log('🔄 [Blackboard] Loading AI recommendation...')
        const res = await fetch('/api/ai/recommend-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const data = await res.json()
          console.log('✅ [Blackboard] Recommendation loaded:', data)
          if (data.success) {
            setRecommendation(data.recommendation)
          }
        }
      } catch (error) {
        console.error('❌ [Blackboard] Error loading recommendation:', error)
      }
    }
    loadRecommendation()
  }, [])

  // Auto-scroll to bottom when new messages arrive (copied from reference)
  useEffect(() => {
    if (container.current) {
      container.current.scrollTo({
        top: container.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages.length])

  // Debug: Track currentExercise changes
  useEffect(() => {
    console.log('🔄 [Blackboard] currentExercise changed:', currentExercise)
  }, [currentExercise])

  // Debug: Track messages changes
  useEffect(() => {
    console.log('💬 [Blackboard] messages changed, count:', messages.length)
  }, [messages])

  // Generate exercise from recommendation with user-selected difficulty
  const generateExercise = async () => {
    console.log('🎯 [Blackboard] generateExercise called')
    console.log('📋 [Blackboard] Current recommendation:', recommendation)
    console.log('📊 [Blackboard] Selected difficulty:', selectedDifficulty)

    if (!recommendation) {
      console.warn('⚠️ [Blackboard] No recommendation available!')
      return
    }

    if (!selectedDifficulty) {
      console.warn('⚠️ [Blackboard] No difficulty selected!')
      return
    }

    try {
      console.log('🔄 [Blackboard] Fetching exercise...', {
        type: recommendation.type,
        difficulty: selectedDifficulty,
      })

      const response = await fetch('/api/activities/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: recommendation.type,
          difficulty: selectedDifficulty,
        }),
      })

      console.log('📡 [Blackboard] API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('📦 [Blackboard] Exercise data received:', data)

        if (data.success && data.activity) {
          const exercise = {
            question: data.activity.question,
            options: data.activity.options || [],
            correctAnswer: data.activity.correctAnswer,
            type: recommendation.type,
            difficulty: selectedDifficulty,
          }
          console.log('✅ [Blackboard] Setting currentExercise:', exercise)
          setCurrentExercise(exercise)
        } else {
          console.warn('⚠️ [Blackboard] Invalid data format:', data)
        }
      } else {
        console.error('❌ [Blackboard] API request failed:', response.status)
      }
    } catch (error) {
      console.error('❌ [Blackboard] Error generating exercise:', error)
    }
  }

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!currentExercise || !selectedAnswer || isSubmitting) return

    setIsSubmitting(true)
    const isCorrect = selectedAnswer === currentExercise.correctAnswer

    // Request explanation from teacher
    await requestExplanation(
      currentExercise.question,
      selectedAnswer,
      currentExercise.correctAnswer,
      isCorrect
    )

    // Reset for next exercise
    setSelectedAnswer(null)
    setCurrentExercise(null)
    setIsSubmitting(false)

    // Automatically generate next exercise
    console.log('🔄 [Blackboard] Auto-generating next exercise...')
    setTimeout(() => {
      generateExercise()
    }, 500) // Small delay to allow explanation to display
  }

  // Classroom-specific dimensions (copied from reference MessagesList.jsx)
  const dimensions = {
    default: 'w-[1288px] h-[676px]',
    alternative: 'w-[2528px] h-[856px]',
  }

  // Debug: Log render state
  console.log('🎨 [Blackboard] Rendering with state:', {
    messagesLength: messages.length,
    hasCurrentExercise: !!currentExercise,
    hasRecommendation: !!recommendation,
    currentExercise: currentExercise,
  })

  return (
    <div
      className={`${dimensions[classroom]} p-8 overflow-y-auto flex flex-col space-y-8 bg-transparent opacity-80`}
      ref={container}
    >
      {/* Welcome Screen or Exercise Display (when no Q&A messages) */}
      {messages.length === 0 && !currentExercise ? (
        <div className="h-full w-full grid place-content-center text-center px-12">
          {/* Personalized Welcome */}
          <h2 className="text-8xl font-bold text-white/90 italic mb-6">
            ¡Hola, {studentName || 'Estudiante'}!
          </h2>
          <p className="text-5xl text-blue-300/90 mb-12 font-semibold">
            ¡Aprendamos Matemáticas Juntos!
          </p>

          {/* AI Recommendation Card */}
          {recommendation && (
            <div className="bg-gradient-to-br from-purple-500/40 to-blue-500/40 backdrop-blur-sm rounded-3xl p-12 border-4 border-white/30">
              <div className="flex items-center justify-center mb-8">
                <span className="text-9xl mr-6">🤖</span>
                <h3 className="text-7xl font-bold text-white">Actividad Recomendada a Reforzar Hoy</h3>
              </div>

              <div className="bg-white/20 rounded-2xl p-8 mb-8">
                {/* Activity Type (pre-selected by AI) */}
                <div className="mb-6">
                  <p className="text-white/80 text-3xl mb-2">Actividad Recomendada</p>
                  <p className="text-6xl font-bold text-yellow-300">
                    {recommendation.type === 'addition' ? 'Sumas' :
                     recommendation.type === 'subtraction' ? 'Restas' :
                     recommendation.type === 'multiplication' ? 'Multiplicación' :
                     recommendation.type === 'division' ? 'División' : 'Fracciones'}
                  </p>
                </div>

                {/* Difficulty Selection Buttons */}
                <div className="mb-6">
                  <p className="text-white/80 text-3xl mb-4">Selecciona la Dificultad</p>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedDifficulty('easy')}
                      className={`p-6 rounded-xl text-4xl font-bold transition-all duration-200 ${
                        selectedDifficulty === 'easy'
                          ? 'bg-green-500 text-white shadow-2xl scale-110 border-4 border-white'
                          : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/30'
                      }`}
                    >
                      Fácil
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDifficulty('medium')}
                      className={`p-6 rounded-xl text-4xl font-bold transition-all duration-200 ${
                        selectedDifficulty === 'medium'
                          ? 'bg-yellow-500 text-white shadow-2xl scale-110 border-4 border-white'
                          : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/30'
                      }`}
                    >
                      Medio
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDifficulty('hard')}
                      className={`p-6 rounded-xl text-4xl font-bold transition-all duration-200 ${
                        selectedDifficulty === 'hard'
                          ? 'bg-red-500 text-white shadow-2xl scale-110 border-4 border-white'
                          : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/30'
                      }`}
                    >
                      Difícil
                    </button>
                  </div>
                  {/* AI Recommendation hint */}
                  <p className="text-white/60 text-2xl mt-3 text-center italic">
                    Recomendado: {recommendation.difficulty === 'easy' ? 'Fácil' :
                     recommendation.difficulty === 'medium' ? 'Medio' : 'Difícil'}
                  </p>
                </div>

                <div>
                  <p className="text-white/80 text-3xl mb-3">💡 Razón</p>
                  <p className="text-4xl text-white font-medium leading-relaxed">{recommendation.reason}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={generateExercise}
                disabled={!selectedDifficulty}
                className={`w-full font-bold py-6 px-8 rounded-2xl shadow-lg transition-all duration-200 text-5xl ${
                  selectedDifficulty
                    ? 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white transform hover:scale-105'
                    : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                }`}
              >
                {selectedDifficulty ? '🎯 Comenzar' : '⚠️ Selecciona Dificultad'}
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Exercise Display (on blackboard) */}
      {currentExercise && messages.length === 0 ? (
        <div className="h-full w-full grid place-content-center text-center px-12">
          <div className="bg-gradient-to-br from-blue-500/40 to-purple-500/40 backdrop-blur-sm rounded-3xl p-12 border-4 border-white/30 max-w-5xl mx-auto">
            {/* Exercise Question */}
            <div className="mb-12">
              <p className="text-4xl text-white/80 mb-4">Resuelve el siguiente problema:</p>
              <h3 className="text-9xl font-bold text-white">{currentExercise.question}</h3>
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {currentExercise.options.map((option, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setSelectedAnswer(option)}
                  className={`p-8 rounded-2xl text-6xl font-bold transition-all duration-200 ${
                    selectedAnswer === option
                      ? 'bg-blue-500 text-white shadow-2xl scale-110 border-4 border-white'
                      : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/30'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            {selectedAnswer && (
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-6 px-8 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 text-5xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '⏳ Enviando...' : '✓ Enviar Respuesta'}
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Messages List */}
      {messages.map((message, i) => (
        <div key={i} className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex">
            <div className="flex-grow">
              {/* Problem */}
              <div className="mb-6">
                <div className="inline-block px-4 py-2 bg-blue-500/40 rounded-lg mb-3">
                  <span className="text-3xl font-semibold text-white">
                    Problema
                  </span>
                </div>
                <p className="text-7xl font-bold text-white mt-2">
                  {message.problemText}
                </p>
              </div>

              {/* Student Answer (if incorrect and has studentAnswer) */}
              {!message.isCorrect && message.studentAnswer && (
                <div className="mb-6 p-6 bg-red-500/20 rounded-xl border-2 border-red-400/30">
                  <div className="text-3xl text-red-300 mb-2 font-semibold">
                    Tu respuesta:
                  </div>
                  <div className="text-6xl font-bold text-red-400">
                    {message.studentAnswer}
                  </div>
                </div>
              )}

              {/* Celebration (only for correct exercise answers) */}
              {message.isCorrect && message.studentAnswer && (
                <div className="text-9xl font-bold text-green-400 text-center animate-bounce my-8">
                  ¡CORRECTO! 🎉
                </div>
              )}

              {/* Explanation / Steps */}
              {message.explanation.steps && message.explanation.steps.length > 0 && (
                <div className="mt-6 p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border-2 border-blue-400/30">
                  <div className="text-4xl font-bold text-blue-300 mb-4 flex items-center">
                    <span className="mr-3">📝</span>
                    Solución Paso a Paso
                  </div>
                  <div className="space-y-3">
                    {message.explanation.steps.map((step, index) => (
                      <div
                        key={index}
                        className="text-3xl text-white bg-white/10 p-4 rounded-lg"
                      >
                        <span className="font-bold text-yellow-300 mr-3">
                          {index + 1}.
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Play/Stop Button (copied from reference) */}
            {currentMessage === message ? (
              <button
                type="button"
                aria-label="Detener audio"
                className="text-white/65 ml-4"
                onClick={() => stopMessage(message)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-16 h-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z"
                  />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                aria-label="Reproducir audio"
                className="text-white/65 ml-4"
                onClick={() => playMessage(message)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-16 h-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
