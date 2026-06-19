# AgentCRM — AI-Powered CRM Prototype

> What happens when AI agents run your CRM instead of just assisting? This interactive prototype lets you experience it.

**[Live Demo](https://chrisamansood.github.io/concepts/agentic-crm/)** · Built by [Chris Sood](https://linkedin.com/in/chrisamansood)

---

## What is AgentCRM?

AgentCRM is a fully interactive prototype of an AI-native CRM where autonomous agents research, draft, score, and act — while humans supervise and approve. No backend, no API calls, no dependencies. Just open `index.html` and play.

### The Vision

Traditional CRMs are databases with forms. AgentCRM flips the model:

- **Agents research** — continuously scanning signals, scoring risk, finding opportunities
- **Agents draft** — writing outreach emails, generating renewal offers, creating reports
- **Agents act** — resolving billing disputes, escalating at-risk accounts, scheduling meetings
- **Humans approve** — reviewing agent proposals, adjusting confidence thresholds, steering strategy

## Features

### Dashboard
Command center showing real-time agent activity, customer spotlight with AI churn scoring, and an orchestration map visualizing agent coordination.

### Pipeline
Kanban board with AI-enriched deal cards. Each deal shows agent confidence scores, risk indicators, and which agents are actively working it.

### Account Intelligence
Deep-dive into any account with AI risk signals, agent research streaming (typewriter effect), pending approvals with approve/modify/decline workflow, and live orchestration map.

### Agent Inbox
Centralized approval queue where you review and act on agent recommendations — each with confidence scores and reasoning traces.

### Ticket Management
AI-prioritized ticket queue with zone anomaly detection, parent/child ticket grouping, and automated routing confidence scores.

### Persona Toggle
Switch between **B2B SaaS** (deal pipeline, ARR, enterprise accounts) and **Telecom** (subscriber management, churn, billing) to see how agentic CRM adapts across industries.

## Try the Golden Path

1. **Dashboard** — Notice the at-risk customer spotlight
2. **Pipeline** — Click through to see the deal in negotiation
3. **Account Intel** — Run the agent research (watch the typewriter stream)
4. **Approvals** — Review and approve the agent's recommended actions
5. **Watch** — Toast notifications show agents working in the background

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Markup | HTML5 | Zero build step, instant load |
| Styling | CSS3 | Custom properties, no preprocessor |
| Logic | Vanilla JS | No framework, no bundler |
| Fonts | Source Sans 3 | Google Fonts CDN |
| Hosting | GitHub Pages | One click deploy |

**Zero dependencies. Zero build steps. Just open and explore.**

## File Structure

```
agentic-crm/
  index.html          ← SPA shell with all 6 views
  css/
    style.css         ← Design tokens + all component styles
  js/
    app.js            ← Router, data, interactions, agent simulation
  README.md
```

## Run Locally

```bash
# Clone
git clone https://github.com/chrisamansood/agentic-crm.git
cd agentic-crm

# Open (macOS)
open index.html

# Or serve locally
python3 -m http.server 8000
# → http://localhost:8000
```

## Design Language

- **Warm cream** background (#F4EEE5) — approachable, not cold
- **Coral/orange** gradient hero cards — energy without aggression  
- **Dark sidebar** (#161B26) — grounding anchor
- **Source Sans 3** — professional, readable at all sizes
- **Animated orchestration maps** — agents as a visible, living system
- **Typewriter streaming** — AI research feels real, not instant

## About

Built as a portfolio piece to demonstrate what agentic AI looks like in a CRM context. The prototype is intentionally interactive — visitors should spend 5+ minutes exploring, not just reading.

**Chris Sood** — Agentic AI Product Manager
- [LinkedIn](https://linkedin.com/in/chrisamansood)
- [X/Twitter](https://x.com/Sood_Chris)
- [Medium](https://chrisamansood.medium.com)

---

*This is a prototype with simulated data. No real customer information is used.*
