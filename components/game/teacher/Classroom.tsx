// @ts-nocheck
/**
 * Classroom Environment Component
 * Switchable 3D classroom backgrounds
 */

'use client'

import { useRef, useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export type ClassroomType = 'modern' | 'traditional' | 'none'

export interface ClassroomProps {
  type?: ClassroomType
  position?: [number, number, number]
  scale?: number
  onLoadComplete?: () => void
}

export function Classroom({
  type = 'modern',
  position = [0, 0, 0],
  scale = 1,
  onLoadComplete
}: ClassroomProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [modelPath, setModelPath] = useState<string | null>(null)

  // Determine model path based on type
  useEffect(() => {
    switch (type) {
      case 'modern':
        setModelPath('/models/environments/classroom1.glb')
        break
      case 'traditional':
        setModelPath('/models/environments/classroom2.glb')
        break
      case 'none':
        setModelPath(null)
        break
      default:
        setModelPath('/models/environments/classroom1.glb')
    }
  }, [type])

  // Load model if path is set
  const { scene } = modelPath ? useGLTF(modelPath) : { scene: null }

  useEffect(() => {
    if (scene && onLoadComplete) {
      onLoadComplete()
    }
  }, [scene, onLoadComplete])

  // If no classroom selected, render simple environment
  if (type === 'none' || !scene) {
    return (
      <group ref={groupRef} position={position}>
        {/* Simple floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>

        {/* Simple walls */}
        <mesh position={[0, 2, -5]}>
          <planeGeometry args={[20, 5]} />
          <meshStandardMaterial color="#E8E8E8" side={THREE.DoubleSide} />
        </mesh>

        <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[10, 5]} />
          <meshStandardMaterial color="#E8E8E8" side={THREE.DoubleSide} />
        </mesh>

        <mesh position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[10, 5]} />
          <meshStandardMaterial color="#E8E8E8" side={THREE.DoubleSide} />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={scene.clone()} />
    </group>
  )
}

// Preload classroom models
useGLTF.preload('/models/environments/classroom1.glb')
useGLTF.preload('/models/environments/classroom2.glb')

export default Classroom
