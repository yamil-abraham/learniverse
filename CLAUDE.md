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

## Development Commands

### Core Commands
```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking without building
```

### Database Initialization
These scripts must be run in order for a fresh database setup:
```bash
npm run db:init-activities   # Initialize activities schema and tables
npm run db:init-ai          # Initialize AI-related tables (hints, feedback)
npm run db:init-teacher     # Initialize teacher dashboard tables
npm run db:seed-activities  # Seed database with sample math activities
```

### Verification
```bash
npm run verify-vercel    # Verify Vercel configuration before deployment
```

## Architecture & Structure

### Authentication Flow
- **NextAuth.js** with credentials provider handles authentication
- Configuration: `lib/auth/config.ts`
- Route handler: `app/api/auth/[...nextauth]/route.ts`
- Middleware (`middleware.ts`) protects routes and redirects based on roles:
  - Students → `/dashboard/student` or `/game` or `/avatar`
  - Teachers → `/dashboard/teacher`
- Session uses JWT strategy with 30-day expiration

### Database Architecture
The application uses **Vercel Postgres** with three main schema files:
- `lib/db/schema.sql` - Core user and student tables
- `lib/db/activities-schema.sql` - Math activities and attempts
- `lib/db/ai-schema.sql` - AI hints and feedback caching
- `lib/db/teacher-schema.sql` - Teacher dashboard analytics

**Database Helpers:**
- `lib/db/client.ts` - Database client with helper functions (`executeQuery`, `executeInsert`, `executeUpdate`, etc.)
- `lib/db/queries.ts` - Student-related queries
- `lib/db/teacher-queries.ts` - Teacher dashboard queries

### State Management (Zustand)
Located in `stores/`:
- `gameStore.ts` - Game state, current activity, timer, hints, AI feedback, session stats
- `avatarStore.ts` - Avatar customization (body type, skin color, hair, clothes, accessories)

### Key API Routes Structure
```
app/api/
├── activities/      # Fetch math activities by type/difficulty
├── ai/             # OpenAI integration (hints, feedback, difficulty adaptation)
├── auth/           # NextAuth handlers
├── avatar/         # Avatar customization persistence
├── health/         # Health check endpoint
├── stats/          # Student statistics and progress
└── teacher/        # Teacher dashboard data
```

### 3D System (React Three Fiber)
Located in `components/3d/`:
- `Avatar.tsx` - Main 3D avatar component using Three.js primitives
- `MainScene.tsx` - Scene setup with camera, lighting
- `Environment.tsx` - Environmental effects
- `ErrorFallback.tsx` - Error boundary for 3D rendering failures
- `Loader.tsx` - Loading state for 3D assets

**Important:** Next.js config transpiles Three.js packages (`next.config.mjs`)

### AI Integration
Located in `lib/ai/`:
- `openai-client.ts` - OpenAI API wrapper with GPT-4o-mini
- `difficulty-adapter.ts` - Adaptive difficulty based on student performance
- `cache.ts` - Response caching to reduce API calls
- `rate-limiter.ts` - Rate limiting for OpenAI requests
- `error-handler.ts` - AI-specific error handling

**AI Features:**
- Progressive hints (3 levels)
- Personalized feedback based on attempt history
- Adaptive difficulty adjustment
- Motivational encouragement

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

## Important Development Notes

### Environment Variables Required
See `.env.example` for complete list. Critical variables:
- `POSTGRES_URL` and related Vercel Postgres vars
- `OPENAI_API_KEY` for AI features
- `NEXTAUTH_SECRET` for authentication
- `NEXTAUTH_URL` (production URL in deployment)

### Next.js Configuration (`next.config.mjs`)
- ESLint disabled during builds (`ignoreDuringBuilds: true`) due to version conflict
- TypeScript checking enabled (`ignoreBuildErrors: false`)
- Three.js packages transpiled
- Webpack configured for canvas externals
- Remote image patterns enabled for all hosts

### Vercel Deployment (`vercel.json`)
- API routes have 30s timeout (AI routes: 60s)
- Special headers for 3D models (.glb, .gltf files)
- CORS enabled for API routes
- Health check endpoint: `/health` → `/api/health`
- Region: `iad1` (US East)

### Code Conventions
- **Language:** Code in English, comments in Spanish, UI text in Spanish
- **Components:** Functional components with hooks
- **File naming:** PascalCase for components, kebab-case for utilities
- **Imports order:** External → internal → relative
- **Commits:** Follow Conventional Commits format

### Common Pitfalls
1. **Three.js SSR Issues:** Always wrap 3D components in dynamic imports with `ssr: false`
2. **Database Initialization:** Run db:init scripts in the correct order
3. **Tailwind Dynamic Classes:** Must use complete class names (see resolved bugs in commit history)
4. **Session Types:** Extend NextAuth types in `lib/auth/config.ts` for custom fields
5. **AI Rate Limits:** Use the built-in rate limiter in `lib/ai/rate-limiter.ts`

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

## Additional Documentation
- `INSTALLATION.md` - Complete setup guide
- `README.md` - Project overview and features
- `CLAUDE_CONTEXT.md` - Original TFG context
- `docs/DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `docs/VIDEO_DEMO_SCRIPT.md` - Demo script
- `docs/BUGS.md` - Known issues and resolutions
