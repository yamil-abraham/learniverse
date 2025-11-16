/**
 * OpenAI Voice Capabilities Verification Script
 * Tests if the current API key has access to TTS and Whisper
 */

import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

async function verifyTTS() {
  console.log('\n🎤 Testing OpenAI TTS API...')

  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: 'Hola, soy tu profesor de matemáticas. Estoy aquí para ayudarte a aprender.',
      response_format: 'mp3',
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())

    // Save test file
    const testDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }

    const testPath = path.join(testDir, 'test-tts.mp3')
    fs.writeFileSync(testPath, buffer)

    console.log('✅ TTS API: WORKING')
    console.log(`   - Generated audio: ${buffer.length} bytes`)
    console.log(`   - Test file saved: ${testPath}`)
    console.log(`   - Voice: nova`)
    console.log(`   - Model: tts-1`)

    return true
  } catch (error: any) {
    console.error('❌ TTS API: FAILED')
    console.error(`   - Error: ${error.message}`)

    if (error.status === 403 || error.status === 401) {
      console.error('   - Issue: API key does not have access to TTS')
      console.error('   - Solution: Check your OpenAI account settings')
    }

    return false
  }
}

async function verifyWhisper() {
  console.log('\n🎧 Testing OpenAI Whisper API...')

  try {
    // First check if test audio exists
    const testAudioPath = path.join(process.cwd(), 'temp', 'test-tts.mp3')

    if (!fs.existsSync(testAudioPath)) {
      console.log('⚠️  No test audio available, skipping Whisper test')
      console.log('   - Run TTS test first to generate test audio')
      return null
    }

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(testAudioPath),
      model: 'whisper-1',
      language: 'es',
      response_format: 'text',
    })

    console.log('✅ Whisper API: WORKING')
    console.log(`   - Transcription: "${transcription}"`)
    console.log(`   - Language: Spanish (es)`)
    console.log(`   - Model: whisper-1`)

    return true
  } catch (error: any) {
    console.error('❌ Whisper API: FAILED')
    console.error(`   - Error: ${error.message}`)

    if (error.status === 403 || error.status === 401) {
      console.error('   - Issue: API key does not have access to Whisper')
      console.error('   - Solution: Check your OpenAI account settings')
    }

    return false
  }
}

async function checkAvailableVoices() {
  console.log('\n🗣️  Available TTS Voices:')
  console.log('   - alloy (neutral, versatile)')
  console.log('   - echo (masculine, authoritative)')
  console.log('   - fable (British, expressive)')
  console.log('   - onyx (deep, resonant)')
  console.log('   - nova (warm, conversational) ⭐ Recommended')
  console.log('   - shimmer (soft, gentle)')
}

async function main() {
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║   OpenAI Voice Capabilities Verification      ║')
  console.log('╚════════════════════════════════════════════════╝')

  if (!process.env.OPENAI_API_KEY) {
    console.error('\n❌ Error: OPENAI_API_KEY not found in .env.local')
    process.exit(1)
  }

  console.log(`\n🔑 API Key: ${process.env.OPENAI_API_KEY.substring(0, 20)}...`)

  const ttsResult = await verifyTTS()
  const whisperResult = await verifyWhisper()

  await checkAvailableVoices()

  console.log('\n╔════════════════════════════════════════════════╗')
  console.log('║   Verification Summary                         ║')
  console.log('╚════════════════════════════════════════════════╝')
  console.log(`\nTTS API:     ${ttsResult ? '✅ READY' : '❌ NOT AVAILABLE'}`)
  console.log(`Whisper API: ${whisperResult === null ? '⚠️  SKIPPED' : whisperResult ? '✅ READY' : '❌ NOT AVAILABLE'}`)

  if (ttsResult && (whisperResult === true || whisperResult === null)) {
    console.log('\n🎉 SUCCESS: Your API key supports voice features!')
    console.log('   You can proceed with the 3D teacher integration.')
    console.log('\n💡 Next Steps:')
    console.log('   1. Review the execution plan in docs/TEACHER_3D_INTEGRATION_PLAN.md')
    console.log('   2. Place 3D models in public/models/teachers/ and public/models/environments/')
    console.log('   3. Download Rhubarb Lip-Sync and place in lib/speech/rhubarb/')
    console.log('   4. Ready to start implementation!')
  } else {
    console.log('\n⚠️  WARNING: Some voice features are not available')
    console.log('   Please check your OpenAI account and API key permissions.')
  }

  console.log('\n')
}

main()
