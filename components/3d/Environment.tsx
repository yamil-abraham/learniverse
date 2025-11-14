/**
 * Environment Component
 * Creates the 3D environment (ground, sky, etc.)
 */

// @ts-nocheck
'use client'

import { useRef } from 'react'
import type * as THREE from 'three'

/**
 * Environment component renders the ground plane and ambient scene elements
 */
export default function Environment() {
  const groundRef = useRef<THREE.Mesh>(null)

  return (
    <group>
      {/* Ground plane */}
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#90EE90" />
      </mesh>

      {/* Grid helper for reference (optional) */}
      <gridHelper args={[20, 20, '#cccccc', '#eeeeee']} position={[0, -0.49, 0]} />
    </group>
  )
}
