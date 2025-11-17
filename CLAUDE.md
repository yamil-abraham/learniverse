# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Learniverse is a gamified educational platform for teaching mathematics to students aged 9-11, featuring 3D customizable avatars and an AI-powered adaptive learning system. This is a TFG (Trabajo Final de Grado) project for Ingeniería en Inteligencia Artificial y Robótica (2025).

**Tech Stack:**
- Next.js 14 (App Router) with TypeScript
- React Three Fiber for 3D graphics (Three.js)
- Vercel Postgres for database
- NextAuth.js for authentication
- OpenAI GPT-4o-mini for AI feedback
- Zustand for state management
- Tailwind CSS for styling

**Deployed at:** https://learniverse.vercel.app

## Quick Reference

**Fresh database setup (run in order):**
```bash
npm run db:init-activities && npm run db:init-ai && npm run db:init-teacher && npm run db:init-teacher-voice && npm run db:seed-activities
```

**Common development workflow:**
```bash
npm run type-check    # Check types before committing
npm run build         # Verify production build works
npm run dev           # Start development server
```

## Development Commands

### Core Commands
```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint (disabled during builds, see note below)
npm run type-check       # Run TypeScript type checking without building
```

**Note:** ESLint is configured but **disabled during builds** (`ignoreDuringBuilds: true` in `next.config.mjs`) due to version conflicts between Next.js 15+ and ESLint. Use `npm run lint` manually during development.

### Database Initialization
These scripts **must be run in order** for a fresh database setup:
```bash
npm run db:init-activities       # Initialize activities schema and tables
npm run db:init-ai              # Initialize AI-related tables (hints, feedback)
npm run db:init-teacher         # Initialize teacher dashboard tables
npm run db:init-teacher-voice   # Initialize teacher voice/speech tables
npm run db:seed-activities      # Seed database with sample math activities
```

### Verification & Testing
```bash
npm run verify-vercel    # Verify Vercel configuration before deployment
npm run verify-voice     # Test OpenAI voice/speech API configuration
```

## Architecture & Structure

### Authentication Flow
- **NextAuth.js** with credentials provider handles authentication
- Configuration: `lib/auth/config.ts`
- Route handler: `app/api/auth/[...nextauth]/route.ts`
- Session uses JWT strategy with 30-day expiration

**Middleware (`middleware.ts`)** protects routes and handles redirects:
- Authenticated users accessing `/login`, `/register`, or `/` are redirected to their role-specific dashboard
- Students can only access: `/dashboard/student`, `/game`, `/avatar`
- Teachers can only access: `/dashboard/teacher`
- Public routes: `/login`, `/register`, `/`, `/api/auth`, `/api/health`, `/_next`, static files
- All other routes require authentication
- Matcher excludes: `/api/health`, `/_next/static`, `/_next/image`, `/favicon.ico`

### Database Architecture
The application uses **Vercel Postgres** with four main schema files:
- `lib/db/schema.sql` - Core user and student tables
- `lib/db/activities-schema.sql` - Math activities and attempts
- `lib/db/ai-schema.sql` - AI hints and feedback caching
- `lib/db/teacher-schema.sql` - Teacher dashboard analytics
- Teacher voice schema (initialized via `db:init-teacher-voice`)

**Database Helpers:**
- `lib/db/client.ts` - Database client with helper functions:
  - `executeQuery<T>()` - SELECT queries returning multiple rows
  - `executeQuerySingle<T>()` - SELECT queries returning one row
  - `executeInsert<T>()` - INSERT with RETURNING clause
  - `executeUpdate<T>()` - UPDATE with RETURNING clause
  - `executeDelete()` - DELETE returning row count
  - `executeTransaction()` - Execute multiple queries in transaction
  - `testConnection()` - Verify database connectivity
- `lib/db/queries.ts` - Student-related queries (progress, stats, attempts)
- `lib/db/teacher-queries.ts` - Teacher dashboard queries (analytics, student management)
- `lib/db/teacher-voice-queries.ts` - Teacher voice interaction queries (conversations, speech logs)

### State Management (Zustand)
Located in `stores/`:
- `gameStore.ts` - Game state, current activity, timer, hints, AI feedback, session stats
- `avatarStore.ts` - Avatar customization (body type, skin color, hair, clothes, accessories)
- `teacherStore.ts` - Teacher dashboard state (selected student, filters, view modes)

### Key API Routes Structure
```
app/api/
├── activities/      # Fetch math activities by type/difficulty
├── ai/             # OpenAI integration (hints, feedback, difficulty adaptation)
├── auth/           # NextAuth handlers ([...nextauth])
├── avatar/         # Avatar customization persistence
├── debug/          # Debug endpoints (development only)
├── health/         # Health check endpoint
├── stats/          # Student statistics and progress
├── student/        # Student-specific operations
├── teacher/        # Teacher dashboard data (analytics, student management)
└── teacher-voice/  # Teacher voice interactions (TTS, STT, conversations)
```

**Important API Notes:**
- All AI and speech routes have 60s timeout (increased from default 30s)
- CORS is enabled for all API routes
- Authentication required for all routes except `/api/auth/*`, `/api/health`, and `/api/debug/*`

### 3D System (React Three Fiber)
Located in `components/3d/`:
- `Avatar.tsx` - Main 3D avatar component using Three.js primitives
- `MainScene.tsx` - Scene setup with camera, lighting
- `Environment.tsx` - Environmental effects
- `ErrorFallback.tsx` - Error boundary for 3D rendering failures
- `Loader.tsx` - Loading state for 3D assets

**3D Teacher System** (located in `components/game/teacher/`):
- `ImmersiveTeacher.tsx` - Main immersive teacher component with voice
- `Teacher3D.tsx` - 3D teacher model with lip-sync animations
- `TeacherOverlay.tsx` - UI overlay for teacher interactions
- `VoiceInput.tsx` - Voice input component for speech-to-text
- `Classroom.tsx` - 3D classroom environment
- `Whiteboard.tsx` - Interactive whiteboard for math visualizations
- `MathVisualizer.tsx` - Visualizes math problems in 3D space
- `TeacherSelector.tsx` - Select different teacher avatars
- `TeacherScene.tsx` - Scene setup for teacher environment
- `TeacherContainer.tsx` - Container component managing teacher state

**Important:**
- Next.js config transpiles Three.js packages (`next.config.mjs`)
- Always wrap 3D components in dynamic imports with `ssr: false` to avoid SSR issues
- Teacher 3D features can be toggled via environment variables (see Environment Variables section)

### AI Integration
Located in `lib/ai/`:
- `openai-client.ts` - OpenAI API wrapper with GPT-4o-mini
- `difficulty-adapter.ts` - Adaptive difficulty based on student performance
- `cache.ts` - Response caching to reduce API calls
- `rate-limiter.ts` - Rate limiting for OpenAI requests
- `error-handler.ts` - AI-specific error handling

**Speech & Voice System** (located in `lib/speech/`):
- `tts.ts` - Text-to-speech using OpenAI TTS API (voice: nova, model: tts-1)
- `stt.ts` - Speech-to-text using OpenAI Whisper API (language: es)
- `lip-sync.ts` - Lip-sync animation controller for 3D teacher
- `viseme-mapping.ts` - Phoneme-to-viseme mapping for realistic mouth movements
- `rhubarb/` - Rhubarb Lip Sync executable and utilities for phoneme extraction

**AI Features:**
- Progressive hints (3 levels)
- Personalized feedback based on attempt history
- Adaptive difficulty adjustment
- Motivational encouragement
- Voice conversation with 3D teacher (TTS + STT)
- Lip-synced animations synchronized with speech

### Gamification System
Located in `lib/gamification/`:
- `points.ts` - Points calculation based on difficulty, time, hints used
- `levels.ts` - Level progression and experience requirements
- `badges.ts` - Badge earning conditions (first_correct, speed_demon, persistent, perfect_score, master_[operation])

### Math Activities
5 activity types: addition, subtraction, multiplication, division, fractions
3 difficulty levels: easy, medium, hard

Activities loaded via: `app/api/activities/random/route.ts`

### Type System
All TypeScript types are centralized in `types/index.ts`:
- User roles: `student`, `teacher`, `admin`
- Activity types: `MathActivityType`, `DifficultyLevel`
- Interfaces: `User`, `Student`, `Teacher`, `MathActivity`, `StudentAttempt`, `Badge`, `GameStats`

### Utility Scripts
Located in `scripts/`:
- `init-activities-db.js` - Initialize activities database schema
- `init-ai-db.ts` - Initialize AI tables (hints, feedback cache)
- `init-teacher-db.ts` - Initialize teacher dashboard tables
- `init-teacher-voice-db.ts` - Initialize teacher voice/speech tables
- `seed-activities.js` - Seed database with sample math activities
- `verify-vercel-config.js` - Verify Vercel deployment configuration
- `verify-openai-voice.ts` - Test OpenAI voice API connectivity
- `test-teacher-voice.ts` - Test teacher voice functionality
- `generate-docs.js` - Generate documentation
- `fix-dynamic-routes.sh` - Fix dynamic route issues
- `add-dynamic-export.js` - Add dynamic export configuration

## Important Development Notes

### Environment Variables Required
See `.env.example` for complete list. Critical variables:

**Database (Required):**
- `POSTGRES_URL` and related Vercel Postgres vars

**AI & Voice (Required):**
- `OPENAI_API_KEY` - For AI feedback, hints, TTS, and STT
- `OPENAI_ORGANIZATION_ID` - Optional OpenAI org ID
- `OPENAI_TTS_VOICE` - TTS voice (default: nova)
- `OPENAI_TTS_MODEL` - TTS model (default: tts-1)
- `OPENAI_WHISPER_LANGUAGE` - STT language (default: es)

**Authentication (Required):**
- `NEXTAUTH_SECRET` - Secret for JWT signing
- `NEXTAUTH_URL` - App URL (http://localhost:3000 in dev, production URL in deployment)

**Optional Services:**
- `AZURE_SPEECH_KEY` - Azure Speech Services (alternative to OpenAI)
- `AZURE_SPEECH_REGION` - Azure region

**Feature Flags (Optional):**
- `NEXT_PUBLIC_ENABLE_TEACHER_VOICE` - Enable/disable 3D teacher voice (default: true)
- `NEXT_PUBLIC_TEACHER_FULLSCREEN` - Allow fullscreen teacher mode (default: true)
- `NEXT_PUBLIC_TEACHER_VOICE_INPUT` - Enable voice input (default: true)
- `NEXT_PUBLIC_TEACHER_WHITEBOARD` - Enable interactive whiteboard (default: true)
- `NEXT_PUBLIC_TEACHER_ANIMATIONS` - Enable teacher animations (default: true)
- `NEXT_PUBLIC_TEACHER_MOBILE_ENABLED` - Enable teacher on mobile (default: false)
- `NEXT_PUBLIC_MAX_AUDIO_DURATION` - Max audio duration in seconds (default: 120)

### Next.js Configuration (`next.config.mjs`)
- TypeScript checking enabled (`ignoreBuildErrors: false`)
- Three.js packages transpiled: `three`, `@react-three/fiber`, `@react-three/drei`
- Webpack configured for canvas externals (required for Three.js SSR compatibility)
- Remote image patterns enabled for all hosts
- Turbopack enabled for Next.js 15+ compatibility
- React strict mode enabled

### Vercel Deployment (`vercel.json`)
- API routes have 30s timeout (AI and speech routes: 60s)
- Memory: 1024MB for all API routes
- Special headers for 3D models (.glb, .gltf files)
- CORS enabled for API routes
- Health check endpoint: `/health` → `/api/health`
- Region: `iad1` (US East)
- Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, etc.

### Code Conventions
- **Language:** Code in English, comments in Spanish, UI text in Spanish
- **Components:** Functional components with hooks
- **File naming:** PascalCase for components, kebab-case for utilities
- **Imports order:** External → internal → relative
- **Commits:** Follow Conventional Commits format

### Common Pitfalls
1. **Three.js SSR Issues:** Always wrap 3D components in dynamic imports with `ssr: false`
2. **Database Initialization:** Run db:init scripts in the correct order: activities → ai → teacher → teacher-voice
3. **Tailwind Dynamic Classes:** Must use complete class names (see resolved bugs in commit history)
4. **Session Types:** Extend NextAuth types in `lib/auth/config.ts` for custom fields
5. **AI Rate Limits:** Use the built-in rate limiter in `lib/ai/rate-limiter.ts`
6. **Voice/Audio on Mobile:** Teacher voice features are disabled on mobile by default (performance)
7. **OpenAI API Keys:** Ensure OPENAI_API_KEY is set for both AI feedback AND voice features
8. **Database Client:** Always use helper functions from `lib/db/client.ts` instead of raw SQL queries for type safety and error handling

### Testing User Roles
- Students can access: `/dashboard/student`, `/game`, `/avatar`
- Teachers can access: `/dashboard/teacher`
- Middleware enforces role-based access

## Project Phases (All Completed)
1. Authentication & Database ✅
2. 3D Avatar System ✅
3. Activity Bank & Gamification ✅
4. AI Adaptive Learning ✅
5. Teacher Dashboard ✅
6. Integration, Testing & Deployment ✅

## Troubleshooting Common Issues

**Database Connection Errors:**
```bash
# Test database connection
npm run verify-vercel
# Re-initialize database in order
npm run db:init-activities && npm run db:init-ai && npm run db:init-teacher && npm run db:init-teacher-voice
```

**3D Rendering Issues:**
- Ensure all 3D components are wrapped in `dynamic(() => import(...), { ssr: false })`
- Check browser console for WebGL errors
- Verify Three.js packages are listed in `transpilePackages` in `next.config.mjs`

**Build Failures:**
```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run type-check  # Check for TypeScript errors first
npm run build
```

**OpenAI API Issues:**
- Verify `OPENAI_API_KEY` is set in `.env.local`
- Check API rate limits in `lib/ai/rate-limiter.ts`
- Review cached responses in `lib/ai/cache.ts`

**Authentication Issues:**
- Ensure `NEXTAUTH_SECRET` is set (generate with: `openssl rand -base64 32`)
- Verify `NEXTAUTH_URL` matches your current environment
- Check middleware configuration in `middleware.ts`

## Additional Documentation
- `INSTALACION.md` - Guía completa de instalación (Spanish, most detailed)
- `INSTALLATION.md` - Complete setup guide (English)
- `README.md` - Project overview and features
- `CLAUDE_CONTEXT.md` - Original TFG context
- `docs/DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `docs/VIDEO_DEMO_SCRIPT.md` - Demo script
- `docs/BUGS.md` - Known issues and resolutions
