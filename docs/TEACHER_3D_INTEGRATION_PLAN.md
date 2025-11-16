# 3D Interactive Math Teacher - Integration Execution Plan

**Project:** Learniverse
**Feature:** 3D Interactive Math Teacher with Voice Interaction
**Reference:** R3F AI Language Teacher (adapted for mathematics education)
**Date:** 2025-01-15
**Status:** PLANNING PHASE - AWAITING APPROVAL

---

## Executive Summary

This document outlines the complete integration plan for adding a 3D interactive math teacher to Learniverse. The teacher will provide voice-based explanations, hints, and encouragement during math activities, using OpenAI TTS for speech and lip-sync animations synchronized with audio.

**Key Objectives:**
- Add optional 3D teacher presence in game interface
- Enable teacher voice output (OpenAI TTS + Rhubarb lip-sync)
- Maintain all existing functionality (zero regressions)
- Keep mobile-responsive and performant (60fps)
- Spanish language UI and teacher voice

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Phase Breakdown](#2-phase-breakdown)
3. [File-by-File Changes](#3-file-by-file-changes)
4. [Dependencies](#4-dependencies)
5. [Database Changes](#5-database-changes)
6. [API Endpoint Specifications](#6-api-endpoint-specifications)
7. [Testing Strategy](#7-testing-strategy)
8. [Rollback Plan](#8-rollback-plan)
9. [Timeline Estimates](#9-timeline-estimates)
10. [Risk Assessment](#10-risk-assessment)
11. [Open Questions](#11-open-questions)

---

## 1. Architecture Overview

### 1.1 Integration Points

**Current Architecture:**
```
┌─────────────────────────────────────────────────┐
│ Game Page (/app/game/page.tsx)                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Activity Selector                           │ │
│ │ → Activity Card (Question Display)          │ │
│ │ → Hint System (Text-based + AI)            │ │
│ │ → Feedback Modal                            │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Proposed Architecture:**
```
┌─────────────────────────────────────────────────┐
│ Game Page (/app/game/page.tsx)                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Activity Selector                           │ │
│ │ → Activity Card (Question Display)          │ │
│ │   ┌──────────────────────────────────┐      │ │
│ │   │ [NEW] 3D Teacher Component       │      │ │
│ │   │  - Teacher avatar (3D model)     │      │ │
│ │   │  - Classroom environment         │      │ │
│ │   │  - Animations & lip-sync         │      │ │
│ │   │  - Audio playback                │      │ │
│ │   └──────────────────────────────────┘      │ │
│ │ → Hint System (Text + Voice via Teacher)    │ │
│ │ → Feedback Modal (+ Teacher Animation)      │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
Student Action → Game State → Teacher State → API → OpenAI → Audio + Lip-sync → Render

Example Flow:
1. Student requests hint
2. gameStore.getAIHint() called
3. Teacher state updated (teacherSpeaking: true, animation: 'Thinking')
4. POST /api/teacher/speak (text: hint)
5. OpenAI TTS generates MP3
6. Rhubarb generates lip-sync JSON
7. Response: { audio: base64, lipsync: {...}, animation: 'TalkingOne' }
8. Teacher component plays audio with lip-sync
9. On audio end: teacherSpeaking: false, animation: 'Idle'
```

### 1.3 Component Hierarchy

```
app/game/page.tsx
├── TeacherScene (NEW - dynamic import with ssr: false)
│   ├── Canvas (R3F)
│   │   ├── Classroom (NEW - environment)
│   │   ├── Teacher (NEW - animated avatar)
│   │   │   ├── Avatar model (teacher1.glb or teacher2.glb)
│   │   │   ├── Animations (Mixamo FBX)
│   │   │   └── Lip-sync morphs
│   │   ├── Lighting
│   │   └── Camera controls
│   └── TeacherControls (NEW - UI overlay)
│       ├── Toggle visibility button
│       └── Voice status indicator
├── Activity Card (EXISTING - modify to work with teacher)
├── Hint System (EXISTING - triggers teacher speech)
└── Feedback Modal (EXISTING - triggers teacher reactions)
```

---

## 2. Phase Breakdown

### Phase 1: MVP - Basic Teacher with TTS (Week 1-2)

**Goal:** Display 3D teacher that speaks when giving hints/feedback

**Features:**
- ✅ 3D teacher model loads in game scene
- ✅ Teacher speaks hints using OpenAI TTS (Spanish)
- ✅ Basic animations (Idle, Talking)
- ✅ Simple lip-sync with Rhubarb
- ✅ Teacher toggle (show/hide)
- ✅ Text fallback if TTS fails

**Deliverables:**
- Teacher 3D component
- TTS API endpoint
- Lip-sync integration
- Basic state management

**Acceptance Criteria:**
- Teacher appears in game
- Teacher speaks when hint is requested
- Lip-sync matches audio
- No performance degradation
- Works on desktop

---

### Phase 2: Enhanced Interactions (Week 3)

**Goal:** Add contextual teacher responses and better animations

**Features:**
- ✅ Teacher introduces problem verbally (optional)
- ✅ Teacher celebrates correct answers (animation + voice)
- ✅ Teacher encourages on incorrect answers (animation + voice)
- ✅ Multiple animations (Happy, Sad, Thinking, Surprised)
- ✅ Facial expressions based on context
- ✅ Mobile responsive version

**Deliverables:**
- Full animation catalog
- Expression system
- Mobile optimization

**Acceptance Criteria:**
- Teacher reacts appropriately to all game events
- Animations smooth (60fps)
- Works on mobile (or degrades gracefully)

---

### Phase 3: Advanced Features (Week 4 - Optional)

**Goal:** Premium features for enhanced learning

**Features:**
- 🔲 Student can choose teacher (teacher1 vs teacher2)
- 🔲 Classroom environment selection
- 🔲 Teacher personality settings (formal/casual)
- 🔲 Voice input from students (Whisper STT)
- 🔲 Visual whiteboard for teacher explanations
- 🔲 Cache common teacher responses
- 🔲 Teacher analytics (teacher dashboard)

**Deliverables:**
- Teacher selection UI
- Whiteboard component
- Voice input system
- Analytics tracking

**Acceptance Criteria:**
- All features work without breaking existing functionality
- Performance remains optimal
- Analytics provide useful insights

---

## 3. File-by-File Changes

### 3.1 New Files

**3D Components:**
```
components/3d/teacher/
├── Teacher.tsx                    [NEW - Main teacher avatar component]
├── Classroom.tsx                  [NEW - Classroom environment]
├── TeacherScene.tsx              [NEW - Complete scene with teacher]
└── TeacherControls.tsx           [NEW - UI controls for teacher]
```

**Speech/Voice System:**
```
lib/speech/
├── tts.ts                        [NEW - OpenAI TTS wrapper]
├── lip-sync.ts                   [NEW - Rhubarb integration]
├── audio-player.ts               [NEW - Audio playback utilities]
└── rhubarb/
    ├── rhubarb.exe              [NEW - Windows executable]
    └── config.json              [NEW - Rhubarb config]
```

**API Routes:**
```
app/api/teacher-voice/
├── speak/route.ts               [NEW - TTS endpoint]
└── health/route.ts              [NEW - Voice service health check]
```

**Types:**
```
types/
└── teacher.ts                   [NEW - Teacher-specific types]
```

**Assets:**
```
public/
├── models/teachers/
│   ├── teacher1.glb            [NEW - Male teacher model]
│   └── teacher2.glb            [NEW - Female teacher model]
├── models/environments/
│   ├── classroom1.glb          [NEW - Modern classroom]
│   └── classroom2.glb          [NEW - Traditional classroom]
└── animations/
    ├── Idle.fbx                [NEW - Idle animation]
    ├── TalkingOne.fbx          [NEW - Talking variation 1]
    ├── TalkingThree.fbx        [NEW - Talking variation 3]
    ├── Happy.fbx               [NEW - Happy expression]
    ├── Sad.fbx                 [NEW - Sad expression]
    ├── Thinking.fbx            [NEW - Thinking pose]
    └── Surprised.fbx           [NEW - Surprised reaction]
```

---

### 3.2 Modified Files

**State Management:**
```
stores/gameStore.ts              [MODIFY - Add teacher state]
  + teacherVisible: boolean
  + teacherSpeaking: boolean
  + teacherAnimation: string
  + teacherExpression: string
  + currentAudio: HTMLAudioElement | null
  + currentLipsync: LipsyncData | null
  + toggleTeacher()
  + setTeacherAnimation()
  + playTeacherSpeech()
```

**Game Page:**
```
app/game/page.tsx                [MODIFY - Integrate teacher component]
  + Import TeacherScene (dynamic)
  + Add teacher toggle button
  + Trigger teacher speech on hint/feedback
  + Pass game state to teacher component
```

**Configuration:**
```
next.config.mjs                  [MODIFY - Add Rhubarb webpack config]
  + Webpack config for binary files
  + External for Rhubarb executable

.env.example                     [MODIFY - Add teacher config]
  + OPENAI_TTS_VOICE=nova
  + OPENAI_TTS_MODEL=tts-1
  + TEACHER_VOICE_LANGUAGE=es
  + ENABLE_TEACHER_VOICE=true
```

**Documentation:**
```
CLAUDE.md                        [MODIFY - Add teacher architecture]
README.md                        [MODIFY - Add teacher feature description]
package.json                     [MODIFY - Add scripts for Rhubarb]
```

---

### 3.3 Unchanged Files (Key)

These files remain completely untouched:

```
✅ lib/db/* (all database files)
✅ lib/auth/* (authentication)
✅ lib/gamification/* (points, badges, levels)
✅ app/api/activities/* (activity generation/submission)
✅ app/api/ai/hint/* (existing AI hints)
✅ app/api/teacher/* (teacher dashboard)
✅ app/dashboard/* (all dashboards)
✅ components/auth/* (authentication UI)
✅ components/avatar/* (student avatar)
✅ middleware.ts (route protection)
✅ All database schema files
```

---

## 4. Dependencies

### 4.1 Already Available (No Installation Needed)

✅ `openai` (v6.3.0) - TTS API support
✅ `@react-three/fiber` (v8.17.10) - 3D rendering
✅ `@react-three/drei` (v9.114.3) - 3D utilities
✅ `three` (v0.180.0) - Three.js core
✅ `next` (v14.2.33) - Framework
✅ `react` (v18.3.1) - React library
✅ `zustand` (v5.0.8) - State management

### 4.2 New Dependencies to Install

**Production:**
```json
{
  "node-cache": "^5.1.2"  // Cache TTS responses (optional but recommended)
}
```

**Dev Dependencies:**
```json
{
  "@types/node-cache": "^4.2.5"  // TypeScript types for caching
}
```

**External Binaries (Download Manually):**
- **Rhubarb Lip-Sync** v1.13.0
  - Download: https://github.com/DanielSWolf/rhubarb-lip-sync/releases
  - File: `rhubarb.exe` (Windows) or `rhubarb` (Linux/Mac)
  - Location: `lib/speech/rhubarb/rhubarb.exe`

### 4.3 Asset Downloads (From Reference Project)

**3D Models (Fiverr - Need to Purchase or Use Alternatives):**
- Teacher models: teacher1.glb, teacher2.glb
- Classroom models: classroom1.glb, classroom2.glb

**Animations (Free from Mixamo):**
- Download from https://www.mixamo.com
- Required: Idle, TalkingOne, TalkingThree, Happy, Sad, Thinking, Surprised
- Format: FBX (convert to usable format)

### 4.4 Installation Commands

```bash
# Install new dependencies
npm install node-cache

# Install dev dependencies
npm install --save-dev @types/node-cache

# Download Rhubarb manually and place in lib/speech/rhubarb/
# Make executable on Linux/Mac:
chmod +x lib/speech/rhubarb/rhubarb
```

---

## 5. Database Changes

### 5.1 Proposed Schema (OPTIONAL - For Analytics Only)

**Note:** Database changes are NOT required for MVP. Only add if Phase 3 analytics are needed.

**Table: `teacher_voice_interactions`**
```sql
CREATE TABLE IF NOT EXISTS teacher_voice_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES math_activities(id) ON DELETE SET NULL,
  interaction_type VARCHAR(50) NOT NULL, -- 'hint', 'feedback', 'encouragement', 'introduction'
  text_spoken TEXT NOT NULL,
  audio_duration_seconds DECIMAL(5,2),
  voice_used VARCHAR(20) DEFAULT 'nova',
  tts_model VARCHAR(20) DEFAULT 'tts-1',
  lipsync_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_student_interactions (student_id, created_at),
  INDEX idx_activity_interactions (activity_id)
);
```

**Table: `teacher_voice_cache`** (Optional - For Cost Optimization)
```sql
CREATE TABLE IF NOT EXISTS teacher_voice_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA256 of text
  text_content TEXT NOT NULL,
  voice VARCHAR(20) NOT NULL,
  tts_model VARCHAR(20) NOT NULL,
  language VARCHAR(5) DEFAULT 'es',
  audio_base64 TEXT NOT NULL,
  lipsync_json JSONB NOT NULL,
  audio_duration_seconds DECIMAL(5,2),
  times_used INTEGER DEFAULT 1,
  last_used_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_text_hash (text_hash),
  INDEX idx_last_used (last_used_at)
);
```

### 5.2 Migration Script

**File:** `scripts/init-teacher-voice-db.ts`

```typescript
// Only run if analytics are needed (Phase 3)
// NOT REQUIRED FOR MVP
```

### 5.3 Decision: Database Changes

**Recommendation:** START WITHOUT DATABASE CHANGES

**Rationale:**
- MVP doesn't require persistence
- Can use in-memory cache (`node-cache`) initially
- Add database caching in Phase 3 if needed
- Keeps rollback simple

**If analytics are required:**
- Run migration script after MVP is working
- Add tracking calls to TTS endpoint
- Update teacher dashboard to show voice interactions

---

## 6. API Endpoint Specifications

### 6.1 POST /api/teacher-voice/speak

**Purpose:** Generate speech with lip-sync for teacher

**Authentication:** Required (student role)

**Request:**
```typescript
{
  text: string,              // Text to speak (max 500 chars)
  voice?: string,            // 'nova' (default) | 'shimmer' | 'alloy'
  model?: string,            // 'tts-1' (default) | 'tts-1-hd'
  animation?: string,        // Suggested animation name
  expression?: string        // Suggested facial expression
}
```

**Response (Success - 200):**
```typescript
{
  success: true,
  audio: string,             // Base64-encoded MP3
  lipsync: {
    metadata: {
      duration: number,
      soundFile: string
    },
    mouthCues: Array<{
      start: number,
      end: number,
      value: string        // Viseme (A, B, C, D, E, F, G, H, X)
    }>
  },
  animation: string,         // Animation to use
  expression: string,        // Expression to use
  duration: number,          // Audio duration in seconds
  cached: boolean           // Whether response was cached
}
```

**Response (Error - 400/500):**
```typescript
{
  success: false,
  message: string,
  error?: string,
  fallbackText: string      // Original text for UI fallback
}
```

**Implementation Details:**
1. Validate input (text length, voice options)
2. Check cache for existing audio (text hash + voice)
3. If not cached:
   - Call OpenAI TTS API
   - Save MP3 to temp file
   - Run Rhubarb lip-sync
   - Convert audio to base64
   - Store in cache
4. Return audio + lip-sync data
5. Clean up temp files

**Rate Limiting:**
- Reuse existing `lib/ai/rate-limiter.ts`
- Max 30 requests per minute per student

**Caching:**
- Use `node-cache` with 1-hour TTL
- Cache key: `SHA256(text + voice + model)`
- Reduces OpenAI API costs significantly

**Error Handling:**
- OpenAI API failure → Return error with fallback text
- Rhubarb failure → Return audio without lip-sync
- File I/O failure → Return generic error message

---

### 6.2 GET /api/teacher-voice/health

**Purpose:** Check TTS service health

**Authentication:** Not required (public)

**Response:**
```typescript
{
  status: 'ok' | 'degraded' | 'error',
  services: {
    openai: boolean,
    rhubarb: boolean
  },
  cache: {
    entries: number,
    hitRate: string
  }
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Files to Test:**
- `lib/speech/tts.ts` - TTS generation
- `lib/speech/lip-sync.ts` - Rhubarb integration
- `lib/speech/audio-player.ts` - Audio utilities
- `stores/gameStore.ts` - Teacher state updates

**Test Cases:**
```typescript
// lib/speech/tts.test.ts
describe('TTS Service', () => {
  it('should generate audio from text')
  it('should use correct voice')
  it('should handle OpenAI API errors')
  it('should cache responses')
  it('should return base64 audio')
})

// lib/speech/lip-sync.test.ts
describe('Lip-sync Service', () => {
  it('should generate lip-sync from audio')
  it('should handle Rhubarb errors')
  it('should return valid viseme data')
  it('should clean up temp files')
})

// stores/gameStore.test.ts
describe('Game Store - Teacher', () => {
  it('should toggle teacher visibility')
  it('should update teacher animation')
  it('should play teacher speech')
  it('should handle audio end events')
})
```

---

### 7.2 Integration Tests

**Endpoint Tests:**
```bash
# Test TTS endpoint
curl -X POST http://localhost:3000/api/teacher-voice/speak \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"text": "Hola, soy tu profesor de matemáticas"}'

# Expected: JSON with audio, lipsync, animation

# Test health endpoint
curl http://localhost:3000/api/teacher-voice/health

# Expected: { status: 'ok', ... }
```

**3D Component Tests:**
- Teacher model loads correctly
- Animations play smoothly
- Lip-sync synchronizes with audio
- Performance remains >60fps
- No memory leaks

---

### 7.3 Manual Testing Checklist

**Phase 1 MVP:**
- [ ] Teacher model appears in game scene
- [ ] Teacher speaks when hint is requested (audio plays)
- [ ] Lip-sync matches audio visually
- [ ] Teacher returns to Idle after speaking
- [ ] Toggle button shows/hides teacher
- [ ] Text fallback works if TTS fails
- [ ] No errors in console
- [ ] Game performance not affected (check FPS)
- [ ] Works in Chrome, Firefox, Edge

**Phase 2 Enhanced:**
- [ ] Teacher introduces problem (optional voice)
- [ ] Teacher celebrates correct answer (Happy animation)
- [ ] Teacher encourages incorrect answer (Sad animation)
- [ ] All animations load and play
- [ ] Facial expressions change appropriately
- [ ] Mobile version loads (or shows fallback)
- [ ] Responsive layout works on tablet

**Phase 3 Advanced:**
- [ ] Teacher selection UI works
- [ ] Classroom environment switches
- [ ] Voice input records and transcribes
- [ ] Whiteboard displays correctly
- [ ] Analytics track interactions
- [ ] Cache improves response time

---

### 7.4 Performance Benchmarks

**Target Metrics:**
- **Frame Rate:** 60fps minimum during teacher animations
- **Load Time:** Teacher scene loads in <2 seconds
- **TTS Response Time:** Audio generated in <3 seconds (first time), <500ms (cached)
- **Memory Usage:** No memory leaks (stable after 20+ interactions)
- **Bundle Size Increase:** <500KB (gzipped) for new code

**Measurement Tools:**
- Chrome DevTools Performance tab
- React DevTools Profiler
- Lighthouse performance audit
- Network tab for API latency

---

## 8. Rollback Plan

### 8.1 Rollback Triggers

Rollback if any of the following occur:
- ❌ Game performance drops below 30fps
- ❌ Existing game functionality breaks
- ❌ TTS endpoint has >20% error rate
- ❌ Memory leaks detected
- ❌ Mobile completely broken
- ❌ OpenAI costs exceed budget (>$50/day)

### 8.2 Rollback Steps

**Level 1 - Disable Feature (Keep Code):**
```typescript
// .env.local
ENABLE_TEACHER_VOICE=false

// gameStore.ts - Add feature flag check
if (!process.env.NEXT_PUBLIC_ENABLE_TEACHER_VOICE) {
  return // Don't load teacher
}
```

**Level 2 - Remove Components (Revert Files):**
```bash
# Remove new files
rm -rf components/3d/teacher/
rm -rf lib/speech/
rm -rf app/api/teacher-voice/

# Revert modified files
git checkout stores/gameStore.ts
git checkout app/game/page.tsx
git checkout next.config.mjs
git checkout .env.example
```

**Level 3 - Full Rollback (Git Revert):**
```bash
# If on feature branch
git checkout main
git branch -D feature/3d-teacher

# If merged to main
git revert <commit-hash>
git push origin main
```

### 8.3 Data Cleanup (If Database Tables Added)

```sql
-- Only if Phase 3 tables were created
DROP TABLE IF EXISTS teacher_voice_interactions;
DROP TABLE IF EXISTS teacher_voice_cache;
```

---

## 9. Timeline Estimates

### 9.1 Phase 1: MVP (10-12 hours)

| Task | Hours | Dependencies |
|------|-------|--------------|
| Download/prepare 3D assets | 2h | Fiverr models, Mixamo animations |
| Create Teacher 3D component | 3h | Assets ready |
| Implement TTS endpoint | 2h | OpenAI API key |
| Integrate Rhubarb lip-sync | 2h | Rhubarb binary |
| Update gameStore | 1h | - |
| Integrate into game page | 2h | All above complete |
| Testing & bug fixes | 2h | - |

**Total:** ~14 hours (1.5-2 work days)

---

### 9.2 Phase 2: Enhanced (6-8 hours)

| Task | Hours | Dependencies |
|------|-------|--------------|
| Add full animation catalog | 2h | Mixamo downloads |
| Implement expression system | 2h | - |
| Context-aware teacher responses | 2h | - |
| Mobile responsive version | 2h | - |
| Testing & optimization | 2h | - |

**Total:** ~10 hours (1-1.5 work days)

---

### 9.3 Phase 3: Advanced (12-16 hours)

| Task | Hours | Dependencies |
|------|-------|--------------|
| Teacher selection UI | 2h | Multiple models |
| Classroom environment switching | 2h | Environment models |
| Voice input (Whisper STT) | 4h | OpenAI Whisper setup |
| Visual whiteboard component | 3h | - |
| Caching optimization | 2h | - |
| Analytics tracking | 2h | Database tables |
| Documentation | 1h | - |
| Final testing | 2h | - |

**Total:** ~18 hours (2-2.5 work days)

---

### 9.4 Total Project Timeline

**Conservative Estimate:**
- **Phase 1 (MVP):** 2 work days (Week 1)
- **Phase 2 (Enhanced):** 1.5 work days (Week 2)
- **Phase 3 (Advanced):** 2.5 work days (Week 3-4)

**Total:** ~6 work days (1.5 weeks full-time, or 3-4 weeks part-time)

---

## 10. Risk Assessment

### 10.1 High Risk Items

**Risk:** 3D Model Performance Impact
**Probability:** Medium
**Impact:** High
**Mitigation:**
- Use optimized GLB models (<2MB each)
- Implement LOD (Level of Detail) if needed
- Add toggle to disable teacher on slow devices
- Test on low-end hardware early

---

**Risk:** OpenAI TTS API Costs
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Implement aggressive caching
- Cache common phrases in database
- Set daily spending limits on OpenAI account
- Monitor costs daily during testing
- Use TTS-1 (cheaper) for development

---

**Risk:** Rhubarb Lip-Sync Failures
**Probability:** Low
**Impact:** Low
**Mitigation:**
- Degrade gracefully (play audio without lip-sync)
- Log failures for debugging
- Provide manual lip-sync fallback
- Test Rhubarb on all platforms early

---

**Risk:** Mobile Performance
**Probability:** High
**Impact:** Medium
**Mitigation:**
- Make teacher optional on mobile
- Reduce 3D quality on mobile (lower poly models)
- Hide teacher on small screens (<768px)
- Test on real mobile devices, not just emulators

---

**Risk:** Breaking Existing Functionality
**Probability:** Low
**Impact:** Very High
**Mitigation:**
- Don't modify existing files unless necessary
- Use feature flags for all new code
- Comprehensive testing of all game flows
- Keep changes isolated to new directories

---

### 10.2 Medium Risk Items

**Risk:** Animation Loading Time
**Probability:** Medium
**Impact:** Low
**Mitigation:**
- Preload animations on game page mount
- Show loading indicator
- Lazy load non-essential animations

---

**Risk:** Audio Playback Issues (Browser Compatibility)
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Test audio in all major browsers
- Provide MP3 format (widely supported)
- Handle autoplay policies properly
- Add user-initiated audio unlock

---

### 10.3 Low Risk Items

- Asset download delays (manual process)
- TypeScript type errors (easy to fix)
- Styling conflicts (isolated components)

---

## 11. Open Questions

### 11.1 Feature Scope Questions

**Question 1:** Should the teacher be present in ALL game sessions or optional?
- **Option A:** Always visible by default (can be toggled off)
- **Option B:** Hidden by default (students opt-in)
- **Option C:** Only available after completing X activities

**Question 2:** Should students choose their teacher (teacher1 vs teacher2) during avatar setup?
- **Option A:** Yes, let students choose (adds personalization)
- **Option B:** No, use one default teacher (simpler)
- **Option C:** Let teachers assign which teacher model for their class

**Question 3:** Do we want voice input from students or just teacher voice output?
- **Option A:** MVP = Teacher voice output only (simpler)
- **Option B:** MVP = Both teacher output + student input (complex)
- **Option C:** Phase 1 = Output, Phase 3 = Input

**Question 4:** Should teacher appear in a separate panel or integrated in the activity card?
- **Option A:** Side panel (desktop only, hidden on mobile)
- **Option B:** Integrated above question (responsive)
- **Option C:** Full-screen overlay mode (immersive)

---

### 11.2 Technical Questions

**Question 5:** Should we create a new `/game-with-teacher` route or modify existing `/game`?
- **Option A:** Modify existing /game (feature flag controlled)
- **Option B:** New route /game-with-teacher (safer)
- **Option C:** Modify existing but keep teacher in separate component

**Question 6:** How to handle teacher state persistence (localStorage, database, session only)?
- **Option A:** Session only (no persistence)
- **Option B:** localStorage (persists teacher visibility preference)
- **Option C:** Database (track all interactions for analytics)

**Question 7:** Should we cache teacher audio responses in the database?
- **Option A:** Yes, cache in database (reduces API costs)
- **Option B:** In-memory cache only (simpler, no DB changes)
- **Option C:** File system cache (middle ground)

**Question 8:** How to handle mobile performance (lower quality 3D, disable on mobile, etc.)?
- **Option A:** Hide teacher on mobile (<768px)
- **Option B:** Show simplified 2D avatar on mobile
- **Option C:** Lower quality 3D on mobile (reduced poly count)

---

### 11.3 Content Questions

**Question 9:** How should teacher explain math concepts (verbal formulas, visual aids needed)?
- **Option A:** Verbal only (TTS text explanations)
- **Option B:** Verbal + whiteboard (draw solutions)
- **Option C:** Verbal + animated examples (complex)

**Question 10:** Should teacher use a virtual whiteboard for showing work?
- **Option A:** Yes, add 3D whiteboard to scene
- **Option B:** No, just verbal explanations
- **Option C:** Use 2D overlay instead of 3D

**Question 11:** What teacher personality/voice best fits 9-11 year old students?
- **Option A:** Warm and encouraging (nova voice)
- **Option B:** Professional and clear (alloy voice)
- **Option C:** Let teachers choose voice per class

**Question 12:** How formal/casual should teacher language be?
- **Option A:** Formal "usted" (traditional education)
- **Option B:** Casual "tú" (friendly, age-appropriate)
- **Option C:** Mix based on context

---

### 11.4 Integration Questions

**Question 13:** Should existing hint system remain as text or convert all to voice?
- **Option A:** Keep text hints, add voice as enhancement
- **Option B:** Convert all hints to voice
- **Option C:** Text fallback if voice fails

**Question 14:** How to handle cases where OpenAI API fails (fallback to text)?
- **Option A:** Show error, revert to text hints
- **Option B:** Retry 3 times, then fallback
- **Option C:** Queue request and notify when ready

**Question 15:** Should teacher feedback be logged to database for teacher dashboard analytics?
- **Option A:** Yes, track all voice interactions (analytics)
- **Option B:** No, keep it lightweight (no tracking)
- **Option C:** Optional tracking (feature flag)

---

## Next Steps

1. **Review this plan** - Read thoroughly and check for any issues
2. **Answer open questions** - Provide decisions on all 15 questions above
3. **Approve/reject phases** - Decide which phases to implement
4. **Provide assets** - Share access to 3D models or budget for Fiverr
5. **Set OpenAI limits** - Configure spending limits on OpenAI account
6. **Approve plan** - Give final go-ahead to start implementation

---

**Plan Status:** ⏳ AWAITING APPROVAL
**Next Review:** Before any code is written
**Author:** Claude Code
**Last Updated:** 2025-01-15
