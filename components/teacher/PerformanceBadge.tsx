/**
 * Performance Badge Component
 * For displaying student performance levels
 * Updated with v0 design system semantic colors
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
      bgColor: 'bg-success/10',
      textColor: 'text-success',
      borderColor: 'border-success/20'
    },
    good: {
      label: 'Bien',
      bgColor: 'bg-accent/10',
      textColor: 'text-accent',
      borderColor: 'border-accent/20'
    },
    average: {
      label: 'Regular',
      bgColor: 'bg-secondary/10',
      textColor: 'text-secondary',
      borderColor: 'border-secondary/20'
    },
    struggling: {
      label: 'Necesita Apoyo',
      bgColor: 'bg-destructive/10',
      textColor: 'text-destructive',
      borderColor: 'border-destructive/20'
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
