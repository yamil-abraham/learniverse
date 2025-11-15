/**
 * Zustand Store: Teacher Dashboard
 * Manages all state for teacher dashboard features
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  TeacherDashboardStats,
  StudentSummary,
  StudentAnalytics,
  Class,
  ClassAnalytics,
  TeacherAlert,
  ActivityAssignment,
  PerformanceOverTime,
  ActivityTypeDistribution,
  StudentFilterOptions
} from '@/types'

interface TeacherDashboardState {
  // Dashboard Overview
  stats: TeacherDashboardStats | null
  statsLoading: boolean
  statsError: string | null

  // Students
  students: StudentSummary[]
  studentsLoading: boolean
  studentsError: string | null
  studentFilters: StudentFilterOptions

  // Single Student Detail
  selectedStudent: StudentAnalytics | null
  studentPerformanceHistory: PerformanceOverTime[]
  studentActivityDistribution: ActivityTypeDistribution[]
  studentDetailLoading: boolean
  studentDetailError: string | null

  // Classes
  classes: Class[]
  classesLoading: boolean
  classesError: string | null
  selectedClass: (Class & { analytics?: ClassAnalytics }) | null
  selectedClassStudents: StudentSummary[]
  classDetailLoading: boolean
  classDetailError: string | null

  // Alerts
  alerts: TeacherAlert[]
  unreadAlertsCount: number
  alertsLoading: boolean
  alertsError: string | null

  // Assignments
  assignments: ActivityAssignment[]
  assignmentsLoading: boolean
  assignmentsError: string | null

  // Actions
  fetchDashboardStats: () => Promise<void>
  fetchStudents: (filters?: StudentFilterOptions) => Promise<void>
  setStudentFilters: (filters: StudentFilterOptions) => void
  fetchStudentDetail: (studentId: string, options?: { includeHistory?: boolean; includeDistribution?: boolean; days?: number }) => Promise<void>
  fetchClasses: () => Promise<void>
  fetchClassDetail: (classId: string) => Promise<void>
  createClass: (data: { name: string; description?: string; grade?: number; schoolYear?: string }) => Promise<void>
  updateClass: (classId: string, data: { name?: string; description?: string; grade?: number; schoolYear?: string; isActive?: boolean }) => Promise<void>
  deleteClass: (classId: string) => Promise<void>
  addStudentToClass: (classId: string, studentId: string) => Promise<void>
  removeStudentFromClass: (classId: string, studentId: string) => Promise<void>
  fetchAlerts: (unreadOnly?: boolean) => Promise<void>
  markAlertAsRead: (alertId: string) => Promise<void>
  markAllAlertsAsRead: () => Promise<void>
  createAlert: (data: { studentId: string; alertType: string; title: string; message: string; severity: 'low' | 'medium' | 'high' }) => Promise<void>
  fetchAssignments: () => Promise<void>
  createAssignment: (data: { studentId?: string; classId?: string; activityType: string; difficulty: string; quantity?: number; dueDate?: string }) => Promise<void>
  reset: () => void
}

const initialState = {
  stats: null,
  statsLoading: false,
  statsError: null,
  students: [],
  studentsLoading: false,
  studentsError: null,
  studentFilters: {},
  selectedStudent: null,
  studentPerformanceHistory: [],
  studentActivityDistribution: [],
  studentDetailLoading: false,
  studentDetailError: null,
  classes: [],
  classesLoading: false,
  classesError: null,
  selectedClass: null,
  selectedClassStudents: [],
  classDetailLoading: false,
  classDetailError: null,
  alerts: [],
  unreadAlertsCount: 0,
  alertsLoading: false,
  alertsError: null,
  assignments: [],
  assignmentsLoading: false,
  assignmentsError: null
}

export const useTeacherDashboard = create<TeacherDashboardState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchDashboardStats: async () => {
        set({ statsLoading: true, statsError: null })
        try {
          const response = await fetch('/api/teacher/analytics/overview')
          const data = await response.json()

          if (!data.success) {
            throw new Error(data.message || 'Error al cargar estadísticas')
          }

          set({ stats: data.stats, statsLoading: false })
        } catch (error) {
          set({
            statsError: error instanceof Error ? error.message : 'Error desconocido',
            statsLoading: false
          })
        }
      },

      fetchStudents: async (filters?: StudentFilterOptions) => {
        set({ studentsLoading: true, studentsError: null })
        try {
          const params = new URLSearchParams()
          if (filters?.classId) params.append('classId', filters.classId)
          if (filters?.performanceLevel) params.append('performanceLevel', filters.performanceLevel)
          if (filters?.searchQuery) params.append('search', filters.searchQuery)
          if (filters?.sortBy) params.append('sortBy', filters.sortBy)
          if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

          const url = `/api/teacher/students${params.toString() ? `?${params.toString()}` : ''}`
          const response = await fetch(url)
          const data = await response.json()

          if (!data.success) {
            throw new Error(data.message || 'Error al cargar estudiantes')
          }

          set({ students: data.students, studentsLoading: false })
        } catch (error) {
          set({
            studentsError: error instanceof Error ? error.message : 'Error desconocido',
            studentsLoading: false
          })
        }
      },

      setStudentFilters: (filters: StudentFilterOptions) => {
        set({ studentFilters: filters })
        get().fetchStudents(filters)
      },

      fetchStudentDetail: async (studentId: string, options = {}) => {
        set({ studentDetailLoading: true, studentDetailError: null })
        try {
          const params = new URLSearchParams()
          if (options.days) params.append('days', options.days.toString())
          if (options.includeHistory !== false) params.append('includeHistory', 'true')
          if (options.includeDistribution !== false) params.append('includeDistribution', 'true')

          const url = `/api/teacher/analytics/student/${studentId}${params.toString() ? `?${params.toString()}` : ''}`
          const response = await fetch(url)
          const data = await response.json()

          if (!data.success) {
            throw new Error(data.message || 'Error al cargar detalles del estudiante')
          }

          set({
            selectedStudent: data.analytics,
            studentPerformanceHistory: data.performanceHistory || [],
            studentActivityDistribution: data.activityDistribution || [],
            studentDetailLoading: false
          })
        } catch (error) {
          set({
            studentDetailError: error instanceof Error ? error.message : 'Error desconocido',
            studentDetailLoading: false
          })
        }
      },

      fetchClasses: async () => {
        set({ classesLoading: true, classesError: null })
        try {
          const response = await fetch('/api/teacher/classes')
          const data = await response.json()

          if (!data.success) {
            throw new Error(data.message || 'Error al cargar clases')
          }

          set({ classes: data.classes, classesLoading: false })
        } catch (error) {
          set({
            classesError: error instanceof Error ? error.message : 'Error desconocido',
            classesLoading: false
          })
        }
      },

      fetchClassDetail: async (classId: string) => {
        set({ classDetailLoading: true, classDetailError: null })
        try {
          const response = await fetch(`/api/teacher/classes/${classId}`)
          const data = await response.json()

          if (!data.success) {
            throw new Error(data.message || 'Error al cargar detalles de la clase')
          }

          set({
            selectedClass: data.class,
            selectedClassStudents: data.class.students || [],
            classDetailLoading: false
          })
        } catch (error) {
          set({
            classDetailError: error instanceof Error ? error.message : 'Error desconocido',
            classDetailLoading: false
          })
        }
      },

      createClass: async (data) => {
        set({ classesLoading: true, classesError: null })
        try {
          const response = await fetch('/api/teacher/classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          const result = await response.json()

          if (!result.success) {
            throw new Error(result.message || 'Error al crear clase')
          }

          // Refresh classes list
          await get().fetchClasses()
        } catch (error) {
          set({
            classesError: error instanceof Error ? error.message : 'Error desconocido',
            classesLoading: false
          })
          throw error
        }
      },

      updateClass: async (classId: string, data) => {
        set({ classDetailLoading: true, classDetailError: null })
        try {
          const response = await fetch(`/api/teacher/classes/${classId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          const result = await response.json()

          if (!result.success) {
            throw new Error(result.message || 'Error al actualizar clase')
          }

          // Refresh class detail if it's the selected one
          if (get().selectedClass?.id === classId) {
            await get().fetchClassDetail(classId)
          }
          // Also refresh classes list
          await get().fetchClasses()
        } catch (error) {
          set({
            classDetailError: error instanceof Error ? error.message : 'Error desconocido',
            classDetailLoading: false
          })
          throw error
        }
      },

      deleteClass: async (classId: string) => {
        set({ classesLoading: true, classesError: null })
        try {
          const response = await fetch(`/api/teacher/classes/${classId}`, {
            method: 'DELETE'
          })
          const result = await response.json()

          if (!result.success) {
            throw new Error(result.message || 'Error al eliminar clase')
          }

          // Clear selected class if it was deleted
          if (get().selectedClass?.id === classId) {
            set({ selectedClass: null, selectedClassStudents: [] })
          }
          // Refresh classes list
          await get().fetchClasses()
        } catch (error) {
          set({
            classesError: error instanceof Error ? error.message : 'Error desconocido',
            classesLoading: false
          })
          throw error
        }
      },

      addStudentToClass: async (classId: string, studentId: string) => {
        try {
          const response = await fetch(`/api/teacher/classes/${classId}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId })
          })
          const result = await response.json()

          if (!result.success) {
            throw new Error(result.message || 'Error al agregar estudiante a la clase')
          }

          // Refresh class detail
          await get().fetchClassDetail(classId)
        } catch (error) {
          throw error
        }
      },

      removeStudentFromClass: async (classId: string, studentId: string) => {
        try {
          const response = await fetch(`/api/teacher/classes/${classId}/students/${studentId}`, {
            method: 'DELETE'
          })
          const result = await response.json()

          if (!result.success) {
            throw new Error(result.message || 'Error al remover estudiante de la clase')
          }

          // Refresh class detail
          await get().fetchClassDetail(classId)
        } catch (error) {
          throw error
        }
      },

      fetchAlerts: async (unreadOnly = false) => {
        set({ alertsLoading: true, alertsError: null })
        try {
          const url = `/api/teacher/alerts${unreadOnly ? '?unreadOnly=true' : ''}`
          const response = await fetch(url)
          const data = await response.json()

          if (!data.success) {
            throw new Error(data.message || 'Error al cargar alertas')
          }

          set({
            alerts: data.alerts,
            unreadAlertsCount: data.unreadCount || 0,
            alertsLoading: false
          })
        } catch (error) {
          set({
            alertsError: error instanceof Error ? error.message : 'Error desconocido',
            alertsLoading: false
          })
        }
      },

      markAlertAsRead: async (alertId: string) => {
        try {
          const response = await fetch(`/api/teacher/alerts/${alertId}`, {
            method: 'PUT'
          })
          const result = await response.json()

          if (!result.success) {
            throw new Error(result.message || 'Error al marcar alerta como leída')
          }

          // Update local state
          set(state => ({
            alerts: state.alerts.map(alert =>
              alert.id === alertId ? { ...alert, isRead: true } : alert
            ),
            unreadAlertsCount: Math.max(0, state.unreadAlertsCount - 1)
          }))
        } catch (error) {
          throw error
        }
      },

      markAllAlertsAsRead: async () => {
        try {
          const response = await fetch('/api/teacher/alerts', {
            method: 'PUT'
          })
          const result = await response.json()

          if (!result.success) {
            throw new Error(result.message || 'Error al marcar todas las alertas como leídas')
          }

          // Refresh alerts
          await get().fetchAlerts()
        } catch (error) {
          throw error
        }
      },

      createAlert: async (data) => {
        try {
          const response = await fetch('/api/teacher/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          const result = await response.json()

          if (!result.success) {
            throw new Error(result.message || 'Error al crear alerta')
          }

          // Refresh alerts
          await get().fetchAlerts()
        } catch (error) {
          throw error
        }
      },

      fetchAssignments: async () => {
        set({ assignmentsLoading: true, assignmentsError: null })
        try {
          const response = await fetch('/api/teacher/assignments')
          const data = await response.json()

          if (!data.success) {
            throw new Error(data.message || 'Error al cargar asignaciones')
          }

          set({ assignments: data.assignments, assignmentsLoading: false })
        } catch (error) {
          set({
            assignmentsError: error instanceof Error ? error.message : 'Error desconocido',
            assignmentsLoading: false
          })
        }
      },

      createAssignment: async (data) => {
        set({ assignmentsLoading: true, assignmentsError: null })
        try {
          const response = await fetch('/api/teacher/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          const result = await response.json()

          if (!result.success) {
            throw new Error(result.message || 'Error al crear asignación')
          }

          // Refresh assignments
          await get().fetchAssignments()
        } catch (error) {
          set({
            assignmentsError: error instanceof Error ? error.message : 'Error desconocido',
            assignmentsLoading: false
          })
          throw error
        }
      },

      reset: () => set(initialState)
    }),
    { name: 'TeacherDashboard' }
  )
)
