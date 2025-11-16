// @ts-nocheck
/**
 * Math Visualizer Component
 * Displays math problems on whiteboard with animated solutions
 */

'use client'

import { useRef, useState, useEffect } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { MathOperationType } from '@/lib/whiteboard/math-animator'

export interface MathVisualizerProps {
  position?: [number, number, number]
  operation: MathOperationType
  operand1: number
  operand2: number
  showSteps?: boolean
  fontSize?: number
  color?: string
}

export function MathVisualizer({
  position = [0, 0, 0],
  operation,
  operand1,
  operand2,
  showSteps = false,
  fontSize = 0.3,
  color = '#000000'
}: MathVisualizerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [result, setResult] = useState<number>(0)
  const [operationSymbol, setOperationSymbol] = useState<string>('+')

  useEffect(() => {
    let calculatedResult = 0
    let symbol = '+'

    switch (operation) {
      case 'addition':
        calculatedResult = operand1 + operand2
        symbol = '+'
        break
      case 'subtraction':
        calculatedResult = operand1 - operand2
        symbol = '-'
        break
      case 'multiplication':
        calculatedResult = operand1 * operand2
        symbol = '×'
        break
      case 'division':
        calculatedResult = Math.floor(operand1 / operand2)
        symbol = '÷'
        break
      case 'fractions':
        calculatedResult = operand1 / operand2
        symbol = '/'
        break
      default:
        calculatedResult = 0
        symbol = '?'
    }

    setResult(calculatedResult)
    setOperationSymbol(symbol)
  }, [operation, operand1, operand2])

  const problemText = operation === 'fractions'
    ? `${operand1}/${operand2}`
    : `${operand1} ${operationSymbol} ${operand2}`

  const resultText = operation === 'fractions'
    ? result.toFixed(2)
    : result.toString()

  return (
    <group ref={groupRef} position={position}>
      {/* Problem statement */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.ttf"
      >
        {problemText}
      </Text>

      {/* Equals sign */}
      <Text
        position={[0, 0.1, 0]}
        fontSize={fontSize * 0.8}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        =
      </Text>

      {/* Result */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={fontSize * 1.2}
        color="#00AA00"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.ttf"
      >
        {resultText}
      </Text>

      {/* Steps (if enabled) */}
      {showSteps && (
        <group position={[0, -0.8, 0]}>
          {operation === 'addition' && (
            <>
              <Text
                position={[0, 0, 0]}
                fontSize={fontSize * 0.5}
                color="#666666"
                anchorX="center"
                anchorY="middle"
              >
                Paso 1: Suma los números
              </Text>
              <Text
                position={[0, -0.2, 0]}
                fontSize={fontSize * 0.5}
                color="#666666"
                anchorX="center"
                anchorY="middle"
              >
                {operand1} + {operand2} = {result}
              </Text>
            </>
          )}

          {operation === 'multiplication' && (
            <>
              <Text
                position={[0, 0, 0]}
                fontSize={fontSize * 0.5}
                color="#666666"
                anchorX="center"
                anchorY="middle"
              >
                Multiplica {operand1} grupos de {operand2}
              </Text>
              <Text
                position={[0, -0.2, 0]}
                fontSize={fontSize * 0.5}
                color="#666666"
                anchorX="center"
                anchorY="middle"
              >
                {operand1} × {operand2} = {result}
              </Text>
            </>
          )}

          {operation === 'division' && (
            <>
              <Text
                position={[0, 0, 0]}
                fontSize={fontSize * 0.5}
                color="#666666"
                anchorX="center"
                anchorY="middle"
              >
                Divide {operand1} en grupos de {operand2}
              </Text>
              <Text
                position={[0, -0.2, 0]}
                fontSize={fontSize * 0.5}
                color="#666666"
                anchorX="center"
                anchorY="middle"
              >
                {operand1} ÷ {operand2} = {result}
              </Text>
            </>
          )}
        </group>
      )}
    </group>
  )
}

export default MathVisualizer
