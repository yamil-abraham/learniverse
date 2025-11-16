/**
 * useTeacherVoice Hook
 * Manages teacher voice conversations and state
 */

import { useState, useCallback, useRef } from 'react'
import type { VoiceResponse, ConversationMessage, LipsyncData } from '@/components/game/teacher/types'

interface UseTeacherVoiceOptions {
  teacherId: string
  voice?: string
  languageFormality?: 'formal' | 'casual' | 'mixed'
  sessionId?: string
  activityId?: string
  activityContext?: string
}

export function useTeacherVoice(options: UseTeacherVoiceOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<string | null>(null)
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [currentLipsync, setCurrentLipsync] = useState<LipsyncData | null>(null)
  const [currentAnimation, setCurrentAnimation] = useState<string>('Idle')
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [error, setError] = useState<string | null>(null)

  // Phase 2: Whiteboard and classroom state
  const [showWhiteboard, setShowWhiteboard] = useState(false)
  const [whiteboardProblem, setWhiteboardProblem] = useState<{
    operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions'
    operand1: number
    operand2: number
  } | null>(null)
  const [classroomType, setClassroomType] = useState<'modern' | 'traditional' | 'none'>('modern')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  /**
   * Start recording student voice
   */
  const startListening = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsListening(true)

      console.log('🎤 Started listening...')
    } catch (err: any) {
      console.error('Error starting recording:', err)
      setError('No se pudo acceder al micrófono')
      setIsListening(false)
    }
  }, [])

  /**
   * Stop recording and send to teacher
   */
  const stopListening = useCallback(async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
      return
    }

    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!

      mediaRecorder.onstop = async () => {
        setIsListening(false)
        setIsProcessing(true)

        try {
          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

          // Convert to base64
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64Audio = reader.result?.toString().split(',')[1]

            if (base64Audio) {
              await sendVoiceMessage(base64Audio)
            }

            setIsProcessing(false)
            resolve()
          }
          reader.readAsDataURL(audioBlob)

          // Stop all tracks
          mediaRecorder.stream.getTracks().forEach(track => track.stop())
        } catch (err: any) {
          console.error('Error processing audio:', err)
          setError('Error al procesar el audio')
          setIsProcessing(false)
          resolve()
        }
      }

      mediaRecorder.stop()
    })
  }, [])

  /**
   * Send voice message to teacher chat endpoint
   */
  const sendVoiceMessage = useCallback(async (audioBase64: string) => {
    try {
      setError(null)

      const response = await fetch('/api/teacher-voice/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: audioBase64,
          sessionId: options.sessionId || `session-${Date.now()}`,
          activityId: options.activityId,
          activityContext: options.activityContext,
          conversationHistory: conversationHistory.slice(-5), // Last 5 messages for context
          voice: options.voice || 'nova',
          languageFormality: options.languageFormality || 'mixed',
          useCache: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Error desconocido')
      }

      // Add to conversation history
      const studentMessage: ConversationMessage = {
        role: 'student',
        content: data.studentInput,
        timestamp: Date.now(),
      }

      const teacherMessage: ConversationMessage = {
        role: 'teacher',
        content: data.teacherResponse.text,
        timestamp: Date.now() + 1,
      }

      setConversationHistory(prev => [...prev, studentMessage, teacherMessage])

      // Play teacher response
      await playTeacherResponse(data.teacherResponse)

    } catch (err: any) {
      console.error('Error sending voice message:', err)
      setError(err.message || 'Error al enviar mensaje de voz')
    }
  }, [options, conversationHistory])

  /**
   * Send text message to teacher
   */
  const sendTextMessage = useCallback(async (text: string) => {
    try {
      setError(null)
      setIsProcessing(true)

      const response = await fetch('/api/teacher-voice/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          sessionId: options.sessionId || `session-${Date.now()}`,
          activityId: options.activityId,
          activityContext: options.activityContext,
          conversationHistory: conversationHistory.slice(-5),
          voice: options.voice || 'nova',
          languageFormality: options.languageFormality || 'mixed',
          useCache: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Error desconocido')
      }

      // Add to conversation history
      const studentMessage: ConversationMessage = {
        role: 'student',
        content: text,
        timestamp: Date.now(),
      }

      const teacherMessage: ConversationMessage = {
        role: 'teacher',
        content: data.teacherResponse.text,
        timestamp: Date.now() + 1,
      }

      setConversationHistory(prev => [...prev, studentMessage, teacherMessage])

      // Play teacher response
      await playTeacherResponse(data.teacherResponse)

    } catch (err: any) {
      console.error('Error sending text message:', err)
      setError(err.message || 'Error al enviar mensaje')
    } finally {
      setIsProcessing(false)
    }
  }, [options, conversationHistory])

  /**
   * Play teacher audio response
   */
  const playTeacherResponse = useCallback(async (response: VoiceResponse) => {
    setIsSpeaking(true)
    setCurrentMessage(response.text)
    setCurrentLipsync(response.lipsync)
    setCurrentAnimation(response.animation || 'TalkingOne')

    // Phase 2: Handle whiteboard
    if (response.showWhiteboard && response.mathProblem) {
      console.log('📊 Showing whiteboard:', response.mathProblem)
      setShowWhiteboard(true)
      setWhiteboardProblem(response.mathProblem)
    }

    // Create audio element
    const audio = new Audio(`data:audio/wav;base64,${response.audio}`)
    audioRef.current = audio

    // Play audio
    audio.onended = () => {
      setIsSpeaking(false)
      setCurrentAnimation('Idle')
      setCurrentLipsync(null)
    }

    audio.onerror = (err) => {
      console.error('Error playing audio:', err)
      setError('Error al reproducir audio del profesor')
      setIsSpeaking(false)
      setCurrentAnimation('Idle')
      setCurrentLipsync(null)
    }

    await audio.play()
  }, [])

  /**
   * Stop teacher speech
   */
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsSpeaking(false)
      setCurrentAnimation('Idle')
      setCurrentLipsync(null)
    }
  }, [])

  /**
   * Clear conversation history
   */
  const clearHistory = useCallback(() => {
    setConversationHistory([])
    setCurrentMessage(null)
    setError(null)
  }, [])

  /**
   * Clear whiteboard (Phase 2)
   */
  const clearWhiteboard = useCallback(() => {
    setShowWhiteboard(false)
    setWhiteboardProblem(null)
  }, [])

  /**
   * Change classroom environment (Phase 2)
   */
  const changeClassroom = useCallback((type: 'modern' | 'traditional' | 'none') => {
    setClassroomType(type)
  }, [])

  return {
    // State
    isListening,
    isSpeaking,
    isProcessing,
    currentMessage,
    currentAnimation,
    currentLipsync,
    conversationHistory,
    error,

    // Phase 2: Whiteboard state
    showWhiteboard,
    whiteboardProblem,
    classroomType,

    // Actions
    startListening,
    stopListening,
    sendTextMessage,
    stopSpeaking,
    clearHistory,

    // Phase 2: Actions
    clearWhiteboard,
    changeClassroom,
  }
}
