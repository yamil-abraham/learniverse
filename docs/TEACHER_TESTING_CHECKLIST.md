# 3D Interactive Teacher - Testing Checklist

**Date:** 2025-01-16
**System:** 3D Interactive Math Teacher with Voice I/O
**Phases:** 1, 2, 3 (All implemented)

---

## Pre-Testing Setup

### Environment Setup
- [ ] `.env.local` has all required variables
- [ ] `OPENAI_API_KEY` is valid
- [ ] `NEXT_PUBLIC_ENABLE_TEACHER_VOICE=true`
- [ ] Database connection working
- [ ] Development server running (`npm run dev`)

### Database Setup
- [ ] Run `npm run db:init-teacher-voice` if not already done
- [ ] Verify tables exist:
  ```sql
  SELECT * FROM teacher_voice_interactions LIMIT 1;
  SELECT * FROM teacher_voice_cache LIMIT 1;
  SELECT * FROM class_voice_settings LIMIT 1;
  ```

### User Accounts
- [ ] Have student account ready
- [ ] Have teacher account ready
- [ ] Know classId for testing

---

## Phase 1: Core Teacher with Voice I/O

### ✅ Test 1.1: Teacher Container Loads
**Location:** `/game` page

**Steps:**
1. Login as student
2. Navigate to game page
3. Look for teacher interface

**Expected:**
- [ ] TeacherContainer component renders
- [ ] No console errors
- [ ] 3D scene initializes
- [ ] Loading states work properly

**Pass Criteria:** Teacher interface visible, no errors

---

### ✅ Test 1.2: 3D Teacher Model Loads
**Location:** TeacherContainer 3D scene

**Steps:**
1. Open game page
2. Wait for teacher model to load
3. Check browser console for logs

**Expected:**
- [ ] Teacher 3D model loads successfully
- [ ] Console shows: "✅ Teacher model loaded: [teacher name]"
- [ ] Model is visible in scene
- [ ] Model is positioned correctly
- [ ] No WebGL errors

**Pass Criteria:** 3D teacher visible and loaded

---

### ✅ Test 1.3: Teacher Speaks (TTS + Lip-sync)
**Location:** TeacherContainer

**Steps:**
1. Trigger teacher to speak (click help button or similar)
2. Observe teacher during speech
3. Listen to audio quality

**Expected:**
- [ ] Audio plays clearly
- [ ] Lip-sync animations match speech
- [ ] Mouth movements look natural
- [ ] Animation plays (TalkingOne, etc.)
- [ ] Audio quality is good

**Pass Criteria:** Teacher speaks with synchronized lip movement

---

### ✅ Test 1.4: Voice Input (Microphone)
**Location:** TeacherContainer voice controls

**Steps:**
1. Click microphone button
2. Allow microphone permissions
3. Speak clearly: "¿Cuánto es 7 más 5?"
4. Stop recording

**Expected:**
- [ ] Microphone permission requested
- [ ] Recording indicator shows
- [ ] Can stop recording
- [ ] Processing indicator appears
- [ ] Transcription happens

**Pass Criteria:** Voice input captured and processed

---

### ✅ Test 1.5: Complete Conversation Flow
**Location:** Full interaction

**Steps:**
1. Click microphone
2. Ask: "¿Me puedes explicar cómo sumar 7 + 5?"
3. Wait for teacher response
4. Verify teacher responds

**Expected:**
- [ ] Student audio transcribed
- [ ] Teacher generates response
- [ ] Teacher speaks response
- [ ] Conversation history updates
- [ ] Console shows: "✅ Complete conversation in [X]ms"

**Pass Criteria:** Full voice conversation works end-to-end

---

### ✅ Test 1.6: TTS Caching
**Location:** Database and console

**Steps:**
1. Ask teacher same question twice
2. Check console logs
3. Compare response times

**Expected:**
- [ ] First request: Cache MISS
- [ ] Second request: Cache HIT
- [ ] Console shows: "✨ Cache HIT for teacher response"
- [ ] Second response is faster
- [ ] Audio quality identical

**Pass Criteria:** Caching reduces response time

---

### ✅ Test 1.7: Text Input Alternative
**Location:** TeacherContainer chat input (if implemented)

**Steps:**
1. Type question instead of speaking
2. Send message
3. Verify teacher responds

**Expected:**
- [ ] Text input works
- [ ] Teacher processes text
- [ ] Teacher responds with voice
- [ ] Same quality as voice input

**Pass Criteria:** Text input works as alternative to voice

---

## Phase 2: Whiteboard & Animations

### ✅ Test 2.1: Contextual Animations
**Location:** TeacherContainer during conversation

**Steps:**
1. Ask: "Hola, ¿cómo estás?"
2. Observe teacher animation
3. Ask: "¡Muy bien! Saqué 10 en el examen"
4. Observe teacher animation
5. Ask: "Hmm, no entiendo esto"
6. Observe teacher animation

**Expected:**
- [ ] Greeting → TalkingOne or similar
- [ ] Celebration → Happy animation
- [ ] Confusion → Thinking or Sad animation
- [ ] Animations match sentiment
- [ ] Smooth transitions

**Pass Criteria:** Teacher animations change based on context

---

### ✅ Test 2.2: Whiteboard Triggers
**Location:** Console logs

**Steps:**
1. Ask: "¿Me explicas 7 + 5?"
2. Check console immediately
3. Look for whiteboard logs

**Expected:**
- [ ] Console shows: "📊 Whiteboard triggered: addition (7, 5)"
- [ ] Console shows: "📊 Showing whiteboard: { operation: 'addition', operand1: 7, operand2: 5 }"
- [ ] showWhiteboard state becomes true

**Pass Criteria:** Whiteboard detection works

---

### ✅ Test 2.3: Whiteboard Visibility
**Location:** 3D scene

**Steps:**
1. Ask math question: "¿Cuánto es 7 + 5?"
2. Look at 3D scene
3. Verify whiteboard appears

**Expected:**
- [ ] Whiteboard appears in scene
- [ ] Whiteboard positioned correctly (to the side)
- [ ] Math problem displays on whiteboard
- [ ] Numbers are readable
- [ ] Whiteboard has white surface

**Pass Criteria:** Whiteboard visible with math problem

---

### ✅ Test 2.4: Whiteboard Animations
**Location:** Whiteboard component

**Steps:**
1. Ask: "Explícame 3 + 4"
2. Watch whiteboard animation
3. Observe step-by-step solution

**Expected:**
- [ ] First number appears (3 circles)
- [ ] Second number appears (4 circles)
- [ ] Plus sign appears
- [ ] Equals sign appears
- [ ] Result appears (7)
- [ ] Animation is smooth
- [ ] Steps are clear

**Pass Criteria:** Whiteboard animates math solution

---

### ✅ Test 2.5: Clear Whiteboard Button
**Location:** Top-right corner when whiteboard active

**Steps:**
1. Trigger whiteboard with math question
2. Verify button appears
3. Click "🗑️ Limpiar Pizarra"
4. Verify whiteboard clears

**Expected:**
- [ ] Button appears when whiteboard shown
- [ ] Button is visible and clickable
- [ ] Clicking clears whiteboard
- [ ] Whiteboard disappears from scene
- [ ] Button disappears after clearing

**Pass Criteria:** Clear button works

---

### ✅ Test 2.6: Multiple Math Operations
**Location:** Whiteboard animations

**Test each operation:**
1. **Addition:** "¿Cuánto es 7 + 5?"
   - [ ] Shows addition visualization

2. **Subtraction:** "¿Cuánto es 12 - 4?"
   - [ ] Shows subtraction visualization

3. **Multiplication:** "¿Cuánto es 3 × 4?"
   - [ ] Shows multiplication visualization

4. **Division:** "¿Cuánto es 12 ÷ 3?"
   - [ ] Shows division visualization

5. **Fractions:** "¿Qué es 1/2?"
   - [ ] Shows fraction visualization

**Pass Criteria:** All 5 operations visualize correctly

---

### ✅ Test 2.7: Classroom Environment
**Location:** 3D scene background

**Steps:**
1. Open teacher interface
2. Observe background
3. Check for classroom model

**Expected:**
- [ ] Classroom environment loads
- [ ] Floor is visible
- [ ] Walls/decorations present (if model loaded)
- [ ] Lighting is appropriate
- [ ] No visual glitches

**Pass Criteria:** Classroom environment renders

---

## Phase 3: Settings & Analytics

### ✅ Test 3.1: Teacher Selection UI
**Location:** Game page or test page

**Steps:**
1. Render TeacherSelector component
2. View both teacher options
3. Select different teacher
4. Confirm selection

**Expected:**
- [ ] Modal appears
- [ ] Both teachers shown (Nanami, Naoki)
- [ ] Cards have hover effects
- [ ] Can select teacher
- [ ] Selected state shows checkmark
- [ ] Current teacher has "Actual" badge
- [ ] Confirm button works
- [ ] Modal closes after confirmation

**Pass Criteria:** Teacher selection UI works

---

### ✅ Test 3.2: Voice Settings Component
**Location:** Test in isolation or teacher dashboard

**Steps:**
1. Render VoiceSettings component
2. Change teacher model
3. Change voice selection
4. Toggle formality options
5. Toggle feature switches
6. Click "Guardar Configuración"

**Expected:**
- [ ] All inputs are interactive
- [ ] Teacher model cards are clickable
- [ ] Voice dropdown works
- [ ] Formality buttons work
- [ ] Toggle switches work smoothly
- [ ] Save button triggers onSave
- [ ] Success message appears

**Pass Criteria:** All settings are configurable

---

### ✅ Test 3.3: Voice Settings API - GET
**Location:** `/api/teacher/voice-settings`

**Steps:**
1. Login as teacher
2. Make GET request:
   ```javascript
   fetch('/api/teacher/voice-settings?classId=test-class')
     .then(r => r.json())
     .then(console.log)
   ```

**Expected:**
- [ ] Returns 200 status
- [ ] Returns settings object
- [ ] If no settings, returns defaults
- [ ] `isDefault` flag is correct
- [ ] All fields present

**Pass Criteria:** GET returns settings

---

### ✅ Test 3.4: Voice Settings API - POST
**Location:** `/api/teacher/voice-settings`

**Steps:**
1. Login as teacher
2. Make POST request:
   ```javascript
   fetch('/api/teacher/voice-settings', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       classId: 'test-class',
       defaultVoice: 'nova',
       defaultTeacherModel: 'teacher1',
       languageFormality: 'mixed',
       voiceInputEnabled: true,
       whiteboardEnabled: true,
       animationsEnabled: true
     })
   }).then(r => r.json()).then(console.log)
   ```

**Expected:**
- [ ] Returns 200 status
- [ ] Returns success message
- [ ] Returns settingsId
- [ ] Settings saved to database
- [ ] Duplicate POST returns 409

**Pass Criteria:** POST creates settings

---

### ✅ Test 3.5: Voice Settings API - PUT
**Location:** `/api/teacher/voice-settings`

**Steps:**
1. Create settings with POST first
2. Make PUT request with changes:
   ```javascript
   fetch('/api/teacher/voice-settings', {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       classId: 'test-class',
       defaultVoice: 'onyx',
       defaultTeacherModel: 'teacher2',
       languageFormality: 'formal',
       voiceInputEnabled: false,
       whiteboardEnabled: true,
       animationsEnabled: true
     })
   }).then(r => r.json()).then(console.log)
   ```

**Expected:**
- [ ] Returns 200 status
- [ ] Returns success message
- [ ] Settings updated in database
- [ ] GET shows new values

**Pass Criteria:** PUT updates settings

---

### ✅ Test 3.6: Analytics API - Basic
**Location:** `/api/teacher/analytics/voice-usage`

**Steps:**
1. Generate some voice interactions first
2. Login as teacher
3. Make GET request:
   ```javascript
   fetch('/api/teacher/analytics/voice-usage?classId=test-class')
     .then(r => r.json())
     .then(console.log)
   ```

**Expected:**
- [ ] Returns 200 status
- [ ] Returns data object with 8 metrics
- [ ] totalInteractions is correct
- [ ] totalDuration is calculated
- [ ] avgResponseTime is present
- [ ] cacheHitRate is percentage
- [ ] interactionsByType has breakdown
- [ ] interactionsByDay is array
- [ ] topStudents is array
- [ ] voiceUsageBreakdown is object

**Pass Criteria:** Analytics returns all metrics

---

### ✅ Test 3.7: Analytics Component
**Location:** Test in isolation or dashboard

**Steps:**
1. Render VoiceAnalytics component
2. Wait for data to load
3. Verify all sections render

**Expected:**
- [ ] Loading spinner shows initially
- [ ] Summary cards display (4 cards)
- [ ] Interaction type chart renders
- [ ] Voice usage chart renders
- [ ] Timeline graph shows data
- [ ] Top students table displays
- [ ] Medals show for top 3 (🥇🥈🥉)
- [ ] No console errors

**Pass Criteria:** Analytics dashboard renders correctly

---

### ✅ Test 3.8: Device Detection
**Location:** Browser console

**Steps:**
1. Open browser console
2. Run detection tests:
   ```javascript
   import * as device from '@/lib/utils/device-detection'

   console.log('Mobile:', device.isMobileDevice())
   console.log('Tablet:', device.isTabletDevice())
   console.log('WebGL:', device.hasWebGLSupport())
   console.log('Tier:', device.getPerformanceTier())
   console.log('Settings:', device.getRecommendedQualitySettings())
   console.log('Enable:', device.shouldEnableTeacherVoice())
   ```

**Expected:**
- [ ] Mobile detection works
- [ ] Tablet detection works
- [ ] WebGL support detected
- [ ] Performance tier identified
- [ ] Quality settings recommended
- [ ] Enable flag is correct

**Pass Criteria:** Device detection accurate

---

### ✅ Test 3.9: FPS Monitoring
**Location:** Browser console

**Steps:**
1. Create FPS monitor:
   ```javascript
   const monitor = new FPSMonitor()
   monitor.onFPSUpdate((fps) => console.log('FPS:', fps))
   ```
2. Watch console for 10 seconds
3. Verify FPS updates

**Expected:**
- [ ] FPS updates every second
- [ ] FPS is reasonable (30-60)
- [ ] Callback fires correctly
- [ ] Can unsubscribe

**Pass Criteria:** FPS monitor works

---

## Integration Testing

### ✅ Test 4.1: Full Student Journey
**End-to-end test**

**Steps:**
1. Login as student
2. Navigate to game page
3. Start math activity
4. Click "Hablar con Profesor"
5. Ask question via voice
6. Listen to teacher response
7. Watch whiteboard animation
8. Ask follow-up question
9. Clear whiteboard
10. Exit teacher mode

**Expected:**
- [ ] All components work together
- [ ] State persists correctly
- [ ] No errors in console
- [ ] Smooth transitions
- [ ] Good user experience

**Pass Criteria:** Complete flow works seamlessly

---

### ✅ Test 4.2: Teacher Dashboard Integration
**Test teacher workflow**

**Steps:**
1. Login as teacher
2. Navigate to voice settings page
3. Configure settings for class
4. Save settings
5. Navigate to analytics page
6. View voice usage analytics
7. Filter by student
8. Export data (if implemented)

**Expected:**
- [ ] Settings save successfully
- [ ] Settings persist after refresh
- [ ] Analytics load correctly
- [ ] Filters work
- [ ] Data is accurate

**Pass Criteria:** Teacher dashboard works

---

## Performance Testing

### ✅ Test 5.1: Frame Rate
**3D scene performance**

**Steps:**
1. Open teacher interface
2. Enable Chrome DevTools
3. Go to Performance tab
4. Record for 10 seconds
5. Check FPS

**Expected:**
- [ ] Desktop: 60 FPS sustained
- [ ] Mobile: 30 FPS sustained
- [ ] No frame drops during animations
- [ ] No memory leaks

**Pass Criteria:** Maintains target FPS

---

### ✅ Test 5.2: Response Times
**API performance**

**Steps:**
1. Make voice conversation request
2. Check Network tab
3. Measure times

**Expected:**
- [ ] Cached TTS: <500ms
- [ ] New TTS: <3s
- [ ] Whisper STT: <2s (for 10s audio)
- [ ] ChatGPT: <2s

**Pass Criteria:** Response times acceptable

---

### ✅ Test 5.3: Memory Usage
**Check for memory leaks**

**Steps:**
1. Open Performance Monitor in DevTools
2. Interact with teacher for 5 minutes
3. Check memory usage
4. Look for memory leaks

**Expected:**
- [ ] Memory usage stable
- [ ] No continuous growth
- [ ] Garbage collection works
- [ ] No accumulating objects

**Pass Criteria:** No memory leaks detected

---

### ✅ Test 5.4: Mobile Performance
**Test on mobile device or emulation**

**Steps:**
1. Open on mobile device
2. Test teacher interface
3. Check performance

**Expected:**
- [ ] Features disabled if MOBILE_ENABLED=false
- [ ] Or: Reduced quality settings apply
- [ ] Still usable
- [ ] No crashes
- [ ] FPS acceptable (30+)

**Pass Criteria:** Mobile experience acceptable

---

## Error Handling

### ✅ Test 6.1: Microphone Permission Denied
**Steps:**
1. Block microphone permission
2. Click voice input button

**Expected:**
- [ ] Error message shows
- [ ] Graceful fallback
- [ ] Suggests using text input
- [ ] No crash

**Pass Criteria:** Handles denied permission

---

### ✅ Test 6.2: No Audio from Teacher
**Steps:**
1. Mute system volume
2. Ask teacher question

**Expected:**
- [ ] Lip-sync still works
- [ ] Animations still work
- [ ] Transcript visible
- [ ] No errors

**Pass Criteria:** Works without audio

---

### ✅ Test 6.3: OpenAI API Failure
**Steps:**
1. Temporarily use invalid API key
2. Try voice conversation

**Expected:**
- [ ] Error caught gracefully
- [ ] User sees error message
- [ ] Retry option available
- [ ] No crash

**Pass Criteria:** API errors handled

---

### ✅ Test 6.4: Network Disconnection
**Steps:**
1. Start conversation
2. Disconnect network mid-request
3. Observe behavior

**Expected:**
- [ ] Timeout handled
- [ ] Error message shown
- [ ] Can retry when reconnected
- [ ] No frozen UI

**Pass Criteria:** Network errors handled

---

### ✅ Test 6.5: Database Connection Failure
**Steps:**
1. Simulate DB unavailable
2. Try to save settings or fetch analytics

**Expected:**
- [ ] Error caught
- [ ] User notified
- [ ] Fallback to defaults if possible
- [ ] No crash

**Pass Criteria:** DB errors handled

---

### ✅ Test 6.6: Malformed Audio Input
**Steps:**
1. Send corrupted audio file
2. Check API response

**Expected:**
- [ ] Validation catches issue
- [ ] Returns 400 error
- [ ] Clear error message
- [ ] No server crash

**Pass Criteria:** Invalid input handled

---

## Browser Compatibility

### ✅ Test 7.1: Chrome
- [ ] All features work
- [ ] WebGL works
- [ ] Audio works
- [ ] Microphone works

### ✅ Test 7.2: Firefox
- [ ] All features work
- [ ] WebGL works
- [ ] Audio works
- [ ] Microphone works

### ✅ Test 7.3: Safari
- [ ] All features work
- [ ] WebGL works
- [ ] Audio works
- [ ] Microphone works
- [ ] Check iOS Safari specifically

### ✅ Test 7.4: Edge
- [ ] All features work
- [ ] WebGL works
- [ ] Audio works
- [ ] Microphone works

---

## Accessibility Testing

### ✅ Test 8.1: Keyboard Navigation
**Steps:**
1. Try navigating with Tab key
2. Try activating with Enter/Space

**Expected:**
- [ ] Can tab to all interactive elements
- [ ] Focus indicators visible
- [ ] Can activate buttons
- [ ] Logical tab order

**Pass Criteria:** Keyboard accessible

---

### ✅ Test 8.2: Screen Reader
**Steps:**
1. Enable screen reader
2. Navigate teacher interface

**Expected:**
- [ ] Buttons have labels
- [ ] Status announcements
- [ ] Conversation history readable
- [ ] Meaningful alt text

**Pass Criteria:** Screen reader compatible

---

### ✅ Test 8.3: High Contrast Mode
**Steps:**
1. Enable high contrast mode
2. Check visibility

**Expected:**
- [ ] Text readable
- [ ] Buttons visible
- [ ] Important info clear
- [ ] No invisible elements

**Pass Criteria:** Works in high contrast

---

## Security Testing

### ✅ Test 9.1: Authentication
**Steps:**
1. Try accessing APIs without login
2. Try accessing as wrong role

**Expected:**
- [ ] Returns 401 Unauthorized
- [ ] Returns 403 Forbidden for wrong role
- [ ] No data leaked
- [ ] Session validated

**Pass Criteria:** Auth enforced

---

### ✅ Test 9.2: Input Sanitization
**Steps:**
1. Try SQL injection in text input
2. Try XSS in text input

**Expected:**
- [ ] Input sanitized
- [ ] No SQL injection possible
- [ ] No XSS possible
- [ ] Safe to display

**Pass Criteria:** Inputs sanitized

---

### ✅ Test 9.3: API Rate Limiting
**Steps:**
1. Make many rapid API calls
2. Check if rate limited

**Expected:**
- [ ] Rate limiting applies
- [ ] Returns 429 Too Many Requests
- [ ] Prevents abuse
- [ ] Clears after time

**Pass Criteria:** Rate limiting works

---

## Data Integrity

### ✅ Test 10.1: Conversation History
**Steps:**
1. Have conversation
2. Check database
3. Verify data stored correctly

**Expected:**
- [ ] All interactions saved
- [ ] Timestamps correct
- [ ] Student/teacher linked
- [ ] Audio durations recorded

**Pass Criteria:** Data saved correctly

---

### ✅ Test 10.2: Cache Consistency
**Steps:**
1. Save to cache
2. Retrieve from cache
3. Compare audio

**Expected:**
- [ ] Cached audio identical
- [ ] Hash matches
- [ ] Times used increments
- [ ] Expiration set

**Pass Criteria:** Cache consistent

---

## Final Checklist

### Pre-Deployment
- [ ] All Phase 1 tests pass
- [ ] All Phase 2 tests pass
- [ ] All Phase 3 tests pass
- [ ] Integration tests pass
- [ ] Performance tests pass
- [ ] Error handling tests pass
- [ ] Browser compatibility verified
- [ ] Accessibility tested
- [ ] Security verified
- [ ] Data integrity confirmed

### Documentation
- [ ] README updated
- [ ] API docs complete
- [ ] User guide written
- [ ] Teacher guide written
- [ ] Troubleshooting guide ready

### Deployment
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Assets uploaded
- [ ] Build successful
- [ ] Smoke tests pass on production

---

## Test Results Summary

**Date:** ___________
**Tester:** ___________

| Phase | Tests Passed | Tests Failed | Notes |
|-------|-------------|--------------|-------|
| Phase 1 | __ / 7 | | |
| Phase 2 | __ / 7 | | |
| Phase 3 | __ / 9 | | |
| Integration | __ / 2 | | |
| Performance | __ / 4 | | |
| Error Handling | __ / 6 | | |
| Browser Compat | __ / 4 | | |
| Accessibility | __ / 3 | | |
| Security | __ / 3 | | |
| Data Integrity | __ / 2 | | |

**Total:** __ / 47 tests passed

---

## Critical Bugs Found

1. _________________
2. _________________
3. _________________

## Minor Issues Found

1. _________________
2. _________________
3. _________________

## Recommendations

1. _________________
2. _________________
3. _________________

---

**Testing Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete
**Ready for Production:** ⬜ No | ⏳ Pending Fixes | ✅ Yes
