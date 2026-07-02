const theme = { fill: "rgba(5,22,35,.82)", stroke: "#39f6ff", text: "#e8fdff" };
const node = (id, label, x, y, width = 0.2, height = 0.12) => ({ id, type: "rectangle", label, x, y, width, height, style: { ...theme } });
const edge = (id, from, to) => ({ id, from, to, type: "arrow", style: { stroke: theme.stroke } });

const templates = Object.freeze({
  "customer-ai-billing": { id: "customer-ai-billing", name: "Customer AI Billing Flow", layout: "flow-horizontal", nodes: [node("customer", "Customer", .1, .42), node("ai-agent", "AI Agent", .4, .42), node("billing", "Billing", .7, .42)], edges: [edge("customer-agent", "customer", "ai-agent"), edge("agent-billing", "ai-agent", "billing")] },
  "agent-orchestration": { id: "agent-orchestration", name: "Agent Orchestration", layout: "hub-spoke", nodes: [node("orchestrator", "Orchestrator", .4, .42), node("domain-agent", "Domain Agent", .4, .12), node("context-agent", "Context Agent", .08, .42), node("action-agent", "Action Agent", .72, .42), node("governance-agent", "Governance Agent", .4, .72)], edges: [edge("o-domain", "orchestrator", "domain-agent"), edge("o-context", "orchestrator", "context-agent"), edge("o-action", "orchestrator", "action-agent"), edge("o-governance", "orchestrator", "governance-agent")] },
  "ai-data-platform": { id: "ai-data-platform", name: "AI Data Platform", layout: "platform", nodes: [node("data-sources", "Data Sources", .04, .4, .18), node("data-platform", "Data Platform", .28, .4, .18), node("models", "Models", .52, .4, .18), node("applications", "Applications", .76, .4, .18), node("governance", "Governance", .28, .68, .18)], edges: [edge("sources-platform", "data-sources", "data-platform"), edge("platform-models", "data-platform", "models"), edge("models-apps", "models", "applications"), edge("platform-governance", "data-platform", "governance")] }
});

function getDiagramTemplate(id) {
  if (!templates[id]) throw new Error("Unknown diagram template");
  return structuredClone(templates[id]);
}

export { getDiagramTemplate, templates };
