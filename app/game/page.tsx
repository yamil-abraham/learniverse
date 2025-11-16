/**
 * Game Page - Immersive 3D Teacher
 * Direct access to immersive teacher experience
 * No selection screens - streamlined flow
 */

'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamic import for 3D teacher (client-only)
const ImmersiveTeacher = dynamic(
  () => import('@/components/game/ImmersiveTeacher').then((mod) => mod.ImmersiveTeacher),
  { ssr: false }
)

export default function GamePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'student') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  const handleClose = () => {
    router.push('/dashboard/student')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'student') {
    return null
  }

  return <ImmersiveTeacher onClose={handleClose} />
}
