import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { WebGLPathTracer } from 'three-gpu-pathtracer';

export default function PathTracerOverlay({ enabled = true }) {
  const { gl, scene, camera } = useThree();
  const pathTracerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    try {
      const pathTracer = new WebGLPathTracer(gl);
      pathTracer.tiles.set(2, 2);
      pathTracer.filterGlossyFactor = 0.5;
      pathTracer.renderScale = 1.0;
      pathTracer.bounces = 8;            // More bounces for better GI
      pathTracer.minSamples = 1;

      pathTracerRef.current = pathTracer;

      return () => {
        if (pathTracerRef.current) {
          pathTracerRef.current.dispose();
          pathTracerRef.current = null;
        }
      };
    } catch (err) {
      console.warn("PathTracer initialization warning:", err);
    }
  }, [gl, enabled]);

  useEffect(() => {
    if (enabled && pathTracerRef.current && scene && camera) {
      try {
        pathTracerRef.current.setScene(scene, camera);
        pathTracerRef.current.reset();
      } catch (err) {
        console.warn("PathTracer scene update error:", err);
      }
    }
  }, [scene, camera, enabled]);

  useFrame(() => {
    if (enabled && pathTracerRef.current) {
      if (pathTracerRef.current.samples < 500) {
        pathTracerRef.current.renderSample();
      }
    }
  });

  return null;
}
