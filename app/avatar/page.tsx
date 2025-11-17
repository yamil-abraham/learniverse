/**
 * Avatar Page - Disabled
 * Redirects to student dashboard
 * Avatar customization feature has been removed
 * Updated with v0 loading state
 */

'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, User } from 'lucide-react'

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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-6 rounded-full bg-primary/10">
          <User className="size-16 text-primary animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="size-5 animate-spin text-primary" />
          <p className="text-xl text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    </div>
  )
}
