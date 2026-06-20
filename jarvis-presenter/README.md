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

Use Chrome for the best screen-capture and voice-command support.

## Teams Flow

1. Open Jarvis Presenter in Chrome.
2. Click `Share Source`.
3. Select the screen, app window, browser tab, PDF, or deck you want to present.
4. Click `Start Hand Control` and allow camera permission.
5. In Microsoft Teams, share the Jarvis Presenter browser window.

Participants see the captured source plus the live annotation layer.

## Hand Control

- Point with your index finger to move the pointer.
- Pinch index finger and thumb together to draw.
- Hold the pinch past the draw delay before drawing starts.
- Release the pinch to stop drawing.
- Show an open palm to pause safely.
- Clap both open hands together to lock drawing; clap again to resume.
- Hold two open hands apart for 1 second to clear the overlay.
- Keep `Mirror movement` on if you want the pointer to move like a mirror.
- Turn `Mirror movement` off if your camera/browser reverses left and right.
- Select `Arrow`, `Circle`, or `Spot` first, then pinch-drag to place that shape.
- Select `Erase`, then pinch over an area to erase it.
- Keep your hand clearly visible to the webcam with decent light.

## Gesture Tuning

- `Pinch sensitivity`: higher means easier drawing, lower means fewer accidents.
- `Smoothing`: higher makes the pointer steadier but less immediate.
- `Draw delay`: prevents accidental marks when fingers briefly touch.
- `Dead zone`: ignores tiny movements to reduce jitter.

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
