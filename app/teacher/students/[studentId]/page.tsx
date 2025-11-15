/**
 * Teacher Student Detail Page
 * Detailed analytics and performance tracking for individual student
 */

'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, User, Trophy, Target, TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'
import { DashboardCard } from '@/components/teacher/DashboardCard'
import { PerformanceBadge } from '@/components/teacher/PerformanceBadge'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export default function StudentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const studentId = params.studentId as string

  const {
    selectedStudent,
    studentPerformanceHistory,
    studentActivityDistribution,
    studentDetailLoading,
    fetchStudentDetail
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

    if (status === 'authenticated' && studentId) {
      fetchStudentDetail(studentId, {
        includeHistory: true,
        includeDistribution: true,
        days: 30
      })
    }
  }, [status, session, router, studentId])

  if (status === 'loading' || studentDetailLoading || !selectedStudent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando detalles del estudiante...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'teacher') {
    return null
  }

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

  const performanceTrendLabels: Record<string, string> = {
    improving: 'Mejorando',
    stable: 'Estable',
    declining: 'Descendente'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a estudiantes
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedStudent.studentName}
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Nivel {selectedStudent.level} • {selectedStudent.totalPoints} puntos
                </p>
              </div>
            </div>
            <PerformanceBadge
              successRate={selectedStudent.successRate}
              showTrend
              trend={selectedStudent.recentPerformanceTrend === 'improving' ? 'up' : selectedStudent.recentPerformanceTrend === 'declining' ? 'down' : 'stable'}
            />
          </div>
        </div>

        {/* Need Attention Alert */}
        {selectedStudent.needsAttention && (
          <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 dark:text-red-100">
                  Este estudiante necesita atención
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  El rendimiento está por debajo del 50%. Considera asignar actividades de refuerzo
                  {selectedStudent.weakestArea && ` en ${activityTypeLabels[selectedStudent.weakestArea] || selectedStudent.weakestArea}`}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <DashboardCard
            title="Intentos Totales"
            value={selectedStudent.totalAttempts}
            icon={Target}
            variant="default"
          />
          <DashboardCard
            title="Respuestas Correctas"
            value={selectedStudent.correctAnswers}
            subtitle={`${selectedStudent.incorrectAnswers} incorrectas`}
            icon={Trophy}
            variant="success"
          />
          <DashboardCard
            title="Racha Actual"
            value={`${selectedStudent.streakDays} días`}
            icon={Calendar}
            variant="default"
          />
          <DashboardCard
            title="Tiempo Promedio"
            value={`${Math.round(selectedStudent.averageTimeSeconds)}s`}
            subtitle="Por actividad"
            icon={TrendingUp}
            variant="default"
          />
        </div>

        {/* Performance Trend & Activity Distribution */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Performance Over Time */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Rendimiento en el Tiempo
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Tendencia: <span className="font-medium">{performanceTrendLabels[selectedStudent.recentPerformanceTrend]}</span>
            </p>
            {studentPerformanceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={studentPerformanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    stroke="#9ca3af"
                  />
                  <YAxis
                    domain={[0, 100]}
                    className="text-xs"
                    stroke="#9ca3af"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(17 24 39)',
                      border: '1px solid rgb(55 65 81)',
                      borderRadius: '0.5rem'
                    }}
                    labelStyle={{ color: 'rgb(156 163 175)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Tasa de Éxito (%)"
                    dot={{ fill: '#6366f1', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
                No hay datos suficientes para mostrar la tendencia
              </div>
            )}
          </div>

          {/* Activity Distribution */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribución por Tipo de Actividad
            </h2>
            {studentActivityDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentActivityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="activityType"
                    className="text-xs"
                    stroke="#9ca3af"
                    tickFormatter={(value: string) => activityTypeLabels[value] || value}
                  />
                  <YAxis
                    className="text-xs"
                    stroke="#9ca3af"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(17 24 39)',
                      border: '1px solid rgb(55 65 81)',
                      borderRadius: '0.5rem'
                    }}
                    labelStyle={{ color: 'rgb(156 163 175)' }}
                    labelFormatter={(value: string) => activityTypeLabels[value] || value}
                  />
                  <Legend />
                  <Bar dataKey="attempted" fill="#6366f1" name="Intentados" />
                  <Bar dataKey="correct" fill="#10b981" name="Correctos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
                No hay actividades registradas
              </div>
            )}
          </div>
        </div>

        {/* Activities by Type Details */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Desempeño por Tipo de Actividad
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(selectedStudent.activitiesByType).map(([type, data]: [string, any]) => (
              <div
                key={type}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4"
              >
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {activityTypeLabels[type] || type}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Intentados:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{data.attempted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Correctos:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{data.correct}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tasa:</span>
                    <span className={`font-medium ${
                      data.successRate >= 80 ? 'text-green-600 dark:text-green-400' :
                      data.successRate >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {data.successRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {selectedStudent.strongestArea && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6">
              <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Área Más Fuerte
              </h2>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {activityTypeLabels[selectedStudent.strongestArea] || selectedStudent.strongestArea}
              </p>
              <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                Este estudiante destaca en esta área
              </p>
            </div>
          )}

          {selectedStudent.weakestArea && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Área a Reforzar
              </h2>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {activityTypeLabels[selectedStudent.weakestArea] || selectedStudent.weakestArea}
              </p>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                Considera asignar más actividades en esta área
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/teacher/assignments/new?studentId=${studentId}`)}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Asignar Actividades
          </button>
          <button
            onClick={() => router.push(`/teacher/alerts/new?studentId=${studentId}`)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Crear Alerta
          </button>
        </div>
      </div>
    </div>
  )
}
