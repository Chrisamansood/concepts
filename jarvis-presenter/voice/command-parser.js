import { normalizeTranscript } from "./transcript-normalizer.js";
import { findTemplateByAlias, getHighlightLabel } from "../presentation/diagram-templates.js";

const colors = { cyan: "#00e5ff", blue: "#00e5ff", red: "#ff3b6b", yellow: "#ffd166", green: "#7cff6b" };
const safeSpeechCorrections = new Map([
  ["next light", "next slide"],
  ["next flight", "next slide"],
  ["next slight", "next slide"],
  ["previous light", "previous slide"],
  ["previous flight", "previous slide"],
  ["previous slight", "previous slide"],
  ["back light", "back slide"],
  ["back flight", "back slide"],
  ["select later", "select laser"],
  ["select lazer", "select laser"],
  ["use later", "use laser"],
  ["use lazer", "use laser"],
  ["select pin", "select pen"],
  ["use pin", "use pen"],
  ["reset room", "reset zoom"],
  ["lock control", "lock controls"],
  ["unlock control", "unlock controls"],
  ["prepare customer billing floor", "prepare customer billing flow"],
  ["prepare customer ai billing floor", "prepare customer ai billing flow"],
  ["had the diagram", "hide diagram"],
  ["had diagram", "hide diagram"]
]);
const wakeWordPattern = /\b(?:jarvis|jarviss|jervis|javis|jarvish|jarves|jarvez|garvis|darvis|travis|chavez|charvis)\b/g;

function result(type, payload = {}) { return Object.freeze({ type, payload }); }

function normalizeWakeWords(text) {
  return text
    .replace(/\bjar\s+v(?:is|iss|iz)\b/g, "jarvis")
    .replace(/\bjar\s+vis\b/g, "jarvis")
    .replace(/\bjar\s+viz\b/g, "jarvis")
    .replace(/\bjarvis\s+s\b/g, "jarviss");
}

function splitLiveCommands(input) {
  const text = normalizeWakeWords(normalizeTranscript(input));
  const starts = [...text.matchAll(wakeWordPattern)];
  if (!starts.length) return [];
  return starts.map((match, index) => {
    const from = match.index + match[0].length;
    const to = starts[index + 1]?.index ?? text.length;
    const command = text.slice(from, to)
      .replace(/\b(?:and|then)\s*$/g, "")
      .replace(/^(?:and|then)\s+/g, "")
      .trim();
    return command ? `jarvis ${command}` : "";
  }).filter(Boolean);
}

function parseCommand(input, { live = false } = {}) {
  let text = normalizeWakeWords(normalizeTranscript(input));
  const prefixed = text === "jarvis" || text.startsWith("jarvis ");
  if (live && !prefixed) return { status: "ignored", reason: "missing-prefix" };
  if (prefixed) text = text.slice(6).trim();
  text = text.replace(/^please\s+/, "");
  text = text.replace(/^(select|use|prepare|present|show|hide|highlight)\s+(?:the|a|an)\s+/, "$1 ");
  const heard = text;
  if (live && safeSpeechCorrections.has(text)) text = safeSpeechCorrections.get(text);

  const exact = new Map([
    ["next slide", result("presentation.next")], ["next", result("presentation.next")],
    ["previous slide", result("presentation.previous")], ["previous", result("presentation.previous")], ["back slide", result("presentation.previous")],
    ["select pen", result("tool.select", { tool: "pen" })], ["use pen", result("tool.select", { tool: "pen" })],
    ["select laser", result("tool.select", { tool: "laser" })], ["use laser", result("tool.select", { tool: "laser" })],
    ["undo", result("overlay.undo")], ["redo", result("overlay.redo")],
    ["zoom in", result("zoom.in")], ["zoom out", result("zoom.out")], ["reset zoom", result("zoom.reset")],
    ["lock controls", result("control.lock")], ["unlock controls", result("control.unlock")],
    ["present diagram", result("diagram.present")], ["show diagram", result("diagram.present")], ["present it", result("diagram.present")], ["show it", result("diagram.present")],
    ["hide diagram", result("diagram.hide")], ["remove diagram", result("diagram.hide")],
    ["show complete diagram", result("diagram.highlight", { label: null })]
  ]);
  if (exact.has(text)) return { status: "matched", command: exact.get(text), normalized: text, corrected: text !== heard };

  const color = text.match(/^(?:color|choose color|set color) (cyan|blue|red|yellow|green)$/);
  if (color) return { status: "matched", command: result("color.select", { color: colors[color[1]] }), normalized: text, corrected: text !== heard };

  if (text.startsWith("prepare ")) {
    const name = text.slice(8);
    const template = findTemplateByAlias(name);
    if (template) return { status: "matched", command: result("diagram.prepare", { templateId: template.id }), normalized: text, corrected: text !== heard };
  }

  if (text.startsWith("present ") || text.startsWith("show ")) {
    const name = text.replace(/^(present|show)\s+/, "");
    const template = findTemplateByAlias(name);
    if (template) return { status: "matched", command: result("diagram.prepare-present", { templateId: template.id }), normalized: text, corrected: text !== heard };
  }

  if (text.startsWith("highlight ")) {
    const requested = text.slice(10);
    const label = getHighlightLabel(requested);
    if (label) return { status: "matched", command: result("diagram.highlight", { label }), normalized: text, corrected: text !== heard };
  }
  return { status: "rejected", reason: "unrecognized-command", normalized: text };
}

export { parseCommand, splitLiveCommands };
