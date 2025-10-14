# Guía de Configuración - Learniverse

## Proyecto Inicializado Correctamente ✓

Este documento resume la configuración inicial del proyecto y los próximos pasos.

## Lo que se ha configurado

### 1. Stack Tecnológico
- ✓ Next.js 14.2.33 con App Router
- ✓ React 18.3.1
- ✓ TypeScript 5.9.3 (modo strict)
- ✓ Tailwind CSS 4.1.14
- ✓ Three.js 0.180.0
- ✓ React Three Fiber 8.17.10
- ✓ React Three Drei 9.114.3

### 2. Dependencias Instaladas

**Producción:**
- `@react-three/drei` - Helpers para React Three Fiber
- `@react-three/fiber` - React renderer para Three.js
- `@vercel/postgres` - Cliente de base de datos
- `class-variance-authority` - Utilidad para variantes de clases
- `clsx` - Utilidad para clases condicionales
- `openai` - Cliente de OpenAI API
- `three` - Librería 3D
- `zod` - Validación de schemas
- `zustand` - Estado global

**Desarrollo:**
- `@types/node`, `@types/react`, `@types/react-dom`, `@types/three`
- `autoprefixer` - PostCSS plugin
- `eslint`, `eslint-config-next`
- `postcss`
- `tailwindcss`
- `typescript`

### 3. Estructura de Carpetas Creada

```
learniverse/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout raíz con metadata
│   ├── page.tsx           # Página principal
│   ├── globals.css        # Estilos globales + Tailwind
│   └── api/               # API Routes (vacío, listo para usar)
├── components/            # Componentes React
│   ├── 3d/               # RotatingCube.tsx, Scene3D.tsx
│   ├── ui/               # (vacío)
│   ├── game/             # (vacío)
│   ├── auth/             # (vacío)
│   └── dashboard/        # (vacío)
├── lib/                   # Lógica de negocio
│   ├── utils/            # cn.ts (helper de clases)
│   └── api/              # (vacío)
├── types/                 # Tipos TypeScript
│   ├── index.ts          # Tipos principales
│   └── three.d.ts        # Tipos de Three.js
├── hooks/                 # Custom hooks (vacío)
├── stores/                # Zustand stores
│   └── gameStore.ts      # Store del juego
├── config/                # Configuración (vacío)
├── public/                # Estáticos
│   ├── assets/           # (vacío)
│   └── models/           # (vacío)
└── middleware/            # Middlewares (vacío)
```

### 4. Archivos de Configuración

- ✓ `tsconfig.json` - TypeScript con paths aliases
- ✓ `tailwind.config.ts` - Configuración de Tailwind con colores personalizados
- ✓ `postcss.config.mjs` - PostCSS para Tailwind
- ✓ `next.config.mjs` - Next.js con transpilación de Three.js
- ✓ `.eslintrc.json` - ESLint con reglas de Next.js
- ✓ `vercel.json` - Configuración de Vercel
- ✓ `.env.example` - Template de variables de entorno
- ✓ `.gitignore` - Archivos ignorados por Git

### 5. Scripts NPM Configurados

```bash
npm run dev         # Servidor de desarrollo (puerto 3000)
npm run build       # Build de producción
npm run start       # Servidor de producción
npm run lint        # Ejecutar ESLint
npm run type-check  # Verificar tipos de TypeScript
```

### 6. Componentes de Ejemplo

- `components/3d/RotatingCube.tsx` - Cubo 3D animado
- `components/3d/Scene3D.tsx` - Canvas wrapper para escenas 3D
- `lib/utils/cn.ts` - Utilidad para combinar clases CSS
- `stores/gameStore.ts` - Store global del juego con Zustand
- `types/index.ts` - Tipos principales del dominio

## Próximos Pasos Recomendados

### Inmediato (Sprint 1)
1. **Configurar base de datos**
   ```bash
   # Instalar Prisma (recomendado para Vercel Postgres)
   npm install prisma @prisma/client
   npx prisma init
   ```

2. **Probar la aplicación**
   ```bash
   npm run dev
   ```
   Visita http://localhost:3000

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Editar .env.local con tus credenciales
   ```

### Corto Plazo (Sprint 2-3)

1. **Sistema de Autenticación**
   - Instalar NextAuth.js: `npm install next-auth`
   - Configurar proveedores (Google, email/password)
   - Crear rutas protegidas

2. **Modelos 3D y Avatares**
   - Diseñar/obtener modelos 3D de avatares
   - Implementar sistema de personalización
   - Crear componentes de avatar interactivo

3. **Banco de Actividades**
   - Diseñar schema de base de datos para actividades
   - Crear CRUD de actividades
   - Implementar sistema de categorías y dificultad

### Medio Plazo (Sprint 4-6)

1. **Integración con OpenAI**
   - Configurar API de OpenAI
   - Implementar generación de ejercicios
   - Sistema de retroalimentación adaptativa

2. **Azure Speech Services**
   - Configurar credenciales de Azure
   - Implementar text-to-speech
   - Implementar speech-to-text

3. **Dashboard de Docentes**
   - Vistas de progreso de estudiantes
   - Estadísticas y reportes
   - Asignación de actividades

## Recursos y Documentación

### Documentación Oficial
- [Next.js 14 Docs](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

### Tutoriales Recomendados
- Three.js Journey (para 3D avanzado)
- Vercel Learn (Next.js best practices)
- OpenAI Cookbook (ejemplos de IA)

## Troubleshooting

### Error: "Module not found"
```bash
npm install
```

### Error de tipos con Three.js
Los componentes 3D tienen `@ts-nocheck` por compatibilidad. Para habilitar tipos completos:
```bash
npm install -D @types/three
```

### Puerto 3000 en uso
```bash
# En Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Usar otro puerto
npm run dev -- -p 3001
```

## Notas de Desarrollo

- Todos los componentes 3D deben usar `'use client'`
- Los path aliases (`@/`) están configurados en `tsconfig.json`
- Tailwind está configurado con colores primary y secondary personalizados
- El proyecto usa el font Inter de Google Fonts
- Los commits deben seguir Conventional Commits

## Soporte

Para dudas o problemas:
1. Revisar la documentación oficial
2. Consultar el archivo `CLAUDE_CONTEXT.md`
3. Revisar los README en cada carpeta del proyecto

---

**Última actualización:** Octubre 2025
**Versión del proyecto:** 1.0.0
**Node.js requerido:** 18.x o superior
