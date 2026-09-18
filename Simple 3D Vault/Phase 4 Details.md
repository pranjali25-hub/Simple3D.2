# Phase 4: CSG Booleans & Parametric Edge Fillets

This document covers the implementation of CSG boolean operations (Tinkercad-style Solid/Hole workflow), the custom 12-edge independent fillet generator, and stability architecture.

## Key Features

### 1. Tinkercad-Style CSG Boolean Workflow
- **Solid vs. Hole Objects**: Objects can be marked as `solid` or `hole`. Hole objects render as red semi-transparent wireframes.
- **Multi-Select & Grouping**: `Shift + Click` selects multiple objects. Clicking "Group" evaluates CSG booleans across all selected objects.
- **Order-Independent CSG Evaluation**: Fixed the selection-order bug where selecting a Hole first would cause shapes to vanish. The algorithm now automatically sorts `solid` shapes first and `hole` shapes second before CSG evaluation (`evaluateCSGGeometry`).
- **Solid-Solid Unioning**: Combining multiple solid shapes without holes now correctly unions them (`ADDITION`) into a single combined mesh.
- **Ungrouping**: Added an "Ungroup Objects" feature in the Properties Panel to restore CSG groups back into individual editable shapes.
- **CSGMesh Component**: Dynamically evaluates CSG geometries, supports nested CSG booleans, and enables gizmo transform controls on grouped meshes.

### 2. History Stack & Editing Utilities (Undo, Redo, Copy, Paste, Duplicate)
- **Undo / Redo History Stack**: Tracks up to 30 past object state snapshots. Available via UI buttons in `TopBar` and keyboard shortcuts (`Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z`).
- **Copy & Paste**: Saves selected objects to a Zustand clipboard state. Pasting (`Ctrl+V` or Paste button) clones the objects with fresh IDs and an offset position.
- **Duplicate**: One-click duplication (`Ctrl+D` or Duplicate button) clones selected shapes and selects the duplicates.
- **Delete Keybinding**: Pressing `Delete` or `Backspace` deletes selected objects.

### 3. Independent 12-Edge Parametric Fillet System (`geometryBuilder.js`)
- **Background CSG Fillet Algorithm**: Standard `RoundedBoxGeometry` only supports uniform radius across all 12 edges. We built a custom CSG-based algorithm (`createAdvancedBeveledBox`) that dynamically subtracts edge-cutter brushes for each edge.
- **Per-Edge Radius Control**: 12 independent edge keys:
  - **Top Edges**: `topFront`, `topBack`, `topLeft`, `topRight`
  - **Bottom Edges**: `bottomFront`, `bottomBack`, `bottomLeft`, `bottomRight`
  - **Vertical Edges**: `frontLeft`, `frontRight`, `backLeft`, `backRight`
- **UI Sliders**: Toggling from "Uniform" to "Advanced" in the Properties Panel displays 12 compact sliders allowing precise per-edge beveling.
- **Zero-Radius Safety Fallbacks**: Added safeguards converting zero-radius box rendering to standard `<boxGeometry>` to prevent WebGL division-by-zero canvas unmounts.

### 4. Interaction & Transform Stability & Network Resilience
- **Decoupled TransformControls**: Bound gizmo to DOM elements via a `useState` node reference (`setMesh`), resolving infinite state re-render loops and canvas blackout crashes.
- **Enter Key Confirmation**: Transformed object coordinates are finalized and written to Zustand store when pressing the `Enter` key.
- **Camera Lock Protection**: Added automatic `OrbitControls.enabled = true` enforcement upon deselection to prevent gizmo unmounts from locking camera navigation.
- **Procedural Offline Lighting (Zero-Network Dependency)**: Replaced external Drei HDR environment map downloads (`raw.githubusercontent.com`) with procedural studio `<Lightformer>` shapes. This prevents network `ERR_CONNECTION_RESET` blocks on restricted college/VPN/mobile Wi-Fi networks from crashing WebGL context.
- **SSAO NormalPass Fix**: Explicitly configured `<EffectComposer disableNormalPass={false}>` to resolve SSAO normal pass warnings.
