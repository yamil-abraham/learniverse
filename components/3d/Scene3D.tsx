// @ts-nocheck
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { ReactNode } from 'react'

interface Scene3DProps {
  children: ReactNode
}

/**
 * Componente contenedor para escenas 3D
 * Configura el Canvas de React Three Fiber con controles y ambiente
 */
export default function Scene3D({ children }: Scene3DProps) {
  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 75,
        }}
        className="bg-gradient-to-b from-sky-200 to-sky-50"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {children}

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
        />

        <Environment preset="sunset" />
      </Canvas>
    </div>
  )
}
