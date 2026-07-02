# Phase 4B replay verification

Verified on 28 June 2026 against build `phase4-replay`.

## Core fixture results

Each fixture ran three consecutive times through the same `processHands` pipeline used by live MediaPipe results.

| Fixture | Result | Deterministic |
|---|---|---|
| Index drawing down and sideways | Pass | Yes |
| Circle with orientation/position changes | Pass | Yes |
| Peace pointer without drawing | Pass | Yes |
| Stationary palm opens menu | Pass | Yes |
| Fast palm swipe advances slide without menu | Pass | Yes |
| One hand to two hands | Pass | Yes |
| Two-hand pinch zoom | Pass | Yes |
| Brief and sustained tracking loss while drawing | Pass | Yes |
| Palm → point → pinch menu selection with open fingers | Pass | Yes |

The palm-swipe fixture emitted exactly one `presentation.next` command at 766 ms and no `menu.open` violation.

The menu-selection regression fixture emitted exactly one `tool.select` command at 1,056 ms. The menu remained open during the intermediate hand shape and accepted a thumb-index pinch even while the other fingers remained open.

## Privacy assertions

- Recordings contain timestamps, normalized landmarks, handedness, confidence/classification metadata and fixture expectations.
- Recordings contain no image, video, audio, blob or data-URL fields.
- Recording is capped at 60 seconds or 1,800 frames by default.
- Recording requires explicit use of the developer-only replay lab.

## Harness

Open:

`http://127.0.0.1:5197/?v=phase4-replay&debugReplay=1`

The normal presentation URL does not display the replay lab. Presentation Mode hides all replay controls even when the debug flag is present.

Live recordings still require a short presenter-controlled camera session to replace or supplement the synthetic canonical fixtures with room-specific examples.
