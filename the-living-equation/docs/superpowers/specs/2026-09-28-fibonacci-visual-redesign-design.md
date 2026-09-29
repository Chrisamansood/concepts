# Fibonacci Visual Redesign

## Goal

Replace the current single-curve Fibonacci field with a layered, monochrome mathematical construction that makes the relationship between Fibonacci terms, nested squares, quarter-arcs, and the Golden Spiral visible at a glance.

## Design

The Fibonacci scene is a mathematical sculpture rather than a decorative curve:

- Nested construction squares represent the Fibonacci sequence. Their side lengths are generated from the Fibonacci recurrence and normalized into the scene.
- A quarter-arc is drawn inside each square. The arcs connect into one continuous Golden Spiral when the ratio is φ; moving the ratio explores controlled growth around that exact relationship.
- Bright sequence nodes sit at the square/arc joins. Faint guide rays and inner construction marks show how the layers are related without competing with the main spiral.
- The scene has three depth bands: bright foreground construction, medium spiral and nodes, and dim procedural dust placed near the construction geometry. Nothing is an arbitrary star field.
- Motion is slow and purposeful: the construction rotates as one object, depth layers drift slightly, and pointer movement produces restrained parallax. Reduced motion freezes the composition.
- The visual remains monochrome: warm white, silver, graphite, and near-black. Glow is simulated with transparent duplicate strokes and soft point shaders, not a large post-processing stack.

## State and mapping

The existing DOM-authoritative parameter store remains unchanged. `fibonacciDerivatives` will expose bounded visual derivatives for the construction:

- `ratio` controls the geometric growth bias. At φ, the normalized square sequence is exact Fibonacci; nearby values visibly open or tighten the spiral.
- `terms` controls the number of square, arc, node, and guide layers.
- `turns` controls the arc sweep and the amount of spiral revealed.

The renderer receives only derivatives and a quality profile. It owns no slider state and does not read DOM controls.

## Shared composition

A pure Fibonacci geometry model will be shared by:

- the Three.js live renderer;
- the SVG fallback renderer;
- the 2D vertical export renderer.

This keeps the downloadable clip visually faithful to the live observatory and makes the mapping testable without WebGL.

## Performance and accessibility

- Keep the existing device-pixel-ratio cap, quality profiles, fixed particle budgets, resize observer, visibility pause, and disposal behavior.
- Keep sequence meaning in the DOM equation and explanation; the canvas is not the sole source of information.
- Use a bounded point budget and low-segment node geometry. Do not add textures, external assets, bloom dependencies, or a second rendering engine.
- Preserve the SVG fallback and improve it with the same construction model.
- Preserve `prefers-reduced-motion`, muted audio defaults, keyboard sliders, and export status text.

## Acceptance criteria

1. At default settings, the scene visibly contains nested squares, connected quarter-arcs, sequence nodes, guide structure, depth separation, and a restrained glow.
2. Ratio, terms, and turns each cause a visible and explainable change in that construction.
3. The fallback shows the same construction in static SVG.
4. The vertical export uses the same construction—not the old standalone spiral.
5. Existing build and Playwright smoke tests pass, and browser screenshots show a stronger result at desktop and narrow mobile sizes.

## Known boundary

The reference X clip is treated as visual direction rather than a source asset. The implementation will not copy its imagery or use copyrighted media.
