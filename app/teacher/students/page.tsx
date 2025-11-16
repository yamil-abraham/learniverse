/**
 * Teacher Students List Page
 * Display and manage all students with filtering and search
 * Redesigned with v0 design system - Preserves ALL functionality
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, Filter, X, Users, Loader2 } from 'lucide-react'
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'
import { DataTable, Column } from '@/components/teacher/DataTable'
import { PerformanceBadge } from '@/components/teacher/PerformanceBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { StudentSummary } from '@/types'

function TeacherStudentsContent() {
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
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
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
        <span className="text-foreground">Nivel {student.level}</span>
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
        <span className="text-foreground">{student.totalAttempts}</span>
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
          <span className="text-sm text-muted-foreground">
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
          <Badge variant="destructive">
            Necesita atención
          </Badge>
        ) : (
          <Badge variant="default" className="bg-success text-success-foreground">
            En buen camino
          </Badge>
        )
      )
    }
  ]

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Mis Estudiantes
              </h1>
              <p className="mt-2 text-muted-foreground">
                {students.length} {students.length === 1 ? 'estudiante' : 'estudiantes'}
              </p>
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {[searchQuery, selectedClass, selectedPerformance].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Search */}
              <div>
                <Label htmlFor="search" className="mb-2">
                  Buscar
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Nombre del estudiante..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Class Filter */}
              <div>
                <Label htmlFor="class" className="mb-2">
                  Clase
                </Label>
                <select
                  id="class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-2 text-sm text-foreground"
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
                <Label htmlFor="performance" className="mb-2">
                  Rendimiento
                </Label>
                <select
                  id="performance"
                  value={selectedPerformance}
                  onChange={(e) => setSelectedPerformance(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-2 text-sm text-foreground"
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
              <Button onClick={handleSearch}>
                Aplicar Filtros
              </Button>
              {hasActiveFilters && (
                <Button onClick={handleClearFilters} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Students Table */}
        <DataTable
          data={students}
          columns={columns}
          loading={studentsLoading}
          onRowClick={(student) => router.push(`/teacher/students/${student.id}`)}
          emptyMessage="No se encontraron estudiantes"
          rowClassName={(student) => student.needsAttention ? 'border-l-4 border-l-destructive' : ''}
        />
      </div>
    </div>
  )
}

export default function TeacherStudentsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <TeacherStudentsContent />
    </Suspense>
  )
}
