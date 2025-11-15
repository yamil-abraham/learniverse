/**
 * Game Page
 * Main page for playing math activities
 * Phase 3 - Learniverse
 */

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useGameStore, startGameTimer } from '@/stores/gameStore'
import type { MathActivityType, DifficultyLevel } from '@/types'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badges'

export default function GamePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const {
    currentActivity,
    isActivityLoading,
    activityError,
    isSubmitting,
    lastResult,
    showFeedback,
    timeRemaining,
    hintsUsed,
    sessionCorrect,
    sessionIncorrect,
    sessionPoints,
    aiHints,
    isLoadingAIHint,
    loadActivity,
    submitAnswer,
    useHint,
    getAIHint,
    resetActivity,
    closeFeedback
  } = useGameStore()

  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [currentHint, setCurrentHint] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<MathActivityType>('addition')
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('easy')

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'student') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  // Setup timer
  useEffect(() => {
    const cleanup = startGameTimer()
    return cleanup
  }, [])

  const handleStartActivity = async () => {
    resetActivity()
    setSelectedAnswer('')
    setCurrentHint(null)
    await loadActivity(selectedType, selectedDifficulty)
  }

  const handleSubmit = async () => {
    if (!selectedAnswer.trim()) return
    await submitAnswer(selectedAnswer)
  }

  const handleUseHint = () => {
    const hint = useHint()
    if (hint) {
      setCurrentHint(hint)
    }
  }

  const handleGetAIHint = async () => {
    if (!currentActivity) return
    await getAIHint(
      currentActivity.id || 'dynamic',
      currentActivity.question,
      currentActivity.correctAnswer,
      currentActivity.type
    )
  }

  const handleNextActivity = () => {
    closeFeedback()
    setSelectedAnswer('')
    setCurrentHint(null)
    loadActivity(selectedType, selectedDifficulty)
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard/student')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white">Juego de Matemáticas</h1>
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white">{sessionCorrect}</div>
            <div className="text-white/80 text-sm">Correctas</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white">{sessionIncorrect}</div>
            <div className="text-white/80 text-sm">Incorrectas</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white">{sessionPoints}</div>
            <div className="text-white/80 text-sm">Puntos</div>
          </div>
        </div>

        {/* Main Content */}
        {!currentActivity ? (
          /* Activity Selector */
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Elige tu desafío
            </h2>

            {/* Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipo de Actividad
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'addition', label: 'Suma', icon: '+' },
                  { value: 'subtraction', label: 'Resta', icon: '-' },
                  { value: 'multiplication', label: 'Multiplicación', icon: '×' },
                  { value: 'division', label: 'División', icon: '÷' },
                  { value: 'fractions', label: 'Fracciones', icon: '½' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value as MathActivityType)}
                    className={`p-4 rounded-lg font-medium transition-all ${
                      selectedType === type.value
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Dificultad
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'easy', label: 'Fácil', color: 'green' },
                  { value: 'medium', label: 'Medio', color: 'yellow' },
                  { value: 'hard', label: 'Difícil', color: 'red' }
                ].map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() => setSelectedDifficulty(diff.value as DifficultyLevel)}
                    className={`p-4 rounded-lg font-medium transition-all ${
                      selectedDifficulty === diff.value
                        ? `bg-${diff.color}-500 text-white shadow-lg scale-105`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartActivity}
              disabled={isActivityLoading}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActivityLoading ? 'Cargando...' : '¡Comenzar!'}
            </button>

            {activityError && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {activityError}
              </div>
            )}
          </div>
        ) : (
          /* Activity Card */
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
            {/* Timer */}
            <div className="mb-6 flex justify-between items-center">
              <div className={`text-2xl font-bold ${timeRemaining < 10 ? 'text-red-500' : 'text-blue-500'}`}>
                ⏱️ {timeRemaining}s
              </div>
              <div className="text-lg font-semibold text-gray-600">
                {currentActivity.points} puntos
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <div className="text-center">
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium mb-4">
                  {currentActivity.type.charAt(0).toUpperCase() + currentActivity.type.slice(1)} - {currentActivity.difficulty.charAt(0).toUpperCase() + currentActivity.difficulty.slice(1)}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
                {currentActivity.question}
              </h2>

              {/* Answer Input */}
              {currentActivity.options && currentActivity.options.length > 0 ? (
                /* Multiple Choice */
                <div className="grid grid-cols-2 gap-4">
                  {currentActivity.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      className={`p-4 rounded-lg text-xl font-semibold transition-all ${
                        selectedAnswer === option
                          ? 'bg-blue-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                /* Text Input */
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Escribe tu respuesta"
                  className="w-full px-6 py-4 text-2xl font-semibold text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              )}
            </div>

            {/* Hint Display */}
            {currentHint && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                💡 <strong>Pista:</strong> {currentHint}
              </div>
            )}

            {/* AI Hints Display (Phase 4) */}
            {aiHints.length > 0 && (
              <div className="mb-6 space-y-3">
                {aiHints.map((hint, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-400 rounded-lg">
                    <div className="flex items-start">
                      <div className="text-xl mr-3">🤖</div>
                      <div>
                        <div className="text-xs font-semibold text-purple-600 mb-1">
                          Pista IA nivel {index + 1}
                        </div>
                        <div className="text-gray-700 text-sm">
                          {hint}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleUseHint}
                disabled={!currentActivity.hints || currentActivity.hints.length === 0 || hintsUsed >= (currentActivity.hints?.length || 0)}
                className="px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                💡 Pista ({hintsUsed}/{currentActivity.hints?.length || 0})
              </button>
              <button
                onClick={handleGetAIHint}
                disabled={isLoadingAIHint || aiHints.length >= 3}
                className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoadingAIHint ? '⏳ Cargando...' : `🤖 Pista IA (${aiHints.length}/3)`}
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer || isSubmitting}
              className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedback && lastResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              {/* Result Icon */}
              <div className="text-center mb-6">
                <div className={`text-6xl mb-4 ${lastResult.isCorrect ? 'animate-bounce' : ''}`}>
                  {lastResult.isCorrect ? '🎉' : '😅'}
                </div>
                <h3 className={`text-2xl font-bold ${lastResult.isCorrect ? 'text-green-600' : 'text-orange-600'}`}>
                  {lastResult.feedback}
                </h3>
              </div>

              {/* Points */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600">
                  +{lastResult.pointsEarned} puntos
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  +{lastResult.experienceEarned} XP
                </div>
              </div>

              {/* Correct Answer (if wrong) */}
              {!lastResult.isCorrect && lastResult.correctAnswer && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Respuesta correcta:</div>
                  <div className="text-xl font-bold text-blue-600">{lastResult.correctAnswer}</div>
                </div>
              )}

              {/* AI Feedback - Explanation (Phase 4) */}
              {lastResult.aiFeedback && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-400 rounded-lg">
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">🤖</div>
                    <div>
                      <div className="text-sm font-semibold text-purple-700 mb-2">
                        Explicación de IA
                      </div>
                      <div className="text-gray-700 text-sm leading-relaxed">
                        {lastResult.aiFeedback}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Encouragement (Phase 4) */}
              {lastResult.aiEncouragement && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-yellow-50 border-l-4 border-green-400 rounded-lg">
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">✨</div>
                    <div>
                      <div className="text-sm font-semibold text-green-700 mb-2">
                        Mensaje motivacional
                      </div>
                      <div className="text-gray-700 text-sm leading-relaxed">
                        {lastResult.aiEncouragement}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Level Up */}
              {lastResult.levelUp && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white text-center">
                  <div className="text-3xl mb-2">🚀</div>
                  <div className="font-bold">¡Subiste de nivel!</div>
                  <div className="text-2xl font-bold">Nivel {lastResult.newLevel}</div>
                </div>
              )}

              {/* Badges */}
              {lastResult.badgesEarned && lastResult.badgesEarned.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-600 mb-2">Insignias ganadas:</div>
                  {lastResult.badgesEarned.map((badge) => {
                    const badgeInfo = BADGE_DEFINITIONS[badge.badgeType]
                    return (
                      <div key={badge.id} className="flex items-center p-3 bg-purple-50 rounded-lg mb-2">
                        <div className="text-3xl mr-3">{badgeInfo?.icon || '🏆'}</div>
                        <div>
                          <div className="font-semibold text-purple-700">{badge.badgeName}</div>
                          <div className="text-xs text-purple-600">{badge.badgeDescription}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Next Button */}
              <button
                onClick={handleNextActivity}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Siguiente Actividad →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
