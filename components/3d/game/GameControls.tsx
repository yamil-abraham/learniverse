/**
 * GameControls Component
 * UI overlay for immersive teacher game
 * Includes: Start screen, activity selection, problem display, answer input, Q&A mode
 */

'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useTeacherStore } from '@/stores/teacherStore'
import type { MathActivityType, DifficultyLevel } from '@/types'

type GameMode = 'start' | 'game' | 'qa'

const ACTIVITY_TYPES: { type: MathActivityType; label: string; icon: string }[] = [
  { type: 'addition', label: 'Suma', icon: '➕' },
  { type: 'subtraction', label: 'Resta', icon: '➖' },
  { type: 'multiplication', label: 'Multiplicación', icon: '✖️' },
  { type: 'division', label: 'División', icon: '➗' },
  { type: 'fractions', label: 'Fracciones', icon: '🔢' },
]

const DIFFICULTY_LEVELS: { level: DifficultyLevel; label: string; color: string }[] = [
  { level: 'easy', label: 'Fácil', color: 'bg-green-500' },
  { level: 'medium', label: 'Medio', color: 'bg-yellow-500' },
  { level: 'hard', label: 'Difícil', color: 'bg-red-500' },
]

export function GameControls() {
  const [mode, setMode] = useState<GameMode>('start')
  const [selectedType, setSelectedType] = useState<MathActivityType>('addition')
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium')
  const [answer, setAnswer] = useState('')
  const [question, setQuestion] = useState('')
  const [aiRecommendation, setAiRecommendation] = useState<{
    type: MathActivityType
    difficulty: DifficultyLevel
    reason: string
  } | null>(null)

  // Game store
  const currentActivity = useGameStore((state) => state.currentActivity)
  const loadActivity = useGameStore((state) => state.loadActivity)
  const submitAnswer = useGameStore((state) => state.submitAnswer)
  const isActivityLoading = useGameStore((state) => state.isActivityLoading)
  const isSubmitting = useGameStore((state) => state.isSubmitting)
  const lastResult = useGameStore((state) => state.lastResult)
  const showFeedback = useGameStore((state) => state.showFeedback)
  const closeFeedback = useGameStore((state) => state.closeFeedback)
  const resetActivity = useGameStore((state) => state.resetActivity)

  // Teacher store
  const requestExplanation = useTeacherStore((state) => state.requestExplanation)
  const requestQAResponse = useTeacherStore((state) => state.requestQAResponse)

  // Get AI recommendation on mount
  useEffect(() => {
    const getRecommendation = async () => {
      try {
        const res = await fetch('/api/ai/recommend-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setAiRecommendation(data.recommendation)
            setSelectedType(data.recommendation.type)
            setSelectedDifficulty(data.recommendation.difficulty)
          }
        }
      } catch (error) {
        console.error('Error getting AI recommendation:', error)
      }
    }
    getRecommendation()
  }, [])

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !currentActivity) return

    await submitAnswer(answer)
    setAnswer('')
  }

  // Handle question submission (Q&A mode)
  const handleSubmitQuestion = async () => {
    if (!question.trim()) return

    await requestQAResponse(question)
    setQuestion('')
  }

  // Handle starting game
  const handleStartGame = async () => {
    setMode('game')
    await loadActivity(selectedType, selectedDifficulty)
  }

  // Handle next problem
  const handleNextProblem = () => {
    closeFeedback()
    resetActivity()
    loadActivity(selectedType, selectedDifficulty)
  }

  // Handle switching to Q&A mode
  const handleSwitchToQA = () => {
    resetActivity()
    setMode('qa')
  }

  // Auto-request explanation when answer is submitted
  useEffect(() => {
    if (lastResult && currentActivity && mode === 'game') {
      requestExplanation(
        currentActivity.question,
        lastResult.studentAnswer || '',
        currentActivity.correctAnswer,
        lastResult.isCorrect
      )
    }
  }, [lastResult, currentActivity, mode, requestExplanation])

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
      {/* START SCREEN */}
      {mode === 'start' && (
        <div className="bg-gradient-to-br from-purple-600/95 to-blue-600/95 backdrop-blur-md rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl">
          <h1 className="text-5xl font-bold text-white text-center mb-6">
            ¡Bienvenido al Aula 3D! 🎓
          </h1>

          {/* AI Recommendation */}
          {aiRecommendation && (
            <div className="bg-yellow-400/20 border-2 border-yellow-400/40 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🤖</span>
                <h3 className="text-2xl font-bold text-yellow-200">
                  Recomendación del Profesor
                </h3>
              </div>
              <p className="text-xl text-white">{aiRecommendation.reason}</p>
              <div className="flex gap-4 mt-4">
                <span className="px-4 py-2 bg-white/20 rounded-lg text-lg font-semibold text-white">
                  {ACTIVITY_TYPES.find(t => t.type === aiRecommendation.type)?.icon}{' '}
                  {ACTIVITY_TYPES.find(t => t.type === aiRecommendation.type)?.label}
                </span>
                <span className={`px-4 py-2 ${DIFFICULTY_LEVELS.find(d => d.level === aiRecommendation.difficulty)?.color} rounded-lg text-lg font-semibold text-white`}>
                  {DIFFICULTY_LEVELS.find(d => d.level === aiRecommendation.difficulty)?.label}
                </span>
              </div>
            </div>
          )}

          {/* Activity Type Selection */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-4">Tipo de Actividad</h3>
            <div className="grid grid-cols-5 gap-3">
              {ACTIVITY_TYPES.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`p-4 rounded-xl transition-all ${
                    selectedType === type
                      ? 'bg-white text-purple-600 scale-105 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className="text-sm font-semibold">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-4">Dificultad</h3>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_LEVELS.map(({ level, label, color }) => (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`p-4 rounded-xl font-bold text-white transition-all ${
                    selectedDifficulty === level
                      ? `${color} scale-105 shadow-lg`
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleStartGame}
              disabled={isActivityLoading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-2xl font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
            >
              {isActivityLoading ? 'Cargando...' : '🚀 Comenzar Actividad'}
            </button>
            <button
              onClick={handleSwitchToQA}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-2xl font-bold py-4 rounded-xl transition-all shadow-lg"
            >
              💬 Modo Preguntas y Respuestas
            </button>
          </div>
        </div>
      )}

      {/* GAME MODE */}
      {mode === 'game' && currentActivity && !showFeedback && (
        <div className="bg-gradient-to-br from-indigo-600/95 to-purple-600/95 backdrop-blur-md rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl">
          {/* Problem Display */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Problema</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-sm text-white">
                  {ACTIVITY_TYPES.find(t => t.type === currentActivity.type)?.icon}{' '}
                  {ACTIVITY_TYPES.find(t => t.type === currentActivity.type)?.label}
                </span>
                <span className={`px-3 py-1 ${DIFFICULTY_LEVELS.find(d => d.level === currentActivity.difficulty)?.color} rounded-lg text-sm text-white`}>
                  {DIFFICULTY_LEVELS.find(d => d.level === currentActivity.difficulty)?.label}
                </span>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <p className="text-5xl font-bold text-white">{currentActivity.question}</p>
            </div>
          </div>

          {/* Answer Input */}
          <div className="mb-6">
            <label className="block text-xl font-semibold text-white mb-3">
              Tu Respuesta
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                placeholder="Escribe tu respuesta aquí..."
                className="flex-1 px-6 py-4 text-2xl rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-400"
                disabled={isSubmitting}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || isSubmitting}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-xl font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : '✓ Enviar'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setMode('start')}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all"
            >
              ← Volver al Inicio
            </button>
            <button
              onClick={handleSwitchToQA}
              className="px-6 py-3 bg-blue-500/80 hover:bg-blue-600/80 text-white font-semibold rounded-lg transition-all"
            >
              💬 Cambiar a Modo Preguntas
            </button>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL (After answer) */}
      {mode === 'game' && showFeedback && lastResult && (
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl">
          <div className="text-center mb-6">
            {lastResult.isCorrect ? (
              <>
                <div className="text-8xl mb-4">🎉</div>
                <h2 className="text-5xl font-bold text-green-400">¡Correcto!</h2>
              </>
            ) : (
              <>
                <div className="text-8xl mb-4">💡</div>
                <h2 className="text-5xl font-bold text-yellow-400">No te preocupes</h2>
                <p className="text-2xl text-white mt-2">El profesor te explicará</p>
              </>
            )}
          </div>

          <div className="bg-white/10 rounded-xl p-6 mb-6">
            <p className="text-xl text-white">{lastResult.feedback}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleNextProblem}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xl font-bold py-4 rounded-xl transition-all shadow-lg"
            >
              ➡️ Siguiente Problema
            </button>
            <button
              onClick={() => setMode('start')}
              className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all"
            >
              🏠 Volver al Inicio
            </button>
          </div>
        </div>
      )}

      {/* Q&A MODE */}
      {mode === 'qa' && (
        <div className="bg-gradient-to-br from-cyan-600/95 to-blue-600/95 backdrop-blur-md rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl">
          <h2 className="text-4xl font-bold text-white text-center mb-6">
            💬 Pregúntale al Profesor
          </h2>

          {/* Question Input */}
          <div className="mb-6">
            <label className="block text-xl font-semibold text-white mb-3">
              Escribe tu pregunta
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuestion()}
                placeholder="¿Cómo se resuelve...?"
                className="flex-1 px-6 py-4 text-2xl rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-400"
              />
              <button
                onClick={handleSubmitQuestion}
                disabled={!question.trim()}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-xl font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
              >
                📤 Enviar
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-cyan-400/20 border-2 border-cyan-400/40 rounded-xl p-4 mb-6">
            <p className="text-lg text-white text-center">
              💡 Haz cualquier pregunta sobre matemáticas y el profesor te responderá
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setMode('start')}
              className="flex-1 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all"
            >
              ← Volver al Inicio
            </button>
            <button
              onClick={handleStartGame}
              className="flex-1 px-6 py-3 bg-purple-500/80 hover:bg-purple-600/80 text-white font-semibold rounded-lg transition-all"
            >
              🎮 Cambiar a Modo Juego
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
