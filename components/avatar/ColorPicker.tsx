/**
 * ColorPicker Component
 * HTML5 color input for selecting colors
 */

'use client'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

/**
 * ColorPicker component for selecting colors
 */
export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        {/* Color preview */}
        <div
          className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: value }}
        />

        {/* Color input */}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 h-12 rounded cursor-pointer border-2 border-gray-300 hover:border-blue-400 transition-colors"
        />

        {/* Hex value display */}
        <span className="text-sm font-mono text-gray-600 uppercase">
          {value}
        </span>
      </div>
    </div>
  )
}
