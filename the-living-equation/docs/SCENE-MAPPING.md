# Mathematical-to-visual mapping

The DOM theorem definition is the source of truth. Each scene receives bounded values and derives visual parameters; the Three.js renderer never decides what a theorem means.

## Fibonacci and the Golden Ratio — complete slice

| Mathematical value | Bounded input | Visual derivative | Meaning in the field |
| --- | --- | --- | --- |
| Ratio `r` | `1.4..1.8` | `phi`, `ratioBias`, `growth`, `motionSpeed` | Changes the proportional growth law. `r = 1.618...` is the limiting Golden Ratio. |
| Terms `n` | `8..20` | `sequenceLength`, `squareCount`, `particleCount` | Reveals more recurrence steps as squares, arcs, nodes, guides, and construction-bound dust. |
| Turns `θ` | `1.8..3.4` | `spiralTurns`, `frequency`, `cameraDrift` | Changes the visible sweep of the hero spiral and the arc sweep, not the theorem itself. |
| Fixed seed `3141` | not user-editable | `seed` | Keeps the same parameters reproducible across sessions and exports. |

The shared geometry model builds Fibonacci square side lengths, places each new square around the previous bounding rectangle, draws a quarter-arc in each square, and generates a seeded paired-lobe particle field with filaments and ribbons. At `r = φ`, the side lengths are exact Fibonacci proportions and the field uses the reference growth law; nearby ratios intentionally bias successive layers for exploration. The Three.js, SVG fallback, and vertical export consume that same geometry model. The renderer does not claim that a natural spiral is automatically golden; the explanation names this as a model.

The particle organism is an interpretive visual derivative, not a second proof: `ratio` controls the growth scale, `terms` controls field layers and density, and `turns` controls flow frequency. The faint squares, arcs, and nodes are the bridge back to the recurrence; the bright point field is the intuitive, evolving view.

## Other atlas scenes

| Scene | Inputs | Visual mapping | Current limitation |
| --- | --- | --- | --- |
| Pythagorean | `a`, `b` | Right-triangle legs and the diagonal update together. | Flat Euclidean geometry only. |
| Wave Interference | amplitude, frequency, phase | The resultant is the pointwise sum of sinusoidal displacements. | Ideal waves; no boundaries or damping. |
| Fourier Decomposition | component count, amplitude | More harmonics add detail to a finite sum. | A small educational finite sum, not every Fourier transform case. |
| Gravity and Orbits | distance, velocity | Orbit radius and path shape respond to idealised starting conditions. | Two-body sketch; not a physical integrator. |
| Lorenz Chaos | `ρ`, `σ` | A fixed-step trajectory traces a deterministic nonlinear attractor. | Low-resolution numerical sketch, not a weather model. |

## Audio derivatives

Audio remains secondary and can be muted at any time. The theorem’s parameter values are mapped to bounded modulation values:

- harmonic brightness: closeness of the Fibonacci ratio to `φ`;
- pulse rate: sequence/component count;
- tonal density: sequence/component count;
- spatial width: a bounded secondary response value.

No audio value is required to understand the theorem.
