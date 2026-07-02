import test from "node:test";
import assert from "node:assert/strict";

import { createIntentArbiter } from "../../gestures/intent-arbiter.js";

const intent = (type, confidence = 0.9, handCount = 1, stableForMs = 150) => ({ type, confidence, handCount, stableForMs, evidence: {} });

test("two-hand candidacy suppresses one-hand commands", () => {
  const arbiter = createIntentArbiter({ twoHandConfirmFrames: 2 });
  const first = arbiter.evaluate([intent("PALM_SWIPE_LEFT")], { handCount: 2 });
  const second = arbiter.evaluate([intent("ZOOM", 0.9, 2)], { handCount: 2 });
  assert.equal(first.accepted, false);
  assert.equal(second.candidate.type, "ZOOM");
});

test("returning to one hand requires stable frames and emits no immediate action", () => {
  const arbiter = createIntentArbiter({ twoHandConfirmFrames: 1, oneHandReturnFrames: 3 });
  arbiter.evaluate([intent("ZOOM", 0.9, 2)], { handCount: 2 });
  assert.equal(arbiter.evaluate([intent("PALM_SWIPE_LEFT")], { handCount: 1 }).accepted, false);
  assert.equal(arbiter.evaluate([intent("PALM_SWIPE_LEFT")], { handCount: 1 }).accepted, false);
  assert.equal(arbiter.evaluate([], { handCount: 1 }).accepted, false);
});

test("moving palm wins over menu hold", () => {
  const arbiter = createIntentArbiter();
  const result = arbiter.evaluate([intent("PALM_HOLD"), intent("PALM_SWIPE_RIGHT", 0.91)], { handCount: 1 });
  assert.equal(result.candidate.type, "PALM_SWIPE_RIGHT");
});

test("menu pinch requires two stable frames", () => {
  const arbiter = createIntentArbiter({ menuPinchFrames: 2 });
  assert.equal(arbiter.evaluate([intent("MENU_PINCH")], { handCount: 1, menuOpen: true }).accepted, false);
  assert.equal(arbiter.evaluate([intent("MENU_PINCH")], { handCount: 1, menuOpen: true }).accepted, true);
});
