# Phase 4C calibration and safety checkpoint

Build: `phase4c-calibration-safety` (checkpoint completed before Phase 5 demo integration)

## Automated gate

- Run `node --check app.js`.
- Run `node --test tests/unit/*.test.js`.
- In the replay lab, run every fixture three times and confirm identical traces.

## Live Chrome gate

1. Open Calibration and finish all ten steps in under three minutes.
2. Create, select, rename, export and import a profile. Reload and confirm selection persists.
3. Import an invalid profile version and confirm a clear error without presentation interruption.
4. Draw with one finger; briefly cover the drawing hand for two inference frames. Confirm ink suspends.
5. Hide the drawing hand for 150 ms. Confirm the stroke ends and the returned point does not join the old segment.
6. Keep the hand absent for 500 ms. Confirm Standby/IDLE and a hidden cursor.
7. Return the hand and confirm three stable frames are required before action.
8. Move an open palm quickly. Confirm slide navigation and no radial menu.
9. Hold an open palm stationary. Confirm the radial menu and no slide navigation.
10. Move from palm to point to pinch. Confirm the menu stays open and selects once after two stable pinch frames.
11. Bring in a second hand. Confirm new one-hand commands are suppressed during confirmation and two-hand mode.
12. Release one hand. Confirm no immediate single-hand action.
13. Release two open palms before the full clear countdown. Confirm nothing clears.
14. Verify PowerPoint loading, drawing, zoom, navigation and Presentation Mode.

Calibration stores only versioned numeric/profile preferences. It never stores camera frames, microphone audio or identifying media.
