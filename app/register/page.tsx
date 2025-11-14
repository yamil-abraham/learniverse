/**
 * Página de Registro
 * Ruta: /register
 */

import RegisterForm from '@/components/auth/RegisterForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registrarse - Learniverse',
  description: 'Crea tu cuenta en Learniverse y comienza tu aventura de aprendizaje',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-white mb-2">
          Learniverse
        </h1>
        <p className="text-xl text-white/90">
          Únete a la aventura del aprendizaje
        </p>
      </div>

      <RegisterForm />

      <footer className="mt-8 text-white/80 text-sm">
        © 2024 Learniverse - Plataforma educativa gamificada
      </footer>
    </div>
  )
}
