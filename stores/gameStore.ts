import { create } from 'zustand'
import { GameState, Activity } from '@/types'

interface GameStore extends GameState {
  // Acciones
  startGame: (activity: Activity) => void
  endGame: () => void
  updateScore: (points: number) => void
  updateTime: (seconds: number) => void
  loseLife: () => void
  resetGame: () => void
}

const initialState: GameState = {
  isPlaying: false,
  currentActivity: null,
  score: 0,
  timeElapsed: 0,
  lives: 3,
}

/**
 * Store global del estado del juego usando Zustand
 */
export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  startGame: (activity) =>
    set({
      isPlaying: true,
      currentActivity: activity,
      timeElapsed: 0,
    }),

  endGame: () =>
    set({
      isPlaying: false,
      currentActivity: null,
    }),

  updateScore: (points) =>
    set((state) => ({
      score: state.score + points,
    })),

  updateTime: (seconds) =>
    set({
      timeElapsed: seconds,
    }),

  loseLife: () =>
    set((state) => ({
      lives: Math.max(0, state.lives - 1),
    })),

  resetGame: () => set(initialState),
}))
