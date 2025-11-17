/**
 * Teacher Alerts Page
 * View and manage all alerts
 * Redesigned with v0 design system - Preserves ALL functionality
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bell, BellOff, Check, CheckCheck, Filter, Loader2 } from 'lucide-react'
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'
import { AlertBadge } from '@/components/teacher/AlertBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TeacherAlert } from '@/types'

export default function TeacherAlertsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const {
    alerts,
    unreadAlertsCount,
    alertsLoading,
    fetchAlerts,
    markAlertAsRead,
    markAllAlertsAsRead
  } = useTeacherDashboard()

  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'low' | 'medium' | 'high'>('all')

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
      fetchAlerts(filter === 'unread')
    }
  }, [status, session, router, filter])

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId)
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAlertsAsRead()
    } catch (error) {
      console.error('Error marking all alerts as read:', error)
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity !== 'all') {
      const alertSeverity = alert.severity === 'info' ? 'low' :
                           alert.severity === 'warning' ? 'medium' :
                           alert.severity === 'success' ? 'low' : 'low'
      return alertSeverity === selectedSeverity
    }
    return true
  })

  const severityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta'
  }

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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Alertas
              </h1>
              <p className="mt-2 text-muted-foreground">
                {unreadAlertsCount} sin leer • {filteredAlerts.length} total
              </p>
            </div>
            {unreadAlertsCount > 0 && (
              <Button onClick={handleMarkAllAsRead} size="sm">
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar Todas como Leídas
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              Todas
            </Button>
            <Button
              onClick={() => setFilter('unread')}
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
            >
              <Bell className="h-4 w-4 mr-2" />
              Sin Leer {unreadAlertsCount > 0 && `(${unreadAlertsCount})`}
            </Button>
          </div>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="rounded-lg border bg-background px-4 py-2 text-sm text-foreground"
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Alta prioridad</option>
            <option value="medium">Prioridad media</option>
            <option value="low">Baja prioridad</option>
          </select>
        </div>

        {/* Alerts List */}
        {alertsLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Cargando alertas...</p>
          </Card>
        ) : filteredAlerts.length === 0 ? (
          <Card className="p-12 text-center">
            <BellOff className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No hay alertas
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {filter === 'unread'
                ? 'No tienes alertas sin leer en este momento'
                : 'No hay alertas para mostrar'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const alertSeverity = alert.severity === 'info' ? 'low' :
                                   alert.severity === 'warning' ? 'medium' :
                                   'low'

              return (
                <Card
                  key={alert.id}
                  className={`p-6 transition-all ${
                    alert.isRead
                      ? 'opacity-75'
                      : 'border-primary shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <AlertBadge severity={alertSeverity} size="md" />
                        {!alert.isRead && (
                          <Badge variant="secondary">
                            Nueva
                          </Badge>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-semibold text-foreground">
                        {alert.title}
                      </h3>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {alert.message}
                      </p>

                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Estudiante: <span className="font-medium">{alert.studentName}</span></span>
                        <span>•</span>
                        <span>
                          {new Date(alert.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!alert.isRead && (
                        <Button
                          onClick={() => handleMarkAsRead(alert.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Marcar leída
                        </Button>
                      )}
                      <Button
                        onClick={() => router.push(`/teacher/students/${alert.studentId}`)}
                        size="sm"
                      >
                        Ver Estudiante
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
