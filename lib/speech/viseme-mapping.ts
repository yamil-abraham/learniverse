/**
 * Viseme Mapping: Rhubarb → Azure
 *
 * Maps Rhubarb Lip-Sync visemes (A-H, X) to Azure Speech Service viseme IDs (0-21)
 * Reference: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme
 */

import type { Viseme } from './lip-sync'

/**
 * Azure viseme IDs (0-21)
 * From Microsoft documentation
 */
export const AZURE_VISEMES = {
  sil: 0, // Silence
  PP: 1, // p, b, m
  FF: 2, // f, v
  TH: 3, // th (θ, ð)
  DD: 4, // t, d
  kk: 5, // k, g
  CH: 6, // tʃ, dʒ, ʃ
  SS: 7, // s, z
  nn: 8, // n, l
  RR: 9, // r
  aa: 10, // ɑ
  E: 11, // ɛ
  I: 12, // ɪ
  O: 13, // ɔ
  U: 14, // ʊ
  AA: 15, // æ
  e: 16, // e
  i: 17, // i
  o: 18, // o
  u: 19, // u
  // Additional
  PP_alt: 20, // Alternative p, b, m
  RR_alt: 21, // Alternative r
} as const

/**
 * Rhubarb visemes (A-H, X)
 * From Rhubarb Lip-Sync documentation
 *
 * A: Closed mouth (p, b, m)
 * B: Slightly open (k, g, hard consonants)
 * C: Open (i, ee sounds)
 * D: Wide open (a, ah sounds)
 * E: Rounded (o, oh sounds)
 * F: Pursed (u, oo sounds)
 * G: Teeth visible (f, v)
 * H: Tongue between teeth (th)
 * X: Silence
 */

/**
 * Map Rhubarb viseme to Azure viseme ID
 * Based on phonetic similarity
 */
export const RHUBARB_TO_AZURE: Record<Viseme, number> = {
  // A: Closed lips (p, b, m) → Azure PP
  A: AZURE_VISEMES.PP, // 1

  // B: Closed mouth, back consonants (k, g) → Azure kk
  B: AZURE_VISEMES.kk, // 5

  // C: Small opening (i, ee) → Azure I
  C: AZURE_VISEMES.I, // 12

  // D: Wide open (a, ah) → Azure AA
  D: AZURE_VISEMES.AA, // 15

  // E: Rounded (o, oh) → Azure O
  E: AZURE_VISEMES.O, // 13

  // F: Pursed (u, oo) → Azure U
  F: AZURE_VISEMES.U, // 14

  // G: Teeth visible (f, v) → Azure FF
  G: AZURE_VISEMES.FF, // 2

  // H: Tongue between teeth (th) → Azure TH
  H: AZURE_VISEMES.TH, // 3

  // X: Silence → Azure sil
  X: AZURE_VISEMES.sil, // 0
}

/**
 * Get Azure viseme ID for Rhubarb viseme
 */
export function getAzureVisemeId(rhubarbViseme: Viseme): number {
  return RHUBARB_TO_AZURE[rhubarbViseme]
}

/**
 * Convert Rhubarb lip-sync data to Azure-compatible format
 * Transforms mouth cues to use Azure viseme IDs
 */
export function rhubarbToAzureVisemes(
  rhubarbLipsync: { start: number; end: number; value: Viseme }[]
): Array<[number, number]> {
  return rhubarbLipsync.map((cue) => {
    const azureId = getAzureVisemeId(cue.value)
    const timestampMs = cue.start * 1000 // Convert seconds to milliseconds
    return [timestampMs, azureId]
  })
}

/**
 * Get viseme name (for debugging)
 */
export function getAzureVisemeName(visemeId: number): string {
  const entry = Object.entries(AZURE_VISEMES).find(([, id]) => id === visemeId)
  return entry ? entry[0] : 'unknown'
}

/**
 * Validate viseme ID is in valid range
 */
export function isValidAzureViseme(visemeId: number): boolean {
  return visemeId >= 0 && visemeId <= 21
}

export default {
  AZURE_VISEMES,
  RHUBARB_TO_AZURE,
  getAzureVisemeId,
  rhubarbToAzureVisemes,
  getAzureVisemeName,
  isValidAzureViseme,
}
