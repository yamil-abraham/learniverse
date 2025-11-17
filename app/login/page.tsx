/**
 * Página de Inicio de Sesión
 * Ruta: /login
 * Redesigned with v0 design system
 */

import LoginForm from '@/components/auth/LoginForm'
import { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Iniciar Sesión - Learniverse',
  description: 'Inicia sesión en Learniverse para continuar tu aventura de aprendizaje',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      {/* Header */}
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors group"
        >
          <GraduationCap className="size-6 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold">Learniverse</span>
          <Sparkles className="size-4 text-primary animate-pulse" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              ¡Bienvenido de vuelta!
            </h1>
            <p className="text-lg text-muted-foreground">
              Continúa tu aventura de aprendizaje
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Learniverse - Plataforma educativa gamificada
      </footer>
    </div>
  )
}
