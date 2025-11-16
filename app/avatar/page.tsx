/**
 * Avatar Page - Disabled
 * Redirects to student dashboard
 * Avatar customization feature has been removed
 */

'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AvatarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect students to dashboard
    if (status === 'authenticated' && session?.user?.role === 'student') {
      router.replace('/dashboard/student')
    } else if (status === 'authenticated') {
      router.push('/login')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-white text-xl">Redirigiendo...</div>
    </div>
  )
}
