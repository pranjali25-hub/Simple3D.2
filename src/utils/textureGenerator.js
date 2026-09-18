import * as THREE from 'three';

/**
 * Procedural Texture Generator
 * Creates runtime canvas-based textures for photorealistic PBR materials.
 * No external assets needed — everything is generated at startup.
 */

// Simple pseudo-random noise function
function hash(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

// Smooth interpolation
function smoothstep(a, b, t) {
  t = t * t * (3 - 2 * t);
  return a + (b - a) * t;
}

// Value noise (2D)
function valueNoise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);

  return smoothstep(
    smoothstep(a, b, fx),
    smoothstep(c, d, fx),
    fy
  );
}

// Fractal Brownian Motion — layered noise for realistic grain
function fbm(x, y, octaves = 4) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * valueNoise(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value;
}

/**
 * Creates a noise-based roughness map for metallic surface grain.
 * This gives metals the subtle micro-texture visible in Nomad Sculpt renders.
 * 
 * @param {number} size - Texture resolution (e.g., 128)
 * @param {number} baseRoughness - Center roughness value (0-1)
 * @param {number} variation - How much the roughness varies (0-1)
 * @param {number} scale - Noise scale (higher = finer grain)
 * @returns {THREE.CanvasTexture}
 */
export function createNoiseRoughnessMap(size = 128, baseRoughness = 0.3, variation = 0.15, scale = 8) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * scale;
      const ny = (y / size) * scale;

      // Multi-octave noise for organic grain pattern
      const noise = fbm(nx, ny, 5);

      // Map noise to roughness range
      const roughness = Math.max(0, Math.min(1, baseRoughness + (noise - 0.5) * variation * 2));
      const pixel = Math.floor(roughness * 255);

      const idx = (y * size + x) * 4;
      imageData.data[idx] = pixel;
      imageData.data[idx + 1] = pixel;
      imageData.data[idx + 2] = pixel;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/**
 * Creates a directional brushed metal scratch pattern.
 * Simulates the linear micro-grooves of brushed/machined aluminum.
 * 
 * @param {number} size - Texture resolution
 * @param {number} baseRoughness - Center roughness
 * @param {number} scratchIntensity - Strength of scratch lines (0-1)
 * @returns {THREE.CanvasTexture}
 */
export function createBrushedMetalMap(size = 128, baseRoughness = 0.25, scratchIntensity = 0.2) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Horizontal directional scratches
      const scratch = hash(x * 0.1, y * 47.3) * scratchIntensity;

      // Subtle overall grain
      const grain = valueNoise(x * 0.5, y * 0.5) * 0.05;

      // Directional bias: vary roughness more along Y (perpendicular to brush direction)
      const directional = valueNoise(x * 0.02, y * 2.0) * scratchIntensity * 0.5;

      const roughness = Math.max(0, Math.min(1, baseRoughness + scratch + grain + directional - scratchIntensity * 0.5));
      const pixel = Math.floor(roughness * 255);

      const idx = (y * size + x) * 4;
      imageData.data[idx] = pixel;
      imageData.data[idx + 1] = pixel;
      imageData.data[idx + 2] = pixel;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Creates a subtle normal map for surface micro-detail.
 * Adds the perception of surface grain even without changing geometry.
 * 
 * @param {number} size - Texture resolution
 * @param {number} strength - Normal intensity (0-1)
 * @returns {THREE.CanvasTexture}
 */
export function createMicroNormalMap(size = 128, strength = 0.3) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);

  // Generate height field first
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      heights[y * size + x] = fbm(x * 0.15, y * 0.15, 4);
    }
  }

  // Derive normals from height field via central differences
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const x0 = x > 0 ? x - 1 : size - 1;
      const x1 = x < size - 1 ? x + 1 : 0;
      const y0 = y > 0 ? y - 1 : size - 1;
      const y1 = y < size - 1 ? y + 1 : 0;

      const dx = (heights[y * size + x1] - heights[y * size + x0]) * strength;
      const dy = (heights[y1 * size + x] - heights[y0 * size + x]) * strength;

      // Encode normal as RGB (tangent space: R=X, G=Y, B=Z)
      const idx = (y * size + x) * 4;
      imageData.data[idx] = Math.floor((dx * 0.5 + 0.5) * 255);     // R: normal X
      imageData.data[idx + 1] = Math.floor((dy * 0.5 + 0.5) * 255); // G: normal Y
      imageData.data[idx + 2] = 255;                                  // B: normal Z (pointing up)
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// Singleton texture cache — generated once, reused everywhere
let _textureCache = null;

export function getProceduralTextures() {
  if (_textureCache) return _textureCache;

  _textureCache = {
    noiseRoughness: createNoiseRoughnessMap(256, 0.33, 0.03, 30),
    brushedRoughness: createBrushedMetalMap(256, 0.28, 0.10),
    microNormal: createMicroNormalMap(256, 0.05),
  };

  return _textureCache;
}
