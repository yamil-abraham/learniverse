/**
 * ToggleSwitch Component
 * Modern toggle switch for boolean values
 */

'use client'

interface ToggleSwitchProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/**
 * ToggleSwitch component for boolean options
 */
export default function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-8 w-14 items-center rounded-full transition-colors
          ${checked ? 'bg-blue-500' : 'bg-gray-300'}
        `}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`
            inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md
            ${checked ? 'translate-x-7' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}
