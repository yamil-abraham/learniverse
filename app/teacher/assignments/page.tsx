/**
 * Teacher Assignments Page
 * View and manage all assignments
 * Redesigned with v0 design system - Preserves ALL functionality
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Plus, Calendar, CheckCircle, Clock, Loader2, ArrowLeft } from 'lucide-react'
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'
import { DataTable, Column } from '@/components/teacher/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ActivityAssignment } from '@/types'

export default function TeacherAssignmentsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const {
    assignments,
    assignmentsLoading,
    fetchAssignments
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
      fetchAssignments()
    }
  }, [status, session, router])

  const activityTypeLabels: Record<string, string> = {
    addition: 'Suma',
    subtraction: 'Resta',
    multiplication: 'Multiplicación',
    division: 'División',
    fractions: 'Fracciones',
    decimals: 'Decimales',
    geometry: 'Geometría',
    word_problems: 'Problemas'
  }

  const difficultyLabels: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil'
  }

  const columns: Column<ActivityAssignment>[] = [
    {
      key: 'activityType',
      label: 'Tipo de Actividad',
      render: (assignment) => (
        <div>
          <div className="font-medium text-foreground">
            {activityTypeLabels[assignment.activityType] || assignment.activityType}
          </div>
          <div className="text-sm text-muted-foreground">
            {difficultyLabels[assignment.difficulty]} • {assignment.quantity} actividades
          </div>
        </div>
      )
    },
    {
      key: 'assignedTo',
      label: 'Asignado a',
      render: (assignment) => (
        <span className="text-foreground">
          {assignment.studentId ? 'Estudiante individual' : assignment.classId ? 'Clase completa' : '-'}
        </span>
      )
    },
    {
      key: 'dueDate',
      label: 'Fecha Límite',
      render: (assignment) => {
        if (!assignment.dueDate) {
          return <span className="text-muted-foreground">Sin fecha límite</span>
        }
        const date = new Date(assignment.dueDate)
        const now = new Date()
        const isOverdue = date < now && !assignment.isCompleted
        const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        return (
          <div className="flex items-center gap-2">
            <Calendar className={`h-4 w-4 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`} />
            <div>
              <div className={`text-sm ${isOverdue ? 'text-destructive font-medium' : 'text-foreground'}`}>
                {date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              {!assignment.isCompleted && (
                <div className={`text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {isOverdue ? `Vencida hace ${Math.abs(daysUntil)} días` : `En ${daysUntil} días`}
                </div>
              )}
            </div>
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Estado',
      render: (assignment) => {
        if (assignment.isCompleted) {
          return (
            <Badge variant="default" className="bg-success text-success-foreground gap-1">
              <CheckCircle className="h-3 w-3" />
              Completada
            </Badge>
          )
        }

        if (assignment.dueDate) {
          const isOverdue = new Date(assignment.dueDate) < new Date()
          if (isOverdue) {
            return (
              <Badge variant="destructive">
                Vencida
              </Badge>
            )
          }
        }

        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        )
      }
    },
    {
      key: 'createdAt',
      label: 'Creada',
      render: (assignment) => {
        const date = new Date(assignment.createdAt)
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        )
      }
    }
  ]

  const pendingAssignments = assignments.filter(a => !a.isCompleted)
  const completedAssignments = assignments.filter(a => a.isCompleted)
  const overdueAssignments = assignments.filter(a => !a.isCompleted && a.dueDate && new Date(a.dueDate) < new Date())

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'teacher') {
    return null
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Asignaciones
              </h1>
              <p className="mt-2 text-muted-foreground">
                {assignments.length} {assignments.length === 1 ? 'asignación' : 'asignaciones'}
              </p>
            </div>
            <Button onClick={() => router.push('/teacher/assignments/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Asignación
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-secondary/10 p-3">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {pendingAssignments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-success/10 p-3">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {completedAssignments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-destructive/10 p-3">
                  <Calendar className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vencidas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {overdueAssignments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Table */}
        {assignments.length === 0 && !assignmentsLoading ? (
          <Card className="border-2 border-dashed border-muted-foreground/25 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No hay asignaciones
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Comienza asignando actividades a tus estudiantes o clases
            </p>
            <Button
              onClick={() => router.push('/teacher/assignments/new')}
              className="mt-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Asignación
            </Button>
          </Card>
        ) : (
          <DataTable
            data={assignments}
            columns={columns}
            loading={assignmentsLoading}
            emptyMessage="No se encontraron asignaciones"
            rowClassName={(assignment) =>
              assignment.dueDate && new Date(assignment.dueDate) < new Date() && !assignment.isCompleted
                ? 'border-l-4 border-l-destructive'
                : ''
            }
          />
        )}
      </div>
    </div>
  )
}
