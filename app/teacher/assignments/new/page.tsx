/**
 * Create New Assignment Page
 * Form to create a new assignment
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'

function NewAssignmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { createAssignment, classes, students, fetchClasses, fetchStudents } = useTeacherDashboard()

  const [formData, setFormData] = useState({
    assignTo: 'student' as 'student' | 'class',
    studentId: searchParams.get('studentId') || '',
    classId: '',
    activityType: '',
    difficulty: '',
    quantity: '5',
    dueDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClasses()
    fetchStudents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await createAssignment({
        studentId: formData.assignTo === 'student' ? formData.studentId : undefined,
        classId: formData.assignTo === 'class' ? formData.classId : undefined,
        activityType: formData.activityType,
        difficulty: formData.difficulty,
        quantity: parseInt(formData.quantity),
        dueDate: formData.dueDate || undefined
      })

      router.push('/teacher/assignments')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la asignación')
    } finally {
      setLoading(false)
    }
  }

  const activityTypes = [
    { value: 'addition', label: 'Suma' },
    { value: 'subtraction', label: 'Resta' },
    { value: 'multiplication', label: 'Multiplicación' },
    { value: 'division', label: 'División' },
    { value: 'fractions', label: 'Fracciones' },
    { value: 'decimals', label: 'Decimales' },
    { value: 'geometry', label: 'Geometría' },
    { value: 'word_problems', label: 'Problemas de Palabras' }
  ]

  const difficulties = [
    { value: 'easy', label: 'Fácil' },
    { value: 'medium', label: 'Medio' },
    { value: 'hard', label: 'Difícil' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Crear Nueva Asignación
          </h1>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Assign To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asignar a <span className="text-red-500">*</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, assignTo: 'student', classId: '' })}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    formData.assignTo === 'student'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">Estudiante Individual</div>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Asignar a un estudiante específico
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, assignTo: 'class', studentId: '' })}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    formData.assignTo === 'class'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">Clase Completa</div>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Asignar a todos los estudiantes de una clase
                  </div>
                </button>
              </div>
            </div>

            {/* Student/Class Selector */}
            {formData.assignTo === 'student' ? (
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estudiante <span className="text-red-500">*</span>
                </label>
                <select
                  id="studentId"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:focus:border-indigo-500"
                >
                  <option value="">Seleccionar estudiante...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} (Nivel {student.level})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor="classId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clase <span className="text-red-500">*</span>
                </label>
                <select
                  id="classId"
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:focus:border-indigo-500"
                >
                  <option value="">Seleccionar clase...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.studentCount || 0} estudiantes)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Activity Type */}
            <div>
              <label htmlFor="activityType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Actividad <span className="text-red-500">*</span>
              </label>
              <select
                id="activityType"
                required
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:focus:border-indigo-500"
              >
                <option value="">Seleccionar tipo...</option>
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty & Quantity */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dificultad <span className="text-red-500">*</span>
                </label>
                <select
                  id="difficulty"
                  required
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:focus:border-indigo-500"
                >
                  <option value="">Seleccionar...</option>
                  {difficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max="20"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Número de actividades a completar
                </p>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha Límite (Opcional)
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Creando...' : 'Crear Asignación'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function NewAssignmentPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <NewAssignmentForm />
    </Suspense>
  )
}
