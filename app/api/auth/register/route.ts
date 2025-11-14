/**
 * API de Registro de Usuarios
 * Maneja la creación de nuevos usuarios (estudiantes y profesores)
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createUserWithProfile, getUserByEmail } from '@/lib/db/queries'
import type { UserRole } from '@/types'

/**
 * Schema de validación para el registro
 */
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['student', 'teacher'], {
    errorMap: () => ({ message: 'El rol debe ser student o teacher' }),
  }),
  grade: z.number().int().min(4).max(5).optional(),
  school: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Parsear y validar el body
    const body = await request.json()
    const validationResult = registerSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { email, password, name, role, grade, school } = validationResult.data

    // Validaciones específicas por rol
    if (role === 'student' && !grade) {
      return NextResponse.json(
        { error: 'El grado es requerido para estudiantes' },
        { status: 400 }
      )
    }

    if (grade && (grade < 4 || grade > 5)) {
      return NextResponse.json(
        { error: 'El grado debe ser 4 o 5' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      )
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, 12)

    // Crear usuario con perfil
    const result = await createUserWithProfile(
      email,
      passwordHash,
      name,
      role as UserRole,
      {
        grade,
        school,
      }
    )

    // Preparar respuesta (sin incluir password_hash)
    const response = {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      student: result.student
        ? {
            id: result.student.id,
            grade: result.student.grade,
            level: result.student.level,
            experience: result.student.experience,
          }
        : undefined,
      teacher: result.teacher
        ? {
            id: result.teacher.id,
            school: result.teacher.school,
          }
        : undefined,
    }

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        data: response,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error during registration:', error)

    // Manejar errores de base de datos
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Este email ya está registrado' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Error al registrar el usuario. Por favor intenta de nuevo.' },
      { status: 500 }
    )
  }
}
