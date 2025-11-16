/**
 * TeacherOverlay Component
 * UI overlay for teacher controls and conversation
 */

'use client'

import { useState } from 'react'
import type { TeacherOverlayProps } from './types'

export function TeacherOverlay({
  teacherName,
  currentMessage,
  isListening,
  isSpeaking,
  onToggleVisibility,
  onToggleMute,
  onStartVoiceInput,
  onStopVoiceInput,
  conversationHistory,
  settings,
}: TeacherOverlayProps) {
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Bar - Teacher Info */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Teacher Name Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <div>
              <div className="text-sm font-bold text-gray-800">{teacherName}</div>
              <div className="text-xs text-gray-600">
                {isSpeaking ? 'Hablando...' : isListening ? 'Escuchando...' : 'Listo para ayudar'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg p-2 transition-colors"
            title="Historial de conversación"
          >
            <span className="text-xl">💬</span>
            {conversationHistory.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {conversationHistory.length}
              </span>
            )}
          </button>
          <button
            onClick={onToggleMute}
            className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg p-2 transition-colors"
            title={settings.volume > 0 ? 'Silenciar' : 'Activar sonido'}
          >
            <span className="text-xl">{settings.volume > 0 ? '🔊' : '🔇'}</span>
          </button>
          <button
            onClick={onToggleVisibility}
            className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-lg p-2 transition-colors"
            title={settings.visible ? 'Ocultar profesor' : 'Mostrar profesor'}
          >
            <span className="text-xl">{settings.visible ? '👁️' : '🙈'}</span>
          </button>
        </div>
      </div>

      {/* Current Message Bubble */}
      {currentMessage && (
        <div className="absolute top-24 left-4 right-4 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">💬</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-600 mb-1">{teacherName} dice:</div>
                <div className="text-gray-800 leading-relaxed">{currentMessage}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversation History Panel */}
      {showHistory && (
        <div className="absolute top-4 right-4 w-80 max-h-[70vh] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
          <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
            <div className="font-bold">Historial de conversación</div>
            <button
              onClick={() => setShowHistory(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(70vh-60px)] p-4 space-y-3">
            {conversationHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No hay conversación aún.
                <br />
                ¡Pregúntale algo al profesor!
              </div>
            ) : (
              conversationHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'student'
                        ? 'bg-blue-500 text-white rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1">
                      {message.role === 'student' ? 'Tú' : teacherName}
                    </div>
                    <div className="text-sm">{message.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Bottom Bar - Voice Input */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl px-6 py-4">
          <button
            onClick={isListening ? onStopVoiceInput : onStartVoiceInput}
            disabled={isSpeaking}
            className={`relative w-16 h-16 rounded-full transition-all duration-300 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
            } ${
              isSpeaking
                ? 'opacity-50 cursor-not-allowed'
                : 'shadow-lg cursor-pointer'
            }`}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
              {isListening ? '⏹️' : '🎤'}
            </div>
          </button>
          <div className="text-xs text-gray-600 text-center mt-2">
            {isSpeaking
              ? 'El profesor está hablando...'
              : isListening
                ? 'Presiona para detener'
                : 'Presiona para hablar'}
          </div>
        </div>
      </div>

      {/* Listening Indicator */}
      {isListening && (
        <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-red-500/90 text-white px-6 py-2 rounded-full shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-ping" />
              <span className="font-semibold">Escuchando...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
