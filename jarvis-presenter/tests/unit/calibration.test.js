import test from "node:test";
import assert from "node:assert/strict";

import { createProfile, derivePinchThresholds, validateProfile } from "../../gestures/calibration.js";
import { createProfileStorage } from "../../core/profile-storage.js";

function memoryStorage({ fail = false } = {}) {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) || null,
    setItem(key, value) { if (fail) throw new Error("denied"); values.set(key, value); },
    removeItem: (key) => values.delete(key)
  };
}

test("calibration derives normalized pinch hysteresis", () => {
  assert.deepEqual(derivePinchThresholds({ closedRatios: [0.2, 0.22], openRatios: [0.7, 0.72] }), {
    pinchEnter: 0.37,
    pinchExit: 0.55,
    menuPinchEnter: 0.45
  });
});

test("profile validation rejects incompatible versions", () => {
  assert.throws(() => validateProfile({ ...createProfile(), profileVersion: 2 }), /Unsupported profile version/);
});

test("profiles create, select, export, import and reset", () => {
  const storage = createProfileStorage(memoryStorage());
  const standing = createProfile({ id: "standing", name: "Standing", dominantHand: "Right" });
  storage.save(standing);
  assert.equal(storage.read().activeId, "standing");
  const exported = storage.exportJson();
  const restored = createProfileStorage(memoryStorage());
  restored.importJson(exported);
  assert.equal(restored.read().profiles[1].name, "Standing");
  assert.equal(restored.reset().profiles.length, 1);
});

test("storage failure preserves an in-memory profile", () => {
  const storage = createProfileStorage(memoryStorage({ fail: true }));
  storage.save(createProfile({ id: "room", name: "Room" }));
  assert.equal(storage.read().profiles.some((profile) => profile.id === "room"), true);
  assert.equal(storage.persistent, false);
});
