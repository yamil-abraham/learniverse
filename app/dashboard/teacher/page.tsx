/**
 * Dashboard del Profesor
 * Ruta: /dashboard/teacher
 */

'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TeacherDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirigir si no es profesor
    if (status === 'authenticated' && session?.user?.role !== 'teacher') {
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
            <h1 className="text-2xl font-bold text-white">Learniverse - Panel del Profesor</h1>
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
            ¡Bienvenido/a, Profesor/a {session.user?.name}! 👨‍🏫
          </h2>
          <p className="text-gray-600 text-lg">
            Desde aquí podrás gestionar a tus estudiantes y hacer seguimiento de su progreso.
          </p>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="text-8xl mb-6">🚧</div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Panel de Profesor - Próximamente
          </h3>
          <p className="text-gray-600 text-lg mb-6">
            Estamos trabajando en las siguientes funcionalidades:
          </p>
          <ul className="text-left max-w-2xl mx-auto space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span>Ver lista de estudiantes asignados</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span>Hacer seguimiento del progreso de cada estudiante</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span>Ver estadísticas de rendimiento</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span>Asignar actividades personalizadas</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span>Generar reportes de actividades</span>
            </li>
          </ul>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white/20 backdrop-blur-md rounded-xl p-6">
          <h3 className="text-white text-xl font-semibold mb-2">
            Fase 1 Completada
          </h3>
          <p className="text-white/90">
            El sistema de autenticación está funcionando correctamente.
            Las funcionalidades de gestión de estudiantes estarán disponibles en la Fase 2.
          </p>
        </div>
      </main>
    </div>
  )
}
