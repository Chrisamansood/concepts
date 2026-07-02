import { getDiagramTemplate } from "./diagram-templates.js";

function createDiagramScene(templateId) {
  const template = getDiagramTemplate(templateId);
  return { id: `diagram-${templateId}`, templateId, name: template.name, status: "draft", layout: template.layout, nodes: template.nodes, edges: template.edges, highlight: null, revision: 1 };
}

function updateDiagramScene(scene, operation) {
  if (!scene) throw new Error("No diagram scene");
  const next = structuredClone(scene);
  if (operation.type === "highlight") {
    if (operation.label && !next.nodes.some((node) => node.label === operation.label)) throw new Error(`Diagram label not found: ${operation.label}`);
    next.highlight = operation.label || null;
  } else if (operation.type === "commit") next.status = "committed";
  else if (operation.type === "hide") next.status = "hidden";
  else if (operation.type === "show") next.status = "committed";
  else throw new Error("Unsupported diagram operation");
  next.revision += 1;
  return next;
}

export { createDiagramScene, updateDiagramScene };
