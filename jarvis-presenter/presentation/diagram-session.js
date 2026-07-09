import { createDiagramScene, updateDiagramScene } from "./diagram-model.js";
import { getDiagramTemplate } from "./diagram-templates.js";

const DEFAULT_TRANSFORM = Object.freeze({ x: 0, y: 0, scale: 1 });

function clone(value) {
  return structuredClone(value);
}

function normalizeTransform(transform = {}) {
  return {
    x: Math.min(0.62, Math.max(-0.62, Number.isFinite(transform.x) ? transform.x : DEFAULT_TRANSFORM.x)),
    y: Math.min(0.5, Math.max(-0.5, Number.isFinite(transform.y) ? transform.y : DEFAULT_TRANSFORM.y)),
    scale: Math.min(1.6, Math.max(0.55, Number.isFinite(transform.scale) ? transform.scale : DEFAULT_TRANSFORM.scale))
  };
}

function sceneWithTransform(scene, transform = scene?.transform) {
  return { ...clone(scene), transform: normalizeTransform(transform) };
}

function makeInstance(scene, templateId, status, instanceId) {
  const template = getDiagramTemplate(templateId);
  const transformedScene = sceneWithTransform(scene);
  return {
    instanceId,
    templateId,
    name: template.name,
    scene: transformedScene,
    transform: transformedScene.transform,
    status
  };
}

function createDiagramSession({ idPrefix = "diagram_instance" } = {}) {
  let nextId = 1;
  let active = null;
  let shelf = [];
  let overlayMode = "hidden";

  function nextInstanceId() {
    const value = `${idPrefix}_${nextId}`;
    nextId += 1;
    return value;
  }

  function snapshot() {
    return clone({ active, shelf, overlayMode });
  }

  function setOverlayMode(mode) {
    if (!["hidden", "gallery", "shelf"].includes(mode)) throw new Error(`Invalid diagram overlay mode: ${mode}`);
    overlayMode = mode;
    return snapshot();
  }

  function presentTemplate(templateId) {
    const scene = updateDiagramScene(createDiagramScene(templateId), { type: "commit" });
    active = makeInstance(scene, templateId, "active", nextInstanceId());
    return snapshot();
  }

  function presentScene(scene) {
    if (!scene?.templateId) throw new Error("Diagram scene requires a templateId");
    active = makeInstance(scene, scene.templateId, "active", nextInstanceId());
    return snapshot();
  }

  function updateActiveScene(scene) {
    if (!active) throw new Error("No active diagram");
    const transformedScene = sceneWithTransform(scene, scene.transform || active.transform);
    active = { ...active, scene: transformedScene, transform: transformedScene.transform, status: transformedScene.status === "hidden" ? "hidden" : "active" };
    return snapshot();
  }

  function moveActiveBy({ dx = 0, dy = 0 } = {}) {
    if (!active) throw new Error("No active diagram");
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) throw new Error("Diagram movement delta must be finite");
    const transform = normalizeTransform({
      ...active.transform,
      x: active.transform.x + dx,
      y: active.transform.y + dy
    });
    const scene = sceneWithTransform(active.scene, transform);
    active = { ...active, scene, transform };
    return snapshot();
  }

  function clearActive() {
    active = null;
    return snapshot();
  }

  function parkActive() {
    if (!active) throw new Error("No active diagram to park");
    const parkedScene = sceneWithTransform({ ...clone(active.scene), status: "committed" }, active.transform);
    const parked = { ...clone(active), status: "parked", scene: parkedScene, transform: parkedScene.transform };
    shelf = [...shelf, parked];
    active = null;
    return snapshot();
  }

  function restoreParked(instanceId) {
    const index = shelf.findIndex((item) => item.instanceId === instanceId);
    if (index < 0) throw new Error("Parked diagram not found");
    const [item] = shelf.splice(index, 1);
    shelf = [...shelf];
    const scene = sceneWithTransform({ ...clone(item.scene), status: "committed" }, item.transform);
    active = { ...clone(item), status: "active", scene, transform: scene.transform };
    return snapshot();
  }

  function removeParked(instanceId) {
    if (!shelf.some((item) => item.instanceId === instanceId)) throw new Error("Parked diagram not found");
    shelf = shelf.filter((item) => item.instanceId !== instanceId);
    return snapshot();
  }

  return Object.freeze({
    snapshot,
    setOverlayMode,
    presentTemplate,
    presentScene,
    updateActiveScene,
    moveActiveBy,
    clearActive,
    parkActive,
    restoreParked,
    removeParked
  });
}

export { createDiagramSession };
