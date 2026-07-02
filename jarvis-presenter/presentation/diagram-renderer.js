const SVG_NS = "http://www.w3.org/2000/svg";

function createSvg(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function renderDiagram(svg, scene) {
  svg.replaceChildren();
  if (!scene || scene.status !== "committed") { svg.hidden = true; return; }
  svg.hidden = false;
  svg.setAttribute("viewBox", "0 0 1000 600");
  const defs = createSvg("defs");
  const marker = createSvg("marker", { id: "diagram-arrow", markerWidth: 10, markerHeight: 10, refX: 8, refY: 3, orient: "auto", markerUnits: "strokeWidth" });
  marker.append(createSvg("path", { d: "M0,0 L0,6 L9,3 z", fill: "#39f6ff" })); defs.append(marker); svg.append(defs);
  const byId = new Map(scene.nodes.map((node) => [node.id, node]));
  for (const edge of scene.edges) {
    const from = byId.get(edge.from); const to = byId.get(edge.to); if (!from || !to) continue;
    svg.append(createSvg("line", { x1: (from.x + from.width / 2) * 1000, y1: (from.y + from.height / 2) * 600, x2: (to.x + to.width / 2) * 1000, y2: (to.y + to.height / 2) * 600, class: "diagram-edge", "marker-end": "url(#diagram-arrow)" }));
  }
  for (const node of scene.nodes) {
    const group = createSvg("g", { class: `diagram-node${scene.highlight && scene.highlight !== node.label ? " dimmed" : ""}`, "data-node-id": node.id });
    group.append(createSvg("rect", { x: node.x * 1000, y: node.y * 600, width: node.width * 1000, height: node.height * 600, rx: 16 }));
    const text = createSvg("text", { x: (node.x + node.width / 2) * 1000, y: (node.y + node.height / 2) * 600, "text-anchor": "middle", "dominant-baseline": "middle" }); text.textContent = node.label; group.append(text); svg.append(group);
  }
}

export { renderDiagram };
