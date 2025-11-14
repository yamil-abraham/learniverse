/**
 * NextAuth Route Handler
 * Maneja todas las rutas de autenticación de NextAuth.js
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/config'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
