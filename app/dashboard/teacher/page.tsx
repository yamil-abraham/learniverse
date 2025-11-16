/**
 * Dashboard del Profesor - Redirect
 * Ruta: /dashboard/teacher
 * Redirects to /teacher where the full dashboard is located
 * Updated with v0 loading state
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, GraduationCap } from 'lucide-react'

export default function TeacherDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect to the full teacher dashboard
    if (status === 'authenticated' && session?.user?.role === 'teacher') {
      router.replace('/teacher')
    } else if (status === 'authenticated' && session?.user?.role !== 'teacher') {
      router.push('/login')
    }
  }, [session, status, router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-6 rounded-full bg-primary/10">
          <GraduationCap className="size-16 text-primary animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="size-5 animate-spin text-primary" />
          <p className="text-xl text-muted-foreground">Redirigiendo al panel de profesor...</p>
        </div>
      </div>
    </div>
  )
}
