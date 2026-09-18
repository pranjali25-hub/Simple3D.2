# SIMPLE 3D — EDI MID-SEMESTER ASSESSMENT MASTER DOCUMENT
> **Project Title**: Simple 3D — Browser-Based CAD Concepting & Studio Rendering Engine  
> **Domain**: Computer-Aided Design (CAD) & Real-Time Computer Graphics  
> **Repository**: https://github.com/pranjali25-hub/Simple3D.2  
> **Live Web Application**: https://simple3d-2.vercel.app/  

---

# SECTION 1: ASSESSMENT PARAMETERS MAPPING

## 1. Problem Definition, Related Work, and Complexity
- **Problem Statement**: 
  Industrial design students, rapid prototypers, and 3D concept creators face a binary choice in current software:
  1. **Simplistic/Non-Realistic**: Entry-level web tools like *Tinkercad* offer easy CSG booleans but rely on flat, non-PBR shading, rigid lighting, and lack studio rendering capabilities.
  2. **Complex/Heavy Infrastructure**: Professional tools like *Blender*, *Nomad Sculpt*, or *SolidWorks* require expensive GPU hardware, complex local software installation, steep learning curves, and paid licensing.
- **Related Work Comparison**:
  - **Tinkercad**: Excellent boolean workflow, but lacks PBR materials, microtextures, and soft studio lighting.
  - **Nomad Sculpt**: High PBR rendering quality, but targets mobile sculpting rather than procedural CAD CSG modeling.
  - **Shapr3D**: High-end CAD tool, but locked behind expensive subscriptions and proprietary hardware.
- **Project Complexity**:
  - Combining real-time boolean mesh evaluations with a **Physically Based Rendering (PBR)** studio pipeline inside a standard web browser without third-party plugins.
  - Implementing order-independent CSG evaluation, procedural lightformer environment map (PMREM) generation, 12-edge parametric beveling, screen-space decoupled background rendering, and real-time state synchronization at 60 FPS.

---

## 2. Objectives of the Project
1. **Zero-Install Web CAD**: Build an accessible, browser-native 3D modeling tool accessible on any device with WebGL.
2. **Order-Independent CSG Booleans**: Enable intuitive Solid/Hole grouping that correctly evaluates regardless of selection order.
3. **Apple-Grade Studio Rendering**: Implement a procedural Lightformer environment rig capable of generating soft studio photography reflections (anodized metal, optical glass).
4. **Decoupled Background & Studio Controls**: Provide user-adjustable studio lighting intensities and unlit background gradients that do not wash out or interfere with object light reflections.
5. **Interactive CAD Utilities**: Feature real-time transform gizmo state synchronization, a 30-step undo/redo stack, parametric edge filleting, and screenshot rendering.

---

## 3. Literature Review, Proposed Solution, Technical Approach, and Feasibility
- **Literature / Technical Foundation**:
  - **Constructive Solid Geometry (CSG)**: Uses boolean set operations (Union $A \cup B$, Difference $A \setminus B$, Intersection $A \cap B$) over 3D volumetric primitives.
  - **Physically Based Rendering (PBR)**: Implements the Cook-Torrance microfacet BRDF model, simulating Surface Roughness, Metalness, Index of Refraction (IOR), Transmission, and Clearcoat.
  - **Image-Based Lighting (IBL) & PMREM**: Prefiltered Mipmapped Radiance Environment Maps allow real-time specular reflections from surrounding light environments.
- **Proposed Technical Solution**:
  - A React-based web application leveraging **React Three Fiber (R3F)** for declarative WebGL scene graph management, **Zustand** for centralized high-performance state management, and **`three-bvh-csg`** utilizing Bounding Volume Hierarchies for rapid 3D boolean mesh evaluation.
- **Technical Feasibility**:
  - Proven through real-time 60FPS execution in standard modern web browsers (Chrome, Edge, Firefox, Safari) using client-side WebGL2 shaders with zero server-side rendering dependency.

---

## 4. Cost, Resources, Environmental Relevance, and Sustainability (SDGs)

### Resource & Cost Breakdown
- **Software License Cost**: **$0** (100% Open Source Stack: React, Three.js, Vite, Tailwind CSS).
- **Hardware Requirement**: Runs on standard consumer laptops and integrated graphics (Intel HD/Iris, AMD Vega, Apple M-series, Nvidia GTX). No workstation GPUs required.
- **Hosting Infrastructure**: **$0** (Automated continuous deployment via Vercel Free Tier).

### Sustainable Development Goals (SDGs) Alignment
1. **SDG 9: Industry, Innovation, and Infrastructure**
   - *Web-Native Digital Infrastructure*: Democratizes access to industrial CAD and rendering software without requiring heavy local computing infrastructure.
2. **SDG 12: Responsible Consumption and Production**
   - *Digital Twin Prototyping*: Reduces physical material waste, plastic filament consumption, and prototype iteration costs by enabling high-fidelity digital validation prior to 3D printing.
3. **SDG 4: Quality Education**
   - *Barrier-Free Learning*: Delivers free, zero-install educational 3D modeling tools to schools and students without expensive software licenses or hardware prerequisites.

---

## 5. Group Formation & Individual Responsibilities

- **Member 1 (Lead CAD & CSG Engineer)**:
  - Responsibilities: CSG Boolean architecture (`CSGMesh.jsx`), order-independent sorting algorithms, 12-edge parametric bevel engine (`geometryBuilder.js`).
- **Member 2 (Rendering & Shader Engineer)**:
  - Responsibilities: Studio PBR pipeline (`Scene.jsx`), procedural microtexture normal map generator (`textureGenerator.js`), RectAreaLights & Lightformer rig.
- **Member 3 (Frontend & UX Architect)**:
  - Responsibilities: Floating UI components (`LeftPropertiesPanel.jsx`, `RightToolbox.jsx`, `TopBar.jsx`), Tailwind CSS layout, Zustand store (`useStore.js`), history stack (Undo/Redo).
- **Member 4 (QA, Deployment & Documentation Engineer)**:
  - Responsibilities: Decoupled background gradient system, transform gizmo synchronization, Vercel CI/CD deployment (`vercel.json`), Obsidian vault documentation.

---

# SECTION 2: TECHNICAL STACK (HOW, WHY, WHERE)

| Technology / Tool | Version | **WHY** We Chose It | **HOW** It Is Used | **WHERE** In Codebase |
|---|---|---|---|---|
| **React.js** | `^18.3.1` | Component-based structure for responsive UI panels and state hooks. | Wraps application layout, handles UI state changes, and mounts R3F canvas. | `src/App.jsx`, `src/main.jsx` |
| **Three.js** | `^0.164.1` | Industry-standard WebGL 3D graphics library. | Creates scenes, cameras, geometries, PBR materials, lights, and WebGL rendering context. | Underlying dependency for all 3D components |
| **React Three Fiber (R3F)** | `^8.16.6` | Declarative React wrapper for Three.js; syncs React state with 3D scene graph. | Manages the 3D Canvas element, render loop (`useFrame`), and camera context (`useThree`). | `src/components/Viewport.jsx`, `src/canvas/Scene.jsx` |
| **`@react-three/drei`** | `^9.105.6` | Pre-built R3F helpers for camera, environment, and geometry. | Powers `OrbitControls`, `Grid`, `Lightformer`, `ContactShadows`, `TransformControls`, `Backdrop`. | `src/canvas/Scene.jsx`, `src/canvas/PrimitiveMesh.jsx` |
| **`three-bvh-csg`** | `^0.0.16` | Bounding Volume Hierarchy accelerated CSG boolean library. | Evaluates solid/hole boolean mesh intersections (`SUBTRACTION`, `ADDITION`). | `src/canvas/CSGMesh.jsx` |
| **Zustand** | `^4.5.2` | Ultra-fast, lightweight state management without Redux boilerplate. | Stores scene graph objects, active tool, selection IDs, presentation settings, and 30-step undo/redo stack. | `src/store/useStore.js` |
| **`@react-three/postprocessing`** | `^2.16.2` | Real-time GPU post-processing effect composer. | Renders SSAO (contact shadows), Bloom, Brightness/Contrast, and Hue/Saturation passes. | `src/canvas/Scene.jsx` |
| **Vite** | `^5.2.11` | Instant HMR development server and fast Rollup production bundler. | Compiles JSX, CSS modules, and builds static production dist assets. | `vite.config.js`, `package.json` |
| **Tailwind CSS** | `^3.4.3` | Utility-first CSS framework. | Styles floating panels, translucent backdrop blur effects, tool icons, and custom scrollbars. | `src/index.css`, `tailwind.config.js` |
| **Vercel** | Platform | Automated CI/CD web hosting directly from GitHub commits. | Deploys static build using `vercel.json` and `.npmrc` peer dependency overrides. | `vercel.json`, `.npmrc` |

---

# SECTION 3: SYSTEM ARCHITECTURE & DATA FLOW

## Architectural Pipeline
```
[ User Interaction ] ──> [ React UI Components ]
                                │
                                ▼
                       [ Zustand Store ] ──> (History Stack / Undo-Redo)
                                │
       ┌────────────────────────┴────────────────────────┐
       ▼                                                 ▼
[ 3D Scene Viewport (R3F Canvas) ]               [ CSG Geometry Evaluator ]
 ├── MeshPhysicalMaterial Shaders                ├── Order-Independent Sorter
 ├── Procedural Microtextures                    ├── Bounding Volume Hierarchy
 ├── RectAreaLights & Lightformers               └── 12-Edge Parametric Bevels
 └── Decoupled Unlit 2D Background
```

## Detailed Data Flow Breakdown
1. **Action Trigger**: User selects a shape or modifies a parameter slider in `LeftPropertiesPanel.jsx` or `RightToolbox.jsx`.
2. **State Dispatch**: The component calls Zustand actions in `useStore.js` (e.g., `updateObjectParameters`, `updateObjectMeta`).
3. **Reactive Re-Render**: R3F components (`PrimitiveMesh.jsx`, `CSGMesh.jsx`) receive updated state props.
4. **Transform Sync**: `TransformControls` fires `onObjectChange` during gizmo dragging, continuously updating `object.position`, `rotation`, and `scale` in the Zustand store to eliminate snapback glitches.
5. **CSG Mesh Re-evaluation**: If a CSG group is modified, `CSGMesh.jsx` re-runs `evaluateCSGGeometry()`, sorting solid brushes first and hole brushes second before building the output geometry.
6. **Render Loop Execution**: `Scene.jsx` renders `MeshPhysicalMaterial` onto the screen, applying PMREM environment lighting, contact shadows, and GPU post-processing effects.

---

# SECTION 4: METHODOLOGY & KEY ENGINEERING IMPLEMENTATIONS

### 1. Order-Independent CSG Booleans (`CSGMesh.jsx`)
- **Challenge**: In naive CSG implementations, subtracting a hole shape before a solid shape is added results in empty geometry or canvas blackouts.
- **Engineering Solution**:
  - `CSGMesh` captures full child shape snapshots inside `object.children`.
  - Prior to evaluation, brushes are sorted into two strict passes:
    - **Pass 1**: All `Solid` shapes are evaluated using `ADDITION`.
    - **Pass 2**: All `Hole` shapes are evaluated using `SUBTRACTION`.
  - Result: Selection order no longer matters; boolean cuts are always clean and deterministic.

### 2. Custom 12-Edge Parametric Bevel Engine (`geometryBuilder.js`)
- **Challenge**: Standard Three.js `RoundedBoxGeometry` applies a single radius to all edges uniformly.
- **Engineering Solution**:
  - Created `createAdvancedBeveledBox(w, h, d, edgeRadii)`.
  - Evaluates 12 individual edge axes (4 Top, 4 Bottom, 4 Vertical).
  - Positions convex cutter brushes along specified edges and performs boolean subtraction, enabling asymmetric edge chamfering (e.g. rounded top edges with sharp bottom edges).

### 3. Procedural Microtexture Generator (`textureGenerator.js`)
- **Challenge**: Pure metallic PBR shaders (`metalness: 1.0`) act as mirror surfaces in WebGL, creating cheap-looking CG renders.
- **Engineering Solution**:
  - Implemented Fractal Brownian Motion (fBM) procedural noise maps generated on an offscreen 256x256 HTML Canvas.
  - Applied as a subtle `normalMap` (`normalScale: [0.05, 0.05]`) to `MeshPhysicalMaterial`.
  - Breaks up mirror-like specular highlights at microscopic scale, simulating physical satin anodized aluminum.

### 4. Apple-Style Studio Lightformer PMREM Rig (`Scene.jsx`)
- **Challenge**: Static HDRI photographic environment maps cannot be dynamically adjusted by the user.
- **Engineering Solution**:
  - Built a parametric studio rig using emissive plane meshes (`<Lightformer>`):
    - **Key Light**: Large top/side softbox plane (intensity 6.0).
    - **Edge Light**: Tall vertical side softbox plane (intensity 3.0).
    - **Fill Light**: Low-intensity front bounce plane (intensity 1.0).
    - **Negative Fill**: Pitch-black non-emissive flags positioned top/front and right to cut reflections and define dark geometry contours.
  - Feeding this rig into Drei's `<Environment>` generates an offscreen PMREM map.
  - Added `<rectAreaLight>` components with `RectAreaLightUniformsLib` matching lightformer positions to create elongated rectangular specular highlights without point hotspots.

### 5. Decoupled Unlit 2D Background (`Scene.jsx`)
- **Challenge**: The background must remain a flat/gradient cosmetic framing color without receiving scene lights or altering object reflections.
- **Engineering Solution**:
  - Created `BackgroundGradient` component generating an unlit 2D `CanvasTexture` assigned directly to `scene.background`.
  - `<Environment>` is restricted to `scene.environment` only (`background={false}`).
  - Objects receive rich lightformer IBL reflections, while the background remains a clean, unlit, screen-space gradient unaffected by camera angles or scene lights.

### 6. Z-Fighting Grid & Shadow Catcher Stability (`Scene.jsx`)
- **Challenge**: Infinite grid, contact shadow quads, and floor planes at identical Y-levels produce severe visual flickering during camera zoom out.
- **Engineering Solution**:
  - Re-spaced ground plane Y-coordinates cleanly:
    - `Grid`: $Y = -0.740$
    - `ContactShadows`: $Y = -0.745$
    - `Floor Shadow Catcher`: $Y = -0.750$
  - Completely eliminates depth buffer precision overlap across all camera distances.

### 7. Transform Gizmo State Sync (`PrimitiveMesh.jsx`, `CSGMesh.jsx`)
- **Challenge**: Dragging `TransformControls` modified Three.js mesh transforms in memory, but React UI re-renders reset mesh coordinates back to un-commited Zustand store values, causing snapbacks.
- **Engineering Solution**:
  - Wired `onObjectChange` callbacks to `<TransformControls>`, continuously updating Zustand store coordinates in real time as gizmos are moved.

---

# SECTION 5: WORK ACCOMPLISHED vs. WORK REMAINING

## Work Accomplished (Completed Phases 1–8)
- ✅ **Full-Screen 3D Viewport**: Smooth R3F canvas setup with orbit controls and infinite grid.
- ✅ **Nomad/Blender PBR Shading**: Advanced `MeshPhysicalMaterial` presets and real numerical parameter sliders (`metalness`, `roughness`, `clearcoat`, `transmission`, `ior`).
- ✅ **Order-Independent CSG Engine**: Grouping/Ungrouping of Solid and Hole primitives.
- ✅ **12-Edge Parametric Beveling**: Independent edge fillet controls.
- ✅ **Procedural Microtexture**: Fractal noise normal map generator for anodized aluminum grain.
- ✅ **Studio Lightformer Rig**: Parametric softbox key/edge/fill lights with negative fill flags.
- ✅ **Decoupled Unlit Background**: Independent 2D screen-space gradient background.
- ✅ **Interaction Stability**: Real-time gizmo state sync, Z-fighting fix, and Enter-key placement.
- ✅ **30-Step History Stack**: Full Undo (`Ctrl+Z`), Redo (`Ctrl+Y`), Copy (`Ctrl+C`), Paste (`Ctrl+V`), Duplicate (`Ctrl+D`).
- ✅ **Cloud Deployment**: Production build deployed on Vercel via GitHub CI/CD with dependency overrides.

## Work Remaining (Future Technical Roadmap)
1. **Smart Measurement & Distance Tool (SolidWorks Style)**:
   - Dynamic 3D bounding box dimension callouts, object-to-object distance vectors, and point-to-point tape measure tool.
2. **Full-Stack Backend Integration**:
   - User authentication, project save/load to cloud database (Node.js/Express + MongoDB or Supabase).
3. **CSG Web Worker / WASM Offloading**:
   - Offloading heavy boolean geometry calculations to background Web Workers to guarantee 60FPS UI thread performance on ultra-complex meshes.
4. **3D File Export Options**:
   - Integrating `STLExporter`, `OBJExporter`, and `GLTFExporter` to allow 3D printing and exporting to external software like Blender.
5. **Per-Subshape Multi-Material Booleans**:
   - Retaining individual sub-shape surface colors/materials after boolean grouping operations.

---
*Document Compiled for EDI Mid-Semester Assessment*
