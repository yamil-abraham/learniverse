/**
 * Teacher Voice - Listen Endpoint
 * POST /api/teacher-voice/listen
 *
 * Transcribes student voice input using OpenAI Whisper
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { transcribeAudio, validateAudioBuffer } from '@/lib/speech/stt'
import { saveVoiceInteraction } from '@/lib/db/teacher-voice-queries'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for transcription

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Only students can use voice input
    if (session.user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Solo los estudiantes pueden usar entrada de voz' },
        { status: 403 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const {
      audio: audioBase64,
      language = 'es',
      sessionId,
      activityId,
    } = body

    if (!audioBase64) {
      return NextResponse.json(
        { success: false, message: 'No se recibió audio' },
        { status: 400 }
      )
    }

    // 3. Decode base64 audio
    let audioBuffer: Buffer
    try {
      audioBuffer = Buffer.from(audioBase64, 'base64')
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Formato de audio inválido' },
        { status: 400 }
      )
    }

    // 4. Validate audio buffer
    const validation = validateAudioBuffer(audioBuffer)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      )
    }

    console.log(`🎧 Transcribing audio: ${audioBuffer.length} bytes`)

    // 5. Transcribe with Whisper
    const transcription = await transcribeAudio(audioBuffer, { language })

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No se detectó voz en el audio. Intenta hablar más claro.',
        },
        { status: 400 }
      )
    }

    // 6. Calculate audio duration (rough estimate)
    // Audio bitrate approximation: 128 kbps MP3
    const estimatedDurationSeconds = (audioBuffer.length * 8) / (128 * 1000)

    // 7. Track interaction (partial - will be completed in chat endpoint)
    // We don't save to database here because the student question
    // is incomplete without the teacher's response
    const responseTime = Date.now() - startTime

    console.log(`✅ Transcription complete: "${transcription}" (${responseTime}ms)`)

    return NextResponse.json({
      success: true,
      transcription: transcription,
      duration: estimatedDurationSeconds,
      language: language,
      responseTime: responseTime,
    })

  } catch (error: any) {
    console.error('❌ Error in /api/teacher-voice/listen:', error)

    // Retry logic: Check if it's a network error
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Error de red. Por favor, intenta de nuevo.',
          error: error.message,
          retry: true,
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Error al transcribir audio. Verifica que el micrófono funcione correctamente.',
        error: error.message,
        retry: false,
      },
      { status: 500 }
    )
  }
}
