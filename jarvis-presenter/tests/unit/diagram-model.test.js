import test from "node:test";
import assert from "node:assert/strict";
import { createDiagramScene, updateDiagramScene } from "../../presentation/diagram-model.js";

test("creates three deterministic editable templates", () => {
  const billing = createDiagramScene("customer-ai-billing");
  const agents = createDiagramScene("agent-orchestration");
  const data = createDiagramScene("ai-data-platform");
  assert.deepEqual(billing.nodes.map((node) => node.label), ["Customer", "AI Agent", "Billing"]);
  assert.equal(agents.nodes.length, 5);
  assert.equal(data.edges.length, 4);
  assert.deepEqual(createDiagramScene("customer-ai-billing"), billing);
});

test("draft stays hidden until explicit commit state", () => {
  const draft = createDiagramScene("customer-ai-billing");
  assert.equal(draft.status, "draft");
  const committed = updateDiagramScene(draft, { type: "commit" });
  assert.equal(committed.status, "committed");
  assert.equal(draft.status, "draft");
});

test("highlight uses exact object labels and is reversible", () => {
  const scene = updateDiagramScene(createDiagramScene("customer-ai-billing"), { type: "commit" });
  assert.equal(updateDiagramScene(scene, { type: "highlight", label: "AI Agent" }).highlight, "AI Agent");
  assert.equal(updateDiagramScene(scene, { type: "highlight", label: null }).highlight, null);
  assert.throws(() => updateDiagramScene(scene, { type: "highlight", label: "Agent" }), /not found/);
});
