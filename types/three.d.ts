/**
 * Type declarations for React Three Fiber
 * Extends JSX namespace with Three.js elements
 */

import { Object3DNode } from '@react-three/fiber'
import * as THREE from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: Object3DNode<THREE.Group, typeof THREE.Group>
      mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>
      primitive: Object3DNode<THREE.Object3D, typeof THREE.Object3D> & {
        object: THREE.Object3D
      }
      ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>
      directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>
      spotLight: Object3DNode<THREE.SpotLight, typeof THREE.SpotLight>
      perspectiveCamera: Object3DNode<THREE.PerspectiveCamera, typeof THREE.PerspectiveCamera>
    }
  }
}
