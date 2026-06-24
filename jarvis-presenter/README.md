# Chris's Jarvis MVP

A browser-based presenter cockpit for Teams and Google Meet screen sharing.

## Run

```bash
python3 -m http.server 5177
```

Then open:

```text
http://127.0.0.1:5177
```

Use Chrome for the best screen-capture and hand-tracking support.

## Presentation UI

- Click `Enter Present Mode` to hide the control rail and fill the browser viewport.
- Press `Escape` or use the subtle bottom-right `Exit` button to return.
- `Show camera` controls the camera picture-in-picture. It is hidden automatically when entering Present Mode and restored when exiting.
- Source, Controls, Tools, Tuning, and Status are collapsible panel sections.
- The on-stage indicator shows the current gesture state and active drawing feedback.
- The first-visit gesture guide can be reopened with `Gesture Guide`.

## Teams Flow

1. Open Jarvis Presenter in Chrome.
2. Click `Share Source`.
3. Select the screen, app window, browser tab, PDF, or deck you want to present.
4. Click `Start Hand Control` and allow camera permission.
5. In Microsoft Teams, share the Jarvis Presenter browser window.

Participants see the captured source plus the live annotation layer.

## Hand Control

- Extend only your index finger to draw with the active tool.
- Make a peace sign to move the pointer without drawing.
- Make a fist to idle and hide the cursor.
- Show an open palm to pause safely.
- Clap both open hands together to lock drawing; clap again to resume.
- Hold two open hands apart for 1 second to clear the overlay.
- Keep `Mirror movement` on if you want the pointer to move like a mirror.
- Turn `Mirror movement` off if your camera/browser reverses left and right.
- Select `Arrow`, `Circle`, or `Spot` first, then draw with index finger to place that shape.
- Select `Erase`, then use index finger to erase.
- Keep your hand clearly visible to the webcam with decent light.

## Gesture Tuning

- `Stability`: steadies the cursor when your hand is slow or still.
- `Responsiveness`: helps the cursor keep up with faster hand movement.
- `Prediction`: compensates for camera/model latency.
- `Prime delay`: controls how long index-only must be held before drawing starts.

## MVP Voice Commands

- `arrow` places an arrow in the center
- `circle` places a circle in the center
- `spotlight` or `highlight` places a spotlight in the center
- `erase` clears the center area
- `clear`
- `red`, `blue`, `yellow`, `green`, `white`
- combine color and shape, such as `red arrow` or `yellow circle`

## Notes

- If you share PowerPoint directly in Teams, the overlay will not be visible.
- Share the Jarvis Presenter window itself.
- Some embedded preview browsers block screen capture and speech recognition. Use Chrome for real testing.
- If speech recognition does not respond, use the command box to test the same actions.
