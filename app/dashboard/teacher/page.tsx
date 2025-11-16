/**
 * Dashboard del Profesor - Redirect
 * Ruta: /dashboard/teacher
 * Redirects to /teacher where the full dashboard is located
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-white text-xl">Redirigiendo al panel de profesor...</div>
    </div>
  )
}
