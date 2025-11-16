/**
 * Dashboard del Estudiante
 * Ruta: /dashboard/student
 */

'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { MathActivityType, DifficultyLevel, Class } from '@/types'

interface Recommendation {
  activityType: MathActivityType
  difficulty: DifficultyLevel
  reason: string
  confidence: number
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)

  useEffect(() => {
    // Redirigir si no es estudiante
    if (status === 'authenticated' && session?.user?.role !== 'student') {
      router.push('/login')
    }
  }, [session, status, router])

  // Phase 4 Adaptive: Load recommendation
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'student') {
      loadRecommendation()
      loadClasses()
    }
  }, [status, session])

  const loadRecommendation = async () => {
    setIsLoadingRecommendation(true)
    try {
      const response = await fetch('/api/ai/recommend-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRecommendation(data.recommendation)
        }
      }
    } catch (error) {
      console.error('Error loading recommendation:', error)
    } finally {
      setIsLoadingRecommendation(false)
    }
  }

  const loadClasses = async () => {
    setIsLoadingClasses(true)
    try {
      const response = await fetch('/api/student/classes')

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setClasses(data.classes)
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error)
    } finally {
      setIsLoadingClasses(false)
    }
  }

  const getActivityLabel = (type: MathActivityType): string => {
    const labels: Record<MathActivityType, string> = {
      addition: 'Suma',
      subtraction: 'Resta',
      multiplication: 'Multiplicación',
      division: 'División',
      fractions: 'Fracciones'
    }
    return labels[type]
  }

  const getDifficultyLabel = (difficulty: DifficultyLevel): string => {
    const labels: Record<DifficultyLevel, string> = {
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil'
    }
    return labels[difficulty]
  }

  const getActivityIcon = (type: MathActivityType): string => {
    const icons: Record<MathActivityType, string> = {
      addition: '+',
      subtraction: '-',
      multiplication: '×',
      division: '÷',
      fractions: '½'
    }
    return icons[type]
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-32 right-20 w-16 h-16 bg-pink-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-green-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-3 shadow-lg transform hover:rotate-12 transition-transform">
                <span className="text-4xl">🚀</span>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-wide">LEARNIVERSE</h1>
                <p className="text-sm text-white/80 font-medium">¡Tu Aventura Matemática!</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-full transition-all text-sm backdrop-blur-sm border-2 border-white/30"
            >
              ← Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Character */}
        <div className="relative bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden transform hover:scale-105 transition-transform">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -mr-24 -mt-24" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full -ml-16 -mb-16" />

          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-5xl font-black text-white mb-3 drop-shadow-lg">
                ¡Hola, {session.user?.name}! 🎉
              </h2>
              <p className="text-2xl text-white/90 font-bold">
                ¡Listo para una nueva aventura matemática!
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white rounded-full p-6 shadow-2xl animate-bounce">
                <span className="text-7xl">🌟</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 4 Adaptive: AI Recommendation Card */}
        {recommendation && !isLoadingRecommendation && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-2xl p-8 mb-8 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-3xl mr-3">🤖</span>
                  <h3 className="text-2xl font-bold">Recomendación IA</h3>
                </div>
                <p className="text-white/90 text-sm mb-4">
                  Basado en tu desempeño reciente
                </p>
              </div>
              <div className="text-6xl opacity-20">
                {getActivityIcon(recommendation.activityType)}
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-white/80 text-sm mb-1">Actividad recomendada</p>
                  <p className="text-2xl font-bold">
                    {getActivityLabel(recommendation.activityType)}
                  </p>
                </div>
                <div>
                  <p className="text-white/80 text-sm mb-1">Dificultad</p>
                  <p className="text-2xl font-bold">
                    {getDifficultyLabel(recommendation.difficulty)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-white/80 text-sm mb-2">💡 Razón</p>
                <p className="text-white font-medium">{recommendation.reason}</p>
              </div>
            </div>

            <Link
              href={`/game?type=${recommendation.activityType}&difficulty=${recommendation.difficulty}&recommended=true`}
              className="block w-full bg-white hover:bg-gray-100 text-purple-600 font-bold py-4 px-6 rounded-xl shadow-lg text-center transition-all duration-200 transform hover:scale-105"
            >
              🎯 Comenzar actividad recomendada
            </Link>
          </div>
        )}

        {isLoadingRecommendation && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="flex items-center justify-center">
              <div className="text-gray-600">
                🤖 Analizando tu progreso...
              </div>
            </div>
          </div>
        )}

        {/* Stats Section - Gamified Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Level Card */}
          <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl p-6 overflow-hidden transform hover:scale-105 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white rounded-full p-3 shadow-lg">
                  <span className="text-4xl">🏆</span>
                </div>
                <span className="text-white/80 font-bold text-lg">NIVEL</span>
              </div>
              <div className="text-6xl font-black text-white drop-shadow-lg mb-2">
                {session.user?.level || 1}
              </div>
              <div className="bg-white/30 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${((session.user?.experience || 0) % 100)}%` }}
                />
              </div>
              <p className="text-white/90 text-sm font-bold mt-2">
                {100 - ((session.user?.experience || 0) % 100)} XP para subir
              </p>
            </div>
          </div>

          {/* Experience Card */}
          <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-6 overflow-hidden transform hover:scale-105 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white rounded-full p-3 shadow-lg">
                  <span className="text-4xl">⭐</span>
                </div>
                <span className="text-white/80 font-bold text-lg">EXPERIENCIA</span>
              </div>
              <div className="text-6xl font-black text-white drop-shadow-lg mb-2">
                {session.user?.experience || 0}
              </div>
              <p className="text-white/90 text-sm font-bold">XP Totales</p>
            </div>
          </div>

          {/* Activities Card */}
          <div className="relative bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl shadow-2xl p-6 overflow-hidden transform hover:scale-105 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white rounded-full p-3 shadow-lg">
                  <span className="text-4xl">🎯</span>
                </div>
                <span className="text-white/80 font-bold text-lg">EJERCICIOS</span>
              </div>
              <div className="text-6xl font-black text-white drop-shadow-lg mb-2">
                0
              </div>
              <p className="text-white/90 text-sm font-bold">Completados hoy</p>
            </div>
          </div>
        </div>

        {/* Giant Play Button */}
        <div className="max-w-2xl mx-auto mb-8">
          <Link
            href="/game"
            className="group relative block bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 hover:from-green-500 hover:via-emerald-600 hover:to-teal-600 text-white font-black py-10 px-8 rounded-3xl shadow-2xl transform hover:scale-110 transition-all duration-300 overflow-hidden"
          >
            {/* Animated background shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />

            <div className="relative flex items-center justify-center gap-4">
              <div className="bg-white rounded-full p-4 shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-6xl animate-bounce">🎮</span>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black drop-shadow-lg">¡A JUGAR!</div>
                <div className="text-xl text-white/90 font-bold mt-1">Comienza tu aventura</div>
              </div>
            </div>

            {/* Pulse effect */}
            <div className="absolute inset-0 rounded-3xl border-4 border-white/30 group-hover:border-white/60 transition-all" />
          </Link>
        </div>

        {/* My Classes Section */}
        {classes.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h3 className="text-4xl font-black text-gray-800 mb-6 flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-3 shadow-lg">
                <span className="text-4xl">🏫</span>
              </div>
              MIS CLASES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="relative border-4 border-dashed border-indigo-300 rounded-2xl p-6 hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-purple-50 hover:scale-105 transform"
                >
                  <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h4 className="text-2xl font-black text-indigo-600 mb-2">
                    {classItem.name}
                  </h4>
                  {classItem.description && (
                    <p className="text-gray-700 text-base mb-4 font-medium">
                      {classItem.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-base">
                    {classItem.grade && (
                      <span className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full font-bold text-blue-700">
                        <span>📚</span>
                        Grado {classItem.grade}
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-purple-100 px-3 py-1 rounded-full font-bold text-purple-700">
                      <span>👥</span>
                      {classItem.studentCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoadingClasses && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="flex items-center justify-center">
              <div className="text-gray-600">
                🏫 Cargando clases...
              </div>
            </div>
          </div>
        )}

        {/* Motivational Footer */}
        <div className="relative mt-8 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-3xl p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full -ml-12 -mb-12" />

          <div className="relative flex items-center gap-4">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <span className="text-5xl">💪</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
                ¡TÚ PUEDES HACERLO!
              </h3>
              <p className="text-xl text-white/90 font-bold">
                Cada problema que resuelves te hace más inteligente. ¡Sigue así, campeón!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
