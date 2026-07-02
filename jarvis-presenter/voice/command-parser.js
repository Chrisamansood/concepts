import { normalizeTranscript } from "./transcript-normalizer.js";

const colors = { cyan: "#00e5ff", blue: "#00e5ff", red: "#ff3b6b", yellow: "#ffd166", green: "#7cff6b" };
const templateAliases = new Map([
  ["customer ai billing flow", "customer-ai-billing"],
  ["customer billing flow", "customer-ai-billing"],
  ["customer ai billing diagram", "customer-ai-billing"],
  ["customer billing diagram", "customer-ai-billing"],
  ["agent orchestration diagram", "agent-orchestration"],
  ["agent orchestration", "agent-orchestration"],
  ["ai data platform diagram", "ai-data-platform"]
]);

function result(type, payload = {}) { return Object.freeze({ type, payload }); }

function parseCommand(input, { live = false } = {}) {
  let text = normalizeTranscript(input);
  const prefixed = text === "jarvis" || text.startsWith("jarvis ");
  if (live && !prefixed) return { status: "ignored", reason: "missing-prefix" };
  if (prefixed) text = text.slice(6).trim();
  text = text.replace(/^please\s+/, "");
  text = text.replace(/^(select|use|prepare|present|show|hide|highlight)\s+(?:the|a|an)\s+/, "$1 ");

  const exact = new Map([
    ["next slide", result("presentation.next")], ["next", result("presentation.next")],
    ["previous slide", result("presentation.previous")], ["previous", result("presentation.previous")], ["back slide", result("presentation.previous")],
    ["select pen", result("tool.select", { tool: "pen" })], ["use pen", result("tool.select", { tool: "pen" })],
    ["select laser", result("tool.select", { tool: "laser" })], ["use laser", result("tool.select", { tool: "laser" })],
    ["undo", result("overlay.undo")], ["redo", result("overlay.redo")],
    ["reset zoom", result("zoom.reset")], ["lock controls", result("control.lock")], ["unlock controls", result("control.unlock")],
    ["present diagram", result("diagram.present")], ["show diagram", result("diagram.present")],
    ["hide diagram", result("diagram.hide")], ["remove diagram", result("diagram.hide")],
    ["show complete diagram", result("diagram.highlight", { label: null })]
  ]);
  if (exact.has(text)) return { status: "matched", command: exact.get(text), normalized: text };

  const color = text.match(/^(?:color|choose color|set color) (cyan|blue|red|yellow|green)$/);
  if (color) return { status: "matched", command: result("color.select", { color: colors[color[1]] }), normalized: text };

  if (text.startsWith("prepare ")) {
    const name = text.slice(8);
    const templateId = templateAliases.get(name);
    if (templateId) return { status: "matched", command: result("diagram.prepare", { templateId }), normalized: text };
  }

  if (text.startsWith("highlight ")) {
    const requested = text.slice(10);
    const labels = { customer: "Customer", "ai agent": "AI Agent", billing: "Billing" };
    if (labels[requested]) return { status: "matched", command: result("diagram.highlight", { label: labels[requested] }), normalized: text };
  }
  return { status: "rejected", reason: "unrecognized-command", normalized: text };
}

export { parseCommand };
