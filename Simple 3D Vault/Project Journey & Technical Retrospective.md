# Project Journey, Engineering Thoughts & Technical Retrospective

This document serves as a comprehensive archive of the entire development process for the **Simple 3D Product Concepting Tool**. It captures the underlying design philosophy, engineering decisions, root-cause diagnostics, successful architectural implementations, and areas identified for future improvisation.

---

## 1. Project Context & Objectives

The goal was to create a lightweight, browser-based 3D product concepting tool that combines:
- **Tinkercad's Intuitive Workflow**: Block-based CSG booleans (Solid/Hole workflow), simple shape spawning, and beginner-friendly interactions.
- **Nomad Sculpt / Blender's Presentation Quality**: High-fidelity Studio Lighting, Image-Based Lighting (IBL) reflections, soft drop-shadows, and realistic material shaders.

---

## 2. Development Process, Engineering Thoughts & Technical Evolution

### Phase 1: Virtual Studio & Basic Camera Setup
- **Thought & Goal**: Establish a full-screen viewport with smooth camera controls and an infinite grid background.
- **Implementation**: Built with React, Three.js, and React Three Fiber (`R3F`). Integrated `@react-three/drei`'s `OrbitControls`, `Grid`, and `Environment`.

### Phase 2: Nomad Sculpt Style Shading & PBR Materials
- **Thought & Challenge**: Basic CAD rendering looks flat and uninspiring. The user requested presentation-ready materials matching tools like Nomad Sculpt or Blender.
- **Engineering Choice**: Implemented `MeshPhysicalMaterial` presets (`polishedMetal`, `brushedMetal`, `glossyPlastic`, `matteClay`).
- **Root Cause & Diagnostic (Harshness / Invisible Shadows)**:
  - *Problem*: Highly metallic surfaces (`metalness: 1.0`) act as pure mirrors in WebGL. They reflect the environment map completely and ignore diffuse directional light, making drop-shadows cast on metallic surfaces appear washed out or invisible.
  - *Solution*: Calibrated `metalness` to ~0.5 while boosting `clearcoat: 1.0`, `clearcoatRoughness`, and `envMapIntensity: 2.5`. This maintains a glossy, reflective finish (like an iPhone's glass/metal body) while allowing physical drop-shadows to render clearly on surfaces.

### Phase 3: Custom Parametric 12-Edge Fillet Engine (`geometryBuilder.js`)
- **Thought & Challenge**: Standard Three.js `RoundedBoxGeometry` applies a single uniform fillet radius to all 12 edges. The user required independent control over individual edges (e.g. beveling only top edges or vertical edges).
- **Engineering Choice**: Created a background CSG beveling algorithm (`createAdvancedBeveledBox`). It starts with a base box and dynamically subtracts 12 convex "edge-cutter" brushes positioned along each 3D edge axis (4 Top, 4 Bottom, 4 Vertical).
- **UI & Safeguards**: Built an "Advanced Edge Fillets" panel with 12 sliders and added zero-radius safety fallbacks to prevent `RoundedBoxGeometry` division-by-zero WebGL crashes.

### Phase 4: Order-Independent CSG Booleans & Grouping
- **Thought & Challenge**: Users need to combine shapes (Union) and cut holes out of shapes (Subtraction).
- **Root Cause & Diagnostic (Shape Vanishing & Selection Order Bug)**:
  - *Problem 1*: In early iterations, selecting a `Hole` shape before a `Solid` shape caused the entire geometry to evaluate to zero and vanish.
  - *Problem 2*: Grouping two `Solid` shapes without a `Hole` was ignored.
  - *Solution*: Rewrote `groupSelected` in `useStore.js` and `evaluateCSGGeometry` in `CSGMesh.jsx`.
    1. Full child object snapshots are stored in `csgObj.children`.
    2. Before evaluation, children are automatically sorted so **all `Solid` shapes are evaluated first** (`ADDITION`), followed by **all `Hole` shapes second** (`SUBTRACTION`). Selection order no longer matters!
    3. Added `ungroupSelected` to allow users to split CSG groups back into individual editable primitives.

### Phase 5: Interaction, Stability & Placement Confirmation
- **Root Cause & Diagnostic (WebGL Canvas Blackouts & Snapbacks)**:
  - *Problem*: Real-time state updates during `TransformControls` drag caused 60FPS re-render loops, overwhelming WebGL and causing canvas unmounts or coordinate snapbacks.
  - *Solution 1*: Decoupled `TransformControls` using a `useState` node reference (`setMesh`), ensuring the gizmo only mounts after the mesh is ready.
  - *Solution 2*: Implemented the **`Enter` Key Placement Workflow**. Users drag/rotate/scale freely, then press `Enter` to stamp coordinates into Zustand memory and deselect cleanly.
  - *Solution 3*: Added a reactive `useEffect` in `Scene.jsx` that forcibly sets `OrbitControls.enabled = true` whenever selection is cleared, preventing gizmo unmounting from locking camera navigation.

### Phase 6: History Stack & Editing Tools
- **Implementation**: Built a 30-step history stack (`history`, `historyIndex`) in Zustand.
- **Actions**:
  - `Undo` (`Ctrl+Z`) & `Redo` (`Ctrl+Y` / `Ctrl+Shift+Z`)
  - `Copy` (`Ctrl+C`), `Paste` (`Ctrl+V`), and `Duplicate` (`Ctrl+D`) with position offsets.
  - `Delete` / `Backspace` keybindings.

### Phase 7: Photorealistic Apple-Style Rendering Upgrade (WebGPU Experiment)
- **Thought & Challenge**: The user requested high-end Apple product photography renders (satin anodized aluminum, optical glass, soft studio lighting) without the harshness of standard WebGL renders.
- **Engineering Choice**: Created an experimental branch (`Simple 3D - WebGPU Experiment`). Implemented a two-pronged approach: a real-time studio viewport upgrade and an optional path tracer overlay.
- **Root Cause & Diagnostic (CG Fake Look)**:
  - *Problem*: Standard WebGL materials look mathematically perfect and mirror-like.
  - *Solution 1 (Microtexture)*: Added `textureGenerator.js` to create extremely fine procedural noise maps. These maps add microscopic grain to the normal map of materials, breaking up mirrored reflections just like precision-machined anodized aluminum.
  - *Solution 2 (Lighting)*: Overhauled `Scene.jsx` to use soft `Lightformer` area lights (Key, Edge, Fill, and Negative Fill flags) to control reflection contours.

### Phase 8: Studio PBR Render Pipeline, Decoupled Background & Vercel Deployment
- **Thought & Challenge**: Build a signature Studio Render Rig with real numeric material sliders (replacing dropdown presets), RectAreaLights, unlit decoupled background, 60FPS transform gizmo sync without snapback, and automated cloud deployment.
- **Key Implementations**:
  1. **Direct PBR Material Sliders**: Replaced dropdown presets with direct per-object numeric sliders (`metalness`, `roughness`, `clearcoat`, `transmission`, `ior`).
  2. **Procedural Lightformer PMREM Rig**: Exposed Key, Edge, and Fill intensities as live Studio Rig sliders. The environment map (PMREM) dynamically updates on slider changes without constant `frames={Infinity}` overhead.
  3. **RectAreaLights**: Added `<rectAreaLight>` components matching lightformers to produce elongated rectangular specular highlights on metal surfaces without point hotspots.
  4. **Decoupled Unlit 2D Background (Option A)**:
     - *Requirement*: Background must remain a flat/gradient color completely unaffected by scene lighting/lightformers, while objects receive full IBL reflections.
     - *Solution*: Created `BackgroundGradient` component using a 2D `CanvasTexture` mapped directly to `scene.background`. This ensures the background is screen-space unlit, avoiding horizon lines and lighting washouts, while keeping the shadow catcher floor independent.
  5. **Z-Fighting Grid Fix**: Re-spaced ground plane Y-coordinates (`Grid` at `Y = -0.74`, `ContactShadows` at `Y = -0.745`, `Floor` at `Y = -0.75`) to eliminate depth precision flickering on camera zoom out.
  6. **Transform Controls Real-Time Sync**:
     - *Problem*: Dragging transform gizmos mutated Three.js mesh coordinates, but React re-renders reset the mesh to the un-commited Zustand store position, causing snapbacks before pressing `Enter`.
     - *Solution*: Wired `onObjectChange` callback to `<TransformControls>` in `PrimitiveMesh` and `CSGMesh`, continuously updating Zustand store coordinates during gizmo movement.
  7. **Vercel Cloud Deployment Fix**:
     - *Problem*: Vercel build failed with `ERESOLVE` due to `three-gpu-pathtracer` requesting `three@>=0.180.0`.
     - *Solution*: Added `vercel.json` with `"installCommand": "npm install --legacy-peer-deps"` and `"overrides"` in `package.json`. Successfully deployed to GitHub repository (`https://github.com/pranjali25-hub/Simple3D.2.git`).

---

## 📊 Overall Completion Progress: 70%

```
[███████████████████████████████████░░░░░░░░░░░░░] 70% Completed (Mid-Semester Review Stage)
```

| Phase / Module | Weight | Status |
|---|---|---|
| **Phase 1: Viewport & Camera Engine** | 15% | ✅ 100% Complete |
| **Phase 2: Nomad & PBR Shading System** | 15% | ✅ 100% Complete |
| **Phase 3: Order-Independent CSG Booleans** | 20% | ✅ 100% Complete |
| **Phase 4: Parametric Studio Lightformer Rig** | 10% | ✅ 100% Complete |
| **Phase 5: Decoupled Unlit Background Gradient** | 5% | ✅ 100% Complete |
| **Phase 6: Gizmo Sync & History Stack (Undo/Redo)** | 5% | ✅ 100% Complete |
| **Phase 7: Cloud CI/CD Deployment (Vercel)** | 5% | ✅ 100% Complete |
| **Phase 8: Production Edge Filleting & Chamfering** | 10% | ⏳ 0% (Current Fillet is in Experimental Trying Mode) |
| **Phase 9: Smart Measurement & Distance Tool** | 10% | ⏳ 0% (Planned Next Feature) |
| **Phase 10: Full-Stack Cloud Backend & Auth** | 5% | ⏳ 0% (Planned Next Feature) |

---

## 3. What Works (Current System Capabilities)

| Feature | Status | Details |
|---|---|---|
| **Floating Nomad UI** | ✅ Works | Minimal TopBar, RightToolbox, LeftPropertiesPanel, and BottomBar layout. |
| **Studio Shading & Lighting** | ✅ Works | 3-point studio lights, IBL environment reflections, and contact shadows. |
| **Object-to-Object Shadows** | ✅ Works | Directional shadow maps cast realistic drop shadows across adjacent shapes. |
| **12-Edge Parametric Beveling** | ✅ Works | Independent edge fillet sliders for custom chamfers and bevels. |
| **Order-Independent CSG** | ✅ Works | Grouping solids/holes works in any selection order; supports Union and Subtraction. |
| **Ungrouping** | ✅ Works | One-click restoration of CSG groups into individual shapes. |
| **Enter-Key Placement** | ✅ Works | Rock-solid coordinate stamping without snapback or gizmo lag. |
| **Undo / Redo (30 Steps)** | ✅ Works | Full history stack accessible via UI buttons and hotkeys. |
| **Copy / Paste / Duplicate** | ✅ Works | Instant shape cloning with automatic position offsetting. |
| **High-Res Render Capture** | ✅ Works | One-click screenshot capture utility. |

---

## 4. What Still Needs Improvising (Future Technical Roadmap)

1. **CSG Performance Offloading (Web Workers / WASM)**:
   - *Current Behavior*: Complex CSG boolean evaluations run on the main JavaScript thread, which can cause brief UI stutters when combining high-poly shapes.
   - *Improvisation*: Move `three-bvh-csg` evaluation to a Web Worker or a WebAssembly (WASM) background thread to keep main thread rendering at 60FPS.

2. **CSG Boolean Edge Chamfering / Filleting**:
   - *Current Behavior*: Fillets are currently applied to primitive boxes before boolean operations. Sharp cut edges created *after* a boolean hole subtraction remain sharp.
   - *Improvisation*: Implement post-CSG edge beveling using B-Rep curve offsets or vertex normal smoothing along boolean intersection seams.

3. **Per-Subshape Material Assignment in CSG Groups**:
   - *Current Behavior*: A grouped CSG object adopts a single unified material profile (e.g. Polished Metal).
   - *Improvisation*: Support multi-material groups where subtracted hole cutouts or joined solid sub-shapes retain their original individual surface colors/materials.

4. **3D File Import & Export (.OBJ / .STL / .GLTF)**:
   - *Current Behavior*: Concept designs exist within the browser viewport and can be captured as 2D screenshots.
   - *Improvisation*: Integrate `STLExporter`, `OBJExporter`, and `GLTFExporter` so users can export their 3D models for 3D printing or rendering in external CAD software like Blender.

5. **Transform Grid Snapping**:
   - *Current Behavior*: Gizmo movement is continuous.
   - *Improvisation*: Add snap increments (e.g. 0.5 unit position snap, 15-degree rotation snap) to make precise alignment easier.
