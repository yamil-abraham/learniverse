export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Bienvenido a Learniverse
        </h1>
        <p className="text-xl text-center mb-12">
          Plataforma educativa gamificada con avatares 3D
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Para Estudiantes</h2>
            <p className="text-gray-600">
              Aprende matemáticas de forma divertida con avatares 3D y actividades interactivas
            </p>
          </div>

          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Para Docentes</h2>
            <p className="text-gray-600">
              Monitorea el progreso de tus estudiantes y adapta el contenido según sus necesidades
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Proyecto configurado con Next.js 14, TypeScript, React Three Fiber y Tailwind CSS
          </p>
        </div>
      </div>
    </main>
  )
}
