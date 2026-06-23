# Matrix Terminal UI Migration — index.html

## Task for Codex

Migrate the visual style of `index.html` (the 6G BSS Launch Console) from its current **glassmorphism** aesthetic to the **matrix terminal** aesthetic used in `catalogue.html`.

The JS logic, HTML structure, page navigation, and all interactive functionality must remain **completely unchanged**. This is a CSS and typography migration only, with minor HTML attribute changes for styling hooks.

---

## Source of Truth

- **Target aesthetic:** `catalogue.html` — read this file first and internalize every visual pattern
- **File to modify:** `index.html` (~4140 lines)
- **Reference file:** `catalogue.html` (~950 lines)

Open both files before making any changes.

---

## Core Design System to Apply

### 1. CSS Variables — Replace the entire `:root` block (lines 8–44)

Remove all glassmorphism variables. Replace with:

```css
:root {
  /* ── PALETTE ── */
  --black:       #000000;
  --dark:        #050505;
  --panel:       rgba(0, 15, 5, 0.88);
  --panel-deep:  rgba(0, 8, 2, 0.92);
  --border:      rgba(0, 255, 65, 0.25);
  --border-dim:  rgba(0, 255, 65, 0.12);
  --border-hot:  #00FF41;

  /* ── GREEN SCALE ── */
  --green:       #00FF41;
  --green-dim:   #00CC33;
  --green-fade:  rgba(0, 255, 65, 0.12);
  --green-glow:  rgba(0, 255, 65, 0.35);
  --green-2:     rgba(0, 255, 65, 0.65);

  /* ── AMBER (warnings / B2A) ── */
  --warn:        #FFB800;
  --warn-dim:    rgba(255, 184, 0, 0.55);
  --warn-fade:   rgba(255, 184, 0, 0.08);

  /* ── DANGER ── */
  --danger:      #FF4444;
  --danger-dim:  rgba(255, 68, 68, 0.15);

  /* ── INFO ── */
  --info:        #00AAFF;
  --info-dim:    rgba(0, 170, 255, 0.12);

  /* ── TEXT ── */
  --text-1:      rgba(0, 255, 65, 0.95);
  --text-2:      rgba(0, 255, 65, 0.65);
  --text-3:      rgba(0, 255, 65, 0.38);

  /* ── SELECTION ── */
  --selection-bg: rgba(0, 255, 65, 0.22);

  /* ── SPACING / RADIUS ── */
  --radius-lg:   0px;   /* ZERO — terminals have sharp corners */
  --radius-md:   0px;
  --radius-sm:   0px;

  /* ── FONTS ── */
  --font-sans:   'Share Tech Mono', 'Courier New', monospace;
  --font-mono:   'Share Tech Mono', 'Courier New', monospace;
  --font-display: 'Orbitron', monospace;

  /* ── SHADOWS ── */
  --shadow-deep: 0 0 40px rgba(0, 255, 65, 0.08);

  /* ── LEGACY (keep for JS compatibility — map to new values) ── */
  --void-0:      #000000;
  --void-1:      #050505;
  --void-2:      #0a0a0a;
  --glass-1:     rgba(0, 15, 5, 0.88);
  --glass-2:     rgba(0, 255, 65, 0.05);
  --glass-3:     rgba(0, 255, 65, 0.10);
  --stroke-1:    rgba(0, 255, 65, 0.22);
  --stroke-2:    rgba(0, 255, 65, 0.40);
  --matrix-green:  #00FF41;
  --matrix-panel:  rgba(0, 15, 5, 0.88);
  --matrix-border: rgba(0, 255, 65, 0.25);
  --matrix-glow:   rgba(0, 255, 65, 0.35);

  color-scheme: dark;
  font-family: var(--font-sans);
}
```

### 2. Font Loading — Add to `<head>` before `<style>`

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap" rel="stylesheet">
```

### 3. Body — Pure black terminal background

Replace the current `body` rule with:

```css
body {
  min-height: 100%;
  margin: 0;
  color: var(--text-1);
  background: var(--black);
  overflow-x: hidden;
  font-size: 13px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

::selection {
  background: var(--selection-bg);
  color: var(--text-1);
}
```

### 4. Body pseudo-elements — Terminal overlays

Replace `body::before` and `body::after` with:

```css
/* Subtle grid — much dimmer than before */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(rgba(0, 255, 65, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 65, 0.025) 1px, transparent 1px);
  background-size: 52px 52px;
  animation: grid-drift 120s linear infinite;
}

/* CRT scan-line overlay — same as catalogue.html */
body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.08) 2px,
    rgba(0, 0, 0, 0.08) 4px
  );
}
```

### 5. Matrix rain canvas — Update colors

The `<canvas class="matrix-rain">` already exists in the HTML. Update the JS `initMatrixRain()` function to use pure `#00FF41` green instead of the current `#34e85e`:

In the `initMatrixRain` function (search for it in the JS section), change:
- Any `fillStyle` for normal characters → `'#00FF41'`
- Head characters → `'#FFFFFF'`
- Fade background → `'rgba(0, 0, 0, 0.055)'`
- Canvas opacity → `0.18` (keep existing)

Also remove the `mix-blend-mode: screen` and `mask-image` from `.matrix-rain` CSS — these were for the glassmorphism background and look wrong on pure black:

```css
.matrix-rain {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.18;
  /* REMOVE: mix-blend-mode, mask-image, -webkit-mask-image */
}
```

---

## Component Transformations

### Panel Components

Every panel that currently uses `.glass-panel`, `.dark-panel`, or `backdrop-filter: blur()` gets the terminal section treatment.

**Replace `.glass-panel` rule:**
```css
.glass-panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 0;
  /* REMOVE: backdrop-filter, -webkit-backdrop-filter */
  /* REMOVE: box-shadow with rgba(255,255,255,...) inset highlights */
  box-shadow: var(--shadow-deep);
  overflow: hidden;
}
```

**Replace `.dark-panel` rule:**
```css
.dark-panel {
  background: var(--panel-deep);
  border: 1px solid var(--border-dim);
  border-radius: 0;
  box-shadow: none;
}
```

**Remove ALL `::before` and `::after` pseudo-elements on panels** that add glass shine/reflection effects (the ones with `rgba(255,255,255,...)` gradients). The terminal aesthetic has no glass sheen. Keep only the `matrix-scan-h` animation line on the top of the command deck.

**Terminal panel border-top accent** — for key panels (`.command-deck`, `.war-panel`, `.mission-bar`), add:
```css
.command-deck,
.war-panel,
.mission-bar {
  border-top: 2px solid var(--green);
}
```

### Sidebar Rail

**Replace `.hud-rail`:**
```css
.hud-rail {
  position: sticky;
  top: 18px;
  align-self: start;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-height: calc(100vh - 36px);
  padding: 13px 8px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 0;
  /* REMOVE: backdrop-filter, box-shadow with white insets */
}
```

**Replace `.hud-mark` (the "6G" logo badge):**
```css
.hud-mark {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 6px;
  border-radius: 0;
  color: var(--black);
  background: var(--green);
  box-shadow: 0 0 20px var(--green-glow);
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 1px;
  font-size: 13px;
}
```

**Replace `.rail-button`:**
```css
.rail-button {
  position: relative;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 1px solid var(--border-dim);
  border-radius: 0;
  color: var(--text-3);
  background: transparent;
  transition: color 150ms ease, border-color 150ms ease, background 150ms ease;
}

.rail-button svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
}

.rail-button:hover {
  color: var(--text-1);
  border-color: var(--green);
  background: rgba(0, 255, 65, 0.06);
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.15);
}

.rail-button.active {
  color: var(--green);
  background: rgba(0, 255, 65, 0.08);
  border-color: var(--green);
  box-shadow: 0 0 14px var(--green-glow);
}

/* Tooltip label on hover */
.rail-button span {
  position: absolute;
  left: 58px;
  top: 50%;
  translate: 0 -50%;
  min-width: max-content;
  padding: 5px 10px;
  border-radius: 0;
  color: var(--text-1);
  background: var(--panel);
  border: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: normal;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-6px);
  transition: opacity 150ms ease, transform 150ms ease;
  z-index: 20;
}

.rail-button:hover span,
.rail-button:focus-visible span {
  opacity: 1;
  transform: translateX(0);
}

/* Active indicator dot */
.rail-button.active::after {
  content: "";
  position: absolute;
  right: 6px;
  top: 7px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 10px var(--green);
  animation: blink 2s ease-in-out infinite;
}
```

**Replace `.rail-status` (the "LIVE" badge):**
```css
.rail-status {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 0;
  border: 1px solid rgba(0, 255, 65, 0.34);
  color: var(--green);
  background: rgba(0, 255, 65, 0.06);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 1px;
  animation: breathe 3s ease-in-out infinite;
}
```

### Mission Bar (top header)

**Replace `.mission-bar`:**
```css
.mission-bar {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) auto;
  gap: 16px;
  align-items: center;
  min-height: 86px;
  padding: 18px 20px;
  border-radius: 0;
  border: 1px solid var(--border);
  border-top: 2px solid var(--green);
  background: var(--panel);
  box-shadow: 0 0 40px var(--green-glow);
}
```

**`.live-emblem` (the 6G badge in mission bar):**
```css
.live-emblem {
  flex: 0 0 auto;
  width: 52px;
  height: 52px;
  border-radius: 0;
  display: grid;
  place-items: center;
  color: var(--black);
  background: var(--green);
  box-shadow: 0 0 20px var(--green-glow);
  font-family: var(--font-display);
  font-weight: 700;
}
```

**`.mission-title h1`:** Change font to Orbitron:
```css
.mission-title h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(18px, 2vw, 26px);
  font-weight: 700;
  line-height: 1.2;
  color: var(--green);
  text-shadow: 0 0 20px var(--green-glow), 0 0 40px rgba(0,255,65,0.2);
  letter-spacing: 1px;
  text-transform: uppercase;
}
```

**`.mission-title p`:**
```css
.mission-title p {
  margin: 6px 0 0;
  color: var(--text-2);
  font-size: 11px;
  line-height: 1.5;
  letter-spacing: 0.5px;
}
```

### Chips and Buttons

**Replace `.status-chip`, `.scenario-button`, `.filter-button`, `.spec-chip`:**
```css
.status-chip,
.scenario-button,
.filter-button,
.spec-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 0;
  border: 1px solid var(--border-dim);
  color: var(--text-2);
  background: transparent;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  white-space: nowrap;
  transition: border-color 150ms, color 150ms, background 150ms;
}

.status-chip.live,
.scenario-button.active,
.filter-button.active,
.spec-chip.live {
  color: var(--green);
  background: rgba(0, 255, 65, 0.07);
  border-color: var(--green);
  box-shadow: 0 0 12px rgba(0, 255, 65, 0.15);
}

.scenario-button:hover,
.filter-button:hover {
  border-color: var(--green);
  color: var(--green);
  background: rgba(0, 255, 65, 0.05);
}
```

**Replace `.send-button`:**
```css
.send-button {
  width: 132px;
  min-height: 44px;
  border-radius: 0;
  border: 1px solid var(--green);
  color: var(--black);
  background: var(--green);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  box-shadow: 0 0 20px var(--green-glow);
  transition: background 150ms, box-shadow 150ms;
}

.send-button:hover {
  background: rgba(0, 255, 65, 0.85);
  box-shadow: 0 0 30px var(--green-glow);
  transform: none; /* remove lift */
}

.send-button:disabled {
  opacity: 0.4;
  cursor: wait;
  transform: none;
}
```

**Replace `.action-button`:**
```css
.action-button {
  min-height: 36px;
  border-radius: 0;
  border: 1px solid var(--border);
  color: var(--text-2);
  background: transparent;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: border-color 150ms, color 150ms, background 150ms;
}

.action-button:hover {
  border-color: var(--green);
  color: var(--green);
  background: rgba(0, 255, 65, 0.06);
  transform: none; /* remove lift */
}

.action-button.primary {
  border-color: var(--green);
  color: var(--black);
  background: var(--green);
  box-shadow: 0 0 16px var(--green-glow);
}

.action-button.primary:hover {
  background: rgba(0, 255, 65, 0.85);
  color: var(--black);
}

.action-button:disabled {
  opacity: 0.4;
  cursor: wait;
  transform: none;
}
```

### Command Deck (screen 1)

**Replace `.command-deck`:**
```css
.command-deck {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(300px, 0.6fr);
  gap: 1px;
  border-radius: 0;
  background: var(--border-dim); /* the 1px gap shows as border */
  border: 1px solid var(--border);
  border-top: 2px solid var(--green);
  box-shadow: 0 0 40px var(--green-glow);
}
```

**`.command-left`, `.operator-card`:**
```css
.command-left,
.operator-card {
  padding: 20px;
  background: var(--panel);
}

.operator-card {
  border-left: 1px solid var(--border-dim);
  background: var(--panel-deep);
}
```

**Replace `.command-input`:**
```css
.command-input {
  width: 100%;
  min-height: 132px;
  resize: vertical;
  border: 1px solid var(--border-dim);
  border-radius: 0;
  outline: 0;
  color: var(--green);
  background: rgba(0, 0, 0, 0.5);
  padding: 13px 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  caret-color: var(--green);
}

.command-input::placeholder {
  color: rgba(0, 255, 65, 0.2);
}

.command-input:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 1px var(--green-fade);
}
```

**`.eyebrow` labels:**
```css
.eyebrow {
  margin: 0 0 9px;
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.eyebrow::before {
  content: '// ';
  color: var(--green);
}
```

**`.panel-head h2`:**
```css
.panel-head h2 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: normal;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-2);
}

.panel-head h2::before {
  content: '// ';
  color: var(--green);
}

.panel-head p {
  margin: 5px 0 0;
  color: var(--text-3);
  font-size: 11px;
  line-height: 1.5;
}
```

**Operator stats `.mini-stat`:**
```css
.mini-stat {
  min-height: 60px;
  padding: 10px 12px;
  border-radius: 0;
  border: 1px solid var(--border-dim);
  background: rgba(0, 255, 65, 0.03);
  position: relative;
  text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.mini-stat:hover {
  border-color: var(--green);
  box-shadow: 0 0 12px var(--green-glow);
}

.mini-stat strong {
  display: block;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--green);
  text-shadow: 0 0 10px var(--green-glow);
}

.mini-stat span {
  display: block;
  margin-top: 5px;
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.5px;
}
```

**Operator name/role:**
```css
.operator-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--green);
  text-shadow: 0 0 10px var(--green-glow);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.operator-role {
  margin: 5px 0 0;
  color: var(--text-2);
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
```

**`.operator-avatar`:**
```css
.operator-avatar {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 0;
  color: var(--black);
  background: var(--green);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 0 20px var(--green-glow);
}
```

### Workflow Stepper

**`.phase-step`:**
```css
.phase-step {
  min-height: 70px;
  padding: 10px;
  border-radius: 0;
  border: 1px solid var(--border-dim);
  background: rgba(0, 255, 65, 0.02);
  color: var(--text-3);
  transition: border-color 150ms, background 150ms, color 150ms;
  text-align: left;
  cursor: pointer;
}

.phase-step:hover {
  border-color: rgba(0, 255, 65, 0.4);
  background: rgba(0, 255, 65, 0.04);
}

.phase-step.complete,
.phase-step.active {
  color: var(--text-1);
  background: rgba(0, 255, 65, 0.07);
  border-color: var(--green);
}

.phase-step.active {
  box-shadow: 0 0 14px var(--green-glow);
  animation: phase-glow 3s ease-in-out infinite;
}

.phase-step strong {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.5px;
  color: var(--green);
}

.phase-step span {
  display: block;
  margin-top: 5px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-3);
  letter-spacing: 0.5px;
}
```

### Agent War Room (screen 2)

**`.agent-chip`:**
```css
.agent-chip {
  min-height: 64px;
  padding: 9px;
  border-radius: 0;
  border: 1px solid var(--border-dim);
  color: var(--text-3);
  background: rgba(0, 255, 65, 0.02);
  transition: border-color 150ms, background 150ms, color 150ms, box-shadow 150ms;
}

.agent-chip.active {
  color: var(--text-1);
  background: rgba(0, 255, 65, 0.08);
  border-color: var(--green);
  box-shadow: 0 0 14px var(--green-glow);
}

.agent-chip strong {
  display: block;
  color: var(--green);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.agent-chip span {
  display: block;
  margin-top: 5px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-3);
  letter-spacing: 0.5px;
}
```

**`.chat-feed` (the agent conversation area):**
```css
.chat-feed {
  flex: 1;
  min-height: 520px;
  max-height: 640px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-radius: 0;
  border: 1px solid var(--border-dim);
  background: rgba(0, 0, 0, 0.4);
}

/* Scrollbar */
.chat-feed::-webkit-scrollbar { width: 5px; }
.chat-feed::-webkit-scrollbar-track { background: transparent; }
.chat-feed::-webkit-scrollbar-thumb { background: rgba(0,255,65,0.2); }
.chat-feed::-webkit-scrollbar-thumb:hover { background: rgba(0,255,65,0.4); }
```

**`.message-card`:**
```css
.message-card {
  padding: 12px;
  border-radius: 0;
  border: 1px solid var(--border-dim);
  background: rgba(0, 15, 5, 0.85);
}

.message.user .message-card {
  border-color: rgba(0, 255, 65, 0.35);
  background: rgba(0, 255, 65, 0.05);
}
```

**`.agent-avatar`:**
```css
.agent-avatar {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 0;
  color: var(--text-2);
  background: rgba(0, 255, 65, 0.06);
  border: 1px solid var(--border-dim);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.5px;
}

.message.active .agent-avatar,
.message.user .agent-avatar {
  color: var(--black);
  background: var(--green);
  border-color: var(--green);
  box-shadow: 0 0 14px var(--green-glow);
}
```

**`.message-meta`:**
```css
.message-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
```

**`.message-text`:**
```css
.message-text {
  margin: 0;
  color: var(--text-2);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.65;
}

.message-text strong {
  color: var(--green);
}
```

**`.tool-call` (inline tool call display inside messages):**
```css
.tool-call {
  margin-top: 8px;
  padding: 6px 10px;
  border-left: 3px solid var(--green);
  background: rgba(0, 255, 65, 0.04);
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(0, 255, 65, 0.7);
  letter-spacing: 0.5px;
}
```

### Plan Canvas (screen 3)

**`.plan-item` (editable plan fields):**
```css
.plan-item {
  padding: 12px 14px;
  border-radius: 0;
  border: 1px solid var(--border-dim);
  background: rgba(0, 255, 65, 0.02);
  transition: border-color 180ms, background 180ms;
  cursor: pointer;
}

.plan-item:hover {
  border-color: rgba(0, 255, 65, 0.4);
  background: rgba(0, 255, 65, 0.04);
}

.plan-item:hover::after {
  content: "✎";
  position: absolute;
  top: 8px;
  right: 10px;
  color: var(--text-3);
  font-size: 12px;
}

.plan-item.editing {
  border-color: var(--green);
  box-shadow: 0 0 0 1px var(--green-fade);
  background: rgba(0, 255, 65, 0.06);
}
```

**Inline edit inputs/selects (created by JS `beginPlanEdit`):**
```css
.plan-edit-input,
.plan-edit-select {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--green);
  outline: none;
  color: var(--green);
  font-family: var(--font-mono);
  font-size: 13px;
  caret-color: var(--green);
  padding: 2px 4px;
  width: 100%;
}
```

**`.metric-tile` (metrics panel):**
```css
.metric-tile {
  padding: 14px;
  border-radius: 0;
  border: 1px solid var(--border-dim);
  background: rgba(0, 255, 65, 0.02);
  position: relative;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.metric-tile:hover {
  border-color: var(--green);
  box-shadow: 0 0 14px var(--green-glow);
}

.metric-tile::before {
  content: attr(data-label);
  position: absolute;
  top: -1px; left: 8px;
  font-size: 9px;
  letter-spacing: 2px;
  color: var(--black);
  background: var(--green-dim);
  padding: 0 5px;
  text-transform: uppercase;
}

/* Metric value */
.metric-value {
  font-family: var(--font-display);
  font-size: clamp(18px, 2vw, 24px);
  font-weight: 700;
  color: var(--green);
  text-shadow: 0 0 12px var(--green-glow);
}

.metric-tile.metric-warn .metric-value {
  color: var(--warn);
  text-shadow: 0 0 12px var(--warn-dim);
}

.metric-tile.metric-danger .metric-value {
  color: var(--danger);
  text-shadow: 0 0 12px var(--danger-dim);
}

.metric-label {
  font-size: 10px;
  color: var(--text-3);
  letter-spacing: 0.5px;
  margin-top: 4px;
}
```

### Approval Queue (screen 4)

**`.approval-card`:**
```css
.approval-card {
  padding: 14px;
  border-radius: 0;
  border: 1px solid var(--border-dim);
  background: rgba(0, 255, 65, 0.02);
  transition: border-color 180ms, background 180ms;
}

.approval-card:hover {
  border-color: rgba(0, 255, 65, 0.35);
  background: rgba(0, 255, 65, 0.04);
}

.approval-card h3 {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: normal;
  color: var(--green);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin: 0 0 8px;
}

.approval-card h3::before {
  content: '> ';
  color: var(--green);
}
```

**Approval action buttons — `approve` / `hold` / `modify`:**
```css
.tiny-button {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 0;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.15s;
}

.tiny-button:hover { border-color: var(--green); color: var(--green); }
.tiny-button.approve { border-color: var(--green); color: var(--green); }
.tiny-button.approve:hover { background: var(--green); color: var(--black); }
.tiny-button.hold { border-color: var(--warn); color: var(--warn); }
.tiny-button.hold:hover { background: var(--warn); color: var(--black); }
.tiny-button.modify { border-color: var(--info); color: var(--info); }
```

### Tool Trace / API Sandbox (screen 5)

**`.tool-row` (each tool call row):**
```css
.tool-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-dim);
  cursor: pointer;
  transition: background 150ms;
}

.tool-row:last-child { border-bottom: none; }
.tool-row:hover { background: rgba(0, 255, 65, 0.05); }

.tool-row[data-status="ok"]    .tool-state { color: var(--green); }
.tool-row[data-status="warn"]  .tool-state { color: var(--warn); }
.tool-row[data-status="error"] .tool-state { color: var(--danger); }
```

**`.tool-icon`:**
```css
.tool-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 0;
  border: 1px solid var(--border-dim);
  background: rgba(0, 255, 65, 0.04);
  color: var(--green);
  font-family: var(--font-mono);
  font-size: 10px;
  flex-shrink: 0;
}
```

**API sandbox expanded JSON view:**
```css
.api-payload {
  border-left: 3px solid var(--green);
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.5);
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(0, 255, 65, 0.65);
  line-height: 1.7;
  white-space: pre;
  overflow-x: auto;
}

.api-payload .key   { color: var(--green); }
.api-payload .value { color: rgba(0, 255, 65, 0.55); }
.api-payload .arrow { color: var(--warn); }
```

### Architecture Map (screen 3/5)

The SVG architecture map nodes currently use glassmorphism styling applied via JS. Update the node styles:

**In JS `updateMap()` function**, change node active/done states:
- Active node: `stroke: #00FF41`, `fill: rgba(0,255,65,0.1)`, remove rounded rect radii (set `rx="0" ry="0"`)
- Done node: `stroke: #00FF41`, `fill: rgba(0,255,65,0.08)`
- Blocked node: `stroke: #FFB800`, `fill: rgba(255,184,0,0.08)`
- Inactive node: `stroke: rgba(0,255,65,0.2)`, `fill: rgba(0,255,65,0.02)`

Node text labels: `fill: #00FF41`, `font-family: 'Orbitron'`, `font-size: 9`

Flow line particles: `fill: #00FF41`, add `filter: drop-shadow(0 0 4px #00FF41)`

### Event Stream

**`.event-item`:**
```css
.event-item {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-dim);
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-2);
  display: flex;
  gap: 10px;
  align-items: flex-start;
  line-height: 1.5;
}

.event-item:last-child { border-bottom: none; }

.event-type {
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 1px 6px;
  border: 1px solid;
  flex-shrink: 0;
}

.event-type.agent   { border-color: var(--green); color: var(--green); }
.event-type.launch  { border-color: var(--warn); color: var(--warn); }
.event-type.approval { border-color: var(--info); color: var(--info); }
.event-type.system  { border-color: var(--border-dim); color: var(--text-3); }

.event-list::-webkit-scrollbar { width: 5px; }
.event-list::-webkit-scrollbar-track { background: transparent; }
.event-list::-webkit-scrollbar-thumb { background: rgba(0,255,65,0.2); }
```

### Splash Overlay and Tour

**Replace splash overlay styling:**
```css
.splash-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.92);
  border: none;
}

.splash-box {
  border: 1px solid var(--border);
  border-top: 3px solid var(--green);
  background: var(--panel);
  padding: 40px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 0 60px var(--green-glow);
}

.splash-box h2 {
  font-family: var(--font-display);
  font-size: clamp(18px, 2.5vw, 28px);
  font-weight: 700;
  color: var(--green);
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 20px var(--green-glow);
  margin: 0 0 12px;
}

.splash-box p {
  color: var(--text-2);
  font-size: 12px;
  line-height: 1.7;
  margin: 0 0 24px;
}
```

**Tour spotlight:**
```css
.tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.75);
}

.tour-tooltip {
  border: 1px solid var(--green);
  border-left: 3px solid var(--green);
  background: var(--panel);
  padding: 16px 20px;
  max-width: 320px;
  box-shadow: 0 0 30px var(--green-glow);
  font-family: var(--font-mono);
}

.tour-tooltip h3 {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: var(--green);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 8px;
}

.tour-tooltip p {
  font-size: 11px;
  color: var(--text-2);
  line-height: 1.6;
  margin: 0 0 14px;
}
```

### Glossary Tooltips

**`.glossary-tooltip`:**
```css
.glossary-tooltip {
  position: fixed;
  z-index: 50;
  border: 1px solid var(--border);
  border-left: 3px solid var(--green);
  background: var(--panel-deep);
  padding: 8px 12px;
  max-width: 280px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-2);
  line-height: 1.6;
  pointer-events: none;
  box-shadow: 0 0 20px rgba(0,0,0,0.6);
}

.glossary-tooltip strong {
  display: block;
  color: var(--green);
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
```

---

## Typography Summary

| Element | Old | New |
|---------|-----|-----|
| Body font | Inter, system-ui | Share Tech Mono, Courier New |
| Mono font | JetBrains Mono | Share Tech Mono (same as body) |
| Display / headings | Inter 700 | Orbitron 700-900 |
| `h1` (mission title) | Inter clamp(24-30px) w700 | Orbitron clamp(18-26px) w700 uppercase |
| `h2` (panel heads) | Inter 16px w600 | Share Tech Mono 11px uppercase `// ` prefix |
| `h3` (approval cards) | Inter 14px w600 | Share Tech Mono 11px uppercase `> ` prefix |
| Body text | Inter 13px | Share Tech Mono 12px |
| Mono labels | JetBrains Mono 11px | Share Tech Mono 10px |
| Metric numbers | Inter 18-26px | Orbitron 18-24px with text-shadow glow |

**Global heading override** — add this rule after the `:root` block:
```css
h1, h2, h3, h4 {
  font-family: var(--font-mono);
  font-weight: normal;
  letter-spacing: 0;
}

/* Panel section headers get // prefix via CSS content */
.panel-head h2::before,
.section-title::before {
  content: '// ';
  color: var(--green);
}
```

---

## Border Radius — Global Zero

Add this rule immediately after the `* { box-sizing }` block:

```css
/* Terminal UIs have zero border radius everywhere */
*:not(.pulse-dot):not([class*="dot"]) {
  border-radius: 0 !important;
}
```

This catches any remaining `border-radius` applied inline or through JS. The only exceptions are the blinking dot indicators (which need `50%` to remain circular).

---

## Animations to Keep (unchanged)

These animations already exist and are compatible with the terminal aesthetic — **do not modify**:

- `grid-drift` — background grid movement
- `pulse` — green dot pulse
- `breathe` — LIVE badge glow
- `phase-glow` — active phase step glow
- `matrix-scan-h` / `scan-h` — horizontal scan line on panels
- `matrix-glitch-1` / `matrix-glitch-2` — title glitch effect
- `message-in` — message slide-in animation
- `shimmer` — skeleton loading animation
- `blink` — dot blink (from catalogue.html — add if missing)

**Add these animations if missing:**
```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}
```

---

## What NOT to Change

- **All JavaScript** — zero modifications to sequences, agents, state, recalculation engine, tour, glossary, etc.
- **HTML structure** — do not add, remove, or reorder any elements
- **Panel grid layout** — `.work-grid`, `.console-shell`, `.main-stage` page switching logic
- **Data attributes** — `data-page`, `data-page-nav`, `data-scenario`, `data-affects`, `data-term`
- **SVG architecture map** — only update fill/stroke colors and font attributes, not the SVG structure
- **The catalogue.html file** — no changes needed

---

## Implementation Order

Follow this order to avoid visual inconsistency mid-migration:

1. **Add font loading** to `<head>` (2 lines)
2. **Replace `:root`** variables block
3. **Replace `body`** background rules
4. **Replace `body::before` / `body::after`**
5. **Update `.matrix-rain`** CSS and JS color values
6. **Zero all border-radius** (global rule)
7. **Replace panel CSS** (`.glass-panel`, `.dark-panel`, `backdrop-filter` removal)
8. **Replace sidebar** (`.hud-rail`, `.hud-mark`, `.rail-button`, `.rail-status`)
9. **Replace mission bar** (`.mission-bar`, `.live-emblem`, `h1`)
10. **Replace chips and buttons** (`.status-chip`, `.scenario-button`, `.send-button`, `.action-button`)
11. **Replace command deck** (`.command-deck`, `.command-input`, `.eyebrow`)
12. **Replace agent war room** (`.agent-chip`, `.chat-feed`, `.message-card`, `.agent-avatar`)
13. **Replace plan canvas** (`.plan-item`, `.metric-tile`, `.mini-stat`)
14. **Replace approval queue** (`.approval-card`, `.tiny-button`)
15. **Replace tool trace** (`.tool-row`, `.tool-icon`, `.api-payload`)
16. **Update architecture map** colors in JS
17. **Replace event stream** (`.event-item`, `.event-type`)
18. **Replace overlays** (`.splash-overlay`, `.tour-tooltip`, `.glossary-tooltip`)
19. **Typography global rule** for `h2`/`h3` `//` prefix

---

## Verification Checklist

After each step, check visually in the browser at `http://localhost:8765/index.html`:

- [ ] Body is pure black (no gradients visible)
- [ ] Matrix rain is `#00FF41` green (not teal/muted green)
- [ ] All panels have sharp corners (zero border-radius)
- [ ] No `backdrop-filter: blur()` visible (no frosted glass)
- [ ] No white/light glass gradients on panel surfaces
- [ ] Sidebar rail buttons are sharp rectangles with green active state
- [ ] "6G" logo badge is solid green on black
- [ ] Mission title uses Orbitron font, is uppercase, has green glow
- [ ] Panel headers show `// LABEL` prefix pattern
- [ ] Command textarea has green caret, green text, black background
- [ ] Send button is solid green rectangle
- [ ] Scenario pills are sharp with terminal styling
- [ ] Agent chips are sharp rectangles
- [ ] Chat messages render in Share Tech Mono
- [ ] User messages have green border tint
- [ ] Plan edit fields open with green border-bottom underline input
- [ ] Metric values use Orbitron with glow
- [ ] Approval cards are sharp rectangles
- [ ] Tool rows match terminal row style
- [ ] API payload JSON is green monospace
- [ ] Architecture map nodes show `#00FF41` borders
- [ ] Splash overlay is dark with green-bordered box
- [ ] Tour tooltips match terminal style
- [ ] Glossary tooltips have green left border
- [ ] All screens (command, draft, agent, plan, approval, monitor) look consistent
- [ ] Mobile view still functions (responsive grid intact)

---

## File Locations

```
/Users/macbook/Documents/Innovation projects /6g-bss-monetization-cockpit/
├── index.html         ← FILE TO MODIFY
├── catalogue.html     ← SOURCE OF TRUTH FOR AESTHETIC (read only)
└── MATRIX-UI-MIGRATION.md  ← this document
```

Dev server: `python3 -m http.server 8765` from the project directory.
Preview at: `http://localhost:8765/index.html`
