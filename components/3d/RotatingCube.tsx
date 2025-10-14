// @ts-nocheck
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

/**
 * Componente de ejemplo: Cubo rotatorio 3D
 * Demuestra el uso básico de React Three Fiber
 */
export default function RotatingCube() {
  const meshRef = useRef<Mesh>(null)

  // Animación: rotar el cubo en cada frame
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.7
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#0ea5e9" />
    </mesh>
  )
}
