# Fibonacci / Golden Ratio explanation sequence

This sequence is the authored teaching spine for the live lesson and the vertical export. The live Fibonacci slice now has an explicit construction director so the learner sees the rule become geometry before the field resolves into its hero state.

## Live construction director

- `seed` — show `F₀ = 0 · F₁ = 1`.
- `recurrence` — reveal one equation at a time, such as `F₃ = F₂ + F₁ = 2`.
- `construction` — reveal the corresponding square, quarter-arc, node, guide, and seeded dust layers.
- `field` — reveal the particle organism, filaments, ribbons, and proportional trace.
- `hero` — hold the complete field with `φ ≈ 1.618 · proportional growth`.

The caption is DOM text with `aria-live="polite"`; the canvas is not the only place where the explanation exists. Reduced-motion mode skips directly to the static hero state.

## Scene 1 — The question

- Show: a single quiet spiral field and the question “How can a simple recurrence make a proportion appear?”
- Learner action: enter the observatory; no sound starts without that action.
- Purpose: create curiosity before introducing the symbol `φ`.

## Scene 2 — The local rule

- Show: `Fₙ = Fₙ₋₁ + Fₙ₋₂` in the DOM and a short visible sequence.
- Say in the explanation: each new term is the sum of the two previous terms.
- Purpose: keep the rule concrete before naming the limit.

## Scene 3 — The ratio

- Show: `Fₙ₊₁ / Fₙ` approaching `φ ≈ 1.6180339887`.
- Learner action: move the ratio slider and compare nearby growth laws.
- Purpose: make the visual derivative truthful: the spiral changes because its growth parameter changes.

## Scene 4 — The stable proportion

- Show: the spiral with more terms and a restrained camera drift.
- Explain: the ratio approaches the Golden Ratio; finite sequence values are approximations, not exact equality.
- Purpose: land the “limit” idea without claiming every natural spiral is golden.

## Scene 5 — The insight frame

- Export overlay: title, equation, current values, and “At φ, each turn grows by the same proportion. The spiral changes scale, but not its underlying relationship.”
- Purpose: give the learner a saveable summary that still makes sense with sound muted.

The browser implementation uses Three.js for the live field and Canvas 2D for export framing. Manim is intentionally not used as the live browser renderer; this document is the authored explanation plan the browser implementation follows.
