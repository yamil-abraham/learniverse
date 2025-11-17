# Learniverse - Complete Analysis for v0 Redesign

**Document Version:** 1.0
**Date:** November 16, 2025
**Purpose:** Comprehensive codebase analysis to guide UI/UX redesign using Vercel's v0 AI design tool

---

## 1. PROJECT OVERVIEW

### Core Description
Learniverse is a gamified educational platform designed to teach mathematics to students aged 9-11 (grades 4-5) using 3D interactive experiences and AI-powered adaptive learning. This is a TFG (Trabajo Final de Grado) project for Engineering in Artificial Intelligence and Robotics (2025).

### Core Value Proposition
- **Gamified Learning:** Transform mathematics education into an engaging game with points, levels, and badges
- **3D Immersive Experience:** Interactive 3D teacher with voice conversation system (TTS/STT)
- **AI-Powered Adaptation:** OpenAI GPT-4o-mini provides personalized hints, feedback, and difficulty adjustment
- **Teacher Insights:** Comprehensive analytics dashboard for educators to monitor student progress

### Key Differentiators
1. **Voice-Interactive 3D Teacher:** Fully immersive classroom environment with lip-synced 3D teacher avatars (Mateo & Valentina)
2. **Adaptive AI System:** Real-time difficulty adjustment based on student performance patterns
3. **Bilingual Approach:** Code in English, UI in Spanish (target: Spanish-speaking students)
4. **Age-Appropriate Design:** Specifically tailored for 9-11 year-olds with playful, colorful UI
5. **Dual User System:** Separate experiences for students (gamified learning) and teachers (analytics dashboard)

### Target Demographics
- **Primary Users:** Students aged 9-11 (4th-5th grade)
- **Secondary Users:** Teachers/educators
- **Geography:** Spanish-speaking regions (UI/content in Spanish)
- **Technology Access:** Desktop and mobile devices (3D teacher disabled on mobile for performance)

### Current Deployment
- **Production URL:** https://learniverse.vercel.app
- **Platform:** Vercel (Next.js App Router)
- **Status:** All 6 project phases completed ✅

---

## 2. TECHNICAL ARCHITECTURE SUMMARY

### Architecture Pattern
- **Framework:** Next.js 14 App Router (React 18, TypeScript)
- **Rendering Strategy:**
  - SSR for auth pages, dashboards
  - CSR for 3D components (dynamic imports with `ssr: false`)
- **API Layer:** Serverless API routes (Next.js API Routes)
- **Database:** Vercel Postgres (SQL)

### Tech Stack Breakdown

#### Frontend
- **UI Framework:** React 18.3.1 with TypeScript 5.9.3
- **Styling:** Tailwind CSS 3.4.18 (custom theme with primary/secondary colors)
- **3D Graphics:**
  - Three.js 0.180.0
  - React Three Fiber 8.17.10
  - React Three Drei 9.114.3
- **State Management:** Zustand 5.0.8
- **Icons:** Lucide React 0.553.0
- **Charts:** Recharts 3.4.1 (teacher analytics)
- **Fonts:** Inter (Google Fonts, variable font)

#### Backend & Services
- **Database:** Vercel Postgres (@vercel/postgres 0.10.0)
- **Authentication:** NextAuth.js 4.24.13 (JWT strategy, 30-day expiration)
- **AI Services:** OpenAI 6.3.0 (GPT-4o-mini, TTS-1, Whisper)
- **Password Hashing:** bcryptjs 3.0.3
- **Validation:** Zod 4.1.12

#### Dev Tools
- **Type Checking:** TypeScript strict mode
- **Linting:** ESLint (disabled during builds due to version conflict)
- **Build Tool:** Next.js built-in (Webpack)

### Data Flow

#### Student Journey Flow
```
1. Login → NextAuth → Session (JWT)
2. Dashboard → Fetch stats (API: /api/stats/student)
3. Game Click → ImmersiveTeacher component
4. 3D Scene Loads → TeacherStore state management
5. Voice Input → OpenAI Whisper (STT)
6. AI Generates Question → OpenAI GPT-4o-mini
7. Student Answers → Submit to /api/activities/submit
8. AI Feedback → OpenAI GPT-4o-mini + TTS (audio response)
9. Update Progress → Database (student_attempts, learning_profile)
10. Gamification → Calculate points, badges, level
```

#### Teacher Journey Flow
```
1. Login → NextAuth → Session (JWT)
2. Dashboard → Fetch analytics (API: /api/teacher/*)
3. View Students → Zustand store + API queries
4. Filter/Search → Client-side state + API refetch
5. View Individual → API: /api/teacher/students/[id]
6. Generate Alerts → Automatic (API cron/triggers)
7. Export Reports → CSV generation (client-side)
```

### Authentication Approach
- **Provider:** NextAuth.js Credentials Provider
- **Strategy:** JWT (no database sessions)
- **Token Lifespan:** 30 days
- **Session Data:** User ID, email, name, role, studentId/teacherId, level, experience
- **Middleware Protection:**
  - Public: `/`, `/login`, `/register`, `/api/auth/*`, `/api/health`
  - Student-only: `/dashboard/student`, `/game`, `/avatar` (disabled)
  - Teacher-only: `/teacher/*`, `/dashboard/teacher`
- **Auto-redirect:** Authenticated users accessing `/`, `/login`, `/register` → role-based dashboard

### State Management Strategy

#### Zustand Stores
1. **`stores/gameStore.ts`** - Game session state (NOT CRITICAL - Legacy, may not be used)
2. **`stores/avatarStore.ts`** - Avatar customization (NOT CRITICAL - Feature disabled)
3. **`stores/teacherStore.ts`** - 3D teacher state (voice, messages, loading, classroom/teacher selection)
4. **`store/use-teacher-dashboard.ts`** - Teacher dashboard data (stats, students, classes, alerts, filters)

#### State Patterns
- **Local State:** React `useState` for form inputs, UI toggles
- **Server State:** Direct API calls with loading states (no React Query)
- **Global UI State:** Zustand for cross-component needs
- **3D State:** Zustand + R3F hooks (useFrame, useThree)

---

## 3. COMPLETE ROUTE INVENTORY

### Route: `/` (Landing Page)
**File:** `app/page.tsx`

**Purpose:** Public landing page introducing Learniverse

**User Roles:** Public (unauthenticated users)

**Page Type:** Marketing/Landing

**Current Components:**
- No custom components (pure JSX)
- Gradient background (blue → purple → pink)
- Two info cards (Students, Teachers)
- Two CTA buttons (Login, Register)

**Key Features:**
- Introduces platform value proposition
- Separate messaging for students vs teachers
- Footer with tech stack mention

**User Interactions:**
- Click "Iniciar Sesión" → `/login`
- Click "Registrarse" → `/register`

**Data Displayed:**
- Static marketing copy (Spanish)
- Platform description

**UI/UX Considerations:**
- [MOBILE] Large gradient background may not display well on small screens
- [ACCESSIBILITY] No skip-to-content link
- [DESIGN] Generic gradient background (lacks personality)
- Very basic landing page, no imagery or screenshots

**API Integrations:** None

**Assets Used:**
- None (emoji-based icons: 🚀, 🎮, etc.)

**Priority for Redesign:** **HIGH** - First impression, needs compelling visual design

---

### Route: `/login` (Login Page)
**File:** `app/login/page.tsx`

**Purpose:** User authentication (students + teachers)

**User Roles:** Public (unauthenticated)

**Page Type:** Authentication

**Current Components:**
- `components/auth/LoginForm.tsx`

**LoginForm Component Details:**
- Email + password fields
- Client-side validation (email regex, required fields)
- NextAuth signIn with credentials provider
- Error handling (displays error messages)
- Loading state (spinner during auth)
- Link to register page

**Key Features:**
- Form validation
- Error messaging
- Loading spinner
- Auto-redirect to dashboard on success

**User Interactions:**
- Enter email/password
- Submit form
- Click "Registrarse aquí" link

**Data Displayed:**
- Form inputs
- Error messages
- Loading states

**UI/UX Considerations:**
- [MOBILE] Form should be touch-friendly for tablets (teachers may use tablets)
- [ACCESSIBILITY] Proper labels and ARIA attributes ✅
- [DESIGN] Generic white card on gradient background
- [UX] No "forgot password" feature (out of scope)
- [UX] No social login options

**API Integrations:**
- `POST /api/auth/callback/credentials` (NextAuth)

**Assets Used:** None

**Priority for Redesign:** **MEDIUM** - Functional but generic, could be more inviting

---

### Route: `/register` (Registration Page)
**File:** `app/register/page.tsx`

**Purpose:** Create new user account (student or teacher)

**User Roles:** Public (unauthenticated)

**Page Type:** Authentication

**Current Components:**
- `components/auth/RegisterForm.tsx`

**RegisterForm Component Details:**
- Name, email, password, confirm password fields
- Role selector (student/teacher)
- Conditional fields:
  - Student: Grade selector (4th or 5th)
  - Teacher: School name (optional)
- Client-side validation (password match, email format, grade range)
- Success message + auto-redirect to login

**Key Features:**
- Role-based form fields
- Comprehensive validation
- Success feedback
- Graceful error handling

**User Interactions:**
- Fill form with personal data
- Select role (student/teacher)
- Select grade (if student)
- Submit registration
- Auto-redirect to login after 2 seconds

**Data Displayed:**
- Form inputs
- Error/success messages
- Role-specific fields

**UI/UX Considerations:**
- [MOBILE] Long form on mobile (consider multi-step)
- [ACCESSIBILITY] Good labels ✅
- [UX] Password requirements not clearly stated (minimum 6 chars)
- [DESIGN] Same generic white card design as login
- [CHILDREN] Grade selector uses dropdown (good for age group)

**API Integrations:**
- `POST /api/auth/register`

**Assets Used:** None

**Priority for Redesign:** **MEDIUM** - Functional, could be friendlier for children

---

### Route: `/dashboard/student` (Student Dashboard)
**File:** `app/dashboard/student/page.tsx`

**Purpose:** Main hub for students after login

**User Roles:** Students only

**Page Type:** Dashboard (playful, gamified)

**Current Components:**
- Custom JSX (no extracted components)
- Uses session data directly

**Key Features:**
1. **Welcome Banner:** Personalized greeting with student name
2. **AI Recommendation Card:** Shows recommended activity based on performance
3. **Stats Grid:**
   - Level (with XP progress bar)
   - Total Experience
   - Activities completed today
4. **Giant "Play" Button:** Main CTA to start game
5. **My Classes Section:** Displays enrolled classes
6. **Motivational Footer:** Encouragement message

**User Interactions:**
- View stats (passive)
- Click recommended activity → `/game?type=X&difficulty=Y&recommended=true`
- Click giant play button → `/game`
- Logout button

**Data Displayed:**
- Student name, level, experience
- AI recommendation (activity type, difficulty, reason, confidence)
- Classes enrolled in (name, description, grade, student count)
- Stats: level, XP, activities completed

**UI/UX Considerations:**
- [EXCELLENT] Very playful design with emojis, bright colors, bouncing animations
- [CHILDREN] Age-appropriate language and visuals
- [MOBILE] Responsive grid layout
- [GAMIFICATION] Clear progression indicators (XP bar, level)
- [ACCESSIBILITY] Missing semantic HTML (div-heavy)
- [PERFORMANCE] Decorative bouncing elements (CSS animations)
- [DESIGN] Inline styles for animations (not ideal)

**API Integrations:**
- `POST /api/ai/recommend-activity` (AI recommendation)
- `GET /api/student/classes` (enrolled classes)

**Assets Used:**
- Emojis as icons: 🚀, 🎉, 🌟, 🏆, ⭐, 🎯, 🎮, 🏫, ✨, 💪

**Priority for Redesign:** **MEDIUM** - Already playful and engaging, but could benefit from v0's component library

---

### Route: `/game` (Immersive 3D Teacher Game)
**File:** `app/game/page.tsx`

**Purpose:** Main learning experience with 3D teacher and voice interaction

**User Roles:** Students only

**Page Type:** Interactive 3D Game (Fullscreen)

**Current Components:**
- `components/game/ImmersiveTeacher.tsx` (dynamic import, ssr: false)

**ImmersiveTeacher Component Structure:**
```tsx
<div className="fixed inset-0"> {/* Fullscreen */}
  <button>Close Button</button>

  <Canvas> {/* R3F Canvas */}
    <MathExperience /> {/* 3D Scene */}
  </Canvas>

  <TypingBox /> {/* HTML Overlay - Answer Input */}

  <Loader /> {/* R3F Drei Loader */}
</div>
```

**MathExperience Component (3D Scene):**
- CameraManager (zoom control based on teacher state)
- Blackboard (HTML in 3D space - MathBlackboard component)
- SceneSettings (UI controls in 3D space)
- Environment (sunset lighting)
- Classroom 3D model (classroom1.glb or classroom2.glb)
- MathTeacher 3D model (with animations, lip-sync)

**Key Features:**
1. **3D Classroom:** Immersive environment with realistic models
2. **3D Teacher:** Animated character (Mateo or Valentina) with lip-sync
3. **Voice Input:** Speech-to-text for student answers
4. **Voice Output:** Text-to-speech for teacher feedback
5. **Blackboard:** Displays math problems and visualizations
6. **Camera Control:** Zooms in on teacher/blackboard based on interaction
7. **Typing Input:** Alternative to voice (bottom overlay)
8. **Scene Customization:** Switch teacher/classroom

**User Interactions:**
- Speak answer (voice input)
- Type answer (text input)
- Listen to teacher (audio output)
- Watch teacher animations
- View blackboard content
- Close to return to dashboard

**Data Displayed:**
- Math problem (on blackboard)
- Teacher avatar (3D model)
- Classroom environment (3D model)
- Student name (on blackboard)
- Answer input box

**UI/UX Considerations:**
- **[CRITICAL]** Must maintain 3D functionality - DO NOT SIMPLIFY
- [PERFORMANCE] Heavy 3D rendering (disabled on mobile by default)
- [ACCESSIBILITY] Voice controls may not work for all users (typing alternative exists)
- [MOBILE] Not optimized for mobile (small screens, performance issues)
- [IMMERSION] Fullscreen design maximizes engagement
- [AUDIO] Requires microphone permission (may be denied)
- [3D MODELS] Requires .glb file loading (network-dependent)

**API Integrations:**
- `POST /api/ai/generate-exercise` (get math problem)
- `POST /api/activities/submit` (submit answer)
- `POST /api/ai/feedback` (get AI feedback)
- OpenAI TTS API (text-to-speech)
- OpenAI Whisper API (speech-to-text)

**Assets Used:**
- `/models/environments/classroom1.glb`
- `/models/environments/classroom2.glb`
- `/models/teachers/teacher1.glb` (implied)
- `/models/teachers/teacher2.glb` (implied)
- `/animations/animations_Mateo.glb`
- `/animations/animations_Valentina.glb`
- `/images/Mateo.jpg`
- `/images/Valentina.jpg`

**Priority for Redesign:** **LOW** - Core feature, highly custom, DO NOT REDESIGN THE 3D SCENE. Only overlay UI elements could be redesigned.

---

### Route: `/avatar` (Avatar Customization - DISABLED)
**File:** `app/avatar/page.tsx`

**Purpose:** Avatar customization (FEATURE REMOVED)

**User Roles:** Students (but redirects)

**Page Type:** Redirect page

**Current Components:** None (just redirect logic)

**Key Features:**
- Immediately redirects to `/dashboard/student`

**UI/UX Considerations:**
- [TODO] Could be removed entirely or show "Coming Soon" message

**API Integrations:** None

**Assets Used:** None

**Priority for Redesign:** **NONE** - Feature disabled, consider removing route

---

### Route: `/dashboard/teacher` (Teacher Dashboard Redirect)
**File:** `app/dashboard/teacher/page.tsx`

**Purpose:** Redirect to main teacher dashboard

**User Roles:** Teachers only

**Page Type:** Redirect page

**Current Components:** None (redirect logic)

**Key Features:**
- Redirects to `/teacher` (actual dashboard)

**Priority for Redesign:** **NONE** - Just a redirect, can keep or remove

---

### Route: `/teacher` (Main Teacher Dashboard)
**File:** `app/teacher/page.tsx`

**Purpose:** Teacher's main analytics and management hub

**User Roles:** Teachers only

**Page Type:** Dashboard (professional, data-focused)

**Current Components:**
- `components/teacher/DashboardCard.tsx`
- `components/teacher/StudentCard.tsx`
- `components/teacher/AlertBadge.tsx`
- Icons from `lucide-react`

**Key Features:**
1. **Top Navigation Bar:**
   - Logo + title
   - "Nuevo Estudiante" button
   - "Nueva Tarea" button

2. **Quick Stats Banner (Gradient):**
   - Total students
   - Active today
   - Average performance
   - Pending alerts

3. **Detailed Stats Grid (4 Cards):**
   - Total Students (clickable → `/teacher/students`)
   - Activities Today (clickable → `/teacher/analytics`)
   - Active Classes (clickable → `/teacher/classes`)
   - Unread Alerts (clickable → `/teacher/alerts`)

4. **Performance Overview:**
   - Average class performance (progress bar)
   - Activities completed today
   - Students needing attention

5. **Recent Alerts List:**
   - Last 5 alerts
   - Click to view all

6. **Students Needing Attention:**
   - Grid of student cards (struggling students)
   - Click to view student detail

7. **Quick Actions Grid:**
   - New Class
   - New Assignment
   - View Analytics

**User Interactions:**
- Click stat cards to navigate
- Click student cards to view detail
- Create new student/assignment
- View alerts

**Data Displayed:**
- Dashboard stats (TeacherDashboardStats)
- Student summaries (StudentSummary[])
- Alerts (TeacherAlert[])

**UI/UX Considerations:**
- [PROFESSIONAL] Clean, modern design for teachers
- [DATA DENSITY] Lots of information on one page
- [MOBILE] Responsive grid (collapses to single column)
- [DARK MODE] Supports dark mode (dark: classes)
- [NAVIGATION] Sticky top bar
- [ICONS] Consistent icon usage (Lucide React)
- [COLOR CODING] Performance indicators (green/red)

**API Integrations:**
- `GET /api/teacher/stats` (dashboard stats)
- `GET /api/teacher/students?performanceLevel=struggling`
- `GET /api/teacher/alerts?unreadOnly=true`

**Assets Used:**
- Lucide React icons (Users, UserCheck, GraduationCap, AlertCircle, TrendingUp, Calendar, Plus, ArrowRight)

**Priority for Redesign:** **HIGH** - Complex dashboard, would benefit from v0's clean component design

---

### Route: `/teacher/students` (Student List)
**File:** `app/teacher/students/page.tsx`

**Purpose:** View and manage all students with filtering

**User Roles:** Teachers only

**Page Type:** Data Table

**Current Components:**
- `components/teacher/DataTable.tsx`
- `components/teacher/PerformanceBadge.tsx`
- Lucide React icons

**Key Features:**
1. **Header:**
   - Title + count
   - Filter toggle button (with active count)

2. **Filters Panel (Collapsible):**
   - Search by name
   - Filter by class
   - Filter by performance level (excelling/average/struggling)
   - Apply/Clear buttons

3. **Data Table:**
   - Columns: Student, Level, Performance, Attempts, Last Activity, Status
   - Sortable columns
   - Click row to view detail
   - Visual indicator for students needing attention (red left border)

**User Interactions:**
- Toggle filter panel
- Search/filter students
- Sort by column
- Click student to view detail

**Data Displayed:**
- Student summaries (StudentSummary[])
- Performance badges (color-coded by success rate)
- Last active (relative time)
- Status badges (needs attention / on track)

**UI/UX Considerations:**
- [TABLE] Clean data table design
- [FILTERING] Good UX for filtering large lists
- [MOBILE] Table may overflow on small screens (needs horizontal scroll)
- [VISUAL HIERARCHY] Red border for struggling students (good)
- [SEARCH] Enter key triggers search (good UX)

**API Integrations:**
- `GET /api/teacher/students?classId=X&performanceLevel=Y&searchQuery=Z`
- `GET /api/teacher/classes` (for filter dropdown)

**Assets Used:**
- Lucide icons (Search, Filter, X, Users)

**Priority for Redesign:** **HIGH** - Complex table UI, v0 could create better responsive design

---

### Route: `/teacher/students/[studentId]` (Student Detail)
**File:** `app/teacher/students/[studentId]/page.tsx`

**Purpose:** Detailed analytics for individual student

**User Roles:** Teachers only

**Page Type:** Detail Page (NOT ANALYZED YET - FILE NOT READ)

**Priority for Redesign:** **MEDIUM** - Detail pages benefit from clean layouts

---

### Route: `/teacher/classes` (Class List)
**File:** `app/teacher/classes/page.tsx`

**Purpose:** View and manage all classes

**User Roles:** Teachers only

**Page Type:** Data Table

**Current Components:**
- `components/teacher/DataTable.tsx`
- Lucide icons

**Key Features:**
1. **Header:**
   - Title + count
   - "Nueva Clase" button

2. **Data Table:**
   - Columns: Name, Grade, School Year, Students, Status, Created
   - Click row to view class detail
   - Shows description as subtitle

3. **Empty State:**
   - Shown when no classes exist
   - CTA to create first class

4. **Quick Stats (3 Cards):**
   - Active classes
   - Total students
   - Average students per class

**User Interactions:**
- Create new class
- Click class to view detail
- View stats

**Data Displayed:**
- Class list (Class[])
- Student counts
- Active/inactive status
- Creation dates

**UI/UX Considerations:**
- [EMPTY STATE] Good empty state design
- [STATS] Helpful summary statistics
- [TABLE] Clean table layout
- [MOBILE] Responsive grid for stats

**API Integrations:**
- `GET /api/teacher/classes`

**Assets Used:**
- Lucide icons (Plus, Users, GraduationCap, TrendingUp)

**Priority for Redesign:** **MEDIUM** - Table could be improved, stats cards could be more visual

---

### Route: `/teacher/classes/new` (Create Class)
**File:** `app/teacher/classes/new/page.tsx`

**Purpose:** Create new class

**User Roles:** Teachers only

**Page Type:** Form (NOT ANALYZED YET - FILE NOT READ)

**Priority for Redesign:** **MEDIUM** - Forms benefit from v0's clean design

---

### Route: `/teacher/alerts` (Alerts List)
**File:** `app/teacher/alerts/page.tsx`

**Purpose:** View and manage teacher alerts/notifications

**User Roles:** Teachers only

**Page Type:** List/Feed

**Current Components:**
- `components/teacher/AlertBadge.tsx`
- Lucide icons

**Key Features:**
1. **Header:**
   - Unread count + total count
   - "Mark All as Read" button (if unread exist)

2. **Filters:**
   - All / Unread toggle buttons
   - Severity dropdown (all/high/medium/low)

3. **Alerts List:**
   - Alert cards with:
     - Severity badge
     - "Nueva" badge if unread
     - Title + message
     - Student name
     - Timestamp
     - "Mark Read" button
     - "View Student" button
   - Visual distinction (unread = shadow + border, read = faded)

4. **Empty State:**
   - Different messages for "all" vs "unread" filters

**User Interactions:**
- Toggle filter (all/unread)
- Filter by severity
- Mark individual alert as read
- Mark all as read
- View related student

**Data Displayed:**
- Alerts (TeacherAlert[])
- Unread count
- Severity levels
- Timestamps (formatted)

**UI/UX Considerations:**
- [NOTIFICATIONS] Good notification center design
- [FILTERING] Easy filtering options
- [VISUAL STATES] Clear unread vs read distinction
- [ACTIONS] Clear CTAs for each alert
- [MOBILE] Cards stack well on mobile

**API Integrations:**
- `GET /api/teacher/alerts?unreadOnly=true/false`
- `PATCH /api/teacher/alerts/[alertId]` (mark as read)
- `PATCH /api/teacher/alerts` (mark all as read)

**Assets Used:**
- Lucide icons (Bell, BellOff, Check, CheckCheck, Filter)

**Priority for Redesign:** **MEDIUM** - Clean design already, could enhance visual hierarchy

---

### Route: `/teacher/assignments` (Assignments List)
**File:** `app/teacher/assignments/page.tsx` (NOT ANALYZED - FILE NOT READ)

**Purpose:** View and manage homework assignments

**User Roles:** Teachers only

**Page Type:** Data Table/List

**Priority for Redesign:** **MEDIUM**

---

### Route: `/teacher/assignments/new` (Create Assignment)
**File:** `app/teacher/assignments/new/page.tsx` (NOT ANALYZED - FILE NOT READ)

**Purpose:** Create new assignment

**User Roles:** Teachers only

**Page Type:** Form

**Priority for Redesign:** **MEDIUM**

---

## 4. COMPONENT HIERARCHY

### Authentication Components (`components/auth/`)

```
auth/
├── LoginForm.tsx
│   ├── Styling: Tailwind (white card, blue buttons)
│   ├── Functionality: Email/password validation, NextAuth integration
│   ├── Reusability: 8/10 (could extract form field components)
│   └── State: Local useState for form + error + loading
│
└── RegisterForm.tsx
    ├── Styling: Tailwind (white card, conditional fields)
    ├── Functionality: Multi-role registration, validation
    ├── Reusability: 7/10 (tightly coupled to registration flow)
    └── State: Local useState for formData + error + success
```

### 3D Components (`components/3d/`)

```
3d/
├── Avatar.tsx (LEGACY - May not be used)
│   └── Note: Avatar customization disabled
│
├── MainScene.tsx (LEGACY - May not be used)
│   └── Note: Old 3D scene, replaced by game/teacher system
│
├── Environment.tsx
│   ├── Styling: R3F components (no CSS)
│   ├── Functionality: Lighting and environment setup
│   └── Reusability: 10/10 (pure R3F component)
│
├── ErrorFallback.tsx
│   ├── Styling: Tailwind
│   ├── Functionality: 3D error boundary UI
│   └── Reusability: 9/10 (generic error component)
│
├── Loader.tsx
│   ├── Styling: R3F Drei (built-in loader)
│   ├── Functionality: Loading indicator for 3D assets
│   └── Reusability: 10/10 (pure Drei component)
│
├── RotatingCube.tsx (LEGACY - Likely unused)
│   └── Note: Demo/test component
│
└── Scene3D.tsx (LEGACY - Likely unused)
    └── Note: Old scene setup
```

### 3D Game Components (`components/3d/game/`)

```
3d/game/
├── MathExperience.tsx
│   ├── Styling: R3F + HTML transforms
│   ├── Functionality: Main 3D scene orchestration, camera management
│   ├── Reusability: 3/10 (highly specific to Learniverse)
│   └── State: Zustand teacherStore
│
├── MathTeacher.tsx
│   ├── Styling: R3F (3D model)
│   ├── Functionality: Animated 3D teacher with lip-sync
│   ├── Reusability: 5/10 (teacher-specific but could be abstracted)
│   └── Dependencies: GLB models, animation files
│
├── MathBlackboard.tsx
│   ├── Styling: Tailwind (HTML in 3D space)
│   ├── Functionality: Display math problems, student name
│   ├── Reusability: 6/10 (blackboard concept reusable)
│   └── Note: Uses HTML transformed into 3D
│
├── GameControls.tsx
│   ├── Styling: Tailwind
│   ├── Functionality: UI controls for game settings
│   └── Reusability: 7/10 (game-specific but pattern reusable)
│
├── SceneSettings.tsx
│   ├── Styling: Tailwind
│   ├── Functionality: Teacher/classroom switcher
│   ├── Reusability: 8/10 (settings panel pattern)
│   └── State: Zustand teacherStore
│
└── TypingBox.tsx
    ├── Styling: Tailwind (overlay component)
    ├── Functionality: Text input for answers
    ├── Reusability: 8/10 (input box pattern)
    └── State: Local useState + teacherStore
```

### Game/Teacher Components (`components/game/` & `components/game/teacher/`)

```
game/
├── ImmersiveTeacher.tsx
│   ├── Styling: Tailwind (fullscreen container)
│   ├── Functionality: Wrapper for 3D canvas + overlays
│   ├── Reusability: 5/10 (specific to immersive game)
│   └── Dependencies: R3F Canvas, MathExperience
│
└── teacher/
    ├── TeacherOverlay.tsx (NOT ANALYZED - assumed to exist)
    ├── VoiceInput.tsx (NOT ANALYZED - assumed to exist)
    ├── Classroom.tsx (NOT ANALYZED - may be unused)
    ├── MathVisualizer.tsx (NOT ANALYZED)
    ├── TeacherContainer.tsx (NOT ANALYZED)
    ├── Teacher3D.tsx (NOT ANALYZED)
    ├── TeacherScene.tsx (NOT ANALYZED)
    ├── TeacherSelector.tsx (NOT ANALYZED)
    └── Whiteboard.tsx (NOT ANALYZED)
```

### Teacher Dashboard Components (`components/teacher/`)

```
teacher/
├── DashboardCard.tsx
│   ├── Styling: Tailwind (card component)
│   ├── Functionality: Stat card with icon, value, label
│   ├── Reusability: 10/10 (pure presentational)
│   └── Props: title, value, icon, onClick
│
├── StudentCard.tsx
│   ├── Styling: Tailwind (student info card)
│   ├── Functionality: Display student summary with performance
│   ├── Reusability: 8/10 (student-specific but clear interface)
│   └── Props: StudentSummary, onClick
│
├── AlertBadge.tsx
│   ├── Styling: Tailwind (badge component with colors)
│   ├── Functionality: Severity indicator (low/medium/high)
│   ├── Reusability: 10/10 (generic badge)
│   └── Props: severity, size
│
├── PerformanceBadge.tsx
│   ├── Styling: Tailwind (colored badge based on success rate)
│   ├── Functionality: Visual performance indicator
│   ├── Reusability: 9/10 (could be used for any percentage)
│   └── Props: successRate, size
│
├── DataTable.tsx
│   ├── Styling: Tailwind (table component)
│   ├── Functionality: Generic data table with sorting, custom renderers
│   ├── Reusability: 10/10 (excellent abstraction)
│   └── Props: data[], columns[], loading, onRowClick, emptyMessage
│
├── VoiceSettings.tsx (NOT ANALYZED)
│   └── Purpose: Voice/speech configuration
│
└── analytics/
    └── VoiceAnalytics.tsx (NOT ANALYZED)
        └── Purpose: Analytics for voice interactions
```

### Avatar Components (`components/avatar/`) - DISABLED FEATURE

```
avatar/ (LEGACY - Feature disabled)
├── AvatarCustomizer.tsx
├── ColorPicker.tsx
├── StyleSelector.tsx
└── ToggleSwitch.tsx
```

### UI Components (`components/ui/`)

```
ui/
├── LoadingSpinner.tsx
│   ├── Styling: Tailwind (spinning animation)
│   ├── Functionality: Loading indicator
│   └── Reusability: 10/10 (pure UI)
│
└── ErrorMessage.tsx
    ├── Styling: Tailwind (error alert box)
    ├── Functionality: Display error messages
    └── Reusability: 10/10 (pure UI)
```

### Provider Components (`components/providers/`)

```
providers/
└── SessionProvider.tsx
    ├── Styling: None (wrapper component)
    ├── Functionality: NextAuth SessionProvider wrapper
    └── Reusability: 10/10 (standard pattern)
```

### Component Reusability Analysis

**Highly Reusable (9-10/10):**
- DataTable, AlertBadge, PerformanceBadge, LoadingSpinner, ErrorMessage, DashboardCard
- **Recommendation:** Keep as-is or enhance with v0

**Moderately Reusable (6-8/10):**
- StudentCard, LoginForm, SceneSettings, TypingBox
- **Recommendation:** Extract common patterns, create variants

**Specific/Custom (3-5/10):**
- MathExperience, ImmersiveTeacher, MathTeacher, MathBlackboard
- **Recommendation:** DO NOT redesign, these are core 3D features

**Legacy/Unused (0-2/10):**
- Avatar components, old 3D components
- **Recommendation:** Remove or archive

---

## 5. DESIGN SYSTEM AUDIT

### Color Palette

#### Brand Colors (Tailwind Config)
```typescript
primary: {
  50: '#f0f9ff',   // Very light sky blue
  100: '#e0f2fe',  // Light sky blue
  200: '#bae6fd',  // Sky blue
  300: '#7dd3fc',  // Light blue
  400: '#38bdf8',  // Medium blue
  500: '#0ea5e9',  // Primary blue (brand color)
  600: '#0284c7',  // Dark blue
  700: '#0369a1',  // Darker blue
  800: '#075985',  // Very dark blue
  900: '#0c4a6e',  // Navy blue
}

secondary: {
  50: '#fdf4ff',   // Very light purple
  100: '#fae8ff',  // Light purple
  200: '#f5d0fe',  // Lavender
  300: '#f0abfc',  // Light pink-purple
  400: '#e879f9',  // Medium purple
  500: '#d946ef',  // Primary purple (brand color)
  600: '#c026d3',  // Dark purple
  700: '#a21caf',  // Darker purple
  800: '#86198f',  // Very dark purple
  900: '#701a75',  // Deep purple
}
```

#### Usage Patterns in Codebase

**Student UI (Playful):**
- Gradients: `blue-400 → purple-400 → pink-400`, `blue-500 → purple-500 → pink-500`
- Card backgrounds: `yellow-400 → orange-500`, `purple-500 → pink-500`, `green-400 → cyan-500`
- Accent colors: Yellow (400), Orange (400), Pink (500), Green (400), Cyan (500)

**Teacher UI (Professional):**
- Primary actions: `indigo-600` (buttons, badges)
- Backgrounds: `slate-50` (light), `slate-950` (dark)
- Borders: `slate-200` / `slate-700` (dark mode)
- Success: `green-100` / `green-600`
- Warning: `amber-100` / `amber-600`
- Error: `red-100` / `red-600`
- Text: `slate-900` / `white` (dark mode)

**Semantic Colors:**
- Success: Green palette (`green-100`, `green-600`, `green-800`)
- Warning: Amber palette (`amber-100`, `amber-600`, `amber-800`)
- Error: Red palette (`red-100`, `red-600`, `red-800`)
- Info: Blue/Indigo palette

### Typography

**Font Family:**
```typescript
fontFamily: {
  sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
}
```

**Font Loading:**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
```

**Text Scales (Used in Codebase):**
- Hero: `text-5xl` (48px) - Used for main headings
- H1: `text-3xl` (30px), `text-4xl` (36px) - Page titles
- H2: `text-2xl` (24px) - Section headers
- H3: `text-xl` (20px), `text-lg` (18px) - Subsections
- Body: `text-base` (16px) - Default text
- Small: `text-sm` (14px) - Secondary text
- XSmall: `text-xs` (12px) - Labels, metadata

**Font Weights:**
- `font-black` (900) - Used for playful student UI headings
- `font-bold` (700) - Used for emphasis, buttons, labels
- `font-semibold` (600) - Used for table headers, subheadings
- `font-medium` (500) - Used for regular emphasis
- `font-normal` (400) - Default body text

**Language Note:** All UI text is in Spanish (target audience)

### Spacing Scale

**Standard Tailwind Spacing:**
- Uses default Tailwind spacing scale (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, etc.)
- No custom spacing extensions in config

**Common Spacing Patterns:**
- Card padding: `p-6` (24px), `p-8` (32px)
- Section spacing: `mb-8` (32px), `mt-8` (32px)
- Grid gaps: `gap-4` (16px), `gap-6` (24px)
- Button padding: `px-4 py-2` (horizontal 16px, vertical 8px)

### Component Variants

**Button Variants (Pattern Analysis):**

1. **Primary (Student):**
   ```tsx
   className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500
              hover:from-green-500 hover:via-emerald-600 hover:to-teal-600
              text-white font-bold py-4 px-8 rounded-xl shadow-lg
              transform hover:scale-105 transition-all duration-300"
   ```

2. **Primary (Teacher):**
   ```tsx
   className="bg-indigo-600 hover:bg-indigo-700 text-white
              font-medium px-4 py-2 rounded-lg transition-colors"
   ```

3. **Secondary:**
   ```tsx
   className="border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
              hover:bg-slate-50 dark:hover:bg-slate-700
              px-4 py-2 rounded-lg transition-colors"
   ```

4. **Danger:**
   ```tsx
   className="bg-red-600 hover:bg-red-700 text-white
              px-4 py-2 rounded-lg transition-colors"
   ```

**Card Variants:**

1. **Student Card (Playful):**
   ```tsx
   className="relative bg-gradient-to-br from-yellow-400 to-orange-500
              rounded-2xl shadow-2xl p-6 overflow-hidden
              transform hover:scale-105 transition-all"
   ```

2. **Teacher Card (Professional):**
   ```tsx
   className="rounded-lg border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-900 p-6 hover:shadow-md transition-all"
   ```

3. **Data Card:**
   ```tsx
   className="rounded-lg border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-900 p-5"
   ```

**Badge Variants (PerformanceBadge):**
- Excellent (≥80%): Green background
- Good (60-79%): Blue/Cyan background
- Average (40-59%): Yellow/Amber background
- Poor (<40%): Red background

**Input Variants:**
```tsx
className="shadow appearance-none border rounded w-full py-2 px-3
           text-gray-700 leading-tight focus:outline-none
           focus:ring-2 focus:ring-blue-500"
```

### Animation Patterns

**Transitions:**
```css
transition-all
transition-colors
transition-transform
duration-200
duration-300
duration-500
duration-1000
```

**Transforms:**
```css
hover:scale-105
hover:scale-110
transform hover:rotate-12
```

**CSS Animations (Student Dashboard):**
```tsx
// Bouncing decorative elements
<div className="animate-bounce"
     style={{ animationDelay: '0s', animationDuration: '3s' }} />
```

**3D Animations:**
- R3F `useFrame` for continuous animation
- Lip-sync animations for teacher (viseme-based)
- Camera zoom transitions (CameraControls)
- Float component from Drei (floating effect)

### 3D Visual Style

**Classroom Aesthetic:**
- Sunset lighting (Environment preset="sunset")
- Ambient pink light (intensity: 0.8)
- Realistic 3D models (GLB format)
- Floating animation (subtle, slow)

**Teacher Models:**
- Two characters: Mateo (male), Valentina (female)
- Cartoon-like, friendly design (age-appropriate)
- Lip-sync animations
- Idle animations

**Camera:**
- FOV: 42 degrees
- Position: Varies based on state (default, loading, speaking)
- Zoom range: 1x to 3x
- Reversed controls for natural feel

---

## 6. USER FLOWS

### Student Onboarding Flow

```
1. Visit Landing Page (/)
   ↓
2. Click "Registrarse"
   ↓
3. Fill Registration Form
   - Name
   - Email
   - Password (min 6 chars)
   - Confirm password
   - Select role: "Estudiante"
   - Select grade: 4º or 5º
   ↓
4. Submit → POST /api/auth/register
   ↓
5. Success message (2 seconds)
   ↓
6. Auto-redirect to /login
   ↓
7. Enter email + password
   ↓
8. Submit → NextAuth signIn
   ↓
9. Middleware intercepts
   ↓
10. Redirect to /dashboard/student
    ↓
11. View Dashboard:
    - See level, XP, stats
    - AI recommendation loaded
    - Classes displayed
    ↓
12. Click "¡A JUGAR!" button
    ↓
13. Navigate to /game
    ↓
14. 3D Scene loads:
    - Classroom appears
    - Teacher avatar loads
    - Blackboard displays
    ↓
15. Teacher greets student (voice)
    ↓
16. Math problem appears on blackboard
    ↓
17. Student answers (voice or typing)
    ↓
18. AI evaluates answer
    ↓
19. Teacher provides feedback (voice)
    ↓
20. Points/XP awarded
    ↓
21. Next question or return to dashboard
```

**Pain Points:**
- No onboarding tutorial
- 3D game may be intimidating on first launch
- No explanation of how to use voice controls
- Microphone permission might be denied

**Opportunities:**
- Add welcome modal on first login
- Add tooltips for 3D controls
- Add practice mode (low stakes)

### Teacher Registration Flow

```
1. Visit Landing Page (/)
   ↓
2. Click "Registrarse"
   ↓
3. Fill Registration Form
   - Name
   - Email
   - Password
   - Confirm password
   - Select role: "Profesor/a"
   - School name (optional)
   ↓
4. Submit → POST /api/auth/register
   ↓
5. Success → Auto-redirect to /login
   ↓
6. Enter credentials
   ↓
7. Middleware redirects to /teacher
   ↓
8. View Empty Dashboard:
   - 0 students
   - 0 classes
   - 0 alerts
   ↓
9. Click "Nueva Clase"
   ↓
10. Fill class form (name, grade, etc.)
    ↓
11. Submit → Class created
    ↓
12. Click "Nuevo Estudiante"
    ↓
13. Register student or link existing
    ↓
14. Dashboard populates with data
    ↓
15. Students start using platform
    ↓
16. Alerts appear automatically
    ↓
17. View analytics and reports
```

**Pain Points:**
- No guided setup wizard
- Teacher must manually add students (no bulk import)
- No CSV upload for student roster
- Empty state might be confusing

**Opportunities:**
- Add setup wizard for new teachers
- Add bulk student import (CSV)
- Add sample data for demo
- Add video tutorial links

### Progress Tracking Flow (Student)

```
1. Student completes activity
   ↓
2. POST /api/activities/submit
   - Answer recorded
   - Time tracked
   - Hints used counted
   ↓
3. Database Updates:
   - student_attempts table (new row)
   - students table (update XP, level)
   - student_learning_profile (update success rates)
   ↓
4. Gamification Calculated:
   - Points = f(difficulty, time, hints, correctness)
   - XP added
   - Level up check
   - Badge earned check
   ↓
5. Frontend Updates:
   - Visual feedback (correct/incorrect)
   - Points animation
   - Level up modal (if applicable)
   - Badge notification (if applicable)
   ↓
6. Dashboard Refreshes:
   - Stats update
   - Progress bar updates
   - Badges appear
   ↓
7. Teacher Dashboard Updates:
   - Student analytics refresh
   - Alerts generated (if struggling)
   - Performance trends recalculated
```

**Data Flow:**
```
Student Answer
  ↓
API Route (/api/activities/submit)
  ↓
Database (Vercel Postgres)
  ↓
Gamification System (/lib/gamification/*)
  ↓
AI Analysis (/lib/ai/difficulty-adapter.ts)
  ↓
Teacher Alerts (/api/teacher/alerts)
```

### Gamification Loop (Core Engagement)

```
┌─────────────────────────────────────┐
│  Student Dashboard                  │
│  - View level, XP, badges           │
│  - See AI recommendation            │
└────────────┬────────────────────────┘
             ↓
┌────────────────────────────────────┐
│  Click "Play" → Enter Game         │
│  - 3D classroom loads               │
│  - Teacher greets student           │
└────────────┬───────────────────────┘
             ↓
┌────────────────────────────────────┐
│  Activity Presented                 │
│  - Math problem on blackboard       │
│  - Difficulty adapted by AI         │
└────────────┬───────────────────────┘
             ↓
┌────────────────────────────────────┐
│  Student Attempts Answer            │
│  - Voice input OR text input        │
│  - Can request hints (max 3)        │
└────────────┬───────────────────────┘
             ↓
┌────────────────────────────────────┐
│  AI Evaluates Answer                │
│  - Check correctness                │
│  - Analyze mistake (if wrong)       │
│  - Generate feedback                │
└────────────┬───────────────────────┘
             ↓
┌────────────────────────────────────┐
│  Teacher Provides Feedback          │
│  - Voice output (TTS)               │
│  - Visual feedback on blackboard    │
│  - Encouragement/correction         │
└────────────┬───────────────────────┘
             ↓
┌────────────────────────────────────┐
│  Rewards Calculated                 │
│  - Points awarded                   │
│  - XP added                         │
│  - Badges checked                   │
│  - Level up triggered               │
└────────────┬───────────────────────┘
             ↓
┌────────────────────────────────────┐
│  Visual Celebration                 │
│  - Points animation                 │
│  - Badge unlock modal               │
│  - Level up screen                  │
│  - Confetti/sound effects           │
└────────────┬───────────────────────┘
             ↓
┌────────────────────────────────────┐
│  Next Activity                      │
│  - Difficulty adjusted by AI        │
│  - Type may change (variety)        │
└────────────┬───────────────────────┘
             ↓
         (Loop continues)
             OR
             ↓
┌────────────────────────────────────┐
│  Return to Dashboard                │
│  - Stats updated                    │
│  - Progress visible                 │
└─────────────────────────────────────┘
```

**Engagement Mechanics:**
1. **Instant Feedback:** Immediate response from AI teacher
2. **Progressive Hints:** 3-level hint system (gentle to explicit)
3. **Adaptive Difficulty:** Next question adjusts to performance
4. **Visual Rewards:** Points, badges, level-ups with animations
5. **Personalization:** AI remembers student's strengths/weaknesses
6. **Variety:** 5 math types rotate to prevent monotony
7. **Voice Interaction:** Makes learning conversational and natural

---

## 7. CRITICAL FEATURES INVENTORY

### Feature: 3D Interactive Teacher with Voice
**Status:** ✅ Implemented
**Routes:** `/game`
**Components:** `ImmersiveTeacher`, `MathExperience`, `MathTeacher`, `MathBlackboard`
**Complexity:** **Very High**
**Dependencies:**
- Three.js, React Three Fiber, Drei
- OpenAI TTS API (text-to-speech)
- OpenAI Whisper API (speech-to-text)
- GLB 3D models (classroom, teacher)
- Animation files (Mateo, Valentina)
- Zustand teacherStore

**Implementation Notes:**
- Fullscreen 3D canvas
- Dynamic camera controls (zoom, pan)
- Lip-sync animations (viseme-based)
- Voice input (microphone permission required)
- Voice output (audio playback)
- Blackboard (HTML in 3D space)
- Scene customization (2 classrooms, 2 teachers)

**[CRITICAL]** DO NOT REDESIGN 3D SCENE - Core feature, highly custom

---

### Feature: AI-Powered Adaptive Learning
**Status:** ✅ Implemented
**Routes:** All game routes, `/dashboard/student` (recommendations)
**Components:** AI logic in `/lib/ai/*`
**Complexity:** **High**
**Dependencies:**
- OpenAI GPT-4o-mini API
- Database (student_learning_profile, student_attempts)
- `/lib/ai/difficulty-adapter.ts`
- `/lib/ai/openai-client.ts`

**Implementation Notes:**
- Success rate tracking per activity type
- Consecutive correct/incorrect tracking
- Mistake pattern analysis
- Difficulty recommendation algorithm
- Progressive hint generation (3 levels)
- Personalized feedback based on history
- AI-generated explanations for wrong answers

**API Endpoints:**
- `/api/ai/recommend-activity` (POST)
- `/api/ai/hint` (POST)
- `/api/ai/feedback` (POST)
- `/api/ai/analyze-mistake` (POST)
- `/api/ai/generate-exercise` (POST)

---

### Feature: Gamification System
**Status:** ✅ Implemented
**Routes:** `/dashboard/student`, `/game`
**Components:** `/lib/gamification/*`
**Complexity:** **Medium**
**Dependencies:**
- Database (students, student_attempts, badges)
- Point calculation algorithm
- Level progression formula
- Badge criteria

**Implementation Notes:**
- **Points:** Based on difficulty, time, hints used, correctness
- **Levels:** XP-based progression (100 XP per level)
- **Badges:** 10 types (first_correct, speed_demon, persistent, perfect_score, master_[operation])
- **Streak:** Daily login streak tracking
- **Visual Feedback:** Progress bars, badge modals, level-up screens

**Badge Types:**
1. `first_correct` - First correct answer
2. `speed_demon` - Complete in under X seconds
3. `persistent` - Multiple attempts on hard problem
4. `perfect_score` - 10 correct in a row
5. `master_addition` - 50 correct addition problems
6. `master_subtraction` - 50 correct subtraction problems
7. `master_multiplication` - 50 correct multiplication problems
8. `master_division` - 50 correct division problems
9. `master_fractions` - 50 correct fraction problems
10. `level_up` - Reach new level

---

### Feature: Teacher Analytics Dashboard
**Status:** ✅ Implemented
**Routes:** `/teacher`, `/teacher/students`, `/teacher/classes`, `/teacher/alerts`
**Components:** `DashboardCard`, `DataTable`, `StudentCard`, `AlertBadge`, `PerformanceBadge`
**Complexity:** **High**
**Dependencies:**
- Database (teacher_dashboard views, aggregated queries)
- Zustand store (use-teacher-dashboard.ts)
- Recharts (for graphs, if used)

**Implementation Notes:**
- **Dashboard Stats:**
  - Total students
  - Active students (today, week)
  - Average class performance
  - Unread alerts
  - Activities completed (today, week)
  - Students needing attention

- **Student Analytics:**
  - Individual performance tracking
  - Activity type breakdown
  - Success rate trends
  - Last active timestamp
  - Badges earned

- **Class Management:**
  - Create/edit/delete classes
  - Assign students to classes
  - View class performance aggregates

- **Alert System:**
  - Auto-generated alerts for:
    - Struggling students (<50% success rate)
    - Inactive students (no activity in 7 days)
    - Achievement milestones
  - Manual mark as read
  - Severity levels (info, warning, success)

**API Endpoints:**
- `/api/teacher/stats` (GET)
- `/api/teacher/students` (GET with filters)
- `/api/teacher/classes` (GET)
- `/api/teacher/alerts` (GET)
- `/api/teacher/alerts/[id]` (PATCH - mark as read)

---

### Feature: Multi-Role Authentication
**Status:** ✅ Implemented
**Routes:** `/login`, `/register`, all protected routes
**Components:** `LoginForm`, `RegisterForm`, `SessionProvider`, `middleware.ts`
**Complexity:** **Medium**
**Dependencies:**
- NextAuth.js
- Database (users, students, teachers)
- bcryptjs (password hashing)

**Implementation Notes:**
- **Roles:** student, teacher, admin (admin unused)
- **Strategy:** JWT (no database sessions)
- **Session Data:** ID, email, name, role, studentId/teacherId, level, experience
- **Middleware:**
  - Auto-redirect authenticated users from public pages
  - Role-based access control (students can't access teacher routes)
  - Public routes: `/`, `/login`, `/register`, `/api/auth/*`, `/api/health`

**Security:**
- Password min 6 characters (configurable)
- Bcrypt hashing (salt rounds: 10, default)
- JWT secret required (NEXTAUTH_SECRET)
- No email verification (out of scope)
- No password reset (out of scope)

---

### Feature: Math Activities Bank
**Status:** ✅ Implemented
**Routes:** `/game`, API routes
**Components:** Database-driven
**Complexity:** **Medium**
**Dependencies:**
- Database (math_activities table)
- Seed scripts (scripts/seed-activities.js)

**Implementation Notes:**
- **Activity Types:** 5 types (addition, subtraction, multiplication, division, fractions)
- **Difficulty Levels:** 3 levels (easy, medium, hard)
- **Questions:** Pre-seeded in database
- **Points:** Varies by difficulty (easy: 10, medium: 20, hard: 30)
- **Time Limits:** Varies by difficulty

**Data Structure:**
```typescript
interface MathActivity {
  id: string
  type: MathActivityType // 'addition' | 'subtraction' | ...
  difficulty: DifficultyLevel // 'easy' | 'medium' | 'hard'
  question: string
  correctAnswer: string
  options?: string[] // For multiple choice
  explanation?: string
  hints?: string[] // Up to 3 hints
  points: number
  timeLimitSeconds: number
  createdAt: Date
}
```

---

### Feature: Voice Conversation System
**Status:** ✅ Implemented
**Routes:** `/game`
**Components:** 3D teacher components, voice input/output
**Complexity:** **Very High**
**Dependencies:**
- OpenAI TTS API (model: tts-1, voice: nova)
- OpenAI Whisper API (language: es)
- Browser Web Audio API
- Browser MediaRecorder API
- Lip-sync system (viseme mapping)

**Implementation Notes:**
- **TTS:** `/lib/speech/tts.ts` converts text to audio
- **STT:** `/lib/speech/stt.ts` converts audio to text
- **Lip-sync:** `/lib/speech/lip-sync.ts` syncs mouth movements
- **Viseme Mapping:** Spanish phoneme to viseme conversion
- **Voice:** Nova voice (natural, clear for children)
- **Language:** Spanish (es)
- **Disabled on Mobile:** Performance optimization

**Feature Flags:**
```env
NEXT_PUBLIC_ENABLE_TEACHER_VOICE=true
NEXT_PUBLIC_TEACHER_VOICE_INPUT=true
NEXT_PUBLIC_TEACHER_MOBILE_ENABLED=false
NEXT_PUBLIC_MAX_AUDIO_DURATION=120
```

---

### Feature: Student Progress Tracking
**Status:** ✅ Implemented
**Routes:** `/dashboard/student`, `/api/stats/student`
**Components:** Dashboard components
**Complexity:** **Medium**
**Dependencies:**
- Database (students, student_attempts, badges)
- Gamification system

**Tracked Metrics:**
- Total attempts
- Correct/incorrect answers
- Success rate (overall, per activity type)
- Average time per question
- Streak (consecutive days active)
- Level & XP
- Badges earned
- Last active timestamp
- Hints usage rate

**Display:**
- Dashboard stat cards
- Progress bars
- Badge grid
- Activity distribution (if charts added)

---

### Feature: Class Management (Teachers)
**Status:** ✅ Implemented
**Routes:** `/teacher/classes`, `/teacher/classes/new`
**Components:** `DataTable`, forms
**Complexity:** **Low-Medium**
**Dependencies:**
- Database (classes, class_students)

**Features:**
- Create new class (name, description, grade, school year)
- View all classes (table)
- View students in class
- Active/inactive status
- Student count tracking

---

### Feature: Student Assignment System (Homework)
**Status:** ✅ Implemented (assumed based on routes)
**Routes:** `/teacher/assignments`, `/teacher/assignments/new`
**Components:** Forms, tables
**Complexity:** **Medium**
**Dependencies:**
- Database (activity_assignments)

**Features:**
- Assign activities to students or classes
- Set due dates
- Track completion
- Specify activity type, difficulty, quantity

---

## 8. API ENDPOINTS & DATA MODELS

### Authentication Endpoints

#### `POST /api/auth/register`
**Purpose:** Create new user account
**Request Body:**
```typescript
{
  email: string
  password: string
  name: string
  role: 'student' | 'teacher'
  grade?: number // Required if student (4 or 5)
  school?: string // Optional if teacher
}
```
**Response:**
```typescript
{
  success: boolean
  message?: string
  error?: string
}
```
**Database Operations:**
- Insert into `users` table
- If student: Insert into `students` table
- If teacher: Insert into `teachers` table

---

#### `POST /api/auth/[...nextauth]` (NextAuth Handler)
**Purpose:** Handle all NextAuth operations (login, session, etc.)
**Provider:** Credentials
**Strategy:** JWT

---

### Activity Endpoints

#### `POST /api/activities/generate`
**Purpose:** Generate a math activity (AI or database)
**Request Body:**
```typescript
{
  type: MathActivityType
  difficulty: DifficultyLevel
}
```
**Response:**
```typescript
{
  success: boolean
  activity: MathActivity
}
```

---

#### `POST /api/activities/submit`
**Purpose:** Submit student answer and record attempt
**Request Body:**
```typescript
{
  activityId: string
  answerGiven: string
  timeTakenSeconds: number
  hintsUsed: number
}
```
**Response:**
```typescript
{
  success: boolean
  isCorrect: boolean
  correctAnswer: string
  pointsEarned: number
  newLevel?: number
  newBadges?: Badge[]
  feedback?: string
}
```
**Database Operations:**
- Insert into `student_attempts`
- Update `students` (XP, level)
- Update `student_learning_profile`
- Check and insert `badges`

---

### AI Endpoints

#### `POST /api/ai/recommend-activity`
**Purpose:** Get AI-recommended activity based on student performance
**Request Body:** None (uses session)
**Response:**
```typescript
{
  success: boolean
  recommendation: {
    activityType: MathActivityType
    difficulty: DifficultyLevel
    reason: string
    confidence: number // 0.0 to 1.0
  }
}
```

---

#### `POST /api/ai/hint`
**Purpose:** Get progressive hint for current problem
**Request Body:**
```typescript
{
  question: string
  correctAnswer: string
  hintLevel: 1 | 2 | 3
  activityType: MathActivityType
}
```
**Response:**
```typescript
{
  success: boolean
  hint: string
}
```

---

#### `POST /api/ai/feedback`
**Purpose:** Get personalized AI feedback for answer
**Request Body:**
```typescript
{
  question: string
  correctAnswer: string
  studentAnswer: string
  isCorrect: boolean
  activityType: MathActivityType
  difficulty: DifficultyLevel
}
```
**Response:**
```typescript
{
  success: boolean
  feedback: string
  audioUrl?: string // TTS audio
}
```

---

#### `POST /api/ai/analyze-mistake`
**Purpose:** Analyze incorrect answer and provide explanation
**Request Body:**
```typescript
{
  question: string
  correctAnswer: string
  studentAnswer: string
  activityType: MathActivityType
}
```
**Response:**
```typescript
{
  success: boolean
  analysis: {
    mistakeType: string
    suggestion: string
    explanation?: string
  }
}
```

---

#### `POST /api/ai/generate-exercise`
**Purpose:** Generate new math exercise using AI
**Request Body:**
```typescript
{
  type: MathActivityType
  difficulty: DifficultyLevel
}
```
**Response:**
```typescript
{
  success: boolean
  exercise: MathActivity
}
```

---

### Stats Endpoints

#### `GET /api/stats/student`
**Purpose:** Get current student's statistics
**Request:** Session-based (no params)
**Response:**
```typescript
{
  success: boolean
  stats: GameStats
}
```

**GameStats Interface:**
```typescript
interface GameStats {
  level: number
  experience: number
  totalPoints: number
  correctAnswers: number
  incorrectAnswers: number
  totalAttempts: number
  averageTimeSeconds: number
  streakDays: number
  badges: Badge[]
  attemptsByType: {
    addition: number
    subtraction: number
    multiplication: number
    division: number
    fractions: number
  }
}
```

---

### Teacher Endpoints

#### `GET /api/teacher/stats`
**Purpose:** Get teacher dashboard statistics
**Response:**
```typescript
{
  success: boolean
  stats: TeacherDashboardStats
}
```

**TeacherDashboardStats Interface:**
```typescript
interface TeacherDashboardStats {
  totalStudents: number
  activeStudentsToday: number
  activeStudentsWeek: number
  totalClasses: number
  unreadAlerts: number
  averageClassPerformance: number
  totalActivitiesCompletedToday: number
  totalActivitiesToday: number
  totalActivitiesWeek: number
  totalAssignments: number
  studentsNeedingAttention: number
}
```

---

#### `GET /api/teacher/students`
**Purpose:** Get students list with optional filters
**Query Params:**
```typescript
{
  classId?: string
  performanceLevel?: 'all' | 'excelling' | 'average' | 'struggling'
  searchQuery?: string
  sortBy?: 'name' | 'level' | 'successRate' | 'lastActive'
  sortOrder?: 'asc' | 'desc'
}
```
**Response:**
```typescript
{
  success: boolean
  students: StudentSummary[]
}
```

**StudentSummary Interface:**
```typescript
interface StudentSummary {
  id: string
  name: string
  level: number
  successRate: number
  totalAttempts: number
  lastActive: Date
  needsAttention: boolean
}
```

---

#### `GET /api/teacher/students/[studentId]`
**Purpose:** Get detailed analytics for specific student
**Response:**
```typescript
{
  success: boolean
  student: StudentDetailAnalytics
}
```

**StudentDetailAnalytics Interface:**
```typescript
interface StudentDetailAnalytics extends StudentAnalytics {
  performanceHistory: PerformanceOverTime[] // Last 30 days
  activityDistribution: ActivityTypeDistribution[]
  recentAttempts: StudentAttempt[] // Last 20
  badges: Badge[]
  learningProfile?: StudentLearningProfile
  classIds: string[]
}
```

---

#### `GET /api/teacher/classes`
**Purpose:** Get all classes for teacher
**Response:**
```typescript
{
  success: boolean
  classes: Class[]
}
```

**Class Interface:**
```typescript
interface Class {
  id: string
  teacherId: string
  name: string
  description?: string
  grade?: number
  schoolYear?: string
  isActive: boolean
  studentCount?: number
  createdAt: Date
  updatedAt: Date
}
```

---

#### `GET /api/teacher/alerts`
**Purpose:** Get alerts for teacher
**Query Params:**
```typescript
{
  unreadOnly?: boolean
}
```
**Response:**
```typescript
{
  success: boolean
  alerts: TeacherAlert[]
}
```

**TeacherAlert Interface:**
```typescript
interface TeacherAlert {
  id: string
  teacherId: string
  studentId: string
  studentName?: string
  alertType: 'struggling' | 'inactive' | 'achievement' | 'milestone'
  title: string
  message: string
  severity: 'info' | 'warning' | 'success'
  isRead: boolean
  createdAt: Date
}
```

---

#### `PATCH /api/teacher/alerts/[alertId]`
**Purpose:** Mark alert as read
**Request Body:**
```typescript
{
  isRead: boolean
}
```
**Response:**
```typescript
{
  success: boolean
}
```

---

### Student Endpoints

#### `GET /api/student/classes`
**Purpose:** Get classes student is enrolled in
**Response:**
```typescript
{
  success: boolean
  classes: Class[]
}
```

---

### Avatar Endpoints (LEGACY - Feature Disabled)

#### `POST /api/avatar/save`
#### `GET /api/avatar/load`

---

### Health Endpoint

#### `GET /api/health`
**Purpose:** Health check for deployment
**Response:**
```typescript
{
  status: 'ok'
  timestamp: string
  database: 'connected' | 'error'
}
```

---

### Database Schema Summary

**Core Tables:**
- `users` - All users (students, teachers, admins)
- `students` - Student-specific data (linked to users)
- `teachers` - Teacher-specific data (linked to users)

**Activity Tables:**
- `math_activities` - Pre-created math problems
- `student_attempts` - Record of all student answers
- `badges` - Badges earned by students

**AI Tables:**
- `student_learning_profile` - AI-analyzed performance data
- `ai_feedback` - Cached AI responses
- `adaptive_recommendations` - AI recommendations history

**Teacher Tables:**
- `classes` - Class/group definitions
- `class_students` - Many-to-many (classes ↔ students)
- `teacher_alerts` - Notifications for teachers
- `activity_assignments` - Homework assignments

**Voice Tables (Teacher Voice Feature):**
- Tables for voice interaction history (assumed)

---

## 9. ASSETS & MEDIA STRATEGY

### 3D Models

**Environments:**
- `/public/models/environments/classroom1.glb` - Default classroom (modern design)
- `/public/models/environments/classroom2.glb` - Alternative classroom

**Teachers:**
- `/public/models/teachers/teacher1.glb` (assumed - Mateo)
- `/public/models/teachers/teacher2.glb` (assumed - Valentina)

**Animations:**
- `/public/animations/animations_Mateo.glb` - Mateo animations (lip-sync, gestures)
- `/public/animations/animations_Valentina.glb` - Valentina animations
- `/public/animations/Mateo.fbx` - Source FBX
- `/public/animations/Valentina.fbx` - Source FBX

**File Format:** GLB (Binary glTF)
**Size Considerations:** Large files (100KB - 5MB), affects initial load time

---

### Images

**Teacher Portraits:**
- `/public/images/Mateo.jpg` - Mateo portrait for selection UI
- `/public/images/Valentina.jpg` - Valentina portrait for selection UI

**Usage:** Teacher selector component (choose avatar)

---

### Audio

**Voice Synthesis:**
- Generated in real-time via OpenAI TTS API
- Voice: Nova (natural, clear)
- Model: tts-1
- Language: Spanish
- Format: MP3 (streamed)

**Voice Recognition:**
- Browser MediaRecorder API captures audio
- Sent to OpenAI Whisper API
- Language: Spanish
- Max duration: 120 seconds (configurable)

---

### Fonts

**Primary Font:**
- **Name:** Inter
- **Source:** Google Fonts
- **Variant:** Variable font
- **Subsets:** Latin
- **Loading:** Next.js font optimization

**Fallbacks:**
```css
font-family: var(--font-inter), system-ui, sans-serif
```

---

### Icons

**Library:** Lucide React v0.553.0

**Commonly Used Icons:**
- `Users` - Students, groups
- `UserCheck` - Active users
- `GraduationCap` - Classes, education
- `AlertCircle` - Alerts, warnings
- `TrendingUp` - Analytics, performance
- `Calendar` - Assignments, scheduling
- `Plus` - Create/add actions
- `ArrowRight` - Navigation, forward
- `Search` - Search functionality
- `Filter` - Filter controls
- `X` - Close, clear
- `Bell`, `BellOff` - Notifications
- `Check`, `CheckCheck` - Mark as done

**Emoji Icons (Student UI):**
- 🚀 (Learniverse logo)
- 🎉 (Welcome, celebrations)
- 🌟 (Stars, achievements)
- 🏆 (Level, trophies)
- ⭐ (Experience points)
- 🎯 (Activities, targets)
- 🎮 (Game, play)
- 🏫 (Classes)
- ✨ (Special, highlights)
- 💪 (Motivation, effort)
- 🤖 (AI, recommendations)

---

### Static Assets Strategy

**CDN:** Vercel Edge Network (automatic)

**Optimization:**
- Next.js Image component NOT used (no image optimization currently)
- GLB files served directly
- No lazy loading for 3D models (preloaded via useGLTF.preload)

**Missing Assets:**
- No logo image (uses emoji 🚀)
- No favicon.ico (using default)
- No OG images for social sharing
- No screenshots/marketing images

**Recommendations for Redesign:**
- Add proper logo (SVG)
- Add favicon and app icons (multiple sizes)
- Add OG image for social sharing
- Consider compressing 3D models further
- Add loading placeholders for images

---

## 10. CURRENT UI/UX ISSUES

### Inconsistencies

1. **Button Styles:**
   - Student buttons: Large, gradient, rounded-xl, playful
   - Teacher buttons: Small, solid color, rounded-lg, professional
   - **Issue:** Different sizing, radius, padding across contexts
   - **Impact:** Medium (understandable given different audiences, but could unify base component)

2. **Card Designs:**
   - Student cards: Heavily decorated, gradients, shadows, emojis
   - Teacher cards: Clean, minimal, border-focused
   - **Issue:** Completely different design languages
   - **Impact:** Low (intentional differentiation)

3. **Color Usage:**
   - Student UI: Full rainbow (yellow, orange, pink, purple, blue, green, cyan)
   - Teacher UI: Primarily indigo + semantic colors (green, red, amber)
   - **Issue:** No shared color between student/teacher UIs
   - **Impact:** Low (different audiences)

4. **Spacing:**
   - Inconsistent use of spacing scale (some use p-6, others p-8, mixed usage)
   - **Issue:** No strict spacing system
   - **Impact:** Medium (affects visual rhythm)

5. **Typography Hierarchy:**
   - Student UI: Very large text (text-5xl, text-4xl)
   - Teacher UI: Moderate text (text-3xl max)
   - **Issue:** No unified scale
   - **Impact:** Low (intentional for readability)

---

### Accessibility Gaps

1. **Keyboard Navigation:**
   - Many interactive elements lack focus states
   - **Issue:** No visible focus indicators on custom components
   - **Impact:** High (affects keyboard users)
   - **Fix:** Add `focus:ring-2 focus:ring-offset-2` to interactive elements

2. **ARIA Labels:**
   - Form inputs have proper labels ✅
   - Icon-only buttons lack ARIA labels
   - **Issue:** Screen readers can't identify icon button purposes
   - **Impact:** High
   - **Fix:** Add `aria-label` to icon buttons

3. **Color Contrast:**
   - White text on light gradients (student UI) may fail WCAG AA
   - **Issue:** Potential contrast issues on decorative backgrounds
   - **Impact:** Medium
   - **Fix:** Add text shadows or ensure sufficient contrast

4. **Semantic HTML:**
   - Heavy use of `<div>` elements
   - **Issue:** Missing semantic elements (`<nav>`, `<main>`, `<article>`, `<section>`)
   - **Impact:** Medium (affects screen reader navigation)
   - **Fix:** Replace divs with semantic HTML

5. **Alt Text:**
   - No images currently (emojis used instead)
   - 3D models lack descriptions
   - **Issue:** Screen readers can't describe 3D content
   - **Impact:** Medium
   - **Fix:** Add ARIA descriptions for 3D scenes

6. **Skip Links:**
   - No "Skip to content" link
   - **Issue:** Keyboard users must tab through all navigation
   - **Impact:** Medium
   - **Fix:** Add skip link at top of each page

7. **Form Validation:**
   - Error messages visible ✅
   - No ARIA live regions for dynamic errors
   - **Issue:** Screen readers don't announce errors
   - **Impact:** Medium
   - **Fix:** Add `role="alert"` to error messages

8. **Voice Controls:**
   - Alternative text input exists ✅
   - But no clear indication of how to switch between voice/text
   - **Issue:** Users with microphone issues may not find text input
   - **Impact:** High
   - **Fix:** Add clear toggle and instructions

---

### Responsive Issues

1. **Landing Page:**
   - Large gradient may not display correctly on very small screens
   - Footer text very small on mobile
   - **Fix:** Adjust gradient positioning, increase footer text size

2. **Student Dashboard:**
   - Decorative bouncing elements may overlap content on small screens
   - Giant play button too large on mobile (takes entire screen)
   - **Fix:** Scale down decorative elements, adjust button size

3. **Teacher Data Tables:**
   - Tables overflow on mobile (horizontal scroll required)
   - **Issue:** No mobile-optimized view (cards instead of table)
   - **Impact:** High (teachers may use tablets)
   - **Fix:** Responsive table → card layout on mobile

4. **3D Game:**
   - Disabled on mobile by default
   - **Issue:** Feature unavailable to mobile users
   - **Impact:** Very High (students may only have mobile devices)
   - **Fix:** Optimize 3D for mobile or create 2D alternative

5. **Navigation:**
   - No hamburger menu on mobile (teacher dashboard)
   - Top nav may overflow on small screens
   - **Fix:** Add responsive navigation menu

6. **Forms:**
   - Register form very long on mobile
   - All fields visible at once (overwhelming)
   - **Fix:** Consider multi-step form or collapsible sections

7. **Modals:**
   - No modals currently (level up, badges shown inline)
   - **Issue:** Missing common UI pattern
   - **Impact:** Low
   - **Fix:** Add modal components for important notifications

---

### Performance Bottlenecks

1. **3D Model Loading:**
   - Large GLB files (classroom, teacher)
   - **Issue:** Long initial load time on slow connections
   - **Impact:** Very High (affects first impression)
   - **Fix:**
     - Compress models further (Draco compression)
     - Show progress bar (currently just "Cargando...")
     - Lazy load alternative classroom/teacher

2. **OpenAI API Calls:**
   - Real-time calls for hints, feedback, TTS, STT
   - **Issue:** Latency varies (500ms - 3s)
   - **Impact:** High (breaks immersion)
   - **Fix:**
     - Implement caching (already exists for feedback)
     - Pre-generate common responses
     - Show loading indicators

3. **Database Queries:**
   - Teacher dashboard loads multiple endpoints
   - **Issue:** Sequential loading (waterfall)
   - **Impact:** Medium (dashboard slow to populate)
   - **Fix:** Parallel requests, consider GraphQL or tRPC

4. **No Code Splitting:**
   - Large bundle size (Three.js, R3F, OpenAI SDK)
   - **Issue:** Slow initial page load
   - **Impact:** High
   - **Fix:**
     - Already using dynamic imports for 3D ✅
     - Could split more routes

5. **Re-renders:**
   - Student dashboard re-fetches on every visit
   - **Issue:** No caching of dashboard data
   - **Impact:** Medium
   - **Fix:** Implement SWR or React Query

6. **Images:**
   - Not using Next.js Image component
   - **Issue:** No automatic optimization
   - **Impact:** Low (only 2 small JPGs currently)
   - **Fix:** Use next/image for teacher portraits

7. **Animations:**
   - CSS animations on multiple elements (bouncing decorations)
   - **Issue:** May cause jank on low-end devices
   - **Impact:** Low
   - **Fix:** Use GPU-accelerated properties only (transform, opacity)

---

### UX Pain Points

1. **No Onboarding:**
   - New students thrown into dashboard
   - No explanation of features
   - **Impact:** High (confusion on first use)
   - **Fix:** Add welcome modal or tutorial

2. **3D Game First Experience:**
   - No instructions for voice controls
   - Microphone permission may be denied silently
   - **Impact:** High (students may think it's broken)
   - **Fix:** Show tutorial overlay on first game launch

3. **Error Messages:**
   - Generic error messages ("Error al iniciar sesión")
   - **Impact:** Medium (users don't know how to fix issues)
   - **Fix:** More specific error messages

4. **No Confirmation Dialogs:**
   - Logout button has no confirmation
   - **Impact:** Low (easy to accidentally log out)
   - **Fix:** Add confirmation modal

5. **Teacher Empty States:**
   - Dashboard shows zeros when no data
   - **Issue:** Looks broken or sad
   - **Impact:** Medium (demotivating)
   - **Fix:** Better empty state designs (already good for classes)

6. **No Search on Student Dashboard:**
   - Students can't search their badges or history
   - **Impact:** Low (current scope is small)
   - **Fix:** Add search if data grows

7. **No Filtering on Student Dashboard:**
   - Can't filter classes or activities
   - **Impact:** Low
   - **Fix:** Add filters if data grows

8. **No Undo:**
   - Submitted answers can't be changed
   - **Impact:** Medium (typos are punished)
   - **Fix:** Add "Are you sure?" confirmation

9. **No Progress Indicators:**
   - Long API calls (AI feedback) show no progress
   - **Issue:** Users think app is frozen
   - **Impact:** High
   - **Fix:** Add loading spinners, skeleton screens

10. **No Offline Support:**
    - App requires internet for all features
    - **Impact:** High (students may have unstable connections)
    - **Fix:** Add offline mode (cache activities)

---

## 11. v0 INTEGRATION PREPARATION

### Components to Redesign with v0

**High Priority (Core UI, Used Frequently):**

1. **Button Component**
   - Current: Inline Tailwind classes
   - Variants: primary, secondary, danger, ghost, outline
   - Sizes: sm, md, lg
   - States: default, hover, focus, disabled, loading
   - **v0 Benefit:** Consistent, accessible, reusable

2. **Card Component**
   - Current: Inconsistent across student/teacher UIs
   - Variants: default, interactive (clickable), highlighted
   - **v0 Benefit:** Unified design language

3. **Input Component**
   - Current: Inline Tailwind classes
   - Types: text, email, password, number, select, textarea
   - States: default, focus, error, disabled
   - **v0 Benefit:** Consistent form UX

4. **Badge Component**
   - Current: AlertBadge, PerformanceBadge (separate)
   - Variants: performance (color-coded by %), severity (low/med/high), status
   - **v0 Benefit:** Single unified badge system

5. **Table Component**
   - Current: DataTable (good, but could improve)
   - Features: sorting, filtering, pagination, custom cell renderers
   - **v0 Benefit:** Mobile-responsive table (card view)

6. **Modal/Dialog Component**
   - Current: Missing entirely
   - Use cases: confirmations, level-up, badge unlock, errors
   - **v0 Benefit:** Standard modal pattern

7. **Alert/Notification Component**
   - Current: Inline error/success messages
   - Types: success, error, warning, info
   - Dismissible: Yes
   - **v0 Benefit:** Toast notifications

8. **Navigation Component**
   - Current: Custom header on each page
   - Need: Unified top nav for teachers, sidebar for mobile
   - **v0 Benefit:** Responsive nav patterns

---

**Medium Priority (Good to Improve):**

9. **Stat Card Component**
   - Current: DashboardCard (basic)
   - Features: icon, label, value, trend indicator, click action
   - **v0 Benefit:** More visual stat cards

10. **Empty State Component**
    - Current: Inline JSX (inconsistent)
    - Features: icon, title, description, CTA button
    - **v0 Benefit:** Consistent empty states

11. **Loading Skeleton Component**
    - Current: Simple spinner
    - Need: Skeleton screens for tables, cards
    - **v0 Benefit:** Better perceived performance

12. **Dropdown Menu Component**
    - Current: Native `<select>`
    - Need: Custom dropdown with icons, sections
    - **v0 Benefit:** Better UX

13. **Tabs Component**
    - Current: Missing
    - Potential use: Student dashboard sections, teacher analytics
    - **v0 Benefit:** Clean section switching

14. **Accordion Component**
    - Current: Missing
    - Potential use: FAQ, help sections
    - **v0 Benefit:** Collapsible content

15. **Progress Bar Component**
    - Current: Inline Tailwind
    - Need: Unified progress bar (XP, loading, etc.)
    - **v0 Benefit:** Consistent progress indicators

---

### Components to Keep (DO NOT Redesign)

**[CRITICAL] 3D Components - Must Preserve:**

1. **ImmersiveTeacher** - Fullscreen 3D wrapper
2. **MathExperience** - Main 3D scene orchestration
3. **MathTeacher** - 3D teacher model with animations
4. **MathBlackboard** - HTML-in-3D blackboard
5. **SceneSettings** - 3D scene controls
6. **TypingBox** - Answer input (could redesign styling, not logic)
7. **CameraManager** - Camera control logic
8. **Environment** - R3F lighting setup
9. **Loader** - R3F loading screen

**Reason:** These are highly specialized 3D components. Redesigning would break core functionality. v0 cannot generate Three.js/R3F code.

**Keep Styling Only (Can Redesign HTML Overlay Parts):**
- **Blackboard HTML:** Could redesign the HTML rendered in 3D space
- **TypingBox Overlay:** Could redesign the input box UI
- **Close Button:** Could redesign the close/exit button

---

**Authentication Components - Moderate Redesign:**

1. **LoginForm** - Keep logic, redesign UI with v0
2. **RegisterForm** - Keep logic, redesign UI with v0
3. **SessionProvider** - Keep as-is (wrapper component)

**Reason:** Forms need consistent UX. v0 can generate better form designs while preserving logic.

---

**Teacher Dashboard Components - Can Redesign:**

1. **DataTable** - Redesign with v0 (mobile-responsive table)
2. **StudentCard** - Redesign for better visual hierarchy
3. **DashboardCard** - Redesign for more engaging stats
4. **AlertBadge** - Unify with PerformanceBadge

**Reason:** These are presentational components. v0 can create better designs.

---

### Routes with Complex State (Preserve Logic)

**High Complexity - Redesign UI Only:**

1. **/game** - DO NOT touch 3D logic, only overlay UI
2. **/dashboard/student** - Redesign cards/layout, keep data fetching
3. **/teacher** - Redesign dashboard, keep stats logic
4. **/teacher/students** - Redesign table, keep filtering logic
5. **/teacher/alerts** - Redesign list, keep alert logic

**Medium Complexity:**

6. **/login** - Redesign form, keep auth logic
7. **/register** - Redesign form, keep validation logic
8. **/teacher/classes** - Redesign table, keep class logic

**Low Complexity (Safe to Fully Redesign):**

9. **/** (Landing) - Completely redesign
10. **/avatar** - Remove or show "Coming Soon" page

---

### Component Extraction Strategy

**Phase 1: Base Components (v0 Generation)**
1. Generate Button component (all variants)
2. Generate Card component (all variants)
3. Generate Input component (all types)
4. Generate Badge component (unified)

**Phase 2: Composite Components (v0 Generation)**
5. Generate Modal/Dialog component
6. Generate Alert/Toast component
7. Generate Navigation component
8. Generate Dropdown component

**Phase 3: Complex Components (v0 + Manual)**
9. Generate DataTable (v0), adapt for sorting/filtering (manual)
10. Generate Stat Card (v0), add click handlers (manual)
11. Generate Form layouts (v0), integrate with existing validation (manual)

**Phase 4: Page Layouts (v0 Generation)**
12. Redesign Landing Page (fully v0)
13. Redesign Login/Register Pages (v0 forms + manual auth)
14. Redesign Student Dashboard (v0 layout + manual data)
15. Redesign Teacher Dashboard (v0 layout + manual data)

**Phase 5: Integration (Manual)**
16. Replace inline Tailwind with v0 components
17. Update imports across all files
18. Test all flows (student, teacher)
19. Accessibility audit
20. Mobile testing

---

### Critical Functionality That Cannot Break

**[CRITICAL] Must Preserve:**

1. **3D Scene Rendering**
   - Three.js initialization
   - Camera controls
   - Model loading (GLB)
   - Animations (lip-sync, gestures)
   - Lighting setup

2. **Voice System**
   - OpenAI TTS (text-to-speech)
   - OpenAI Whisper (speech-to-text)
   - Audio playback
   - Microphone capture
   - Lip-sync synchronization

3. **AI Integration**
   - OpenAI API calls
   - Response caching
   - Rate limiting
   - Error handling

4. **Authentication**
   - NextAuth session management
   - JWT token handling
   - Role-based access control
   - Middleware redirects

5. **Database Operations**
   - All CRUD operations
   - Transaction handling
   - Query optimization
   - Error handling

6. **Gamification Logic**
   - Points calculation
   - Level progression
   - Badge criteria
   - Streak tracking

7. **State Management**
   - Zustand stores (teacherStore, use-teacher-dashboard)
   - Local state patterns
   - Session data

8. **API Routes**
   - All endpoint logic
   - Request validation
   - Response formatting
   - Error handling

**Testing Checklist After Redesign:**
- [ ] Student can login and see dashboard
- [ ] Student can start game and see 3D teacher
- [ ] Voice input/output works
- [ ] AI provides hints and feedback
- [ ] Points/XP/badges are awarded correctly
- [ ] Teacher can login and see analytics
- [ ] Teacher can view student list
- [ ] Teacher can view alerts
- [ ] Teacher can create classes
- [ ] All tables sort and filter correctly
- [ ] Mobile responsive on all pages (except 3D game)
- [ ] Dark mode works (teacher UI)
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

---

## 12. IMPLEMENTATION NOTES

### Code Organization Patterns

**File Naming:**
- Components: PascalCase (e.g., `LoginForm.tsx`, `DataTable.tsx`)
- Utilities: kebab-case (e.g., `openai-client.ts`, `difficulty-adapter.ts`)
- Stores: camelCase (e.g., `gameStore.ts`, `avatarStore.ts`)
- API Routes: lowercase (e.g., `route.ts`, `[id]/route.ts`)

**Import Order:**
```typescript
// 1. External libraries
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// 2. Internal libraries
import { useTeacherDashboard } from '@/store/use-teacher-dashboard'
import { DataTable } from '@/components/teacher/DataTable'
import type { StudentSummary } from '@/types'

// 3. Relative imports (rare in App Router)
import { helper } from './helper'
```

**Component Structure:**
```typescript
/**
 * Component Name
 * Brief description
 */

'use client' // If client component

import statements

// Types
interface ComponentProps {
  prop: string
}

// Main component
export default function Component({ prop }: ComponentProps) {
  // Hooks (in order: router, session, state, effects)
  const router = useRouter()
  const { data: session } = useSession()
  const [state, setState] = useState()

  useEffect(() => {
    // Effects
  }, [dependencies])

  // Event handlers
  const handleClick = () => {}

  // Conditional returns (loading, auth)
  if (loading) return <div>Loading...</div>

  // Main render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

**API Route Structure:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse input
    const searchParams = request.nextUrl.searchParams
    const param = searchParams.get('param')

    // 3. Validate input
    if (!param) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // 4. Database query
    const data = await executeQuery('SELECT * FROM table WHERE id = $1', [param])

    // 5. Return response
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in GET /api/route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

### TypeScript Patterns

**Strict Mode Enabled:**
```json
// tsconfig.json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true
}
```

**Type Imports:**
```typescript
import type { User, Student } from '@/types'
```

**Props Typing:**
```typescript
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  // Implementation
}
```

**API Response Typing:**
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const response: ApiResponse<Student[]> = await fetch('/api/students').then(r => r.json())
```

---

### Tailwind Patterns

**Responsive Breakpoints:**
```css
/* Default (mobile-first) */
className="text-sm"

/* Tablet (640px+) */
className="sm:text-base"

/* Desktop (768px+) */
className="md:text-lg"

/* Large Desktop (1024px+) */
className="lg:text-xl"
```

**Dark Mode:**
```css
className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
```

**Common Patterns:**
```css
/* Flexbox centering */
className="flex items-center justify-center"

/* Grid with gap */
className="grid grid-cols-1 md:grid-cols-3 gap-6"

/* Card */
className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"

/* Button */
className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"

/* Input */
className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 focus:ring-2 focus:ring-indigo-500"
```

**Dynamic Classes (AVOID):**
```typescript
// ❌ BAD - Tailwind won't include these
className={`bg-${color}-500`}

// ✅ GOOD - Complete class names
className={color === 'blue' ? 'bg-blue-500' : 'bg-red-500'}
```

---

### State Management Patterns

**Zustand Store Pattern:**
```typescript
import { create } from 'zustand'

interface StoreState {
  data: Data[]
  loading: boolean
  fetchData: () => Promise<void>
}

export const useStore = create<StoreState>((set, get) => ({
  data: [],
  loading: false,

  fetchData: async () => {
    set({ loading: true })
    try {
      const response = await fetch('/api/data')
      const data = await response.json()
      set({ data, loading: false })
    } catch (error) {
      console.error('Error fetching data:', error)
      set({ loading: false })
    }
  }
}))
```

**Usage in Component:**
```typescript
const { data, loading, fetchData } = useStore()

useEffect(() => {
  fetchData()
}, [])
```

---

### API Call Patterns

**Client-Side Fetch:**
```typescript
const [data, setData] = useState<Data | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/data')
      if (!response.ok) {
        throw new Error('Failed to fetch')
      }
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [])
```

**POST Request:**
```typescript
const handleSubmit = async (data: FormData) => {
  setLoading(true)
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit')
    }

    // Success
    return result
  } catch (error) {
    console.error('Error submitting:', error)
    throw error
  } finally {
    setLoading(false)
  }
}
```

---

### Build & Deployment Considerations

**Vercel Configuration:**
```json
// vercel.json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    // Environment variables set in Vercel dashboard
  }
}
```

**Build Optimizations:**
- ESLint disabled during build (due to version conflict)
- TypeScript checking ENABLED (strict mode)
- Three.js packages transpiled via Next.js config
- API routes timeout: 30s (default), 60s (AI routes)

**Environment Variables Required:**
```bash
# Database (Required)
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Auth (Required)
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# AI (Required)
OPENAI_API_KEY=
OPENAI_ORGANIZATION_ID= # Optional

# Voice (Optional)
OPENAI_TTS_VOICE=nova
OPENAI_TTS_MODEL=tts-1
OPENAI_WHISPER_LANGUAGE=es

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_TEACHER_VOICE=true
NEXT_PUBLIC_TEACHER_FULLSCREEN=true
NEXT_PUBLIC_TEACHER_VOICE_INPUT=true
NEXT_PUBLIC_TEACHER_WHITEBOARD=true
NEXT_PUBLIC_TEACHER_ANIMATIONS=true
NEXT_PUBLIC_TEACHER_MOBILE_ENABLED=false
NEXT_PUBLIC_MAX_AUDIO_DURATION=120
```

**Database Initialization:**
```bash
# Run in order
npm run db:init-activities
npm run db:init-ai
npm run db:init-teacher
npm run db:init-teacher-voice
npm run db:seed-activities
```

---

## 13. PRIORITY ROUTES FOR REDESIGN

### High Priority (User-Facing, Frequently Used)

1. **`/` (Landing Page)**
   - **Priority:** 🔴 HIGH
   - **Reason:** First impression, very basic design
   - **Impact:** Attract new users
   - **Complexity:** Low (static content)
   - **v0 Approach:** Generate modern landing page with hero, features, testimonials

2. **`/dashboard/student` (Student Dashboard)**
   - **Priority:** 🔴 HIGH
   - **Reason:** Student's main hub, used every session
   - **Impact:** Core engagement
   - **Complexity:** Medium (stats, recommendations, classes)
   - **v0 Approach:** Redesign stat cards, layout, keep data fetching logic

3. **`/teacher` (Teacher Dashboard)**
   - **Priority:** 🔴 HIGH
   - **Reason:** Teacher's main hub, complex data display
   - **Impact:** Teacher retention
   - **Complexity:** High (multiple data sources)
   - **v0 Approach:** Redesign dashboard cards, stats, alerts section

4. **`/teacher/students` (Student List)**
   - **Priority:** 🔴 HIGH
   - **Reason:** Core teacher functionality
   - **Impact:** Daily use
   - **Complexity:** Medium (table, filters)
   - **v0 Approach:** Mobile-responsive table or card grid

5. **`/login` & `/register` (Auth Pages)**
   - **Priority:** 🟠 MEDIUM-HIGH
   - **Reason:** Entry point for all users
   - **Impact:** Conversion rate
   - **Complexity:** Low (forms)
   - **v0 Approach:** Modern form design, better validation UX

---

### Medium Priority (Important But Less Frequent)

6. **`/teacher/classes` (Class List)**
   - **Priority:** 🟡 MEDIUM
   - **Reason:** Class management
   - **Impact:** Teacher organization
   - **Complexity:** Low-Medium
   - **v0 Approach:** Redesign table, empty state

7. **`/teacher/alerts` (Alerts List)**
   - **Priority:** 🟡 MEDIUM
   - **Reason:** Important notifications
   - **Impact:** Teacher responsiveness
   - **Complexity:** Medium
   - **v0 Approach:** Notification center design

8. **`/teacher/students/[id]` (Student Detail)**
   - **Priority:** 🟡 MEDIUM
   - **Reason:** Deep analytics
   - **Impact:** Teacher insights
   - **Complexity:** High (charts, detailed stats)
   - **v0 Approach:** Dashboard-style detail page

9. **`/teacher/classes/new` (Create Class Form)**
   - **Priority:** 🟡 MEDIUM
   - **Reason:** Setup flow
   - **Impact:** Onboarding
   - **Complexity:** Low
   - **v0 Approach:** Clean form design

10. **`/teacher/assignments/new` (Create Assignment Form)**
    - **Priority:** 🟡 MEDIUM
    - **Reason:** Homework assignment
    - **Impact:** Teacher engagement
    - **Complexity:** Medium
    - **v0 Approach:** Multi-step form

---

### Low Priority (Secondary Features)

11. **`/teacher/assignments` (Assignment List)**
    - **Priority:** 🟢 LOW
    - **Reason:** Less frequently used
    - **Impact:** Feature completeness
    - **Complexity:** Low
    - **v0 Approach:** Table design

12. **`/teacher/classes/[id]` (Class Detail)**
    - **Priority:** 🟢 LOW
    - **Reason:** Drill-down view
    - **Impact:** Nice to have
    - **Complexity:** Medium
    - **v0 Approach:** Detail page with student roster

---

### Do NOT Redesign

13. **`/game` (3D Immersive Teacher)**
    - **Priority:** ❌ DO NOT REDESIGN
    - **Reason:** Core 3D feature, highly custom
    - **Impact:** Would break core functionality
    - **Complexity:** Very High
    - **Note:** Only overlay UI (TypingBox, close button) could be redesigned

14. **`/avatar` (Avatar Customization)**
    - **Priority:** ❌ REMOVE OR SHOW "COMING SOON"
    - **Reason:** Feature disabled
    - **Impact:** None (redirects anyway)

15. **`/dashboard/teacher` (Redirect Page)**
    - **Priority:** ❌ KEEP AS-IS OR REMOVE
    - **Reason:** Just a redirect

---

### Redesign Roadmap

**Phase 1: Foundation (v0 Component Library)**
- Generate base components (Button, Card, Input, Badge, Table, Modal, Alert)
- Create design tokens (colors, spacing, typography)
- Set up component documentation

**Phase 2: Public Pages**
1. Redesign `/` (Landing)
2. Redesign `/login`
3. Redesign `/register`

**Phase 3: Student Experience**
4. Redesign `/dashboard/student`
5. Update 3D game overlay UI (`/game`)

**Phase 4: Teacher Core**
6. Redesign `/teacher` (dashboard)
7. Redesign `/teacher/students` (list)
8. Redesign `/teacher/alerts`

**Phase 5: Teacher Secondary**
9. Redesign `/teacher/classes`
10. Redesign `/teacher/students/[id]`
11. Redesign form pages (create class, assignment)

**Phase 6: Polish**
12. Mobile optimization
13. Accessibility audit
14. Performance optimization
15. Dark mode consistency (teacher UI)

---

## 14. MOBILE-FIRST CONSIDERATIONS

### Route: `/` (Landing)
**Current Mobile Experience:** 6/10
**Issues:**
- Gradient background may not display correctly
- CTA buttons stack (good)
- Footer text very small

**Touch-Friendly for Ages 9-11:** ✅ YES (large buttons)

**Improvements:**
- Larger tap targets (48px minimum)
- Simpler gradient (solid colors on mobile)
- Larger footer text

---

### Route: `/login` & `/register`
**Current Mobile Experience:** 8/10
**Issues:**
- Form inputs well-sized
- Register form is long (many fields)

**Touch-Friendly for Ages 9-11:** ✅ YES

**Improvements:**
- Consider multi-step registration on mobile
- Larger input fields for children (min 44px height)
- Show/hide password toggle

---

### Route: `/dashboard/student`
**Current Mobile Experience:** 7/10
**Issues:**
- Decorative bouncing elements may overlap
- Giant play button too large
- Stats cards stack well (good)

**Touch-Friendly for Ages 9-11:** ✅ YES (large buttons, emojis)

**Improvements:**
- Scale down decorative elements
- Adjust play button size (75% of viewport max)
- Add swipe gestures for classes

---

### Route: `/game` (3D Teacher)
**Current Mobile Experience:** 0/10 (DISABLED)
**Issues:**
- Feature completely unavailable on mobile
- 3D rendering too heavy for mobile GPUs
- Small screen not suitable for immersive experience

**Touch-Friendly for Ages 9-11:** ❌ NO (disabled)

**Improvements:**
- Create 2D fallback (static teacher image + text)
- Or optimize 3D for mobile (low-poly models)
- Or show "Use a computer for best experience" message

---

### Route: `/teacher` (Dashboard)
**Current Mobile Experience:** 6/10
**Issues:**
- Stats grid collapses (good)
- Table overflows (horizontal scroll)
- Many small buttons (hard to tap)

**Touch-Friendly for Ages 9-11:** N/A (teachers, not students)
**Touch-Friendly for Adult Teachers:** ⚠️ MODERATE

**Improvements:**
- Larger tap targets (min 44px)
- Replace tables with cards on mobile
- Sticky header with hamburger menu

---

### Route: `/teacher/students` (Student List)
**Current Mobile Experience:** 4/10
**Issues:**
- Table not mobile-friendly (horizontal scroll)
- Filter panel takes entire screen
- Many columns (hard to read)

**Touch-Friendly for Adult Teachers:** ❌ NO

**Improvements:**
- Replace table with card grid on mobile
- Collapsible filter panel (drawer)
- Search-first UI on mobile

---

### Route: `/teacher/classes` (Class List)
**Current Mobile Experience:** 6/10
**Issues:**
- Table scrolls horizontally
- Stats cards stack well

**Touch-Friendly for Adult Teachers:** ⚠️ MODERATE

**Improvements:**
- Card grid instead of table
- Swipeable class cards

---

### Route: `/teacher/alerts` (Alerts)
**Current Mobile Experience:** 8/10
**Issues:**
- Alert cards stack well (good)
- Buttons accessible

**Touch-Friendly for Adult Teachers:** ✅ YES

**Improvements:**
- Swipe to dismiss
- Larger action buttons

---

### General Mobile Strategy

**Target Devices:**
- Students: Tablets (iPad, Android tablets), smartphones
- Teachers: Tablets, laptops (primary), smartphones (secondary)

**Breakpoint Strategy:**
```css
/* Mobile-first (default) */
0-639px: Single column, stacked layout

/* Tablet */
640px-1023px: 2-column grid, collapsible sidebars

/* Desktop */
1024px+: Multi-column, full features
```

**Touch Target Sizes:**
- Minimum: 44px x 44px (Apple HIG)
- Student UI: 48px x 48px (larger for children)
- Spacing: 8px minimum between targets

**Mobile Optimizations:**
- Lazy load images (not currently implemented)
- Reduce 3D complexity or disable
- Compress assets (GLB models)
- Defer non-critical JavaScript
- Use system fonts on mobile (faster)

**Mobile-Specific Features:**
- Pull-to-refresh (dashboards)
- Swipe gestures (cards, navigation)
- Bottom navigation (student UI)
- Floating action button (primary action)
- Native-like animations (fast, smooth)

**Testing Checklist:**
- [ ] iPhone SE (375px) - Smallest modern phone
- [ ] iPhone 14 Pro (393px)
- [ ] iPad Mini (768px)
- [ ] iPad Pro (1024px)
- [ ] Android phone (various sizes)
- [ ] Android tablet

---

## 15. PERFORMANCE METRICS

### Current Performance Concerns

#### 1. Large Bundle Size
**Issue:** Three.js, React Three Fiber, OpenAI SDK, NextAuth
**Impact:** Slow initial load (especially on 3G/4G)
**Current Size (Estimated):**
- Main bundle: ~500KB (gzipped)
- Three.js: ~150KB
- R3F + Drei: ~100KB
- OpenAI SDK: ~50KB

**Optimization:**
- ✅ Dynamic imports for 3D components (already done)
- ❌ No route-based code splitting (Next.js should do this)
- ❌ No tree-shaking for unused Drei components

**Recommendations:**
- Audit bundle with `next build --analyze`
- Remove unused dependencies
- Use `next/dynamic` more aggressively
- Consider lazy loading OpenAI SDK

---

#### 2. Heavy 3D Assets
**Issue:** Large GLB models (classrooms, teachers)
**Impact:** Long load times on slow connections
**File Sizes (Estimated):**
- classroom1.glb: ~2-5MB
- classroom2.glb: ~2-5MB
- animations_Mateo.glb: ~1-2MB
- animations_Valentina.glb: ~1-2MB

**Current Optimization:**
- ✅ Preloading with `useGLTF.preload()`
- ❌ No Draco compression
- ❌ No progressive loading

**Recommendations:**
- Apply Draco compression (50-70% size reduction)
- Show detailed loading progress (%)
- Lazy load alternative classroom/teacher
- Use lower-poly models for mobile (if mobile enabled)

---

#### 3. Slow API Calls
**Issue:** OpenAI API latency (500ms - 3s)
**Impact:** Breaks immersion, feels slow
**Bottlenecks:**
- GPT-4o-mini inference: 1-2s
- TTS generation: 500ms-1s
- STT transcription: 1-2s

**Current Optimization:**
- ✅ Caching for feedback/hints (reduces repeat calls)
- ❌ No optimistic UI updates
- ❌ No request deduplication

**Recommendations:**
- Show loading indicators (spinner, skeleton)
- Pre-generate common responses (cache in DB)
- Use streaming responses where possible
- Implement request queue (prevent duplicate calls)
- Add retry logic with exponential backoff

---

#### 4. Database Query Performance
**Issue:** Teacher dashboard loads multiple endpoints sequentially
**Impact:** Dashboard takes 2-3s to fully populate
**Bottlenecks:**
- Stats query: ~200ms
- Students query: ~500ms (with aggregations)
- Alerts query: ~100ms
- Classes query: ~100ms

**Current Optimization:**
- ❌ Sequential loading (waterfall)
- ❌ No database indexes (assumed)
- ❌ No query result caching

**Recommendations:**
- Parallel API calls (Promise.all)
- Add database indexes (students.teacher_id, attempts.student_id, etc.)
- Implement React Query or SWR (client-side caching)
- Create database views for complex aggregations
- Add API response caching (server-side)

---

#### 5. No Image Optimization
**Issue:** Not using Next.js Image component
**Impact:** Unoptimized teacher portraits (~200KB each)
**Current State:**
- Mateo.jpg: ~200KB
- Valentina.jpg: ~200KB

**Recommendations:**
- Use `next/image` for all images
- Convert to WebP format
- Add responsive sizes (srcset)
- Lazy load below-the-fold images

---

#### 6. Re-renders and State Updates
**Issue:** Dashboard components re-fetch on every visit
**Impact:** Wasted API calls, slow UX
**Current State:**
- No client-side caching
- Full page re-renders on navigation

**Recommendations:**
- Implement SWR or React Query (stale-while-revalidate)
- Add cache headers to API responses
- Use React.memo for expensive components
- Debounce filter/search inputs

---

#### 7. CSS Animations (Student Dashboard)
**Issue:** Multiple bouncing decorative elements
**Impact:** Potential jank on low-end devices
**Current State:**
- 4+ bouncing circles on student dashboard
- Inline styles with delays

**Recommendations:**
- Use `will-change` CSS property
- Limit animations on low-end devices (reduce motion media query)
- Use GPU-accelerated properties only (transform, opacity)
- Consider removing non-essential animations

---

### Performance Budget

**Target Metrics (Mobile 4G):**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Total Blocking Time (TBT): < 300ms
- Cumulative Layout Shift (CLS): < 0.1

**Target Metrics (Desktop):**
- FCP: < 1s
- LCP: < 1.5s
- TTI: < 2s
- TBT: < 150ms
- CLS: < 0.05

**Current Metrics (Estimated):**
- Landing page: Good (static, fast)
- Student dashboard: Moderate (multiple API calls)
- Teacher dashboard: Slow (many API calls, tables)
- 3D game: Slow (large 3D assets)

---

### Asset Optimization Checklist

**Images:**
- [ ] Convert JPG to WebP
- [ ] Add responsive sizes (next/image)
- [ ] Lazy load below-fold images
- [ ] Add blur placeholders (LQIP)

**3D Models:**
- [ ] Apply Draco compression
- [ ] Reduce polygon count where possible
- [ ] Test with glTF-Transform
- [ ] Consider multiple LOD (Level of Detail) models

**Fonts:**
- ✅ Using variable fonts (Inter)
- [ ] Subset fonts (include only Latin)
- [ ] Preload critical fonts
- [ ] Font-display: swap

**JavaScript:**
- [ ] Code splitting by route
- [ ] Dynamic imports for heavy libraries
- [ ] Tree-shake unused code
- [ ] Minify and compress (Vercel does this)

**API:**
- [ ] Add response caching (Cache-Control headers)
- [ ] Implement ETags
- [ ] Use compression (gzip/brotli - Vercel does this)
- [ ] Reduce response payload size

---

### Monitoring & Analytics

**Current Tools:**
- ✅ Vercel Analytics (@vercel/analytics)
- ✅ Vercel Speed Insights (@vercel/speed-insights)

**Recommended Tools:**
- [ ] Lighthouse CI (automated performance testing)
- [ ] Sentry (error tracking, performance monitoring)
- [ ] LogRocket (session replay, performance insights)
- [ ] Custom analytics for AI API call latency

**Key Metrics to Track:**
- Page load times (by route)
- API response times (by endpoint)
- 3D model load times
- OpenAI API latency
- Error rates
- User engagement (time on page, bounce rate)

---

## CONCLUSION

This document provides a comprehensive analysis of the Learniverse codebase for v0 redesign. Key takeaways:

1. **Preserve Core Features:** The 3D interactive teacher with voice is the crown jewel - DO NOT redesign, only improve overlay UI.

2. **Prioritize User-Facing Routes:** Landing page, student dashboard, teacher dashboard need the most attention.

3. **Build Component Library First:** Use v0 to generate a unified design system (Button, Card, Input, Table, etc.) before redesigning pages.

4. **Mobile Optimization Critical:** Students (ages 9-11) may only have mobile devices. Current 3D game is disabled on mobile - consider 2D fallback.

5. **Performance Needs Attention:** Large 3D assets, slow AI API calls, and sequential database queries are bottlenecks.

6. **Accessibility Gaps:** Missing ARIA labels, focus states, semantic HTML. Address during redesign.

7. **Two Design Languages:** Student UI (playful, colorful) vs Teacher UI (professional, clean) - intentional, preserve this distinction.

8. **State Management is Simple:** Zustand stores are straightforward. Focus redesign on UI, not state logic.

9. **API Layer is Solid:** Well-structured API routes. No major changes needed, just optimize queries.

10. **Gamification Works:** Points, levels, badges are engaging. Enhance visual feedback during redesign.

**Next Steps:**
1. Review this document with team
2. Generate v0 component library (Button, Card, Input, etc.)
3. Redesign landing page (quick win)
4. Redesign student dashboard (high impact)
5. Redesign teacher dashboard (high value)
6. Mobile optimization pass
7. Accessibility audit
8. Performance optimization
9. Launch redesigned version

**Questions for v0 Redesign:**
- Should we unify student/teacher color palettes, or keep them distinct?
- Mobile-first approach for teacher UI, or desktop-first?
- Add dark mode to student UI (currently only teacher has it)?
- Replace emojis with custom icons/illustrations?
- Add more animations/micro-interactions, or keep minimal?

---

**Document End**
