# Fibonacci Construction Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a staged Fibonacci construction animation that teaches the recurrence before revealing the procedural particle field.

**Architecture:** A local `FibonacciAnimationDirector` produces temporal frame snapshots. `ThreeScene` consumes those snapshots to reveal construction objects and shader particles; `main.ts` exposes the story caption and replay button through the DOM. The theorem store remains the source of mathematical values.

**Tech Stack:** Vite, TypeScript, vanilla Three.js, WebGL shaders, HTML/CSS, Playwright.

## Global Constraints

- Keep theorem parameters and equation text DOM-authoritative.
- Keep the visual monochrome and deterministic.
- Preserve capped device pixel ratio, fixed particle budgets, reduced motion, fallback rendering, disposal, and export behavior.
- Do not add React, React Three Fiber, WebGPU, backend services, databases, authentication, or Manim as the live renderer.

---

### Task 1: Add the observable story contract with a failing test

**Files:**
- Modify: `tests/smoke.spec.ts`

**Interfaces:**
- `#scene-story` exposes the current readable construction caption.
- `#replay-button` restarts the construction sequence.

- [ ] **Step 1: Add a test that enters Fibonacci, sees the seed caption, clicks replay, and eventually sees a later Fibonacci value.**

```ts
await expect(page.locator('#scene-story')).toContainText('F₀ = 0');
await page.getByRole('button', { name: /Replay construction/ }).click();
await expect(page.locator('#scene-story')).toContainText(/F₅ = 5|F₆ = 8/, { timeout: 9000 });
```

- [ ] **Step 2: Run the focused test and confirm it fails because the story caption and replay button do not exist.**

Run: `npm test -- --workers=1 tests/smoke.spec.ts -g "construction animation"`

Expected: FAIL because `#scene-story` is missing.

### Task 2: Implement the deterministic Fibonacci animation director

**Files:**
- Create: `src/visual/fibonacci-animation-director.ts`
- Modify: `src/visual/fibonacci-geometry.ts`

**Interfaces:**
- `FibonacciAnimationDirector.replay(termCount: number): void`
- `FibonacciAnimationDirector.update(deltaSeconds: number, paused: boolean, reducedMotion: boolean): FibonacciAnimationFrame`
- `FibonacciAnimationDirector.snapshot(): FibonacciAnimationFrame`

- [ ] **Step 1: Define the `FibonacciAnimationFrame` type and phase durations for seed, recurrence, construction, field, and hero.**
- [ ] **Step 2: Implement deterministic progression, pause behavior, reduced-motion static behavior, and a readable caption for each recurrence step.**
- [ ] **Step 3: Add a `step` field to Fibonacci field points so the shader can reveal particles in sequence order.**
- [ ] **Step 4: Run the focused test and confirm it still fails only because the DOM and Three.js integrations are not connected.**

### Task 3: Connect the director to Three.js reveal layers

**Files:**
- Modify: `src/visual/three-scene.ts`

**Interfaces:**
- Extend `ThreeScene.mount` with an optional `onStoryChange(frame: FibonacciAnimationFrame): void` callback.
- Add `ThreeScene.replayConstruction(): void`.

- [ ] **Step 1: Create one director per scene and restart it when Fibonacci parameters or theorem selection changes.**
- [ ] **Step 2: Tag construction objects with their Fibonacci step and base opacity.**
- [ ] **Step 3: Add shader uniforms for visible step, field reveal, and time; reveal field points in recurrence order.**
- [ ] **Step 4: Use `constructionReveal` and `fieldReveal` to crossfade from squares/arcs into ribbons and particles.**
- [ ] **Step 5: Freeze the director and shader uniforms for pause/reduced motion and preserve resource disposal.**
- [ ] **Step 6: Run `npm run build` and the focused test to verify the renderer integration compiles.**

### Task 4: Add readable DOM story controls

**Files:**
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Add `#scene-story` with `aria-live="polite"` inside the visual shell and a `Replay construction` toolbar button.**
- [ ] **Step 2: Pass the story callback to `ThreeScene.mount` and update only the caption/status text from the frame snapshot.**
- [ ] **Step 3: Wire Replay construction to `mainScene.replayConstruction()` without changing theorem parameters.**
- [ ] **Step 4: Style the story caption as a readable overlay that works on desktop, mobile, narrow layouts, and forced colors.**
- [ ] **Step 5: Run the focused story test and confirm it passes.**

### Task 5: Align copy, fallback, export, and verification

**Files:**
- Modify: `src/content/theorems.ts`
- Modify: `src/visual/fallback-scene.ts`
- Modify: `src/export/video-exporter.ts`
- Modify: `tests/smoke.spec.ts`
- Modify: `docs/SCENE-MAPPING.md`
- Modify: `docs/LIMITATIONS.md`

- [ ] **Step 1: Update Fibonacci copy so it explains recurrence and field generation rather than implying the spiral alone is the lesson.**
- [ ] **Step 2: Make fallback and vertical export use the same staged reveal timing, with static final output when animation is unavailable.**
- [ ] **Step 3: Add reduced-motion and replay assertions to the smoke suite.**
- [ ] **Step 4: Run `npm run build` and `npm test -- --workers=1`.**
- [ ] **Step 5: Inspect desktop, mobile portrait, narrow mobile, reduced-motion, and live replay in the browser; record any limitation honestly.**
