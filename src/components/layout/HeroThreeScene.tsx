'use client';

import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, Environment, ContactShadows, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

function PortraitModel({ bass = 0, treble = 0 }) {
  // Using the model you pointed to
  const { scene } = useGLTF('/portrait.glb');
  const groupRef = useRef<THREE.Group>(null);

  // Clone scene to avoid shared state if used multiple times
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = state.clock.getElapsedTime();
    
    // Audio-reactive scaling and floating
    // Bass drives the overall "thump" or scale
    const scale = 1 + bass * 0.15;
    groupRef.current.scale.set(scale, scale, scale);
    
    // Treble drives micro-movements/shiver
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.1 + (bass * 0.05);
    groupRef.current.rotation.y += 0.005 + (treble * 0.02);
  });

  return (
    <primitive 
      ref={groupRef} 
      object={clonedScene} 
      position={[0, -1, 0]} 
      scale={1}
    />
  );
}

interface HeroThreeSceneProps {
    bass?: number;
    treble?: number;
}

export default function HeroThreeScene({ bass = 0, treble = 0 }: HeroThreeSceneProps) {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none lg:pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#E9FF13" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />
        
        <Suspense fallback={null}>
          <PresentationControls
            global
            snap
            rotation={[0, 0.3, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
          >
            <Float
              speed={2} 
              rotationIntensity={0.5} 
              floatIntensity={0.5}
            >
              <PortraitModel bass={bass} treble={treble} />
            </Float>
          </PresentationControls>
          
          <ContactShadows 
            position={[0, -1.5, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2.5} 
            far={2} 
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload the model
useGLTF.preload('/portrait.glb');
