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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 rounded-lg p-2">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Learniverse - Panel del Profesor
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {session.user.name || 'Profesor'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/teacher/students/new')}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo Estudiante</span>
              </button>
              <button
                onClick={() => router.push('/teacher/assignments/new')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva Tarea</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Quick Stats Summary */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-indigo-100">Total Estudiantes</div>
              <div className="mt-1 text-3xl font-bold">{stats?.totalStudents || 0}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-indigo-100">Activos Hoy</div>
              <div className="mt-1 text-3xl font-bold">{stats?.activeStudentsToday || 0}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-indigo-100">Rendimiento Promedio</div>
              <div className="mt-1 text-3xl font-bold">{stats?.averageClassPerformance?.toFixed(0) || 0}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-indigo-100">Alertas Pendientes</div>
              <div className="mt-1 text-3xl font-bold">{stats?.unreadAlerts || 0}</div>
            </div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <button
            onClick={() => router.push('/teacher/students')}
            className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-slate-400" />
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalStudents || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Estudiantes Totales</div>
            <div className="mt-2 text-xs text-slate-500">
              {stats?.activeStudentsWeek || 0} activos esta semana
            </div>
          </button>

          <button
            onClick={() => router.push('/teacher/analytics')}
            className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-slate-400" />
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-green-600 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalActivitiesToday || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Actividades Hoy</div>
            <div className="mt-2 text-xs text-slate-500">
              {stats?.totalActivitiesWeek || 0} esta semana
            </div>
          </button>

          <button
            onClick={() => router.push('/teacher/classes')}
            className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <GraduationCap className="h-5 w-5 text-slate-400" />
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalClasses || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Clases Activas</div>
            <div className="mt-2 text-xs text-slate-500">
              {stats?.totalAssignments || 0} tareas asignadas
            </div>
          </button>

          <button
            onClick={() => router.push('/teacher/alerts')}
            className={`group relative overflow-hidden rounded-lg border p-4 hover:shadow-md transition-all text-left ${
              stats && stats.unreadAlerts > 0
                ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className={`h-5 w-5 ${stats && stats.unreadAlerts > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
              <ArrowRight className={`h-4 w-4 transition-colors ${stats && stats.unreadAlerts > 0 ? 'text-amber-600' : 'text-slate-400 group-hover:text-amber-600'}`} />
            </div>
            <div className={`text-2xl font-bold ${stats && stats.unreadAlerts > 0 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
              {stats?.unreadAlerts || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Alertas Sin Leer</div>
            <div className="mt-2 text-xs text-slate-500">
              Requieren atención
            </div>
          </button>
        </div>

        {/* Performance Overview */}
        <div className="grid gap-4 lg:grid-cols-2 mb-6">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Rendimiento General
              </h2>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Promedio de Clase</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {stats?.averageClassPerformance?.toFixed(1) || '0'}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${stats?.averageClassPerformance || 0}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Actividades completadas hoy
                </span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats?.totalActivitiesCompletedToday || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Estudiantes que necesitan atención
                </span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats?.studentsNeedingAttention || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Alertas Recientes
              </h2>
              <button
                onClick={() => router.push('/teacher/alerts')}
                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:gap-2 transition-all"
              >
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {alertsLoading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Cargando alertas...</p>
              ) : alerts.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No hay alertas nuevas</p>
              ) : (
                alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
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
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {alert.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
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
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Estudiantes que Necesitan Atención
              </h2>
            </div>
            <button
              onClick={() => router.push('/teacher/students?filter=struggling')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:gap-2 transition-all"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {studentsLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Cargando estudiantes...</p>
          ) : studentsNeedingAttention.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
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
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all"
          >
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3">
              <Plus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-slate-900 dark:text-white">Nueva Clase</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Crear un nuevo grupo</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/teacher/assignments/new')}
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all"
          >
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3">
              <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-slate-900 dark:text-white">Nueva Asignación</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Asignar actividades</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/teacher/analytics')}
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all"
          >
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3">
              <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-slate-900 dark:text-white">Analíticas</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ver reportes detallados</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
