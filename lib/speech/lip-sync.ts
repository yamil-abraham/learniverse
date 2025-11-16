/**
 * Lip-Sync Module
 * Rhubarb Lip-Sync Integration for Teacher Animations
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execPromise = promisify(exec)

/**
 * Viseme type (Rhubarb output)
 */
export type Viseme = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'X'

/**
 * Mouth cue (timestamp + viseme)
 */
export interface MouthCue {
  start: number
  end: number
  value: Viseme
}

/**
 * Lip-sync data
 */
export interface LipsyncData {
  metadata: {
    soundFile: string
    duration: number
  }
  mouthCues: MouthCue[]
}

/**
 * Viseme to morph target mapping
 * Maps Rhubarb visemes to Three.js morph targets
 */
export const VISEME_MAPPING: Record<Viseme, string> = {
  A: 'viseme_PP', // P, B, M sounds - closed lips
  B: 'viseme_kk', // K, G sounds - closed mouth
  C: 'viseme_I',  // I sounds - small smile
  D: 'viseme_AA', // A sounds - very open mouth
  E: 'viseme_O',  // O sounds - rounded mouth
  F: 'viseme_U',  // U sounds - pursed lips
  G: 'viseme_FF', // F, V sounds - teeth on lip
  H: 'viseme_TH', // TH sounds - tongue between teeth
  X: 'viseme_PP', // Silence
}

/**
 * Generate lip-sync data from audio file using Rhubarb
 */
export async function generateLipSync(audioPath: string): Promise<LipsyncData> {
  try {
    console.log(`👄 Generating lip-sync for: ${audioPath}`)

    const outputPath = audioPath.replace(/\.(mp3|wav|webm)$/, '.json')
    const rhubarbPath = path.join(process.cwd(), 'lib', 'speech', 'rhubarb', 'rhubarb.exe')

    // Check if Rhubarb executable exists
    if (!fs.existsSync(rhubarbPath)) {
      throw new Error(`Rhubarb executable not found at: ${rhubarbPath}`)
    }

    // Check if audio file exists
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`)
    }

    // Execute Rhubarb
    const command = `"${rhubarbPath}" -f json -o "${outputPath}" "${audioPath}"`
    console.log(`   Executing: ${command}`)

    const startTime = Date.now()
    await execPromise(command)
    const duration = Date.now() - startTime

    // Read the generated JSON
    if (!fs.existsSync(outputPath)) {
      throw new Error(`Rhubarb did not generate output file: ${outputPath}`)
    }

    const lipsyncData = JSON.parse(fs.readFileSync(outputPath, 'utf-8')) as LipsyncData

    // Clean up JSON file
    fs.unlinkSync(outputPath)

    console.log(`✅ Lip-sync generated: ${lipsyncData.mouthCues.length} mouth cues (${duration}ms)`)

    return lipsyncData
  } catch (error: any) {
    console.error('❌ Error in Rhubarb lip-sync:', error)
    throw new Error(`Lip-sync generation failed: ${error.message}`)
  }
}

/**
 * Generate lip-sync from audio buffer
 * Supports MP3, WAV, and other formats
 */
export async function generateLipSyncFromBuffer(
  audioBuffer: Buffer,
  format: 'mp3' | 'wav' = 'mp3'
): Promise<LipsyncData> {
  try {
    // Save buffer to temp file
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Use correct file extension based on format
    const tempPath = path.join(tempDir, `lipsync-${Date.now()}.${format}`)
    fs.writeFileSync(tempPath, audioBuffer)

    try {
      const lipsyncData = await generateLipSync(tempPath)

      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath)
      }

      return lipsyncData
    } catch (error) {
      // Clean up temp file even on error
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath)
      }
      throw error
    }
  } catch (error: any) {
    console.error('❌ Error generating lip-sync from buffer:', error)
    throw new Error(`Lip-sync from buffer failed: ${error.message}`)
  }
}

/**
 * Validate lip-sync data
 */
export function validateLipsyncData(data: any): data is LipsyncData {
  if (!data || typeof data !== 'object') {
    return false
  }

  if (!data.metadata || typeof data.metadata !== 'object') {
    return false
  }

  if (!Array.isArray(data.mouthCues)) {
    return false
  }

  // Validate each mouth cue
  for (const cue of data.mouthCues) {
    if (typeof cue.start !== 'number' || typeof cue.end !== 'number') {
      return false
    }
    if (!['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X'].includes(cue.value)) {
      return false
    }
  }

  return true
}

/**
 * Get viseme at specific time
 */
export function getVisemeAtTime(lipsyncData: LipsyncData, timeSeconds: number): Viseme {
  for (const cue of lipsyncData.mouthCues) {
    if (timeSeconds >= cue.start && timeSeconds <= cue.end) {
      return cue.value
    }
  }
  return 'X' // Silence
}

/**
 * Get morph target name for viseme
 */
export function getMorphTargetForViseme(viseme: Viseme): string {
  return VISEME_MAPPING[viseme]
}

/**
 * Convert lip-sync data to animation keyframes
 * Useful for pre-rendering animations
 */
export function lipsyncToKeyframes(lipsyncData: LipsyncData, fps: number = 30): Array<{
  time: number
  viseme: Viseme
  morphTarget: string
}> {
  const keyframes: Array<{ time: number; viseme: Viseme; morphTarget: string }> = []
  const duration = lipsyncData.metadata.duration
  const frameDuration = 1 / fps

  for (let time = 0; time <= duration; time += frameDuration) {
    const viseme = getVisemeAtTime(lipsyncData, time)
    keyframes.push({
      time: time,
      viseme: viseme,
      morphTarget: getMorphTargetForViseme(viseme),
    })
  }

  return keyframes
}

/**
 * Simplify lip-sync data (reduce number of cues for performance)
 */
export function simplifyLipsyncData(
  lipsyncData: LipsyncData,
  minDuration: number = 0.05
): LipsyncData {
  const simplifiedCues: MouthCue[] = []

  for (const cue of lipsyncData.mouthCues) {
    const duration = cue.end - cue.start
    if (duration >= minDuration) {
      simplifiedCues.push(cue)
    }
  }

  return {
    metadata: lipsyncData.metadata,
    mouthCues: simplifiedCues,
  }
}

/**
 * Test Rhubarb installation
 */
export async function testRhubarbInstallation(): Promise<boolean> {
  try {
    const rhubarbPath = path.join(process.cwd(), 'lib', 'speech', 'rhubarb', 'rhubarb.exe')

    if (!fs.existsSync(rhubarbPath)) {
      console.error('❌ Rhubarb executable not found')
      return false
    }

    const { stdout } = await execPromise(`"${rhubarbPath}" --version`)
    console.log('✅ Rhubarb installed:', stdout.trim())
    return true
  } catch (error) {
    console.error('❌ Rhubarb test failed:', error)
    return false
  }
}

export default {
  generateLipSync,
  generateLipSyncFromBuffer,
  validateLipsyncData,
  getVisemeAtTime,
  getMorphTargetForViseme,
  lipsyncToKeyframes,
  simplifyLipsyncData,
  testRhubarbInstallation,
  VISEME_MAPPING,
}
