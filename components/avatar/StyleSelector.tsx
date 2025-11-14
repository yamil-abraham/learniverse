/**
 * StyleSelector Component
 * Radio button selector for style options
 */

'use client'

interface StyleOption {
  value: string
  label: string
}

interface StyleSelectorProps {
  label: string
  options: StyleOption[]
  value: string
  onChange: (value: string) => void
}

/**
 * StyleSelector component for selecting from predefined options
 */
export default function StyleSelector({ label, options, value, onChange }: StyleSelectorProps) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${
                value === option.value
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
