import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Users,
  GraduationCap,
  Trophy,
  Target,
  Brain,
  Rocket,
  Star
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            {/* Badge */}
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-semibold animate-bounce-soft">
              <Sparkles className="mr-2 size-4" />
              Plataforma Educativa Gamificada
            </Badge>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Bienvenido a Learniverse
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Aprende matemáticas de forma divertida con avatares 3D, actividades interactivas y un sistema de gamificación único
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button asChild size="lg" className="min-w-[200px] h-12 text-lg">
                <Link href="/login">
                  <GraduationCap className="mr-2 size-5" />
                  Iniciar Sesión
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="min-w-[200px] h-12 text-lg">
                <Link href="/register">
                  <Rocket className="mr-2 size-5" />
                  Registrarse Gratis
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
              {[
                { icon: Brain, label: 'Actividades', value: '100+' },
                { icon: Trophy, label: 'Insignias', value: '50+' },
                { icon: Users, label: 'Estudiantes', value: '1000+' },
                { icon: Star, label: 'Calificación', value: '4.9★' },
              ].map((stat, index) => (
                <div key={index} className="text-center animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <stat.icon className="size-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">¿Por qué Learniverse?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Una plataforma diseñada para hacer que el aprendizaje de matemáticas sea divertido y efectivo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Users className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Para Estudiantes</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Aprende matemáticas de forma divertida y personalizada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FeatureItem icon={Target} text="Avatares 3D personalizables" />
                <FeatureItem icon={Trophy} text="Sistema de puntos e insignias" />
                <FeatureItem icon={Brain} text="Actividades adaptativas con IA" />
                <FeatureItem icon={Star} text="Seguimiento de progreso en tiempo real" />
              </CardContent>
            </Card>

            {/* Teacher Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <GraduationCap className="size-6 text-accent" />
                  </div>
                  <CardTitle className="text-2xl">Para Docentes</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Monitorea y adapta el aprendizaje de tus estudiantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FeatureItem icon={Users} text="Dashboard completo de analíticas" />
                <FeatureItem icon={Target} text="Asignación de actividades personalizadas" />
                <FeatureItem icon={Trophy} text="Seguimiento de logros y progreso" />
                <FeatureItem icon={Sparkles} text="Alertas inteligentes de rendimiento" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-7xl text-center">
          <Badge variant="outline" className="mb-4">Tecnología</Badge>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            Desarrollado con Next.js 16, React 19, TypeScript, React Three Fiber, OpenAI GPT-4, y Tailwind CSS 4
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            ¿Listo para comenzar tu aventura?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Únete a miles de estudiantes que ya están aprendiendo de forma divertida
          </p>
          <Button asChild size="lg" className="min-w-[250px] h-14 text-xl">
            <Link href="/register">
              <Rocket className="mr-2 size-6" />
              Comenzar Ahora
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

function FeatureItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-3 text-muted-foreground">
      <div className="flex-shrink-0">
        <Icon className="size-5 text-success" />
      </div>
      <span className="text-sm leading-relaxed">{text}</span>
    </div>
  )
}
