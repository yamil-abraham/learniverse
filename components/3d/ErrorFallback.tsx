/**
 * ErrorFallback Component
 * Error boundary for 3D scene failures
 */

'use client'

import { Component, ReactNode } from 'react'

interface ErrorFallbackProps {
  children: ReactNode
}

interface ErrorFallbackState {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary component that catches 3D rendering errors
 */
export default class ErrorFallback extends Component<ErrorFallbackProps, ErrorFallbackState> {
  constructor(props: ErrorFallbackProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorFallbackState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('3D Scene Error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-b from-red-50 to-red-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Error al cargar la escena 3D
            </h2>
            <p className="text-gray-600 mb-4">
              Lo sentimos, hubo un problema al cargar el avatar 3D.
            </p>
            {this.state.error && (
              <p className="text-sm text-gray-500 mb-4 font-mono bg-gray-100 p-2 rounded">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
