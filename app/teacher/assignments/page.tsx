/**
 * Teacher Assignments Page
 * View and manage all assignments
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Plus, Calendar, CheckCircle, Clock } from 'lucide-react'
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'
import { DataTable, Column } from '@/components/teacher/DataTable'
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
          <div className="font-medium text-gray-900 dark:text-white">
            {activityTypeLabels[assignment.activityType] || assignment.activityType}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {difficultyLabels[assignment.difficulty]} • {assignment.quantity} actividades
          </div>
        </div>
      )
    },
    {
      key: 'assignedTo',
      label: 'Asignado a',
      render: (assignment) => (
        <span className="text-gray-900 dark:text-gray-100">
          {assignment.studentId ? 'Estudiante individual' : assignment.classId ? 'Clase completa' : '-'}
        </span>
      )
    },
    {
      key: 'dueDate',
      label: 'Fecha Límite',
      render: (assignment) => {
        if (!assignment.dueDate) {
          return <span className="text-gray-500 dark:text-gray-400">Sin fecha límite</span>
        }
        const date = new Date(assignment.dueDate)
        const now = new Date()
        const isOverdue = date < now && !assignment.isCompleted
        const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        return (
          <div className="flex items-center gap-2">
            <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
            <div>
              <div className={`text-sm ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-900 dark:text-white'}`}>
                {date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              {!assignment.isCompleted && (
                <div className={`text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
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
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
              <CheckCircle className="h-3 w-3" />
              Completada
            </span>
          )
        }

        if (assignment.dueDate) {
          const isOverdue = new Date(assignment.dueDate) < new Date()
          if (isOverdue) {
            return (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-200">
                Vencida
              </span>
            )
          }
        }

        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-200">
            <Clock className="h-3 w-3" />
            Pendiente
          </span>
        )
      }
    },
    {
      key: 'createdAt',
      label: 'Creada',
      render: (assignment) => {
        const date = new Date(assignment.createdAt)
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'teacher') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Asignaciones
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {assignments.length} {assignments.length === 1 ? 'asignación' : 'asignaciones'}
              </p>
            </div>
            <button
              onClick={() => router.push('/teacher/assignments/new')}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nueva Asignación
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-3">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingAssignments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedAssignments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vencidas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overdueAssignments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        {assignments.length === 0 && !assignmentsLoading ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No hay asignaciones
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Comienza asignando actividades a tus estudiantes o clases
            </p>
            <button
              onClick={() => router.push('/teacher/assignments/new')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Crear Primera Asignación
            </button>
          </div>
        ) : (
          <DataTable
            data={assignments}
            columns={columns}
            loading={assignmentsLoading}
            emptyMessage="No se encontraron asignaciones"
            rowClassName={(assignment) =>
              assignment.dueDate && new Date(assignment.dueDate) < new Date() && !assignment.isCompleted
                ? 'border-l-4 border-l-red-500'
                : ''
            }
          />
        )}
      </div>
    </div>
  )
}
