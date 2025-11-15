/**
 * Error Message Component
 * Displays user-friendly error messages with retry functionality
 */

interface ErrorMessageProps {
  message: string
  title?: string
  onRetry?: () => void
  severity?: 'error' | 'warning' | 'info'
  className?: string
}

export default function ErrorMessage({
  message,
  title,
  onRetry,
  severity = 'error',
  className = ''
}: ErrorMessageProps) {
  const severityStyles = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-900 dark:text-red-200',
      text: 'text-red-700 dark:text-red-300'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-900 dark:text-yellow-200',
      text: 'text-yellow-700 dark:text-yellow-300'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-200',
      text: 'text-blue-700 dark:text-blue-300'
    }
  }

  const styles = severityStyles[severity]

  return (
    <div
      className={}
      role="alert"
    >
      <div className="flex items-start">
        <div className={}>
          {severity === 'error' && (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={}>
              {title}
            </h3>
          )}
          <p className={}>
            {message}
          </p>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-200"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
      <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
      {description && <p className="mb-4 text-sm text-gray-600">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
          {action.label}
        </button>
      )}
    </div>
  )
}
