/**
 * AvatarCustomizer Component
 * Main UI for customizing avatar appearance
 */

'use client'

import { useState } from 'react'
import MainScene from '@/components/3d/MainScene'
import ColorPicker from './ColorPicker'
import StyleSelector from './StyleSelector'
import ToggleSwitch from './ToggleSwitch'
import type { AvatarConfig } from '@/types'

interface AvatarCustomizerProps {
  initialConfig: AvatarConfig
  onSave: (config: AvatarConfig) => Promise<void>
  isSaving?: boolean
}

/**
 * AvatarCustomizer component combines 3D preview with customization controls
 */
export default function AvatarCustomizer({
  initialConfig,
  onSave,
  isSaving = false,
}: AvatarCustomizerProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig)

  const updateConfig = (updates: Partial<AvatarConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  const handleSave = async () => {
    await onSave(config)
  }

  const hairStyleOptions = [
    { value: 'short', label: 'Corto' },
    { value: 'long', label: 'Largo' },
    { value: 'curly', label: 'Rizado' },
    { value: 'spiky', label: 'Puntiagudo' },
    { value: 'bald', label: 'Calvo' },
  ]

  const hatStyleOptions = [
    { value: 'none', label: 'Sin Gorro' },
    { value: 'cap', label: 'Gorra' },
    { value: 'beanie', label: 'Gorro' },
    { value: 'crown', label: 'Corona' },
  ]

  const shirtStyleOptions = [
    { value: 'tshirt', label: 'Camiseta' },
    { value: 'hoodie', label: 'Sudadera' },
    { value: 'vest', label: 'Chaleco' },
  ]

  const animationOptions = [
    { value: 'bounce', label: 'Rebote' },
    { value: 'wave', label: 'Saludo' },
    { value: 'spin', label: 'Girar' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Personaliza tu Avatar
          </h1>
          <p className="text-white/90">
            Crea un avatar único que te represente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3D Preview */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Vista Previa
            </h2>
            <div className="aspect-square bg-gradient-to-b from-sky-100 to-sky-50 rounded-xl overflow-hidden">
              <MainScene avatarConfig={config} />
            </div>
          </div>

          {/* Customization Controls */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[800px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Personalización
            </h2>

            <div className="space-y-6">
              {/* Body Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Cuerpo
                </h3>
                <div className="space-y-4">
                  <ColorPicker
                    label="Color de Piel"
                    value={config.skinColor}
                    onChange={(color) => updateConfig({ skinColor: color })}
                  />
                  <ColorPicker
                    label="Color de Ropa"
                    value={config.bodyColor}
                    onChange={(color) => updateConfig({ bodyColor: color })}
                  />
                  <ColorPicker
                    label="Color de Zapatos"
                    value={config.shoeColor}
                    onChange={(color) => updateConfig({ shoeColor: color })}
                  />
                </div>
              </div>

              {/* Head Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Cabeza
                </h3>
                <div className="space-y-4">
                  <StyleSelector
                    label="Estilo de Cabello"
                    options={hairStyleOptions}
                    value={config.hairStyle}
                    onChange={(value) =>
                      updateConfig({ hairStyle: value as AvatarConfig['hairStyle'] })
                    }
                  />
                  <ColorPicker
                    label="Color de Cabello"
                    value={config.hairColor}
                    onChange={(color) => updateConfig({ hairColor: color })}
                  />
                  <ColorPicker
                    label="Color de Ojos"
                    value={config.eyeColor}
                    onChange={(color) => updateConfig({ eyeColor: color })}
                  />
                </div>
              </div>

              {/* Accessories Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Accesorios
                </h3>
                <div className="space-y-4">
                  <StyleSelector
                    label="Gorro"
                    options={hatStyleOptions}
                    value={config.hatStyle}
                    onChange={(value) =>
                      updateConfig({ hatStyle: value as AvatarConfig['hatStyle'] })
                    }
                  />
                  <ToggleSwitch
                    label="Gafas"
                    checked={config.showGlasses}
                    onChange={(checked) => updateConfig({ showGlasses: checked })}
                  />
                </div>
              </div>

              {/* Clothing Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Ropa
                </h3>
                <div className="space-y-4">
                  <StyleSelector
                    label="Estilo de Camisa"
                    options={shirtStyleOptions}
                    value={config.shirtStyle}
                    onChange={(value) =>
                      updateConfig({ shirtStyle: value as AvatarConfig['shirtStyle'] })
                    }
                  />
                </div>
              </div>

              {/* Animation Section */}
              <div className="pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Animación
                </h3>
                <div className="space-y-4">
                  <StyleSelector
                    label="Animación Inactiva"
                    options={animationOptions}
                    value={config.idleAnimation}
                    onChange={(value) =>
                      updateConfig({ idleAnimation: value as AvatarConfig['idleAnimation'] })
                    }
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSaving ? (
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
                    Guardando...
                  </span>
                ) : (
                  'Guardar Avatar'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
