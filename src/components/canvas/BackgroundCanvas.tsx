import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

function Node({ position, color, speed, size }: { position: [number, number, number]; color: string; speed: number; size: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const orbitRadius = useRef(useMemo(() => Math.random() * Math.PI * 2, []))

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * speed
      meshRef.current.position.x = position[0] + Math.sin(t + orbitRadius.current) * 0.5
      meshRef.current.position.y = position[1] + Math.cos(t * 0.7 + orbitRadius.current) * 0.3
      meshRef.current.position.z = position[2] + Math.sin(t * 0.5 + orbitRadius.current) * 0.2
    }
  })

  return (
    <Float speed={speed * 2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[size, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.15}
          transparent
          opacity={0.6}
        />
      </Sphere>
    </Float>
  )
}

function ConnectionLines() {
  const lineRef = useRef<THREE.LineSegments>(null)
  const positions = useMemo(() => {
    const pts: number[] = []
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        const dist = Math.sqrt(
          Math.pow(Math.sin(i * 0.8) * 3 - Math.sin(j * 0.8) * 3, 2) +
          Math.pow(Math.cos(i * 0.6) * 2 - Math.cos(j * 0.6) * 2, 2)
        )
        if (dist < 4) {
          pts.push(Math.sin(i * 0.8) * 3, Math.cos(i * 0.6) * 2, -2 + i * 0.3)
          pts.push(Math.sin(j * 0.8) * 3, Math.cos(j * 0.6) * 2, -2 + j * 0.3)
        }
      }
    }
    return new Float32Array(pts)
  }, [])

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#A855F7" transparent opacity={0.08} />
    </lineSegments>
  )
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 200

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3
    }
    return arr
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#FF6B35" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

function Scene() {
  const { performanceMode } = useAppStore()
  const nodes = useMemo(() => [
    { position: [-3, 1, -2] as [number, number, number], color: '#A855F7', speed: 0.3, size: 0.15 },
    { position: [2, -1, -3] as [number, number, number], color: '#FF6B35', speed: 0.2, size: 0.12 },
    { position: [0, 2, -4] as [number, number, number], color: '#3B82F6', speed: 0.25, size: 0.1 },
    { position: [-2, -2, -1] as [number, number, number], color: '#8B5CF6', speed: 0.35, size: 0.08 },
    { position: [3, 0, -3] as [number, number, number], color: '#F59E0B', speed: 0.15, size: 0.13 },
    { position: [1, 1, -2] as [number, number, number], color: '#A855F7', speed: 0.28, size: 0.09 },
    { position: [-1, -1, -3] as [number, number, number], color: '#FF6B35', speed: 0.22, size: 0.11 },
    { position: [2, 2, -4] as [number, number, number], color: '#3B82F6', speed: 0.18, size: 0.07 },
  ], [])

  if (performanceMode) return null

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.3} color="#A855F7" />
      <pointLight position={[-10, -10, 5]} intensity={0.2} color="#FF6B35" />
      <ConnectionLines />
      <ParticleField />
      {nodes.map((node, i) => (
        <Node key={i} {...node} />
      ))}
    </>
  )
}

export default function BackgroundCanvas() {
  return (
    <Canvas
      className="fixed inset-0 z-0 pointer-events-none"
      camera={{ position: [0, 0, 5], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Scene />
    </Canvas>
  )
}
