/**
 * TypingBox Component
 * Copied from r3f-ai-language-teacher/src/components/TypingBox.jsx
 * Adapted for math Q&A
 */

'use client'

import { useState } from 'react'
import { useTeacherStore } from '@/stores/teacherStore'

export function TypingBox() {
  const requestQAResponse = useTeacherStore((state) => state.requestQAResponse)
  const loading = useTeacherStore((state) => state.loading)
  const [question, setQuestion] = useState('')

  const ask = () => {
    if (!question.trim()) return
    requestQAResponse(question)
    setQuestion('')
  }

  return (
    <div className="z-10 max-w-[600px] flex space-y-6 flex-col bg-gradient-to-tr from-slate-300/30 via-gray-400/30 to-slate-600-400/30 p-4 backdrop-blur-md rounded-xl border-slate-100/30 border">
      <div>
        <h2 className="text-white font-bold text-xl">
          Pregúntale al Profesor
        </h2>
        <p className="text-white/65">
          Escribe cualquier pregunta sobre matemáticas y el profesor te responderá.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
          </span>
        </div>
      ) : (
        <div className="gap-3 flex">
          <input
            className="focus:outline focus:outline-white/80 flex-grow bg-slate-800/60 p-2 px-4 rounded-full text-white placeholder:text-white/50 shadow-inner shadow-slate-900/60"
            placeholder="¿Cómo se resuelve 7 + 5?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                ask()
              }
            }}
          />
          <button
            className="bg-slate-100/20 p-2 px-6 rounded-full text-white hover:bg-slate-100/30 transition-colors"
            onClick={ask}
          >
            Preguntar
          </button>
        </div>
      )}
    </div>
  )
}
