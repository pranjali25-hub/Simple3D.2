import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { useStore } from '../store/useStore';

import { TransformControls } from '@react-three/drei';
import { createAdvancedBeveledBox } from '../utils/geometryBuilder';

const MATERIAL_PRESETS = {
  polishedMetal: { roughness: 0.15, metalness: 0.5, clearcoat: 1.0, clearcoatRoughness: 0.1 },
  brushedMetal: { roughness: 0.35, metalness: 0.6, clearcoat: 0.3 },
  glossyPlastic: { roughness: 0.05, metalness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.05 },
  matteClay: { roughness: 0.9, metalness: 0.05, clearcoat: 0.0 }
};

function createGeometryForChild(child) {
  if (child.type === 'csg' && child.children) {
    return evaluateCSGGeometry(child.children);
  }

  if (child.primitiveType === 'box') {
    const w = child.parameters?.width || 1.2;
    const h = child.parameters?.height || 1.2;
    const d = child.parameters?.depth || 1.2;

    if (child.parameters?.advancedFillet && child.parameters?.edgeRadii) {
      return createAdvancedBeveledBox(w, h, d, child.parameters.edgeRadii);
    }

    return new THREE.BoxGeometry(w, h, d);
  } else if (child.primitiveType === 'sphere') {
    return new THREE.SphereGeometry(child.parameters?.radius || 0.75, 32, 32);
  } else if (child.primitiveType === 'cylinder') {
    return new THREE.CylinderGeometry(
      child.parameters?.radiusTop || 0.5,
      child.parameters?.radiusBottom || 0.5,
      child.parameters?.height || 1.4,
      32
    );
  } else if (child.primitiveType === 'cone') {
    return new THREE.ConeGeometry(
      child.parameters?.radius || 0.6,
      child.parameters?.height || 1.4,
      32
    );
  } else if (child.primitiveType === 'torus') {
    return new THREE.TorusGeometry(
      child.parameters?.radius || 0.6,
      child.parameters?.tube || 0.25,
      16,
      32
    );
  } else if (child.primitiveType === 'icosahedron') {
    return new THREE.IcosahedronGeometry(
      child.parameters?.radius || 0.75,
      Math.floor(child.parameters?.detail || 0)
    );
  }

  return new THREE.BoxGeometry(1, 1, 1);
}

function evaluateCSGGeometry(children) {
  if (!children || children.length === 0) return null;

  try {
    const evaluator = new Evaluator();
    evaluator.useGroups = false;

    const brushes = children.map(child => {
      const geo = createGeometryForChild(child);
      if (geo.computeBoundsTree) geo.computeBoundsTree();
      const brush = new Brush(geo);

      brush.position.set(...(child.position || [0, 0, 0]));
      brush.rotation.set(...(child.rotation || [0, 0, 0]));
      brush.scale.set(...(child.scale || [1, 1, 1]));
      brush.updateMatrixWorld();

      return {
        brush,
        booleanMode: child.booleanMode || 'solid'
      };
    }).filter(b => b.brush && b.brush.geometry);

    if (brushes.length === 0) return null;

    let resultBrush = brushes[0].brush;

    for (let i = 1; i < brushes.length; i++) {
      const { brush, booleanMode } = brushes[i];
      if (booleanMode === 'hole') {
        resultBrush = evaluator.evaluate(resultBrush, brush, SUBTRACTION);
      } else {
        resultBrush = evaluator.evaluate(resultBrush, brush, ADDITION);
      }
    }

    return resultBrush.geometry;
  } catch (e) {
    console.error("CSG evaluation error:", e);
    return null;
  }
}

export default function CSGMesh({ object }) {
  const [mesh, setMesh] = React.useState(null);
  const selectObject = useStore((state) => state.selectObject);
  const selectedObjectIds = useStore((state) => state.uiState.selectedObjectIds);
  const activeTool = useStore((state) => state.uiState.activeTool);

  const isSelected = selectedObjectIds.includes(object.id);
  const isPrimarySelection = selectedObjectIds[selectedObjectIds.length - 1] === object.id;

  const handleClick = (e) => {
    e.stopPropagation();
    selectObject(object.id, e.shiftKey);
  };

  const geometry = React.useMemo(() => {
    return evaluateCSGGeometry(object.children);
  }, [JSON.stringify(object.children)]);

  if (!geometry) return null;

  const matParams = object.materialParams || {
    color: '#e2e8f0',
    metalness: 1.0,
    roughness: 0.33,
    clearcoat: 0.0,
    transmission: 0.0,
    ior: 1.5,
  };

  const renderMaterial = () => (
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
      side={THREE.DoubleSide} 
    />
  );

  const updateObjectTransform = useStore((state) => state.updateObjectTransform);

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
        <group ref={setMesh} position={object.position} rotation={object.rotation} scale={object.scale}>
          <group onClick={handleClick}>
            <mesh geometry={geometry} castShadow receiveShadow>
              {renderMaterial()}
            </mesh>
          </group>
        </group>
      </>
    );
  }

  return (
    <group ref={setMesh} position={object.position} rotation={object.rotation} scale={object.scale}>
      <group onClick={handleClick}>
        <mesh geometry={geometry} castShadow receiveShadow>
          {renderMaterial()}
        </mesh>
      </group>
    </group>
  );
}
