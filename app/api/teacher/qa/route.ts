/**
 * Teacher Q&A API Route
 * Handles freeform questions from students
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { generateLipSyncFromBuffer } from '@/lib/speech/lip-sync'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export const maxDuration = 60 // 60 seconds for AI + TTS + Rhubarb

export async function POST(req: NextRequest) {
  try {
    console.log('💬 Q&A API called')
    const { question } = await req.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    console.log('📝 Student question:', question)

    // 1. Get ChatGPT response
    const systemPrompt = `Eres un profesor de matemáticas amigable y motivador para niños de 9-11 años.
Respondes preguntas de forma clara, simple y educativa.
Si la pregunta no es sobre matemáticas, redirige amablemente al tema.
Usa ejemplos del día a día que los niños puedan entender.
Máximo 150 palabras.

Responde en formato JSON:
{
  "text": "tu explicación completa aquí",
  "steps": ["paso 1 opcional", "paso 2 opcional"]
}`

    console.log('🤖 Generating ChatGPT response...')
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      response_format: { type: 'json_object' },
    })

    const response = JSON.parse(chatCompletion.choices[0].message.content || '{}')
    const responseText: string = response.text || 'Lo siento, no entendí la pregunta.'
    console.log('✅ ChatGPT response:', responseText.substring(0, 100))

    // 2. Generate audio with OpenAI TTS
    console.log('🔊 Generating audio...')
    const audioResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova', // Female voice for both teachers in Q&A mode
      input: responseText,
      response_format: 'wav', // WAV format for Rhubarb compatibility
      speed: 0.9,
    })

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer())
    console.log('✅ Audio generated:', audioBuffer.length, 'bytes')

    // 3. Generate lip-sync with Rhubarb
    console.log('👄 Generating lip-sync...')
    let lipsyncData
    try {
      // Pass 'wav' format since OpenAI TTS returns WAV
      lipsyncData = await generateLipSyncFromBuffer(audioBuffer, 'wav')
      console.log('✅ Lip-sync generated:', lipsyncData.mouthCues.length, 'cues')
    } catch (lipSyncError) {
      console.error('❌ Lip-sync generation failed:', lipSyncError)
      // Return without lip-sync if it fails
      lipsyncData = {
        metadata: { soundFile: '', duration: 0 },
        mouthCues: []
      }
    }

    // 4. Return complete response
    console.log('📤 Preparing response data...')
    const responseData = {
      text: responseText,
      steps: response.steps || [],
      audio: audioBuffer.toString('base64'),
      lipsync: lipsyncData,
      animation: 'Talking',
      expression: 'default',
    }

    console.log('📤 Sending JSON response...')
    const jsonResponse = NextResponse.json(responseData)
    console.log('✅ Q&A API complete')
    return jsonResponse

  } catch (error) {
    console.error('❌ Error in Q&A API:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Failed to process question', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
