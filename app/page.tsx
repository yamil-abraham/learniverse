import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="z-10 w-full max-w-5xl items-center justify-between">
        <h1 className="text-5xl font-bold mb-8 text-center text-white">
          Bienvenido a Learniverse
        </h1>
        <p className="text-2xl text-center mb-12 text-white/90">
          Plataforma educativa gamificada con avatares 3D
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-12">
          <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-white">Para Estudiantes</h2>
            <p className="text-white/80">
              Aprende matemáticas de forma divertida con avatares 3D y actividades interactivas
            </p>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-white">Para Docentes</h2>
            <p className="text-white/80">
              Monitorea el progreso de tus estudiantes y adapta el contenido según sus necesidades
            </p>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Link
            href="/login"
            className="bg-white hover:bg-gray-100 text-purple-600 font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-center min-w-[200px]"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-center min-w-[200px]"
          >
            Registrarse
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-white/60">
            Proyecto configurado con Next.js 14, TypeScript, React Three Fiber y Tailwind CSS
          </p>
        </div>
      </div>
    </main>
  )
}
