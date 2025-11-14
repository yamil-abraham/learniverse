/**
 * Middleware de Autenticación
 * Protege rutas y redirige según el rol del usuario
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Si el usuario está autenticado y trata de acceder a login, register o raíz
    if (token && (path === '/login' || path === '/register' || path === '/')) {
      // Redirigir al dashboard apropiado según su rol
      if (token.role === 'student') {
        return NextResponse.redirect(new URL('/dashboard/student', req.url))
      } else if (token.role === 'teacher') {
        return NextResponse.redirect(new URL('/dashboard/teacher', req.url))
      }
    }

    // Verificar acceso a rutas protegidas
    if (path.startsWith('/dashboard/student') && token?.role !== 'student') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (path.startsWith('/dashboard/teacher') && token?.role !== 'teacher') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (path.startsWith('/game') && token?.role !== 'student') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (path.startsWith('/avatar') && token?.role !== 'student') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Permitir acceso público a estas rutas
        if (
          path === '/login' ||
          path === '/register' ||
          path === '/' ||
          path.startsWith('/api/auth') ||
          path.startsWith('/_next') ||
          path.startsWith('/favicon')
        ) {
          return true
        }

        // Para todas las demás rutas, requiere autenticación
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

// Configuración de qué rutas debe verificar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
}
