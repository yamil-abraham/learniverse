/**
 * VoiceInput Component
 * Voice recording button for student input
 */

'use client'

import { useState } from 'react'
import type { VoiceInputProps } from './types'

export function VoiceInput({
  onTranscription,
  onError,
  isProcessing = false,
  disabled = false,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)

  const handleStartRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)

    // Start recording timer
    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
    setRecordingInterval(interval)
  }

  const handleStopRecording = () => {
    setIsRecording(false)

    // Clear recording timer
    if (recordingInterval) {
      clearInterval(recordingInterval)
      setRecordingInterval(null)
    }

    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Recording Button */}
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={disabled || isProcessing}
        className={`relative w-16 h-16 rounded-full transition-all duration-300 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
        } ${
          disabled || isProcessing
            ? 'opacity-50 cursor-not-allowed'
            : 'shadow-lg cursor-pointer'
        }`}
      >
        {isProcessing ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
            {isRecording ? '⏹️' : '🎤'}
          </div>
        )}
      </button>

      {/* Recording Timer */}
      {isRecording && (
        <div className="text-sm font-semibold text-red-500 animate-pulse">
          {formatTime(recordingTime)}
        </div>
      )}

      {/* Status Text */}
      <div className="text-xs text-gray-600 text-center">
        {isProcessing
          ? 'Procesando...'
          : isRecording
            ? 'Grabando... (presiona para detener)'
            : 'Presiona para hablar'}
      </div>
    </div>
  )
}
