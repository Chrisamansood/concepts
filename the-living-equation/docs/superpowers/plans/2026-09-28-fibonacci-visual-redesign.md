# Fibonacci Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a layered, truthful Fibonacci/Golden Ratio construction for the live Three.js scene, SVG fallback, and vertical export.

**Architecture:** A pure geometry model converts bounded Fibonacci visual derivatives into normalized squares, quarter-arcs, nodes, guides, and dust. Three rendering adapters consume that model for WebGL, SVG, and 2D export; the existing DOM store, equation, explanation, audio, and quality layers remain authoritative and unchanged.

**Tech Stack:** Vite, TypeScript, vanilla Three.js, SVG, Canvas 2D, Playwright.

## Global Constraints

- Preserve the existing theorem/state/renderer separation and DOM-authoritative controls.
- Keep the first field monochrome, procedural, explainable, and asset-free.
- Cap device pixel ratio and particle counts; preserve mobile quality modes and reduced-motion behavior.
- Do not add React, React Three Fiber, a backend, a database, authentication, WebGPU, Manim, or a post-processing dependency.
- Keep essential equation and explanation content in readable DOM.

---

### Task 1: Add the shared Fibonacci geometry model

**Files:**
- Create: `src/visual/fibonacci-geometry.ts`
- Modify: `src/types.ts`
- Modify: `src/visual/derivatives.ts`

**Interfaces:**
- `buildFibonacciGeometry(derivatives: VisualDerivatives, budget: number): FibonacciGeometry`
- `FibonacciGeometry` contains `squares`, `arcs`, `nodes`, `guides`, and `dust` arrays with normalized x/y/z coordinates.

- [ ] **Step 1: Define the shared geometry types and deterministic Fibonacci builders.**
- [ ] **Step 2: Generate exact Fibonacci side lengths at φ and apply a bounded ratio bias around φ.**
- [ ] **Step 3: Generate square corners, quarter-arcs, join nodes, center guide rays, and dust near the construction.**
- [ ] **Step 4: Extend Fibonacci derivatives with bounded geometry fields while preserving existing consumers.**
- [ ] **Step 5: Run `npm run build` and confirm TypeScript accepts the model.**

### Task 2: Replace the Three.js line field with the mathematical sculpture

**Files:**
- Modify: `src/visual/three-scene.ts`

**Interfaces:**
- The existing `ThreeScene.update()` and `ThreeScene.mount()` contracts remain unchanged.

- [ ] **Step 1: Add layered line materials, transparent glow duplicates, low-segment sequence nodes, and bounded soft point particles.**
- [ ] **Step 2: Render squares, arcs, nodes, guides, and dust from `buildFibonacciGeometry()` for Fibonacci scenes.**
- [ ] **Step 3: Preserve the existing generic scene builders for the other theorem placeholders.**
- [ ] **Step 4: Add subtle depth/parallax motion without changing the reduced-motion contract.**
- [ ] **Step 5: Dispose every created geometry and material through the existing group disposal path.**

### Task 3: Make fallback and export share the same composition

**Files:**
- Modify: `src/visual/fallback-scene.ts`
- Modify: `src/export/video-exporter.ts`

- [ ] **Step 1: Render nested squares, arcs, nodes, guides, and dust in the fallback SVG.**
- [ ] **Step 2: Extract a Canvas 2D Fibonacci drawing helper from the same geometry model.**
- [ ] **Step 3: Replace the old export-only spiral with the layered construction and keep the 9:16 educational overlay.**
- [ ] **Step 4: Keep export deterministic for the same theorem parameters and seed.**

### Task 4: Verify live behavior and visual quality

**Files:**
- Modify: `tests/smoke.spec.ts`
- Modify: `docs/LIMITATIONS.md`
- Modify: `docs/SCENE-MAPPING.md`

- [ ] **Step 1: Add DOM assertions that ratio, terms, and turns remain readable and update.**
- [ ] **Step 2: Add a fallback assertion for the new SVG construction elements.**
- [ ] **Step 3: Run `npm run build` and `npm test -- --workers=1`.**
- [ ] **Step 4: Use the running browser to inspect desktop, narrow mobile, reduced motion, and fallback screenshots.**
- [ ] **Step 5: Record any remaining browser/export limitations honestly.**
