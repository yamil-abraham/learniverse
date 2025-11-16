/**
 * Formulario de Inicio de Sesión
 * Componente para autenticación de usuarios
 * Redesigned with shadcn/ui - Preserves all authentication logic
 */

'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, LogIn, Mail, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validación básica del lado del cliente
      if (!email || !password) {
        setError('Por favor completa todos los campos')
        setIsLoading(false)
        return
      }

      // Validación de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Por favor ingresa un email válido')
        setIsLoading(false)
        return
      }

      // Intentar iniciar sesión
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError('Email o contraseña incorrectos')
        setIsLoading(false)
        return
      }

      // Redirigir a la raíz y dejar que el middleware redirija al dashboard correcto
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error during login:', error)
      setError('Error al iniciar sesión. Por favor intenta de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="size-6 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">Iniciar Sesión</CardTitle>
        <CardDescription className="text-base">
          Ingresa tus credenciales para acceder a tu cuenta
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-scale-in">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                disabled={isLoading}
                required
                aria-label="Email"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
                aria-label="Contraseña"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 text-base font-semibold"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn className="mr-2 size-4" />
                Iniciar Sesión
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link
              href="/register"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Regístrate aquí
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
