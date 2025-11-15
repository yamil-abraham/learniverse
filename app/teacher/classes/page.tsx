/**
 * Teacher Classes List Page
 * Display and manage all classes
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Plus, Users, GraduationCap, TrendingUp } from 'lucide-react'
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'
import { DataTable, Column } from '@/components/teacher/DataTable'
import type { Class } from '@/types'

export default function TeacherClassesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const {
    classes,
    classesLoading,
    fetchClasses
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
      fetchClasses()
    }
  }, [status, session, router])

  const columns: Column<Class>[] = [
    {
      key: 'name',
      label: 'Nombre de la Clase',
      sortable: true,
      render: (cls) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{cls.name}</div>
          {cls.description && (
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
              {cls.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'grade',
      label: 'Grado',
      sortable: true,
      render: (cls) => (
        <span className="text-gray-900 dark:text-gray-100">
          {cls.grade ? `${cls.grade}°` : '-'}
        </span>
      )
    },
    {
      key: 'schoolYear',
      label: 'Año Escolar',
      render: (cls) => (
        <span className="text-gray-900 dark:text-gray-100">
          {cls.schoolYear || '-'}
        </span>
      )
    },
    {
      key: 'studentCount',
      label: 'Estudiantes',
      sortable: true,
      render: (cls) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {cls.studentCount || 0}
          </span>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (cls) => (
        cls.isActive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
            Activa
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200">
            Inactiva
          </span>
        )
      )
    },
    {
      key: 'createdAt',
      label: 'Creada',
      render: (cls) => {
        const date = new Date(cls.createdAt)
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        )
      }
    }
  ]

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
                Mis Clases
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {classes.length} {classes.length === 1 ? 'clase' : 'clases'}
              </p>
            </div>
            <button
              onClick={() => router.push('/teacher/classes/new')}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nueva Clase
            </button>
          </div>
        </div>

        {/* Classes Table */}
        {classes.length === 0 && !classesLoading ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No tienes clases aún
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Comienza creando tu primera clase para organizar a tus estudiantes
            </p>
            <button
              onClick={() => router.push('/teacher/classes/new')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Crear Primera Clase
            </button>
          </div>
        ) : (
          <DataTable
            data={classes}
            columns={columns}
            loading={classesLoading}
            onRowClick={(cls) => router.push(`/teacher/classes/${cls.id}`)}
            emptyMessage="No se encontraron clases"
          />
        )}

        {/* Quick Stats */}
        {classes.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3">
                  <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clases Activas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {classes.filter(c => c.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Promedio por Clase</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {classes.length > 0
                      ? Math.round(classes.reduce((sum, c) => sum + (c.studentCount || 0), 0) / classes.length)
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
