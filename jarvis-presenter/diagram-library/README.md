# Jarvis Diagram Library

Drop candidate diagram images into this folder, then ask Codex to review the library and recommend which diagrams are suitable for a Jarvis demo.

## Recommended source files

- PNG, JPEG, WebP or SVG.
- Use the clean original diagram where possible, rather than a browser screenshot.
- Prefer simple diagrams with 3–8 clearly labelled objects for the first Diagram Twin demonstrations.
- Avoid confidential customer information unless the local project is an approved storage location.
- Give files descriptive names such as `customer-ai-billing-flow.png`.

## Workflow

1. Copy candidate diagrams into this folder.
2. Ask Codex: `Review the Jarvis diagram library and recommend the best Diagram Twin demo candidates.`
3. Codex will classify each diagram as:
   - **Static-ready** — suitable to present immediately as an image.
   - **Twin-ready** — simple enough to reconstruct as editable nodes and connectors.
   - **Complex/reference-only** — useful as a visual reference but too dense for the first deterministic demo.
4. Approved entries are added to `manifest.json` with names, tags and explicit voice aliases.

The library is file-based so it can be backed up and versioned. Browser storage must not be the only copy.
