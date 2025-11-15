const fs = require('fs');
const path = require('path');

// Ensure docs directory exists
if (!fs.existsSync('docs')) {
  fs.mkdirSync('docs');
}

// INSTALLATION.md
const installationMd = `# Learniverse - Guía de Instalación

## Prerequisitos

- Node.js 18.x o superior
- npm o yarn  
- Git
- Cuenta de Vercel (para deployment)
- API key de OpenAI
- Base de datos Vercel Postgres o Supabase

## Paso 1: Clonar el Repositorio

\`\`\`bash
git clone https://github.com/yamil-abraham/learniverse.git
cd learniverse
\`\`\`

## Paso 2: Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

## Paso 3: Configurar Variables de Entorno

Crea un archivo \`.env.local\` en la raíz del proyecto:

\`\`\`env
# Database (Vercel Postgres o Supabase)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# NextAuth
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

### Generar NEXTAUTH_SECRET:

\`\`\`bash
openssl rand -base64 32
\`\`\`

## Paso 4: Inicializar la Base de Datos

\`\`\`bash
# Ejecutar migraciones
npm run db:init-activities
npm run db:init-ai
npm run db:init-teacher
\`\`\`

## Paso 5: Ejecutar el Servidor de Desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Solución de Problemas

### Problemas de Conexión a la Base de Datos
- Verifica que POSTGRES_URL sea correcta
- Asegúrate de que la base de datos esté activa

### Avatar 3D No Se Renderiza
- Revisa la consola del navegador
- Verifica que WebGL esté soportado

### Errores de OpenAI
- Verifica que la API key sea válida
- Revisa el límite de cuota

## Deployment en Producción

Consulta DEPLOYMENT_CHECKLIST.md para instrucciones detalladas.
`;

fs.writeFileSync('INSTALLATION.md', installationMd);
console.log('✓ Created INSTALLATION.md');

// DEPLOYMENT_CHECKLIST.md
const deploymentMd = `# Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings fixed
- [ ] No console.log in production code
- [ ] Code reviewed

### Testing
- [ ] All test scenarios passed
- [ ] Manual testing complete
- [ ] Cross-browser tested
- [ ] Mobile tested

### Environment
- [ ] Production environment variables set in Vercel
- [ ] API keys valid and working
- [ ] NEXTAUTH_URL set to production domain
- [ ] OpenAI API key has sufficient quota

### Database
- [ ] All migrations run on production DB
- [ ] Backups configured

### Security
- [ ] No API keys in code
- [ ] All routes protected appropriately
- [ ] HTTPS enforced

## Deployment Steps

### 1. Push to GitHub

\`\`\`bash
git add -A
git commit -m "feat: ready for production deployment"
git push origin main
\`\`\`

### 2. Configure Vercel

1. Go to Vercel Dashboard
2. Import project from GitHub
3. Configure environment variables
4. Deploy

### 3. Verify Deployment

- [ ] SSL certificate active
- [ ] Health check endpoint responding
- [ ] Authentication working
- [ ] Database connected
- [ ] 3D avatars rendering
- [ ] AI responses generating

## Post-Deployment

- [ ] Monitor error logs
- [ ] Test all user flows
- [ ] Verify analytics (if configured)
- [ ] Backup database

## Rollback Plan

If deployment fails:

1. Revert to previous deployment in Vercel
2. Check error logs
3. Fix issue in development
4. Test thoroughly
5. Redeploy
`;

fs.writeFileSync('docs/DEPLOYMENT_CHECKLIST.md', deploymentMd);
console.log('✓ Created DEPLOYMENT_CHECKLIST.md');

// VIDEO_DEMO_SCRIPT.md
const videoDemoMd = `# Video Demo Script (3-5 minutos)

## Introducción (30 segundos)

"Hola, soy Yamil y esto es Learniverse - una plataforma educativa gamificada para enseñar matemática a niños de 9-11 años usando avatares 3D y aprendizaje adaptativo con IA."

## Experiencia del Estudiante (90 segundos)

### Registro y Avatar (30 segundos)
- Mostrar registro como estudiante
- Demostrar personalización de avatar
- Resaltar renderizado 3D

### Jugando el Juego (60 segundos)
- Mostrar selección de actividad
- Completar un problema matemático
- Demostrar sistema de pistas
- Mostrar retroalimentación de IA
- Notificación de insignia ganada
- Mostrar subida de nivel

## Sistema Adaptativo con IA (45 segundos)
- Explicar dificultad adaptativa
- Mostrar perfil de aprendizaje
- Demostrar recomendaciones de IA
- Mostrar retroalimentación personalizada

## Dashboard del Docente (60 segundos)
- Login como docente
- Mostrar lista de estudiantes
- Abrir análisis de estudiante
- Mostrar gráficos de rendimiento
- Mostrar sistema de alertas
- Demo de exportación de reporte

## Highlights Técnicos (30 segundos)
- Mencionar tech stack (Next.js, Three.js, OpenAI)
- Arquitectura de base de datos
- Actualizaciones en tiempo real
- Responsive mobile

## Conclusión (15 segundos)

"Learniverse combina tecnologías web modernas con IA para crear una experiencia de aprendizaje personalizada y atractiva para estudiantes de primaria."

## Consejos de Grabación

- Usa OBS Studio o Loom
- Graba en 1080p
- Audio claro sin ruido de fondo
- Ensaya el script
- Mantén bajo 5 minutos
- Muestra el cursor para claridad
`;

fs.writeFileSync('docs/VIDEO_DEMO_SCRIPT.md', videoDemoMd);
console.log('✓ Created VIDEO_DEMO_SCRIPT.md');

// BUGS.md
const bugsMd = `# Known Issues & Bug Fixes

## Critical Bugs (Must Fix)
- [ ] None currently identified

## UI/UX Issues  
- [ ] None currently identified

## Performance Issues
- [ ] None currently identified

## Nice to Have (Optional)
- [ ] Add dark mode toggle in UI
- [ ] Add keyboard shortcuts for navigation
- [ ] Add more avatar customization options

## Fixed Issues

### Fixed in Phase 6
- [x] Added health check endpoint
- [x] Added error logging utility
- [x] Added loading and error components
- [x] Added toast notifications
- [x] Created comprehensive documentation
`;

fs.writeFileSync('docs/BUGS.md', bugsMd);
console.log('✓ Created BUGS.md');

console.log('\n✅ All documentation files created successfully!');
