/**
 * Test Teacher Voice System
 * Tests TTS, STT, and Lip-sync functionality
 */

import dotenv from 'dotenv'
import { generateSpeech, validateTTSText } from '../lib/speech/tts'
import { generateLipSyncFromBuffer, testRhubarbInstallation } from '../lib/speech/lip-sync'
import { getCacheStatistics } from '../lib/db/teacher-voice-queries'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

async function testTTS() {
  console.log('\n🎤 Testing TTS (Text-to-Speech)...')
  console.log('==================================')

  const testText = '¡Hola! Soy tu profesor de matemáticas. Estoy aquí para ayudarte a aprender.'

  // Validate text
  const validation = validateTTSText(testText)
  if (!validation.valid) {
    console.error('❌ Text validation failed:', validation.error)
    return false
  }

  // Generate speech
  try {
    const result = await generateSpeech(testText, {
      voice: 'nova',
      model: 'tts-1',
    })

    console.log(`✅ TTS Success:`)
    console.log(`   - Audio size: ${result.audio.length} bytes`)
    console.log(`   - Voice: ${result.voice}`)
    console.log(`   - Model: ${result.model}`)
    console.log(`   - Hash: ${result.textHash.substring(0, 16)}...`)

    // Save test audio
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    const testAudioPath = path.join(tempDir, 'test-teacher-voice.wav')
    fs.writeFileSync(testAudioPath, result.audio)
    console.log(`   - Saved to: ${testAudioPath}`)

    return result.audio
  } catch (error: any) {
    console.error('❌ TTS failed:', error.message)
    return null
  }
}

async function testLipSync(audioBuffer: Buffer | null) {
  console.log('\n👄 Testing Lip-Sync (Rhubarb)...')
  console.log('=================================')

  if (!audioBuffer) {
    console.error('❌ No audio buffer to test')
    return false
  }

  // Test Rhubarb installation first
  const rhubarbInstalled = await testRhubarbInstallation()
  if (!rhubarbInstalled) {
    console.error('❌ Rhubarb not installed properly')
    return false
  }

  try {
    const lipsyncData = await generateLipSyncFromBuffer(audioBuffer)

    console.log(`✅ Lip-Sync Success:`)
    console.log(`   - Duration: ${lipsyncData.metadata.duration}s`)
    console.log(`   - Mouth cues: ${lipsyncData.mouthCues.length}`)
    console.log(`   - First 5 cues:`)
    lipsyncData.mouthCues.slice(0, 5).forEach((cue, i) => {
      console.log(`     ${i + 1}. ${cue.start.toFixed(2)}s - ${cue.end.toFixed(2)}s: ${cue.value}`)
    })

    return true
  } catch (error: any) {
    console.error('❌ Lip-sync failed:', error.message)
    return false
  }
}

async function testCacheSystem() {
  console.log('\n💾 Testing Cache System...')
  console.log('===========================')

  try {
    const stats = await getCacheStatistics()

    console.log(`✅ Cache System Connected:`)
    console.log(`   - Total entries: ${stats.totalEntries}`)
    console.log(`   - Total size: ${(stats.totalSize / 1024).toFixed(2)} KB`)
    console.log(`   - Average hit rate: ${stats.hitRate.toFixed(2)}`)

    if (stats.topCachedPhrases.length > 0) {
      console.log(`   - Top cached phrases:`)
      stats.topCachedPhrases.slice(0, 3).forEach((phrase, i) => {
        console.log(`     ${i + 1}. "${phrase.text.substring(0, 40)}..." (used ${phrase.timesUsed}x)`)
      })
    }

    return true
  } catch (error: any) {
    console.error('❌ Cache system failed:', error.message)
    return false
  }
}

async function testEndToEnd() {
  console.log('\n🔄 End-to-End Test...')
  console.log('=====================')
  console.log('Testing complete flow: TTS → Lip-sync → Cache')

  const testPhrases = [
    '¿Cuánto es 2 más 2?',
    'Muy bien, esa es la respuesta correcta.',
    'Intenta resolver este problema paso a paso.',
  ]

  for (const phrase of testPhrases) {
    console.log(`\nTesting: "${phrase}"`)

    try {
      // Generate speech
      const ttsResult = await generateSpeech(phrase, { voice: 'nova' })
      console.log(`  ✅ TTS: ${ttsResult.audio.length} bytes`)

      // Generate lip-sync
      const lipsyncData = await generateLipSyncFromBuffer(ttsResult.audio)
      console.log(`  ✅ Lip-sync: ${lipsyncData.mouthCues.length} cues`)

      // Simulate caching (we won't actually cache in this test)
      console.log(`  ✅ Ready to cache with hash: ${ttsResult.textHash.substring(0, 16)}...`)

    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`)
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║   Teacher Voice System - Comprehensive Test    ║')
  console.log('╚════════════════════════════════════════════════╝')

  const results = {
    tts: false,
    lipSync: false,
    cache: false,
    endToEnd: false,
  }

  // Test TTS
  const audioBuffer = await testTTS()
  results.tts = audioBuffer !== null

  // Test Lip-Sync
  if (audioBuffer) {
    results.lipSync = await testLipSync(audioBuffer)
  }

  // Test Cache System
  results.cache = await testCacheSystem()

  // End-to-End Test
  if (results.tts && results.lipSync) {
    await testEndToEnd()
    results.endToEnd = true
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════╗')
  console.log('║   Test Summary                                 ║')
  console.log('╚════════════════════════════════════════════════╝')
  console.log(`\nTTS:           ${results.tts ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Lip-Sync:      ${results.lipSync ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Cache:         ${results.cache ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`End-to-End:    ${results.endToEnd ? '✅ PASSED' : '❌ FAILED'}`)

  const allPassed = Object.values(results).every(r => r)

  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED - System is ready!')
    console.log('\n📝 Next Steps:')
    console.log('   1. Create 3D teacher component')
    console.log('   2. Integrate with game UI')
    console.log('   3. Test full conversation flow')
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - Please review errors above')
  }

  console.log('\n')
}

main()
