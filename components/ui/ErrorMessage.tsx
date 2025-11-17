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
      bg: 'bg-destructive/10',
      border: 'border-destructive/20',
      icon: 'text-destructive',
      title: 'text-destructive',
      text: 'text-destructive'
    },
    warning: {
      bg: 'bg-secondary/10',
      border: 'border-secondary/20',
      icon: 'text-secondary',
      title: 'text-secondary',
      text: 'text-secondary'
    },
    info: {
      bg: 'bg-accent/10',
      border: 'border-accent/20',
      icon: 'text-accent',
      title: 'text-accent',
      text: 'text-accent'
    }
  }

  const styles = severityStyles[severity]

  return (
    <div
      className={`rounded-lg border ${styles.bg} ${styles.border} p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {severity === 'error' && (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {severity === 'warning' && (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {severity === 'info' && (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          <p className={`${title ? 'mt-1' : ''} text-sm ${styles.text}`}>
            {message}
          </p>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
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

interface EmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted p-12 text-center">
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-medium text-foreground">{title}</h3>
      {description && <p className="mb-4 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
