/**
 * Dashboard del Estudiante
 * Ruta: /dashboard/student
 */

'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirigir si no es estudiante
    if (status === 'authenticated' && session?.user?.role !== 'student') {
      router.push('/login')
    }
  }, [session, status, router])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Learniverse</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¡Bienvenido/a, {session.user?.name}! 👋
          </h2>
          <p className="text-gray-600 text-lg">
            Estamos emocionados de verte de nuevo en tu aventura de aprendizaje.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Level Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-semibold">Nivel</p>
                <p className="text-4xl font-bold text-blue-600">
                  {session.user?.level || 1}
                </p>
              </div>
              <div className="text-5xl">🏆</div>
            </div>
          </div>

          {/* Experience Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-semibold">Experiencia</p>
                <p className="text-4xl font-bold text-purple-600">
                  {session.user?.experience || 0} XP
                </p>
              </div>
              <div className="text-5xl">⭐</div>
            </div>
          </div>

          {/* Activities Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-semibold">Actividades</p>
                <p className="text-4xl font-bold text-green-600">0</p>
              </div>
              <div className="text-5xl">📚</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Play Game Button */}
          <Link
            href="/game"
            className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-8 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center text-xl"
          >
            <span className="mr-3 text-3xl">🎮</span>
            ¡A Jugar!
          </Link>

          {/* Customize Avatar Button */}
          <Link
            href="/avatar"
            className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-8 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center text-xl"
          >
            <span className="mr-3 text-3xl">🎨</span>
            Personalizar Avatar
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white/20 backdrop-blur-md rounded-xl p-6">
          <h3 className="text-white text-xl font-semibold mb-2">
            Tu progreso está guardado
          </h3>
          <p className="text-white/90">
            Todas tus actividades, logros y experiencia se guardan automáticamente.
            ¡Sigue aprendiendo y divirtiéndote!
          </p>
        </div>
      </main>
    </div>
  )
}
