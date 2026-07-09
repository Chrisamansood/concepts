import test from "node:test";
import assert from "node:assert/strict";
import { parseCommand, splitLiveCommands } from "../../voice/command-parser.js";

test("live speech requires Jarvis prefix", () => {
  assert.equal(parseCommand("next slide", { live: true }).status, "ignored");
  assert.equal(parseCommand("Jarvis next slide", { live: true }).command.type, "presentation.next");
  assert.equal(parseCommand("Jarvis next slide. [BLANK_AUDIO]", { live: true }).command.type, "presentation.next");
  assert.equal(parseCommand(splitLiveCommands("Jervis next slide")[0], { live: true }).command.type, "presentation.next");
  assert.equal(parseCommand(splitLiveCommands("Jar vis next slide")[0], { live: true }).command.type, "presentation.next");
});

test("typed and spoken commands normalize identically", () => {
  assert.deepEqual(parseCommand("select laser").command, parseCommand("Jarvis, select laser!", { live: true }).command);
});

test("parses required presentation commands", () => {
  const phrases = ["next slide", "previous slide", "select pen", "select laser", "color cyan", "color red", "color yellow", "color green", "undo", "redo", "zoom in", "zoom out", "reset zoom", "lock controls", "unlock controls"];
  assert.equal(phrases.every((phrase) => parseCommand(phrase).status === "matched"), true);
});

test("parses registered diagram templates and exact labels", () => {
  assert.equal(parseCommand("prepare customer AI billing flow").command.payload.templateId, "customer-ai-billing");
  assert.equal(parseCommand("present customer AI billing flow").command.type, "diagram.prepare-present");
  assert.equal(parseCommand("show customer AI billing flow").command.payload.templateId, "customer-ai-billing");
  assert.equal(parseCommand("Jarvis present customer AI billing flow", { live: true }).command.type, "diagram.prepare-present");
  assert.equal(parseCommand("prepare agent orchestration diagram").command.payload.templateId, "agent-orchestration");
  assert.equal(parseCommand("prepare AI data platform diagram").command.payload.templateId, "ai-data-platform");
  assert.equal(parseCommand("prepare telco BSS order flow").command.payload.templateId, "telco-bss-order-flow");
  assert.equal(parseCommand("present governance guardrails").command.payload.templateId, "ai-governance-guardrails");
  assert.equal(parseCommand("highlight AI Agent").command.payload.label, "AI Agent");
  assert.equal(parseCommand("highlight that").status, "rejected");
});

test("splits live transcripts into multiple wake-word commands", () => {
  assert.deepEqual(
    splitLiveCommands("Jarvis select laser. Jarvis next slide."),
    ["jarvis select laser", "jarvis next slide"]
  );
  assert.deepEqual(
    splitLiveCommands("background words Travis select pen"),
    ["jarvis select pen"]
  );
  assert.deepEqual(
    splitLiveCommands("Jarvis zoom in and Jarvis next slide."),
    ["jarvis zoom in", "jarvis next slide"]
  );
});

test("substring-like normal speech is rejected", () => {
  assert.equal(parseCommand("the next circle is clear").status, "rejected");
});

test("accepts natural articles and approved billing-flow synonyms", () => {
  assert.equal(parseCommand("Jarvis select the laser", { live: true }).command.payload.tool, "laser");
  assert.equal(parseCommand("Jarvis prepare a customer billing flow", { live: true }).command.payload.templateId, "customer-ai-billing");
  assert.equal(parseCommand("Jarvis prepare the customer AI billing diagram", { live: true }).command.payload.templateId, "customer-ai-billing");
});

test("corrects conservative Chrome speech confusions after the Jarvis prefix", () => {
  const cases = [
    ["Jarvis next light", "presentation.next", "next slide"],
    ["Jarvis previous flight", "presentation.previous", "previous slide"],
    ["Jarvis select later", "tool.select", "select laser"],
    ["Jarvis select pin", "tool.select", "select pen"],
    ["Jarvis reset room", "zoom.reset", "reset zoom"],
    ["Jarvis prepare customer billing floor", "diagram.prepare", "prepare customer billing flow"]
  ];
  for (const [spoken, type, normalized] of cases) {
    const parsed = parseCommand(spoken, { live: true });
    assert.equal(parsed.command.type, type);
    assert.equal(parsed.normalized, normalized);
    assert.equal(parsed.corrected, true);
  }
});

test("does not fuzzy-correct destructive or unprefixed speech", () => {
  assert.equal(parseCommand("Jarvis delete all", { live: true }).status, "rejected");
  assert.equal(parseCommand("next light", { live: true }).status, "ignored");
});
