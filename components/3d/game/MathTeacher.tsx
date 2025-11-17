/**
 * MathTeacher Component
 * Adapted from r3f-ai-language-teacher/src/components/Teacher.jsx
 *
 * 3D animated teacher with lip-sync for math explanations
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useTeacherStore } from '@/stores/teacherStore'
import type { TeacherType } from '@/stores/teacherStore'
import { rhubarbToAzureVisemes } from '@/lib/speech/viseme-mapping'

// Helper function for random int
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const ANIMATION_FADE_TIME = 0.5

interface MathTeacherProps {
  teacher?: TeacherType
  [key: string]: any // For spreading props like position, rotation, scale
}

export function MathTeacher({ teacher = 'Valentina', ...props }: MathTeacherProps) {
  const group = useRef<THREE.Group>(null!)

  // Load teacher model
  const { scene } = useGLTF(`/models/teachers/teacher${teacher === 'Valentina' ? '1' : '2'}.glb`)

  // Fix materials (copied from reference Teacher.jsx)
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.material) {
        child.material = new THREE.MeshStandardMaterial({
          map: child.material.map,
        })
      }
    })
  }, [scene])

  // Get current message and loading state from store
  const currentMessage = useTeacherStore((state) => state.currentMessage)
  const loading = useTeacherStore((state) => state.loading)

  // Load animations from separate GLB file
  const { animations } = useGLTF(
    `/animations/animations_${teacher}.glb`
  )
  const { actions, mixer } = useAnimations(animations, group)
  const [animation, setAnimation] = useState('Idle')

  // Blinking system (copied from reference Teacher.jsx lines 34-50)
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true)
        setTimeout(() => {
          setBlink(false)
          nextBlink()
        }, 100) // Blink duration
      }, randInt(1000, 5000)) // Random interval between blinks
    }
    nextBlink()
    return () => clearTimeout(blinkTimeout)
  }, [])

  // Animation state management (copied from reference Teacher.jsx lines 52-60)
  useEffect(() => {
    if (loading) {
      setAnimation('Thinking')
    } else if (currentMessage) {
      // Randomly alternate between Talking and Talking2
      setAnimation(randInt(0, 1) ? 'Talking' : 'Talking2')
    } else {
      setAnimation('Idle')
    }
  }, [currentMessage, loading])

  // Lerp morph target helper (copied from reference Teacher.jsx lines 106-123)
  const lerpMorphTarget = (target: string | number, value: number, speed: number = 0.1) => {
    scene.traverse((child: any) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = typeof target === 'string'
          ? child.morphTargetDictionary[target]
          : target

        if (
          index === undefined ||
          child.morphTargetInfluences[index] === undefined
        ) {
          return
        }

        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        )
      }
    })
  }

  // Real-time animation in useFrame (copied from reference Teacher.jsx lines 62-94)
  useFrame(() => {
    // 1. Base smile
    lerpMorphTarget('mouthSmile', 0.2, 0.5)

    // 2. Blinking
    lerpMorphTarget('eye_close', blink ? 1 : 0, 0.5)

    // 3. Reset all viseme morph targets (Azure visemes 0-21)
    for (let i = 0; i <= 21; i++) {
      lerpMorphTarget(i, 0, 0.1)
    }

    // 4. Apply current viseme based on audio time (lip-sync)
    if (
      currentMessage &&
      currentMessage.lipsync &&
      currentMessage.audioPlayer
    ) {
      // Convert Rhubarb visemes to Azure format
      const azureVisemes = rhubarbToAzureVisemes(currentMessage.lipsync.mouthCues)

      // Find current viseme based on audio time
      const currentTime = currentMessage.audioPlayer.currentTime * 1000 // Convert to ms

      for (let i = azureVisemes.length - 1; i >= 0; i--) {
        const viseme = azureVisemes[i]
        if (currentTime >= viseme[0]) {
          lerpMorphTarget(viseme[1], 1, 0.2) // Apply viseme
          break
        }
      }

      // 5. Switch between Talking/Talking2 animations to avoid stiffness
      if (
        actions[animation] &&
        actions[animation].time > actions[animation].getClip().duration - ANIMATION_FADE_TIME
      ) {
        setAnimation((prevAnimation) =>
          prevAnimation === 'Talking' ? 'Talking2' : 'Talking'
        )
      }
    }
  })

  // Animation playback (copied from reference Teacher.jsx lines 96-104)
  useEffect(() => {
    if (actions[animation]) {
      actions[animation]
        ?.reset()
        .fadeIn(mixer.time > 0 ? ANIMATION_FADE_TIME : 0)
        .play()
    }
    return () => {
      if (actions[animation]) {
        actions[animation]?.fadeOut(ANIMATION_FADE_TIME)
      }
    }
  }, [animation, actions, mixer])

  // Thinking indicator (copied from reference Teacher.jsx lines 125-154)
  const [thinkingText, setThinkingText] = useState('.')

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setThinkingText((prevText) => {
          if (prevText.length === 3) {
            return '.'
          }
          return prevText + '.'
        })
      }, 500)
      return () => clearInterval(interval)
    }
  }, [loading])

  return (
    <group {...props} dispose={null} ref={group}>
      {loading && (
        <Html position-y={teacher === 'Valentina' ? 1.6 : 1.8}>
          <div className="flex justify-center items-center -translate-x-1/2">
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex items-center justify-center duration-75 rounded-full h-8 w-8 bg-white/80">
                {thinkingText}
              </span>
            </span>
          </div>
        </Html>
      )}
      <primitive object={scene} />
    </group>
  )
}

// Preload models for both teachers
useGLTF.preload('/models/teachers/teacher1.glb')
useGLTF.preload('/models/teachers/teacher2.glb')
useGLTF.preload('/animations/animations_Valentina.glb')
useGLTF.preload('/animations/animations_Mateo.glb')
