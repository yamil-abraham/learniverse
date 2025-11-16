/**
 * VoiceSettings Component
 * Allows teachers to configure voice settings per class
 */

'use client'

import { useState, useEffect } from 'react'
import { AVAILABLE_TEACHERS } from '@/components/game/teacher/types'

export interface ClassVoiceSettings {
  classId: string
  defaultVoice: string
  defaultTeacherModel: string
  languageFormality: 'formal' | 'casual' | 'mixed'
  voiceInputEnabled: boolean
  whiteboardEnabled: boolean
  animationsEnabled: boolean
}

interface VoiceSettingsProps {
  classId: string
  initialSettings?: ClassVoiceSettings
  onSave: (settings: ClassVoiceSettings) => Promise<void>
}

const VOICE_OPTIONS = [
  { id: 'nova', name: 'Nova', description: 'Voz femenina clara y amigable', gender: 'Femenina' },
  { id: 'alloy', name: 'Alloy', description: 'Voz neutral versátil', gender: 'Neutral' },
  { id: 'echo', name: 'Echo', description: 'Voz masculina clara', gender: 'Masculina' },
  { id: 'fable', name: 'Fable', description: 'Voz femenina expresiva', gender: 'Femenina' },
  { id: 'onyx', name: 'Onyx', description: 'Voz masculina profunda', gender: 'Masculina' },
  { id: 'shimmer', name: 'Shimmer', description: 'Voz femenina suave', gender: 'Femenina' },
]

const FORMALITY_OPTIONS = [
  { id: 'formal', name: 'Formal', description: 'Usa "usted", tono profesional' },
  { id: 'casual', name: 'Casual', description: 'Usa "tú", tono amigable y cercano' },
  { id: 'mixed', name: 'Mixto', description: 'Mezcla según el contexto' },
] as const

export function VoiceSettings({ classId, initialSettings, onSave }: VoiceSettingsProps) {
  const [settings, setSettings] = useState<ClassVoiceSettings>(
    initialSettings || {
      classId,
      defaultVoice: 'nova',
      defaultTeacherModel: 'teacher1',
      languageFormality: 'mixed',
      voiceInputEnabled: true,
      whiteboardEnabled: true,
      animationsEnabled: true,
    }
  )

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings)
    }
  }, [initialSettings])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveMessage(null)
      await onSave(settings)
      setSaveMessage({ type: 'success', text: '✅ Configuración guardada correctamente' })
    } catch (error: any) {
      console.error('Error saving settings:', error)
      setSaveMessage({ type: 'error', text: '❌ Error al guardar la configuración' })
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = <K extends keyof ClassVoiceSettings>(
    key: K,
    value: ClassVoiceSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Configuración de Voz del Profesor</h2>
        <p className="text-gray-600 mt-1">Personaliza cómo el profesor interactúa con tus estudiantes</p>
      </div>

      {/* Teacher Model Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Modelo de Profesor 3D
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_TEACHERS.map((teacher) => (
            <button
              key={teacher.id}
              onClick={() => updateSetting('defaultTeacherModel', teacher.id)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${settings.defaultTeacherModel === teacher.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {teacher.id === 'teacher1' ? '👩‍🏫' : '👨‍🏫'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{teacher.name}</div>
                  <div className="text-sm text-gray-600">{teacher.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Voz del Profesor
        </label>
        <select
          value={settings.defaultVoice}
          onChange={(e) => updateSetting('defaultVoice', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {VOICE_OPTIONS.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name} ({voice.gender}) - {voice.description}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500">
          La voz seleccionada se usará para todas las interacciones del profesor
        </p>
      </div>

      {/* Language Formality */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Nivel de Formalidad
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FORMALITY_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => updateSetting('languageFormality', option.id)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${settings.languageFormality === option.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400'
                }
              `}
            >
              <div className="font-semibold text-gray-900 mb-1">{option.name}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Funcionalidades Habilitadas
        </label>
        <div className="space-y-3">
          <ToggleSwitch
            label="Entrada de voz de estudiantes"
            description="Permite a los estudiantes hablar al profesor usando el micrófono"
            checked={settings.voiceInputEnabled}
            onChange={(checked) => updateSetting('voiceInputEnabled', checked)}
          />
          <ToggleSwitch
            label="Pizarra interactiva"
            description="El profesor puede mostrar problemas matemáticos en una pizarra 3D"
            checked={settings.whiteboardEnabled}
            onChange={(checked) => updateSetting('whiteboardEnabled', checked)}
          />
          <ToggleSwitch
            label="Animaciones del profesor"
            description="El profesor usa gestos y expresiones animadas"
            checked={settings.animationsEnabled}
            onChange={(checked) => updateSetting('animationsEnabled', checked)}
          />
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`
            p-4 rounded-lg
            ${saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}
          `}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  )
}

interface ToggleSwitchProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleSwitch({ label, description, checked, onChange }: ToggleSwitchProps) {
  return (
    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-sm text-gray-600 mt-1">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${checked ? 'bg-blue-600' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}
