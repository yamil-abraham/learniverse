// @ts-nocheck
/**
 * Teacher3D Component
 * 3D teacher model with animations and lip-sync
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import type { Teacher3DProps } from './types'
import { VISEME_MAPPING } from './types'

export function Teacher3D({
  modelPath,
  position = [0, -1.5, 0],
  scale = 1,
  animation = 'Idle',
  expression = 'default',
  isAnimated = true,
  lipsyncData = null,
  onLoadComplete,
  onAnimationComplete,
}: Teacher3DProps) {
  const group = useRef<THREE.Group>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load GLTF model
  const { scene } = useGLTF(modelPath) as any

  // Load animations from separate file
  const animationPath = modelPath.includes('teacher1')
    ? '/animations/animations_Nanami.glb'
    : '/animations/animations_Naoki.glb'

  const { animations } = useGLTF(animationPath) as any

  // Setup animations
  const { actions, mixer } = useAnimations(animations, group)

  // Lip-sync state
  const [currentViseme, setCurrentViseme] = useState<string>('X')
  const audioStartTimeRef = useRef<number>(0)
  const isPlayingRef = useRef<boolean>(false)

  // Load complete callback
  useEffect(() => {
    if (scene && !isLoaded) {
      setIsLoaded(true)

      // Debug: Check for morph targets
      scene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.morphTargetDictionary) {
          console.log('Morph targets found:', Object.keys(child.morphTargetDictionary))
        }
      })

      if (onLoadComplete) {
        onLoadComplete()
      }
    }
  }, [scene, isLoaded, onLoadComplete])

  // Play animation
  useEffect(() => {
    if (!actions || !isAnimated) return

    // Stop all animations
    Object.values(actions).forEach((action) => {
      action?.stop()
    })

    // Play current animation
    const currentAction = actions[animation]
    if (currentAction) {
      currentAction.reset()
      currentAction.fadeIn(0.5)
      currentAction.play()

      // Handle animation complete
      if (onAnimationComplete) {
        mixer.addEventListener('finished', onAnimationComplete)
      }
    } else {
      // Try to find a fallback animation
      const availableAnimations = Object.keys(actions)
      console.log(`Available animations:`, availableAnimations)

      // Try common fallback animations
      const fallbacks = ['idle', 'Idle', 'T-Pose', 'TPose', 'Default']
      const fallbackAnimation = fallbacks.find(name => actions[name])

      if (fallbackAnimation) {
        const fallbackAction = actions[fallbackAnimation]
        if (fallbackAction) {
          console.log(`Using fallback animation: ${fallbackAnimation}`)
          fallbackAction.reset()
          fallbackAction.fadeIn(0.5)
          fallbackAction.play()
        }
      } else if (availableAnimations.length > 0) {
        // Use the first available animation as ultimate fallback
        const firstAnimation = actions[availableAnimations[0]]
        if (firstAnimation) {
          console.log(`Using first available animation: ${availableAnimations[0]}`)
          firstAnimation.reset()
          firstAnimation.fadeIn(0.5)
          firstAnimation.play()
        }
      }
    }

    return () => {
      if (onAnimationComplete) {
        mixer.removeEventListener('finished', onAnimationComplete)
      }
    }
  }, [animation, actions, mixer, isAnimated, onAnimationComplete])

  // Lip-sync
  useEffect(() => {
    if (lipsyncData) {
      // Start lip-sync playback
      audioStartTimeRef.current = Date.now()
      isPlayingRef.current = true

      return () => {
        isPlayingRef.current = false
        setCurrentViseme('X') // Reset to silence
      }
    } else {
      isPlayingRef.current = false
      setCurrentViseme('X')
    }
  }, [lipsyncData])

  // Update lip-sync on each frame
  useFrame(() => {
    if (!isPlayingRef.current || !lipsyncData || !group.current) return

    const elapsedTime = (Date.now() - audioStartTimeRef.current) / 1000 // Convert to seconds

    // Find current mouth cue
    const currentCue = lipsyncData.mouthCues.find(
      (cue) => elapsedTime >= cue.start && elapsedTime <= cue.end
    )

    if (currentCue) {
      setCurrentViseme(currentCue.value)
    } else if (elapsedTime > lipsyncData.metadata.duration) {
      // Lip-sync finished
      isPlayingRef.current = false
      setCurrentViseme('X')
    }
  })

  // Apply viseme to morph targets
  useEffect(() => {
    if (!group.current) return

    // Find mesh with morph targets
    group.current.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && child.morphTargetDictionary && child.morphTargetInfluences) {
        const morphTargetName = VISEME_MAPPING[currentViseme] || 'viseme_PP'
        const morphIndex = child.morphTargetDictionary[morphTargetName]

        if (morphIndex !== undefined && child.morphTargetInfluences) {
          // Smoothly transition to target viseme
          child.morphTargetInfluences.forEach((_, index) => {
            if (child.morphTargetInfluences && index === morphIndex) {
              child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
                child.morphTargetInfluences[index],
                1,
                0.3
              )
            } else if (child.morphTargetInfluences) {
              child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
                child.morphTargetInfluences[index],
                0,
                0.3
              )
            }
          })
        }
      }
    })
  }, [currentViseme])

  // Apply expression (if the model supports it)
  useEffect(() => {
    if (!group.current) return

    group.current.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && child.morphTargetDictionary && child.morphTargetInfluences) {
        // Map expressions to morph targets (customize based on your model)
        const expressionMap: Record<string, string> = {
          smile: 'smile',
          sad: 'sad',
          surprised: 'surprised',
          thinking: 'thinking',
          happy: 'happy',
          default: 'neutral',
        }

        const expressionMorph = expressionMap[expression] || 'neutral'
        const expressionIndex = child.morphTargetDictionary[expressionMorph]

        if (expressionIndex !== undefined && child.morphTargetInfluences) {
          // Smoothly transition to expression
          child.morphTargetInfluences[expressionIndex] = THREE.MathUtils.lerp(
            child.morphTargetInfluences[expressionIndex],
            0.8,
            0.1
          )
        }
      }
    })
  }, [expression])

  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={scene} />
    </group>
  )
}

// Preload models and animations
useGLTF.preload('/models/teachers/teacher1.glb')
useGLTF.preload('/models/teachers/teacher2.glb')
useGLTF.preload('/animations/animations_Nanami.glb')
useGLTF.preload('/animations/animations_Naoki.glb')
