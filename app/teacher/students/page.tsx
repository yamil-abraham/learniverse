/**
 * Teacher Students List Page
 * Display and manage all students with filtering and search
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, Filter, X, Users } from 'lucide-react'
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'
import { DataTable, Column } from '@/components/teacher/DataTable'
import { PerformanceBadge } from '@/components/teacher/PerformanceBadge'
import type { StudentSummary } from '@/types'

export default function TeacherStudentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const {
    students,
    studentsLoading,
    classes,
    studentFilters,
    fetchStudents,
    setStudentFilters,
    fetchClasses
  } = useTeacherDashboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedPerformance, setSelectedPerformance] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

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

      // Check URL params for initial filter
      const filterParam = searchParams.get('filter')
      if (filterParam === 'struggling') {
        setSelectedPerformance('struggling')
        setStudentFilters({ performanceLevel: 'struggling' })
      } else {
        fetchStudents()
      }
    }
  }, [status, session, router, searchParams])

  const handleSearch = () => {
    setStudentFilters({
      searchQuery: searchQuery || undefined,
      classId: selectedClass || undefined,
      performanceLevel: selectedPerformance as any || undefined
    })
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedClass('')
    setSelectedPerformance('')
    setStudentFilters({})
  }

  const hasActiveFilters = searchQuery || selectedClass || selectedPerformance

  const columns: Column<StudentSummary>[] = [
    {
      key: 'name',
      label: 'Estudiante',
      sortable: true,
      render: (student) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {student.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium">{student.name}</span>
        </div>
      )
    },
    {
      key: 'level',
      label: 'Nivel',
      sortable: true,
      render: (student) => (
        <span className="text-gray-900 dark:text-gray-100">Nivel {student.level}</span>
      )
    },
    {
      key: 'successRate',
      label: 'Rendimiento',
      sortable: true,
      render: (student) => (
        <PerformanceBadge successRate={student.successRate} size="sm" />
      )
    },
    {
      key: 'totalAttempts',
      label: 'Intentos',
      sortable: true,
      render: (student) => (
        <span className="text-gray-900 dark:text-gray-100">{student.totalAttempts}</span>
      )
    },
    {
      key: 'lastActive',
      label: 'Última Actividad',
      sortable: true,
      render: (student) => {
        const date = new Date(student.lastActive)
        const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {daysAgo === 0 ? 'Hoy' : daysAgo === 1 ? 'Ayer' : `Hace ${daysAgo} días`}
          </span>
        )
      }
    },
    {
      key: 'status',
      label: 'Estado',
      render: (student) => (
        student.needsAttention ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-200">
            Necesita atención
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
            En buen camino
          </span>
        )
      )
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
                Mis Estudiantes
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {students.length} {students.length === 1 ? 'estudiante' : 'estudiantes'}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                  {[searchQuery, selectedClass, selectedPerformance].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Nombre del estudiante..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Class Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clase
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:focus:border-indigo-500"
                >
                  <option value="">Todas las clases</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Performance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rendimiento
                </label>
                <select
                  value={selectedPerformance}
                  onChange={(e) => setSelectedPerformance(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:focus:border-indigo-500"
                >
                  <option value="">Todos</option>
                  <option value="excelling">Excelente (≥80%)</option>
                  <option value="average">Regular (50-79%)</option>
                  <option value="struggling">Necesita apoyo (&lt;50%)</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSearch}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Aplicar Filtros
              </button>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Limpiar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Students Table */}
        <DataTable
          data={students}
          columns={columns}
          loading={studentsLoading}
          onRowClick={(student) => router.push(`/teacher/students/${student.id}`)}
          emptyMessage="No se encontraron estudiantes"
          rowClassName={(student) => student.needsAttention ? 'border-l-4 border-l-red-500' : ''}
        />
      </div>
    </div>
  )
}
