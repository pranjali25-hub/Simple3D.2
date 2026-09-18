# EDI Mid-Semester Review: Group Presentation & Study Guide
> **Project Name**: Simple 3D — Browser-Based 3D Product Concepting & Studio Rendering Tool
> **Domain**: Computer-Aided Design (CAD) & Real-Time Computer Graphics

--- 

## 📌 1. Elevator Pitch (30 Seconds)
> Existing 3D tools force a hard compromise: beginner tools like Tinkercad look flat and non-realistic, while professional tools like Blender require complex installations and steep learning curves. Simple 3D solves this by delivering an install-free, browser-based CAD tool combining Tinkercad CSG booleans with Blender-level studio PBR rendering.

## 🧠 2. Domain & Technical Cheat Sheet
- **Domain**: CAD (Computer-Aided Design) & Computer Graphics
- **Frontend Framework**: React.js + Vite
- **3D Engine**: Three.js + React Three Fiber (R3F)
- **Helper Libraries**: @react-three/drei (OrbitControls, Grid, Lightformer)
- **Boolean Engine**: three-bvh-csg (Order-independent CSG booleans)
- **State Management**: Zustand (History stack, transform state sync)
- **Rendering Pipeline**: Physically Based Rendering (PBR), RectAreaLights, Procedural Microtexture, Decoupled Unlit Background
- **Deployment**: Vercel + GitHub

## 📊 3. Presentation Guide (EDI Criteria)
1. **Problem Statement**: Existing tools are either too simplistic (flat Tinkercad) or too complex (heavy Blender GPU requirement). Innovation: browser-based PBR + Apple Studio Lightformer Rig.
2. **Methodology**: Constructive Solid Geometry (CSG Union & Subtraction), 12-edge parametric beveling, procedural noise for anodized aluminum.
3. **SDGs Mapped**:
   - **SDG 9 (Industry & Innovation)**: Low-cost WebGL digital infrastructure.
   - **SDG 12 (Responsible Production)**: Reduces physical plastic waste via digital twin prototyping.
   - **SDG 4 (Quality Education)**: Zero-cost, zero-install CAD tool for students.
4. **System Architecture**: React UI -> Zustand Store -> R3F Canvas & CSG Geometry Evaluator.

## 🎬 4. Live Demo Script
1. **Shape Spawning**: Spawn Cube, show transform gizmo live coordinate sync.
2. **CSG Hole Cutout**: Spawn Cylinder (Hole), group with Cube to cut a clean smooth hole.
3. **Apple-Style Metal Shading**: Adjust Metalness to 1.0, Roughness to 0.33 to show satin anodized aluminum with soft Lightformer reflections.
4. **Decoupled Background**: Change Bg Top/Btm colors live without affecting object reflections.

## ❓ 5. Evaluator Q&A
- **Q: How is this different from Tinkercad?**
  - *A: Tinkercad uses flat shading. Simple 3D uses Physically Based Rendering (PBR) with procedural Lightformer environment maps and anodized metal microtextures.*
- **Q: Does CSG slow down the browser?**
  - *A: We use three-bvh-csg which uses Bounding Volume Hierarchies (BVH) for accelerated real-time mesh evaluation.*
- **Q: How are metal reflections created without downloading heavy HDRIs?**
  - *A: We generate procedural PMREM environment maps using emissive lightformer softboxes and pitch-black negative fill flags.*

## 👥 6. Division of Responsibilities (Suggested Speaker Assignment)

- **Speaker 1 (Intro & Problem Statement)**: Problem Definition, Gaps in existing CAD tools, Objectives, SDGs (9, 12, 4).
- **Speaker 2 (Methodology & CSG Engine)**: CSG Booleans, Order-independent evaluation, Experimental Fillet Prototype (Trying Mode).
- **Speaker 3 (Rendering Pipeline & Studio Lighting)**: PBR Shading, Lightformer PMREM Rig, Decoupled Unlit Background, Procedural Microtexture.
- **Speaker 4 (Architecture, Live Demo & Q&A)**: Tech stack (React, R3F, Zustand, Vercel), Live Demo execution, handling evaluator questions & future roadmap (Production Filleting/Chamfering, Measurement tool).
