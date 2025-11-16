// @ts-nocheck
/**
 * 3D Whiteboard Component
 * Interactive whiteboard for math visualizations
 */

'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { MathOperationType } from '@/lib/whiteboard/math-animator'
import { generateMathVisualization } from '@/lib/whiteboard/math-animator'
import { clearWhiteboard } from '@/lib/whiteboard/drawing'

export interface WhiteboardProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  showMathProblem?: {
    operation: MathOperationType
    operand1: number
    operand2: number
  } | null
  onAnimationComplete?: () => void
}

export function Whiteboard({
  position = [0, 1.5, -2],
  rotation = [0, 0, 0],
  width = 3,
  height = 2,
  showMathProblem = null,
  onAnimationComplete
}: WhiteboardProps) {
  const whiteboardRef = useRef<THREE.Group>(null)
  const drawingGroupRef = useRef<THREE.Group>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationSteps, setAnimationSteps] = useState<any[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)

  // Generate visualization when math problem changes
  useEffect(() => {
    if (showMathProblem && drawingGroupRef.current) {
      // Clear previous drawings
      clearWhiteboard(
        drawingGroupRef.current.parent as THREE.Scene,
        drawingGroupRef.current
      )

      // Generate new visualization
      const whiteboardPosition = new THREE.Vector3(...position)
      const visualization = generateMathVisualization(
        showMathProblem.operation,
        showMathProblem.operand1,
        showMathProblem.operand2,
        whiteboardPosition
      )

      setAnimationSteps(visualization.steps)
      setCurrentStepIndex(0)
      setIsAnimating(true)
      setElapsedTime(0)
    }
  }, [showMathProblem, position])

  // Animate steps
  useFrame((state, delta) => {
    if (!isAnimating || animationSteps.length === 0) return

    setElapsedTime(prev => prev + delta * 1000)

    if (currentStepIndex < animationSteps.length) {
      const currentStep = animationSteps[currentStepIndex]

      if (elapsedTime >= currentStep.duration) {
        // Execute step
        if (currentStep.type === 'draw' && currentStep.object && drawingGroupRef.current) {
          drawingGroupRef.current.add(currentStep.object)
        }

        // Move to next step
        setCurrentStepIndex(prev => prev + 1)
        setElapsedTime(0)
      }
    } else {
      // Animation complete
      setIsAnimating(false)
      if (onAnimationComplete) {
        onAnimationComplete()
      }
    }
  })

  return (
    <group ref={whiteboardRef} position={position} rotation={rotation}>
      {/* Whiteboard frame */}
      <mesh>
        <boxGeometry args={[width + 0.2, height + 0.2, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Whiteboard surface */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#FFFFFF"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Drawing group */}
      <group ref={drawingGroupRef} position={[0, 0, 0.08]} />

      {/* Title text */}
      <Text
        position={[0, height / 2 + 0.25, 0.08]}
        fontSize={0.15}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        Pizarra Matemática
      </Text>
    </group>
  )
}

export default Whiteboard
