/**
 * Teacher Alerts Page
 * View and manage all alerts
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bell, BellOff, Check, CheckCheck, Filter } from 'lucide-react'
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'
import { AlertBadge } from '@/components/teacher/AlertBadge'
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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Alertas
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {unreadAlertsCount} sin leer • {filteredAlerts.length} total
              </p>
            </div>
            {unreadAlertsCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar Todas como Leídas
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Bell className="h-4 w-4" />
              Sin Leer {unreadAlertsCount > 0 && `(${unreadAlertsCount})`}
            </button>
          </div>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm text-gray-900 dark:text-white"
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Alta prioridad</option>
            <option value="medium">Prioridad media</option>
            <option value="low">Baja prioridad</option>
          </select>
        </div>

        {/* Alerts List */}
        {alertsLoading ? (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Cargando alertas...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
            <BellOff className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No hay alertas
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {filter === 'unread'
                ? 'No tienes alertas sin leer en este momento'
                : 'No hay alertas para mostrar'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const alertSeverity = alert.severity === 'info' ? 'low' :
                                   alert.severity === 'warning' ? 'medium' :
                                   'low'

              return (
                <div
                  key={alert.id}
                  className={`rounded-lg border bg-white dark:bg-gray-900 p-6 transition-all ${
                    alert.isRead
                      ? 'border-gray-200 dark:border-gray-700 opacity-75'
                      : 'border-indigo-200 dark:border-indigo-800 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <AlertBadge severity={alertSeverity} size="md" />
                        {!alert.isRead && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:text-indigo-200">
                            Nueva
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                        {alert.title}
                      </h3>

                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {alert.message}
                      </p>

                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          Marcar leída
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/teacher/students/${alert.studentId}`)}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                      >
                        Ver Estudiante
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
