# Learniverse - Guía de Instalación

## Prerequisitos

- Node.js 18.x o superior
- npm o yarn  
- Git
- Cuenta de Vercel (para deployment)
- API key de OpenAI
- Base de datos Vercel Postgres o Supabase

## Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/yamil-abraham/learniverse.git
cd learniverse
```

## Paso 2: Instalar Dependencias

```bash
npm install
```

## Paso 3: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
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
```

### Generar NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

## Paso 4: Inicializar la Base de Datos

```bash
# Ejecutar migraciones
npm run db:init-activities
npm run db:init-ai
npm run db:init-teacher
```

## Paso 5: Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

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
