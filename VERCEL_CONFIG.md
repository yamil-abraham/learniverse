# Configuración de Vercel para Learniverse

Este documento explica la configuración optimizada de `vercel.json` para el proyecto.

## Tabla de Contenidos

1. [Configuración de Funciones Serverless](#configuración-de-funciones-serverless)
2. [Headers de Cache y Seguridad](#headers-de-cache-y-seguridad)
3. [Optimización de Build](#optimización-de-build)
4. [Integración con GitHub](#integración-con-github)
5. [Regiones y Performance](#regiones-y-performance)

## Configuración de Funciones Serverless

### Timeouts Configurados

```json
"functions": {
  "app/api/**/*.ts": {
    "maxDuration": 30,
    "memory": 1024
  },
  "app/api/ai/**/*.ts": {
    "maxDuration": 60,
    "memory": 1024
  },
  "app/api/speech/**/*.ts": {
    "maxDuration": 60,
    "memory": 1024
  }
}
```

**Explicación:**
- **API Routes generales**: 30 segundos (suficiente para CRUD y operaciones básicas)
- **Rutas de IA** (`/api/ai/*`): 60 segundos (OpenAI puede tardar en responder)
- **Rutas de Speech** (`/api/speech/*`): 60 segundos (Azure Speech Services puede ser lento)
- **Memoria**: 1024 MB para todas (balance entre costo y rendimiento)

### Límites según Plan de Vercel

| Plan | Límite de Duración |
|------|-------------------|
| Hobby | 10s |
| Pro | 60s |
| Enterprise | 900s (15 min) |

**Nota**: Con el plan Hobby, las rutas de IA/Speech necesitarán ajuste a 10s o upgrade del plan.

## Headers de Cache y Seguridad

### 1. Cache de Modelos 3D

```json
{
  "source": "/models/:path*",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    }
  ]
}
```

**Beneficios:**
- `max-age=31536000`: Cache por 1 año (modelos no cambian)
- `immutable`: El navegador no revalida, mejora rendimiento
- Reduce tráfico y latencia en carga de avatares 3D

### 2. Headers para archivos GLB/GLTF

```json
{
  "source": "/(.*).glb",
  "headers": [
    {
      "key": "Content-Type",
      "value": "model/gltf-binary"
    },
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    },
    {
      "key": "Access-Control-Allow-Origin",
      "value": "*"
    }
  ]
}
```

**Formatos soportados:**
- `.glb`: Formato binario GLTF (recomendado para producción)
- `.gltf`: Formato JSON GLTF (útil para desarrollo)

**CORS habilitado** para permitir carga desde CDN o dominios externos.

### 3. Headers de Seguridad

```json
{
  "key": "X-Content-Type-Options",
  "value": "nosniff"
}
```

| Header | Valor | Propósito |
|--------|-------|-----------|
| `X-Content-Type-Options` | `nosniff` | Previene MIME sniffing |
| `X-Frame-Options` | `DENY` | Previene clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Protección XSS legacy |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control de referrer |
| `Permissions-Policy` | `camera=(), microphone=(self)` | Permisos de navegador |

### 4. Headers de API (CORS)

```json
{
  "source": "/api/(.*)",
  "headers": [
    {
      "key": "Access-Control-Allow-Origin",
      "value": "*"
    },
    {
      "key": "Access-Control-Max-Age",
      "value": "86400"
    }
  ]
}
```

**Configuración actual:**
- `Access-Control-Allow-Origin: *` - Permite cualquier origen (desarrollo)
- `Access-Control-Max-Age: 86400` - Cache de preflight por 24h

**Recomendación para producción:**
```json
{
  "key": "Access-Control-Allow-Origin",
  "value": "https://tu-dominio.com"
}
```

## Optimización de Build

### Variables de Entorno

```json
"build": {
  "env": {
    "NEXT_TELEMETRY_DISABLED": "1"
  }
}
```

**Optimizaciones aplicadas:**
- Telemetría deshabilitada para builds más rápidos
- Variables de entorno sensibles van en el dashboard de Vercel

### Configuración de Framework

```json
"framework": "nextjs",
"outputDirectory": ".next"
```

Vercel detecta automáticamente Next.js pero se especifica explícitamente para:
- Evitar detección incorrecta
- Optimizaciones específicas de Next.js
- Build caching inteligente

## Integración con GitHub

```json
"github": {
  "enabled": true,
  "autoAlias": true,
  "autoJobCancelation": true,
  "silent": false
}
```

### Funcionalidades Habilitadas

#### 1. Auto Alias (`autoAlias: true`)
Crea automáticamente URLs para cada branch:
- `main` → `learniverse.vercel.app`
- `dev` → `learniverse-git-dev.vercel.app`
- `feature/avatars` → `learniverse-git-feature-avatars.vercel.app`

#### 2. Auto Job Cancelation (`autoJobCancelation: true`)
Si haces múltiples commits seguidos:
- Cancela builds anteriores en cola
- Solo ejecuta el build más reciente
- Ahorra tiempo y recursos

#### 3. Notificaciones (`silent: false`)
Comentarios automáticos en Pull Requests:
```
✅ Deployment Preview ready!
🔗 https://learniverse-git-feature-123.vercel.app
```

### Workflow Recomendado

1. **Crear Pull Request**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   git push origin feature/nueva-funcionalidad
   ```

2. **Vercel crea deployment preview automáticamente**
   - URL única para testing
   - Aislado de producción

3. **Merge a main**
   ```bash
   git checkout main
   git merge feature/nueva-funcionalidad
   git push
   ```
   - Deploy automático a producción

## Regiones y Performance

```json
"regions": ["iad1"]
```

**Región configurada:**
- `iad1`: Washington D.C., USA (Este)

### Otras Regiones Disponibles

| Código | Ubicación | Recomendado para |
|--------|-----------|------------------|
| `iad1` | Washington D.C., USA | Norteamérica Este |
| `sfo1` | San Francisco, USA | Norteamérica Oeste |
| `gru1` | São Paulo, Brasil | Latinoamérica |
| `fra1` | Frankfurt, Alemania | Europa |
| `hnd1` | Tokio, Japón | Asia |
| `syd1` | Sídney, Australia | Oceanía |

**Para tu TFG en República Dominicana:**
- `iad1` es óptima (latencia ~50-100ms)
- Alternativa: `gru1` para Latinoamérica

### Configuración Multi-Región (Enterprise)

```json
"regions": ["iad1", "gru1"]
```

Vercel enruta automáticamente al edge más cercano.

## Rewrites y Redirects

### Health Check Endpoint

```json
"rewrites": [
  {
    "source": "/health",
    "destination": "/api/health"
  }
]
```

**Uso:**
```bash
curl https://learniverse.vercel.app/health
# → 200 OK
```

### Redirects Permanentes

```json
"redirects": [
  {
    "source": "/home",
    "destination": "/",
    "permanent": true
  }
]
```

**Tipos de redirects:**
- `permanent: true` → HTTP 308 (indexado por buscadores)
- `permanent: false` → HTTP 307 (temporal)

## URLs y Configuración

### Configuración de URLs

```json
"trailingSlash": false,
"cleanUrls": true
```

**Comportamiento:**
- `/about` ✅ (con cleanUrls)
- `/about.html` ❌ (sin extensión)
- `/about/` ❌ (sin trailing slash)

## Cron Jobs (Preparado para uso futuro)

```json
"crons": []
```

**Ejemplo para uso futuro:**
```json
"crons": [
  {
    "path": "/api/cron/cleanup",
    "schedule": "0 0 * * *"
  },
  {
    "path": "/api/cron/reports",
    "schedule": "0 9 * * 1"
  }
]
```

**Casos de uso:**
- Limpieza de sesiones expiradas (diario)
- Generación de reportes de progreso (semanal)
- Backups automáticos

## Monitoreo y Analytics

### Métricas Disponibles en Vercel Dashboard

1. **Web Vitals**
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

2. **Function Invocations**
   - Número de llamadas
   - Duración promedio
   - Errores

3. **Bandwidth**
   - Tráfico total
   - Por ruta
   - Por región

## Deployment

### Comando Manual

```bash
npm install -g vercel
vercel --prod
```

### Variables de Entorno en Vercel

Configurar en Dashboard → Settings → Environment Variables:

```env
# Database
POSTGRES_URL=***
POSTGRES_PRISMA_URL=***

# APIs
OPENAI_API_KEY=***
AZURE_SPEECH_KEY=***
AZURE_SPEECH_REGION=***

# Auth
NEXTAUTH_SECRET=***
NEXTAUTH_URL=https://learniverse.vercel.app
```

## Troubleshooting

### Error: Function timeout exceeded

**Solución:**
1. Verificar plan de Vercel (Hobby = 10s max)
2. Optimizar código para respuestas más rápidas
3. Considerar background jobs para tareas largas

### Error: Headers not applied

**Solución:**
1. Verificar sintaxis JSON
2. Limpiar cache del navegador
3. Verificar en Network tab de DevTools

### Error: Build failed

**Solución:**
1. Ejecutar `npm run build` localmente
2. Verificar errores de TypeScript
3. Revisar logs en Vercel Dashboard

## Mejores Prácticas

1. **Cache Agresivo para Assets Estáticos**
   - Modelos 3D: 1 año
   - Imágenes: 1 año
   - Usar versioning en nombres de archivo

2. **Seguridad**
   - Nunca exponer API keys en código cliente
   - Usar variables de entorno
   - Validar inputs en serverless functions

3. **Performance**
   - Comprimir modelos 3D con Draco
   - Usar formatos WebP para imágenes
   - Lazy loading de componentes pesados

4. **Monitoreo**
   - Configurar Vercel Analytics
   - Implementar health checks
   - Logs estructurados

## Recursos Adicionales

- [Vercel Configuration Docs](https://vercel.com/docs/configuration)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Headers Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)

---

**Última actualización:** Octubre 2025
**Proyecto:** Learniverse TFG
