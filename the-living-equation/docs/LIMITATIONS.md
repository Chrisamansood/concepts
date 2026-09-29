# Known limitations

This is an educational MVP, not a scientific or production video system.

- WebGL is required for the live 3D field. When it is unavailable, the DOM lesson remains and a static SVG fallback is shown.
- Quality profiles are fixed (`high`, `medium`, `low`) and selected automatically from viewport and save-data hints. There is no measured adaptive-quality controller.
- The first audio implementation is a quiet Web Audio synthesis layer rather than a supplied composed music track. It starts only after an explicit user action, and it is not required for comprehension.
- Video export is WebM through `MediaRecorder` where the browser exposes a compatible codec. Export audio is not embedded in this MVP; the export control reports that limitation.
- Export uses a deterministic 1080×1920 canvas and the current theorem values. The Fibonacci export, SVG fallback, and Three.js adapter share the seeded particle field, filaments, ribbons, and construction geometry, while the live adapter adds GPU point shading and camera depth.
- The Fibonacci particle organism is an interpretive visual model of recurrence and proportional growth. It should be read alongside the DOM equation and explanation, not as a literal geometric proof of the Golden Ratio.
- The staged construction is deterministic and mathematically motivated, but its timing and visual reveal are authored pedagogy rather than a formal animation of an algebraic proof. The current vertical export still uses the existing deterministic canvas path and does not yet reproduce every live director phase.
- Mobile, reduced-motion, fallback, keyboard, and narrow-layout checks are covered by the local Playwright suite. Browser coverage is currently Chromium-based; Safari/WebKit has not been installed in this environment.
- The atlas contains all six requested theorem definitions, but only the Fibonacci field has the full visual treatment and verification depth of the first slice. The other scenes are deliberately simpler educational sketches.
- External font loading is optional presentation polish; if the font request is blocked, the system serif/monospace fallbacks remain readable.
