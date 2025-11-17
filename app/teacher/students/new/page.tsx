/**
 * Add Student Page
 * Options for adding students to the teacher's dashboard
 * Built with v0 design system
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, UserPlus, Link as LinkIcon, Upload, Loader2, CheckCircle2, Copy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AddStudentPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [copied, setCopied] = useState(false)

  // Generate registration link (in production, this would be teacher-specific)
  const registrationLink = typeof window !== 'undefined'
    ? `${window.location.origin}/register?teacher=${session?.user?.id || 'teacher-id'}`
    : ''

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(registrationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'teacher') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Agregar Estudiantes
          </h1>
          <p className="mt-2 text-muted-foreground">
            Elige cómo quieres agregar estudiantes a tu dashboard
          </p>
        </div>

        <div className="space-y-6">
          {/* Registration Link */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <LinkIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Enlace de Registro</CardTitle>
                  <CardDescription>
                    Comparte este enlace con tus estudiantes para que se registren
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="registration-link">Enlace de Registro</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="registration-link"
                    value={registrationLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Los estudiantes que se registren usando este enlace aparecerán automáticamente en tu dashboard
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Manual Registration */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent/10 p-3">
                  <UserPlus className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle>Registro Manual</CardTitle>
                  <CardDescription>
                    Crea cuentas de estudiante directamente desde tu panel
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Esta funcionalidad estará disponible próximamente
                </p>
                <Button disabled variant="outline">
                  Crear Estudiante Manualmente
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Import from CSV */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-secondary/10 p-3">
                  <Upload className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <CardTitle>Importar desde CSV</CardTitle>
                  <CardDescription>
                    Importa múltiples estudiantes desde un archivo CSV
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Esta funcionalidad estará disponible próximamente
                </p>
                <Button disabled variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Archivo CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Students */}
          <Card className="border-2 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg">Estudiantes Vinculados</CardTitle>
              <CardDescription>
                Los estudiantes registrados con tu enlace aparecen automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/teacher/students')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Ver Todos los Estudiantes
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Comparte el enlace</p>
                  <p className="text-sm text-muted-foreground">
                    Envía el enlace de registro a tus estudiantes por email o mensaje
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">Los estudiantes se registran</p>
                  <p className="text-sm text-muted-foreground">
                    Crean su cuenta y son vinculados automáticamente contigo
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Gestiona desde tu dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    Monitorea su progreso, crea asignaciones y visualiza analíticas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
