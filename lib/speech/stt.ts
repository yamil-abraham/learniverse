/**
 * Speech-to-Text Module
 * OpenAI Whisper Integration for Student Voice Input
 */

import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

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
 * STT configuration
 */
export interface STTConfig {
  language?: string
  temperature?: number
  responseFormat?: 'text' | 'json' | 'verbose_json'
}

/**
 * STT result (verbose mode)
 */
export interface STTResult {
  text: string
  duration?: number
  language?: string
  segments?: Array<{
    start: number
    end: number
    text: string
  }>
}

/**
 * Transcribe audio using OpenAI Whisper
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  config: STTConfig = {}
): Promise<string> {
  try {
    const language = config.language || process.env.OPENAI_WHISPER_LANGUAGE || 'es'
    const temperature = config.temperature || 0
    const responseFormat = config.responseFormat || 'text'

    console.log(`🎧 Transcribing audio: ${audioBuffer.length} bytes, language=${language}`)

    // Create temporary file (Whisper API requires a file)
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const tempPath = path.join(tempDir, `audio-${Date.now()}.webm`)
    fs.writeFileSync(tempPath, audioBuffer)

    const startTime = Date.now()

    try {
      const openai = getOpenAIClient()
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: 'whisper-1',
        language: language,
        response_format: responseFormat,
        temperature: temperature,
      })

      const duration = Date.now() - startTime

      // Clean up temp file
      fs.unlinkSync(tempPath)

      const text = typeof transcription === 'string' ? transcription : transcription.text || ''

      console.log(`✅ Transcription complete: "${text.substring(0, 50)}..." (${duration}ms)`)

      return text.trim()
    } catch (error) {
      // Clean up temp file even on error
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath)
      }
      throw error
    }
  } catch (error: any) {
    console.error('❌ Error in STT:', error)
    throw new Error(`Transcription failed: ${error.message}`)
  }
}

/**
 * Transcribe audio with detailed response (verbose mode)
 */
export async function transcribeAudioVerbose(
  audioBuffer: Buffer,
  config: STTConfig = {}
): Promise<STTResult> {
  try {
    const language = config.language || process.env.OPENAI_WHISPER_LANGUAGE || 'es'

    console.log(`🎧 Transcribing audio (verbose): ${audioBuffer.length} bytes`)

    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const tempPath = path.join(tempDir, `audio-${Date.now()}.webm`)
    fs.writeFileSync(tempPath, audioBuffer)

    try {
      const openai = getOpenAIClient()
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: 'whisper-1',
        language: language,
        response_format: 'verbose_json',
      }) as any

      // Clean up temp file
      fs.unlinkSync(tempPath)

      const result: STTResult = {
        text: transcription.text || '',
        duration: transcription.duration,
        language: transcription.language,
        segments: transcription.segments,
      }

      console.log(`✅ Verbose transcription complete: ${result.text.substring(0, 50)}...`)

      return result
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath)
      }
      throw error
    }
  } catch (error: any) {
    console.error('❌ Error in verbose STT:', error)
    throw new Error(`Verbose transcription failed: ${error.message}`)
  }
}

/**
 * Transcribe audio from file path
 */
export async function transcribeAudioFile(
  filePath: string,
  config: STTConfig = {}
): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`)
    }

    const language = config.language || process.env.OPENAI_WHISPER_LANGUAGE || 'es'

    console.log(`🎧 Transcribing file: ${filePath}`)

    const openai = getOpenAIClient()
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      language: language,
      response_format: 'text',
    })

    const text = typeof transcription === 'string' ? transcription : (transcription as any).text || ''

    console.log(`✅ File transcription complete: "${text.substring(0, 50)}..."`)

    return text.trim()
  } catch (error: any) {
    console.error('❌ Error transcribing file:', error)
    throw new Error(`File transcription failed: ${error.message}`)
  }
}

/**
 * Validate audio buffer
 */
export function validateAudioBuffer(buffer: Buffer): { valid: boolean; error?: string } {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'El audio está vacío' }
  }

  // Check minimum size (1KB)
  if (buffer.length < 1024) {
    return { valid: false, error: 'El audio es demasiado corto' }
  }

  // Check maximum size (25MB - OpenAI limit)
  const maxSize = 25 * 1024 * 1024
  if (buffer.length > maxSize) {
    return { valid: false, error: 'El audio es demasiado grande (máximo 25MB)' }
  }

  return { valid: true }
}

/**
 * Estimate transcription cost
 * OpenAI charges $0.006 per minute
 */
export function estimateTranscriptionCost(durationSeconds: number): number {
  const durationMinutes = durationSeconds / 60
  const costPerMinute = 0.006
  return durationMinutes * costPerMinute
}

/**
 * Clean up temp audio files older than 1 hour
 */
export function cleanupTempAudioFiles(): void {
  try {
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      return
    }

    const files = fs.readdirSync(tempDir)
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    files.forEach(file => {
      const filePath = path.join(tempDir, file)
      const stats = fs.statSync(filePath)
      const age = now - stats.mtimeMs

      if (age > oneHour) {
        fs.unlinkSync(filePath)
        console.log(`🧹 Cleaned up old temp file: ${file}`)
      }
    })
  } catch (error) {
    console.error('Error cleaning up temp files:', error)
  }
}

export default {
  transcribeAudio,
  transcribeAudioVerbose,
  transcribeAudioFile,
  validateAudioBuffer,
  estimateTranscriptionCost,
  cleanupTempAudioFiles,
}
