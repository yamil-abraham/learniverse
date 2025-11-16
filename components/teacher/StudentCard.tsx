/**
 * Student Card Component
 * For displaying student summary information
 * Updated with v0 design system semantic colors
 */

import React from 'react'
import { User, TrendingUp, Calendar, Target } from 'lucide-react'
import { PerformanceBadge } from './PerformanceBadge'
import type { StudentSummary } from '@/types'

interface StudentCardProps {
  student: StudentSummary
  onClick?: () => void
  showDetails?: boolean
}

export function StudentCard({ student, onClick, showDetails = true }: StudentCardProps) {
  const lastActiveDate = new Date(student.lastActive)
  const daysSinceActive = Math.floor(
    (new Date().getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div
      className={`
        rounded-lg border bg-card p-4
        transition-all hover:shadow-md
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${student.needsAttention ? 'border-l-4 border-l-destructive' : 'border-border'}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {student.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Nivel {student.level}
            </p>
          </div>
        </div>
        <PerformanceBadge successRate={student.successRate} size="sm" />
      </div>

      {showDetails && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              {student.totalAttempts} intentos
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              {daysSinceActive === 0
                ? 'Hoy'
                : daysSinceActive === 1
                ? 'Ayer'
                : `Hace ${daysSinceActive} días`}
            </span>
          </div>
        </div>
      )}

      {student.needsAttention && (
        <div className="mt-3 rounded bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Este estudiante necesita atención
        </div>
      )}
    </div>
  )
}
