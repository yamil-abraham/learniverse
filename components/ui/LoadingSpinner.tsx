/**
 * Loading Spinner Component
 * Reusable loading indicator with customizable size and text
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  color?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({
  size = 'md',
  text,
  color = 'indigo',
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4',
    xl: 'h-24 w-24 border-8'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-${color}-600 border-t-transparent`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {spinner}
      </div>
    )
  }

  return spinner
}

/**
 * Loading Skeleton Component
 * For content placeholders while loading
 */
interface LoadingSkeletonProps {
  className?: string
  count?: number
}

export function LoadingSkeleton({ className = '', count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`}
        />
      ))}
    </>
  )
}

/**
 * Card Skeleton
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <LoadingSkeleton className="mb-4 h-6 w-3/4" />
          <LoadingSkeleton className="mb-2 h-4 w-full" />
          <LoadingSkeleton className="h-4 w-5/6" />
        </div>
      ))}
    </>
  )
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="grid gap-4 border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className={`grid grid-cols-${columns} gap-4`}>
          {Array.from({ length: columns }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-4" />
          ))}
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 border-b border-gray-200 p-4 last:border-b-0 dark:border-gray-700"
        >
          <div className={`grid grid-cols-${columns} gap-4`}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <LoadingSkeleton key={colIndex} className="h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <LoadingSkeleton className="h-6 w-1/3" />
      <LoadingSkeleton className="h-64 w-full" />
    </div>
  )
}
