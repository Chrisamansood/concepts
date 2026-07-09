import test from "node:test";
import assert from "node:assert/strict";
import { createDiagramSession } from "../../presentation/diagram-session.js";

test("starts empty", () => {
  const session = createDiagramSession();
  assert.deepEqual(session.snapshot(), { active: null, shelf: [], overlayMode: "hidden" });
});

test("presents a template as the active diagram", () => {
  const session = createDiagramSession({ idPrefix: "test_diagram" });
  const state = session.presentTemplate("customer-ai-billing");
  assert.equal(state.active.instanceId, "test_diagram_1");
  assert.equal(state.active.templateId, "customer-ai-billing");
  assert.equal(state.active.name, "Customer AI Billing Flow");
  assert.equal(state.active.status, "active");
  assert.equal(state.active.scene.status, "committed");
});

test("parks active diagram and restores it from the shelf", () => {
  const session = createDiagramSession({ idPrefix: "test_diagram" });
  session.presentTemplate("customer-ai-billing");
  session.moveActiveBy({ dx: 0.1, dy: -0.05 });
  const parked = session.parkActive();
  assert.equal(parked.active, null);
  assert.equal(parked.shelf.length, 1);
  assert.equal(parked.shelf[0].status, "parked");
  assert.equal(parked.shelf[0].scene.status, "committed");
  assert.deepEqual(parked.shelf[0].transform, { x: 0.1, y: -0.05, scale: 1 });

  const restored = session.restoreParked("test_diagram_1");
  assert.equal(restored.active.instanceId, "test_diagram_1");
  assert.equal(restored.active.status, "active");
  assert.equal(restored.active.scene.status, "committed");
  assert.deepEqual(restored.active.transform, { x: 0.1, y: -0.05, scale: 1 });
  assert.equal(restored.shelf.length, 0);
});

test("rejects invalid template and shelf IDs", () => {
  const session = createDiagramSession();
  assert.throws(() => session.presentTemplate("missing-template"), /Unknown diagram template/);
  assert.throws(() => session.parkActive(), /No active diagram/);
  assert.throws(() => session.restoreParked("missing"), /Parked diagram not found/);
  assert.throws(() => session.removeParked("missing"), /Parked diagram not found/);
});

test("keeps shelf order stable", () => {
  const session = createDiagramSession({ idPrefix: "test_diagram" });
  session.presentTemplate("customer-ai-billing");
  session.parkActive();
  session.presentTemplate("agent-orchestration");
  session.parkActive();
  session.presentTemplate("ai-data-platform");
  session.parkActive();
  assert.deepEqual(session.snapshot().shelf.map((item) => item.instanceId), ["test_diagram_1", "test_diagram_2", "test_diagram_3"]);
  session.restoreParked("test_diagram_2");
  assert.deepEqual(session.snapshot().shelf.map((item) => item.instanceId), ["test_diagram_1", "test_diagram_3"]);
});

test("state snapshots are safe copies", () => {
  const session = createDiagramSession();
  const state = session.presentTemplate("customer-ai-billing");
  state.active.scene.nodes[0].label = "Changed";
  assert.equal(session.snapshot().active.scene.nodes[0].label, "Customer");
});

test("moves active diagram with bounded serializable transform", () => {
  const session = createDiagramSession();
  let state = session.presentTemplate("customer-ai-billing");
  assert.deepEqual(state.active.transform, { x: 0, y: 0, scale: 1 });
  state = session.moveActiveBy({ dx: 0.2, dy: -0.1 });
  assert.deepEqual(state.active.transform, { x: 0.2, y: -0.1, scale: 1 });
  assert.deepEqual(state.active.scene.transform, state.active.transform);
  state = session.moveActiveBy({ dx: 10, dy: -10 });
  assert.deepEqual(state.active.transform, { x: 0.62, y: -0.5, scale: 1 });
  assert.throws(() => session.moveActiveBy({ dx: Number.NaN, dy: 0 }), /finite/);
});

test("overlay mode is explicit and validated", () => {
  const session = createDiagramSession();
  assert.equal(session.setOverlayMode("gallery").overlayMode, "gallery");
  assert.equal(session.setOverlayMode("shelf").overlayMode, "shelf");
  assert.throws(() => session.setOverlayMode("dock-preview"), /Invalid diagram overlay mode/);
});

test("clears the active diagram without changing parked diagrams", () => {
  const session = createDiagramSession();
  session.presentTemplate("customer-ai-billing");
  session.parkActive();
  session.presentTemplate("agent-orchestration");
  const state = session.clearActive();
  assert.equal(state.active, null);
  assert.equal(state.shelf.length, 1);
  assert.equal(state.shelf[0].templateId, "customer-ai-billing");
});
