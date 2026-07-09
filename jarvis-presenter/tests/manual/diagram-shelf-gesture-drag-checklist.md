# Diagram Shelf Gesture Drag Checklist

Build: `diagram-shelf-management-fix`

## Mouse Drag Baseline

1. Launch Jarvis and open the verified local URL in Chrome.
2. Click `Open Diagram Shelf`.
3. Present `Customer AI Billing Flow`.
4. Open the shelf again.
5. Click and drag the active diagram around the stage.
6. Release outside the right dock zone.
7. Confirm the diagram remains on stage in the new position.

## Drag To Park

1. Open the shelf while a diagram is active.
2. Drag the diagram toward the right edge.
3. Confirm the right dock zone appears and highlights.
4. Release inside the dock zone.
5. Confirm the diagram leaves the stage and appears in `Parked`.
6. Restore the parked diagram by selecting its shelf thumbnail.

## Pinch Grab

1. Start hand control from a user click.
2. Open `Diagrams` from the radial menu or shelf button.
3. Point at a gallery card and confirm it highlights.
4. Pinch the highlighted card.
5. Confirm that diagram appears on stage and the shelf closes.
6. Pinch inside the active diagram.
7. Move the hand and confirm the whole diagram follows.
8. Release pinch outside the dock zone and confirm the diagram stays on stage.
9. Repeat and release near the right dock zone to park it.
10. Point at the parked thumbnail and confirm it highlights.
11. Pinch the parked thumbnail and confirm the diagram restores to the stage.

## Gesture Shelf Controls

1. Open the shelf while a diagram is active.
2. Point at `Park Active` and confirm the button highlights.
3. Pinch `Park Active` and confirm the diagram parks.
4. Restore the parked diagram.
5. Open the shelf again.
6. Point at `Hide` and confirm the button highlights.
7. Pinch `Hide` and confirm the active diagram hides.
8. Open/present a diagram again, then point at the `Close` button.
9. Pinch `Close` and confirm the shelf closes without using the mouse.

## Gesture Stabilization Regression

1. With the shelf open, move to `Hide`, pinch, and confirm the diagram hides.
2. Open the radial menu with a palm hold.
3. Point to `Laser`, pinch, and confirm the radial menu closes.
4. Repeat with `Pen` and confirm the radial menu closes.
5. Start drawing, briefly relax the hand, and confirm a short accidental palm shape does not leave the radial menu stuck open.
6. Use two-hand pinch zoom in and out.
7. Confirm zoom begins after the normal hold and does not feel blocked by diagram grab state.
8. If zoom feels rough, close the shelf and repeat to confirm whether the shelf overlay is involved.

## Annotation Priority

1. Present a diagram, then close the shelf.
2. Select `Laser` from the radial menu.
3. Point/laser over the middle of the diagram.
4. Confirm the diagram does not move.
5. Select an annotation tool such as `Pen` or `Arrow`.
6. Draw over the middle of the diagram.
7. Confirm the drawing action happens over the diagram and the diagram stays in place.
8. Reopen `Diagrams`.
9. Pinch inside the diagram and confirm it can be moved only while the shelf is open.

## Regression Checks

1. With the shelf closed, confirm pen drawing still works.
2. Confirm laser mode still works.
3. Confirm radial menu tool selection still works.
4. Confirm slide navigation still works for loaded slides.
5. Confirm two-hand zoom still works.
6. Confirm Presentation Mode keeps the shelf and dock hidden unless explicitly opened.

## Out Of Scope Confirmation

1. Confirm there is still only one active full-size diagram.
2. Confirm no persistent Architecture Library was added.
3. Confirm no Diagram Twin reconstruction was started.
4. Confirm no FluidVoice UI or bridge returned.
