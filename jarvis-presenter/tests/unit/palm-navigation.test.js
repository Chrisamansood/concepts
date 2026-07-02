import test from "node:test";
import assert from "node:assert/strict";
import { createPalmNavigationController } from "../../gestures/palm-navigation.js";

test("right-to-left advances and return motion stays latched", () => {
  const nav = createPalmNavigationController();
  nav.observePalm({ x: 500, y: 300 }, 0);
  assert.equal(nav.observePalm({ x: 460, y: 302 }, 100).action, "NEXT");
  assert.equal(nav.observePalm({ x: 540, y: 300 }, 800).action, null);
  assert.equal(nav.getDiagnostics().latched, true);
});

test("left-to-right goes to the previous slide", () => {
  const nav = createPalmNavigationController();
  nav.observePalm({ x: 300, y: 300 }, 0);
  assert.equal(nav.observePalm({ x: 340, y: 304 }, 120).action, "PREVIOUS");
});

test("four non-palm frames rearm navigation", () => {
  const nav = createPalmNavigationController();
  nav.observePalm({ x: 500, y: 300 }, 0);
  nav.observePalm({ x: 450, y: 300 }, 100);
  for (let index = 0; index < 3; index += 1) assert.equal(nav.observeNonPalm().rearmed, false);
  assert.equal(nav.observeNonPalm().rearmed, true);
});

test("stationary palm opens only after hold time", () => {
  const nav = createPalmNavigationController();
  nav.observePalm({ x: 500, y: 300 }, 0, { enabled: false });
  nav.observePalm({ x: 508, y: 305 }, 300, { enabled: false });
  assert.equal(nav.menuReady(499, 500), false);
  assert.equal(nav.menuReady(500, 500), true);
});

test("movement below swipe distance resets the menu hold anchor", () => {
  const nav = createPalmNavigationController();
  nav.observePalm({ x: 500, y: 300 }, 0, { enabled: false });
  nav.observePalm({ x: 524, y: 300 }, 300, { enabled: false });
  assert.equal(nav.menuReady(700, 500), false);
  assert.equal(nav.menuReady(800, 500), true);
});
