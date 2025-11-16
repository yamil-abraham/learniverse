# Reference Project Analysis: r3f-ai-language-teacher

**Analysis Date**: 2025-11-16
**Reference Project**: C:\Users\yamil\Documents\r3f-ai-language-teacher
**Purpose**: Understand architecture to adapt Japanese language teacher to immersive 3D math teacher

---

## 1. COMPONENT HIERARCHY

```
Page (page.js)
└── Experience.jsx (Main Container)
    ├── Leva (Debug controls - hidden)
    ├── Loader (@react-three/drei)
    ├── Canvas (@react-three/fiber)
    │   ├── CameraManager
    │   │   └── CameraControls (from @react-three/drei)
    │   ├── Float (subtle floating animation wrapper)
    │   │   ├── Html (3D HTML element positioned in space)
    │   │   │   ├── MessagesList.jsx (Blackboard content)
    │   │   │   └── BoardSettings.jsx (UI controls on blackboard)
    │   │   ├── Environment (preset="sunset")
    │   │   ├── ambientLight
    │   │   ├── Gltf (Classroom model)
    │   │   └── Teacher.jsx (3D Teacher with animations)
    │   └── TypingBox.jsx (Positioned outside Canvas as overlay)
    └── TypingBox.jsx (HTML overlay - bottom of screen)
```

### Component Positioning in 3D Space

**Key Insight**: The UI is split between:
- **3D HTML elements** (Html from drei): MessagesList + BoardSettings positioned ON the blackboard in 3D space
- **Overlay HTML**: TypingBox positioned using absolute CSS outside Canvas

**Item Placement Configuration** (`Experience.jsx` lines 21-42):
```javascript
const itemPlacement = {
  default: {
    classroom: { position: [0.2, -1.7, -2] },
    teacher: { position: [-1, -1.7, -3] },
    board: { position: [0.45, 0.382, -6] },  // MessagesList rendered here
  },
  alternative: {
    classroom: { position: [0.3, -1.7, -1.5], rotation: [0, degToRad(-90), 0], scale: 0.4 },
    teacher: { position: [-1, -1.7, -3] },
    board: { position: [1.4, 0.84, -8] },
  }
}
```

---

## 2. STATE MANAGEMENT ARCHITECTURE

### Zustand Store: `useAITeacher.js`

**State Structure**:
```javascript
{
  // Scene configuration
  teacher: "Nanami" | "Naoki",
  classroom: "default" | "alternative",

  // Display toggles (Japanese learning specific - REMOVE for math)
  furigana: boolean,
  english: boolean,
  speech: "formal" | "casual",

  // Message/Animation state
  messages: Message[],
  currentMessage: Message | null,
  loading: boolean,

  // Actions
  setTeacher: (teacher) => void,
  setClassroom: (classroom) => void,
  askAI: (question) => Promise<void>,
  playMessage: (message) => void,
  stopMessage: (message) => void,
}
```

**Message Object Structure**:
```javascript
{
  id: number,
  question: string,  // Student's question
  answer: {
    english: string,
    japanese: [{ word: string, reading?: string }],
    grammarBreakdown: [...]  // Japanese-specific - NOT NEEDED for math
  },
  speech: "formal" | "casual",
  audioPlayer: HTMLAudioElement | null,
  visemes: [[timestamp, visemeId], ...],  // Lip-sync data
}
```

**For Math Adaptation**:
```javascript
{
  id: number,
  problemText: string,
  studentAnswer: string,
  isCorrect: boolean,
  explanation: {
    text: string,  // Teacher's explanation
    steps?: string[],  // Step-by-step solution
  },
  audioPlayer: HTMLAudioElement | null,
  lipsync: LipsyncData,  // From Rhubarb
  animation: 'Idle' | 'Talking' | 'Thinking' | 'Celebrating' | 'Explaining',
  expression: 'default' | 'smile' | 'encouraging' | 'celebrating',
}
```

---

## 3. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        JAPANESE LEARNING FLOW                    │
└─────────────────────────────────────────────────────────────────┘

Student Types Question
        ↓
TypingBox.jsx → askAI(question)
        ↓
useAITeacher store
        ↓
SET loading = true
        ↓
API: /api/ai?question=...&speech=formal
        ↓
ChatGPT generates response:
  { english, japanese, grammarBreakdown }
        ↓
SET currentMessage, ADD to messages[], loading = false
        ↓
playMessage(message) triggered
        ↓
API: /api/tts?teacher=Nanami&text=...
        ↓
Azure TTS generates audio + visemes (in headers)
        ↓
Audio Blob → HTMLAudioElement
Visemes → message.visemes
        ↓
Audio playback starts
        ↓
Teacher.jsx (useFrame):
  - Reads message.visemes
  - Updates morph targets based on audio.currentTime
  - Lip-sync animation
        ↓
Audio ends → currentMessage = null


┌─────────────────────────────────────────────────────────────────┐
│                     ADAPTED MATH LEARNING FLOW                   │
└─────────────────────────────────────────────────────────────────┘

System generates problem from gameStore
        ↓
ProblemInterface displays problem
        ↓
Student types answer → clicks "Resolver"
        ↓
gameStore.checkAnswer(answer)
        ↓
Determine: isCorrect = true/false
        ↓
teacherStore.requestExplanation(problem, studentAnswer, correctAnswer, isCorrect)
        ↓
SET loading = true, animation = 'Thinking'
        ↓
API: /api/teacher/explain
  Body: { problem, studentAnswer, correctAnswer, isCorrect }
        ↓
ChatGPT generates:
  - IF CORRECT: celebration message
  - IF INCORRECT: step-by-step explanation
        ↓
OpenAI TTS generates audio (mp3)
        ↓
Rhubarb generates lip-sync from audio file
        ↓
Return: { text, audio (base64), lipsync, expression, animation }
        ↓
teacherStore adds to messages, plays audio
        ↓
MathTeacher.jsx:
  - Switches to animation (Celebrating or Explaining)
  - Updates expression morph targets
  - Syncs lip movement with lipsync data
        ↓
Camera zooms to blackboard
        ↓
MathBlackboard displays:
  - Problem
  - Student's answer (if wrong)
  - Correct answer
  - Step-by-step solution (if wrong)
        ↓
Audio ends → Camera returns to default
```

---

## 4. CAMERA ANIMATION SYSTEM

### Camera Positions & Zoom Levels

**Defined in Experience.jsx (lines 93-105)**:
```javascript
const CAMERA_POSITIONS = {
  default: [0, 0, 0.0001],  // Wide view
  loading: [0.00002, 0.00000515, 0.00009636],  // Slightly closer
  speaking: [0, -1.648e-7, 0.00009999],  // Zoomed to blackboard
};

const CAMERA_ZOOMS = {
  default: 1,
  loading: 1.3,
  speaking: 2.12,  // ~2x zoom when teacher speaks
};
```

### Camera Control Implementation

**CameraManager Component** (lines 107-147):
```javascript
const CameraManager = () => {
  const controls = useRef();  // CameraControls ref
  const loading = useAITeacher((state) => state.loading);
  const currentMessage = useAITeacher((state) => state.currentMessage);

  useEffect(() => {
    if (loading) {
      // Zoom in slightly when thinking
      controls.current?.setPosition(...CAMERA_POSITIONS.loading, true);
      controls.current?.zoomTo(CAMERA_ZOOMS.loading, true);
    } else if (currentMessage) {
      // Zoom to blackboard when teacher speaks
      controls.current?.setPosition(...CAMERA_POSITIONS.speaking, true);
      controls.current?.zoomTo(CAMERA_ZOOMS.speaking, true);
    }
    // Note: No explicit return to default - happens when currentMessage = null
  }, [loading, currentMessage]);

  return (
    <CameraControls
      ref={controls}
      minZoom={1}
      maxZoom={3}
      polarRotateSpeed={-0.3}
      azimuthRotateSpeed={-0.3}
      mouseButtons={{ left: 1, wheel: 16 }}  // Rotate & Zoom
      touches={{ one: 32, two: 512 }}  // Touch controls
    />
  );
};
```

**Key Features**:
- Uses `CameraControls` from `@react-three/drei`
- Animated transitions with `setPosition(..., true)` - `true` enables smooth animation
- User can still manually control camera (rotate, zoom)
- Automatic zoom when `currentMessage` exists

**For Math Adaptation**:
- Add position for "problem display" state
- Add position for "celebration" state (zoom out, show full teacher)
- Add position for "explanation" state (zoom to blackboard)

---

## 5. 3D TEACHER ANIMATION SYSTEM

### Animation Loading & Setup

**Teacher.jsx (lines 15-32)**:
```javascript
export function Teacher({ teacher, ...props }) {
  const group = useRef();

  // Load teacher model (body, materials)
  const { scene } = useGLTF(`/models/Teacher_${teacher}.glb`);

  // Fix materials (ensures proper rendering)
  useEffect(() => {
    scene.traverse((child) => {
      if (child.material) {
        child.material = new MeshStandardMaterial({
          map: child.material.map,  // Preserve texture
        });
      }
    });
  }, [scene]);

  // Load animation clips separately
  const { animations } = useGLTF(`/models/animations_${teacher}.glb`);
  const { actions, mixer } = useAnimations(animations, group);
  const [animation, setAnimation] = useState("Idle");
```

**Animation Clips Used**:
- `Idle` - Default standing pose
- `Thinking` - Triggered when `loading = true`
- `Talking` - Primary talking animation
- `Talking2` - Alternative talking animation (switches between them)

**Animation State Changes** (lines 52-60):
```javascript
useEffect(() => {
  if (loading) {
    setAnimation("Thinking");
  } else if (currentMessage) {
    setAnimation(randInt(0, 1) ? "Talking" : "Talking2");  // Randomize
  } else {
    setAnimation("Idle");
  }
}, [currentMessage, loading]);
```

**Animation Playback** (lines 96-104):
```javascript
useEffect(() => {
  actions[animation]
    ?.reset()
    .fadeIn(mixer.time > 0 ? ANIMATION_FADE_TIME : 0)  // 0.5s fade
    .play();
  return () => {
    actions[animation]?.fadeOut(ANIMATION_FADE_TIME);
  };
}, [animation, actions]);
```

**For Math Adaptation - Needed Animations**:
- `Idle` - Default pose
- `Thinking` - While processing answer
- `Explaining` - Gesturing while explaining (hand movements)
- `Celebrating` - Happy animation for correct answers (arms up, jumping)
- `Encouraging` - Gentle gestures for incorrect answers

**Animation Switching Strategy**:
- `Explaining`: Loop between `Talking` and hand gesture animations
- `Celebrating`: Play once, then return to `Idle`
- Smooth transitions with 0.5s fadeIn/fadeOut

---

## 6. FACIAL EXPRESSIONS & LIP-SYNC

### Morph Targets System

**Blinking** (lines 34-50):
```javascript
const [blink, setBlink] = useState(false);

useEffect(() => {
  let blinkTimeout;
  const nextBlink = () => {
    blinkTimeout = setTimeout(() => {
      setBlink(true);
      setTimeout(() => {
        setBlink(false);
        nextBlink();
      }, 100);  // Blink duration
    }, randInt(1000, 5000));  // Random interval
  };
  nextBlink();
  return () => clearTimeout(blinkTimeout);
}, []);
```

**Morph Target Helper Function** (lines 106-123):
```javascript
const lerpMorphTarget = (target, value, speed = 0.1) => {
  scene.traverse((child) => {
    if (child.isSkinnedMesh && child.morphTargetDictionary) {
      const index = child.morphTargetDictionary[target];
      if (index === undefined || child.morphTargetInfluences[index] === undefined) {
        return;
      }
      // Smooth interpolation to target value
      child.morphTargetInfluences[index] = MathUtils.lerp(
        child.morphTargetInfluences[index],
        value,
        speed
      );
    }
  });
};
```

**Morph Targets Applied in useFrame** (lines 62-94):
```javascript
useFrame(() => {
  // 1. Base smile
  lerpMorphTarget("mouthSmile", 0.2, 0.5);

  // 2. Blinking
  lerpMorphTarget("eye_close", blink ? 1 : 0, 0.5);

  // 3. Reset all viseme morph targets (0-21)
  for (let i = 0; i <= 21; i++) {
    lerpMorphTarget(i, 0, 0.1);
  }

  // 4. Apply current viseme based on audio time
  if (currentMessage && currentMessage.visemes && currentMessage.audioPlayer) {
    for (let i = currentMessage.visemes.length - 1; i >= 0; i--) {
      const viseme = currentMessage.visemes[i];
      // viseme = [timestamp_ms, visemeId]
      if (currentMessage.audioPlayer.currentTime * 1000 >= viseme[0]) {
        lerpMorphTarget(viseme[1], 1, 0.2);  // Apply viseme
        break;  // Only apply most recent viseme
      }
    }

    // 5. Switch between Talking/Talking2 animations
    if (actions[animation].time > actions[animation].getClip().duration - 0.5) {
      setAnimation((animation) =>
        animation === "Talking" ? "Talking2" : "Talking"
      );
    }
  }
});
```

**Viseme System**:
- Visemes are mouth shapes for phonemes
- Azure TTS returns viseme IDs (0-21) with timestamps
- Each frame: find current viseme based on `audioPlayer.currentTime`
- Apply morph target smoothly with lerp

**For Math Adaptation**:
- Replace Azure visemes with **Rhubarb Lip-Sync** visemes
- Rhubarb uses different viseme set: A, B, C, D, E, F, G, H, X
- Map Rhubarb visemes to model's morph targets
- Ref: `lib/speech/rhubarb/` in our project (already has Rhubarb)

---

## 7. BLACKBOARD RENDERING SYSTEM

### How It Works

**MessagesList.jsx** is rendered as HTML in 3D space using `<Html>` from drei:

**Experience.jsx (lines 64-71)**:
```javascript
<Html
  transform  // Transforms with camera
  {...itemPlacement[classroom].board}  // Position: [0.45, 0.382, -6]
  distanceFactor={1}
>
  <MessagesList />
  <BoardSettings />
</Html>
```

**MessagesList.jsx Structure**:
- Sized to match blackboard dimensions (lines 46-50):
  ```javascript
  className={`${
    classroom === "default"
      ? "w-[1288px] h-[676px]"
      : "w-[2528px] h-[856px]"
  } p-8 overflow-y-auto ...`}
  ```
- Scrollable container with message history
- Each message shows:
  - English text (optional toggle)
  - Japanese text with furigana (optional reading marks)
  - Grammar breakdown with chunks

**Welcome Screen** (lines 53-64):
```javascript
{messages.length === 0 && (
  <div className="h-full w-full grid place-content-center text-center">
    <h2 className="text-8xl font-bold text-white/90 italic">
      Wawa Sensei
      <br />
      Japanese Language School
    </h2>
    <h2 className="text-8xl font-bold font-jp text-red-600/90 italic">
      ワワ先生日本語学校
    </h2>
  </div>
)}
```

**For Math Adaptation - MathBlackboard.jsx**:

**Welcome State**:
```jsx
{!currentProblem && (
  <div className="h-full grid place-content-center text-center">
    <h2 className="text-8xl font-bold text-white/90">
      ¡Aprendamos Matemáticas!
    </h2>
    <p className="text-5xl text-blue-300 mt-4">
      Resuelve problemas y mejora tus habilidades
    </p>
  </div>
)}
```

**Problem Display State**:
```jsx
{currentProblem && (
  <div className="p-8">
    {/* Problem */}
    <div className="text-7xl font-bold text-white mb-8 text-center">
      {currentProblem.question}
    </div>

    {/* If INCORRECT */}
    {!isCorrect && (
      <>
        {/* Student Answer */}
        <div className="mb-6 p-6 bg-red-500/20 rounded-xl">
          <div className="text-3xl text-red-300 mb-2">Tu respuesta:</div>
          <div className="text-6xl font-bold text-red-400">{studentAnswer}</div>
        </div>

        {/* Correct Answer */}
        <div className="mb-6 p-6 bg-green-500/20 rounded-xl">
          <div className="text-3xl text-green-300 mb-2">Respuesta correcta:</div>
          <div className="text-6xl font-bold text-green-400">{correctAnswer}</div>
        </div>

        {/* Step-by-step solution */}
        {explanation.steps && (
          <div className="p-6 bg-blue-500/20 rounded-xl">
            <div className="text-4xl font-bold text-blue-300 mb-4">Solución:</div>
            {explanation.steps.map((step, i) => (
              <div key={i} className="text-3xl text-white mb-3">
                {i + 1}. {step}
              </div>
            ))}
          </div>
        )}
      </>
    )}

    {/* If CORRECT */}
    {isCorrect && (
      <div className="text-9xl font-bold text-green-400 text-center animate-bounce">
        ¡CORRECTO! 🎉
      </div>
    )}
  </div>
)}
```

**Size Matching**:
- Measure blackboard in GLB model
- Set `w-[XXXpx] h-[YYYpx]` to match exactly
- Use `transform` prop on Html so it scales with camera

---

## 8. API ARCHITECTURE

### Two Separate Endpoints

#### 8.1 AI Response Generation: `/api/ai/route.js`

**Request**:
```
GET /api/ai?question=How to say hello?&speech=formal
```

**Process**:
1. Construct ChatGPT prompt based on speech type (formal/casual)
2. Include examples of response format
3. Request JSON response
4. Parse and return

**Response**:
```json
{
  "english": "Do you live in Japan?",
  "japanese": [
    { "word": "日本", "reading": "にほん" },
    { "word": "に" },
    { "word": "住んで", "reading": "すんで" },
    { "word": "います" },
    { "word": "か" },
    { "word": "?" }
  ],
  "grammarBreakdown": [...]
}
```

#### 8.2 TTS + Visemes: `/api/tts/route.js`

**Request**:
```
GET /api/tts?teacher=Nanami&text=日本 に 住んで います か ?
```

**Process**:
1. Configure Azure Speech SDK
2. Select voice: `ja-JP-${teacher}Neural`
3. Attach viseme listener
4. Generate speech audio
5. Return audio stream with visemes in headers

**Response**:
- **Body**: Audio file (MP3 stream)
- **Headers**:
  ```
  Content-Type: audio/mpeg
  Visemes: [[0, 5], [120, 12], [240, 3], ...]
  ```

**Viseme Format**:
```javascript
[[timestamp_ms, visemeId], ...]
// Example: [[0, 0], [100, 5], [220, 12], ...]
```

### For Math Adaptation: Single Unified Endpoint

**New Route**: `/api/teacher/explain/route.ts`

**Request**:
```typescript
POST /api/teacher/explain
Body: {
  problem: "¿Cuánto es 12 + 8?",
  studentAnswer: "19",
  correctAnswer: "20",
  isCorrect: false
}
```

**Process**:
1. **Generate Explanation** (ChatGPT):
   ```typescript
   const prompt = isCorrect
     ? `Celebra este logro: ${problem}. Respuesta: ${studentAnswer}. Máximo 50 palabras.`
     : `Explica paso a paso: ${problem}. Respuesta incorrecta: ${studentAnswer}. Correcta: ${correctAnswer}. Para niños 9-11 años. Máximo 100 palabras.`;

   const completion = await openai.chat.completions.create({
     model: 'gpt-4o-mini',
     messages: [
       { role: 'system', content: 'Eres una profesora de matemáticas...' },
       { role: 'user', content: prompt }
     ],
     response_format: { type: 'json_object' }
   });

   const { text, steps } = JSON.parse(completion.choices[0].message.content);
   ```

2. **Generate Audio** (OpenAI TTS):
   ```typescript
   const mp3 = await openai.audio.speech.create({
     model: 'tts-1',
     voice: 'nova',  // Or 'alloy', 'echo', 'fable', 'onyx', 'shimmer'
     input: text,
     response_format: 'mp3',
     speed: 0.9
   });

   const audioBuffer = Buffer.from(await mp3.arrayBuffer());
   ```

3. **Generate Lip-Sync** (Rhubarb):
   ```typescript
   import { generateLipSync } from '@/lib/speech/lip-sync';
   const lipsyncData = await generateLipSync(audioBuffer);
   ```

4. **Determine Animation & Expression**:
   ```typescript
   const animation = isCorrect ? 'Celebrating' : 'Explaining';
   const expression = isCorrect ? 'celebrating' : 'encouraging';
   ```

**Response**:
```json
{
  "text": "¡Excelente trabajo! 12 + 8 es 20. ¡Lo hiciste perfecto!",
  "audio": "base64_encoded_audio...",
  "lipsync": {
    "mouthCues": [
      { "start": 0.0, "end": 0.05, "value": "X" },
      { "start": 0.05, "end": 0.15, "value": "E" },
      ...
    ]
  },
  "expression": "celebrating",
  "animation": "Celebrating"
}
```

---

## 9. AUDIO PLAYBACK SYNCHRONIZATION

### Message Playback Flow

**useAITeacher.js `playMessage` function** (lines 73-113):

```javascript
playMessage: async (message) => {
  set(() => ({ currentMessage: message }));

  // If audio not yet generated
  if (!message.audioPlayer) {
    set(() => ({ loading: true }));

    // 1. Fetch TTS audio
    const audioRes = await fetch(
      `/api/tts?teacher=${get().teacher}&text=${message.answer.japanese.map(w => w.word).join(" ")}`
    );
    const audio = await audioRes.blob();
    const visemes = JSON.parse(await audioRes.headers.get("visemes"));

    // 2. Create audio player
    const audioUrl = URL.createObjectURL(audio);
    const audioPlayer = new Audio(audioUrl);

    // 3. Attach visemes and audio to message
    message.visemes = visemes;
    message.audioPlayer = audioPlayer;

    // 4. Set end handler
    message.audioPlayer.onended = () => {
      set(() => ({ currentMessage: null }));  // Triggers camera return
    };

    set(() => ({
      loading: false,
      messages: get().messages.map((m) => (m.id === message.id ? message : m))
    }));
  }

  // 5. Play audio
  message.audioPlayer.currentTime = 0;
  message.audioPlayer.play();
},
```

**Synchronization Points**:
1. `currentMessage` set → Camera zooms to blackboard
2. Audio plays → Teacher.jsx reads visemes in `useFrame`
3. Visemes applied → Morph targets update (lip movement)
4. Audio ends → `currentMessage = null` → Camera returns to default

**For Math Adaptation - teacherStore**:

```typescript
playExplanation: async (message: TeacherMessage) => {
  set({ currentMessage: message });

  if (!message.audioPlayer) {
    set({ loading: true });

    // Audio already generated in API response (base64)
    const audioBlob = base64ToBlob(message.audio, 'audio/mpeg');
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioPlayer = new Audio(audioUrl);

    message.audioPlayer = audioPlayer;
    message.audioPlayer.onended = () => {
      set({ currentMessage: null });
      // Optionally: trigger "next problem" button
    };

    set({ loading: false });
  }

  message.audioPlayer.currentTime = 0;
  message.audioPlayer.play();
}
```

---

## 10. KEY PATTERNS TO REPLICATE

### 10.1 Scene Setup Pattern

✅ **Use Float wrapper for subtle animation**
```jsx
<Float speed={0.5} floatIntensity={0.2} rotationIntensity={0.1}>
  <Classroom />
  <Teacher />
  <Blackboard />
</Float>
```

✅ **Separate teacher and animations models**
```jsx
const { scene } = useGLTF(`/models/Teacher_${teacher}.glb`);
const { animations } = useGLTF(`/models/animations_${teacher}.glb`);
```

✅ **Position UI in 3D space with Html**
```jsx
<Html transform {...position} distanceFactor={1}>
  <div className="w-[1288px] h-[676px]">
    Content rendered on 3D surface
  </div>
</Html>
```

### 10.2 Animation State Pattern

✅ **Reactive animation switching**
```javascript
useEffect(() => {
  if (loading) setAnimation("Thinking");
  else if (speaking) setAnimation("Talking");
  else setAnimation("Idle");
}, [loading, speaking]);
```

✅ **Smooth crossfade**
```javascript
useEffect(() => {
  actions[animation]?.reset().fadeIn(0.5).play();
  return () => actions[animation]?.fadeOut(0.5);
}, [animation]);
```

### 10.3 Lip-Sync Pattern

✅ **Viseme application in useFrame**
```javascript
useFrame(() => {
  // Reset all visemes
  for (let i = 0; i <= 21; i++) {
    lerpMorphTarget(i, 0, 0.1);
  }

  // Apply current viseme
  if (currentMessage?.visemes && audioPlayer) {
    const currentTime = audioPlayer.currentTime * 1000;
    for (let i = visemes.length - 1; i >= 0; i--) {
      if (currentTime >= visemes[i][0]) {
        lerpMorphTarget(visemes[i][1], 1, 0.2);
        break;
      }
    }
  }
});
```

### 10.4 Camera Control Pattern

✅ **State-driven camera position**
```javascript
useEffect(() => {
  if (loading) {
    controls.current?.setPosition(...POSITIONS.loading, true);
    controls.current?.zoomTo(ZOOMS.loading, true);
  } else if (speaking) {
    controls.current?.setPosition(...POSITIONS.speaking, true);
    controls.current?.zoomTo(ZOOMS.speaking, true);
  }
}, [loading, speaking]);
```

### 10.5 Audio Playback Pattern

✅ **HTMLAudioElement with URL.createObjectURL**
```javascript
const audioBlob = await fetch('/api/tts').then(r => r.blob());
const audioUrl = URL.createObjectURL(audioBlob);
const audioPlayer = new Audio(audioUrl);
audioPlayer.onended = () => { /* cleanup */ };
audioPlayer.play();
```

---

## 11. THINGS TO REMOVE / NOT IMPLEMENT

### From Reference Project ❌

❌ **Language Selection** (formal/casual speech)
- Remove `speech` state
- Remove speech toggle UI
- Remove `setSpeech` action

❌ **Furigana Toggle** (Japanese reading marks)
- Remove `furigana` state
- Remove furigana rendering logic
- Remove `setFurigana` action

❌ **English Toggle**
- Remove `english` state
- Remove English text display
- Remove `setEnglish` action

❌ **Grammar Breakdown UI** (Japanese-specific)
- Remove `grammarBreakdown` structure
- Remove chunk rendering
- Keep simple explanation text instead

❌ **Azure Speech SDK**
- Remove `microsoft-cognitiveservices-speech-sdk`
- Replace with OpenAI TTS

❌ **Question-Based Interaction**
- Remove `askAI(question)` flow
- Replace with `submitAnswer(answer)` → `requestExplanation()`

❌ **Leva Debug Controls**
- Remove `<Leva hidden />` component
- Remove leva package

---

## 12. ADAPTATIONS NEEDED FOR MATH

### 12.1 Replace Question Flow with Answer Flow

**Japanese Learning**:
```
Student asks: "How to say hello?"
  ↓
Teacher responds: "こんにちは (konnichiwa)"
```

**Math Learning**:
```
System shows: "¿Cuánto es 12 + 8?"
  ↓
Student answers: "20"
  ↓
System checks: CORRECT
  ↓
Teacher celebrates: "¡Correcto! 12 + 8 = 20. ¡Excelente!"
```

### 12.2 Blackboard Content Structure

**Japanese**:
- English sentence
- Japanese translation with furigana
- Grammar breakdown with chunks

**Math**:
- Problem statement
- Student answer (if incorrect)
- Correct answer
- Step-by-step solution (if incorrect)
- Celebration message (if correct)

### 12.3 Animation Triggers

**Japanese**:
- `loading` → "Thinking" animation
- `currentMessage` → "Talking" animation
- No message → "Idle" animation

**Math**:
- Checking answer → "Thinking" animation
- Correct answer → "Celebrating" animation (once, then Idle)
- Incorrect answer → "Explaining" animation (loop)
- No interaction → "Idle" animation

### 12.4 State Structure Changes

**Remove**:
```javascript
{
  furigana: boolean,
  english: boolean,
  speech: "formal" | "casual",
  setSpeech: () => void,
  setFurigana: () => void,
  setEnglish: () => void,
}
```

**Add**:
```javascript
{
  currentProblem: MathActivity | null,
  studentAnswer: string | null,
  isCorrect: boolean | null,
  explanations: Explanation[],  // History
  setProblem: (problem) => void,
  submitAnswer: (answer) => void,
  requestExplanation: (problem, answer, isCorrect) => Promise<void>,
}
```

### 12.5 TTS Voice Selection

**Japanese**: `ja-JP-NanamiNeural` (Azure)

**Math (Spanish)**:
- OpenAI TTS voices:
  - `nova` - Warm, conversational (RECOMMENDED for female teacher)
  - `alloy` - Neutral, balanced
  - `echo` - Clear, male
  - `fable` - Expressive, female
  - `onyx` - Deep, male
  - `shimmer` - Soft, female

**Speed Setting**: `0.9` (slightly slower for kids)

---

## 13. DEPENDENCIES COMPARISON

### Reference Project Dependencies

```json
{
  "@react-three/drei": "^9.99.3",
  "@react-three/fiber": "^8.15.16",
  "leva": "^0.9.35",  // ❌ Remove (debug tool)
  "microsoft-cognitiveservices-speech-sdk": "^1.35.0",  // ❌ Replace with OpenAI
  "next": "14.1.0",
  "openai": "^4.28.0",
  "react": "^18",
  "react-dom": "^18",
  "three": "^0.161.0",
  "zustand": "^4.5.1"
}
```

### Learniverse (Already Installed)

✅ Already have:
- `@react-three/drei`
- `@react-three/fiber`
- `next`
- `openai`
- `react`, `react-dom`
- `three`
- `zustand`

❌ To install:
- None! All core dependencies are already present

✅ We have additional tools they don't:
- Rhubarb Lip-Sync (already in `lib/speech/rhubarb/`)
- NextAuth (authentication)
- Vercel Postgres (database)
- Existing math activity system

---

## 14. IMPLEMENTATION STRATEGY RECOMMENDATIONS

### Phase 1: Minimal Viable 3D Teacher (2-3 days)

**Goal**: Get basic 3D teacher working with ONE animation

1. Create `MathExperience.tsx` with:
   - Classroom model
   - Single teacher (teacher1)
   - Basic camera setup
   - No blackboard yet

2. Create `MathTeacher.tsx` with:
   - Load GLB model
   - Load ONE animation (Idle)
   - No lip-sync yet
   - No morph targets yet

3. Test rendering and performance

### Phase 2: Animation System (2 days)

1. Add all animations to teacher model:
   - Idle, Thinking, Explaining, Celebrating

2. Implement animation switching based on state:
   ```javascript
   useEffect(() => {
     if (checking) setAnimation("Thinking");
     else if (celebrating) setAnimation("Celebrating");
     else if (explaining) setAnimation("Explaining");
     else setAnimation("Idle");
   }, [checking, celebrating, explaining]);
   ```

3. Test smooth transitions

### Phase 3: Audio + Lip-Sync (2-3 days)

1. Create `/api/teacher/explain` endpoint:
   - ChatGPT explanation generation
   - OpenAI TTS audio generation
   - Return JSON (no lip-sync yet)

2. Implement audio playback in teacherStore

3. Integrate Rhubarb lip-sync:
   - Generate visemes from audio
   - Return in API response

4. Implement viseme application in MathTeacher.tsx

### Phase 4: Blackboard (2 days)

1. Create `MathBlackboard.tsx` component
2. Position with `<Html>` in 3D space
3. Style to match blackboard dimensions
4. Implement content states:
   - Welcome
   - Problem display
   - Correct celebration
   - Incorrect explanation

### Phase 5: Camera Animations (1 day)

1. Define camera positions:
   - Default (wide view)
   - Thinking (slight zoom)
   - Explaining (zoom to blackboard)
   - Celebrating (zoom out to see full teacher)

2. Implement `CameraController` component

3. Connect to teacherStore state

### Phase 6: Integration & Polish (2-3 days)

1. Replace `app/game/page.tsx` completely
2. Wire up teacherStore ↔ gameStore communication
3. Test full flow: problem → answer → explanation
4. Add teacher/classroom switching UI
5. Optimize performance
6. Add error handling

**Total Estimated Time**: 11-14 days

---

## 15. TESTING CHECKLIST

### Rendering Tests
- [ ] 3D scene loads without errors
- [ ] Teacher model visible and textured correctly
- [ ] Classroom model loads for both types
- [ ] Camera controls work (rotate, zoom)
- [ ] No console errors in browser

### Animation Tests
- [ ] Idle animation plays by default
- [ ] Thinking animation plays when loading
- [ ] Explaining animation plays during explanation
- [ ] Celebrating animation plays for correct answer
- [ ] Smooth transitions between animations (0.5s fade)

### Audio Tests
- [ ] Audio plays when explanation starts
- [ ] Audio quality is clear
- [ ] Volume is appropriate
- [ ] Audio stops when explanation ends
- [ ] No memory leaks from audio blobs

### Lip-Sync Tests
- [ ] Mouth moves in sync with audio
- [ ] Visemes transition smoothly
- [ ] No jittery mouth movements
- [ ] Lip-sync resets when audio ends

### Blackboard Tests
- [ ] Content is readable (font size, contrast)
- [ ] Math notation renders correctly
- [ ] Problem displays properly
- [ ] Solution steps are clear
- [ ] Celebration message animates

### Camera Tests
- [ ] Zooms to blackboard when explaining
- [ ] Returns to default when done
- [ ] Smooth camera transitions
- [ ] User can still manually control camera
- [ ] No camera clipping issues

### Integration Tests
- [ ] Problem submission triggers explanation
- [ ] Correct answers → celebration flow
- [ ] Incorrect answers → explanation flow
- [ ] "Next problem" resets teacher state
- [ ] Teacher/classroom switching works
- [ ] Session stats update correctly

### Performance Tests
- [ ] 60fps maintained on desktop
- [ ] 30fps minimum on low-end devices
- [ ] Memory usage stable (no leaks)
- [ ] Audio/animation in sync even at 30fps
- [ ] No stuttering during animations

---

## 16. CRITICAL DIFFERENCES SUMMARY

| Aspect | Reference Project | Math Adaptation |
|--------|------------------|----------------|
| **User Input** | Free-form question | Numeric answer to problem |
| **AI Task** | Translate to Japanese | Explain math solution |
| **TTS Provider** | Azure Speech SDK | OpenAI TTS |
| **Lip-Sync** | Azure visemes (ID 0-21) | Rhubarb visemes (A-H, X) |
| **Language** | Japanese + English | Spanish only |
| **Blackboard Content** | Translation + grammar | Problem + solution steps |
| **Animations** | Idle, Thinking, Talking×2 | Idle, Thinking, Explaining, Celebrating |
| **Camera States** | Default, Loading, Speaking | Default, Thinking, Explaining, Celebrating |
| **Interaction Flow** | Ask → Respond | Answer → Check → Explain |
| **UI Toggles** | Furigana, English, Speech | Teacher, Classroom only |

---

## 17. QUESTIONS FOR CLARIFICATION

Before starting implementation, confirm:

### 3D Assets
1. ✅ **Teacher models location**: `C:\Users\yamil\Documents\learniverse\public` - Confirmed
2. ❓ **Do we have TWO teacher models** like reference (Nanami/Naoki)?
   - If yes: What are file names?
   - If no: Should I create placeholder for teacher2?
3. ❓ **Animation file names**: Do animations come in separate GLB or embedded in teacher model?
4. ❓ **Classroom models**: Do we have classroom GLB files? If not, use reference project classrooms?

### Animation Requirements
5. ❓ **Animation names**: What are exact names in GLB files? (`Idle`, `Talking`, `Thinking`, etc.)
6. ❓ **Celebrating animation**: Do we have one, or should I use `Talking` with happy expression?
7. ❓ **Explaining animation**: Specific gestures, or just `Talking`?

### Rhubarb Integration
8. ✅ **Rhubarb already integrated?**: Check `lib/speech/rhubarb/` - Confirmed exists
9. ❓ **Viseme mapping**: Do teacher models have morph targets matching Rhubarb visemes (A-H, X)?
   - If not: Need to create mapping from Rhubarb → available morph targets

### Voice Settings
10. ❓ **Preferred OpenAI voice**: Which of (nova, alloy, echo, fable, onyx, shimmer)?
    - Suggestion: `nova` for female teacher1, `echo` for male teacher2
11. ❓ **Speech speed**: 0.9 good for kids, or slower (0.8)?

### Integration
12. ❓ **Full replacement or toggle**: Completely replace `/game` page, or add as optional mode?
    - Your spec says "REPLACE COMPLETELY" - Confirm this is final decision
13. ❓ **Session stats**: Keep current session stats (correctas, incorrectas, puntos) on screen?
14. ❓ **Back to dashboard**: Keep existing "Volver al Dashboard" button?

### Scope
15. ❓ **Mobile support**: Reference project is desktop-only. Should math teacher work on mobile?
    - If yes: Need responsive layout for controls
16. ❓ **Teacher selection**: Implement mid-game, or only at start?
17. ❓ **Classroom selection**: Same as teacher selection?

---

## 18. NEXT STEPS

**I RECOMMEND**:

1. **Answer clarification questions** (see Section 17)
2. **Verify 3D assets** are in place and compatible
3. **Create detailed implementation plan** with file-by-file breakdown
4. **Start with Phase 1** (Minimal Viable 3D Teacher) to validate approach
5. **Iterative development** with testing at each phase

**DO NOT START CODING UNTIL**:
- All questions answered
- 3D assets verified and tested
- Implementation plan approved

---

**Analysis Complete** ✅

Ready to proceed to implementation planning phase once clarifications are provided.
