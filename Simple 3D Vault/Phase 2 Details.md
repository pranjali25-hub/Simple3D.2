# Phase 2: Primitives & Interaction Progress Log

We have successfully implemented **Phase 2: Primitives & Interaction** and **Phase 3 UI and Capture Render components** (which are fully functional to allow testing transforms, spawns, and captures).

## Features Added
1. **Nomad Sculpt-style Material Shaders (Polished Metal & Glazed Clay)**:
   - Replaced basic materials with high-fidelity `MeshPhysicalMaterial`.
   - **Cubes**: Rendered in polished chrome/steel (metallic: 0.95, roughness: 0.12, clearcoat: 1.0) with dynamic corner-rounding via `RoundedBox` geometry.
   - **Spheres**: Rendered in polished gold/brass (metallic: 0.9, roughness: 0.15, clearcoat: 1.0).
   - **Cylinders**: Rendered in polished emerald ceramic glaze (metallic: 0.3, roughness: 0.2, clearcoat: 1.0).
2. **Infinite Studio Ground Setup**:
   - Added `ContactShadows` onto the grid floor to cast realistic soft contact shadows beneath objects.
3. **Floating UI Panels**:
   - **Top Bar**: Toggles background colors, environment presets, grids, auto-rotation, and exports screenshot renders.
   - **Right Toolbox**: Selects transform modes (`translate`, `rotate`, `scale`), spawns primitive shapes (Cube, Sphere, Cylinder), and deletes selected items.
   - **Left Properties Panel**: Displays and handles adjustments for coordinates (position, rotation, scale) and primitive properties (dimensions, filletRadius sliders). Includes subtraction forms.
   - **Bottom Stats Overlay**: Displays active objects count, type distribution, and selected object status.
4. **Interactive Manipulators**:
   - Integrated `TransformControls` for move, rotate, and scale operations.
   - Synchronized manipulations back to the Zustand store upon mouse release (`onPointerUp` drag end), keeping rendering responsive and lag-free.
   - Leveraged Drei's `makeDefault` controls hierarchy to automatically lock orbit camera controls during gizmo manipulations.

## Technical Details
- **Syncing Strategy**: Viewport transforms are computed locally during active drags, and committed to Zustand only on drag release (`onPointerUp`). This avoids React update lag.
- **Export Triggering**: Communication from the floating HTML TopBar down into the canvas WebGL context is accomplished using a reactive capture trigger counter in the store.
