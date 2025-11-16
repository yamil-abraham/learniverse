/**
 * TeacherContainer Component
 * Main container that orchestrates 3D teacher, voice, and UI
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Teacher3D } from './Teacher3D'
import { TeacherScene } from './TeacherScene'
import { TeacherOverlay } from './TeacherOverlay'
import { useTeacherVoice } from '@/hooks/useTeacherVoice'
import type { TeacherSettings } from './types'
import { AVAILABLE_TEACHERS } from './types'

interface TeacherContainerProps {
  activityId?: string
  activityContext?: string
  sessionId?: string
  teacherId?: string
  fullscreen?: boolean
  onClose?: () => void
}

export function TeacherContainer({
  activityId,
  activityContext,
  sessionId,
  teacherId = 'teacher1',
  fullscreen = true,
  onClose,
}: TeacherContainerProps) {
  const { data: session } = useSession()

  // Find teacher model
  const teacher = AVAILABLE_TEACHERS.find(t => t.id === teacherId) || AVAILABLE_TEACHERS[0]

  // Teacher settings
  const [settings, setSettings] = useState<TeacherSettings>({
    teacherId: teacher.id,
    visible: true,
    volume: 1,
    speed: 1,
    autoResponse: true,
  })

  // Voice hook
  const {
    isListening,
    isSpeaking,
    isProcessing,
    currentMessage,
    currentAnimation,
    currentLipsync,
    conversationHistory,
    error,
    startListening,
    stopListening,
    stopSpeaking,
    clearHistory,
  } = useTeacherVoice({
    teacherId: teacher.id,
    voice: teacher.voiceId,
    languageFormality: 'mixed',
    sessionId: sessionId,
    activityId: activityId,
    activityContext: activityContext,
  })

  // Handle toggle visibility
  const handleToggleVisibility = () => {
    setSettings(prev => ({ ...prev, visible: !prev.visible }))
  }

  // Handle toggle mute
  const handleToggleMute = () => {
    setSettings(prev => ({ ...prev, volume: prev.volume > 0 ? 0 : 1 }))
  }

  // Handle voice input
  const handleStartVoiceInput = () => {
    if (isSpeaking) {
      stopSpeaking()
    }
    startListening()
  }

  const handleStopVoiceInput = () => {
    stopListening()
  }

  // Display error messages
  useEffect(() => {
    if (error) {
      console.error('Teacher error:', error)
      // You could show a toast notification here
    }
  }, [error])

  // Container style
  const containerStyle = fullscreen
    ? 'fixed inset-0 z-50 bg-gradient-to-br from-blue-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-sm'
    : 'relative w-full h-full bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-pink-900/90'

  if (!settings.visible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleToggleVisibility}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110"
          title="Mostrar profesor"
        >
          <span className="text-2xl">👨‍🏫</span>
        </button>
      </div>
    )
  }

  return (
    <div className={containerStyle}>
      {/* Close button (for fullscreen mode) */}
      {fullscreen && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
        >
          <span className="text-xl">✕</span>
        </button>
      )}

      {/* 3D Scene */}
      <div className="absolute inset-0">
        <TeacherScene
          cameraPosition={[0, 0, 5]}
          cameraFov={50}
          enableShadows={true}
          backgroundColor="transparent"
        >
          <Teacher3D
            modelPath={teacher.modelPath}
            position={[0, -1.5, 0]}
            scale={1}
            animation={currentAnimation as any}
            expression="default"
            isAnimated={true}
            lipsyncData={currentLipsync}
            onLoadComplete={() => {
              console.log(`✅ Teacher model loaded: ${teacher.name}`)
            }}
          />
        </TeacherScene>
      </div>

      {/* UI Overlay */}
      <TeacherOverlay
        teacherName={teacher.name}
        currentMessage={currentMessage}
        isListening={isListening}
        isSpeaking={isSpeaking}
        onToggleVisibility={handleToggleVisibility}
        onToggleMute={handleToggleMute}
        onStartVoiceInput={handleStartVoiceInput}
        onStopVoiceInput={handleStopVoiceInput}
        conversationHistory={conversationHistory}
        settings={settings}
      />

      {/* Error Display */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white px-6 py-4 rounded-xl shadow-2xl max-w-md">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold mb-1">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && !isListening && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <div className="font-semibold text-gray-800">Procesando...</div>
          </div>
        </div>
      )}
    </div>
  )
}
