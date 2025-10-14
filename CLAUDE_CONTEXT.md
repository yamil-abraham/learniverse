# Contexto del Proyecto TFG

## Descripción General
Plataforma educativa web gamificada para enseñanza de Matemática a estudiantes de 9-11 años, con avatares 3D interactivos y sistema inteligente de adaptación de contenido.

## Stack Tecnológico Definido
- **Frontend:** Next.js 14+ (App Router), React 18, React Three Fiber, Three.js
- **Backend:** Next.js API Routes (serverless)
- **Base de datos:** Vercel Postgres (o Supabase como alternativa)
- **IA/ML:** OpenAI ChatGPT API (retroalimentación adaptativa)
- **Voz:** Azure Speech Services (síntesis y reconocimiento)
- **Control de versiones:** Git + GitHub
- **Gestión de tareas:** Linear
- **Deployment:** Vercel

## Módulos Principales
1. Sistema de autenticación (estudiantes y docentes)
2. Motor de juego 3D con avatares personalizables
3. Banco de actividades matemáticas gamificadas
4. Sistema inteligente de adaptación de dificultad
5. Panel de progreso para docentes
6. Interacción por voz (speech-to-text y text-to-speech)

## Arquitectura
- Monorepo con Next.js
- Serverless functions para APIs externas
- Client-side rendering para 3D (Three.js)
- Server-side rendering para SEO y performance

## Prioridades
- Funcionalidad core del prototipo (procesos esenciales)
- Código limpio y bien documentado
- Estructura escalable
- Preparado para integración con Linear (referencias a tickets)

## Requisitos No Funcionales
- Responsive design (desktop + mobile)
- Accesibilidad (WCAG AA)
- Performance (Web Vitals óptimos)
- Seguridad (variables de entorno, validación)