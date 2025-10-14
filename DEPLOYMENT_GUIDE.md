# Guía de Deployment a Vercel

Guía rápida para desplegar Learniverse en Vercel.

## Prerrequisitos

- [x] Cuenta de GitHub
- [x] Cuenta de Vercel (gratis en vercel.com)
- [x] Repositorio de GitHub con el código

## Opción 1: Deployment desde GitHub (Recomendado)

### Paso 1: Subir código a GitHub

```bash
# Si aún no has inicializado git
git init
git add .
git commit -m "Initial commit: Learniverse project setup"

# Crear repositorio en GitHub y conectarlo
git remote add origin https://github.com/tu-usuario/learniverse.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New Project"**
3. **Import Git Repository**
   - Selecciona tu repositorio `learniverse`
   - Click **"Import"**

4. **Configure Project**
   - Framework Preset: `Next.js` (detectado automáticamente)
   - Root Directory: `./` (por defecto)
   - Build Command: `npm run build` (por defecto)
   - Output Directory: `.next` (por defecto)

5. **Environment Variables** (click "Add")
   ```
   POSTGRES_URL=***
   POSTGRES_PRISMA_URL=***
   OPENAI_API_KEY=***
   AZURE_SPEECH_KEY=***
   AZURE_SPEECH_REGION=***
   NEXTAUTH_SECRET=*** (genera uno con: openssl rand -base64 32)
   NEXTAUTH_URL=https://tu-proyecto.vercel.app
   ```

6. Click **"Deploy"**

### Paso 3: Verificar Deployment

Una vez desplegado, Vercel te dará:
- URL de producción: `https://learniverse.vercel.app`
- Preview URL: `https://learniverse-git-main.vercel.app`

**Probar endpoints:**
```bash
# Health check
curl https://learniverse.vercel.app/health

# Debe retornar JSON con status: "healthy"
```

## Opción 2: Deployment desde CLI

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Login

```bash
vercel login
```

### Paso 3: Deploy

```bash
# Preview deployment (para testing)
vercel

# Production deployment
vercel --prod
```

### Paso 4: Configurar Variables de Entorno

```bash
# Agregar variable
vercel env add OPENAI_API_KEY production

# Listar variables
vercel env ls
```

## Configuración Post-Deployment

### 1. Verificar Build

En el dashboard de Vercel:
- **Deployments** → Ver logs del build
- Verificar que no hay errores

### 2. Configurar Dominio Personalizado (Opcional)

1. **Domains** → **Add Domain**
2. Ingresa tu dominio (ej: `learniverse.edu.do`)
3. Sigue instrucciones para configurar DNS

### 3. Habilitar Analytics

1. **Analytics** → **Enable**
2. Monitorear Web Vitals (LCP, FID, CLS)

### 4. Configurar Alerts

**Vercel Dashboard** → **Settings** → **Alerts**
- Build failures
- Deployment errors
- Performance degradation

## Workflow de Desarrollo

### Branches y Deployments

Vercel crea deployments automáticos:

| Branch | URL | Tipo |
|--------|-----|------|
| `main` | `learniverse.vercel.app` | Production |
| `dev` | `learniverse-git-dev.vercel.app` | Preview |
| `feature/*` | `learniverse-git-feature-*.vercel.app` | Preview |

### Proceso Recomendado

```bash
# 1. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y commitear
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 3. Push para crear preview
git push origin feature/nueva-funcionalidad

# Vercel crea preview automáticamente
# URL: https://learniverse-git-feature-nueva-funcionalidad.vercel.app

# 4. Crear Pull Request en GitHub
# Vercel comenta en el PR con link al preview

# 5. Después de review, merge a main
git checkout main
git merge feature/nueva-funcionalidad
git push origin main

# Vercel despliega a producción automáticamente
```

## Verificación de Configuración

### Antes de desplegar

```bash
# Verificar configuración de Vercel
npm run verify-vercel

# Type check
npm run type-check

# Build local
npm run build
```

### Después de desplegar

```bash
# Health check
curl https://tu-proyecto.vercel.app/health

# Verificar headers de cache
curl -I https://tu-proyecto.vercel.app/models/avatar.glb

# Debe mostrar:
# Cache-Control: public, max-age=31536000, immutable
```

## Troubleshooting

### Error: Build Failed

**Solución:**
1. Verificar build local funciona: `npm run build`
2. Revisar logs en Vercel Dashboard
3. Verificar variables de entorno están configuradas

### Error: API Routes timeout

**Causas comunes:**
- Plan Hobby limita a 10s
- API externa (OpenAI, Azure) tarda mucho

**Solución:**
1. Optimizar llamadas a APIs
2. Implementar caching
3. Upgrade a plan Pro (60s timeout)

### Error: Headers no se aplican

**Solución:**
1. Verificar sintaxis de `vercel.json`
2. Limpiar cache del navegador
3. Hacer hard reload (Ctrl+Shift+R)

### Error: Variables de entorno no definidas

**Solución:**
1. Vercel Dashboard → Settings → Environment Variables
2. Verificar que estén en el ambiente correcto (Production/Preview)
3. Re-deploy después de agregar variables

## Monitoreo

### Logs en tiempo real

```bash
vercel logs
vercel logs --follow
```

### Métricas importantes

**En Vercel Dashboard:**
1. **Analytics**
   - Core Web Vitals
   - Real User Monitoring

2. **Speed Insights**
   - LCP (< 2.5s objetivo)
   - FID (< 100ms objetivo)
   - CLS (< 0.1 objetivo)

3. **Functions**
   - Invocations
   - Duration
   - Errors

## Optimizaciones

### 1. Edge Functions (Futuro)

Para funciones ultra-rápidas:
```typescript
// app/api/edge-example/route.ts
export const runtime = 'edge'

export async function GET() {
  return new Response('Hello from Edge!')
}
```

### 2. ISR (Incremental Static Regeneration)

Para páginas que cambian poco:
```typescript
// app/activities/[id]/page.tsx
export const revalidate = 3600 // Revalidar cada hora
```

### 3. Image Optimization

Usar Next.js Image:
```tsx
import Image from 'next/image'

<Image
  src="/assets/avatar.png"
  width={500}
  height={500}
  alt="Avatar"
/>
```

## Security Checklist

Antes de producción:

- [ ] Todas las API keys en variables de entorno
- [ ] CORS configurado correctamente
- [ ] Headers de seguridad habilitados
- [ ] Rate limiting implementado (en futuro)
- [ ] Input validation en API routes
- [ ] HTTPS forzado (Vercel lo hace automáticamente)

## Costos

### Plan Hobby (Gratis)
- ✅ 100 GB bandwidth
- ✅ Serverless Functions: 100 GB-hours
- ✅ Deployments ilimitados
- ⚠️ 10s timeout
- ⚠️ Sin SLA

### Plan Pro ($20/mes)
- ✅ 1 TB bandwidth
- ✅ 1000 GB-hours Functions
- ✅ 60s timeout
- ✅ Analytics avanzados
- ✅ SLA 99.99%

**Recomendación para TFG:** Empezar con Hobby, upgrade a Pro si necesitas timeouts mayores.

## Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## Soporte

**Problemas comunes:**
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Next.js Discord](https://discord.gg/nextjs)

**Para este proyecto:**
- Revisar `VERCEL_CONFIG.md` para detalles de configuración
- Ejecutar `npm run verify-vercel` antes de desplegar
- Consultar logs en Vercel Dashboard

---

**Última actualización:** Octubre 2025
**Proyecto:** Learniverse TFG
