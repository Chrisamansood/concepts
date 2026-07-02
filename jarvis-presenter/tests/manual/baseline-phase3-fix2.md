# Jarvis Presenter phase3-fix2 baseline

Recorded before the `phase4-foundation` migration on 28 June 2026.

## Automated browser baseline

- Tool selection: passed.
- Colour selection: passed.
- Typed command (`green pen`): passed.
- Presentation Mode enter and exit: passed.
- Browser console errors: none.
- PowerPoint test fixture loaded as two slides in Google Chrome.
- Arrow-key next and previous navigation: passed.

## Manual gesture regression checklist

Run with the camera in Google Chrome after loading a two-slide deck.

- [ ] Index finger draws with Pen.
- [ ] Index finger draws Arrow, Circle and Spotlight without stopping on downward motion.
- [ ] Index finger uses Eraser.
- [ ] Laser pointer and laser drawing work.
- [ ] Peace sign points without drawing.
- [ ] Peace sign pans while zoomed.
- [ ] Peace swipe left performs one Undo.
- [ ] Peace swipe right performs one Redo.
- [ ] Fist returns to idle.
- [ ] Stationary open palm held for 0.5 seconds opens the tool menu.
- [ ] Fast palm swipe left moves to the next slide without opening the menu.
- [ ] Fast palm swipe right moves to the previous slide without opening the menu.
- [ ] Point and pinch selects one radial-menu tool.
- [ ] Single clap locks and resumes controls.
- [ ] Two open palms held clear drawings only after confirmation hold.
- [ ] Two-hand pinch zooms in and out without triggering a one-hand palm action.
- [ ] Double clap resets zoom.
- [ ] A second hand entering suppresses one-hand actions until hand count stabilizes.
- [ ] A hand leaving two-hand mode does not immediately fire a one-hand action.
- [ ] Brief tracking loss stops drawing and does not connect the old stroke to the new point.

## Non-gesture regression checklist

- [x] Panel tool and colour buttons.
- [x] Typed-command input.
- [x] Canvas Undo and Redo buttons.
- [x] PowerPoint load and render.
- [x] Arrow-key slide navigation.
- [x] Presentation Mode enter and exit.
- [x] Debug command audit is hidden in Presentation Mode.
- [ ] Image slide load and next/previous navigation.
- [ ] Screen-share picker startup, cancellation and permission messaging.
- [ ] Camera startup, cancellation and permission messaging.
- [ ] Voice startup, cancellation and permission messaging.

Camera, microphone, screen-sharing and live gestures require presenter-controlled permission checks and are intentionally not granted during automated testing.
