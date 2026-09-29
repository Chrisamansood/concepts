# The Living Equation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a small, accessible, browser-native mathematical observatory where a student changes a theorem parameter, sees a truthful monochrome visual response, hears an optional subtle response, and can export a reproducible vertical study clip.

**Architecture:** A DOM-owned application state holds the selected theorem, bounded parameters, playback, audio, quality, and reduced-sensory settings. The theorem registry provides content and a scene definition; pure derivation functions turn state into bounded visual/audio derivatives; focused renderers consume those derivatives. Three.js owns only the visual field and is disposable, while equation, explanation, controls, status, and export metadata remain semantic DOM.

**Tech Stack:** Vite, TypeScript, vanilla Three.js, semantic HTML, CSS, Web Audio API, MediaRecorder, Playwright browser checks.

## Global Constraints

- Start from scratch in `the-living-equation/`; do not modify unrelated workspace projects.
- Keep theorem content, visual scene renderer, parameter state, equation renderer, explanation renderer, audio modulation, video export, and fallback/accessibility as separate modules.
- DOM state is authoritative; renderers receive bounded parameter values and visual derivatives.
- Use no React, React Three Fiber, backend, database, authentication, WebGPU, Manim live rendering, copyrighted music, or narration.
- First complete theorem is Fibonacci and the Golden Ratio; the first visual field is monochrome and procedural.
- Cap device pixel ratio, support mobile quality, fixed particle budgets, resize, WebGL failure fallback, reduced motion, keyboard sliders, readable DOM equations, semantic labels, loading state, disposal, and no animation leaks.
- Do not autoplay audio; audio begins only from the explicit entry action and remains optional.
- Export vertical 9:16 WebM where supported, using deterministic theorem state and parameters.
- Do not claim browser or accessibility coverage without fresh browser evidence.

---

### Task 1: Scaffold the isolated app and test harness

**Files:**
- Create: `package.json`, `index.html`, `tsconfig.json`, `vite.config.ts`
- Create: `src/main.ts`, `src/styles.css`
- Create: `tests/smoke.spec.ts`
- Create: `docs/SCENE-MAPPING.md`, `docs/LIMITATIONS.md`

**Interfaces:**
- Produces a Vite dev server at `/` and a stable semantic shell with `#app`, `#visual-field`, `#equation`, `#explanation`, and control regions.
- Produces a Playwright entry point that can later run against the Vite server.

- [ ] Create the minimal package scripts and dependencies for Vite, TypeScript, Three.js, and Playwright.
- [ ] Create the semantic HTML shell with a loading state, skip link, main landmark, theorem navigation, canvas wrapper, DOM content region, and fallback region.
- [ ] Add a no-JS-readable skeleton and restrained monochrome CSS tokens; include explicit mobile and narrow-mobile layout rules.
- [ ] Add the first smoke test for title, landmarks, and loading-to-ready transition.
- [ ] Run `npm install` and `npm run build`.

### Task 2: Add the data/state and DOM renderer boundaries

**Files:**
- Create: `src/types.ts`, `src/content/theorems.ts`, `src/state/store.ts`
- Create: `src/renderers/equation-renderer.ts`, `src/renderers/explanation-renderer.ts`, `src/renderers/controls-renderer.ts`
- Modify: `src/main.ts`

**Interfaces:**
- `TheoremDefinition` contains id, title, question, equation, parameters, explanation, limitations, and a `deriveVisuals(parameters, quality)` function.
- `AppState` contains `selectedTheoremId`, bounded parameter values, paused, entered, audio settings, reducedSensory, qualityMode, and export state.
- `subscribe(listener)` emits immutable snapshots; DOM renderers never mutate scene internals.

- [ ] Define Fibonacci/Golden Ratio content with explicit symbols, assumptions, change explanation, and deeper context.
- [ ] Define the five remaining atlas entries as data-backed content with truthful parameters and an explicit “visual treatment” limitation until their dedicated scenes exist.
- [ ] Implement clamping, reset, selection, and subscription without framework state.
- [ ] Render equation, variables, explanation, and limitations into semantic DOM nodes.
- [ ] Make every range input keyboard accessible with label, value text, min/max/step, and `aria-valuetext`.

### Task 3: Build the Fibonacci/Golden Ratio scene and visual derivatives

**Files:**
- Create: `src/visual/derivatives.ts`, `src/visual/quality.ts`
- Create: `src/visual/three-scene.ts`, `src/visual/fallback-scene.ts`
- Modify: `src/main.ts`, `src/styles.css`

**Interfaces:**
- `VisualDerivatives` contains bounded `phi`, `sequenceLength`, `growth`, `lineWidth`, `particleCount`, `motionSpeed`, `cameraDrift`, and deterministic seed.
- `ThreeScene.mount(container, onReady, onError)`, `.update(derivatives, runtime)`, `.setPaused(paused)`, `.dispose()`.
- `FallbackScene.render(derivatives)` creates a DOM/SVG-readable static representation when WebGL is unavailable.

- [ ] Implement a deterministic golden spiral whose radius uses `r(theta) = scale * exp(growth * theta)` and whose turns/particle positions are derived from the Fibonacci sequence and bounded `phi` deviation.
- [ ] Use fixed particle budgets for high/medium/low/mobile quality and cap DPR at 2, with lower caps for mobile/slow mode.
- [ ] Add ResizeObserver sizing, subtle pointer influence, reduced-motion still-frame behavior, and complete resource/RAF/listener disposal.
- [ ] Detect WebGL failure and route to the fallback without hiding the theorem explanation.
- [ ] Keep the first field monochrome: near-black background with white/silver/grey geometry only.
- [ ] Verify the first scene manually in the browser before adding audio/export.

### Task 4: Add audio modulation as a secondary, explicit layer

**Files:**
- Create: `src/audio/audio-modulator.ts`
- Modify: `src/state/store.ts`, `src/renderers/controls-renderer.ts`, `src/main.ts`, `src/styles.css`

**Interfaces:**
- `AudioModulator.start()`, `.update(AudioDerivatives)`, `.setMuted(boolean)`, `.setVolume(number)`, `.setResponsive(boolean)`, `.setReducedSensory(boolean)`, `.dispose()`.
- `AudioDerivatives` contains bounded harmonic brightness, pulse rate, spatial width, and tonal density derived from theorem parameters.

- [ ] Start the Web Audio graph only from the explicit “Enter the observatory” action.
- [ ] Implement a quiet oscillator/noise-bed texture with gain limits, mute, volume, responsive-intensity, and reduced-sensory controls.
- [ ] Ensure all educational information is present with audio disabled and never autoplay audio on page load.
- [ ] Close the audio context and disconnect nodes on disposal.

### Task 5: Add deterministic vertical video export

**Files:**
- Create: `src/export/video-exporter.ts`, `src/export/export-overlay.ts`
- Modify: `src/state/store.ts`, `src/renderers/controls-renderer.ts`, `src/main.ts`, `src/styles.css`
- Modify: `docs/LIMITATIONS.md`

**Interfaces:**
- `exportStudyClip({ theorem, state, durationMs, includeAudio }): Promise<ExportResult>`.
- `ExportResult` is `{ status: 'downloaded' | 'unsupported' | 'failed'; filename?: string; message: string }`.

- [ ] Render a 1080x1920 offscreen export canvas or supported scaled canvas with the same seed and state as the live scene.
- [ ] Overlay title, equation, current values, short explanation, and final insight in readable DOM-independent export graphics.
- [ ] Record WebM via MediaRecorder where available; provide a clear unsupported message otherwise.
- [ ] Keep duration bounded to 10–20 seconds and avoid export-time state mutation.
- [ ] Document codec, browser, audio, and resolution limitations honestly.

### Task 6: Complete atlas scenes one at a time

**Files:**
- Modify: `src/content/theorems.ts`, `src/visual/three-scene.ts`, `src/visual/derivatives.ts`
- Create as needed: `src/content/<theorem>.ts`, `src/visual/<theorem>-scene.ts`
- Modify: `docs/SCENE-MAPPING.md`, `docs/LIMITATIONS.md`

- [ ] Add Pythagorean geometry with side-length controls and a truthful right-triangle area mapping.
- [ ] Add Wave Interference with amplitude/frequency/phase controls and a superposition mapping.
- [ ] Add Fourier Decomposition with bounded component count/frequency/amplitude and a sum-of-waves mapping.
- [ ] Add Gravity and Orbits with mass/distance/velocity controls and an orbit-stability mapping; label idealized assumptions.
- [ ] Add Lorenz Chaos with sigma/rho/beta controls and a bounded trajectory mapping; label sensitivity and numerical limitations.
- [ ] Keep all theorem content DOM-visible and reuse the same state, accessibility, fallback, and disposal contracts.

### Task 7: Run the acceptance matrix and report evidence

**Files:**
- Modify: `tests/smoke.spec.ts` or create focused Playwright specs under `tests/`
- Modify: `docs/LIMITATIONS.md`

- [ ] Run `npm run build` and any unit/type checks.
- [ ] Run Playwright checks at desktop, mobile portrait, and narrow mobile widths.
- [ ] Verify keyboard-only slider changes update equation, value text, explanation, and visual state.
- [ ] Verify reduced-motion, muted audio, slow-device mode, WebGL failure fallback, resize, reset, pause, and route/unmount disposal behavior.
- [ ] Verify export support or unsupported messaging in the real browser.
- [ ] Record browser, viewport, DPR, quality mode, console errors, and any unverified behavior.

