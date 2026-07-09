const theme = { fill: "rgba(5,22,35,.82)", stroke: "#39f6ff", text: "#e8fdff" };
const node = (id, label, x, y, width = 0.2, height = 0.12) => ({ id, type: "rectangle", label, x, y, width, height, style: { ...theme } });
const edge = (id, from, to) => ({ id, from, to, type: "arrow", style: { stroke: theme.stroke } });

function normalizeLookup(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeTemplate(template) {
  const highlightLabels = template.highlightLabels || template.nodes.map((item) => item.label);
  return Object.freeze({
    shortName: template.name,
    category: "Diagram",
    voiceAliases: [],
    thumbnailLabel: template.name,
    highlightLabels,
    ...template,
    aliases: Object.freeze([...new Set([template.name, template.shortName, ...(template.voiceAliases || [])].filter(Boolean).map(normalizeLookup))]),
    highlightAliases: Object.freeze(Object.fromEntries(highlightLabels.map((label) => [normalizeLookup(label), label])))
  });
}

const templateRegistry = [
  makeTemplate({
    id: "customer-ai-billing",
    name: "Customer AI Billing Flow",
    shortName: "Billing Flow",
    category: "AI / BSS",
    voiceAliases: ["customer ai billing", "customer billing flow", "billing flow", "customer ai billing diagram", "customer billing diagram"],
    thumbnailLabel: "Customer -> AI Agent -> Billing",
    layout: "flow-horizontal",
    nodes: [node("customer", "Customer", .1, .42), node("ai-agent", "AI Agent", .4, .42), node("billing", "Billing", .7, .42)],
    edges: [edge("customer-agent", "customer", "ai-agent"), edge("agent-billing", "ai-agent", "billing")]
  }),
  makeTemplate({
    id: "agent-orchestration",
    name: "Agent Orchestration",
    shortName: "Orchestration",
    category: "AI Agents",
    voiceAliases: ["agent orchestration diagram", "orchestration diagram"],
    thumbnailLabel: "Context / Domain / Action agents",
    layout: "hub-spoke",
    nodes: [node("orchestrator", "Orchestrator", .4, .42), node("domain-agent", "Domain Agent", .4, .12), node("context-agent", "Context Agent", .08, .42), node("action-agent", "Action Agent", .72, .42), node("governance-agent", "Governance Agent", .4, .72)],
    edges: [edge("o-domain", "orchestrator", "domain-agent"), edge("o-context", "orchestrator", "context-agent"), edge("o-action", "orchestrator", "action-agent"), edge("o-governance", "orchestrator", "governance-agent")]
  }),
  makeTemplate({
    id: "ai-data-platform",
    name: "AI Data Platform",
    shortName: "Data Platform",
    category: "AI Platform",
    voiceAliases: ["ai data platform diagram", "data platform diagram"],
    thumbnailLabel: "Sources -> Platform -> Models",
    layout: "platform",
    nodes: [node("data-sources", "Data Sources", .04, .4, .18), node("data-platform", "Data Platform", .28, .4, .18), node("models", "Models", .52, .4, .18), node("applications", "Applications", .76, .4, .18), node("governance", "Governance", .28, .68, .18)],
    edges: [edge("sources-platform", "data-sources", "data-platform"), edge("platform-models", "data-platform", "models"), edge("models-apps", "models", "applications"), edge("platform-governance", "data-platform", "governance")]
  }),
  makeTemplate({
    id: "telco-bss-order-flow",
    name: "Telco BSS Order Flow",
    shortName: "BSS Order Flow",
    category: "Telecom BSS",
    voiceAliases: ["bss order flow", "telco order flow", "order flow diagram"],
    thumbnailLabel: "Channel -> Order -> Billing",
    layout: "flow-horizontal",
    nodes: [node("customer", "Customer", .04, .42, .14), node("channel", "Channel", .2, .42, .14), node("order-capture", "Order Capture", .36, .42, .16), node("product-catalog", "Product Catalog", .55, .42, .17), node("billing", "Billing", .75, .3, .14), node("provisioning", "Provisioning", .75, .54, .14)],
    edges: [edge("customer-channel", "customer", "channel"), edge("channel-order", "channel", "order-capture"), edge("order-catalog", "order-capture", "product-catalog"), edge("catalog-billing", "product-catalog", "billing"), edge("catalog-provisioning", "product-catalog", "provisioning")]
  }),
  makeTemplate({
    id: "customer-support-agent-loop",
    name: "Customer Support Agent Loop",
    shortName: "Support Agent Loop",
    category: "AI Support",
    voiceAliases: ["support agent loop", "customer support loop", "support loop diagram"],
    thumbnailLabel: "Customer -> Agent -> Action",
    layout: "loop",
    nodes: [node("customer", "Customer", .08, .42, .16), node("support-agent", "Support Agent", .34, .26, .18), node("knowledge-base", "Knowledge Base", .62, .18, .18), node("action-tool", "Action Tool", .62, .48, .18), node("case-system", "Case System", .34, .68, .18), node("human-escalation", "Human Escalation", .08, .68, .18)],
    edges: [edge("customer-agent", "customer", "support-agent"), edge("agent-kb", "support-agent", "knowledge-base"), edge("agent-tool", "support-agent", "action-tool"), edge("tool-case", "action-tool", "case-system"), edge("case-human", "case-system", "human-escalation"), edge("human-customer", "human-escalation", "customer")]
  }),
  makeTemplate({
    id: "ai-governance-guardrails",
    name: "AI Governance Guardrails",
    shortName: "Governance Guardrails",
    category: "AI Governance",
    voiceAliases: ["governance guardrails", "ai guardrails", "guardrails diagram"],
    thumbnailLabel: "Policy -> Gateway -> Audit",
    layout: "flow-horizontal",
    nodes: [node("user-request", "User Request", .06, .42, .16), node("policy-check", "Policy Check", .27, .42, .16), node("model-gateway", "Model Gateway", .48, .42, .16), node("approved-action", "Approved Action", .72, .42, .18), node("audit-log", "Audit Log", .48, .68, .16), node("human-review", "Human Review", .27, .68, .16)],
    edges: [edge("request-policy", "user-request", "policy-check"), edge("policy-gateway", "policy-check", "model-gateway"), edge("gateway-action", "model-gateway", "approved-action"), edge("gateway-audit", "model-gateway", "audit-log"), edge("policy-review", "policy-check", "human-review")]
  }),
  makeTemplate({
    id: "oss-network-incident-flow",
    name: "OSS Network Incident Flow",
    shortName: "Network Incident Flow",
    category: "Telecom OSS",
    voiceAliases: ["network incident flow", "oss incident flow", "incident flow diagram"],
    thumbnailLabel: "Alarm -> RCA -> Field Ops",
    layout: "flow-horizontal",
    nodes: [node("network-alarm", "Network Alarm", .06, .42, .16), node("event-correlation", "Event Correlation", .27, .42, .18), node("root-cause-agent", "Root Cause Agent", .5, .42, .18), node("field-ops", "Field Ops", .74, .3, .14), node("customer-notification", "Customer Notification", .72, .56, .2)],
    edges: [edge("alarm-correlation", "network-alarm", "event-correlation"), edge("correlation-rca", "event-correlation", "root-cause-agent"), edge("rca-field", "root-cause-agent", "field-ops"), edge("rca-notify", "root-cause-agent", "customer-notification")]
  })
];

const templates = Object.freeze(Object.fromEntries(templateRegistry.map((template) => [template.id, template])));
const aliasToTemplateId = new Map(templateRegistry.flatMap((template) => template.aliases.map((alias) => [alias, template.id])));

function getDiagramTemplate(id) {
  if (!templates[id]) throw new Error("Unknown diagram template");
  return structuredClone(templates[id]);
}

function getDiagramTemplates() {
  return templateRegistry.map((template) => structuredClone(template));
}

function findTemplateByAlias(value) {
  const templateId = aliasToTemplateId.get(normalizeLookup(value));
  return templateId ? getDiagramTemplate(templateId) : null;
}

function getHighlightLabel(labelOrAlias, templateId = null) {
  const normalized = normalizeLookup(labelOrAlias);
  if (!normalized) return null;
  const candidates = (templateId ? [templates[templateId]] : templateRegistry).filter(Boolean);
  for (const template of candidates) {
    if (template.highlightAliases[normalized]) return template.highlightAliases[normalized];
  }
  return null;
}

export { findTemplateByAlias, getDiagramTemplate, getDiagramTemplates, getHighlightLabel, templates };
