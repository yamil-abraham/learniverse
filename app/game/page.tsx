/**
 * Game Page - Immersive 3D Teacher
 * Direct access to immersive teacher experience
 * No selection screens - streamlined flow
 * Updated with v0 loading state
 */

'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Loader2, Gamepad2 } from 'lucide-react'

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-6 rounded-full bg-primary/10">
            <Gamepad2 className="size-16 text-primary animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="size-5 animate-spin text-primary" />
            <p className="text-xl text-muted-foreground">Cargando experiencia...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'student') {
    return null
  }

  return <ImmersiveTeacher onClose={handleClose} />
}
