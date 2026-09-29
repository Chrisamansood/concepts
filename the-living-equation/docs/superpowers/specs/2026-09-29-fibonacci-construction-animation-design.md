# Fibonacci Construction Animation Design

## Goal

Make the Fibonacci lesson understandable and visually compelling by showing the sequence being generated before transforming it into the procedural particle artwork.

## Experience

When the learner enters Fibonacci or presses Replay construction, the field follows a short deterministic story:

1. `F₀ = 0` and `F₁ = 1` appear as the seed.
2. Each recurrence step appears as `Fₙ = Fₙ₋₁ + Fₙ₋₂` with the next value.
3. The corresponding Fibonacci square and arc draw themselves into the scene.
4. The construction expands through the default terms.
5. The completed construction dissolves into the living particle field and settles into the hero state.

The visible DOM story caption is ordinary text and remains available to screen readers. The canvas supplies spatial intuition; it does not carry the explanation alone.

## Architecture

`FibonacciAnimationDirector` is a small renderer-side timeline that owns only temporal presentation state. It receives bounded theorem derivatives from `ThreeScene`, never reads sliders or decides mathematical values, and emits a compact frame snapshot:

```ts
interface FibonacciAnimationFrame {
  phase: 'seed' | 'recurrence' | 'construction' | 'field' | 'hero';
  visibleStep: number;
  fieldReveal: number;
  constructionReveal: number;
  label: string;
}
```

The Three.js scene uses the snapshot to reveal construction objects by sequence step, animate a shader reveal for the field, and fade in the ribbons. A callback updates the DOM story caption only when the caption changes. Parameter changes replay a short morph/reveal; the mathematical state still comes from the store.

## Controls and accessibility

- Add a keyboard-accessible `Replay construction` button beside Pause and Reset.
- Add a readable `scene-story` status inside the visual field with `aria-live="polite"`.
- Reduced motion skips the timeline and shows the fully constructed static hero field.
- Pause freezes both the director and the shader time.
- The timeline is deterministic for the same theorem parameters and seed, making export reproducible.

## Visual direction

The construction layer is temporarily legible during the build, then becomes ghosted. The final hero uses the existing monochrome particle field, filaments, and ribbons. The field is no longer the first thing shown; it is the earned result of the recurrence.

## Acceptance criteria

1. On entry, the DOM story visibly moves from the seed to at least `F₅ = 5` before the hero state.
2. Replay construction restarts the same sequence without changing theorem values.
3. The scene visibly reveals construction objects by sequence step rather than showing every object immediately.
4. Parameter changes trigger a fresh, bounded reveal and update the readable equation/controls.
5. Reduced motion shows the complete field without running the timeline.
6. Desktop, mobile, narrow mobile, keyboard, fallback, build, and existing accessibility checks remain passing.
