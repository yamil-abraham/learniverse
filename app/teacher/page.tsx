/**
 * Teacher Dashboard Overview Page
 * Main dashboard with stats, alerts, and quick actions
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Users,
  UserCheck,
  GraduationCap,
  AlertCircle,
  TrendingUp,
  Calendar,
  Plus,
  ArrowRight
} from 'lucide-react'
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'
import { DashboardCard } from '@/components/teacher/DashboardCard'
import { StudentCard } from '@/components/teacher/StudentCard'
import { AlertBadge } from '@/components/teacher/AlertBadge'

export default function TeacherDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const {
    stats,
    statsLoading,
    students,
    studentsLoading,
    alerts,
    alertsLoading,
    fetchDashboardStats,
    fetchStudents,
    fetchAlerts
  } = useTeacherDashboard()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'teacher') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      fetchDashboardStats()
      fetchStudents({ performanceLevel: 'struggling' }) // Load students needing attention
      fetchAlerts(true) // Load unread alerts only
    }
  }, [status, session, router])

  if (status === 'loading' || statsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'teacher') {
    return null
  }

  const studentsNeedingAttention = students.filter(s => s.needsAttention).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Panel de Profesor
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Bienvenido, {session.user.name || 'Profesor'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <DashboardCard
            title="Estudiantes Totales"
            value={stats?.totalStudents || 0}
            icon={Users}
            variant="default"
            loading={statsLoading}
            onClick={() => router.push('/teacher/students')}
          />
          <DashboardCard
            title="Activos Hoy"
            value={stats?.activeStudentsToday || 0}
            subtitle={`${stats?.activeStudentsWeek || 0} esta semana`}
            icon={UserCheck}
            variant="success"
            loading={statsLoading}
          />
          <DashboardCard
            title="Clases"
            value={stats?.totalClasses || 0}
            icon={GraduationCap}
            variant="default"
            loading={statsLoading}
            onClick={() => router.push('/teacher/classes')}
          />
          <DashboardCard
            title="Alertas"
            value={stats?.unreadAlerts || 0}
            subtitle="Sin leer"
            icon={AlertCircle}
            variant={stats && stats.unreadAlerts > 0 ? 'warning' : 'default'}
            loading={statsLoading}
            onClick={() => router.push('/teacher/alerts')}
          />
        </div>

        {/* Performance Overview */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rendimiento General
              </h2>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Promedio de Clase</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats?.averageClassPerformance?.toFixed(1) || '0'}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${stats?.averageClassPerformance || 0}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Actividades completadas hoy
                </span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats?.totalActivitiesCompletedToday || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Estudiantes que necesitan atención
                </span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats?.studentsNeedingAttention || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Alertas Recientes
              </h2>
              <button
                onClick={() => router.push('/teacher/alerts')}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
              >
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {alertsLoading ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Cargando alertas...</p>
              ) : alerts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay alertas nuevas</p>
              ) : (
                alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => router.push('/teacher/alerts')}
                  >
                    <AlertBadge
                      severity={
                        alert.severity === 'info' ? 'low' :
                        alert.severity === 'warning' ? 'medium' :
                        'low'
                      }
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {alert.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {alert.studentName}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Students Needing Attention */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estudiantes que Necesitan Atención
            </h2>
            <button
              onClick={() => router.push('/teacher/students?filter=struggling')}
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {studentsLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Cargando estudiantes...</p>
          ) : studentsNeedingAttention.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                ¡Excelente! No hay estudiantes que necesiten atención especial en este momento.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {studentsNeedingAttention.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onClick={() => router.push(`/teacher/students/${student.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => router.push('/teacher/classes/new')}
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all"
          >
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3">
              <Plus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900 dark:text-white">Nueva Clase</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Crear un nuevo grupo</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/teacher/assignments/new')}
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all"
          >
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3">
              <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900 dark:text-white">Nueva Asignación</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Asignar actividades</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/teacher/analytics')}
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all"
          >
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3">
              <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900 dark:text-white">Analíticas</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ver reportes detallados</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
