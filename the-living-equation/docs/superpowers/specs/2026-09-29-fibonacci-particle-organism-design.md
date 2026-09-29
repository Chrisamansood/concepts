# Fibonacci Particle Organism Design

## Goal

Make the first Living Equation scene feel like a beautiful generative mathematical artwork while keeping the Fibonacci / Golden Ratio explanation truthful, readable, and reproducible.

## Approved direction

The Fibonacci scene will use a monochrome, black-field particle organism. A deterministic bounded point field is shaped by Fibonacci growth and the Golden Ratio, then rendered as layered particles, short trails, translucent organic ribbons, and a faint Fibonacci construction overlay. The visual will evolve continuously in time instead of only rotating a fixed spiral.

The current DOM equation, explanation, slider labels, audio controls, fallback, and export contracts remain authoritative. The canvas is an intuitive visual proof, not the only place where meaning is communicated.

## Mathematical mapping

| DOM value | Bounded derivative | Visual meaning |
| --- | --- | --- |
| `ratio` | `phi`, `ratioBias`, `growth` | Sets the radial growth law and the separation between the two main lobes. `1.618...` is the Golden Ratio reference. |
| `terms` | `sequenceLength`, `fieldLayers`, `particleCount` | Adds recurrence layers and increases the field's structured density. |
| `turns` | `spiralTurns`, `flowFrequency` | Sets the number of flow oscillations around the organism; it does not pretend to be a new theorem variable. |
| fixed seed | `seed` | Makes the point distribution, fallback, and export reproducible. |

The particle position function is original and deterministic. It uses Fibonacci-scaled radial bands, a paired-lobe envelope, bounded angular wobble, and a time phase. The construction squares and arcs remain as a dim reveal layer so students can connect the organic result back to the sequence.

## Rendering layers

1. `field`: fixed-budget GPU points distributed along the mathematical envelope.
2. `filaments`: short line segments joining deterministic neighbouring samples to create fine hairline texture.
3. `ribbons`: a small number of translucent curved bands that make the form read as a surface rather than noise.
4. `construction`: low-opacity Fibonacci squares, arcs, and nodes used as the explanatory scaffold.
5. `annotation`: equation and explanation remain ordinary DOM text outside the canvas.

The live Three.js renderer, SVG fallback, and 2D vertical export will call the same pure field builder. Each renderer may change primitive type, but not the mathematical positions or layer semantics.

## Motion and accessibility

The full-motion field uses continuous phase movement, slow breathing, and restrained pointer parallax. Slider changes rebuild the bounded geometry but preserve the seed, so a given state remains reproducible. Reduced motion renders a stable frame with no requestAnimationFrame loop. WebGL failure keeps the lesson available through a static SVG field. Particle budgets remain fixed by quality profile and the device pixel ratio remains capped.

## Acceptance criteria

1. Default Fibonacci shows an organic, layered monochrome form rather than a dominant single spiral line.
2. Ratio, terms, and turns visibly change the field in explainable ways.
3. The live scene, fallback, and export share the same deterministic field model.
4. The equation and explanation remain readable without inspecting the canvas.
5. Existing keyboard, reduced-motion, fallback, narrow-layout, build, and smoke checks still pass.
6. No external image, video, music, React, backend, or new rendering dependency is introduced.

## Known boundary

The X references are treated as visual direction only. The implementation will not copy their code, frames, or assets.
