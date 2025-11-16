/**
 * VoiceAnalytics Component
 * Displays voice interaction analytics for teacher dashboard
 */

'use client'

import { useState, useEffect } from 'react'

interface VoiceAnalyticsData {
  totalInteractions: number
  totalDuration: number
  avgResponseTime: number
  cacheHitRate: number
  interactionsByType: Record<string, number>
  interactionsByDay: Array<{ date: string; count: number }>
  topStudents: Array<{ studentId: string; studentName: string; interactions: number }>
  voiceUsageBreakdown: Record<string, number>
}

interface VoiceAnalyticsProps {
  classId?: string
  studentId?: string
  startDate?: string
  endDate?: string
}

export function VoiceAnalytics({ classId, studentId, startDate, endDate }: VoiceAnalyticsProps) {
  const [data, setData] = useState<VoiceAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [classId, studentId, startDate, endDate])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (classId) params.append('classId', classId)
      if (studentId) params.append('studentId', studentId)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/teacher/analytics/voice-usage?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Error al cargar analíticas')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Error desconocido')
      }

      setData(result.data)
    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      setError(err.message || 'Error al cargar analíticas')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="inline-block w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-600">Cargando analíticas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-bold text-red-800 mb-1">Error</div>
            <div className="text-red-700">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analíticas de Voz del Profesor</h2>
        <p className="text-gray-600">Estadísticas de interacciones de voz con estudiantes</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon="💬"
          title="Total Interacciones"
          value={data.totalInteractions.toLocaleString()}
          subtitle="conversaciones"
        />
        <SummaryCard
          icon="⏱️"
          title="Duración Total"
          value={formatDuration(data.totalDuration)}
          subtitle="de audio generado"
        />
        <SummaryCard
          icon="⚡"
          title="Tiempo Promedio"
          value={`${Math.round(data.avgResponseTime)}ms`}
          subtitle="de respuesta"
        />
        <SummaryCard
          icon="💾"
          title="Tasa de Caché"
          value={`${data.cacheHitRate.toFixed(1)}%`}
          subtitle="aciertos de caché"
          highlight={data.cacheHitRate >= 70}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactions by Type */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Interacciones por Tipo</h3>
          <div className="space-y-3">
            {Object.entries(data.interactionsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-700 capitalize">{type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(count / data.totalInteractions) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-gray-900 font-semibold w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Usage Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Uso de Voces</h3>
          <div className="space-y-3">
            {Object.entries(data.voiceUsageBreakdown).map(([voice, count]) => (
              <div key={voice} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-gray-700 capitalize">{voice}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${(count / data.totalInteractions) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-gray-900 font-semibold w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactions Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Interacciones por Día</h3>
        <div className="space-y-2">
          {data.interactionsByDay.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          ) : (
            data.interactionsByDay.slice(0, 10).map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-24">
                  {new Date(day.date).toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div className="flex-1 h-8 bg-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center px-3"
                    style={{
                      width: `${Math.min((day.count / Math.max(...data.interactionsByDay.map(d => d.count))) * 100, 100)}%`,
                    }}
                  >
                    <span className="text-sm text-white font-semibold">{day.count}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Students */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Estudiantes Más Activos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Posición</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Estudiante</th>
                <th className="text-right py-3 px-4 text-gray-700 font-semibold">Interacciones</th>
              </tr>
            </thead>
            <tbody>
              {data.topStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
              ) : (
                data.topStudents.map((student, index) => (
                  <tr key={student.studentId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-xl">🥇</span>}
                        {index === 1 && <span className="text-xl">🥈</span>}
                        {index === 2 && <span className="text-xl">🥉</span>}
                        <span className="text-gray-700 font-semibold">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{student.studentName}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {student.interactions}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

interface SummaryCardProps {
  icon: string
  title: string
  value: string
  subtitle: string
  highlight?: boolean
}

function SummaryCard({ icon, title, value, subtitle, highlight = false }: SummaryCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${highlight ? 'ring-2 ring-green-500' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        {highlight && <span className="text-green-500 text-sm font-semibold">✓ Óptimo</span>}
      </div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  )
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${Math.round(seconds % 60)}s`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}
