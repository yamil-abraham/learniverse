/**
 * Teacher Voice - Chat Endpoint
 * POST /api/teacher-voice/chat
 *
 * Complete voice conversation: STT → ChatGPT → TTS + Lip-sync
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { transcribeAudio, validateAudioBuffer } from '@/lib/speech/stt'
import { generateSpeech, validateTTSText, generateTextHash, normalizeText, type VoiceType } from '@/lib/speech/tts'
import { generateLipSyncFromBuffer } from '@/lib/speech/lip-sync'
import { getCachedVoiceResponse, cacheVoiceResponse, saveVoiceInteraction } from '@/lib/db/teacher-voice-queries'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for full conversation

/**
 * Generate math teacher response using ChatGPT
 */
async function generateTeacherResponse(params: {
  studentQuestion: string
  studentName: string
  activityContext?: string
  conversationHistory?: Array<{ role: 'student' | 'teacher'; content: string }>
  languageFormality?: 'formal' | 'casual' | 'mixed'
}): Promise<{
  text: string
  animation: string
  expression: string
}> {
  try {
    // Build conversation context
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = []

    // System prompt - Math teacher personality
    const formalityStyle =
      params.languageFormality === 'formal'
        ? 'usa "usted" y mantén un tono profesional'
        : params.languageFormality === 'casual'
          ? 'usa "tú" y mantén un tono amigable y cercano'
          : 'mezcla "tú" y "usted" según el contexto, siendo amigable pero respetuoso'

    messages.push({
      role: 'system',
      content: `Eres un profesor de matemáticas animado en 3D que ayuda a estudiantes de 9-11 años.

Tu personalidad:
- Paciente, alentador y motivador
- Explicas conceptos de forma clara y con ejemplos prácticos
- Usas analogías del mundo real para hacer las matemáticas divertidas
- Celebras los éxitos y animas ante los errores
- ${formalityStyle}

Instrucciones importantes:
- Mantén respuestas cortas (2-4 oraciones máximo)
- Usa un lenguaje apropiado para la edad
- Puedes usar emojis ocasionalmente
- Si el estudiante pregunta algo fuera de matemáticas, redirige amablemente al tema
- Da pistas sin revelar la respuesta completa

${params.activityContext ? `Contexto actual: ${params.activityContext}` : ''}

Debes responder con un JSON que incluya:
{
  "text": "tu respuesta aquí",
  "animation": "nombre de la animación",
  "expression": "expresión facial"
}

Animaciones disponibles: Idle, TalkingOne, TalkingThree, Happy, Sad, Thinking, Surprised, Explaining, Pointing
Expresiones disponibles: default, smile, sad, surprised, thinking, happy`,
    })

    // Add conversation history
    if (params.conversationHistory) {
      params.conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'student' ? 'user' : 'assistant',
          content: msg.content,
        })
      })
    }

    // Add current student question
    messages.push({
      role: 'user',
      content: params.studentQuestion,
    })

    // Generate response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.8,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0].message.content || '{}'
    const response = JSON.parse(responseText)

    return {
      text: response.text || 'Lo siento, no entendí tu pregunta. ¿Podrías repetirla?',
      animation: response.animation || 'TalkingOne',
      expression: response.expression || 'default',
    }
  } catch (error: any) {
    console.error('Error generating teacher response:', error)
    // Fallback response
    return {
      text: 'Estoy teniendo problemas para pensar ahora mismo. ¿Podrías intentar de nuevo?',
      animation: 'Sad',
      expression: 'sad',
    }
  }
}

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

    // Only students can chat with teacher
    if (session.user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Solo los estudiantes pueden hablar con el profesor' },
        { status: 403 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const {
      audio: audioBase64,
      text: providedText,
      sessionId,
      activityId,
      activityContext,
      conversationHistory,
      voice,
      languageFormality = 'mixed',
      useCache = true,
    } = body

    let studentInput = ''
    let studentInputDuration = 0

    // 3. Get student input (either from audio or text)
    if (audioBase64) {
      // Transcribe audio
      const audioBuffer = Buffer.from(audioBase64, 'base64')
      const validation = validateAudioBuffer(audioBuffer)

      if (!validation.valid) {
        return NextResponse.json(
          { success: false, message: validation.error },
          { status: 400 }
        )
      }

      console.log(`🎧 Transcribing student audio...`)
      studentInput = await transcribeAudio(audioBuffer, { language: 'es' })
      studentInputDuration = (audioBuffer.length * 8) / (128 * 1000) // Estimate duration

      if (!studentInput || studentInput.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'No se detectó voz. Intenta hablar más claro.',
          },
          { status: 400 }
        )
      }

      console.log(`✅ Student said: "${studentInput}"`)
    } else if (providedText) {
      studentInput = providedText
    } else {
      return NextResponse.json(
        { success: false, message: 'Se requiere audio o texto' },
        { status: 400 }
      )
    }

    // 4. Generate teacher response with ChatGPT
    console.log(`🤖 Generating teacher response...`)
    const teacherResponse = await generateTeacherResponse({
      studentQuestion: studentInput,
      studentName: session.user.name,
      activityContext: activityContext,
      conversationHistory: conversationHistory,
      languageFormality: languageFormality,
    })

    console.log(`✅ Teacher response: "${teacherResponse.text}"`)

    // 5. Check cache for teacher audio
    const textHash = generateTextHash(teacherResponse.text, voice || 'nova', 'tts-1')
    let cached = false

    if (useCache) {
      const cachedResponse = await getCachedVoiceResponse(textHash)

      if (cachedResponse) {
        console.log(`✨ Cache HIT for teacher response`)
        cached = true

        // Track interaction
        if (session.user.studentId) {
          await saveVoiceInteraction({
            studentId: session.user.studentId,
            activityId: activityId || null,
            sessionId: sessionId || null,
            interactionType: 'question',
            studentInputText: studentInput,
            studentInputAudioDuration: studentInputDuration || null,
            teacherResponseText: teacherResponse.text,
            teacherAudioDuration: cachedResponse.audioDurationSeconds || 0,
            voiceUsed: cachedResponse.voice,
            ttsModel: cachedResponse.ttsModel,
            language: 'es',
            ttsCached: true,
            lipsyncGenerated: true,
            responseTimeMs: Date.now() - startTime,
          })
        }

        return NextResponse.json({
          success: true,
          studentInput: studentInput,
          teacherResponse: {
            text: teacherResponse.text,
            audio: cachedResponse.audioBase64,
            lipsync: cachedResponse.lipsyncJson,
            animation: teacherResponse.animation,
            expression: teacherResponse.expression,
            duration: cachedResponse.audioDurationSeconds,
          },
          sessionId: sessionId || `session-${Date.now()}`,
          cached: true,
        })
      }
    }

    // 6. Generate teacher audio with TTS
    console.log(`🎤 Generating teacher speech...`)
    const ttsResult = await generateSpeech(teacherResponse.text, {
      voice: voice as VoiceType,
      model: 'tts-1',
    })

    // 7. Generate lip-sync
    console.log(`👄 Generating lip-sync...`)
    const lipsyncData = await generateLipSyncFromBuffer(ttsResult.audio)

    // 8. Convert to base64
    const audioBase64Result = ttsResult.audio.toString('base64')
    const audioDurationSeconds = lipsyncData.metadata.duration

    // 9. Cache the response
    if (useCache) {
      try {
        await cacheVoiceResponse({
          textHash: textHash,
          textContent: teacherResponse.text,
          textNormalized: normalizeText(teacherResponse.text),
          voice: ttsResult.voice,
          ttsModel: ttsResult.model,
          language: 'es',
          audioBase64: audioBase64Result,
          audioDurationSeconds: audioDurationSeconds,
          lipsyncJson: lipsyncData,
        })
      } catch (error) {
        console.error('Failed to cache:', error)
      }
    }

    // 10. Track complete interaction
    if (session.user.studentId) {
      try {
        await saveVoiceInteraction({
          studentId: session.user.studentId,
          activityId: activityId || null,
          sessionId: sessionId || null,
          interactionType: 'question',
          studentInputText: studentInput,
          studentInputAudioDuration: studentInputDuration || null,
          teacherResponseText: teacherResponse.text,
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
      }
    }

    // 11. Return complete conversation result
    const responseTime = Date.now() - startTime
    console.log(`✅ Complete conversation in ${responseTime}ms`)

    return NextResponse.json({
      success: true,
      studentInput: studentInput,
      teacherResponse: {
        text: teacherResponse.text,
        audio: audioBase64Result,
        lipsync: lipsyncData,
        animation: teacherResponse.animation,
        expression: teacherResponse.expression,
        duration: audioDurationSeconds,
      },
      sessionId: sessionId || `session-${Date.now()}`,
      cached: false,
      responseTime: responseTime,
    })

  } catch (error: any) {
    console.error('❌ Error in /api/teacher-voice/chat:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Error en la conversación con el profesor',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
