# 3D Interactive Math Teacher - FINAL EXECUTION PLAN

**Project:** Learniverse
**Feature:** 3D Interactive Math Teacher with Voice I/O
**Date:** 2025-01-15
**Status:** ✅ READY FOR IMPLEMENTATION
**OpenAI API:** ✅ TTS & Whisper Verified

---

## Executive Summary

This is the **FINAL execution plan** for integrating a 3D interactive math teacher into Learniverse. Based on your decisions, this is a **full-featured implementation** including:

- ✅ Voice output (OpenAI TTS with lip-sync)
- ✅ Voice input (OpenAI Whisper STT)
- ✅ Full-screen overlay mode
- ✅ Animated visual examples
- ✅ 3D whiteboard for teacher explanations
- ✅ Teacher selection per class
- ✅ Full analytics tracking
- ✅ All 3 phases fully integrated

**Timeline:** 12-14 work days (3-3.5 weeks full-time)
**Complexity:** Advanced (but achievable)

---

## User Decisions Summary

| Question | Decision | Impact |
|----------|----------|--------|
| Q1: Teacher Presence | **A - Always visible (toggle off)** | Teacher is default presence |
| Q2: Teacher Selection | **A - Yes, students choose** | Need teacher selection UI |
| Q3: Voice Input | **B - Both I/O in MVP** | Complex, needs Whisper integration |
| Q4: Display Location | **C - Full-screen overlay** | Immersive, needs special UI |
| Q5: Route Structure | **A - Modify /game** | Single route, feature-flagged |
| Q6: State Persistence | **C - Database** | Full tracking for analytics |
| Q7: Audio Caching | **A - Database cache** | Cost optimization + analytics |
| Q8: Mobile | **A - Hide on mobile** | Desktop-first, mobile Phase 2 |
| Q9: Explanations | **C - Verbal + animated** | Complex visualizations needed |
| Q10: Whiteboard | **A - Yes, 3D whiteboard** | Advanced 3D component |
| Q11: Voice Selection | **C - Teacher chooses per class** | Need admin UI for teachers |
| Q12: Language Style | **C - Mix based on context** | Contextual prompt engineering |
| Q13: Hint System | **A - Keep text + voice** | Hybrid approach, safe fallback |
| Q14: Failure Handling | **B - Retry 3x, fallback** | Robust error recovery |
| Q15: Analytics | **A - Yes, full tracking** | Database tables required |

---

## Revised Architecture

### Full-Screen Overlay Mode

```
┌──────────────────────────────────────────────────────┐
│ Game Page (/app/game/page.tsx)                      │
│                                                       │
│ [Game overlay hidden when teacher is active]         │
│                                                       │
│ ┌──────────────────────────────────────────────────┐ │
│ │ TEACHER FULL-SCREEN MODE (z-index: 100)         │ │
│ │                                                  │ │
│ │  ┌────────────────────────────────────┐         │ │
│ │  │    3D Teacher Scene                │         │ │
│ │  │    ┌─────────────────────┐         │         │ │
│ │  │    │ Teacher Avatar      │         │         │ │
│ │  │    │ (Animated, Lip-sync)│         │         │ │
│ │  │    └─────────────────────┘         │         │ │
│ │  │                                     │         │ │
│ │  │    ┌─────────────────────┐         │         │ │
│ │  │    │ 3D Whiteboard       │         │         │ │
│ │  │    │ (Math Visualizations)│        │         │ │
│ │  │    └─────────────────────┘         │         │ │
│ │  │                                     │         │ │
│ │  │    Classroom Environment            │         │ │
│ │  └────────────────────────────────────┘         │ │
│ │                                                  │ │
│ │  Bottom UI:                                     │ │
│ │  ┌────────────────────────────────────┐         │ │
│ │  │ [Mic Button] [Question Display]    │         │ │
│ │  │ [Exit Overlay] [Settings]          │         │ │
│ │  └────────────────────────────────────┘         │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### State Flow with Voice I/O

```
STUDENT INTERACTION:

1. Student clicks "Hablar con Profesor" button
   ↓
2. Full-screen teacher overlay appears
   ↓
3. Teacher introduces current activity (TTS)
   ↓
4. Student can:
   - Speak question (Whisper STT)
   - OR type in chat
   ↓
5. OpenAI ChatGPT processes question
   ↓
6. Teacher responds with:
   - Voice (TTS + lip-sync)
   - Animation (contextual)
   - Whiteboard visualization (if needed)
   ↓
7. Student continues conversation or exits to game
```

---

## Phase Breakdown (All 3 Phases)

### Phase 1: Core Teacher with Voice I/O (Week 1-2, ~40 hours)

**Milestone:** Basic 3D teacher with bidirectional voice

**Features:**
1. ✅ 3D teacher model loads in full-screen overlay
2. ✅ Teacher speaks (OpenAI TTS + Rhubarb lip-sync)
3. ✅ Student voice input (Whisper STT)
4. ✅ Basic animations (Idle, Talking, Thinking)
5. ✅ ChatGPT conversation for math questions
6. ✅ Teacher toggle (enter/exit overlay)
7. ✅ Database tables for analytics
8. ✅ Audio caching in database

**Components to Create:**
- `components/3d/teacher/Teacher.tsx` - 3D avatar with animations
- `components/3d/teacher/TeacherScene.tsx` - Full-screen scene
- `components/3d/teacher/TeacherOverlay.tsx` - Full-screen UI
- `components/teacher/VoiceInput.tsx` - Microphone recording
- `lib/speech/tts.ts` - OpenAI TTS integration
- `lib/speech/stt.ts` - OpenAI Whisper integration
- `lib/speech/lip-sync.ts` - Rhubarb lip-sync
- `app/api/teacher-voice/speak/route.ts` - TTS endpoint
- `app/api/teacher-voice/listen/route.ts` - STT endpoint
- `app/api/teacher-voice/chat/route.ts` - ChatGPT endpoint

**Database:**
- Create `teacher_voice_interactions` table
- Create `teacher_voice_cache` table
- Migration script

**Deliverables:**
- Working voice I/O system
- Full-screen teacher overlay
- Basic conversation capability
- Analytics tracking

**Acceptance Criteria:**
- Teacher speaks when giving hints
- Student can ask questions via voice
- Lip-sync accurate
- Conversation flows naturally
- Performance >30fps

---

### Phase 2: Enhanced Animations & Whiteboard (Week 3, ~30 hours)

**Milestone:** Visual teaching with 3D whiteboard

**Features:**
1. ✅ Full animation catalog (8+ animations)
2. ✅ Facial expressions (Happy, Sad, Surprised, Thinking)
3. ✅ Contextual animations based on conversation
4. ✅ 3D whiteboard component
5. ✅ Math visualization on whiteboard
6. ✅ Animated step-by-step solutions
7. ✅ Teacher drawing on whiteboard while speaking
8. ✅ Classroom environment switching

**Components to Create:**
- `components/3d/teacher/Whiteboard.tsx` - 3D whiteboard
- `components/3d/teacher/MathVisualizer.tsx` - Math drawings
- `components/3d/teacher/Classroom.tsx` - Environment
- `lib/whiteboard/drawing.ts` - Whiteboard utilities
- `lib/whiteboard/math-animator.ts` - Animated math solutions

**Animations:**
- Download from Mixamo: Happy, Sad, Angry, Surprised, Thinking, Explaining, Pointing, Greeting

**Deliverables:**
- Full animation system
- Working 3D whiteboard
- Math problem visualization
- Classroom environments

**Acceptance Criteria:**
- All animations play smoothly
- Whiteboard displays math problems
- Teacher can draw while talking
- Environments switch correctly

---

### Phase 3: Advanced Features & Analytics (Week 4, ~25 hours)

**Milestone:** Production-ready with full analytics

**Features:**
1. ✅ Teacher selection UI (students choose teacher)
2. ✅ Voice selection UI (teachers choose voice per class)
3. ✅ Teacher personality settings (formal/casual mix)
4. ✅ Advanced caching (common phrases pre-generated)
5. ✅ Teacher analytics in dashboard
6. ✅ Voice interaction reports
7. ✅ Mobile optimization (lower quality or disable)
8. ✅ Performance optimization (<60fps guaranteed)

**Components to Create:**
- `app/teacher/settings/voice/page.tsx` - Voice config for teachers
- `components/teacher/VoiceSettings.tsx` - Voice selection UI
- `components/avatar/TeacherSelector.tsx` - Teacher selection
- `components/teacher/analytics/VoiceAnalytics.tsx` - Usage charts

**API Routes:**
- `app/api/teacher/voice-settings/route.ts` - Voice config CRUD
- `app/api/teacher/analytics/voice-usage/route.ts` - Analytics data

**Deliverables:**
- Teacher/voice selection working
- Analytics integrated in dashboard
- Mobile optimization complete
- Performance benchmarks met

**Acceptance Criteria:**
- Students can choose teacher model
- Teachers can set voice per class
- Analytics show in teacher dashboard
- Mobile performs acceptably (or is disabled)
- Desktop maintains 60fps

---

## Database Schema (Required)

### Table 1: teacher_voice_interactions

```sql
CREATE TABLE IF NOT EXISTS teacher_voice_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES math_activities(id) ON DELETE SET NULL,
  session_id VARCHAR(100), -- Track conversation sessions

  -- Interaction details
  interaction_type VARCHAR(50) NOT NULL, -- 'question', 'hint', 'explanation', 'encouragement'
  student_input_text TEXT, -- Transcribed or typed input
  student_input_audio_duration DECIMAL(5,2), -- If voice input was used
  teacher_response_text TEXT NOT NULL,
  teacher_audio_duration DECIMAL(5,2),

  -- Voice settings used
  voice_used VARCHAR(20) DEFAULT 'nova',
  tts_model VARCHAR(20) DEFAULT 'tts-1',
  language VARCHAR(5) DEFAULT 'es',

  -- Technical metadata
  tts_cached BOOLEAN DEFAULT false,
  lipsync_generated BOOLEAN DEFAULT true,
  response_time_ms INTEGER, -- Time to generate response

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_student_interactions (student_id, created_at DESC),
  INDEX idx_session_interactions (session_id, created_at),
  INDEX idx_activity_interactions (activity_id)
);
```

### Table 2: teacher_voice_cache

```sql
CREATE TABLE IF NOT EXISTS teacher_voice_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cache key (hash of normalized text)
  text_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA256 hash
  text_content TEXT NOT NULL,
  text_normalized TEXT NOT NULL, -- Lowercase, trimmed version

  -- Voice settings
  voice VARCHAR(20) NOT NULL,
  tts_model VARCHAR(20) NOT NULL,
  language VARCHAR(5) DEFAULT 'es',

  -- Generated content
  audio_base64 TEXT NOT NULL,
  audio_duration_seconds DECIMAL(5,2),
  lipsync_json JSONB NOT NULL,

  -- Usage tracking
  times_used INTEGER DEFAULT 1,
  last_used_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),

  -- Expiration (optional - for cleanup)
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),

  INDEX idx_text_hash (text_hash),
  INDEX idx_last_used (last_used_at DESC),
  INDEX idx_expires (expires_at)
);
```

### Table 3: class_voice_settings

```sql
CREATE TABLE IF NOT EXISTS class_voice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,

  -- Voice configuration
  default_voice VARCHAR(20) DEFAULT 'nova',
  default_teacher_model VARCHAR(50) DEFAULT 'teacher1', -- 'teacher1' or 'teacher2'
  language_formality VARCHAR(20) DEFAULT 'mixed', -- 'formal', 'casual', 'mixed'

  -- Features enabled
  voice_input_enabled BOOLEAN DEFAULT true,
  whiteboard_enabled BOOLEAN DEFAULT true,
  animations_enabled BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(class_id),
  INDEX idx_teacher_settings (teacher_id)
);
```

### Migration Script

**File:** `scripts/init-teacher-voice-db.ts`

```typescript
import { sql } from '@vercel/postgres'

async function initTeacherVoiceDatabase() {
  try {
    console.log('🗄️  Initializing Teacher Voice Database...')

    // Table 1: Interactions
    await sql`
      CREATE TABLE IF NOT EXISTS teacher_voice_interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        activity_id UUID REFERENCES math_activities(id) ON DELETE SET NULL,
        session_id VARCHAR(100),
        interaction_type VARCHAR(50) NOT NULL,
        student_input_text TEXT,
        student_input_audio_duration DECIMAL(5,2),
        teacher_response_text TEXT NOT NULL,
        teacher_audio_duration DECIMAL(5,2),
        voice_used VARCHAR(20) DEFAULT 'nova',
        tts_model VARCHAR(20) DEFAULT 'tts-1',
        language VARCHAR(5) DEFAULT 'es',
        tts_cached BOOLEAN DEFAULT false,
        lipsync_generated BOOLEAN DEFAULT true,
        response_time_ms INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✅ teacher_voice_interactions table created')

    await sql`CREATE INDEX IF NOT EXISTS idx_student_interactions
              ON teacher_voice_interactions(student_id, created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_session_interactions
              ON teacher_voice_interactions(session_id, created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_interactions
              ON teacher_voice_interactions(activity_id)`
    console.log('✅ Indexes created for interactions')

    // Table 2: Cache
    await sql`
      CREATE TABLE IF NOT EXISTS teacher_voice_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        text_hash VARCHAR(64) UNIQUE NOT NULL,
        text_content TEXT NOT NULL,
        text_normalized TEXT NOT NULL,
        voice VARCHAR(20) NOT NULL,
        tts_model VARCHAR(20) NOT NULL,
        language VARCHAR(5) DEFAULT 'es',
        audio_base64 TEXT NOT NULL,
        audio_duration_seconds DECIMAL(5,2),
        lipsync_json JSONB NOT NULL,
        times_used INTEGER DEFAULT 1,
        last_used_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
      )
    `
    console.log('✅ teacher_voice_cache table created')

    await sql`CREATE INDEX IF NOT EXISTS idx_text_hash
              ON teacher_voice_cache(text_hash)`
    await sql`CREATE INDEX IF NOT EXISTS idx_last_used
              ON teacher_voice_cache(last_used_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_expires
              ON teacher_voice_cache(expires_at)`
    console.log('✅ Indexes created for cache')

    // Table 3: Class Settings
    await sql`
      CREATE TABLE IF NOT EXISTS class_voice_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
        default_voice VARCHAR(20) DEFAULT 'nova',
        default_teacher_model VARCHAR(50) DEFAULT 'teacher1',
        language_formality VARCHAR(20) DEFAULT 'mixed',
        voice_input_enabled BOOLEAN DEFAULT true,
        whiteboard_enabled BOOLEAN DEFAULT true,
        animations_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(class_id)
      )
    `
    console.log('✅ class_voice_settings table created')

    await sql`CREATE INDEX IF NOT EXISTS idx_teacher_settings
              ON class_voice_settings(teacher_id)`
    console.log('✅ Indexes created for settings')

    console.log('\n🎉 Teacher Voice Database initialized successfully!')
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  }
}

initTeacherVoiceDatabase()
```

---

## API Endpoints (Complete Specification)

### 1. POST /api/teacher-voice/speak

**Purpose:** Generate TTS with lip-sync

**Request:**
```typescript
{
  text: string,              // Max 1000 chars
  voice?: string,            // Default: from class settings or 'nova'
  model?: string,            // 'tts-1' or 'tts-1-hd', default: 'tts-1'
  animation?: string,        // Suggested animation
  expression?: string,       // Suggested expression
  useCache?: boolean         // Default: true
}
```

**Response:**
```typescript
{
  success: true,
  audio: string,             // Base64 MP3
  lipsync: LipsyncData,
  animation: string,
  expression: string,
  duration: number,
  cached: boolean,
  cacheHit: boolean          // If response was from cache
}
```

**Implementation:**
1. Check authentication (student role)
2. Get class voice settings
3. Check database cache (text_hash)
4. If not cached:
   - Call OpenAI TTS
   - Generate Rhubarb lip-sync
   - Store in cache
   - Track interaction
5. Return audio + metadata

---

### 2. POST /api/teacher-voice/listen

**Purpose:** Transcribe student voice input

**Request:**
```typescript
{
  audio: string,             // Base64 audio (webm/mp3/wav)
  language?: string,         // Default: 'es'
  sessionId?: string         // Track conversation session
}
```

**Response:**
```typescript
{
  success: true,
  transcription: string,
  duration: number,
  confidence?: number        // If available from Whisper
}
```

**Implementation:**
1. Check authentication
2. Decode base64 audio
3. Save to temp file
4. Call OpenAI Whisper
5. Track interaction (if sessionId provided)
6. Clean up temp file
7. Return transcription

---

### 3. POST /api/teacher-voice/chat

**Purpose:** Complete voice conversation (STT + ChatGPT + TTS)

**Request:**
```typescript
{
  audio?: string,            // Voice input (base64)
  text?: string,             // Text input (alternative)
  sessionId?: string,        // Conversation session
  activityId?: string,       // Current activity context
  conversationHistory?: Array<{
    role: 'student' | 'teacher',
    content: string
  }>
}
```

**Response:**
```typescript
{
  success: true,
  studentInput: string,      // Transcribed or provided text
  teacherResponse: {
    text: string,
    audio: string,           // Base64 MP3
    lipsync: LipsyncData,
    animation: string,
    expression: string,
    duration: number
  },
  sessionId: string,
  conversationContext: any   // For frontend to track
}
```

**Implementation:**
1. If audio: transcribe with Whisper
2. Add to conversation history
3. Call ChatGPT with math teacher prompt
4. Generate TTS response
5. Generate lip-sync
6. Track full interaction
7. Return complete response

---

### 4. GET /api/teacher/analytics/voice-usage

**Purpose:** Voice interaction analytics for teacher dashboard

**Query Params:**
- `classId?: string`
- `studentId?: string`
- `startDate?: string`
- `endDate?: string`

**Response:**
```typescript
{
  success: true,
  data: {
    totalInteractions: number,
    totalDuration: number,    // Total audio duration
    avgResponseTime: number,
    cacheHitRate: number,     // Percentage
    interactionsByType: {
      question: number,
      hint: number,
      explanation: number,
      encouragement: number
    },
    interactionsByDay: Array<{
      date: string,
      count: number
    }>,
    topStudents: Array<{
      studentId: string,
      studentName: string,
      interactions: number
    }>
  }
}
```

---

### 5. GET/POST/PUT /api/teacher/voice-settings

**Purpose:** Manage voice settings per class

**GET** - Get settings:
```typescript
Response: {
  success: true,
  settings: {
    classId: string,
    defaultVoice: string,
    defaultTeacherModel: string,
    languageFormality: string,
    voiceInputEnabled: boolean,
    whiteboardEnabled: boolean,
    animationsEnabled: boolean
  }
}
```

**POST** - Create settings:
```typescript
Request: {
  classId: string,
  defaultVoice: string,
  defaultTeacherModel: string,
  languageFormality: string,
  voiceInputEnabled: boolean,
  whiteboardEnabled: boolean,
  animationsEnabled: boolean
}
```

**PUT** - Update settings:
```typescript
Request: { ...same as POST }
```

---

## Revised Timeline (All 3 Phases)

### Week 1 (40 hours) - Phase 1 Foundation

| Day | Hours | Tasks |
|-----|-------|-------|
| Mon | 8h | Database setup, TTS/STT endpoints, cache system |
| Tue | 8h | 3D Teacher component, basic animations, lip-sync integration |
| Wed | 8h | Full-screen overlay UI, voice input component |
| Thu | 8h | ChatGPT conversation endpoint, session management |
| Fri | 8h | Testing, bug fixes, performance optimization |

**Deliverable:** Working bidirectional voice system

---

### Week 2 (30 hours) - Phase 2 Enhancements

| Day | Hours | Tasks |
|-----|-------|-------|
| Mon | 8h | Full animation catalog (download + integrate 8 Mixamo anims) |
| Tue | 8h | 3D Whiteboard component, drawing system |
| Wed | 7h | Math visualization on whiteboard, animated solutions |
| Thu | 7h | Classroom environments, contextual animations |

**Deliverable:** Visual teaching with whiteboard

---

### Week 3 (25 hours) - Phase 3 Polish & Analytics

| Day | Hours | Tasks |
|-----|-------|-------|
| Mon | 8h | Teacher/voice selection UI, class settings API |
| Tue | 8h | Analytics integration, teacher dashboard charts |
| Wed | 5h | Mobile optimization, performance tuning |
| Thu | 4h | Final testing, documentation, deployment prep |

**Deliverable:** Production-ready feature

---

**Total:** 95 hours (~12 work days / 3 weeks full-time / 6 weeks part-time)

---

## Assets Checklist

### 3D Models (You Have These)

- [ ] teacher1.glb - First teacher model
- [ ] teacher2.glb - Second teacher model
- [ ] classroom1.glb - Modern classroom environment
- [ ] classroom2.glb - Traditional classroom environment

**Location:** Place in `public/models/teachers/` and `public/models/environments/`

---

### Animations (Free from Mixamo)

Download from https://www.mixamo.com (free, requires Adobe account):

**Required Animations:**
- [ ] Idle.fbx - Resting state
- [ ] TalkingOne.fbx - Talking variation 1
- [ ] TalkingTwo.fbx - Talking variation 2
- [ ] TalkingThree.fbx - Talking variation 3
- [ ] Happy.fbx - Celebrating
- [ ] Sad.fbx - Sympathetic
- [ ] Thinking.fbx - Processing
- [ ] Surprised.fbx - Amazed reaction
- [ ] Explaining.fbx - Teaching gesture
- [ ] Pointing.fbx - Indicating whiteboard

**Location:** Place in `public/animations/`

**Format:** FBX (Mixamo default export)

---

### External Binaries

**Rhubarb Lip-Sync v1.13.0:**
- Download: https://github.com/DanielSWolf/rhubarb-lip-sync/releases/tag/v1.13.0
- Windows: `rhubarb.exe`
- Linux/Mac: `rhubarb`
- Location: `lib/speech/rhubarb/rhubarb.exe`

**Make executable (Linux/Mac):**
```bash
chmod +x lib/speech/rhubarb/rhubarb
```

---

## Environment Variables Updates

### .env.local (Add These)

```bash
# ============================================
# Teacher Voice Configuration
# ============================================
NEXT_PUBLIC_ENABLE_TEACHER_VOICE=true
OPENAI_TTS_VOICE=nova
OPENAI_TTS_MODEL=tts-1
OPENAI_WHISPER_LANGUAGE=es

# Teacher Feature Flags
NEXT_PUBLIC_TEACHER_FULLSCREEN=true
NEXT_PUBLIC_TEACHER_VOICE_INPUT=true
NEXT_PUBLIC_TEACHER_WHITEBOARD=true
NEXT_PUBLIC_TEACHER_ANIMATIONS=true

# Performance Settings
NEXT_PUBLIC_TEACHER_MOBILE_ENABLED=false
NEXT_PUBLIC_MAX_AUDIO_DURATION=120
```

### .env.example (Update)

```bash
# Add to existing .env.example:

# Teacher Voice Configuration (Phase 4)
NEXT_PUBLIC_ENABLE_TEACHER_VOICE=true
OPENAI_TTS_VOICE=nova
OPENAI_TTS_MODEL=tts-1
OPENAI_WHISPER_LANGUAGE=es
NEXT_PUBLIC_TEACHER_FULLSCREEN=true
NEXT_PUBLIC_TEACHER_VOICE_INPUT=true
NEXT_PUBLIC_TEACHER_WHITEBOARD=true
NEXT_PUBLIC_TEACHER_ANIMATIONS=true
NEXT_PUBLIC_TEACHER_MOBILE_ENABLED=false
NEXT_PUBLIC_MAX_AUDIO_DURATION=120
```

---

## Risk Assessment & Mitigations

### High-Risk Items

**1. Complexity of Full Implementation**
- **Risk:** 95 hours is aggressive for all features
- **Probability:** High
- **Mitigation:**
  - Break into atomic commits
  - Test each component thoroughly before integration
  - Use feature flags to disable problematic features
  - Have rollback plan ready

**2. Performance with Full-Screen 3D + Whiteboard**
- **Risk:** Frame rate drops below 30fps
- **Probability:** Medium
- **Mitigation:**
  - Use optimized models (<2MB each)
  - Implement LOD (Level of Detail)
  - Profile early and often
  - Simplify whiteboard rendering if needed

**3. OpenAI API Costs with Voice I/O**
- **Risk:** High usage → unexpected costs
- **Probability:** Medium
- **Mitigation:**
  - Aggressive database caching
  - Pre-generate common phrases
  - Monitor costs daily
  - Set alerts on OpenAI dashboard

**4. Voice Input Reliability (Whisper STT)**
- **Risk:** Poor transcription accuracy for student voice
- **Probability:** Medium
- **Mitigation:**
  - Show transcription for confirmation
  - Allow text input as alternative
  - Handle "I didn't understand" gracefully
  - Test with real student audio early

---

## Success Metrics

### Technical Metrics

- ✅ Frame rate: 60fps (desktop), 30fps minimum (mobile)
- ✅ TTS latency: <3s first time, <500ms cached
- ✅ STT latency: <2s for 10-second audio
- ✅ Lip-sync accuracy: >90% viseme match
- ✅ Cache hit rate: >70% after 1 week
- ✅ API error rate: <2%
- ✅ Memory usage: Stable (no leaks)

### User Experience Metrics

- ✅ Teacher voice is clear and natural
- ✅ Students can successfully ask questions
- ✅ Whiteboard visualizations are helpful
- ✅ Animations enhance understanding
- ✅ No confusion about how to use features

### Business Metrics

- ✅ Student engagement increases >20%
- ✅ Hint usage decreases (voice replaces text)
- ✅ Teacher satisfaction with analytics
- ✅ OpenAI costs <$50/month for 500 students

---

## Implementation Order (Recommended)

### Phase 1 - Week 1

**Priority 1: Database & API Foundation (Days 1-2)**
1. Create database tables
2. Run migration script
3. Create TTS endpoint (`/speak`)
4. Create STT endpoint (`/listen`)
5. Implement caching system
6. Test endpoints independently

**Priority 2: 3D Teacher Component (Days 2-3)**
1. Create Teacher.tsx component
2. Load 3D model
3. Implement basic animations
4. Integrate Rhubarb lip-sync
5. Test lip-sync accuracy

**Priority 3: Full-Screen Overlay (Days 3-4)**
1. Create TeacherOverlay.tsx
2. Implement enter/exit animations
3. Add voice input component
4. Connect to TTS/STT endpoints
5. Test voice I/O flow

**Priority 4: ChatGPT Integration (Day 4)**
1. Create chat endpoint
2. Implement conversation state
3. Add math teacher prompts
4. Test full conversation loop

**Priority 5: Testing & Polish (Day 5)**
1. End-to-end testing
2. Performance profiling
3. Bug fixes
4. Documentation

---

### Phase 2 - Week 2

**Priority 1: Animation System (Days 1-2)**
1. Download Mixamo animations
2. Integrate all 10 animations
3. Create animation state machine
4. Add contextual triggers
5. Test smooth transitions

**Priority 2: 3D Whiteboard (Days 2-3)**
1. Create Whiteboard.tsx component
2. Implement drawing system
3. Add math visualization utilities
4. Test whiteboard rendering

**Priority 3: Math Visualization (Days 3-4)**
1. Create MathVisualizer.tsx
2. Implement animated solutions
3. Sync with teacher speech
4. Add step-by-step explanations
5. Test with real math problems

**Priority 4: Classroom Environments (Day 4)**
1. Load classroom models
2. Add environment switcher
3. Test lighting and performance

---

### Phase 3 - Week 3

**Priority 1: Settings & Selection (Days 1-2)**
1. Teacher selection UI
2. Voice selection UI (teacher dashboard)
3. Class settings API
4. Database queries for settings
5. Test configuration flow

**Priority 2: Analytics (Days 2-3)**
1. Analytics queries
2. Dashboard charts
3. Voice usage reports
4. Export functionality
5. Test with sample data

**Priority 3: Optimization (Day 3)**
1. Mobile detection
2. Performance tuning
3. Code splitting
4. Asset optimization

**Priority 4: Final Testing (Day 4)**
1. Full regression testing
2. Documentation updates
3. Deployment preparation
4. User testing

---

## Rollback Strategy

### Level 1: Feature Flags (No Code Removal)

```typescript
// .env.local
NEXT_PUBLIC_ENABLE_TEACHER_VOICE=false

// Instantly disables all teacher features
// User can re-enable anytime
```

### Level 2: Disable Problematic Features

```typescript
// Disable voice input only (keep voice output)
NEXT_PUBLIC_TEACHER_VOICE_INPUT=false

// Disable whiteboard only
NEXT_PUBLIC_TEACHER_WHITEBOARD=false

// Disable full-screen mode (show in side panel instead)
NEXT_PUBLIC_TEACHER_FULLSCREEN=false
```

### Level 3: Full Rollback (Revert Code)

```bash
# Revert all teacher commits
git log --grep="teacher" --oneline
git revert <commit-hash>...<commit-hash>
git push origin main

# Or revert to pre-teacher state
git reset --hard <commit-before-teacher>
git push --force origin main
```

### Level 4: Database Cleanup

```sql
-- If needed to remove tables
DROP TABLE IF EXISTS teacher_voice_interactions;
DROP TABLE IF EXISTS teacher_voice_cache;
DROP TABLE IF EXISTS class_voice_settings;
```

---

## Pre-Implementation Checklist

Before starting implementation, ensure:

### Assets Ready
- [ ] teacher1.glb placed in `public/models/teachers/`
- [ ] teacher2.glb placed in `public/models/teachers/`
- [ ] classroom1.glb placed in `public/models/environments/`
- [ ] classroom2.glb placed in `public/models/environments/`
- [ ] Rhubarb executable downloaded to `lib/speech/rhubarb/`
- [ ] Rhubarb is executable (`chmod +x` on Linux/Mac)
- [ ] Mixamo animations downloaded to `public/animations/`

### Environment Setup
- [ ] OpenAI API key verified (✅ Done - TTS & Whisper working)
- [ ] .env.local updated with teacher variables
- [ ] Database connection working
- [ ] Vercel Postgres has enough storage

### Code Preparation
- [ ] Git branch created: `feature/3d-teacher-full`
- [ ] Latest main branch pulled
- [ ] All existing tests passing
- [ ] Development environment running

### Team Readiness
- [ ] Timeline approved (3 weeks)
- [ ] Resources allocated
- [ ] User testing plan ready
- [ ] Deployment plan reviewed

---

## Next Steps - START IMPLEMENTATION

You are **READY TO START** implementation. Here's what happens next:

### Step 1: Asset Setup (30 minutes)
1. Place 3D models in correct directories
2. Download and install Rhubarb
3. Download Mixamo animations
4. Verify all files load correctly

### Step 2: Database Migration (15 minutes)
```bash
npm run db:init-teacher-voice
```
Verify tables created successfully.

### Step 3: Environment Config (5 minutes)
Update .env.local with teacher variables.

### Step 4: Start Phase 1 Implementation (Week 1)
Begin with Priority 1: Database & API Foundation.

### Step 5: Commit Frequently
Use atomic commits:
- `feat(teacher): add database schema for voice interactions`
- `feat(teacher): implement TTS endpoint with caching`
- `feat(teacher): create 3D teacher component with lip-sync`
- etc.

---

## Questions or Blockers?

If you encounter any issues during implementation:

1. **Performance issues:** Profile with Chrome DevTools, reduce model complexity
2. **API errors:** Check OpenAI dashboard, verify rate limits
3. **Lip-sync not working:** Test Rhubarb executable manually
4. **3D rendering issues:** Check Three.js console errors, verify model format
5. **Voice input not working:** Test Whisper endpoint independently

---

**Plan Status:** ✅ APPROVED - READY FOR IMPLEMENTATION
**Next Action:** Asset setup + Database migration
**Target Start:** Immediately
**Target Completion:** 3 weeks (12-14 work days)

---

**Good luck with implementation! 🚀**
