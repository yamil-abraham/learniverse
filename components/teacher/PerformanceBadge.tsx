/**
 * Performance Badge Component
 * For displaying student performance levels
 */

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PerformanceBadgeProps {
  successRate: number
  showTrend?: boolean
  trend?: 'up' | 'down' | 'stable'
  size?: 'sm' | 'md' | 'lg'
}

export function PerformanceBadge({ successRate, showTrend = false, trend = 'stable', size = 'md' }: PerformanceBadgeProps) {
  const getPerformanceLevel = (rate: number) => {
    if (rate >= 80) return 'excellent'
    if (rate >= 60) return 'good'
    if (rate >= 40) return 'average'
    return 'struggling'
  }

  const level = getPerformanceLevel(successRate)

  const levelConfig = {
    excellent: {
      label: 'Excelente',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-200',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    good: {
      label: 'Bien',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-800 dark:text-blue-200',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    average: {
      label: 'Regular',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    struggling: {
      label: 'Necesita Apoyo',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-800 dark:text-red-200',
      borderColor: 'border-red-200 dark:border-red-800'
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

  const config = levelConfig[level]

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}
      `}
    >
      {config.label} ({successRate.toFixed(0)}%)
      {showTrend && (
        <TrendIcon className={iconSizes[size]} />
      )}
    </span>
  )
}
