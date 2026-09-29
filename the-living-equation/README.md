# The Living Equation

An accessible, monochrome mathematical observatory built with Vite, TypeScript, vanilla Three.js, semantic HTML, and CSS.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Verify

```bash
npm run build
npm test -- --workers=1
```

The browser checks cover desktop, portrait mobile, 360px narrow mobile, reduced motion, keyboard sliders, forced WebGL fallback, and theorem selection. Add `?quality=low` to exercise the slow-device profile or `?forceFallback=1` to exercise the SVG fallback.

The first complete slice is Fibonacci and the Golden Ratio. The atlas also contains five data-backed theorem sketches. See `docs/SCENE-MAPPING.md`, `docs/EDUCATIONAL-SEQUENCE.md`, and `docs/LIMITATIONS.md` for the truthfulness boundaries and current export/audio limitations.
