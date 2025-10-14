# Modelos 3D

Esta carpeta contiene los modelos 3D para avatares y objetos del juego.

## Configuración de Cache

Según `vercel.json`, todos los archivos en esta carpeta tienen:
- **Cache-Control**: `public, max-age=31536000, immutable`
- **CORS**: Habilitado (`Access-Control-Allow-Origin: *`)

Esto significa:
- Los modelos se cachean por 1 año en el navegador
- Se pueden cargar desde cualquier origen
- Performance óptima para escenas 3D

## Formatos Soportados

### GLB (Recomendado)
- Formato binario comprimido
- Incluye texturas embebidas
- Ideal para producción
- Content-Type: `model/gltf-binary`

**Ejemplo:**
```tsx
import { useGLTF } from '@react-three/drei'

function AvatarModel() {
  const { scene } = useGLTF('/models/avatar-student.glb')
  return <primitive object={scene} />
}
```

### GLTF
- Formato JSON legible
- Útil para desarrollo
- Content-Type: `model/gltf+json`

## Estructura Recomendada

```
models/
├── avatars/
│   ├── student-boy-1.glb
│   ├── student-girl-1.glb
│   ├── teacher-1.glb
│   └── accessories/
│       ├── hat.glb
│       ├── glasses.glb
│       └── backpack.glb
├── environments/
│   ├── classroom.glb
│   └── playground.glb
└── props/
    ├── whiteboard.glb
    ├── desk.glb
    └── book.glb
```

## Optimización de Modelos

### Draco Compression
Reduce el tamaño de los modelos hasta un 90%:

```bash
npm install -g gltf-pipeline
gltf-pipeline -i model.gltf -o model-compressed.glb -d
```

### Herramientas Recomendadas

1. **Blender** - Modelado y exportación GLTF
2. **gltf-pipeline** - Compresión y optimización
3. **gltfjsx** - Convertir GLB a componentes React

```bash
npx gltfjsx model.glb -o Component.tsx
```

### Métricas de Tamaño

| Tipo de Modelo | Tamaño Recomendado | Tamaño Máximo |
|----------------|-------------------|---------------|
| Avatar simple | 50-200 KB | 500 KB |
| Avatar complejo | 200-500 KB | 1 MB |
| Escenario | 500 KB - 2 MB | 5 MB |

## Testing de Performance

```tsx
// Preload models para mejor UX
useGLTF.preload('/models/avatar-student.glb')

// Verificar tamaño en Network tab de DevTools
// Debe mostrar:
// - Status: 200 (primera carga)
// - Status: 304 o (disk cache) (cargas posteriores)
// - Cache-Control: public, max-age=31536000, immutable
```

## Recursos

- [glTF Tutorial](https://www.khronos.org/gltf/)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Draco Compression](https://github.com/google/draco)
- [Ready Player Me](https://readyplayer.me/) - Avatares 3D gratuitos

## Licencias

Asegúrate de verificar las licencias de los modelos 3D que uses:
- Modelos propios: Sin restricción
- CC0: Uso libre
- CC-BY: Requiere atribución
- Modelos comerciales: Verificar términos
