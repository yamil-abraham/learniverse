/**
 * Teacher Dashboard Overview Page
 * Main dashboard with stats, alerts, and quick actions
 * Redesigned with v0 design system - Preserves ALL functionality
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Users,
  UserCheck,
  GraduationCap,
  AlertCircle,
  TrendingUp,
  Calendar,
  Plus,
  ArrowRight,
  Loader2,
  LogOut
} from 'lucide-react'
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'
import { DashboardCard } from '@/components/teacher/DashboardCard'
import { StudentCard } from '@/components/teacher/StudentCard'
import { AlertBadge } from '@/components/teacher/AlertBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'teacher') {
    return null
  }

  const studentsNeedingAttention = students.filter(s => s.needsAttention).slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      {/* Top Navigation Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="bg-primary rounded-lg p-2">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Learniverse - Panel del Profesor
                </h1>
                <p className="text-xs text-muted-foreground">
                  {session.user.name || 'Profesor'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push('/teacher/students/new')}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nuevo Estudiante</span>
              </Button>
              <Button
                onClick={() => router.push('/teacher/assignments/new')}
                variant="outline"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nueva Tarea</span>
              </Button>
              <Button
                onClick={() => signOut({ callbackUrl: '/login' })}
                variant="ghost"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Quick Stats Summary */}
        <Card className="mb-6 overflow-hidden border-2 shadow-lg">
          <div className="bg-gradient-to-r from-primary via-accent to-secondary p-1">
            <div className="bg-background p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Estudiantes</div>
                  <div className="mt-1 text-3xl font-bold text-foreground">{stats?.totalStudents || 0}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Activos Hoy</div>
                  <div className="mt-1 text-3xl font-bold text-foreground">{stats?.activeStudentsToday || 0}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Rendimiento Promedio</div>
                  <div className="mt-1 text-3xl font-bold text-foreground">{stats?.averageClassPerformance?.toFixed(0) || 0}%</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Alertas Pendientes</div>
                  <div className="mt-1 text-3xl font-bold text-foreground">{stats?.unreadAlerts || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <button
            onClick={() => router.push('/teacher/students')}
            className="group relative overflow-hidden rounded-lg border-2 border-border bg-card p-4 hover:border-primary hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalStudents || 0}
            </div>
            <div className="text-sm text-muted-foreground">Estudiantes Totales</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {stats?.activeStudentsWeek || 0} activos esta semana
            </div>
          </button>

          <button
            onClick={() => router.push('/teacher/analytics')}
            className="group relative overflow-hidden rounded-lg border-2 border-border bg-card p-4 hover:border-success hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-success transition-colors" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalActivitiesToday || 0}
            </div>
            <div className="text-sm text-muted-foreground">Actividades Hoy</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {stats?.totalActivitiesWeek || 0} esta semana
            </div>
          </button>

          <button
            onClick={() => router.push('/teacher/classes')}
            className="group relative overflow-hidden rounded-lg border-2 border-border bg-card p-4 hover:border-accent hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalClasses || 0}
            </div>
            <div className="text-sm text-muted-foreground">Clases Activas</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {stats?.totalAssignments || 0} tareas asignadas
            </div>
          </button>

          <button
            onClick={() => router.push('/teacher/alerts')}
            className={`group relative overflow-hidden rounded-lg border-2 p-4 hover:shadow-md transition-all text-left ${
              stats && stats.unreadAlerts > 0
                ? 'border-destructive bg-destructive/10'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className={`h-5 w-5 ${stats && stats.unreadAlerts > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              <ArrowRight className={`h-4 w-4 transition-colors ${stats && stats.unreadAlerts > 0 ? 'text-destructive' : 'text-muted-foreground group-hover:text-destructive'}`} />
            </div>
            <div className={`text-2xl font-bold ${stats && stats.unreadAlerts > 0 ? 'text-destructive' : 'text-foreground'}`}>
              {stats?.unreadAlerts || 0}
            </div>
            <div className="text-sm text-muted-foreground">Alertas Sin Leer</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Requieren atención
            </div>
          </button>
        </div>

        {/* Performance Overview */}
        <div className="grid gap-4 lg:grid-cols-2 mb-6">
          <Card className="border-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Rendimiento General
                </h2>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Promedio de Clase</span>
                    <span className="font-medium text-foreground">
                      {stats?.averageClassPerformance?.toFixed(1) || '0'}%
                    </span>
                  </div>
                  <Progress value={stats?.averageClassPerformance || 0} className="h-2" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Actividades completadas hoy
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {stats?.totalActivitiesCompletedToday || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Estudiantes que necesitan atención
                  </span>
                  <span className="text-2xl font-bold text-destructive">
                    {stats?.studentsNeedingAttention || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="border-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Alertas Recientes
                </h2>
                <button
                  onClick={() => router.push('/teacher/alerts')}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
                >
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                {alertsLoading ? (
                  <p className="text-sm text-muted-foreground">Cargando alertas...</p>
                ) : alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay alertas nuevas</p>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
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
                        <p className="text-sm font-medium text-foreground truncate">
                          {alert.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {alert.studentName}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Needing Attention */}
        <Card className="border-2 mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-destructive/10 rounded-lg p-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  Estudiantes que Necesitan Atención
                </h2>
              </div>
              <button
                onClick={() => router.push('/teacher/students?filter=struggling')}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
              >
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {studentsLoading ? (
              <p className="text-sm text-muted-foreground">Cargando estudiantes...</p>
            ) : studentsNeedingAttention.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="mx-auto h-12 w-12 text-success" />
                <p className="mt-4 text-sm text-muted-foreground">
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
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => router.push('/teacher/classes/new')}
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-card p-6 hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="rounded-full bg-primary/10 p-3">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">Nueva Clase</h3>
              <p className="text-sm text-muted-foreground">Crear un nuevo grupo</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/teacher/assignments/new')}
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-card p-6 hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="rounded-full bg-primary/10 p-3">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">Nueva Asignación</h3>
              <p className="text-sm text-muted-foreground">Asignar actividades</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/teacher/analytics')}
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-card p-6 hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">Analíticas</h3>
              <p className="text-sm text-muted-foreground">Ver reportes detallados</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
