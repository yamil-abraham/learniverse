/**
 * Avatar Component
 * 3D character with customizable appearance
 */

// @ts-nocheck
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import type { AvatarConfig } from '@/types'

interface AvatarProps {
  config: AvatarConfig
}

/**
 * Avatar component renders a customizable 3D character
 */
export default function Avatar({ config }: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const armLeftRef = useRef<THREE.Mesh>(null)
  const armRightRef = useRef<THREE.Mesh>(null)

  // Idle animation
  useFrame((state) => {
    if (!groupRef.current) return

    const time = state.clock.elapsedTime

    switch (config.idleAnimation) {
      case 'bounce':
        // Gentle bouncing motion
        groupRef.current.position.y = Math.sin(time * 2) * 0.1
        break
      case 'wave':
        // Wave with right arm
        if (armRightRef.current) {
          armRightRef.current.rotation.z = Math.sin(time * 2) * 0.5 - 0.3
        }
        break
      case 'spin':
        // Slow rotation
        groupRef.current.rotation.y = time * 0.5
        break
    }

    // Head bob for all animations
    if (headRef.current) {
      headRef.current.position.y = Math.sin(time * 3) * 0.02
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]} castShadow>
      {/* Legs */}
      <group position={[0, 0.5, 0]}>
        {/* Left Leg */}
        <mesh position={[-0.15, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
          <meshStandardMaterial color={config.bodyColor} />
        </mesh>

        {/* Right Leg */}
        <mesh position={[0.15, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
          <meshStandardMaterial color={config.bodyColor} />
        </mesh>
      </group>

      {/* Shoes */}
      <group position={[0, 0, 0.05]}>
        {/* Left Shoe */}
        <mesh position={[-0.15, 0.22, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.18]} />
          <meshStandardMaterial color={config.shoeColor} />
        </mesh>

        {/* Right Shoe */}
        <mesh position={[0.15, 0.22, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.18]} />
          <meshStandardMaterial color={config.shoeColor} />
        </mesh>
      </group>

      {/* Torso */}
      <mesh position={[0, 1, 0]} castShadow>
        {config.shirtStyle === 'hoodie' ? (
          <>
            <cylinderGeometry args={[0.35, 0.25, 0.8, 16]} />
            <meshStandardMaterial color={config.bodyColor} />
          </>
        ) : config.shirtStyle === 'vest' ? (
          <>
            <cylinderGeometry args={[0.28, 0.25, 0.7, 16]} />
            <meshStandardMaterial color={config.bodyColor} />
          </>
        ) : (
          <>
            <cylinderGeometry args={[0.3, 0.25, 0.75, 16]} />
            <meshStandardMaterial color={config.bodyColor} />
          </>
        )}
      </mesh>

      {/* Arms */}
      <group>
        {/* Left Arm */}
        <mesh ref={armLeftRef} position={[-0.35, 0.9, 0]} rotation={[0, 0, 0.3]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 12]} />
          <meshStandardMaterial color={config.skinColor} />
        </mesh>

        {/* Right Arm */}
        <mesh ref={armRightRef} position={[0.35, 0.9, 0]} rotation={[0, 0, -0.3]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 12]} />
          <meshStandardMaterial color={config.skinColor} />
        </mesh>
      </group>

      {/* Head Group */}
      <group ref={headRef} position={[0, 1.6, 0]}>
        {/* Head */}
        <mesh castShadow>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color={config.skinColor} />
        </mesh>

        {/* Eyes */}
        <group position={[0, 0.05, 0.25]}>
          {/* Left Eye */}
          <mesh position={[-0.1, 0, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color={config.eyeColor} />
          </mesh>

          {/* Right Eye */}
          <mesh position={[0.1, 0, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color={config.eyeColor} />
          </mesh>

          {/* Eye whites */}
          <mesh position={[-0.1, 0, -0.01]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.1, 0, -0.01]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Glasses (if enabled) */}
        {config.showGlasses && (
          <group position={[0, 0.05, 0.28]}>
            {/* Left lens */}
            <mesh position={[-0.1, 0, 0]}>
              <circleGeometry args={[0.08, 32]} />
              <meshStandardMaterial color="#333333" transparent opacity={0.3} />
            </mesh>
            {/* Right lens */}
            <mesh position={[0.1, 0, 0]}>
              <circleGeometry args={[0.08, 32]} />
              <meshStandardMaterial color="#333333" transparent opacity={0.3} />
            </mesh>
            {/* Bridge */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          </group>
        )}

        {/* Hair */}
        {config.hairStyle !== 'bald' && (
          <group position={[0, 0.15, 0]}>
            {config.hairStyle === 'short' && (
              <mesh castShadow>
                <sphereGeometry args={[0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={config.hairColor} />
              </mesh>
            )}

            {config.hairStyle === 'long' && (
              <>
                <mesh castShadow>
                  <sphereGeometry args={[0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
                  <meshStandardMaterial color={config.hairColor} />
                </mesh>
                {/* Long hair back */}
                <mesh position={[0, -0.3, -0.2]} castShadow>
                  <boxGeometry args={[0.5, 0.5, 0.1]} />
                  <meshStandardMaterial color={config.hairColor} />
                </mesh>
              </>
            )}

            {config.hairStyle === 'curly' && (
              <>
                <mesh castShadow>
                  <sphereGeometry args={[0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial color={config.hairColor} roughness={0.8} />
                </mesh>
              </>
            )}

            {config.hairStyle === 'spiky' && (
              <>
                <mesh castShadow>
                  <coneGeometry args={[0.3, 0.4, 6]} />
                  <meshStandardMaterial color={config.hairColor} />
                </mesh>
              </>
            )}
          </group>
        )}

        {/* Hat */}
        {config.hatStyle !== 'none' && (
          <group position={[0, 0.3, 0]}>
            {config.hatStyle === 'cap' && (
              <>
                {/* Cap top */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.25, 0.3, 0.15, 32]} />
                  <meshStandardMaterial color="#ff0000" />
                </mesh>
                {/* Cap brim */}
                <mesh position={[0, -0.05, 0.15]} rotation={[0.3, 0, 0]} castShadow>
                  <boxGeometry args={[0.5, 0.02, 0.3]} />
                  <meshStandardMaterial color="#ff0000" />
                </mesh>
              </>
            )}

            {config.hatStyle === 'beanie' && (
              <mesh castShadow>
                <sphereGeometry args={[0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
                <meshStandardMaterial color="#4a5568" roughness={0.9} />
              </mesh>
            )}

            {config.hatStyle === 'crown' && (
              <>
                {/* Crown base */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.32, 0.3, 0.15, 8]} />
                  <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Crown points */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <mesh
                    key={i}
                    position={[
                      Math.cos((i / 8) * Math.PI * 2) * 0.3,
                      0.15,
                      Math.sin((i / 8) * Math.PI * 2) * 0.3,
                    ]}
                    castShadow
                  >
                    <coneGeometry args={[0.08, 0.2, 4]} />
                    <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
                  </mesh>
                ))}
              </>
            )}
          </group>
        )}
      </group>
    </group>
  )
}
