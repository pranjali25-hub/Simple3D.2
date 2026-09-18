import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';

// Helper to create the negative space of a fillet (the "cutter")
function createEdgeCutter(length, radius) {
  const shape = new THREE.Shape();
  // Cutter covers the top-right corner of a 2D plane
  shape.moveTo(0, 0);
  shape.lineTo(-radius, 0);
  shape.lineTo(-radius, -radius);
  shape.lineTo(0, -radius);
  shape.lineTo(0, 0);

  // Subtract the fillet circle from the cutter to leave the convex corner
  const hole = new THREE.Path();
  hole.absarc(-radius, -radius, radius, 0, Math.PI * 2, false);
  shape.holes.push(hole);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: length,
    bevelEnabled: false,
    curveSegments: 32
  });
  geom.translate(0, 0, -length / 2);
  return geom;
}

export function createAdvancedBeveledBox(w, h, d, edgeRadii) {
  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  const boxGeo = new THREE.BoxGeometry(w, h, d, 1, 1, 1);
  let mainBrush = new Brush(boxGeo);
  mainBrush.updateMatrixWorld();

  const cuts = [
    // --- Z-axis edges (length = d) ---
    // Top-Right
    { r: edgeRadii.topRight, len: d, pos: [w/2, h/2, 0], rot: [0, 0, 0] },
    // Top-Left
    { r: edgeRadii.topLeft, len: d, pos: [-w/2, h/2, 0], rot: [0, 0, -Math.PI/2] },
    // Bottom-Left
    { r: edgeRadii.bottomLeft, len: d, pos: [-w/2, -h/2, 0], rot: [0, 0, Math.PI] },
    // Bottom-Right
    { r: edgeRadii.bottomRight, len: d, pos: [w/2, -h/2, 0], rot: [0, 0, Math.PI/2] },

    // --- X-axis edges (length = w) ---
    // Top-Front
    { r: edgeRadii.topFront, len: w, pos: [0, h/2, d/2], rot: [0, Math.PI/2, -Math.PI/2] },
    // Top-Back
    { r: edgeRadii.topBack, len: w, pos: [0, h/2, -d/2], rot: [0, Math.PI/2, 0] },
    // Bottom-Front
    { r: edgeRadii.bottomFront, len: w, pos: [0, -h/2, d/2], rot: [0, Math.PI/2, Math.PI] },
    // Bottom-Back
    { r: edgeRadii.bottomBack, len: w, pos: [0, -h/2, -d/2], rot: [0, Math.PI/2, Math.PI/2] },

    // --- Y-axis edges (length = h) ---
    // Front-Right
    { r: edgeRadii.frontRight, len: h, pos: [w/2, 0, d/2], rot: [-Math.PI/2, 0, Math.PI/2] },
    // Front-Left
    { r: edgeRadii.frontLeft, len: h, pos: [-w/2, 0, d/2], rot: [-Math.PI/2, 0, Math.PI] },
    // Back-Right
    { r: edgeRadii.backRight, len: h, pos: [w/2, 0, -d/2], rot: [-Math.PI/2, 0, 0] },
    // Back-Left
    { r: edgeRadii.backLeft, len: h, pos: [-w/2, 0, -d/2], rot: [-Math.PI/2, 0, -Math.PI/2] },
  ];

  for (const cut of cuts) {
    if (cut.r > 0) {
      // Clamp radius so cutters don't intersect and destroy the core
      const safeRadius = Math.min(cut.r, Math.min(w, h, d) / 2 - 0.001);
      
      const cutterGeo = createEdgeCutter(cut.len + 0.1, safeRadius); // Add slight extra length to prevent Z-fighting artifacts
      const cutterBrush = new Brush(cutterGeo);
      
      cutterBrush.position.set(...cut.pos);
      cutterBrush.rotation.set(...cut.rot);
      cutterBrush.updateMatrixWorld();

      mainBrush = evaluator.evaluate(mainBrush, cutterBrush, SUBTRACTION);
    }
  }

  const finalGeometry = mainBrush.geometry;
  finalGeometry.computeVertexNormals();
  return finalGeometry;
}
