/**
 * Teacher Analytics Overview Page
 * Comprehensive analytics and insights for teacher
 * Built with v0 design system
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Users,
  UserCheck,
  GraduationCap,
  AlertCircle,
  TrendingUp,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Loader2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { TeacherDashboardStats } from '@/types'

export default function TeacherAnalyticsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      fetchAnalytics()
    }
  }, [status, session, router])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teacher/analytics/overview')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setError(null)
      } else {
        setError(data.message || 'Error al cargar estadísticas')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando analíticas...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'teacher') {
    return null
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="border-2 border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <p>{error}</p>
            </div>
            <Button onClick={fetchAnalytics} className="mt-4 w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const engagementRate = stats.totalStudents > 0
    ? (stats.activeStudentsWeek / stats.totalStudents) * 100
    : 0

  const completionRateToday = stats.totalActivitiesToday > 0
    ? (stats.totalActivitiesCompletedToday / stats.totalActivitiesToday) * 100
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/teacher')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-primary/10 p-3">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Analíticas del Profesor
              </h1>
              <p className="mt-1 text-muted-foreground">
                Vista general del rendimiento y actividad
              </p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Estudiantes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent/10 p-3">
                  <GraduationCap className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clases</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalClasses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-success/10 p-3">
                  <Target className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Asignaciones</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalAssignments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alertas Pendientes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.unreadAlerts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Engagement */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Actividad de Estudiantes
              </CardTitle>
              <CardDescription>Resumen de actividad reciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Activos hoy</span>
                  <span className="text-lg font-bold text-foreground">
                    {stats.activeStudentsToday}
                  </span>
                </div>
                <Progress
                  value={stats.totalStudents > 0 ? (stats.activeStudentsToday / stats.totalStudents) * 100 : 0}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Activos esta semana</span>
                  <span className="text-lg font-bold text-foreground">
                    {stats.activeStudentsWeek}
                  </span>
                </div>
                <Progress value={engagementRate} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {engagementRate.toFixed(1)}% tasa de participación
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Actividades hoy</span>
                  <span className="text-lg font-bold text-foreground">
                    {stats.totalActivitiesToday}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Rendimiento General
              </CardTitle>
              <CardDescription>Métricas de éxito y desempeño</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Rendimiento promedio de clase</span>
                  <span className="text-lg font-bold text-success">
                    {stats.averageClassPerformance.toFixed(1)}%
                  </span>
                </div>
                <Progress value={stats.averageClassPerformance} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Tasa de finalización hoy</span>
                  <span className="text-lg font-bold text-accent">
                    {completionRateToday.toFixed(1)}%
                  </span>
                </div>
                <Progress value={completionRateToday} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats.totalActivitiesCompletedToday} de {stats.totalActivitiesToday} actividades
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Actividades esta semana</span>
                  <span className="text-lg font-bold text-foreground">
                    {stats.totalActivitiesWeek}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attention Required */}
        {stats.studentsNeedingAttention > 0 && (
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Estudiantes que Necesitan Atención
              </CardTitle>
              <CardDescription>
                {stats.studentsNeedingAttention} estudiante{stats.studentsNeedingAttention !== 1 ? 's' : ''} requiere{stats.studentsNeedingAttention !== 1 ? 'n' : ''} seguimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/teacher/students?performance=struggling')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Ver Estudiantes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Acciones Rápidas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              onClick={() => router.push('/teacher/students')}
              variant="outline"
              className="justify-start h-auto p-4"
            >
              <Users className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Ver Estudiantes</div>
                <div className="text-xs text-muted-foreground">Gestionar estudiantes</div>
              </div>
            </Button>

            <Button
              onClick={() => router.push('/teacher/classes')}
              variant="outline"
              className="justify-start h-auto p-4"
            >
              <GraduationCap className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Ver Clases</div>
                <div className="text-xs text-muted-foreground">Gestionar clases</div>
              </div>
            </Button>

            <Button
              onClick={() => router.push('/teacher/assignments')}
              variant="outline"
              className="justify-start h-auto p-4"
            >
              <Target className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Ver Asignaciones</div>
                <div className="text-xs text-muted-foreground">Gestionar asignaciones</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
