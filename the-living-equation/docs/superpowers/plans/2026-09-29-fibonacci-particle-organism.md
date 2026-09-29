# Fibonacci Particle Organism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current line-dominated Fibonacci scene with a deterministic monochrome particle organism shared by the live renderer, fallback, and vertical export.

**Architecture:** Extend the existing bounded Fibonacci derivatives with a pure particle-field model. Three.js renders the model with GPU points, filaments, ribbons, and a dim construction layer; SVG and Canvas 2D render the same samples with simpler primitives. DOM state, equation text, explanation text, audio modulation, and export controls remain unchanged.

**Tech Stack:** Vite, TypeScript, vanilla Three.js, SVG, Canvas 2D, Playwright.

## Global Constraints

- Preserve DOM-authoritative theorem parameters and renderer boundaries.
- Keep the field monochrome, procedural, deterministic, and original.
- Cap device pixel ratio and particle budgets; preserve mobile quality modes and reduced motion.
- Do not add React, React Three Fiber, WebGPU, Manim, a backend, a database, authentication, or post-processing dependencies.
- Keep essential equation and explanation content in readable DOM.

---

### Task 1: Lock the observable fallback contract with a failing test

**Files:**
- Modify: `tests/smoke.spec.ts`

**Interfaces:**
- The forced fallback will expose `svg [data-layer="field"] circle` elements for the particle field.

- [ ] **Step 1: Add an assertion that the fallback contains a bounded particle field.**

```ts
await expect(page.locator('#fallback-scene svg [data-layer="field"] circle')).toHaveCount(180);
```

- [ ] **Step 2: Run the focused test and confirm it fails because the field layer does not exist yet.**

Run: `npm test -- --workers=1 tests/smoke.spec.ts -g "forced WebGL fallback"`

Expected: FAIL because the current fallback has no `data-layer="field"` circles.

### Task 2: Build the shared Fibonacci particle field

**Files:**
- Modify: `src/types.ts`
- Modify: `src/visual/derivatives.ts`
- Modify: `src/visual/fibonacci-geometry.ts`

**Interfaces:**
- `buildFibonacciGeometry(derivatives: VisualDerivatives, budget: number): FibonacciGeometry`
- `FibonacciGeometry.field` is a deterministic array of normalized points with `x`, `y`, `z`, `alpha`, and `size`.
- `FibonacciGeometry.filaments` is an array of short point pairs with `alpha`.
- Existing `squares`, `arcs`, `nodes`, `guides`, and `dust` remain available for the educational construction layer.

- [ ] **Step 1: Add bounded derivative fields `fieldLayers` and `flowFrequency` to `VisualDerivatives`.**
- [ ] **Step 2: Derive them from clamped ratio, terms, and turns without reading DOM state in the renderer.**
- [ ] **Step 3: Generate a fixed-count seeded sample field using Fibonacci-scaled bands, paired lobes, angular flow, and the time-independent base phase.**
- [ ] **Step 4: Generate short deterministic neighbouring filaments and retain the existing construction geometry.**
- [ ] **Step 5: Run `npm run build` and the focused fallback test; confirm TypeScript and the new contract compile, with the field test still failing only until the fallback consumes it.**

### Task 3: Render the organism in Three.js

**Files:**
- Modify: `src/visual/three-scene.ts`

**Interfaces:**
- `ThreeScene.mount`, `ThreeScene.update`, and `ThreeScene.dispose` remain unchanged.
- `buildFibonacciSculpture` consumes only `VisualDerivatives` and the quality budget.

- [ ] **Step 1: Add GPU `Points` for the field using a fixed Float32 position buffer and monochrome point material.**
- [ ] **Step 2: Add bounded filament lines and translucent ribbon bands derived from the same field samples.**
- [ ] **Step 3: Move the Fibonacci squares/arcs/nodes behind the organism with lower opacity so they explain rather than dominate.**
- [ ] **Step 4: Animate breathing and flow phase in the render loop while preserving paused and reduced-motion behavior.**
- [ ] **Step 5: Include all new geometries and materials in the existing disposal path.**

### Task 4: Share the field with fallback and export

**Files:**
- Modify: `src/visual/fallback-scene.ts`
- Modify: `src/export/video-exporter.ts`

**Interfaces:**
- Both adapters call `buildFibonacciGeometry` and use `geometry.field` / `geometry.filaments` for the organism layer.

- [ ] **Step 1: Render 180 field circles, filaments, and ribbons in the SVG fallback with construction layers beneath them.**
- [ ] **Step 2: Render the same deterministic field samples in Canvas 2D for the 1080×1920 export.**
- [ ] **Step 3: Use export progress as the field phase while preserving the theorem overlay and reproducible seed.**
- [ ] **Step 4: Run the focused fallback test and confirm it passes.**

### Task 5: Verify interaction, visual shape, and responsive behavior

**Files:**
- Modify: `tests/smoke.spec.ts`
- Modify: `docs/SCENE-MAPPING.md`
- Modify: `docs/LIMITATIONS.md`

- [ ] **Step 1: Assert ratio, terms, and turns still update readable DOM values with keyboard input.**
- [ ] **Step 2: Run `npm run build`.**
- [ ] **Step 3: Run `npm test -- --workers=1`.**
- [ ] **Step 4: Inspect the running app in desktop, narrow mobile, reduced-motion, and forced-fallback states.**
- [ ] **Step 5: Record the actual verified browser coverage and remaining export limitations.**
