/**
 * ImmersiveTeacher Component
 * Fullscreen 3D teacher experience for game page
 */

'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Loader } from '@react-three/drei'
import { MathExperience, TypingBox } from '@/components/3d/game'

interface ImmersiveTeacherProps {
  onClose: () => void
}

export function ImmersiveTeacher({ onClose }: ImmersiveTeacherProps) {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2"
      >
        <span>✕</span>
        Cerrar Profesor
      </button>

      {/* 3D Canvas (fullscreen) */}
      <Canvas
        shadows
        camera={{
          position: [0, 0, 0.0001],
          fov: 42,
        }}
      >
        <Suspense fallback={null}>
          <MathExperience />
        </Suspense>
      </Canvas>

      {/* Typing Box (HTML overlay at bottom) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <TypingBox />
      </div>

      {/* Loader */}
      <Loader />
    </div>
  )
}
