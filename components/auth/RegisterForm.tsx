/**
 * Formulario de Registro
 * Componente para registro de nuevos usuarios (estudiantes y profesores)
 */

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { UserRole } from '@/types'

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
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Crear Cuenta
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            ¡Registro exitoso! Redirigiendo al login...
          </div>
        )}

        {/* Nombre */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tu nombre"
            disabled={isLoading}
            required
            aria-label="Nombre completo"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
            disabled={isLoading}
            required
            aria-label="Email"
          />
        </div>

        {/* Rol */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
            Tipo de cuenta
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            required
            aria-label="Tipo de cuenta"
          >
            <option value="student">Estudiante</option>
            <option value="teacher">Profesor/a</option>
          </select>
        </div>

        {/* Campo específico para estudiantes: Grado */}
        {formData.role === 'student' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="grade">
              Grado escolar
            </label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              required
              aria-label="Grado escolar"
            >
              <option value={4}>4º Grado</option>
              <option value={5}>5º Grado</option>
            </select>
          </div>
        )}

        {/* Campo específico para profesores: Escuela (opcional) */}
        {formData.role === 'teacher' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="school">
              Escuela (opcional)
            </label>
            <input
              id="school"
              name="school"
              type="text"
              value={formData.school}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de tu escuela"
              disabled={isLoading}
              aria-label="Escuela"
            />
          </div>
        )}

        {/* Contraseña */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mínimo 6 caracteres"
            disabled={isLoading}
            required
            aria-label="Contraseña"
          />
        </div>

        {/* Confirmar contraseña */}
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="confirmPassword"
          >
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Repite tu contraseña"
            disabled={isLoading}
            required
            aria-label="Confirmar contraseña"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading || success}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Registrando...
              </span>
            ) : (
              'Registrarse'
            )}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-blue-500 hover:text-blue-700 font-semibold">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
