/**
 * Main 3D Scene Component
 * Wrapper for React Three Fiber Canvas with avatar display
 */

// @ts-nocheck
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import Avatar from './Avatar'
import Environment from './Environment'
import Loader from './Loader'
import ErrorFallback from './ErrorFallback'
import type { AvatarConfig } from '@/types'

interface MainSceneProps {
  avatarConfig: AvatarConfig
}

/**
 * MainScene component renders the 3D canvas with avatar and environment
 */
export default function MainScene({ avatarConfig }: MainSceneProps) {
  return (
    <div className="w-full h-full min-h-[400px]">
      <ErrorFallback>
        <Canvas
          className="bg-gradient-to-b from-sky-200 to-sky-50"
          shadows
          gl={{ antialias: true }}
        >
          <Suspense fallback={<Loader />}>
            {/* Camera */}
            <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={50} />

            {/* Controls */}
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              enableRotate={true}
              minDistance={3}
              maxDistance={8}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2}
            />

            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, 10, -5]} intensity={0.3} />

            {/* Scene content */}
            <Environment />
            <Avatar config={avatarConfig} />
          </Suspense>
        </Canvas>
      </ErrorFallback>
    </div>
  )
}
