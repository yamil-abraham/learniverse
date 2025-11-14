/**
 * Avatar Store
 * Zustand store for managing avatar state
 */

import { create } from 'zustand'
import type { AvatarConfig } from '@/types'
import { DEFAULT_AVATAR_CONFIG } from '@/types'

interface AvatarState {
  // Current avatar configuration
  config: AvatarConfig

  // Loading states
  isLoading: boolean
  isSaving: boolean

  // Error state
  error: string | null

  // Actions
  setConfig: (config: AvatarConfig) => void
  updateConfig: (partial: Partial<AvatarConfig>) => void
  saveAvatar: (studentId: string) => Promise<boolean>
  loadAvatar: (studentId: string) => Promise<void>
  resetToDefault: () => void
}

/**
 * Zustand store for avatar customization
 */
export const useAvatarStore = create<AvatarState>((set, get) => ({
  // Initial state
  config: DEFAULT_AVATAR_CONFIG,
  isLoading: false,
  isSaving: false,
  error: null,

  // Set entire configuration
  setConfig: (config) => {
    set({ config, error: null })
  },

  // Update partial configuration
  updateConfig: (partial) => {
    set((state) => ({
      config: { ...state.config, ...partial },
      error: null,
    }))
  },

  // Save avatar to database
  saveAvatar: async (studentId: string) => {
    set({ isSaving: true, error: null })

    try {
      const response = await fetch('/api/avatar/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          avatarConfig: get().config,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Error al guardar avatar')
      }

      set({ isSaving: false })
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      set({ isSaving: false, error: message })
      console.error('Error saving avatar:', error)
      return false
    }
  },

  // Load avatar from database
  loadAvatar: async (studentId: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`/api/avatar/load?studentId=${studentId}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Error al cargar avatar')
      }

      const data = await response.json()

      if (data.avatarConfig) {
        set({ config: data.avatarConfig, isLoading: false })
      } else {
        // Use default if no config found
        set({ config: DEFAULT_AVATAR_CONFIG, isLoading: false })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      set({ isLoading: false, error: message, config: DEFAULT_AVATAR_CONFIG })
      console.error('Error loading avatar:', error)
    }
  },

  // Reset to default configuration
  resetToDefault: () => {
    set({ config: DEFAULT_AVATAR_CONFIG, error: null })
  },
}))
