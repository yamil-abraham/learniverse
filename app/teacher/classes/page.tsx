/**
 * Teacher Classes List Page
 * Display and manage all classes
 * Redesigned with v0 design system - Preserves ALL functionality
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Plus, Users, GraduationCap, TrendingUp, Loader2, ArrowLeft } from 'lucide-react'
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'
import { DataTable, Column } from '@/components/teacher/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
          <div className="font-medium text-foreground">{cls.name}</div>
          {cls.description && (
            <div className="text-sm text-muted-foreground truncate max-w-md">
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
        <span className="text-foreground">
          {cls.grade ? `${cls.grade}°` : '-'}
        </span>
      )
    },
    {
      key: 'schoolYear',
      label: 'Año Escolar',
      render: (cls) => (
        <span className="text-foreground">
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
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">
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
          <Badge variant="default" className="bg-success text-success-foreground">
            Activa
          </Badge>
        ) : (
          <Badge variant="secondary">
            Inactiva
          </Badge>
        )
      )
    },
    {
      key: 'createdAt',
      label: 'Creada',
      render: (cls) => {
        const date = new Date(cls.createdAt)
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        )
      }
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
                Mis Clases
              </h1>
              <p className="mt-2 text-muted-foreground">
                {classes.length} {classes.length === 1 ? 'clase' : 'clases'}
              </p>
            </div>
            <Button onClick={() => router.push('/teacher/classes/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Clase
            </Button>
          </div>
        </div>

        {/* Classes Table */}
        {classes.length === 0 && !classesLoading ? (
          <Card className="border-2 border-dashed border-muted-foreground/25 p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No tienes clases aún
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Comienza creando tu primera clase para organizar a tus estudiantes
            </p>
            <Button
              onClick={() => router.push('/teacher/classes/new')}
              className="mt-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Clase
            </Button>
          </Card>
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
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clases Activas</p>
                    <p className="text-2xl font-bold text-foreground">
                      {classes.filter(c => c.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-success/10 p-3">
                    <Users className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Estudiantes</p>
                    <p className="text-2xl font-bold text-foreground">
                      {classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-accent/10 p-3">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Promedio por Clase</p>
                    <p className="text-2xl font-bold text-foreground">
                      {classes.length > 0
                        ? Math.round(classes.reduce((sum, c) => sum + (c.studentCount || 0), 0) / classes.length)
                        : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
