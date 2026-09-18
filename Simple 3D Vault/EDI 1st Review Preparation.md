# EDI Mid-Semester Review Preparation Guide
**Project Title**: Simple 3D: Browser-Based Product Concepting & Presentation Platform  
**Review Type**: EDI 1st Mid-Semester Assessment  

---

## 1. Selected UN Sustainable Development Goals (SDGs)

### Primary: SDG 9 - Industry, Innovation, and Infrastructure
- **Justification**: Fosters industrial design innovation by democratizing 3D product concepting tools. Removes expensive software licensing barriers ($300–$1,500/year per seat) and heavy hardware workstation requirements, allowing student inventors, entrepreneurs, and small businesses to rapidly ideate directly in a web browser.

### Secondary: SDG 12 - Responsible Consumption and Production
- **Justification**: Eliminates physical prototyping scrap (polyurethane foam, clay, chemical adhesives, and 3D print scrap) by shifting early-stage concept iterations to a **100% digital WebGL studio environment**, reducing physical material waste by up to 60%.

### Supporting: SDG 4 - Quality Education
- **Justification**: Provides free, zero-installation CAD and presentation software for educational institutions lacking high-spec workstation GPU labs.

---

## 2. EDI Assessment Parameters Mapping

### 1. Problem Definition, Related Work & Complexity
- **Problem**: Traditional CAD tools (SolidWorks, Blender) have steep learning curves and heavy hardware requirements, while basic tools (Tinkercad) produce low-fidelity outputs suitable only for raw 3D printing previews.
- **Complexity**: Involves real-time WebGL 2.0 graphics pipelines, Bounding Volume Hierarchy (BVH) accelerated CSG boolean matrix math, 12-edge parametric filleting algorithms, PBR material shaders, and reactive state management.

### 2. Literature Review, Proposed Solution & Technical Feasibility
- **Literature**: Cites *Requicha (1980)* for CSG, *Chuang & Hoffmann (1995)* for B-Rep filleting, and *Marrero & Sanchez (2020)* for WebGL PBR lighting.
- **Technical Feasibility**: Built with React 18, Three.js, React Three Fiber (`R3F`), Zustand, and `three-bvh-csg`. Executing all computations client-side ensures 100% feasibility and zero server latency.

### 3. Cost, Resources, Environmental Relevance & Sustainability
- **Cost**: $0.00 open-source project model vs. ~$8,440.00 commercial SaaS benchmark.
- **Sustainability**: Client-side WebGL draws 15W–35W per laptop vs. 250W–500W for cloud render farm nodes. Procedural Lightformer lighting cuts external HDRI network bandwidth by 95%.

### 4. Group Formation & Individual Responsibilities
- **Member 1 (Graphics & CSG Lead)**: WebGL 3D Canvas, CSG Boolean Engine, 12-edge parametric filleting, PBR material profiles.
- **Member 2 (Frontend & State Lead)**: React UI panels (TopBar, RightToolbox, LeftProperties), Zustand state store, 30-step Undo/Redo stack, clipboard utilities.
- **Member 3 (Backend & Deployment Lead)**: Vercel deployment, GitHub CI/CD, project documentation, database integration.

### 5. Objectives of the Project
- 6 technical objectives covering WebGL pipeline, interactive transforms, order-independent CSG booleans, 12-edge parametric fillets, studio PBR shading/SSAO, and non-destructive Zustand state history.

### 6. System Architecture
- 4-tier modular pipeline: Presentation UI Layer ➡️ Application State Layer (Zustand) ➡️ 3D Geometry/CSG Engine (WebGL/R3F) ➡️ Database & Asset Storage Layer.

### 7. Methodology
- Agile iterative workflow: Environment Setup ➡️ Primitive Generation ➡️ BVH-Accelerated CSG Engine ➡️ Studio Shading & SSAO ➡️ State & Edit Suite ➡️ Vercel Deployment ➡️ Backend Cloud Integration.

### 8. Domain Knowledge, Technology & Tools
- WebGL 2.0, Three.js, React Three Fiber, Zustand, `three-bvh-csg`, Vite, Tailwind CSS, Git/GitHub, Vercel CDN.

---

## 3. Recommended 10-Slide PPT Presentation Structure

- **Slide 1: Title Slide**  
  Project Title, Team Member Names & Roles, Guide Name, Department.
- **Slide 2: Problem Statement & Motivation**  
  The gap between rapid ideation and professional visualization; Tinkercad vs. Blender dilemma.
- **Slide 3: Alignment with UN Sustainable Development Goals (SDGs)**  
  Highlight **SDG 9** (Industry & Innovation) and **SDG 12** (Responsible Consumption).
- **Slide 4: Literature Review & Related Work**  
  Comparative table (Tinkercad vs. Blender vs. Nomad Sculpt vs. Simple 3D) and academic citations.
- **Slide 5: Project Objectives & Scope**  
  6 crisp action-oriented objectives.
- **Slide 6: System Architecture & Workflow**  
  4-Tier Architecture Diagram and 8-step execution flow.
- **Slide 7: Technical Methodology & Implementation**  
  WebGL engine, BVH CSG booleans, 12-edge parametric fillets, procedural Lightformer lighting, Zustand state stack.
- **Slide 8: Cost, Environmental Impact & Sustainability**  
  Labor/licensing cost optimization, physical prototyping waste reduction, client-side GPU energy efficiency.
- **Slide 9: Current Progress & Live Demonstration**  
  Show screenshots/live demo of Vercel deployment (`https://simple-3d-49fyaqbmm-pranjali-vyavahares-projects.vercel.app/`).
- **Slide 10: Proposed Roadmap & Future Work**  
  Full-Stack Backend (User Auth + Cloud Save), Public Showcase Gallery, GLTF/OBJ File Export, Multi-User Collaboration.

---
