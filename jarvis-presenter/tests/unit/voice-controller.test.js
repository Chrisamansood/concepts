import test from "node:test";
import assert from "node:assert/strict";
import { createVoiceController } from "../../voice/voice-controller.js";

function fakeAdapter() {
  const callbacks = {};
  let starts = 0;
  return {
    isSupported: () => true,
    start() { starts += 1; callbacks.start?.(); },
    stop() {},
    onInterim(fn) { callbacks.interim = fn; },
    onFinal(fn) { callbacks.final = fn; },
    onError(fn) { callbacks.error = fn; },
    onEnd(fn) { callbacks.end = fn; },
    onStart(fn) { callbacks.start = fn; },
    callbacks,
    starts: () => starts
  };
}

test("voice restarts after an unexpected end and preserves the restart limit", async () => {
  const adapter = fakeAdapter();
  const states = [];
  const controller = createVoiceController({ adapter, maxRestarts: 1, onState: (state, detail) => states.push([state, detail]) });
  assert.equal(controller.start(), true);
  adapter.callbacks.end();
  await new Promise((resolve) => setTimeout(resolve, 280));
  assert.equal(adapter.starts(), 2);
  adapter.callbacks.end();
  assert.deepEqual(states.at(-1), ["ERROR", "restart-limit"]);
});

test("duplicate final transcripts execute once", () => {
  const adapter = fakeAdapter();
  const finals = [];
  const controller = createVoiceController({ adapter, onFinal: (text) => finals.push(text) });
  controller.start();
  adapter.callbacks.final("Jarvis next slide");
  adapter.callbacks.final("Jarvis next slide");
  assert.deepEqual(finals, ["Jarvis next slide"]);
  controller.stop();
});
