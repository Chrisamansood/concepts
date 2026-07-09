import test from "node:test";
import assert from "node:assert/strict";
import { createSpeechAdapter } from "../../voice/speech-adapter.js";

function recognitionScope() {
  const instances = [];
  class Recognition {
    constructor() { this.aborted = false; instances.push(this); }
    start() { this.onstart?.(); }
    abort() { this.aborted = true; }
  }
  return { webkitSpeechRecognition: Recognition, instances };
}

test("adapter permits only one active Chrome recognition instance", () => {
  const scope = recognitionScope();
  const adapter = createSpeechAdapter(scope);
  assert.equal(adapter.start(), true);
  assert.equal(adapter.start(), false);
  assert.equal(scope.instances.length, 1);
});

test("stopped recognition cannot leak delayed events into a new session", () => {
  const scope = recognitionScope();
  const adapter = createSpeechAdapter(scope);
  const finals = [];
  adapter.onFinal((text) => finals.push(text));
  adapter.start();
  const oldSession = scope.instances[0];
  const staleFinal = oldSession.onresult;
  adapter.stop();
  assert.equal(oldSession.aborted, true);
  adapter.start();
  staleFinal({ resultIndex: 0, results: Object.assign([[{ transcript: "Jarvis next slide" }]], { 0: Object.assign([{ transcript: "Jarvis next slide" }], { isFinal: true }) }) });
  assert.deepEqual(finals, []);
  assert.equal(scope.instances.length, 2);
});

test("natural Chrome end releases the instance for a controlled restart", () => {
  const scope = recognitionScope();
  const adapter = createSpeechAdapter(scope);
  let ended = 0;
  adapter.onEnd(() => { ended += 1; });
  adapter.start();
  scope.instances[0].onend();
  assert.equal(ended, 1);
  assert.equal(adapter.start(), true);
  assert.equal(scope.instances.length, 2);
});
