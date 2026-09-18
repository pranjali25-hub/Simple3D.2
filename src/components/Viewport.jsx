import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Scene from '../canvas/Scene';
import { useStore } from '../store/useStore';

export default function Viewport() {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [3, 3, 5], fov: 35 }}
        onPointerMissed={() => useStore.getState().selectObject(null)}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
