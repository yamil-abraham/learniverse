# Configuración de GitHub con Claude AI

## ✅ Cambios Pusheados Exitosamente

Todos los archivos del proyecto han sido subidos al repositorio:
- ✅ 41 archivos creados/modificados
- ✅ Commit: `feat: Inicialización completa del proyecto Learniverse`
- ✅ Push exitoso a `origin/main`

## 🤖 Habilitar Claude Code Review Automático

### Paso 1: Obtener API Key de Anthropic

1. Ve a: https://console.anthropic.com/
2. Regístrate o inicia sesión con tu cuenta
3. En el menú lateral, click en **API Keys**
4. Click en **Create Key**
5. Dale un nombre: `learniverse-github-actions`
6. **Copia la key** (solo se muestra una vez)

### Paso 2: Agregar Secret en GitHub

1. Ve a tu repositorio: https://github.com/yamil-abraham/learniverse
2. Click en **Settings** (pestaña superior)
3. En el menú lateral: **Secrets and variables** → **Actions**
4. Click en **New repository secret**
5. Configuración:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Secret**: Pega la API key que copiaste
6. Click **Add secret**

### Paso 3: Verificar que Funciona

El workflow está configurado para ejecutarse automáticamente cuando:
- Creas un nuevo Pull Request
- Haces push a un PR existente
- Reabres un PR cerrado

**Para probarlo:**

1. Crea una nueva rama:
   ```bash
   git checkout -b test/claude-review
   ```

2. Haz un cambio mínimo (por ejemplo, edita `README.md`):
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: probar Claude code review"
   git push origin test/claude-review
   ```

3. Ve a GitHub y crea un Pull Request desde `test/claude-review` a `main`

4. Espera ~30 segundos

5. Claude AI comentará automáticamente en tu PR con un análisis del código!

## 📋 Archivos de Configuración Creados

### GitHub Actions
```
.github/
├── workflows/
│   └── claude-code-review.yml    ← Workflow principal
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
├── PULL_REQUEST_TEMPLATE.md
└── README.md
```

### Configuración del Workflow

El workflow ejecuta:
1. ✅ Checkout del código
2. 📦 Instalación de dependencias
3. 🔍 Type check (`npm run type-check`)
4. 🧹 Linting (`npm run lint`)
5. 🤖 Code review con Claude AI
6. 💬 Comentario automático en el PR

## 🎯 Qué Revisa Claude

Claude AI analiza:
- ✅ **Buenas prácticas** de código
- 🐛 **Bugs potenciales** y edge cases
- 🎯 **Performance** y optimizaciones
- 🔒 **Seguridad** y vulnerabilidades
- 📝 **Arquitectura** y patrones
- 🧪 **Testing** y cobertura
- 📚 **Documentación** necesaria

## 💡 Ejemplo de Review

Cuando crees un PR, verás un comentario como este:

```markdown
## 🤖 Claude AI Code Review

### ✅ Aspectos Positivos
- Uso correcto de TypeScript con tipos estrictos
- Componentes bien estructurados y reutilizables
- Manejo apropiado de estados con Zustand

### 🐛 Bugs Potenciales
- Línea 42: `useEffect` sin array de dependencias podría causar re-renders infinitos
- Línea 67: Posible null pointer si `user` es undefined

### 🎯 Mejoras de Performance
- Considera usar `useMemo` para `calculateStats` (línea 85)
- Lazy loading recomendado para componente 3D pesado

### 🔒 Seguridad
- ✅ Variables de entorno manejadas correctamente
- ⚠️ Validar input del usuario en línea 123 antes de usar en query

### 📝 Sugerencias
- Agregar JSDoc para la función `processGameData`
- Considerar error boundary para componentes Three.js

---
*Review automático generado por Claude AI*
*TypeCheck: ✅ success | Lint: ✅ success*
```

## 🚀 Workflow de Desarrollo con Claude

### Para Features Nuevas

```bash
# 1. Crear branch
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y commitear
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 3. Push
git push origin feature/nueva-funcionalidad

# 4. Crear PR en GitHub
# Claude revisará automáticamente

# 5. Revisar comentarios de Claude
# Implementar sugerencias si son válidas

# 6. Push de correcciones
git add .
git commit -m "fix: aplicar sugerencias de Claude"
git push

# Claude revisará de nuevo!
```

### Para Bug Fixes

```bash
git checkout -b fix/corregir-bug-123
# ... hacer cambios ...
git push origin fix/corregir-bug-123
# Crear PR → Claude revisa automáticamente
```

## ⚙️ Personalizar el Workflow

### Cambiar el Modelo de Claude

Edita `.github/workflows/claude-code-review.yml`:

```yaml
body: JSON.stringify({
  model: 'claude-3-5-sonnet-20241022',  # ← Cambiar aquí
  max_tokens: 2000,
  # ...
})
```

Modelos disponibles:
- `claude-3-5-sonnet-20241022` (recomendado, más inteligente)
- `claude-3-opus-20240229` (más profundo, más lento)
- `claude-3-sonnet-20240229` (balance)
- `claude-3-haiku-20240307` (más rápido, más económico)

### Ajustar Límite de Archivos

Por defecto revisa máximo 5 archivos. Para cambiar:

```javascript
for (const file of changedFiles.slice(0, 5)) { // ← Cambiar el 5
```

### Modificar el Prompt

Edita el prompt en el workflow para enfocarse en aspectos específicos:

```javascript
content: `Eres un code reviewer experto en TypeScript, React y Next.js.

[... agregar instrucciones específicas aquí ...]

Enfócate especialmente en:
- Performance de componentes 3D
- Optimización de Three.js
- Manejo de estado con Zustand
`
```

## 📊 Costos Aproximados

### API de Anthropic

**Plan Hobby (Gratis):**
- 1000 requests/día
- Suficiente para ~20 PRs/día
- **Costo:** $0

**Plan de Pago:**
- Claude 3.5 Sonnet: ~$3 por cada 1M tokens
- Review promedio: ~2000 tokens
- **Costo por review:** ~$0.006 (menos de 1 centavo)
- Para 100 PRs/mes: ~$0.60

**Conclusión:** Extremadamente económico, incluso para proyectos activos.

## 🔧 Troubleshooting

### El workflow no se ejecuta

**Solución:**
1. Verifica que el archivo esté en `.github/workflows/`
2. Revisa en **Actions** si hay errores de sintaxis YAML
3. Asegúrate de que el PR modifique archivos `.ts`, `.tsx`, `.js`, o `.jsx`

### Error: "ANTHROPIC_API_KEY not configured"

**Solución:**
1. Verifica que agregaste el secret en **Settings** → **Actions**
2. El nombre DEBE ser exactamente `ANTHROPIC_API_KEY`
3. Re-ejecuta el workflow después de agregar el secret

### Claude no comenta en el PR

**Posibles causas:**
1. API key inválida o expirada
2. Límite de rate excedido (1000 req/día)
3. Error de red temporal

**Verificar:**
- Ve a **Actions** → Click en el run → Revisa logs
- Busca errores en rojo en el step "Claude Code Review"

### El review es muy genérico

**Solución:**
- Edita el prompt para ser más específico sobre tu proyecto
- Proporciona más contexto en el prompt
- Limita el número de archivos para que Claude tenga más tokens por archivo

## 📚 Recursos Adicionales

- [Anthropic API Docs](https://docs.anthropic.com/)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Workflow de este proyecto](./.github/workflows/claude-code-review.yml)
- [Documentación de .github](./.github/README.md)

## 🎓 Best Practices

### Para el Equipo

1. **Lee los reviews de Claude**: A menudo detecta cosas que pasamos por alto
2. **No sigas ciegamente**: Claude es un asistente, usa tu criterio
3. **Mejora el prompt**: Si Claude da sugerencias irrelevantes, ajusta el prompt
4. **Combina con review humano**: Claude + humano = mejor resultado

### Para el Proyecto

1. **Mantén PRs pequeños**: Más fáciles de revisar (para Claude y humanos)
2. **Usa conventional commits**: `feat:`, `fix:`, `docs:`, etc.
3. **Completa el PR template**: Ayuda a Claude a entender el contexto
4. **Responde a sugerencias**: Implementa o explica por qué no

## ✅ Checklist de Configuración

- [x] Código pusheado a GitHub
- [x] Workflow de GitHub Actions configurado
- [ ] API key de Anthropic obtenida
- [ ] Secret `ANTHROPIC_API_KEY` agregado en GitHub
- [ ] PR de prueba creado para verificar funcionamiento
- [ ] Review automático recibido correctamente

---

**Último paso:** Sigue las instrucciones de Paso 1 y 2 para habilitar Claude AI.

Una vez configurado, ¡todos tus PRs recibirán code reviews automáticos!
