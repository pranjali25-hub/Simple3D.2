import React, { useRef, useMemo } from 'react';
import { RoundedBox, TransformControls } from '@react-three/drei';
import { useStore } from '../store/useStore';
import { createAdvancedBeveledBox } from '../utils/geometryBuilder';
import { getProceduralTextures } from '../utils/textureGenerator';

export default function PrimitiveMesh({ object }) {
  const [mesh, setMesh] = React.useState(null);
  const selectObject = useStore((state) => state.selectObject);
  const selectedObjectIds = useStore((state) => state.uiState.selectedObjectIds);
  const activeTool = useStore((state) => state.uiState.activeTool);

  const isSelected = selectedObjectIds.includes(object.id);
  const isHole = object.booleanMode === 'hole';

  // Get procedural textures (cached singleton)
  const textures = useMemo(() => getProceduralTextures(), []);

  const handleClick = (e) => {
    e.stopPropagation();
    selectObject(object.id, e.shiftKey);
  };

  const { position, rotation, scale, parameters, primitiveType, materialParams } = object;

  // Fallback if migrating old objects
  const matParams = materialParams || {
    color: '#e2e8f0',
    metalness: 1.0,
    roughness: 0.33,
    clearcoat: 0.0,
    transmission: 0.0,
    ior: 1.5,
  };

  const safeEdgeRadii = parameters.edgeRadii || {};

  const advancedGeom = React.useMemo(() => {
    if (primitiveType !== 'box' || !parameters.advancedFillet) return null;
    try {
      return createAdvancedBeveledBox(
        parameters.width || 1.2, 
        parameters.height || 1.2, 
        parameters.depth || 1.2, 
        safeEdgeRadii
      );
    } catch (e) {
      console.error("Advanced Geometry Error:", e);
      return null;
    }
  }, [primitiveType, parameters.advancedFillet, parameters.width, parameters.height, parameters.depth, JSON.stringify(safeEdgeRadii)]);

  const renderMaterial = () => {
    if (isHole) {
      return (
        <meshPhysicalMaterial
          color="#ef4444"
          roughness={0.5}
          metalness={0}
          transparent
          opacity={0.3}
          wireframe
          depthWrite={false}
        />
      );
    }

    // Apply procedural roughness maps for metallic grain effect when metalness is high
    const extraProps = {};
    if (matParams.metalness > 0.5 && textures.microNormal) {
      extraProps.normalMap = textures.microNormal;
      extraProps.normalScale = [0.05, 0.05]; // Extremely subtle microtexture
    }

    return (
      <meshPhysicalMaterial
        color={matParams.color}
        metalness={matParams.metalness}
        roughness={matParams.roughness}
        clearcoat={matParams.clearcoat}
        transmission={matParams.transmission}
        ior={matParams.ior}
        thickness={matParams.transmission > 0 ? 0.5 : 0}
        transparent={matParams.transmission > 0}
        envMapIntensity={1.2}
        {...extraProps}
      />
    );
  };

  const renderGeometry = () => {
    if (primitiveType === 'box') {
      if (parameters.advancedFillet && advancedGeom) {
        return (
          <mesh geometry={advancedGeom} castShadow receiveShadow>
            {renderMaterial()}
          </mesh>
        );
      }

      const w = parameters.width || 1.2;
      const h = parameters.height || 1.2;
      const d = parameters.depth || 1.2;
      const maxRadius = Math.min(w, h, d) / 2;
      const safeRadius = Math.max(0, Math.min(parameters.filletRadius ?? 0.1, maxRadius - 0.001));

      if (safeRadius <= 0.005) {
        return (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            {renderMaterial()}
          </mesh>
        );
      }

      return (
        <RoundedBox
          ref={(node) => {
            if (node) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          }}
          args={[w, h, d]}
          radius={safeRadius}
          smoothness={8}
          castShadow
          receiveShadow
        >
          {renderMaterial()}
        </RoundedBox>
      );
    }
    if (primitiveType === 'sphere') {
      return (
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[parameters.radius || 0.75, 128, 128]} />
          {renderMaterial()}
        </mesh>
      );
    }
    if (primitiveType === 'cylinder') {
      return (
        <mesh castShadow receiveShadow>
          <cylinderGeometry 
            args={[parameters.radiusTop || 0.5, parameters.radiusBottom || 0.5, parameters.height || 1.4, 64]} 
          />
          {renderMaterial()}
        </mesh>
      );
    }
    if (primitiveType === 'cone') {
      return (
        <mesh castShadow receiveShadow>
          <coneGeometry 
            args={[parameters.radius || 0.6, parameters.height || 1.4, 64]} 
          />
          {renderMaterial()}
        </mesh>
      );
    }
    if (primitiveType === 'torus') {
      return (
        <mesh castShadow receiveShadow>
          <torusGeometry 
            args={[parameters.radius || 0.6, parameters.tube || 0.25, 32, 64]} 
          />
          {renderMaterial()}
        </mesh>
      );
    }
    if (primitiveType === 'icosahedron') {
      return (
        <mesh castShadow receiveShadow>
          <icosahedronGeometry 
            args={[parameters.radius || 0.75, Math.floor(parameters.detail || 0)]} 
          />
          {renderMaterial()}
        </mesh>
      );
    }
    return null;
  };

  const updateObjectTransform = useStore((state) => state.updateObjectTransform);

  const isPrimarySelection = selectedObjectIds[selectedObjectIds.length - 1] === object.id;

  const handleTransformChange = React.useCallback(() => {
    if (mesh) {
      const p = mesh.position;
      const r = mesh.rotation;
      const s = mesh.scale;
      updateObjectTransform(object.id, {
        position: [p.x, p.y, p.z],
        rotation: [r.x, r.y, r.z],
        scale: [s.x, s.y, s.z],
      });
    }
  }, [mesh, object.id, updateObjectTransform]);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && isPrimarySelection) {
        useStore.getState().selectObject(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPrimarySelection]);

  if (isPrimarySelection) {
    return (
      <>
        {mesh && (
          <TransformControls
            object={mesh}
            mode={activeTool}
            size={0.8}
            onObjectChange={handleTransformChange}
          />
        )}
        <group ref={setMesh} position={position} rotation={rotation} scale={scale}>
          <group onClick={handleClick}>
            {renderGeometry()}
          </group>
        </group>
      </>
    );
  }

  return (
    <group ref={setMesh} position={position} rotation={rotation} scale={scale}>
      <group onClick={handleClick}>
        {renderGeometry()}
      </group>
    </group>
  );
}
