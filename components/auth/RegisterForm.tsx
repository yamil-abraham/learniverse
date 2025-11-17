/**
 * Formulario de Registro
 * Componente para registro de nuevos usuarios (estudiantes y profesores)
 * Redesigned with shadcn/ui - Preserves all authentication logic
 */

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { UserRole } from '@/types'
import {
  Loader2,
  UserPlus,
  Mail,
  Lock,
  User,
  GraduationCap,
  School,
  CheckCircle2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'student' as UserRole,
    grade: 4,
    school: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'grade' ? parseInt(value) : value,
    }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as UserRole,
    }))
  }

  const handleGradeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      grade: parseInt(value),
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsLoading(true)

    try {
      // Validación del lado del cliente
      if (!formData.email || !formData.password || !formData.name) {
        setError('Por favor completa todos los campos requeridos')
        setIsLoading(false)
        return
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Por favor ingresa un email válido')
        setIsLoading(false)
        return
      }

      // Validar contraseña
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        setIsLoading(false)
        return
      }

      // Validar que las contraseñas coincidan
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden')
        setIsLoading(false)
        return
      }

      // Validar grado para estudiantes
      if (formData.role === 'student' && (formData.grade < 4 || formData.grade > 5)) {
        setError('El grado debe ser 4 o 5')
        setIsLoading(false)
        return
      }

      // Preparar datos para el API
      const registerData: any = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      }

      // Agregar datos específicos por rol
      if (formData.role === 'student') {
        registerData.grade = formData.grade
      } else if (formData.role === 'teacher' && formData.school) {
        registerData.school = formData.school
      }

      // Llamar al API de registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al registrar el usuario')
        setIsLoading(false)
        return
      }

      // Registro exitoso
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      console.error('Error during registration:', error)
      setError('Error al registrar el usuario. Por favor intenta de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-secondary/10">
          <UserPlus className="size-6 text-secondary" />
        </div>
        <CardTitle className="text-3xl font-bold">Crear Cuenta</CardTitle>
        <CardDescription className="text-base">
          Completa tus datos para unirte a Learniverse
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-scale-in">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-success bg-success/10 text-success animate-scale-in">
              <CheckCircle2 className="size-4" />
              <AlertDescription>
                ¡Registro exitoso! Redirigiendo al login...
              </AlertDescription>
            </Alert>
          )}

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Nombre completo
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                disabled={isLoading}
                required
                aria-label="Nombre completo"
                className="pl-10"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                disabled={isLoading}
                required
                aria-label="Email"
                className="pl-10"
              />
            </div>
          </div>

          {/* Tipo de cuenta */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-semibold">
              Tipo de cuenta
            </Label>
            <Select
              value={formData.role}
              onValueChange={handleRoleChange}
              disabled={isLoading}
            >
              <SelectTrigger id="role" aria-label="Tipo de cuenta">
                <SelectValue placeholder="Selecciona tu rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-4" />
                    <span>Estudiante</span>
                  </div>
                </SelectItem>
                <SelectItem value="teacher">
                  <div className="flex items-center gap-2">
                    <School className="size-4" />
                    <span>Profesor/a</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grado (solo para estudiantes) */}
          {formData.role === 'student' && (
            <div className="space-y-2 animate-scale-in">
              <Label htmlFor="grade" className="text-sm font-semibold">
                Grado escolar
              </Label>
              <Select
                value={formData.grade.toString()}
                onValueChange={handleGradeChange}
                disabled={isLoading}
              >
                <SelectTrigger id="grade" aria-label="Grado escolar">
                  <SelectValue placeholder="Selecciona tu grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4º Grado</SelectItem>
                  <SelectItem value="5">5º Grado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Escuela (solo para profesores, opcional) */}
          {formData.role === 'teacher' && (
            <div className="space-y-2 animate-scale-in">
              <Label htmlFor="school" className="text-sm font-semibold">
                Escuela{' '}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="school"
                  name="school"
                  type="text"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="Nombre de tu escuela"
                  disabled={isLoading}
                  aria-label="Escuela"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
                required
                aria-label="Contraseña"
                className="pl-10"
              />
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                disabled={isLoading}
                required
                aria-label="Confirmar contraseña"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={isLoading || success}
            className="w-full h-11 text-base font-semibold"
            size="lg"
            variant="default"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 size-4" />
                Registrarse
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
