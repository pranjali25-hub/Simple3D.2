import React, { useRef, useEffect, useMemo } from 'react';
import { OrbitControls, Grid, Environment, Lightformer, ContactShadows, Backdrop } from '@react-three/drei';
import { EffectComposer, SSAO, Bloom, BrightnessContrast, HueSaturation } from '@react-three/postprocessing';
import { useThree, useFrame } from '@react-three/fiber';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { captureCanvas } from '../utils/exporter';
import PrimitiveMesh from './PrimitiveMesh';
import CSGMesh from './CSGMesh';
import PathTracerOverlay from './PathTracerOverlay';

// Initialize RectAreaLight uniforms for accurate rectangular specular highlights
RectAreaLightUniformsLib.init();

function StudioEnvironment({ rig }) {
  // Use frames={1} to prevent constant PMREM regeneration overhead, but tie a key to the rig
  // so it regenerates when the user tweaks the studio rig sliders.
  // Trade-off: Real-time dragging of light sliders might cause slight stutter as PMREM rebuilds,
  // but guarantees reflection accuracy.
  const rigKey = `${rig.keyLightIntensity}-${rig.edgeLightIntensity}-${rig.fillLightIntensity}`;
  
  return (
    <Environment resolution={512} frames={1} key={rigKey}>
      <group rotation={[0, 0, 0]}>
        {/* PRIMARY KEY LIGHT: Very large rectangular softbox, top/side */}
        <Lightformer 
          form="rect" 
          intensity={rig.keyLightIntensity} 
          color="#ffffff" 
          position={[-5, 6, -5]} 
          scale={[20, 15, 1]}
          target={[0, 0, 0]}
        />

        {/* SECONDARY EDGE LIGHT: Tall, narrow softbox on the right side */}
        <Lightformer 
          form="rect" 
          intensity={rig.edgeLightIntensity} 
          color="#ffffff" 
          position={[8, 2, -2]} 
          scale={[4, 20, 1]} 
          target={[0, 0, 0]}
        />

        {/* FILL LIGHT: Weak, broad fill from the front/left */}
        <Lightformer 
          form="rect" 
          intensity={rig.fillLightIntensity} 
          color="#e2e8f0" 
          position={[-8, 0, 8]} 
          scale={[15, 15, 1]} 
          target={[0, 0, 0]}
        />

        {/* NEGATIVE FILL / BLACK FLAGS */}
        <Lightformer 
          form="rect" 
          intensity={0} 
          color="#000000" 
          position={[0, 8, 8]} 
          scale={[30, 10, 1]} 
          target={[0, 0, 0]}
        />
        <Lightformer 
          form="rect" 
          intensity={0} 
          color="#000000" 
          position={[10, 0, 5]} 
          scale={[10, 20, 1]} 
          target={[0, 0, 0]}
        />
      </group>
    </Environment>
  );
}

// Custom hook to sync exposure
function CameraExposure({ exposure }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMappingExposure = exposure;
  }, [exposure, gl]);
  return null;
}

// Option A: Unlit screen-space gradient assigned directly to scene.background
function BackgroundGradient({ topColor, bottomColor }) {
  const { scene } = useThree();
  
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
    
    return () => {
      texture.dispose();
    };
  }, [scene, topColor, bottomColor]);
  
  return null;
}

export default function Scene() {
  const objects = useStore((state) => state.objects);
  const presentationSettings = useStore((state) => state.presentationSettings);
  const orbitControlsRef = useRef();

  const { studioRig, exposure, contrast, saturation, bgGradientTop, bgGradientBottom } = presentationSettings;

  const { gl } = useThree();

  // Forcefully unlock camera controls when nothing is selected
  const selectedObjectIds = useStore((state) => state.uiState.selectedObjectIds);
  useEffect(() => {
    if (orbitControlsRef.current && selectedObjectIds.length === 0) {
      orbitControlsRef.current.enabled = true;
    }
  }, [selectedObjectIds]);

  return (
    <>
      {/* Set dynamic camera exposure */}
      <CameraExposure exposure={exposure} />

      {/* Purely cosmetic, unlit 2D gradient background */}
      <BackgroundGradient topColor={bgGradientTop} bottomColor={bgGradientBottom} />

      {/* Very subtle ambient base to prevent fully black shadows */}
      <ambientLight intensity={0.1} />
      
      {/* DIRECT LIGHTS matching Lightformers */}
      
      {/* 1. Key RectAreaLight for elongated speculars without sharp point hotspots */}
      <rectAreaLight 
        position={[-5, 6, -5]} 
        width={20} 
        height={15} 
        intensity={studioRig.keyLightIntensity * 0.5} 
        color="#ffffff" 
        lookAt={[0,0,0]}
      />
      {/* Trade-off: RectAreaLights don't cast shadows in standard WebGL. 
          We supplement with a soft directional light purely for the cast shadow. */}
      <directionalLight 
        position={[-5, 8, -3]} 
        intensity={0.5} 
        castShadow 
        shadow-mapSize={[4096, 4096]} 
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0003}
      />

      {/* 2. Edge RectAreaLight */}
      <rectAreaLight 
        position={[8, 2, -2]} 
        width={4} 
        height={20} 
        intensity={studioRig.edgeLightIntensity * 0.5} 
        color="#ffffff" 
        lookAt={[0,0,0]}
      />

      {/* WEAK FILL — Prevents shadow side from clipping */}
      <directionalLight position={[5, 4, 5]} intensity={studioRig.fillLightIntensity * 0.2} color="#ffffff" />

      {/* Procedural Studio Environment Lighting (Dynamic PMREM) */}
      <StudioEnvironment rig={studioRig} />

      {/* Soft Shadow Catcher Floor — completely diffuse, no reflections */}
      <mesh 
        position={[0, -0.75, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          useStore.getState().selectObject(null);
        }}
        onPointerMissed={() => useStore.getState().selectObject(null)}
      >
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.4} />
      </mesh>

      {presentationSettings.showGrid && (
        <Grid 
          position={[0, -0.74, 0]} 
          args={[30, 30]} 
          cellSize={0.5} 
          cellThickness={0.8} 
          cellColor="#555555" 
          sectionSize={2.5} 
          sectionThickness={1.2} 
          sectionColor="#888888" 
          fadeDistance={30}
          infiniteGrid
        />
      )}

      {/* Contact Shadows — Soft ground-contact darkening */}
      <ContactShadows
        position={[0, -0.745, 0]}
        opacity={0.7}
        scale={20}
        blur={2.5}
        far={3}
        resolution={512}
      />

      {Object.values(objects).map((obj) => {
        if (obj.type === 'primitive') {
          return <PrimitiveMesh key={obj.id} object={obj} />;
        } else if (obj.type === 'csg') {
          return <CSGMesh key={obj.id} object={obj} />;
        }
        return null;
      })}

      <OrbitControls 
        ref={orbitControlsRef} 
        makeDefault 
        autoRotate={presentationSettings.autoRotate}
        autoRotateSpeed={1.5}
      />

      {/* Progressive Path Tracing Overlay */}
      {presentationSettings.pathTracing && (
        <PathTracerOverlay enabled={presentationSettings.pathTracing} />
      )}

      {/* Post Processing Stack */}
      {!presentationSettings.pathTracing && (
        <EffectComposer disableNormalPass={false}>
          {/* Contact-shadow strength SSAO */}
          <SSAO 
            samples={21} 
            radius={0.25} 
            intensity={10} 
            luminanceInfluence={0.2} 
            color="black" 
          />
          {/* Restrained Bloom for highlight clipping */}
          <Bloom
            intensity={0.05}
            luminanceThreshold={0.95}
            luminanceSmoothing={0.4}
            mipmapBlur
          />
          {/* Color Grade */}
          <BrightnessContrast brightness={exposure - 1} contrast={contrast - 1} />
          <HueSaturation saturation={saturation - 1} hue={0} />
        </EffectComposer>
      )}
    </>
  );
}
