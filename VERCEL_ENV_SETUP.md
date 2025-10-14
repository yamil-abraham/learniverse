# Configuración de Variables de Entorno en Vercel

## 🔑 Variables Requeridas para Deployment

### Paso 1: Ir a Configuración de Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona el proyecto **learniverse**
3. Click en **Settings** (esquina superior derecha)
4. En el menú lateral: **Environment Variables**

### Paso 2: Agregar Variables de Entorno

Agrega las siguientes variables una por una:

#### OpenAI API (REQUERIDA)

```
Name: OPENAI_API_KEY
Value: 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
Environments: ✓ Production ✓ Preview ✓ Development
```

#### Node Environment (REQUERIDA)

```
Name: NODE_ENV
Value: production
Environments: ✓ Production
```

#### Next Public App URL (REQUERIDA)

```
Name: NEXT_PUBLIC_APP_URL
Value: https://learniverse.vercel.app
Environments: ✓ Production ✓ Preview
```

Para Preview environment:
```
Name: NEXT_PUBLIC_APP_URL
Value: https://learniverse-git-$VERCEL_GIT_COMMIT_REF.vercel.app
Environments: ✓ Preview
```

### Paso 3: Variables Opcionales (Para Agregar Después)

#### Azure Speech Services
**Solo agregar cuando obtengas las credenciales**

```
Name: AZURE_SPEECH_KEY
Value: [tu-key-cuando-la-tengas]
Environments: ✓ Production ✓ Preview

Name: AZURE_SPEECH_REGION
Value: [region-ej-eastus]
Environments: ✓ Production ✓ Preview
```

#### Vercel Postgres
**Se configura automáticamente al conectar la base de datos**

Cuando conectes Vercel Postgres, estas variables se crearán automáticamente:
- POSTGRES_URL
- POSTGRES_PRISMA_URL
- POSTGRES_URL_NON_POOLING
- POSTGRES_USER
- POSTGRES_HOST
- POSTGRES_PASSWORD
- POSTGRES_DATABASE

Para conectar Postgres:
1. En tu proyecto Vercel: **Storage** tab
2. **Create Database** → **Postgres**
3. Acepta y conecta
4. Las variables se agregarán automáticamente

### Paso 4: Re-Deploy

Después de agregar las variables:

1. Ve a **Deployments** tab
2. Click en el deployment más reciente (el que falló)
3. Click en los 3 puntos (...) → **Redeploy**
4. O simplemente haz un nuevo push a GitHub

```bash
git add .
git commit -m "fix: configurar variables de entorno"
git push origin main
```

## 📋 Checklist de Variables

### Mínimas para que funcione:
- [x] `OPENAI_API_KEY` - Configurada
- [x] `NODE_ENV` - production
- [x] `NEXT_PUBLIC_APP_URL` - URL de Vercel

### Para funcionalidad completa:
- [ ] `AZURE_SPEECH_KEY` - No disponible aún
- [ ] `AZURE_SPEECH_REGION` - No disponible aún
- [ ] Vercel Postgres - Conectar cuando sea necesario

## 🔒 Seguridad

**IMPORTANTE:**
- ✅ Las variables están configuradas en Vercel (seguro)
- ✅ `.env.local` está en `.gitignore` (no se sube)
- ✅ `.env.example` muestra la estructura (sin valores reales)
- ❌ NUNCA hagas commit de `.env.local` con valores reales

## 🚀 Verificar Deployment

Después de configurar las variables y re-deploy:

1. **Health Check:**
   ```bash
   curl https://learniverse.vercel.app/api/health
   ```

   Debe retornar:
   ```json
   {
     "status": "healthy",
     "services": {
       "openai": "configured",
       "azureSpeech": "not_configured"
     }
   }
   ```

2. **Verificar en Vercel:**
   - El deployment debe tener estado ✅ Ready
   - En logs no debe haber errores de variables faltantes

## 💡 Tips

### Ver logs en tiempo real:
```bash
vercel logs --follow
```

### Listar variables configuradas:
```bash
vercel env ls
```

### Agregar variable desde CLI:
```bash
vercel env add OPENAI_API_KEY production
```

## 🐛 Troubleshooting

### Error: "OpenAI API key not configured"
**Solución:** Verifica que `OPENAI_API_KEY` esté agregada en Vercel y re-deploy

### Error: "Build failed"
**Solución:**
1. Verifica que el build local funciona: `npm run build`
2. Revisa logs del deployment en Vercel
3. Asegúrate de que todas las variables requeridas estén configuradas

### Deployment exitoso pero API no funciona
**Solución:**
1. Verifica que la variable esté en el environment correcto (Production/Preview)
2. Re-deploy después de agregar variables
3. Revisa Function Logs en Vercel Dashboard

## 📚 Recursos

- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Azure Speech Services](https://azure.microsoft.com/services/cognitive-services/speech-services/)

---

**Estado Actual:**
- ✅ OpenAI API Key configurada
- ⏳ Azure Speech pendiente (opcional por ahora)
- ⏳ Vercel Postgres pendiente (cuando sea necesario)
