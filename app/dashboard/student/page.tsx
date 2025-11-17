/**
 * Dashboard del Estudiante
 * Ruta: /dashboard/student
 * Redesigned with v0 design system - Preserves ALL functionality
 */

'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { MathActivityType, DifficultyLevel, Class } from '@/types'
import {
  Sparkles,
  LogOut,
  Trophy,
  Star,
  Target,
  Gamepad2,
  Brain,
  TrendingUp,
  Users,
  GraduationCap,
  Loader2,
  Rocket,
  Zap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Recommendation {
  activityType: MathActivityType
  difficulty: DifficultyLevel
  reason: string
  confidence: number
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)

  useEffect(() => {
    // Redirigir si no es estudiante
    if (status === 'authenticated' && session?.user?.role !== 'student') {
      router.push('/login')
    }
  }, [session, status, router])

  // Phase 4 Adaptive: Load recommendation
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'student') {
      loadRecommendation()
      loadClasses()
    }
  }, [status, session])

  const loadRecommendation = async () => {
    setIsLoadingRecommendation(true)
    try {
      const response = await fetch('/api/ai/recommend-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRecommendation(data.recommendation)
        }
      }
    } catch (error) {
      console.error('Error loading recommendation:', error)
    } finally {
      setIsLoadingRecommendation(false)
    }
  }

  const loadClasses = async () => {
    setIsLoadingClasses(true)
    try {
      const response = await fetch('/api/student/classes')

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setClasses(data.classes)
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error)
    } finally {
      setIsLoadingClasses(false)
    }
  }

  const getActivityLabel = (type: MathActivityType): string => {
    const labels: Record<MathActivityType, string> = {
      addition: 'Suma',
      subtraction: 'Resta',
      multiplication: 'Multiplicación',
      division: 'División',
      fractions: 'Fracciones'
    }
    return labels[type]
  }

  const getDifficultyLabel = (difficulty: DifficultyLevel): string => {
    const labels: Record<DifficultyLevel, string> = {
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil'
    }
    return labels[difficulty]
  }

  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    const colors: Record<DifficultyLevel, string> = {
      easy: 'bg-success/10 text-success border-success',
      medium: 'bg-secondary/10 text-secondary border-secondary',
      hard: 'bg-destructive/10 text-destructive border-destructive'
    }
    return colors[difficulty]
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const experienceToNextLevel = 100 - ((session.user?.experience || 0) % 100)
  const progressPercentage = ((session.user?.experience || 0) % 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Rocket className="size-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">LEARNIVERSE</h1>
                <p className="text-sm text-muted-foreground">Tu Aventura Matemática</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="mr-2 size-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Card */}
        <Card className="border-2 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary via-accent to-secondary p-1">
            <div className="bg-background p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold text-foreground mb-2">
                    ¡Hola, {session.user?.name}!
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    ¿Listo para una nueva aventura matemática?
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="p-4 rounded-full bg-primary/10 animate-bounce-soft">
                    <Sparkles className="size-12 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Recommendation Card */}
        {isLoadingRecommendation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="size-5 text-primary animate-pulse" />
                Analizando tu progreso...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        )}

        {recommendation && !isLoadingRecommendation && (
          <Card className="border-2 border-accent shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Brain className="size-6 text-accent" />
                    Recomendación IA
                  </CardTitle>
                  <CardDescription className="text-base">
                    Basado en tu desempeño reciente
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {recommendation.confidence && !isNaN(recommendation.confidence)
                    ? `${Math.round(recommendation.confidence * 100)}% confianza`
                    : 'Alta confianza'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Actividad recomendada</p>
                  <p className="text-2xl font-bold text-primary">
                    {getActivityLabel(recommendation.activityType)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Dificultad</p>
                  <Badge className={`text-base px-3 py-1 ${getDifficultyColor(recommendation.difficulty)}`}>
                    {getDifficultyLabel(recommendation.difficulty)}
                  </Badge>
                </div>
              </div>

              <Alert>
                <Zap className="size-4" />
                <AlertDescription className="text-base">
                  {recommendation.reason}
                </AlertDescription>
              </Alert>

              <Button asChild size="lg" className="w-full h-14 text-lg">
                <Link href={`/game?type=${recommendation.activityType}&difficulty=${recommendation.difficulty}&recommended=true`}>
                  <Target className="mr-2 size-5" />
                  Comenzar actividad recomendada
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-secondary/10">
                  <Trophy className="size-6 text-secondary" />
                </div>
                <CardTitle className="text-lg">Nivel</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-5xl font-bold text-foreground">
                {session.user?.level || 1}
              </div>
              <div className="space-y-2">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {experienceToNextLevel} XP para nivel {(session.user?.level || 1) + 1}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Experience Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-accent/10">
                  <Star className="size-6 text-accent" />
                </div>
                <CardTitle className="text-lg">Experiencia</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-5xl font-bold text-foreground">
                {session.user?.experience || 0}
              </div>
              <p className="text-sm text-muted-foreground">XP Totales</p>
            </CardContent>
          </Card>

          {/* Activities Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-success/10">
                  <Target className="size-6 text-success" />
                </div>
                <CardTitle className="text-lg">Ejercicios</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-5xl font-bold text-foreground">0</div>
              <p className="text-sm text-muted-foreground">Completados hoy</p>
            </CardContent>
          </Card>
        </div>

        {/* Giant Play Button */}
        <Card className="border-4 border-success shadow-2xl overflow-hidden group hover:scale-[1.02] transition-transform">
          <Link href="/game" className="block">
            <div className="bg-gradient-to-r from-success via-success/90 to-success p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-white/20 backdrop-blur group-hover:scale-110 transition-transform">
                  <Gamepad2 className="size-16 text-white" />
                </div>
                <div>
                  <h3 className="text-5xl font-black text-white drop-shadow-lg">¡A JUGAR!</h3>
                  <p className="text-xl text-white/90 font-bold mt-2">Comienza tu aventura</p>
                </div>
              </div>
            </div>
          </Link>
        </Card>

        {/* My Classes Section */}
        {isLoadingClasses && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-6" />
                Cargando clases...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </CardContent>
          </Card>
        )}

        {classes.length > 0 && !isLoadingClasses && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <div className="p-3 rounded-full bg-primary/10">
                  <GraduationCap className="size-8 text-primary" />
                </div>
                MIS CLASES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classes.map((classItem) => (
                  <Card key={classItem.id} className="border-2 hover:shadow-lg transition-all hover:scale-[1.02]">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{classItem.name}</CardTitle>
                        <Sparkles className="size-5 text-primary" />
                      </div>
                      {classItem.description && (
                        <CardDescription className="text-base">
                          {classItem.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        {classItem.grade && (
                          <Badge variant="secondary" className="gap-1">
                            <GraduationCap className="size-3" />
                            Grado {classItem.grade}
                          </Badge>
                        )}
                        <Badge variant="outline" className="gap-1">
                          <Users className="size-3" />
                          {classItem.studentCount} estudiantes
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivational Card */}
        <Card className="border-2 border-primary shadow-lg">
          <div className="bg-gradient-to-r from-primary via-accent to-secondary p-1">
            <div className="bg-background p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <TrendingUp className="size-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    ¡TÚ PUEDES HACERLO!
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    Cada problema que resuelves te hace más inteligente. ¡Sigue así, campeón!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
