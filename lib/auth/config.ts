/**
 * Configuración de NextAuth.js
 * Define proveedores, callbacks y opciones de autenticación
 */

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmail, getUserProfile } from '@/lib/db/queries'
import type { UserRole } from '@/types'

/**
 * Tipos extendidos para NextAuth
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      studentId?: string
      teacherId?: string
      level?: number
      experience?: number
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    studentId?: string
    teacherId?: string
    level?: number
    experience?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    role: UserRole
    studentId?: string
    teacherId?: string
    level?: number
    experience?: number
  }
}

/**
 * Configuración de NextAuth
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        try {
          // Buscar usuario por email
          const user = await getUserByEmail(credentials.email)

          if (!user) {
            throw new Error('Credenciales inválidas')
          }

          // Verificar contraseña
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isPasswordValid) {
            throw new Error('Credenciales inválidas')
          }

          // Obtener perfil completo (estudiante o profesor)
          const profile = await getUserProfile(user.id)

          // Preparar objeto de usuario para la sesión
          const userSession: any = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }

          // Agregar datos específicos según el rol
          if (user.role === 'student' && profile.student) {
            userSession.studentId = profile.student.id
            userSession.level = profile.student.level
            userSession.experience = profile.student.experience
          } else if (user.role === 'teacher' && profile.teacher) {
            userSession.teacherId = profile.teacher.id
          }

          return userSession
        } catch (error) {
          console.error('Error during authentication:', error)
          throw error
        }
      },
    }),
  ],

  callbacks: {
    /**
     * Callback JWT: Se ejecuta cuando se crea o actualiza el token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.studentId = user.studentId
        token.teacherId = user.teacherId
        token.level = user.level
        token.experience = user.experience
      }
      return token
    },

    /**
     * Callback Session: Se ejecuta cuando se accede a la sesión
     */
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          studentId: token.studentId,
          teacherId: token.teacherId,
          level: token.level,
          experience: token.experience,
        }
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
}
