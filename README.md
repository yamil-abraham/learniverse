# Learniverse

Plataforma educativa gamificada con avatares 3D para la enseñanza de matemática a estudiantes de 9-11 años, con sistema de aprendizaje adaptativo impulsado por IA.

## 🎓 Trabajo Final de Grado (TFG)
**Autor:** Abraham Yamil
**Carrera:** Ingeniería en Inteligencia Artificial y Robótica
**Año:** 2025

## ✨ Características Principales

### Para Estudiantes
- 🎮 Sistema de juego gamificado con puntos, niveles y medallas
- 🎨 Avatares 3D personalizables con React Three Fiber
- 🤖 Retroalimentación con IA (OpenAI GPT-4o-mini)
- 📊 Seguimiento de progreso en tiempo real
- 🏆 Sistema de logros y medallas
- 📈 Aprendizaje adaptativo basado en rendimiento
- 💡 Sistema de pistas progresivas con IA

### Para Docentes
- 📊 Dashboard de análisis completo
- 👥 Gestión de clases y estudiantes
- 📈 Métricas de rendimiento detalladas
- 🔔 Sistema de alertas automáticas
- 📄 Exportación de reportes (CSV)
- 🎯 Identificación de áreas de mejora
- 👁️ Monitoreo de progreso en tiempo real

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **3D Graphics:** Three.js, React Three Fiber, React Three Drei
- **Database:** Vercel Postgres
- **AI:** OpenAI GPT-4o-mini
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Charts:** Recharts
- **Authentication:** NextAuth.js
- **Deployment:** Vercel

## Estructura del Proyecto

```
learniverse/
├── app/                    # App Router de Next.js 14
│   ├── layout.tsx         # Layout raíz
│   ├── page.tsx           # Página principal
│   ├── globals.css        # Estilos globales
│   └── api/               # API Routes (serverless)
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base de UI
│   ├── 3d/               # Componentes Three.js
│   ├── game/             # Componentes del juego
│   ├── auth/             # Componentes de autenticación
│   └── dashboard/        # Componentes del dashboard
├── lib/                   # Utilidades y lógica de negocio
│   ├── utils/            # Funciones auxiliares
│   └── api/              # Clientes de APIs externas
├── types/                 # Definiciones de tipos TypeScript
├── hooks/                 # Custom React hooks
├── stores/                # Stores de Zustand
├── config/                # Archivos de configuración
├── public/                # Archivos estáticos
│   ├── assets/           # Imágenes, iconos, etc.
│   └── models/           # Modelos 3D
└── middleware/            # Middlewares de Next.js
```

## 📦 Instalación

Ver la [Guía de Instalación Completa](./INSTALLATION.md) para instrucciones detalladas.

### Inicio Rápido

```bash
# Clonar repositorio
git clone https://github.com/yamil-abraham/learniverse.git
cd learniverse

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Inicializar base de datos
npm run db:init-activities
npm run db:init-ai
npm run db:init-teacher

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run type-check` - Verifica los tipos de TypeScript

## Módulos Principales

1. **Sistema de Autenticación**: Gestión de usuarios (estudiantes y docentes)
2. **Motor 3D**: Avatares personalizables y escenas interactivas
3. **Banco de Actividades**: Ejercicios matemáticos gamificados
4. **Sistema Adaptativo**: Ajuste inteligente de dificultad con IA
5. **Panel de Progreso**: Dashboard para docentes
6. **Interacción por Voz**: Speech-to-text y text-to-speech

## Convenciones de Código

- Usar TypeScript strict mode
- Componentes funcionales con React Hooks
- Nombres de archivos en PascalCase para componentes
- Imports organizados: externos → internos → relativos
- Comentarios en español para documentación
- Commits siguiendo Conventional Commits

## Deployment

El proyecto está configurado para desplegarse en Vercel:

1. Conecta tu repositorio de GitHub con Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Vercel automáticamente desplegará en cada push a la rama principal

## 🎥 Demo

**Aplicación en producción:** [https://learniverse.vercel.app](https://learniverse.vercel.app)
**Código fuente:** [https://github.com/yamil-abraham/learniverse](https://github.com/yamil-abraham/learniverse)
**Video demostrativo:** [Próximamente]

El prototipo implementa todas las funcionalidades core definidas en la propuesta del TFG.

## 📚 Documentación

- [📖 Guía de Instalación](./INSTALLATION.md)
- [✅ Checklist de Deployment](./docs/DEPLOYMENT_CHECKLIST.md)
- [🎬 Script para Video Demo](./docs/VIDEO_DEMO_SCRIPT.md)
- [🐛 Bugs y Issues](./docs/BUGS.md)
- [📋 Contexto del Proyecto](./CLAUDE_CONTEXT.md)

## ✅ Estado del Proyecto

### Fases Completadas
- ✅ **Fase 1:** Sistema de Autenticación y Base de Datos
- ✅ **Fase 2:** Motor 3D con Avatares Personalizables
- ✅ **Fase 3:** Banco de Actividades y Gamificación
- ✅ **Fase 4:** Sistema de Aprendizaje Adaptativo con IA
- ✅ **Fase 5:** Panel de Análisis para Docentes
- ✅ **Fase 6:** Integración Final, Testing y Deployment

### Características Implementadas
- ✅ Autenticación con NextAuth.js (estudiantes y docentes)
- ✅ Avatares 3D personalizables con React Three Fiber
- ✅ 5 tipos de actividades matemáticas
- ✅ 3 niveles de dificultad adaptativa
- ✅ Integración con OpenAI GPT-4o-mini
- ✅ Sistema de puntos, niveles y medallas
- ✅ Dashboard completo para docentes
- ✅ Sistema de alertas automáticas
- ✅ Exportación de reportes
- ✅ Responsive design (desktop y móvil)

## 🚢 Deployment

Ver el [Checklist de Deployment](./docs/DEPLOYMENT_CHECKLIST.md) para instrucciones completas.

### Deployment en Vercel

```bash
# Conectar con Vercel
vercel login

# Deploy a producción
vercel --prod
```

## 📄 Licencia

ISC License

## 👤 Contacto

**Abraham Yamil**
Proyecto desarrollado como Trabajo Final de Grado (TFG)
Ingeniería en Inteligencia Artificial y Robótica - 2025
