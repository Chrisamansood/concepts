# Phase 5 deterministic voice and diagram demo

Build: `phase5-demo`

## Typed fallback

1. Run every required presentation phrase without `Jarvis`; confirm the typed path works.
2. Type ordinary prose containing “next”, “clear”, “circle” or “undo”; confirm rejection.
3. Prepare each approved template. Confirm only the private side-panel preview changes.
4. Run `present diagram`; confirm one crisp SVG appears below ink and above the slide.
5. Highlight `Customer`, `AI Agent` and `Billing`; confirm unrelated nodes dim.
6. Run `show complete diagram`, then `hide diagram`; confirm both are reversible.
7. Resize and enter/exit Presentation Mode; confirm alignment and audience-safe UI.

## Microphone

1. Click Start Voice (listening must never begin automatically).
2. Speak normal unprefixed presentation sentences; confirm no action.
3. Say each required phrase with the `Jarvis` prefix; confirm one execution per final transcript.
4. Repeat a final transcript immediately; confirm deduplication.
5. Deny microphone permission or disconnect recognition; confirm the typed and gesture fallback remains ready.
6. Stop voice; confirm gestures, keyboard navigation and typed commands still work.

## Five-minute demo script

1. Load `test-fixtures/jarvis-pptx-test.pptx` (or a user deck) and enter Presentation Mode.
2. Navigate once with a palm swipe, then hold a stationary palm to show the futuristic radial menu and pinch-select a tool.
3. Say: “Jarvis select laser.” Point at the slide with a peace sign.
4. Say: “Jarvis prepare customer AI billing flow.” Note privately that the draft is ready while the audience still sees no diagram.
5. Say: “Jarvis present diagram.”
6. Say: “Jarvis highlight AI Agent,” then “Jarvis show complete diagram.”
7. Say: “Jarvis hide diagram.”
8. Say: “Jarvis prepare agent orchestration diagram,” then “Jarvis present diagram.”
9. Say: “Jarvis hide diagram,” then “Jarvis prepare AI data platform diagram” and “Jarvis present diagram.”
10. Stop voice. Finish with keyboard next/previous and a gesture pointer to show the fallback remains fully usable.
