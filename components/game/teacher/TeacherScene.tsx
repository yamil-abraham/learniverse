// @ts-nocheck
/**
 * TeacherScene Component
 * Three.js Canvas wrapper for 3D teacher with environment
 */

'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import type { TeacherSceneProps } from './types'
import { Classroom, type ClassroomType } from './Classroom'
import { Whiteboard } from './Whiteboard'
import type { MathOperationType } from '@/lib/whiteboard/math-animator'

export interface EnhancedTeacherSceneProps extends TeacherSceneProps {
  classroomType?: ClassroomType
  showWhiteboard?: boolean
  whiteboardProblem?: {
    operation: MathOperationType
    operand1: number
    operand2: number
  } | null
  onWhiteboardAnimationComplete?: () => void
}

export function TeacherScene({
  children,
  cameraPosition = [0, 0, 5],
  cameraFov = 50,
  enableShadows = true,
  backgroundColor = '#1a1a2e',
  classroomType = 'modern',
  showWhiteboard = false,
  whiteboardProblem = null,
  onWhiteboardAnimationComplete
}: EnhancedTeacherSceneProps) {
  return (
    <Canvas
      shadows={enableShadows}
      style={{
        width: '100%',
        height: '100%',
        background: backgroundColor,
      }}
    >
      {/* Camera */}
      <PerspectiveCamera makeDefault position={cameraPosition} fov={cameraFov} />

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow={enableShadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />
      <spotLight
        position={[0, 5, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow={enableShadows}
      />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Classroom Environment */}
      <Classroom type={classroomType} />

      {/* Whiteboard (if enabled) */}
      {showWhiteboard && (
        <Whiteboard
          position={[2, 1.5, -2]}
          rotation={[0, -0.3, 0]}
          width={2.5}
          height={1.8}
          showMathProblem={whiteboardProblem}
          onAnimationComplete={onWhiteboardAnimationComplete}
        />
      )}

      {/* Teacher Model */}
      {children}

      {/* Controls - Allow user to rotate/zoom */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0, 0]}
      />
    </Canvas>
  )
}
