# Guía de Instalación - Learniverse

Esta guía detalla paso a paso cómo instalar, configurar y ejecutar Learniverse en tu entorno de desarrollo local.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Clonación del Repositorio](#clonación-del-repositorio)
3. [Instalación de Dependencias](#instalación-de-dependencias)
4. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
5. [Inicialización de la Base de Datos](#inicialización-de-la-base-de-datos)
6. [Ejecución en Modo Desarrollo](#ejecución-en-modo-desarrollo)
7. [Compilación para Producción](#compilación-para-producción)
8. [Resolución de Problemas Comunes](#resolución-de-problemas-comunes)

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

### Software Requerido

- **Node.js**: Versión 18.x o superior
  - Descarga: https://nodejs.org/
  - Verifica la instalación: `node --version`

- **npm**: Versión 9.x o superior (incluido con Node.js)
  - Verifica la instalación: `npm --version`

- **Git**: Para clonar el repositorio
  - Descarga: https://git-scm.com/
  - Verifica la instalación: `git --version`

### Cuentas y Servicios Necesarios

1. **Vercel Postgres** (Base de Datos)
   - Crea una cuenta en: https://vercel.com/
   - Crea un nuevo proyecto y añade Vercel Postgres
   - Obtén las credenciales de conexión desde el dashboard

2. **OpenAI API** (Inteligencia Artificial)
   - Crea una cuenta en: https://platform.openai.com/
   - Genera una API key desde: https://platform.openai.com/api-keys
   - Asegúrate de tener créditos disponibles en tu cuenta

3. **GitHub** (opcional, para despliegue con Vercel)
   - Crea una cuenta en: https://github.com/

---

## Clonación del Repositorio

Abre tu terminal y ejecuta los siguientes comandos:

```bash
# Clonar el repositorio
git clone https://github.com/yamil-abraham/learniverse.git

# Navegar al directorio del proyecto
cd learniverse
```

Verifica que estás en el directorio correcto:
```bash
# Listar archivos (Windows)
dir

# Listar archivos (macOS/Linux)
ls
```

Deberías ver archivos como `package.json`, `next.config.mjs`, `README.md`, etc.

---

## Instalación de Dependencias

Instala todas las dependencias del proyecto con npm:

```bash
npm install
```

Este proceso puede tardar varios minutos. Una vez completado, verás un mensaje similar a:
```
added 680 packages, and audited 681 packages in 45s
```

### Verificación de la Instalación

Comprueba que las dependencias se instalaron correctamente:

```bash
# Listar las dependencias principales
npm list --depth=0
```

---

## Configuración de Variables de Entorno

Las variables de entorno son esenciales para el funcionamiento de la aplicación.

### 1. Crear el Archivo de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

**Windows (PowerShell):**
```powershell
New-Item -Path .env.local -ItemType File
```

**macOS/Linux:**
```bash
touch .env.local
```

### 2. Configurar las Variables

Abre el archivo `.env.local` con tu editor de texto preferido y añade las siguientes variables:

```env
# ============================================
# BASE DE DATOS (Vercel Postgres)
# ============================================
# Obtén estas credenciales desde tu dashboard de Vercel Postgres
POSTGRES_URL="postgres://usuario:contraseña@host:puerto/database"
POSTGRES_PRISMA_URL="postgres://usuario:contraseña@host:puerto/database?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://usuario:contraseña@host:puerto/database"
POSTGRES_USER="usuario"
POSTGRES_HOST="host.postgres.vercel-storage.com"
POSTGRES_PASSWORD="tu-contraseña"
POSTGRES_DATABASE="verceldb"

# ============================================
# AUTENTICACIÓN (NextAuth.js)
# ============================================
# Genera un secreto único con: openssl rand -base64 32
NEXTAUTH_SECRET="tu-secreto-generado-aqui"
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# OPENAI API
# ============================================
# Obtén tu API key desde: https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-proj-tu-api-key-aqui"
OPENAI_ORGANIZATION_ID=""

# Configuración de voz (OpenAI TTS y Whisper)
OPENAI_TTS_VOICE="nova"
OPENAI_TTS_MODEL="tts-1"
OPENAI_WHISPER_LANGUAGE="es"

# ============================================
# AZURE SPEECH SERVICES (Opcional)
# ============================================
AZURE_SPEECH_KEY=""
AZURE_SPEECH_REGION=""

# ============================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ============================================
# FUNCIONALIDADES DEL PROFESOR 3D
# ============================================
NEXT_PUBLIC_ENABLE_TEACHER_VOICE=true
NEXT_PUBLIC_TEACHER_FULLSCREEN=true
NEXT_PUBLIC_TEACHER_VOICE_INPUT=true
NEXT_PUBLIC_TEACHER_WHITEBOARD=true
NEXT_PUBLIC_TEACHER_ANIMATIONS=true
NEXT_PUBLIC_TEACHER_MOBILE_ENABLED=false
NEXT_PUBLIC_MAX_AUDIO_DURATION=120
```

### 3. Generar NEXTAUTH_SECRET

Genera un secreto seguro para NextAuth:

**Windows (PowerShell):**
```powershell
# Si tienes OpenSSL instalado
openssl rand -base64 32

# Alternativa sin OpenSSL (genera manualmente)
# Usa un generador online: https://generate-secret.vercel.app/32
```

**macOS/Linux:**
```bash
openssl rand -base64 32
```

Copia el resultado y pégalo en la variable `NEXTAUTH_SECRET`.

### 4. Configurar Credenciales de Vercel Postgres

1. Ve a tu dashboard de Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a la pestaña "Storage" > "Postgres"
4. Copia las credenciales desde la sección ".env.local"
5. Pega las variables en tu archivo `.env.local`

---

## Inicialización de la Base de Datos

Learniverse requiere inicializar varias tablas en la base de datos. **Los scripts deben ejecutarse en orden:**

### 1. Inicializar Esquema de Actividades

```bash
npm run db:init-activities
```

Este script crea las tablas para:
- Actividades matemáticas (sumas, restas, multiplicación, división, fracciones)
- Intentos de estudiantes
- Progreso y estadísticas

### 2. Inicializar Tablas de IA

```bash
npm run db:init-ai
```

Este script crea las tablas para:
- Caché de respuestas de IA
- Historial de hints
- Retroalimentación personalizada

### 3. Inicializar Dashboard del Profesor

```bash
npm run db:init-teacher
```

Este script crea las tablas para:
- Clases y estudiantes
- Asignaciones
- Alertas del profesor
- Analíticas

### 4. Inicializar Sistema de Voz del Profesor

```bash
npm run db:init-teacher-voice
```

Este script crea las tablas para:
- Grabaciones de voz
- Sincronización labial
- Historial de interacciones de voz

### 5. Sembrar Datos de Actividades (Opcional)

```bash
npm run db:seed-activities
```

Este script añade actividades de ejemplo a la base de datos para pruebas.

### Verificación de la Inicialización

Comprueba que las tablas se crearon correctamente:

1. Accede a tu dashboard de Vercel Postgres
2. Ve a la pestaña "Data"
3. Verifica que existen las siguientes tablas:
   - `users`
   - `students`
   - `teachers`
   - `math_activities`
   - `student_attempts`
   - `classes`
   - `assignments`
   - `ai_hints_cache`
   - `teacher_voice_recordings`
   - Y más...

---

## Ejecución en Modo Desarrollo

Una vez configurado todo, ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Deberías ver un mensaje similar a:

```
▲ Next.js 16.0.3 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000

✓ Ready in 1.8s
```

### Acceder a la Aplicación

Abre tu navegador y visita:
- **URL local:** http://localhost:3000

### Rutas Disponibles

- **Página principal:** http://localhost:3000/
- **Login:** http://localhost:3000/login
- **Registro:** http://localhost:3000/register
- **Dashboard Estudiante:** http://localhost:3000/dashboard/student
- **Dashboard Profesor:** http://localhost:3000/teacher
- **Juego:** http://localhost:3000/game

### Detener el Servidor

Para detener el servidor de desarrollo, presiona:
```
Ctrl + C
```

---

## Compilación para Producción

Para compilar la aplicación para producción:

### 1. Verificar Tipos de TypeScript

```bash
npm run type-check
```

Este comando verifica que no hay errores de tipos en el código.

### 2. Compilar la Aplicación

```bash
npm run build
```

Este comando:
1. Compila todo el código TypeScript
2. Optimiza los assets (imágenes, CSS, JavaScript)
3. Genera archivos estáticos en `.next/`

La compilación puede tardar varios minutos.

### 3. Ejecutar en Modo Producción

Una vez compilado, ejecuta:

```bash
npm run start
```

La aplicación estará disponible en http://localhost:3000 (modo producción).

### Diferencias entre Desarrollo y Producción

| Característica | Desarrollo | Producción |
|---|---|---|
| Hot Reload | ✅ Sí | ❌ No |
| Optimización | ❌ Mínima | ✅ Completa |
| Source Maps | ✅ Detallados | ⚠️ Simplificados |
| Velocidad | ⚠️ Más lento | ✅ Rápido |
| Debugging | ✅ Fácil | ⚠️ Limitado |

---

## Resolución de Problemas Comunes

### ❌ Error: "Cannot find module"

**Causa:** Dependencias no instaladas o falta de archivos.

**Solución:**
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json  # macOS/Linux
rd /s /q node_modules && del package-lock.json  # Windows

npm install
```

---

### ❌ Error: "EADDRINUSE: address already in use :::3000"

**Causa:** El puerto 3000 ya está en uso.

**Solución 1: Detener el proceso existente**

**Windows:**
```powershell
# Encontrar el proceso usando el puerto 3000
netstat -ano | findstr :3000

# Detener el proceso (reemplaza <PID> con el ID del proceso)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Encontrar el proceso
lsof -ti:3000

# Detener el proceso
kill $(lsof -ti:3000)
```

**Solución 2: Usar otro puerto**
```bash
PORT=3001 npm run dev
```

---

### ❌ Error: "Error connecting to database"

**Causa:** Credenciales de base de datos incorrectas o base de datos no accesible.

**Solución:**
1. Verifica que las variables de entorno en `.env.local` sean correctas
2. Comprueba que tu base de datos de Vercel esté activa
3. Verifica la conexión:
   ```bash
   npm run verify-vercel
   ```

---

### ❌ Error: "OpenAI API error: 401 Unauthorized"

**Causa:** API key de OpenAI inválida o sin créditos.

**Solución:**
1. Verifica que `OPENAI_API_KEY` en `.env.local` sea correcta
2. Comprueba que tienes créditos en tu cuenta de OpenAI: https://platform.openai.com/usage
3. Genera una nueva API key si es necesario

---

### ❌ Error: "Module not found: Can't resolve '@/components/...'"

**Causa:** Alias de importación no configurado correctamente.

**Solución:**
Verifica que `tsconfig.json` tenga configurado el path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

### ❌ Página en blanco después de iniciar

**Causa:** Errores de JavaScript en el navegador.

**Solución:**
1. Abre la consola del navegador (F12)
2. Revisa los errores en la pestaña "Console"
3. Verifica que `.env.local` tenga todas las variables configuradas
4. Limpia la caché del navegador y recarga (Ctrl + Shift + R)

---

### ❌ Error: "Error: Failed to compile"

**Causa:** Errores de TypeScript o sintaxis en el código.

**Solución:**
1. Revisa el terminal para ver el error específico
2. Verifica el archivo mencionado en el error
3. Ejecuta verificación de tipos:
   ```bash
   npm run type-check
   ```

---

### ❌ Imágenes o modelos 3D no cargan

**Causa:** Archivos faltantes o rutas incorrectas.

**Solución:**
1. Verifica que los modelos 3D estén en `public/models/`
2. Comprueba que las rutas en el código sean correctas
3. Limpia la caché de Next.js:
   ```bash
   # Windows
   rd /s /q .next

   # macOS/Linux
   rm -rf .next

   # Luego reinicia el servidor
   npm run dev
   ```

---

### ⚠️ Advertencia: "Unused @ts-expect-error directive"

**Causa:** Directivas de TypeScript obsoletas después de actualizar dependencias.

**Solución:**
Este warning no impide el funcionamiento. Para solucionarlo:
1. Localiza la línea mencionada en el warning
2. Elimina el comentario `@ts-expect-error`
3. Verifica que la compilación funcione sin el comentario

---

### 🐛 Problemas con React Three Fiber (3D)

**Causa:** Versión incompatible con React 19.

**Solución:**
Asegúrate de tener las versiones correctas:
```bash
npm list @react-three/fiber @react-three/drei
```

Deberías ver:
- `@react-three/fiber@9.4.0` o superior
- `@react-three/drei@10.7.7` o superior

Si no es así:
```bash
npm install @react-three/fiber@latest @react-three/drei@latest
```

---

### 📱 Profesor 3D no funciona en móvil

**Causa:** Funcionalidad deshabilitada por defecto en dispositivos móviles (rendimiento).

**Solución:**
Si deseas habilitarlo en móvil, modifica `.env.local`:
```env
NEXT_PUBLIC_TEACHER_MOBILE_ENABLED=true
```

⚠️ **Advertencia:** Esto puede causar problemas de rendimiento en dispositivos móviles.

---

## 🆘 Obtener Ayuda Adicional

Si encuentras problemas no cubiertos en esta guía:

1. **Revisa la documentación oficial:**
   - Next.js: https://nextjs.org/docs
   - React Three Fiber: https://docs.pmnd.rs/react-three-fiber
   - OpenAI API: https://platform.openai.com/docs

2. **Consulta los archivos de documentación del proyecto:**
   - `README.md` - Descripción general del proyecto
   - `INSTALLATION.md` - Guía básica de instalación

3. **Reporta un issue en GitHub:**
   - https://github.com/yamil-abraham/learniverse/issues

---

## ✅ Verificación Final

Para asegurarte de que todo funciona correctamente:

### Lista de Comprobación

- [ ] Node.js 18+ instalado
- [ ] Dependencias instaladas (`node_modules/` existe)
- [ ] Archivo `.env.local` creado con todas las variables
- [ ] Base de datos inicializada (todos los scripts ejecutados)
- [ ] Servidor de desarrollo inicia sin errores
- [ ] Puedes acceder a http://localhost:3000
- [ ] Login/registro funciona
- [ ] Dashboard carga correctamente
- [ ] No hay errores en la consola del navegador

### Prueba Rápida

```bash
# 1. Iniciar el servidor
npm run dev

# 2. Abrir en el navegador
# http://localhost:3000

# 3. Registrar un nuevo usuario
# 4. Iniciar sesión
# 5. Explorar el dashboard
```

Si todos los pasos funcionan, ¡tu instalación está completa! 🎉

---

**Última actualización:** Noviembre 2024
**Versión del documento:** 1.0.0
**Plataforma:** Learniverse - Sistema de Aprendizaje Matemático Gamificado
