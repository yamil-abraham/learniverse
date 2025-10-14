# Learniverse

Plataforma educativa web gamificada para enseñanza de Matemática a estudiantes de 9-11 años, con avatares 3D interactivos y sistema inteligente de adaptación de contenido.

## Stack Tecnológico

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **UI**: React 18, Tailwind CSS
- **3D**: Three.js, React Three Fiber, React Three Drei
- **Estado**: Zustand
- **Validación**: Zod
- **Base de datos**: Vercel Postgres
- **IA**: OpenAI API
- **Voz**: Azure Speech Services
- **Deployment**: Vercel

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

## Instalación y Configuración

### Prerrequisitos

- Node.js 18.x o superior
- npm o yarn

### Pasos de Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/learniverse.git
cd learniverse
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
```

Edita `.env.local` y configura las siguientes variables:
- Credenciales de Vercel Postgres
- API key de OpenAI
- Credenciales de Azure Speech Services
- Otras configuraciones necesarias

4. Ejecutar en desarrollo:
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

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

## Roadmap

- [ ] Sistema de autenticación con NextAuth
- [ ] Creación de avatares 3D personalizables
- [ ] Banco de actividades matemáticas
- [ ] Integración con OpenAI para adaptación de contenido
- [ ] Sistema de progreso y estadísticas
- [ ] Integración con Azure Speech Services
- [ ] Panel de administración para docentes
- [ ] Tests unitarios y de integración

## Contribución

Este es un proyecto de Trabajo Final de Grado (TFG). Para contribuir:

1. Crea un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

ISC License

## Contacto

Proyecto desarrollado como Trabajo Final de Grado

## Documentación Adicional

Para más información sobre el proyecto, consulta:
- [CLAUDE_CONTEXT.md](./CLAUDE_CONTEXT.md) - Contexto completo del proyecto
- Documentación de carpetas en cada directorio (README.md)
