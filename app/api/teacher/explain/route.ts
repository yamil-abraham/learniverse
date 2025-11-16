/**
 * Teacher Explanation API
 * POST /api/teacher/explain
 *
 * Generates math explanations with audio and lip-sync
 * Combines functionality from reference:
 * - /api/ai (ChatGPT explanations)
 * - /api/tts (Audio generation, but using OpenAI instead of Azure)
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { generateLipSyncFromBuffer } from '@/lib/speech/lip-sync'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60s for Rhubarb processing

interface ExplanationRequest {
  problem: string
  studentAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body: ExplanationRequest = await req.json()
    const { problem, studentAnswer, correctAnswer, isCorrect } = body

    console.log(`🎓 Generating explanation for: ${problem}`)
    console.log(`   Student answer: ${studentAnswer}`)
    console.log(`   Correct: ${isCorrect}`)

    // 1. Generate explanation with ChatGPT
    const explanationPrompt = isCorrect
      ? `El estudiante resolvió correctamente el problema: "${problem}". Su respuesta "${studentAnswer}" es correcta. Responde con una breve celebración motivacional en español (máximo 50 palabras).`
      : `El estudiante respondió "${studentAnswer}" al problema: "${problem}". La respuesta correcta es: "${correctAnswer}". Explica paso a paso la solución en español para niños de 9-11 años (máximo 100 palabras).`

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres una profesora de matemáticas amigable y motivadora para niños de 9-11 años. Explicas con claridad y entusiasmo.

Cuando respondes a una respuesta CORRECTA:
- Celebra el logro
- Sé breve y motivacional
- Usa lenguaje positivo

Cuando respondes a una respuesta INCORRECTA:
- Sé alentadora, nunca crítica
- Explica paso a paso
- Usa ejemplos simples
- Termina con ánimo

SIEMPRE responde en formato JSON:
{
  "text": "tu explicación aquí",
  "steps": ["paso 1", "paso 2", "paso 3"]  // SOLO para respuestas incorrectas
}`,
        },
        {
          role: 'user',
          content: explanationPrompt,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const explanation = JSON.parse(chatCompletion.choices[0].message.content || '{}')
    const explanationText: string = explanation.text || 'Lo siento, hubo un error.'
    const steps: string[] | undefined = explanation.steps

    console.log(`   ✅ Explanation generated: ${explanationText.substring(0, 50)}...`)

    // 2. Generate audio with OpenAI TTS
    const voice = 'nova' // Warm, conversational voice
    console.log(`   🔊 Generating audio with voice: ${voice}`)

    const audioResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: explanationText,
      response_format: 'wav', // WAV format for Rhubarb compatibility
      speed: 0.9, // Slightly slower for kids
    })

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer())
    console.log(`   ✅ Audio generated: ${audioBuffer.length} bytes`)

    // 3. Generate lip-sync with Rhubarb
    console.log(`   👄 Generating lip-sync with Rhubarb...`)

    let lipsyncData
    try {
      lipsyncData = await generateLipSyncFromBuffer(audioBuffer, 'wav')
      console.log(`   ✅ Lip-sync generated: ${lipsyncData.mouthCues.length} cues`)
    } catch (error: any) {
      console.error(`   ❌ Lip-sync generation failed:`, error.message)
      // Continue without lip-sync (teacher will still speak, just without mouth movement)
      lipsyncData = {
        metadata: { soundFile: '', duration: 0 },
        mouthCues: [],
      }
    }

    // 4. Determine animation and expression
    const animation = isCorrect ? 'Celebrating' : 'Talking'
    const expression = isCorrect ? 'celebrating' : 'encouraging'

    // 5. Return complete response
    const response = {
      text: explanationText,
      steps: steps,
      audio: audioBuffer.toString('base64'), // Base64 encode for JSON
      lipsync: lipsyncData,
      animation: animation,
      expression: expression,
    }

    console.log(`   ✅ Complete response ready`)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('❌ Error in teacher explanation API:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate explanation',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
