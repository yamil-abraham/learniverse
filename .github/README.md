# GitHub Configuration

Este directorio contiene la configuración de GitHub para el proyecto Learniverse.

## 📁 Estructura

```
.github/
├── workflows/
│   └── claude-code-review.yml    # GitHub Action para code reviews con Claude AI
├── ISSUE_TEMPLATE/
│   ├── bug_report.md              # Template para reportar bugs
│   └── feature_request.md         # Template para solicitar funcionalidades
├── PULL_REQUEST_TEMPLATE.md       # Template para Pull Requests
└── README.md                       # Este archivo
```

## 🤖 Claude AI Code Review

### Configuración

Para habilitar code reviews automáticos con Claude AI:

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Nombre: `ANTHROPIC_API_KEY`
5. Valor: Tu API key de Anthropic (obtenerla en https://console.anthropic.com/)
6. Click **Add secret**

### Funcionamiento

El workflow `claude-code-review.yml` se ejecuta automáticamente cuando:
- Se crea un nuevo Pull Request
- Se hace push a un PR existente
- Se reabre un PR

**Proceso:**
1. ✅ Checkout del código
2. 🔍 Detecta archivos TypeScript/JavaScript modificados
3. 📦 Instala dependencias
4. 🔎 Ejecuta type-check y lint
5. 🤖 Claude AI analiza los cambios
6. 💬 Comenta en el PR con el review

### Características del Review

Claude AI revisa:
- ✅ **Aspectos positivos** del código
- 🐛 **Bugs potenciales** y edge cases
- 🎯 **Mejoras de performance**
- 🔒 **Problemas de seguridad**
- 📝 **Sugerencias de mejora**
- 🏗️ **Arquitectura y patrones**

### Ejemplo de Review

```markdown
## 🤖 Claude AI Code Review

### ✅ Aspectos Positivos
- Uso correcto de TypeScript strict mode
- Componentes bien estructurados con props tipadas
- Validación con Zod implementada correctamente

### 🐛 Bugs Potenciales
- `useEffect` en línea 42 no tiene array de dependencias
- Posible race condition en la llamada a API

### 🎯 Mejoras de Performance
- Considerar memoización de `calculateStats` con useMemo
- Lazy loading recomendado para el componente 3D

### 📝 Sugerencias
- Agregar error boundaries para componentes 3D
- Documentar el hook personalizado useGameState

---
*Review automático generado por Claude AI*
*TypeCheck: success | Lint: success*
```

## 📝 Pull Request Template

Cuando crees un PR, se cargará automáticamente el template con:
- Descripción del cambio
- Tipo de cambio (bug fix, feature, etc.)
- Checklist de verificación
- Sección de testing
- Impacto en UI/UX

**Tip:** Completa todas las secciones para facilitar el review.

## 🐛 Issue Templates

### Bug Report

Usa este template para reportar errores. Incluye:
- Descripción del bug
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots
- Información del entorno

### Feature Request

Usa este template para proponer nuevas funcionalidades. Incluye:
- Descripción de la funcionalidad
- Problema que resuelve
- Solución propuesta
- Prioridad
- Impacto en usuarios

## 🔧 Mantenimiento

### Actualizar el Workflow

Edita `.github/workflows/claude-code-review.yml` para:
- Cambiar el modelo de Claude (actualmente `claude-3-5-sonnet-20241022`)
- Ajustar el límite de archivos revisados
- Modificar el contexto del proyecto
- Agregar verificaciones adicionales

### Agregar Nuevos Workflows

Crea archivos `.yml` adicionales en `workflows/` para:
- Tests automáticos
- Deployment
- Linting
- Security scanning
- Performance testing

Ejemplo de workflow adicional:

```yaml
name: CI Tests

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
```

## 🚀 Best Practices

### Para Contributors

1. **Crea PRs pequeños**: Más fáciles de revisar
2. **Usa conventional commits**: `feat:`, `fix:`, `docs:`, etc.
3. **Completa el template**: Facilita el review
4. **Responde a Claude**: Si Claude sugiere cambios, implementa o explica por qué no

### Para Reviewers

1. **Lee el review de Claude**: Puede detectar issues que pasamos por alto
2. **No confíes 100% en IA**: Claude es un asistente, no reemplaza el criterio humano
3. **Verifica el contexto**: Claude no tiene el contexto completo del proyecto
4. **Agrega feedback humano**: UX, arquitectura general, decisiones de negocio

## 📊 Métricas

Puedes ver métricas del workflow en:
**Actions** → **Claude AI Code Review** → Selecciona un run

Incluye:
- Tiempo de ejecución
- Archivos analizados
- Resultado de type-check y lint
- Logs completos

## 🔒 Seguridad

**Importante:**
- ❌ NUNCA hagas commit de la API key
- ✅ Usa siempre GitHub Secrets
- 🔄 Rota la API key si se compromete
- 👀 Revisa permisos del workflow

## 💡 Tips

### Obtener API Key de Anthropic

1. Ve a https://console.anthropic.com/
2. Regístrate o inicia sesión
3. **API Keys** → **Create Key**
4. Copia la key (solo se muestra una vez)
5. Agrégala a GitHub Secrets

### Límites de Rate

Plan gratuito de Anthropic:
- 1000 requests/día
- 50 requests/minuto

**Recomendación:** Para proyectos activos, considera el plan de pago.

### Debugging

Si el workflow falla:
1. Ve a **Actions** → Selecciona el run fallido
2. Click en el job **Claude Code Review**
3. Expande los steps para ver logs
4. Busca errores en rojo

Errores comunes:
- API key no configurada
- Límite de rate excedido
- Error de red al llamar a Claude API

## 📚 Referencias

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Configurado para Learniverse TFG**
