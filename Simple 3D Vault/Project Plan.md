# Project Plan: Simple 3D Product Concepting Tool

This document outlines the design, state management architecture, and completed implementation phases for building the **Simple 3D Product Concepting Tool** using React, React Three Fiber, and Zustand.

## Tech Stack
- **Frontend Framework**: React (bootstrapped with Vite)
- **Styling**: Tailwind CSS (dark theme, flat floating panels inspired by Nomad Sculpt)
- **3D Engine**: Three.js via React Three Fiber (R3F)
- **3D Helper Library**: `@react-three/drei` (OrbitControls, Grid, Environment, ContactShadows, RoundedBox)
- **Post-Processing**: `@react-three/postprocessing` (Screen Space Ambient Occlusion - SSAO)
- **Boolean Engine**: `three-bvh-csg` (CSG booleans + custom 12-edge parametric beveling)
- **State Management**: Zustand (schema outlined below)

## UI Architecture (Nomad Sculpt Style)
- **Full Viewport Canvas**: 3D scene occupies 100% of the screen background.
- **Top Bar**: Floating top header for global scene controls (Environment preset selector, sky/floor color pickers, grid toggle, auto-rotate toggle, high-res canvas capture button).
- **Right Toolbox**: Floating vertical toolbar on the right side for transform modes (`translate`, `rotate`, `scale`), shape spawner buttons (Cube, Sphere, Cylinder), and item deletion.
- **Left Properties Panel**: Floating contextual sidebar on the left side for active selection properties:
  - Object naming & dimensions (Width, Height, Depth / Radius).
  - Material presets selector (`Polished Metal`, `Brushed Metal`, `Glossy Plastic`, `Matte Clay`).
  - Solid vs. Hole toggle.
  - Uniform Fillet slider & Advanced 12-Edge Fillet UI toggle with individual edge sliders.
  - Group action button (evaluates solid/hole booleans for multi-selection).
- **Bottom Bar**: Displays current selection status, active tool, and object stats.
- **Instructions Overlay**: Bottom-center translucent overlay outlining controls and shortcut guides.

## Updated Zustand State Schema
```javascript
{
  presentationSettings: {
    backdropColor: "#121212",
    floorColor: "#1e1e1e",
    environmentPreset: "city",
    showGrid: true,
    autoRotate: false
  },
  uiState: {
    selectedObjectIds: [], // Multi-select array
    activeTool: "translate" // "translate", "rotate", "scale"
  },
  objects: {
    // Record<string, PrimitiveObject | CSGObject>
  },
  history: [ /* Array of 30 objects state snapshots for Undo/Redo */ ],
  historyIndex: 0,
  clipboard: [ /* Array of copied object JSON snapshots */ ],
  captureRenderTrigger: 0
}
```

## Phases & Implementation Status
- [x] **Phase 1: Virtual Studio (Canvas & Rendering)** - Complete
  - R3F Canvas, OrbitControls, Environment lighting, floor plane, and post-processing SSAO.
- [x] **Phase 2: Primitives & Interaction** - Complete
  - Primitive meshes (Box, Sphere, Cylinder), materials, TransformControls integration, and state synchronization.
- [x] **Phase 3: UI Controls, Material Tuning & Presentation Shading** - Complete
  - Nomad Sculpt sidebar layout, 3-point studio lighting, Apple-product material profiles, floor click deselection, and high-res canvas capture.
- [x] **Phase 4: CSG Booleans, 12-Edge Fillets & History Editing Tools** - Complete
  - Solid/Hole boolean engine using `three-bvh-csg`, 12-edge parametric box beveling (`geometryBuilder.js`), Enter key placement confirmation, WebGL crash prevention safeguards, Undo/Redo history stack (30 steps), Copy/Paste/Duplicate tools, and global hotkeys (`Ctrl+Z`, `Ctrl+Y`, `Ctrl+C`, `Ctrl+V`, `Ctrl+D`, `Delete`).
