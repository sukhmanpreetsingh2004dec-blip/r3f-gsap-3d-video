import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshWobbleMaterial, Text, PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface Scene3DProps {
  masterTimeline: React.MutableRefObject<gsap.core.Timeline | null>;
  cameraMode: 'cinematic' | 'orbit' | 'front';
}

function AnimatedObjects({ masterTimeline }: { masterTimeline: React.MutableRefObject<gsap.core.Timeline | null> }) {
  const cubeRef = useRef<THREE.Mesh>(null!);
  const octahedronRef = useRef<THREE.Mesh>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const textGroupRef = useRef<THREE.Group>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  useEffect(() => {
    if (!masterTimeline.current) return;
    const tl = masterTimeline.current;

    // Reset timeline entries for 3D elements
    tl.clear();

    // Scene animation sequence (0s to 10s @ 30 FPS)
    // 0s - 3s: Intro Assemblage & Ignition
    tl.fromTo(
      cubeRef.current.scale,
      { x: 0, y: 0, z: 0 },
      { x: 1.5, y: 1.5, z: 1.5, duration: 2, ease: 'back.out(1.7)' },
      0
    )
    .fromTo(
      cubeRef.current.rotation,
      { x: 0, y: 0, z: 0 },
      { x: Math.PI * 2, y: Math.PI * 2, z: Math.PI, duration: 10, ease: 'none' },
      0
    )
    .fromTo(
      octahedronRef.current.position,
      { y: 8, opacity: 0 },
      { y: 0, duration: 2.5, ease: 'bounce.out' },
      0.5
    )
    .fromTo(
      ring1Ref.current.rotation,
      { x: 0, y: 0 },
      { x: Math.PI * 4, y: Math.PI * 2, duration: 10, ease: 'power1.inOut' },
      0
    )
    .fromTo(
      ring2Ref.current.rotation,
      { y: 0, z: 0 },
      { y: -Math.PI * 3, z: Math.PI * 2, duration: 10, ease: 'power1.inOut' },
      0
    )
    .fromTo(
      textGroupRef.current.position,
      { z: -10, opacity: 0 },
      { z: 0, duration: 2, ease: 'expo.out' },
      1.5
    )
    // 3s - 7s: Morph & Lighting Surge
    .to(
      lightRef.current,
      { intensity: 20, distance: 30, duration: 2, yoyo: true, repeat: 1, ease: 'sine.inOut' },
      3
    )
    .to(
      octahedronRef.current.scale,
      { x: 2.2, y: 2.2, z: 2.2, duration: 1.5, yoyo: true, repeat: 1, ease: 'elastic.out(1, 0.5)' },
      4
    )
    // 7s - 10s: Climax Settle & Glow
    .to(
      textGroupRef.current.rotation,
      { y: Math.PI * 0.1, duration: 2, ease: 'power2.out' },
      7
    );

  }, [masterTimeline]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight ref={lightRef} position={[0, 0, 5]} intensity={8} color="#00f0ff" />
      <pointLight position={[-10, -5, -5]} intensity={4} color="#7000ff" />

      {/* Central Glass & Metallic Monolith */}
      <mesh ref={cubeRef} position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <MeshWobbleMaterial
          factor={0.4}
          speed={1.5}
          color="#00f0ff"
          roughness={0.1}
          metalness={0.9}
          wireframe={false}
        />
      </mesh>

      {/* Outer Floating Octahedron Core */}
      <mesh ref={octahedronRef} position={[0, 0, 0]}>
        <octahedronGeometry args={[2.4, 0]} />
        <meshStandardMaterial
          color="#7000ff"
          wireframe={true}
          emissive="#7000ff"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Orbiting Cyber Rings */}
      <mesh ref={ring1Ref} position={[0, 0, 0]}>
        <torusGeometry args={[3.6, 0.04, 16, 100]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.8} />
      </mesh>

      <mesh ref={ring2Ref} position={[0, 0, 0]}>
        <torusGeometry args={[4.5, 0.03, 16, 100]} />
        <meshStandardMaterial color="#ff007a" emissive="#ff007a" emissiveIntensity={0.8} />
      </mesh>

      {/* Floating 3D Kinetic Text */}
      <group ref={textGroupRef} position={[0, -3.2, 0]}>
        <Text
          font="https://fonts.gstatic.com/s/outfit/v11/Q83X2_5n-n9S6xQH-B84.woff"
          fontSize={0.7}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.15}
        >
          REACT THREE FIBER + GSAP
        </Text>
        <Text
          position={[0, -0.6, 0]}
          font="https://fonts.gstatic.com/s/outfit/v11/Q83X2_5n-n9S6xQH-B84.woff"
          fontSize={0.35}
          color="#00f0ff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
        >
          3D ANIMATED VIDEO • 720p @ 30 FPS
        </Text>
      </group>

      {/* Particle Galaxy Background */}
      <Stars radius={50} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />
    </>
  );
}

function CameraRig({ masterTimeline, cameraMode }: { masterTimeline: React.MutableRefObject<gsap.core.Timeline | null>, cameraMode: string }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);

  useEffect(() => {
    if (!masterTimeline.current || cameraMode !== 'cinematic') return;
    const tl = masterTimeline.current;

    // Cinematic Camera Flythrough mapped across 10 seconds
    tl.fromTo(
      cameraRef.current.position,
      { x: 0, y: 5, z: 15 },
      { x: 6, y: 3, z: 9, duration: 4, ease: 'power2.inOut' },
      0
    )
    .to(
      cameraRef.current.position,
      { x: -5, y: -2, z: 7, duration: 3, ease: 'sine.inOut' },
      4
    )
    .to(
      cameraRef.current.position,
      { x: 0, y: 0, z: 10, duration: 3, ease: 'power2.out' },
      7
    );

  }, [masterTimeline, cameraMode]);

  useFrame(() => {
    if (cameraRef.current && cameraMode === 'cinematic') {
      cameraRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={cameraMode === 'front' ? [0, 0, 11] : [0, 5, 12]}
      fov={50}
      aspect={16 / 9}
    />
  );
}

export function Scene3D({ masterTimeline, cameraMode }: Scene3DProps) {
  return (
    <Canvas
      gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
      shadows
      className="canvas-element"
      style={{ background: '#07080d' }}
    >
      <CameraRig masterTimeline={masterTimeline} cameraMode={cameraMode} />
      <AnimatedObjects masterTimeline={masterTimeline} />
    </Canvas>
  );
}
