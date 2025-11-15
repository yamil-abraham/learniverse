/**
 * Alert Badge Component
 * For displaying alerts with severity indicators
 */

import React from 'react'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'

interface AlertBadgeProps {
  severity: 'low' | 'medium' | 'high'
  count?: number
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function AlertBadge({ severity, count, showIcon = true, size = 'md' }: AlertBadgeProps) {
  const severityConfig = {
    low: {
      icon: Info,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-800 dark:text-blue-200',
      borderColor: 'border-blue-200 dark:border-blue-800',
      label: 'Baja'
    },
    medium: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      label: 'Media'
    },
    high: {
      icon: AlertCircle,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-800 dark:text-red-200',
      borderColor: 'border-red-200 dark:border-red-800',
      label: 'Alta'
    }
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
      {count !== undefined && count > 0 && (
        <span className="ml-1 rounded-full bg-current/20 px-2 py-0.5 text-xs font-bold">
          {count}
        </span>
      )}
    </span>
  )
}
