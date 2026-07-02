import test from "node:test";
import assert from "node:assert/strict";
import { parseCommand } from "../../voice/command-parser.js";

test("live speech requires Jarvis prefix", () => {
  assert.equal(parseCommand("next slide", { live: true }).status, "ignored");
  assert.equal(parseCommand("Jarvis next slide", { live: true }).command.type, "presentation.next");
});

test("typed and spoken commands normalize identically", () => {
  assert.deepEqual(parseCommand("select laser").command, parseCommand("Jarvis, select laser!", { live: true }).command);
});

test("parses required presentation commands", () => {
  const phrases = ["next slide", "previous slide", "select pen", "select laser", "color cyan", "color red", "color yellow", "color green", "undo", "redo", "reset zoom", "lock controls", "unlock controls"];
  assert.equal(phrases.every((phrase) => parseCommand(phrase).status === "matched"), true);
});

test("parses only the three approved diagram templates and exact labels", () => {
  assert.equal(parseCommand("prepare customer AI billing flow").command.payload.templateId, "customer-ai-billing");
  assert.equal(parseCommand("prepare agent orchestration diagram").command.payload.templateId, "agent-orchestration");
  assert.equal(parseCommand("prepare AI data platform diagram").command.payload.templateId, "ai-data-platform");
  assert.equal(parseCommand("highlight AI Agent").command.payload.label, "AI Agent");
  assert.equal(parseCommand("highlight that").status, "rejected");
});

test("substring-like normal speech is rejected", () => {
  assert.equal(parseCommand("the next circle is clear").status, "rejected");
});

test("accepts natural articles and approved billing-flow synonyms", () => {
  assert.equal(parseCommand("Jarvis select the laser", { live: true }).command.payload.tool, "laser");
  assert.equal(parseCommand("Jarvis prepare a customer billing flow", { live: true }).command.payload.templateId, "customer-ai-billing");
  assert.equal(parseCommand("Jarvis prepare the customer AI billing diagram", { live: true }).command.payload.templateId, "customer-ai-billing");
});
