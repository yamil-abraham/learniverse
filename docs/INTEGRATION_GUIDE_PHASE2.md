# Phase 2 Integration Guide

This guide shows how to integrate Phase 2 features (whiteboard, classroom, contextual animations) with the existing teacher system.

---

## 1. Update Teacher Chat API

**File:** `app/api/teacher-voice/chat/route.ts`

Add contextual animation detection:

```typescript
import {
  getAnimationForResponse,
  extractMathProblem,
  shouldShowWhiteboard,
  getExpressionForSentiment,
  detectSentiment
} from '@/lib/teacher/animation-context'

// After generating teacher response
const responseText = chatCompletion.choices[0]?.message?.content || ''

// Get contextual animation and expression
const animation = getAnimationForResponse(responseText)
const sentiment = detectSentiment(responseText)
const expression = getExpressionForSentiment(sentiment)

// Check for math visualization
const mathProblem = extractMathProblem(responseText)
const showWhiteboard = shouldShowWhiteboard(responseText) || mathProblem !== null

// Return enhanced response
return NextResponse.json({
  success: true,
  studentInput: transcriptionText,
  teacherResponse: {
    text: responseText,
    audio: audioBase64,
    lipsync: lipsyncData,
    animation: animation,
    expression: expression,
    duration: audioDuration,
    showWhiteboard: showWhiteboard,
    mathProblem: mathProblem,
  },
  sessionId: sessionId,
})
```

---

## 2. Update Teacher Voice Hook

**File:** `hooks/useTeacherVoice.ts`

Add state for whiteboard and classroom:

```typescript
export function useTeacherVoice(options: UseTeacherVoiceOptions) {
  // Existing state...
  const [currentLipsync, setCurrentLipsync] = useState<LipsyncData | null>(null)
  const [currentAnimation, setCurrentAnimation] = useState<string>('Idle')

  // NEW: Add whiteboard state
  const [showWhiteboard, setShowWhiteboard] = useState(false)
  const [whiteboardProblem, setWhiteboardProblem] = useState<{
    operation: string
    operand1: number
    operand2: number
  } | null>(null)

  // NEW: Add classroom state
  const [classroomType, setClassroomType] = useState<'modern' | 'traditional' | 'none'>('modern')

  // Update playTeacherResponse to handle whiteboard
  const playTeacherResponse = useCallback(async (response: VoiceResponse) => {
    setIsSpeaking(true)
    setCurrentMessage(response.text)
    setCurrentLipsync(response.lipsync)
    setCurrentAnimation(response.animation || 'TalkingOne')

    // NEW: Handle whiteboard
    if (response.showWhiteboard && response.mathProblem) {
      setShowWhiteboard(true)
      setWhiteboardProblem(response.mathProblem)
    }

    // ... rest of function
  }, [])

  // NEW: Function to clear whiteboard
  const clearWhiteboard = useCallback(() => {
    setShowWhiteboard(false)
    setWhiteboardProblem(null)
  }, [])

  // NEW: Function to change classroom
  const changeClassroom = useCallback((type: 'modern' | 'traditional' | 'none') => {
    setClassroomType(type)
  }, [])

  return {
    // Existing returns...
    isListening,
    isSpeaking,
    currentAnimation,
    currentLipsync,

    // NEW: Whiteboard state
    showWhiteboard,
    whiteboardProblem,
    clearWhiteboard,

    // NEW: Classroom state
    classroomType,
    changeClassroom,

    // Existing actions...
    startListening,
    stopListening,
    sendTextMessage,
  }
}
```

---

## 3. Update Game Page to Use Phase 2

**File:** `app/game/page.tsx`

```typescript
'use client'

import { useTeacherVoice } from '@/hooks/useTeacherVoice'
import { TeacherScene } from '@/components/game/teacher/TeacherScene'
import Teacher3D from '@/components/game/teacher/Teacher3D'
import { TeacherOverlay } from '@/components/game/teacher/TeacherOverlay'

export default function GamePage() {
  const {
    // Voice state
    isListening,
    isSpeaking,
    currentAnimation,
    currentLipsync,
    currentMessage,

    // NEW: Whiteboard state
    showWhiteboard,
    whiteboardProblem,
    clearWhiteboard,

    // NEW: Classroom state
    classroomType,
    changeClassroom,

    // Actions
    startListening,
    stopListening,
    conversationHistory,
    settings,
  } = useTeacherVoice({
    teacherId: 'teacher1',
    voice: 'nova',
  })

  return (
    <div className="relative w-full h-screen">
      {/* 3D Teacher Scene with Phase 2 features */}
      <TeacherScene
        cameraPosition={[0, 1, 5]}
        cameraFov={50}
        enableShadows={true}
        backgroundColor="#1a1a2e"
        // NEW: Phase 2 props
        classroomType={classroomType}
        showWhiteboard={showWhiteboard}
        whiteboardProblem={whiteboardProblem}
        onWhiteboardAnimationComplete={() => {
          console.log('Whiteboard animation complete')
          // Optionally clear after animation
          // setTimeout(() => clearWhiteboard(), 2000)
        }}
      >
        <Teacher3D
          modelPath="/models/teachers/teacher1.glb"
          animation={currentAnimation}
          lipsyncData={currentLipsync}
          isAnimated={isSpeaking}
          position={[0, 0, 0]}
          scale={1}
        />
      </TeacherScene>

      {/* UI Overlay */}
      <TeacherOverlay
        teacherName="Profesora Nanami"
        currentMessage={currentMessage}
        isListening={isListening}
        isSpeaking={isSpeaking}
        onToggleVisibility={() => {}}
        onToggleMute={() => {}}
        onStartVoiceInput={startListening}
        onStopVoiceInput={stopListening}
        conversationHistory={conversationHistory}
        settings={settings}
      />

      {/* NEW: Classroom switcher (optional) */}
      <div className="absolute top-20 right-4 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => changeClassroom('modern')}
          className={`px-3 py-1 rounded ${classroomType === 'modern' ? 'bg-blue-500 text-white' : 'bg-white'}`}
        >
          Aula Moderna
        </button>
        <button
          onClick={() => changeClassroom('traditional')}
          className={`px-3 py-1 rounded ${classroomType === 'traditional' ? 'bg-blue-500 text-white' : 'bg-white'}`}
        >
          Aula Tradicional
        </button>
        <button
          onClick={() => changeClassroom('none')}
          className={`px-3 py-1 rounded ${classroomType === 'none' ? 'bg-blue-500 text-white' : 'bg-white'}`}
        >
          Simple
        </button>
      </div>

      {/* NEW: Whiteboard control (optional) */}
      {showWhiteboard && (
        <div className="absolute bottom-20 left-4 pointer-events-auto">
          <button
            onClick={clearWhiteboard}
            className="px-4 py-2 bg-white/90 rounded-lg shadow-lg hover:bg-white"
          >
            🗑️ Limpiar Pizarra
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## 4. Update Types

**File:** `components/game/teacher/types.ts`

Add new types for Phase 2:

```typescript
export interface VoiceResponse {
  text: string
  audio: string
  lipsync: LipsyncData
  animation: string
  expression: string
  duration: number
  // NEW: Phase 2 additions
  showWhiteboard?: boolean
  mathProblem?: {
    operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions'
    operand1: number
    operand2: number
  } | null
}
```

---

## 5. Update ChatGPT Prompts (Optional)

To encourage the teacher to use the whiteboard, update the system prompt:

**File:** `app/api/teacher-voice/chat/route.ts`

```typescript
const systemPrompt = `
You are a friendly and encouraging math teacher for students aged 9-11.
You speak Spanish and help students learn through interactive conversations.

IMPORTANT GUIDELINES:
1. When explaining a math problem, mention "Mira la pizarra" to trigger the whiteboard visualization
2. Always include the actual numbers when explaining (e.g., "¿Cuánto es 7 + 5?")
3. Use encouraging language when students succeed
4. Be patient and sympathetic when students struggle
5. Keep explanations simple and visual

EXAMPLES:
- "¡Muy bien! Mira la pizarra, te muestro cómo sumar 7 + 5"
- "Vamos a resolver 12 - 4. Observa la pizarra"
- "Para multiplicar 3 × 4, mira cómo lo dibuj en la pizarra"

Current activity context: ${options.activityContext || 'General math practice'}
`
```

---

## 6. Testing Checklist

After integration, test these scenarios:

### Whiteboard Tests
- [ ] Teacher says "Mira la pizarra" → Whiteboard appears
- [ ] Teacher mentions math problem → Whiteboard shows animation
- [ ] Teacher says "7 + 5" → Addition visualization plays
- [ ] Teacher says "12 - 4" → Subtraction visualization plays
- [ ] Teacher says "3 × 4" → Multiplication visualization plays
- [ ] Whiteboard clears on button click
- [ ] Whiteboard animation completes smoothly

### Animation Tests
- [ ] Teacher says "¡Muy bien!" → Happy animation plays
- [ ] Teacher says "No te preocupes" → Sad animation plays
- [ ] Teacher says "Hmm..." → Thinking animation plays
- [ ] Teacher greets → Greeting animation plays
- [ ] Animation matches speech tone

### Classroom Tests
- [ ] Modern classroom loads without errors
- [ ] Traditional classroom loads without errors
- [ ] Simple environment works as fallback
- [ ] Switching classrooms doesn't crash
- [ ] Performance stays above 30fps

---

## 7. Debugging Tips

### Check Console Logs
The system logs helpful information:
```
Available animations: ['Idle', 'TalkingOne', ...]
Sentiment detected: 'celebrating'
Animation selected: 'Happy'
Math problem found: { operation: 'addition', operand1: 7, operand2: 5 }
```

### Common Issues

**Issue:** Whiteboard doesn't appear
**Fix:** Check `showWhiteboard` in response and verify `whiteboardProblem` is not null

**Issue:** Wrong animation plays
**Fix:** Check keyword detection in `animation-context.ts`, add more keywords if needed

**Issue:** Classroom doesn't load
**Fix:** Verify GLB files exist in `public/models/environments/`, check console for errors

**Issue:** Performance issues
**Fix:** Use simple classroom (`type="none"`), reduce shadow quality, optimize GLB files

---

## 8. Performance Optimization

### Recommended Settings

**For Desktop:**
```typescript
<TeacherScene
  enableShadows={true}
  classroomType="modern"
  showWhiteboard={true}
/>
```

**For Lower-End Devices:**
```typescript
<TeacherScene
  enableShadows={false}
  classroomType="none"
  showWhiteboard={true} // Whiteboard is lightweight
/>
```

### Monitor Performance
```typescript
// Add FPS counter
import Stats from 'stats.js'

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb
document.body.appendChild(stats.dom)

function animate() {
  stats.begin()
  // render scene
  stats.end()
  requestAnimationFrame(animate)
}
```

---

## 9. Optional Enhancements

### Auto-Clear Whiteboard
```typescript
const playTeacherResponse = useCallback(async (response: VoiceResponse) => {
  // ... existing code ...

  if (response.showWhiteboard && response.mathProblem) {
    setShowWhiteboard(true)
    setWhiteboardProblem(response.mathProblem)

    // Auto-clear after 10 seconds
    setTimeout(() => {
      clearWhiteboard()
    }, 10000)
  }
}, [])
```

### Whiteboard History
```typescript
const [whiteboardHistory, setWhiteboardHistory] = useState<any[]>([])

const saveToHistory = useCallback(() => {
  if (whiteboardProblem) {
    setWhiteboardHistory(prev => [...prev, whiteboardProblem])
  }
}, [whiteboardProblem])

const showPreviousProblem = useCallback((index: number) => {
  if (whiteboardHistory[index]) {
    setWhiteboardProblem(whiteboardHistory[index])
    setShowWhiteboard(true)
  }
}, [whiteboardHistory])
```

### Custom Animation Triggers
```typescript
// Add manual animation trigger
const triggerAnimation = useCallback((animation: TeacherAnimationType) => {
  setCurrentAnimation(animation)
  setTimeout(() => setCurrentAnimation('Idle'), 3000)
}, [])

// Use in UI
<button onClick={() => triggerAnimation('Happy')}>
  Celebrar
</button>
```

---

## 10. Next Steps

After integrating Phase 2:

1. **Test thoroughly** with real conversations
2. **Gather feedback** on whiteboard visibility and classroom aesthetics
3. **Optimize performance** if needed
4. **Adjust animation keywords** based on actual teacher responses
5. **Prepare for Phase 3** (Analytics & Admin Features)

---

**Integration Status:** Ready to implement
**Estimated Time:** 2-3 hours
**Dependencies:** Phase 1 must be complete and working
