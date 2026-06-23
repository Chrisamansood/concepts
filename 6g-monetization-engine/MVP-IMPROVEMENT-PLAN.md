# 6G BSS Monetization Cockpit — MVP Improvement Plan

## Context

The current MVP is a single HTML file (`index.html`, ~2650 lines, ~91KB) that simulates an agentic 6G BSS monetization workspace. While the visual design is strong (dark glassmorphism, matrix green accents), the MVP feels like a static mockup rather than a living system. Every agent conversation is pre-scripted, metrics never change, the architecture map is decorative, and the user can only watch — never interact with or adjust the plan.

**Target audience:** Industry professionals arriving cold from a LinkedIn blog post. Must be self-explanatory, demonstrate deep 6G BSS domain expertise, and feel like a real system — not a prototype.

**Constraint:** Remains a single HTML file. No backend, no build step, no external dependencies.

**Goal:** Transform the MVP from a scripted walkthrough into an interactive concept system where visitors can explore, adjust parameters, see consequences, and understand how 6G monetization works by using it.

---

## Phase 0: Production-Grade Visual Foundation (Do Before Everything Else)

This phase upgrades the CSS and HTML to look and feel like a real production system rather than a design prototype. Every subsequent improvement benefits from this foundation.

### V1. Typography Overhaul

**Current problems:**
- Base font is 13px (line 90) — too small for a production app
- Monospace labels at 9-10px (lines 364, 562, 826) — borderline unreadable
- Font weights at 780, 850, 900 feel heavy and blocky
- `text-transform: uppercase` + `letter-spacing: 0.08em` applied to too many elements — a strong "design prototype" signal
- Line heights at 1.0-1.15 for headings are too tight
- Inter font is declared but never loaded — falls back to generic system-ui

**What to change:**

#### Font Loading
Add Google Fonts link at the top of `<head>` (single line, loads Inter with proper weights):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```
Replace all `"SF Mono", "IBM Plex Mono", ui-monospace, monospace` references with `"JetBrains Mono", ui-monospace, monospace`. JetBrains Mono is sharper and more recognizable as a production engineering font.

**Note:** If the MVP must work fully offline (no CDN), skip the Google Fonts link and use `system-ui` stack instead. The font-weight and sizing fixes below still apply.

#### Font Smoothing
Add to the `body` rule:
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
text-rendering: optimizeLegibility;
```

#### Type Scale
Establish a proper scale and reduce weight extremes:

| Element | Current | New |
|---------|---------|-----|
| `body` base | 13px | **14px** |
| `h1` (mission title) | clamp(28px, 3vw, 34px) | clamp(26px, 2.5vw, 32px), **weight 700** (not 900) |
| `h2` (panel heads) | 15px | **16px**, weight 600 |
| `h3` (approval cards) | 14px | **15px**, weight 600 |
| Body text (`.message-text`, `.operator-role`) | 12px | **13px**, weight 400 |
| Monospace labels (`.eyebrow`, `.status-chip`, `.metric-label`) | 9-10px, weight 780-800 | **11px**, weight 500-600 |
| Tool call mono | 10px | **11px**, weight 400 |

#### Reduce Uppercase Overuse
Currently, these elements are all `text-transform: uppercase; letter-spacing: 0.08-0.13em`:
- `.eyebrow` — keep uppercase (it's a label pattern)
- `.status-chip` — keep uppercase
- `.metric-label` — keep uppercase
- `.phase-step span` — **remove uppercase**, use sentence case + weight 500
- `.agent-chip span` — **remove uppercase**, use sentence case
- `.event-type` — keep uppercase (it's a tag)
- `.mini-stat span` — **remove uppercase**, use sentence case
- `.tool-state` — keep uppercase
- `.rail-status` — keep uppercase

Rule: uppercase is for **tags, badges, and system indicators**. Descriptive text (role descriptions, phase descriptions, stat labels) should be sentence case.

#### Line Heights
- Headings (h1-h3): increase from 1.0-1.15 to **1.2-1.3**
- Body text: increase from 1.35-1.45 to **1.5**
- Monospace labels: keep at 1 (single line)

---

### V2. Spacing System

**Current problems:**
- `gap: 8px` used almost everywhere — no breathing room hierarchy
- Panel padding is 16px — cramped for a dashboard
- Section gaps are 12-14px — too tight

**What to change:**

Establish a spacing scale: `4px | 8px | 12px | 16px | 20px | 24px | 32px`

| Element | Current | New |
|---------|---------|-----|
| `.panel-pad` padding | 16px | **20px** (24px on larger panels) |
| `.work-grid` gap | 14px | **16px** |
| `.agent-board` gap | 7px | **10px** |
| `.plan-grid` gap | 9px | **12px** |
| `.metric-grid` gap | 8px | **12px** |
| `.approval-list` gap | 8px | **12px** |
| `.tool-list` gap | 8px | **10px** |
| `.mission-bar` padding | 15px 16px | **18px 20px** |
| `.chat-feed` gap (messages) | 10px | **12px** |
| `.panel-head` margin-bottom | 12px | **16px** |
| `.action-row` gap | 8px | **10px** |
| `.main-stage` gap | 14px | **18px** |

---

### V3. Color System Refinement

**Current problems:**
- `--text-3: rgba(255,255,255,0.38)` is nearly invisible on dark backgrounds — fails WCAG contrast
- `--green: #39ff64` is eye-searing at full intensity — no production app uses neon green for UI elements
- No semantic color tokens for warnings, errors, info
- No hover/focus color tokens

**What to change:**

#### Adjust Core Palette
```css
:root {
  /* Raise text-3 to be actually readable */
  --text-3: rgba(255, 255, 255, 0.50);  /* was 0.38 */
  
  /* Slightly soften the green — less neon, more "system active" */
  --green: #34e85e;        /* was #39ff64 — slightly less saturated */
  --green-2: #8af0a0;      /* was #9dffad */
  
  /* Add semantic colors */
  --warn: #f0a030;          /* amber for warnings */
  --warn-dim: rgba(240, 160, 48, 0.15);
  --warn-line: rgba(240, 160, 48, 0.55);
  --danger: #ef4444;        /* red for critical */
  --danger-dim: rgba(239, 68, 68, 0.12);
  --info: #60a5fa;          /* blue for informational */
  --info-dim: rgba(96, 165, 250, 0.12);
  
  /* Selection color */
  --selection-bg: rgba(52, 232, 94, 0.25);
}
```

#### Selection Styling
```css
::selection {
  background: var(--selection-bg);
  color: var(--text-1);
}
```

---

### V4. Component Refinement

**Current problems:**
- No focus-visible styles for keyboard navigation
- Hover states are minimal (just `translateY(-1px)`)
- Buttons lack state differentiation
- Glass panels all look identical — no depth hierarchy
- No transition on color changes

**What to change:**

#### Focus Styles
```css
:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 2px;
}

button:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(52, 232, 94, 0.15);
}
```

#### Hover State Improvements
```css
.rail-button:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.20);
}

.scenario-button:hover,
.filter-button:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.22);
  color: var(--text-1);
}

.plan-item:hover {
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
}

.metric-tile:hover {
  border-color: rgba(255, 255, 255, 0.18);
}

.approval-card:hover {
  border-color: rgba(255, 255, 255, 0.18);
}

.tool-row:hover {
  background: rgba(255, 255, 255, 0.06);
}
```

#### Panel Depth Hierarchy
Not all panels should look the same. Create 3 tiers:

1. **Primary panels** (command deck, agent war room): brighter glass, stronger border
```css
.command-deck, .war-panel {
  background: linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.04)),
              rgba(8,10,11,0.75);
  border-color: rgba(255,255,255,0.18);
}
```

2. **Secondary panels** (plan canvas, approval queue, metrics): standard glass
```css
/* Keep as-is — this is the default */
```

3. **Utility panels** (tool trace, event stream, map): darker, more recessed
```css
.tools-panel, .stream-panel, .map-panel {
  background: linear-gradient(135deg, rgba(255,255,255,0.065), rgba(255,255,255,0.02)),
              rgba(5,7,8,0.8);
  border-color: rgba(255,255,255,0.10);
}
```

#### Transition Improvements
Add to all interactive elements:
```css
.plan-item, .metric-tile, .approval-card, .tool-row, .partner-item {
  transition: border-color 200ms ease, background 200ms ease, box-shadow 200ms ease;
}
```

---

### V5. Border Radius Consistency

**Current problem:** Border radii vary from 11px to 22px across elements. Production apps use 2-3 radius values consistently.

**What to change:**

Standardize to 3 values:
```css
:root {
  --radius-lg: 16px;   /* was 20px — panels, command deck */
  --radius-md: 12px;   /* was 15px — cards, tiles, sub-panels */
  --radius-sm: 8px;    /* was 11px — buttons, chips, inputs */
}
```

Apply consistently:
- Panels (`.glass-panel`, `.command-deck`, `.mission-bar`): `--radius-lg`
- Cards and tiles (`.plan-item`, `.metric-tile`, `.approval-card`, `.agent-chip`, `.message-card`): `--radius-md`
- Buttons, chips, inputs (`.action-button`, `.scenario-button`, `.command-input`, `.tiny-button`): `--radius-sm`
- Pills (`.status-chip`, `.filter-button`): keep `999px` (full pill shape)

---

### V6. Cursor and Interaction Signals

**Current problem:** No visual signals for what's clickable vs what's informational.

**What to add:**
```css
/* Editable fields (after P2 is implemented) */
.plan-item[data-editable]:hover {
  cursor: pointer;
  border-color: rgba(52, 232, 94, 0.3);
}

.plan-item[data-editable]:hover::after {
  content: "✎";
  position: absolute;
  top: 8px;
  right: 10px;
  color: var(--text-3);
  font-size: 12px;
}

/* Non-interactive labels */
.metric-label, .eyebrow, .event-type {
  cursor: default;
  user-select: none;
}

/* Expandable tool rows (after API sandbox is implemented) */
.tool-row[data-expandable] {
  cursor: pointer;
}

.tool-row[data-expandable]:hover .tool-icon {
  background: rgba(52, 232, 94, 0.12);
}
```

---

### V7. Loading and Skeleton States

**Current problem:** When agent output is "Waiting for agent output" (line 2123), it shows plain text. Production apps show skeleton placeholders.

**What to add:**

```css
.skeleton {
  background: linear-gradient(90deg, 
    rgba(255,255,255,0.04) 25%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 6px;
  color: transparent !important;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

Use `class="skeleton"` on elements showing "Waiting for..." text. Remove the class when real data arrives.

Apply to:
- Plan canvas fields when in "awaiting" state
- Metric tiles before they receive values
- Partner list placeholder
- Tool list placeholder

---

### V8. Scrollbar Styling

**Current problem:** Default browser scrollbar in chat-feed and event-list breaks the dark UI aesthetic.

**What to add:**
```css
.chat-feed::-webkit-scrollbar,
.event-list::-webkit-scrollbar {
  width: 6px;
}

.chat-feed::-webkit-scrollbar-track,
.event-list::-webkit-scrollbar-track {
  background: transparent;
}

.chat-feed::-webkit-scrollbar-thumb,
.event-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.chat-feed::-webkit-scrollbar-thumb:hover,
.event-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
```

---

### V9. Subtle Ambient Animation

**Current problem:** The page is static between interactions. Production dashboards have subtle life signals.

**What to add:**

1. **Breathing glow on the "LIVE" status** (sidebar bottom):
```css
.rail-status {
  animation: breathe 3s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { box-shadow: inset 0 0 18px rgba(52, 232, 94, 0.04); }
  50% { box-shadow: inset 0 0 18px rgba(52, 232, 94, 0.12), 0 0 12px rgba(52, 232, 94, 0.08); }
}
```

2. **Subtle pulse on the active phase step** indicator dot:
Already has `animation: pulse 1.8s` — good. But the `.phase-step.active` should also have a faint glow:
```css
.phase-step.active {
  box-shadow: 0 0 20px rgba(52, 232, 94, 0.06);
  animation: phase-glow 3s ease-in-out infinite;
}
@keyframes phase-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(52, 232, 94, 0.06); }
  50% { box-shadow: 0 0 28px rgba(52, 232, 94, 0.12); }
}
```

3. **Grid background subtle drift** — on the body::before grid pattern, add a very slow position animation:
```css
body::before {
  animation: grid-drift 120s linear infinite;
}
@keyframes grid-drift {
  0% { background-position: 0 0, 0 0, 0 0; }
  100% { background-position: 52px 52px, 52px 52px, 0 260px; }
}
```
This makes the background grid slowly move, creating a subtle "system is alive" feeling without being distracting.

---

### Visual Foundation Summary

| Area | Impact | Effort |
|------|--------|--------|
| V1. Typography | High — immediately more legible and professional | ~60 CSS changes |
| V2. Spacing | High — panels feel less cramped | ~30 value changes |
| V3. Colors | Medium — better contrast, semantic states | ~15 new variables |
| V4. Components | High — hover, focus, depth hierarchy | ~80 CSS lines |
| V5. Border radius | Low — consistency signal | ~20 value changes |
| V6. Cursor signals | Medium — communicates interactivity | ~25 CSS lines |
| V7. Skeleton states | Medium — real loading feel | ~15 CSS lines + ~20 JS lines |
| V8. Scrollbars | Low — detail polish | ~15 CSS lines |
| V9. Ambient animation | Medium — "alive" feel | ~20 CSS lines |

**Do V1-V4 first** (typography, spacing, colors, components). These are the highest-impact changes and take the UI from "prototype" to "production" in one pass. V5-V9 are refinements to do alongside or after Phase 1.

---

## Phase 1: Core Fixes (Do First)

### P1. Dynamic Agent Conversations (~290 lines)

**Problem:** The `sequences` object (lines 2486-2554) contains hardcoded message strings. The `runSequence` function (line 2422) plays them identically regardless of user input. The command textarea value (line 2594) is displayed in chat but never parsed.

**What to build:**

#### 1a. Command Parser
Add a `parseCommand(text)` function that extracts constraints using regex:
- Latency: `/(\d+(?:\.\d+)?)\s*ms/i` → `parsedCommand.latency`
- Compute: `/(\d+)\s*(?:GFLOPS|gflops)/i` → `parsedCommand.compute`
- Carbon: `/(\d+)g?\s*CO2/i` → `parsedCommand.carbonCap`
- Accuracy: `/(\d+(?:\.\d+)?)%/i` → `parsedCommand.accuracy`
- Location: match against `["Hamburg", "Rotterdam", "Munich", "Singapore", "Tokyo"]`
- Intent verbs: detect "launch", "test", "simulate", "extend", "upgrade"
- Store in `state.parsedCommand` for use by all agents

#### 1b. Template Response Pools
Replace each hardcoded string in `sequences` with a call to `agentResponse(agentKey, phase)`. Each agent gets 3-5 response templates per phase that interpolate parsed values.

Example templates for orchestrator at draft phase:
```
"Decomposing into {workstreamCount} workstreams. Primary hard constraint: {primaryConstraint}."
"Command accepted. I see {constraintCount} hard constraints and {softCount} preferences. Starting with {firstWorkstream}."
"The {intentVerb} intent maps to: {workstreamList}. I'll coordinate from here."
```

Templates must be domain-accurate. The orchestrator talks about workstreams and decomposition. The network agent talks about slices, QoS profiles, edge proximity. The pricing agent talks about outcome-based models, price bands, margin sensitivity. The carbon agent talks about energy footprints, clean routes, ESG guardrails.

Selection: `pool[Math.floor(Math.random() * pool.length)]` — different each run.

#### 1c. Agent Disagreements
Add a `checkDisagreement(agentKey, parsedCommand)` function with threshold logic:
- Carbon cap < 70g → carbon agent objects: "This cap is aggressive for the selected edge zone. I recommend a 15g buffer."
- Latency < 1ms → network agent flags: "Sub-millisecond latency requires dedicated URLLC slice. Cost and carbon will increase."
- Margin projection < 25% → pricing agent warns: "This price point is below sustainable margin for multi-party settlement."
- Accuracy threshold > 99% → risk agent escalates: "Near-perfect accuracy mandates a refund reserve. I'm adding an approval gate."

In `runSequence`, after each "message" step, check if a disagreement trigger fires. If yes, splice an extra message step with the disagreement.

#### 1d. Agent-to-Agent Dialogue
During the "partners" and "feasibility" sequences, add cross-agent exchanges:
- Settlement agent asks pricing agent: "What margin buffer should I protect in the partner split?"
- Pricing agent responds: "Hold {marginBuffer}% for SLA refund risk. The rest is distributable."
- Network agent tells carbon agent: "I have two routes — clean path at +12% cost, standard path at guardrail edge."
- Carbon agent decides: "Take the clean path. The cost delta is within Chrisaman's tolerance."

Implementation: message steps with a `replyTo` field indicating the target agent.

#### 1e. Varied Timing
Replace the flat 520ms delays. Add a `timings` map:
```js
const timings = {
  orchestrator: { typing: 500, tool: 400 },
  network:      { typing: 900, tool: 1200 },  // complex infrastructure checks
  pricing:      { typing: 400, tool: 600 },    // fast math
  settlement:   { typing: 700, tool: 900 },
  carbon:       { typing: 600, tool: 800 },
  api:          { typing: 350, tool: 500 },    // fastest - integration layer
  risk:         { typing: 800, tool: 300 }     // deliberate pause, quick check
};
```

#### 1f. Tool Call Variance
Replace uniform "OK" outcomes. Each tool step gets an `outcomes` array:
```js
["OK 234ms", "OK 891ms", "WARN: using fallback route", "RETRY 1/2 → OK 1.4s", "OK 67ms (cached)"]
```
Tool completion delay: `300 + Math.random() * 800` instead of flat 520ms.
Occasionally show a tool returning with a warning status (yellow) instead of always green.

**Verification:** Run each scenario 3 times. Agent messages should differ noticeably between runs. Changing the command text should produce observably different agent responses and tool call results.

---

### P2. Interactive Plan Canvas with Feedback Loops (~300 lines)

**Problem:** Plan fields (lines 1745-1753) are read-only `<strong>` elements. Metrics (lines 1803-1828) are set once and never change. Approval actions (line 2603) change text but have no system-level effect.

**What to build:**

#### 2a. Click-to-Edit Plan Fields
Make these fields editable on click:
- **Latency SLA** → numeric input with "ms" suffix, range 0.1-50
- **Edge compute** → numeric input with "GFLOPS" suffix, range 5-500
- **Carbon guardrail** → numeric input with "g CO2e/kWh" suffix, range 30-200
- **Outcome metric** → numeric input with "%" suffix, range 80-99.99
- **Price model** → dropdown: "Outcome-second" / "Per-move" / "Corridor-charge" / "Flat-rate"
- **Settlement** → dropdown: "3-party" / "5-party" / "7-party smart contract"

On click: replace `<strong>` with styled `<input>`. On blur/Enter: write back, trigger `recalculate()`.
CSS: green border glow on active input, subtle pencil icon on hover to signal editability.

#### 2b. Cascading Recalculation Engine
Add a `recalculate()` function with a credible domain model:

**Dependency graph (directionally correct and credibly proportioned):**
```
latency ↓  → compute cost ↑ → margin ↓ → risk ↑
           → slice complexity ↑ → partner count ↑
carbon cap ↓ → cleaner route → edge cost ↑ → margin ↓
             → carbon metric improves → ESG score ↑
accuracy ↑ → refund reserve ↑ → margin ↓
           → confidence ↑ → launch risk ↓
compute ↑ → edge cost ↑ → margin ↓
          → latency headroom ↑ → feasibility ↑
price model change → recalculate all downstream
```

**Credible proportions for a telecom domain expert:**
- Halving latency (e.g., 2ms → 1ms) increases edge cost by ~30-40%, dropping margin by ~8-12pp
- Tightening carbon by 10g/kWh adds ~5-8% to edge cost (clean energy premium)
- Raising accuracy threshold from 98% to 99.5% adds ~15% refund reserve
- Moving from 5-party to 7-party settlement adds ~3pp to overhead
- Each GFLOPS costs roughly EUR 0.002/sec in edge reservation

Use linear interpolation within these ranges. Clamp all values to sensible floors/ceilings. Show "recalculating..." animation briefly when values change.

#### 2c. What-If Indicators
On hover over an editable field, show a compact tooltip: "Affects: edge cost, gross margin, launch risk". 
Add `data-affects="cost,margin,risk"` to each editable plan item. Tooltip renders from a delegated hover handler.

#### 2d. Approval Gates with Real Consequences
Add `state.approvalGates = { price: 'pending', carbon: 'pending', settlement: 'pending' }`.
- **"Approve"** → sets gate to 'approved', enables downstream. Architecture map node goes green.
- **"Hold"** → sets gate to 'held', disables launch button, shows blocked state on workflow stepper. Architecture map node goes amber. Add a visual "BLOCKED" indicator.
- **"Modify"** → sets gate to 'modify', triggers recalculation with modified parameters. Shows "recalculating..." state.
- Launch only enabled when all 3 gates are 'approved'.

#### 2e. Dynamic Partner Splits
When margin changes via recalculation, partner splits adjust:
- Margin down → operator share down, edge cloud share up (because edge cost drove the change)
- Carbon tighter → carbon ledger fee increases from 4% to 6-8%
- Settlement complexity up → overhead pool increases
Re-render partner bars with animation on each recalculation.

**Verification:** Edit latency from 2ms to 0.5ms → margin should visibly drop, risk should increase, partner splits should shift. Hold an approval → launch button should be disabled.

---

### P3. Remove Mockup Tells (~50 lines removed, ~20 modified)

**Problem:** The UI literally labels itself as fake and explains every panel as if the viewer is reading documentation.

**Specific deletions:**
1. **Line 1657:** Delete `<span class="status-chip">Static simulation</span>`
2. **Line 1664-1665:** Delete the `<h2>Start here: tell the agents...` and `<p>This is the main control surface...` paragraphs — the textarea and scenario buttons are self-evident
3. **Line 1706:** Change `<h2>Command -> Draft Plan -> Agent Run -> ...</h2>` to just `<h2>Launch workflow</h2>`
4. **Line 1707:** Delete `<p>Each step is a focused screen...`
5. **Line 1718:** Delete `screenSummary` div (or replace with a minimal one-line breadcrumb)
6. **Line 1728:** Delete `<p>Chrisaman directs the agents...`
7. **Lines 1726-1727:** Change "Simulated multi-agent launch chat" to "Agent war room"
8. **Line 1740:** Delete `<p>Agents write directly into...`
9. **Line 1769:** Delete `<p>Approval cards explain why...`
10. **Lines 1782-1784:** Change "Simulated telco API calls" to "Tool trace", delete description `<p>`
11. **Line 1837:** Delete `<p>Animated route follows...`
12. **Lines 2043-2073:** Remove `summary` strings from `pageMeta` or replace with single-word breadcrumb labels

**Verification:** Open the page — no text should narrate what you're looking at. The UI should be self-evident.

---

## Phase 2: Visual Depth and Polish

### P4. Live-Feel Metrics (~170 lines)

**What to build:**

#### 4a. Animated Counter
`animateCounter(element, startVal, endVal, duration, formatFn)` using `requestAnimationFrame`. Used for all metric updates instead of direct `textContent` setting.

#### 4b. Subtle Variance Loop
After launch phase, start a `setInterval` (every 4-8 seconds, randomized):
- Price fluctuates EUR ±0.003
- Margin fluctuates ±1.5pp
- Carbon fluctuates ±4g (but never exceeds guardrail without a warning)
- If carbon approaches guardrail: metric turns amber, carbon agent posts a warning in chat

Only runs when `state.page === 'monitor'`. Clear interval on page change.

#### 4c. Mini Sparkline Charts
Replace static `.mini-bar` with tiny SVG sparklines (50x16px viewBox). Maintain rolling array of 20 values per metric. Render as `<polyline>` in inline SVG:
```html
<svg viewBox="0 0 50 16"><polyline points="..." fill="none" stroke="var(--green)" stroke-width="1"/></svg>
```
Update on each variance tick.

#### 4d. Color-Coded Thresholds
Add CSS classes `.metric-warn` (amber: `#ffb84d`) and `.metric-danger` (red: `#ff4d4d`).
- Carbon > 90% of guardrail → warn
- Margin < 20% → warn
- Margin < 10% → danger
- Risk == "High" → warn

---

### P5. Reactive Architecture Map (~195 lines)

**What to build:**

#### 5a. State-Driven Node Activation
Map each SVG node to a workflow phase:
```js
const nodePhaseMap = {
  'node-operator': 0,      // command
  'node-orchestrator': 1,   // draft
  'node-network': 2,        // feasibility
  'node-pricing': 3,        // revenue/partners
  'node-settlement': 3,     // revenue/partners
  'node-governance': 4      // approval
};
```
Add `id` attributes to SVG `<g>` nodes. `updateMap(phase)` sets `.active` on nodes ≤ current phase, removes it from later nodes. Flow lines between active nodes get `.live`.

#### 5b. Animated Flow Particles
Add `<circle r="3" fill="var(--green)">` elements with `<animateMotion>` that follow the flow-line paths. Only animate particles on paths between active nodes. Use `filter: drop-shadow(0 0 4px rgba(57,255,100,0.4))` for glow.

#### 5c. Status Badges
Small text labels below each node: "READY" (dim), "ACTIVE" (green pulse), "DONE" (solid green), "BLOCKED" (amber). Updated from `updateMap` and from approval gate state.

#### 5d. Approval-Map Integration
When a user "holds" an approval → Governance node turns amber with "BLOCKED" badge.
When all approvals pass → Governance node turns green with "CLEARED" badge.
Flow lines downstream of a blocked node lose `.live` class.

---

### P6. Self-Guided Onboarding (~220 lines)

**What to build:**

#### 6a. Splash Overlay
Full-screen glassmorphism overlay on first visit:
- Title: "6G Plan Launch Console"
- Subtitle: "Launch 6G commercial plans through specialist AI agents with human oversight"
- Two buttons: "Guided walkthrough" / "Jump in"
- Auto-dismiss after 4 seconds if no interaction
- `sessionStorage.setItem('6g-splash-seen', '1')` → never shows again

#### 6b. Glossary Tooltips
`data-term` attribute on domain-specific terms. Delegated `mouseover` handler shows tooltip.
```js
const glossary = {
  "URLLC": "Ultra-Reliable Low-Latency Communication — a 5G/6G service category for mission-critical applications",
  "outcome-second": "Billing model where charges accrue per second only when the agreed outcome metric is being met",
  "CO2e/kWh": "Carbon dioxide equivalent per kilowatt-hour — measures the carbon intensity of energy consumption",
  "CAMARA": "Common API framework by GSMA for standardized network capability exposure",
  "GFLOPS": "Giga floating-point operations per second — measure of edge compute capacity",
  "QoS": "Quality of Service — guaranteed network performance parameters",
  "network slice": "A logically isolated end-to-end network customized for a specific use case",
  "edge compute": "Processing capacity deployed at network edge, close to devices, for low-latency workloads",
  "smart contract": "Self-executing settlement agreement where terms are encoded as rules",
  "B2A2X": "Business-to-Agent-to-Everything — the 6G commerce model where AI agents transact on behalf of businesses",
  "supervised autonomy": "Operating mode where AI agents can act within defined bounds but require human approval for consequential decisions",
  "intent-based": "Describing desired outcomes rather than specifying exact technical configurations",
  "carrier billing": "Charging end customers through the telecom operator's billing system",
  "ESG": "Environmental, Social, and Governance — sustainability and corporate responsibility metrics"
};
```

#### 6c. Guided Tour (4 steps)
If "Guided walkthrough" selected:
1. Highlight command deck: "Choose a scenario or type your own launch intent"
2. Highlight workflow stepper: "The workflow advances through six phases"
3. Highlight send button: "Send to start the agent workflow, then explore each screen"
4. Highlight plan canvas (scroll to it): "Edit any value on the plan canvas to see cascading effects"

Implementation: overlay div with `clip-path` cutout around highlighted element. "Next" / "Skip" buttons. Dismisses on completion.

---

## Suggested Addition: Enhanced Tool Trace → API Sandbox

**Rationale:** The current tool trace (lines 1779-1794) shows "CAMARA QoS Booking → OK" which tells the viewer nothing about what a 6G BSS API actually looks like. An expanded view with collapsible request/response JSON would demonstrate deep domain knowledge.

**What to build (~120 extra lines):**
Make each tool row expandable (click to toggle). When expanded, show a mock API request/response:

```json
// CAMARA QoS Booking
POST /qos/v1/sessions
{
  "device": { "networkAccessId": "factory-cell-A7" },
  "qosProfile": "URLLC_2MS",
  "duration": 2700,
  "notificationUrl": "/callbacks/qos-events"
}
→ 201 Created
{
  "sessionId": "qs-8f4a2c",
  "qosProfile": "URLLC_2MS",
  "startedAt": "2026-06-22T14:30:00Z",
  "expiresAt": "2026-06-22T15:15:00Z"
}
```

Include 5-6 different API payloads covering: QoS booking, slice reservation, edge discovery, energy footprint, billing activation, settlement commit. These should use real CAMARA-style schemas where possible.

**This is optional but high-value for the thought leadership audience.** A domain expert clicking into these payloads sees that the creator understands the API layer, not just the business layer.

---

## Implementation Order

1. **Phase 0: V1-V4** — Typography, spacing, colors, component refinement. This is the visual foundation — every subsequent change looks better on top of it. (~1 hour of CSS changes)
2. **P3** — Remove mockup tells. 30 minutes of deletions. Combined with Phase 0, the MVP already looks dramatically more professional.
3. **Phase 0: V5-V9** — Border radius, cursors, skeletons, scrollbars, ambient animation. Polish layer, can be woven in during P1 implementation.
4. **P1** — Dynamic conversations. The core experience transformation.
5. **P2** — Interactive plan canvas. Builds on the dynamic conversation state.
6. **P4** — Live metrics. Makes the monitor screen come alive.
7. **P5** — Reactive map. Visual feedback layer.
8. **P6** — Onboarding. The arrival experience (depends on all other improvements being in place).
9. **API Sandbox** — Optional depth layer, can be added last.

## File Structure

Everything lives in one file: `/Users/macbook/Documents/Innovation projects /6g-bss-monetization-cockpit/index.html`

- Lines 8-1607: CSS (add new styles for editable fields, tooltips, sparklines, splash overlay, threshold colors)
- Lines 1609-1901: HTML (remove narration, add splash overlay, add `data-term` and `data-affects` attributes, add `id` to SVG nodes)
- Lines 1903-2650: JavaScript (command parser, template pools, recalculation engine, variance loop, sparklines, tour, glossary)

Update `README.md` to remove references to "static simulation" and document new interactive capabilities.

## Verification Plan

### Visual Foundation (Phase 0)
1. **Typography:** Open the page — body text should be 14px, headings crisp at 600-700 weight, monospace labels at 11px and clearly readable
2. **Spacing:** Panels should feel spacious, not cramped. Compare with a screenshot of the old layout side-by-side
3. **Colors:** `--text-3` elements (tertiary labels) should be clearly readable, not ghostly. Green should feel sophisticated, not neon
4. **Focus:** Tab through all buttons — each should show a visible green focus ring
5. **Hover states:** Hover over plan items, tool rows, metric tiles — each should show a subtle border/background change
6. **Scrollbars:** Scroll the chat feed and event list — scrollbars should match the dark theme
7. **Skeletons:** Before running any sequence, "waiting" states should show a shimmer animation, not plain text
8. **Ambient:** The LIVE indicator in the sidebar should softly breathe. The background grid should drift imperceptibly

### Functional Improvements (Phase 1-2)
9. **Dynamic conversations:** Run Smart Factory scenario 3 times → agent messages should differ noticeably
10. **Command parsing:** Type a custom command with different constraints → agents should reference your specific values
11. **Plan editing:** Change latency from 2ms to 0.5ms → margin, risk, and partner splits should visibly change
12. **Approval gates:** Hold an approval → launch button disabled, map node turns amber
13. **Live metrics:** Navigate to Launch Monitor → numbers should fluctuate over 30 seconds
14. **Architecture map:** Advance through workflow → nodes should light up progressively
15. **Onboarding:** Clear sessionStorage, reload → splash should appear. Select "Guided walkthrough" → tour should highlight 4 elements
16. **Glossary:** Hover "outcome-second" or "URLLC" anywhere → tooltip should appear with definition
17. **API sandbox:** Click a tool trace row → JSON payload should expand/collapse
18. **All scenarios:** Repeat tests with Port Logistics and Drone Corridor scenarios

### Overall Production Feel
19. **Screenshot test:** Take a screenshot and show it to someone cold. Ask: "Is this a prototype or a product?" Target answer: product
20. **5-second test:** Open the page fresh. Within 5 seconds, the visitor should understand it's a system for launching 6G plans — without reading any explanatory text

---
---

# NEW SCREEN: 6G Offer Catalogue (`catalogue.html`)

## Context

The existing Launch Console shows HOW to launch a 6G plan — but doesn't show WHAT 6G BSS actually sells. A dense, interactive Offer Catalogue demonstrates the paradigm shift from traditional telco bundles (10GB for $5) to intent-based, outcome-priced, sustainability-aware offers where AI agents are customers alongside enterprises.

This is a separate HTML file (`catalogue.html`) in the same folder. Same visual language, same single-file approach, no dependencies. Can serve as a standalone thought-leadership page or as the entry point into the Launch Console.

**Source material:** The user's blog on 6G BSS monetization + the 4-layer architecture diagram (AI Experience → 6G Intelligence → Trust & Governance → API & Event Mesh).

---

## Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ HEADER BAR  (6G emblem + title + nav to Launch Console) │
├─────────────────────────────────────────────────────────┤
│ STATS BAR  (14 Offers | 8 B2B | 6 B2A | 7 Verticals)  │
├─────────────────────────────────────────────────────────┤
│ FILTER BAR  [Search] [All|B2B|B2A] [Vertical] [Carbon] │
├──────────────────────────────────┬──────────────────────┤
│                                  │                      │
│  CATALOGUE GRID                  │  ARCHITECTURE        │
│  3-col responsive card grid      │  SIDEBAR             │
│  (14 offer cards)                │  (4-layer stack,     │
│                                  │   sticky, clickable  │
│                                  │   to filter)         │
│                                  │                      │
├──────────────────────────────────┴──────────────────────┤
│ FOOTER  (blog link + "Built for the AI-agent economy")  │
└─────────────────────────────────────────────────────────┘
```

- **Desktop (>1280px):** 3-col grid + 280px sidebar
- **Tablet (860-1280px):** 2-col grid, sidebar collapses to horizontal layer bar above grid
- **Mobile (<860px):** 1-col grid, sidebar becomes collapsible accordion, filters scroll horizontally

---

## Offer Catalogue: 14 Offers Across 7 Verticals

### Industrial Manufacturing

| # | Offer | Type | Latency | Compute | Carbon | Pricing | Settlement | Grade | Layers | Launch? |
|---|-------|------|---------|---------|--------|---------|------------|-------|--------|---------|
| 1 | **Smart Factory Robot Cell Control** | B2B | <2ms | 50 GFLOPS | 80g | Outcome-second (accuracy ≥98%) | 5-party smart contract | A | 1,2,3,4 | ✅ factory |
| 2 | **Predictive Digital Twin Sync** | B2B | <8ms | 30 GFLOPS | 65g | Per-sync-cycle (fidelity threshold) | 3-party | A | 1,2,4 | — |

### Logistics & Transport

| # | Offer | Type | Latency | Compute | Carbon | Pricing | Settlement | Grade | Layers | Launch? |
|---|-------|------|---------|---------|--------|---------|------------|-------|--------|---------|
| 3 | **Autonomous Port Fleet Coordination** | B2B | <5ms | Edge vision pool | Peak cap | Per container move | 4-party | B | 1,2,3,4 | ✅ port |
| 4 | **Cross-Border Supply Chain Slice** | B2A | <20ms | 10 GFLOPS | 90g | Agent-negotiated per-corridor-hour | DAO multi-operator | B | 1,2,3,4 | — |

### Public Safety & Drones

| # | Offer | Type | Latency | Compute | Carbon | Pricing | Settlement | Grade | Layers | Launch? |
|---|-------|------|---------|---------|--------|---------|------------|-------|--------|---------|
| 5 | **Emergency Drone Corridor** | B2B | Mission-critical | Sensing+video | Exception | Temporary corridor charge | 4-party | C | 1,2,3,4 | ✅ drone |
| 6 | **Autonomous Drone Delivery Fleet** | B2A | <10ms | 80 GFLOPS | 100g | Per-mission (geofence proof) | DAO smart contract | B | 1,2,3,4 | — |

### Immersive Media

| # | Offer | Type | Latency | Compute | Carbon | Pricing | Settlement | Grade | Layers | Launch? |
|---|-------|------|---------|---------|--------|---------|------------|-------|--------|---------|
| 7 | **Holographic Telepresence** | B2B | <4ms | 120 GFLOPS | 75g | QoE-based (mean opinion score) | 3-party | A | 1,2,4 | — |
| 8 | **AI-Directed Live Event Streaming** | B2A | <15ms burst | 200 GFLOPS | 110g | Agent-negotiated spot auction | Dynamic revenue share | C | 1,2,3,4 | — |

### Sustainability & Energy

| # | Offer | Type | Latency | Compute | Carbon | Pricing | Settlement | Grade | Layers | Launch? |
|---|-------|------|---------|---------|--------|---------|------------|-------|--------|---------|
| 9 | **Certified Green Slice** | B2B | <25ms | 15 GFLOPS | 35g | Green premium per-GB | 3-party + carbon registry | A+ | 1,2,3,4 | — |
| 10 | **Smart Grid Edge Orchestration** | B2A | <50ms | 40 GFLOPS | 45g | Per-forecast-cycle | Carbon-weighted smart contract | A | 1,2,3,4 | — |

### Healthcare

| # | Offer | Type | Latency | Compute | Carbon | Pricing | Settlement | Grade | Layers | Launch? |
|---|-------|------|---------|---------|--------|---------|------------|-------|--------|---------|
| 11 | **Remote Surgical Assist** | B2B | <1ms | 200 GFLOPS | 60g | Per-procedure outcome | 5-party + malpractice reserve | A | 1,2,3,4 | — |

### Autonomous Mobility

| # | Offer | Type | Latency | Compute | Carbon | Pricing | Settlement | Grade | Layers | Launch? |
|---|-------|------|---------|---------|--------|---------|------------|-------|--------|---------|
| 12 | **Connected Vehicle Swarm Intelligence** | B2A | <3ms | 150 GFLOPS | 85g | Per-km with safety-score multiplier | DAO multi-operator | B | 1,2,3,4 | — |
| 13 | **Urban Air Mobility Corridor** | B2B | <5ms | 60 GFLOPS | 95g | Per-flight-minute (position gate) | 4-party | B | 1,2,3,4 | — |

### Edge Compute Marketplace

| # | Offer | Type | Latency | Compute | Carbon | Pricing | Settlement | Grade | Layers | Launch? |
|---|-------|------|---------|---------|--------|---------|------------|-------|--------|---------|
| 14 | **Agentic Edge Compute Spot Market** | B2A | Variable | 5-500 GFLOPS | Variable | Real-time auction (carbon surcharge) | Sub-second smart contract clearing | Varies | 1,2,3,4 | — |

---

## Offer Card Design

### Default View (Collapsed)
```
┌──────────────────────────────────────────┐
│ [B2B]  [Industrial Mfg]   [Grade A] ●   │
│                                          │
│  Smart Factory Robot Cell Control        │
│  Sub-millisecond robot-cell coordination │
│  with edge compute and outcome billing.  │
│                                          │
│  ┌────┐┌────┐┌────┐┌────┐               │
│  │ L1 ││ L2 ││ L3 ││ L4 │  4/4 layers  │
│  └────┘└────┘└────┘└────┘               │
│                                          │
│  Outcome-second    5-party settlement    │
│                                          │
│  [▼ Details]         [Launch in Console →]│
└──────────────────────────────────────────┘
```

### Expanded View (Click "Details")
Adds below the default content:
- Intent parameter tiles: `<2ms latency` | `50 GFLOPS` | `80g CO2e/kWh`
- Settlement parties list
- Pricing detail explanation
- Full architecture layer breakdown with capability names

### B2B vs B2A Visual Differentiation
- **B2B cards:** Standard glass border, "B2B" badge in neutral style
- **B2A cards:** Subtle green top-border (`2px solid rgba(52,232,94,0.35)`), "B2A" badge in green-accent style (`.status-chip.live`), barely-perceptible green glass tint

### Carbon Grade Colors
- **A+:** Green with glow
- **A:** Green standard
- **B:** Amber (`--warn`)
- **C:** Red tint (`--danger`)

### Layer Indicator Bar
4-segment horizontal bar (6px tall, 2px gaps):
- Active layers: green fill
- Inactive: dim fill (`rgba(255,255,255,0.08)`)
- On hover: expands to 10px, shows layer name labels

---

## Architecture Sidebar

### Structure
Vertical stack of 4 layer blocks, each styled as `.dark-panel`:
```
┌──────────────────────────┐
│ ARCHITECTURE REFERENCE   │
│                          │
│ ┌──────────────────────┐ │
│ │ L1: AI Experience    │ │
│ │ Agent Onboarding     │ │
│ │ Intent Catalogue     │ │
│ │ Monetization APIs    │ │
│ └──────────────────────┘ │
│          │               │
│ ┌──────────────────────┐ │
│ │ L2: 6G Intelligence  │ │
│ │ Intent & Policy      │ │
│ │ Rating & Mediation   │ │
│ │ Collections/Settlem. │ │
│ └──────────────────────┘ │
│          │               │
│ ┌──────────────────────┐ │
│ │ L3: Trust & Govern.  │ │
│ │ Sustainability       │ │
│ │ Reporting/Insights   │ │
│ │ B2A2X Marketplace    │ │
│ └──────────────────────┘ │
│          │               │
│ ┌──────────────────────┐ │
│ │ L4: API & Event Mesh │ │
│ │ Kafka/NATS           │ │
│ │ Open APIs            │ │
│ │ Federated Edge       │ │
│ └──────────────────────┘ │
│                          │
│ [Clear filter]           │
└──────────────────────────┘
```

### Interactions
- **Hover an offer card →** sidebar layers used by that offer glow green, inactive layers dim to 40% opacity, connecting lines animate with dash pattern
- **Click a sidebar layer →** filters catalogue to only offers using that layer. Multiple layers selectable (AND logic). Syncs with filter bar.
- **Hover a sidebar layer →** all cards using that layer get a subtle green border pulse

---

## Connection Points to Launch Console

### catalogue.html → index.html
- 3 offer cards (factory, port, drone) have green "Launch in Console →" buttons
- Clicking navigates to `index.html?scenario=factory` (or port/drone)
- Header has persistent "Launch Console" nav button
- Other 11 offers show muted "Coming soon" where launch button would be

### index.html → catalogue.html (small modification needed)
Add to `index.html`:
1. New rail button in `.hud-rail` sidebar linking to `catalogue.html` (catalogue/grid icon)
2. Same button in `.mobile-nav`
3. URL parameter reader at end of script:
```js
const urlParams = new URLSearchParams(window.location.search);
const linkedScenario = urlParams.get('scenario');
if (linkedScenario && scenarios[linkedScenario]) {
  applyScenario(linkedScenario);
}
```

---

## Interactive Features

| Feature | Behavior |
|---------|----------|
| **Customer type filter** | Toggle: All / B2B / B2A. Mutually exclusive. |
| **Vertical filter** | Scrollable pills, one per vertical. Single-select. |
| **Carbon grade filter** | Toggle: All / A+/A / B / C |
| **Layer filter** | Synced with sidebar clicks. Multi-select AND logic. |
| **Text search** | Debounced 200ms, searches name/desc/pricing/vertical |
| **Card hover** | Lift + brighter border + sidebar layer highlighting |
| **Card expand** | Click to reveal intent params, settlement detail, layer breakdown. One card expanded at a time. |
| **Stats bar** | Updates dynamically when filters applied (filtered counts) |
| **Filter combine** | All filter dimensions combine with AND logic |

---

## Implementation Order for catalogue.html

1. **File skeleton + shared CSS** — Copy `:root` vars, shared component styles from index.html. Add catalogue-specific grid/card/sidebar CSS (~400 lines)
2. **HTML structure** — Header, stats bar, filter bar, grid container, sidebar, footer (~300 lines)
3. **Architecture sidebar** — Static 4-layer stack, click handlers, legend (~150 lines)
4. **Card template + offer data** — JS function generating card HTML from the 14-offer array (~300 lines)
5. **Filtering + search** — All filter logic, stats update, card animation (~200 lines)
6. **Card expand/collapse** — Detail reveal, single-expand constraint (~100 lines)
7. **Hover cross-interactions** — Card ↔ sidebar highlighting (~100 lines)
8. **Navigation + polish** — Launch buttons, toasts, back-to-console nav, entrance animations (~80 lines)
9. **Reciprocal link in index.html** — Add catalogue nav button + URL param reader (~15 lines)

**Estimated total:** ~1,650 lines / ~60KB

---

## Catalogue Verification

21. **Offer count:** Page should show 14 offers across 7 verticals
22. **B2B/B2A filter:** Toggle B2A → only 6 cards visible (offers 4, 6, 8, 10, 12, 14)
23. **Vertical filter:** Click "Healthcare" → only offer 11 visible
24. **Carbon filter:** Click "A+/A" → 7 cards visible
25. **Layer filter via sidebar:** Click Layer 3 → all offers using Trust & Governance layer shown
26. **Combined filter:** B2A + Logistics → only offer 4 visible
27. **Search:** Type "drone" → offers 5 and 6 visible
28. **Card expand:** Click details on offer 1 → see latency <2ms, 50 GFLOPS, 80g CO2e/kWh tiles
29. **Card hover → sidebar:** Hover offer 7 (Holographic) → layers 1, 2, 4 glow in sidebar, layer 3 dims
30. **Launch button:** Click "Launch in Console" on offer 1 → navigates to index.html?scenario=factory, Smart Factory scenario auto-selects
31. **Sidebar → cards:** Click Layer 3 in sidebar → cards not using Layer 3 fade out
32. **Stats update:** Apply B2B filter → stats bar shows "8 Offers | 8 B2B | 0 B2A"
33. **Visual consistency:** Screenshot both pages side by side — same visual language, same glass panels, same green accent
34. **Mobile:** Open on 375px viewport — sidebar collapses, filters scroll horizontally, cards stack to 1 column
