/**
 * Reusable Dashboard Card Component
 * For displaying stats and key metrics
 * Updated with v0 design system semantic colors
 */

import React, { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  loading?: boolean
  onClick?: () => void
}

export function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  loading = false,
  onClick
}: DashboardCardProps) {
  const variantClasses = {
    default: 'border-border',
    success: 'border-success bg-success/5',
    warning: 'border-secondary bg-secondary/5',
    danger: 'border-destructive bg-destructive/5'
  }

  const iconColorClasses = {
    default: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-secondary',
    danger: 'text-destructive'
  }

  return (
    <div
      className={`
        rounded-lg border p-6 transition-all
        ${variantClasses[variant]}
        ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
        ${loading ? 'animate-pulse' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {loading ? '-' : value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
          {trend && !loading && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend.value > 0
                    ? 'text-success'
                    : trend.value < 0
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`rounded-full p-3 ${iconColorClasses[variant]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  )
}
