import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

/**
 * API Route: Generar ejercicio matemático con IA
 *
 * Configuración en vercel.json:
 * - maxDuration: 60s (para llamadas a OpenAI)
 * - memory: 1024 MB
 *
 * Endpoint: POST /api/ai/generate-exercise
 */

// Schema de validación con Zod
const ExerciseRequestSchema = z.object({
  topic: z.enum(['arithmetic', 'geometry', 'logic', 'word-problem']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  studentLevel: z.number().min(1).max(6),
})

export async function POST(request: NextRequest) {
  try {
    // Validar API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Parsear y validar body
    const body = await request.json()
    const validatedData = ExerciseRequestSchema.parse(body)

    // Inicializar cliente de OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Generar ejercicio con GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente educativo especializado en crear ejercicios matemáticos
          para niños de 9-11 años. Los ejercicios deben ser claros, educativos y divertidos.`,
        },
        {
          role: 'user',
          content: `Crea un ejercicio de matemática con las siguientes características:
          - Tema: ${validatedData.topic}
          - Dificultad: ${validatedData.difficulty}
          - Nivel del estudiante: ${validatedData.studentLevel}

          Devuelve la respuesta en formato JSON con esta estructura:
          {
            "question": "Pregunta del ejercicio",
            "options": ["opción 1", "opción 2", "opción 3", "opción 4"],
            "correctAnswer": "respuesta correcta",
            "explanation": "explicación breve de la solución",
            "hints": ["pista 1", "pista 2"]
          }`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    // Extraer respuesta
    const exerciseData = completion.choices[0]?.message?.content
    if (!exerciseData) {
      throw new Error('No se pudo generar el ejercicio')
    }

    const exercise = JSON.parse(exerciseData)

    // Responder con el ejercicio generado
    return NextResponse.json({
      success: true,
      exercise,
      metadata: {
        model: completion.model,
        tokensUsed: completion.usage?.total_tokens,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    // Manejo de errores
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error generating exercise:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate exercise',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// OPTIONS para CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}
