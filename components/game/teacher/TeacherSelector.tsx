/**
 * TeacherSelector Component
 * Allows students to choose their preferred 3D teacher
 */

'use client'

import { useState } from 'react'
import { AVAILABLE_TEACHERS, type TeacherModel } from './types'

interface TeacherSelectorProps {
  currentTeacherId?: string
  onSelectTeacher: (teacherId: string) => void
  onClose?: () => void
}

export function TeacherSelector({
  currentTeacherId = 'teacher1',
  onSelectTeacher,
  onClose,
}: TeacherSelectorProps) {
  const [selectedId, setSelectedId] = useState(currentTeacherId)

  const handleSelect = (teacherId: string) => {
    setSelectedId(teacherId)
  }

  const handleConfirm = () => {
    onSelectTeacher(selectedId)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6">
          <h2 className="text-3xl font-bold mb-2">Elige tu Profesor</h2>
          <p className="text-blue-100">Selecciona el profesor que te acompañará en tus aventuras matemáticas</p>
        </div>

        {/* Teacher Cards */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AVAILABLE_TEACHERS.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                isSelected={selectedId === teacher.id}
                isCurrent={currentTeacherId === teacher.id}
                onSelect={() => handleSelect(teacher.id)}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={selectedId === currentTeacherId}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {selectedId === currentTeacherId ? 'Ya seleccionado' : 'Confirmar Selección'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TeacherCardProps {
  teacher: TeacherModel
  isSelected: boolean
  isCurrent: boolean
  onSelect: () => void
}

function TeacherCard({ teacher, isSelected, isCurrent, onSelect }: TeacherCardProps) {
  // Voice name mapping for display
  const voiceNames: Record<string, string> = {
    nova: 'Nova (Femenina)',
    onyx: 'Onyx (Masculina)',
    alloy: 'Alloy (Neutral)',
    echo: 'Echo (Masculina)',
    fable: 'Fable (Femenina)',
    shimmer: 'Shimmer (Femenina)',
  }

  return (
    <button
      onClick={onSelect}
      className={`
        relative p-6 rounded-xl border-2 transition-all text-left
        ${isSelected
          ? 'border-blue-600 bg-blue-50 shadow-xl scale-105'
          : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-lg'
        }
      `}
    >
      {/* Current badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          Actual
        </div>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-4 left-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">✓</span>
        </div>
      )}

      {/* Teacher avatar placeholder */}
      <div className="mb-4 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
        <div className="text-6xl">
          {teacher.id === 'teacher1' ? '👩‍🏫' : '👨‍🏫'}
        </div>
      </div>

      {/* Teacher info */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{teacher.name}</h3>
      <p className="text-gray-600 mb-4">{teacher.description}</p>

      {/* Voice info */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="bg-gray-100 px-3 py-1 rounded-full">
          🎤 {voiceNames[teacher.voiceId] || teacher.voiceId}
        </span>
      </div>
    </button>
  )
}
