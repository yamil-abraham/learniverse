/**
 * Text-to-Speech Module
 * OpenAI TTS Integration for Teacher Voice
 */

import OpenAI from 'openai'
import crypto from 'crypto'

// Lazy-initialize OpenAI client to ensure API key is loaded
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    })
  }
  return openaiClient
}

/**
 * Available TTS voices
 */
export const AVAILABLE_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const
export type VoiceType = typeof AVAILABLE_VOICES[number]

/**
 * TTS configuration
 */
export interface TTSConfig {
  voice?: VoiceType
  model?: 'tts-1' | 'tts-1-hd'
  speed?: number // 0.25 to 4.0
}

/**
 * TTS result
 */
export interface TTSResult {
  audio: Buffer
  duration: number
  voice: VoiceType
  model: string
  textHash: string
}

/**
 * Generate audio from text using OpenAI TTS
 */
export async function generateSpeech(
  text: string,
  config: TTSConfig = {}
): Promise<TTSResult> {
  try {
    const voice = config.voice || (process.env.OPENAI_TTS_VOICE as VoiceType) || 'nova'
    const model = config.model || (process.env.OPENAI_TTS_MODEL as 'tts-1' | 'tts-1-hd') || 'tts-1'
    const speed = config.speed || 1.0

    console.log(`🎤 Generating speech: voice=${voice}, model=${model}, length=${text.length}`)

    const startTime = Date.now()

    const openai = getOpenAIClient()
    const audioResponse = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: text,
      response_format: 'wav', // WAV format for Rhubarb compatibility
      speed: speed,
    })

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer())
    const duration = Date.now() - startTime

    // Generate hash for caching
    const textHash = generateTextHash(text, voice, model)

    console.log(`✅ Speech generated: ${audioBuffer.length} bytes in ${duration}ms`)

    return {
      audio: audioBuffer,
      duration: duration,
      voice: voice,
      model: model,
      textHash: textHash,
    }
  } catch (error: any) {
    console.error('❌ Error in TTS:', error)
    throw new Error(`TTS generation failed: ${error.message}`)
  }
}

/**
 * Generate hash for text caching
 */
export function generateTextHash(text: string, voice: VoiceType, model: string): string {
  const normalizedText = text.toLowerCase().trim()
  const hashInput = `${normalizedText}:${voice}:${model}`
  return crypto.createHash('sha256').update(hashInput).digest('hex')
}

/**
 * Normalize text for caching (remove variations that don't affect speech)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/[¡¿]/g, '') // Remove Spanish inverted punctuation
}

/**
 * Estimate audio duration (rough approximation)
 * Based on ~150 words per minute average speech
 */
export function estimateAudioDuration(text: string): number {
  const wordCount = text.split(/\s+/).length
  const wordsPerMinute = 150
  const durationMinutes = wordCount / wordsPerMinute
  const durationSeconds = durationMinutes * 60
  return Math.ceil(durationSeconds)
}

/**
 * Validate text for TTS
 */
export function validateTTSText(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'El texto no puede estar vacío' }
  }

  if (text.length > 4096) {
    return { valid: false, error: 'El texto es demasiado largo (máximo 4096 caracteres)' }
  }

  return { valid: true }
}

/**
 * Get default voice from environment or class settings
 */
export function getDefaultVoice(): VoiceType {
  const envVoice = process.env.OPENAI_TTS_VOICE as VoiceType
  if (envVoice && AVAILABLE_VOICES.includes(envVoice)) {
    return envVoice
  }
  return 'nova'
}

export default {
  generateSpeech,
  generateTextHash,
  normalizeText,
  estimateAudioDuration,
  validateTTSText,
  getDefaultVoice,
  AVAILABLE_VOICES,
}
