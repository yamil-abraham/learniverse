/**
 * Teacher Voice - Speak Endpoint
 * POST /api/teacher-voice/speak
 *
 * Generates speech with lip-sync for the 3D teacher
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { generateSpeech, validateTTSText, generateTextHash, normalizeText, type VoiceType } from '@/lib/speech/tts'
import { generateLipSyncFromBuffer } from '@/lib/speech/lip-sync'
import { getCachedVoiceResponse, cacheVoiceResponse, saveVoiceInteraction } from '@/lib/db/teacher-voice-queries'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for TTS + lip-sync

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

    // Only students can use teacher voice
    if (session.user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Solo los estudiantes pueden usar la voz del profesor' },
        { status: 403 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const {
      text,
      voice,
      model = 'tts-1',
      animation,
      expression,
      useCache = true,
      activityId,
      sessionId,
      interactionType = 'explanation',
    } = body

    // 3. Validate text
    const validation = validateTTSText(text)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error,
          fallbackText: text,
        },
        { status: 400 }
      )
    }

    // 4. Check cache if enabled
    let cached = false
    const textHash = generateTextHash(text, voice || 'nova', model)

    if (useCache) {
      const cachedResponse = await getCachedVoiceResponse(textHash)

      if (cachedResponse) {
        console.log(`✨ Cache HIT: ${textHash}`)
        cached = true

        // Track cached interaction
        if (session.user.studentId) {
          await saveVoiceInteraction({
            studentId: session.user.studentId,
            activityId: activityId || null,
            sessionId: sessionId || null,
            interactionType: interactionType,
            teacherResponseText: text,
            teacherAudioDuration: cachedResponse.audioDurationSeconds || 0,
            voiceUsed: cachedResponse.voice,
            ttsModel: cachedResponse.ttsModel,
            language: cachedResponse.language,
            ttsCached: true,
            lipsyncGenerated: true,
            responseTimeMs: Date.now() - startTime,
          })
        }

        return NextResponse.json({
          success: true,
          audio: cachedResponse.audioBase64,
          lipsync: cachedResponse.lipsyncJson,
          animation: animation || 'TalkingOne',
          expression: expression || 'default',
          duration: cachedResponse.audioDurationSeconds,
          cached: true,
          cacheHit: true,
        })
      }
    }

    console.log(`💨 Cache MISS: ${textHash}`)

    // 5. Generate new audio with TTS
    const ttsResult = await generateSpeech(text, {
      voice: voice as VoiceType,
      model: model as 'tts-1' | 'tts-1-hd',
    })

    // 6. Generate lip-sync
    const lipsyncData = await generateLipSyncFromBuffer(ttsResult.audio)

    // 7. Convert audio to base64
    const audioBase64 = ttsResult.audio.toString('base64')

    // 8. Calculate audio duration
    const audioDurationSeconds = lipsyncData.metadata.duration

    // 9. Cache the response
    if (useCache) {
      try {
        await cacheVoiceResponse({
          textHash: textHash,
          textContent: text,
          textNormalized: normalizeText(text),
          voice: ttsResult.voice,
          ttsModel: ttsResult.model,
          language: 'es',
          audioBase64: audioBase64,
          audioDurationSeconds: audioDurationSeconds,
          lipsyncJson: lipsyncData,
        })
      } catch (error) {
        console.error('Failed to cache response:', error)
        // Continue anyway - caching failure shouldn't block the response
      }
    }

    // 10. Track interaction
    if (session.user.studentId) {
      try {
        await saveVoiceInteraction({
          studentId: session.user.studentId,
          activityId: activityId || null,
          sessionId: sessionId || null,
          interactionType: interactionType,
          teacherResponseText: text,
          teacherAudioDuration: audioDurationSeconds,
          voiceUsed: ttsResult.voice,
          ttsModel: ttsResult.model,
          language: 'es',
          ttsCached: false,
          lipsyncGenerated: true,
          responseTimeMs: Date.now() - startTime,
        })
      } catch (error) {
        console.error('Failed to track interaction:', error)
        // Continue anyway - tracking failure shouldn't block the response
      }
    }

    // 11. Return response
    const responseTime = Date.now() - startTime
    console.log(`✅ Speech generated in ${responseTime}ms`)

    return NextResponse.json({
      success: true,
      audio: audioBase64,
      lipsync: lipsyncData,
      animation: animation || 'TalkingOne',
      expression: expression || 'default',
      duration: audioDurationSeconds,
      cached: false,
      cacheHit: false,
      responseTime: responseTime,
    })

  } catch (error: any) {
    console.error('❌ Error in /api/teacher-voice/speak:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Error al generar voz del profesor',
        error: error.message,
        fallbackText: (await request.json()).text || '',
      },
      { status: 500 }
    )
  }
}
