/**
 * Loader Component
 * 3D loading indicator shown while scene assets load
 */

// @ts-nocheck
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

/**
 * Loader component displays a spinning cube while 3D scene loads
 */
export default function Loader() {
  const meshRef = useRef<THREE.Mesh>(null)

  // Rotate the loader
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
  )
}
