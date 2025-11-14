/**
 * Avatar Customization Page
 * Route: /avatar
 * Protected route for students only
 */

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AvatarCustomizer from '@/components/avatar/AvatarCustomizer'
import { DEFAULT_AVATAR_CONFIG } from '@/types'
import type { AvatarConfig } from '@/types'

export default function AvatarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'student') {
      router.push('/login')
    }
  }, [session, status, router])

  // Load avatar configuration on mount
  useEffect(() => {
    const loadAvatar = async () => {
      if (status === 'authenticated' && session?.user?.studentId) {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/avatar/load?studentId=${session.user.studentId}`)

          if (!response.ok) {
            throw new Error('Error al cargar avatar')
          }

          const data = await response.json()

          if (data.success && data.avatarConfig) {
            setAvatarConfig(data.avatarConfig)
          }
        } catch (err) {
          console.error('Error loading avatar:', err)
          setError('Error al cargar tu avatar. Usando configuración por defecto.')
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadAvatar()
  }, [session, status])

  // Handle save
  const handleSave = async (config: AvatarConfig) => {
    if (!session?.user?.studentId) {
      setError('No se pudo identificar tu cuenta de estudiante')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      const response = await fetch('/api/avatar/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: session.user.studentId,
          avatarConfig: config,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Error al guardar avatar')
      }

      setSuccessMessage('¡Avatar guardado exitosamente!')
      setAvatarConfig(config)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error saving avatar:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
          <p className="text-white text-xl font-semibold">Cargando tu avatar...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or not a student
  if (!session || session.user?.role !== 'student') {
    return null
  }

  return (
    <div className="relative">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="absolute top-1 right-1 text-white hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Back to Dashboard Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push('/dashboard/student')}
          className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Volver al Dashboard</span>
        </button>
      </div>

      {/* Avatar Customizer */}
      <AvatarCustomizer
        initialConfig={avatarConfig}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  )
}
