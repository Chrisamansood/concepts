# Diagram Shelf Foundation Checklist

Build: `diagram-shelf-foundation`

## Launch

1. Run `./launch-jarvis.command`.
2. Open the printed local URL in Chrome.
3. Confirm the page loads without console errors.
4. Confirm the right-side Diagram Shelf is hidden on initial load.

## Mouse / Click Shelf Flow

1. Click `Open Diagram Shelf`.
2. Confirm at least six named diagram cards are visible.
3. Select `Customer AI Billing Flow`.
4. Confirm the diagram appears full-size on the stage.
5. Open the Diagram Shelf again.
6. Click `Park Active`.
7. Confirm the stage diagram disappears and the diagram appears in `Parked`.
8. Select the parked diagram thumbnail.
9. Confirm it returns to the stage and is removed from `Parked`.
10. Present another template from the gallery.

## Existing Typed / Chrome Command Flow

1. Run `Jarvis present customer AI billing flow` through the typed command box.
2. Confirm the billing diagram appears.
3. Run `Jarvis highlight AI Agent`.
4. Confirm unrelated nodes dim.
5. Run `Jarvis show complete diagram`.
6. Confirm the full diagram returns.
7. Run `Jarvis hide diagram`.
8. Confirm the diagram is hidden.

## Radial Menu

1. Start hand control only from a user click.
2. Open palm hold to show the radial menu.
3. Select `Diagrams`.
4. Confirm the Diagram Shelf opens.
5. Reopen the radial menu and select existing tool entries.
6. Confirm pen, arrow, circle, spotlight, eraser and laser still select correctly.

## Preservation

1. Load an image or PowerPoint deck through `Load Slides`.
2. Confirm next/previous slide controls still work.
3. Draw with pen.
4. Select laser and confirm laser mode still works.
5. Use zoom controls and reset zoom.
6. Enter Presentation Mode.
7. Confirm the shelf is hidden unless intentionally opened.
8. Exit Presentation Mode.

## Out Of Scope Confirmation

1. Confirm there is no drag-to-park behavior.
2. Confirm there is no pinch-to-grab diagram movement.
3. Confirm parked diagrams are restored by explicit selection.
4. Confirm no FluidVoice UI or bridge has returned.
