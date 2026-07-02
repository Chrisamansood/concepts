import test from "node:test";
import assert from "node:assert/strict";

import { createLandmarkRecorder } from "../../gestures/landmark-recorder.js";
import { deterministicTrace, replayLandmarks, validateRecording } from "../../gestures/landmark-replay.js";

test("recorder stores landmarks but no image or audio data", () => {
  let clock = 100;
  const recorder = createLandmarkRecorder({ now: () => clock, maxFrames: 2 });
  recorder.start({ fixtureId: "privacy-test", metadata: { lighting: "office" } });
  recorder.capture({ landmarks: [[{ x: 0.2, y: 0.3, z: -0.1 }]], handedness: [[{ categoryName: "Left", score: 0.9 }]] }, clock);
  clock += 33;
  recorder.capture({ landmarks: [], handedness: [] }, clock);
  clock += 33;
  assert.equal(recorder.capture({ landmarks: [], handedness: [] }, clock), false);

  const recording = recorder.stop();
  const serialized = JSON.stringify(recording);
  const keys = [];
  JSON.parse(serialized, (key, value) => {
    if (key) keys.push(key.toLowerCase());
    return value;
  });
  assert.equal(recording.frames.length, 2);
  assert.equal(keys.some((key) => ["image", "video", "audio", "blob", "dataurl"].includes(key)), false);
  assert.match(recording.privacy, /No camera frames or audio/);
});

test("validation rejects unordered timestamps", () => {
  assert.throws(() => validateRecording({ schemaVersion: 1, fixtureId: "bad", frames: [{ t: 2, landmarks: [], handedness: [] }, { t: 1, landmarks: [], handedness: [] }] }), /ordered/);
});

test("replay evaluates expected and forbidden commands", async () => {
  const fixture = {
    schemaVersion: 1,
    fixtureId: "command-test",
    frames: [{ t: 0, landmarks: [], handedness: [] }, { t: 100, landmarks: [], handedness: [] }],
    expectedCommands: [{ type: "presentation.next", betweenMs: [80, 120] }],
    forbiddenCommands: ["menu.open"]
  };
  const report = await replayLandmarks(fixture, {
    processFrame(frame, trace) {
      if (frame.t === 100) trace.commands.push({ type: "presentation.next", t: frame.t });
    }
  });
  assert.equal(report.passed, true);
  assert.deepEqual(report.forbiddenViolations, []);
});

test("accelerated replay produces deterministic traces", async () => {
  const fixture = {
    schemaVersion: 1,
    fixtureId: "determinism-test",
    frames: [{ t: 0, landmarks: [], handedness: [] }, { t: 33, landmarks: [], handedness: [] }],
    expectedSignals: [{ type: "frame.33" }]
  };
  const run = () => replayLandmarks(fixture, {
    speed: 0,
    processFrame(frame, trace) {
      trace.signals.push({ type: `frame.${frame.t}`, t: frame.t });
    }
  });
  const reports = await Promise.all([run(), run(), run()]);
  assert.equal(new Set(reports.map(deterministicTrace)).size, 1);
  assert.equal(reports.every((report) => report.passed), true);
});

test("replay reports forbidden signals", async () => {
  const fixture = { schemaVersion: 1, fixtureId: "signal-safety", frames: [{ t: 0, landmarks: [], handedness: [] }], forbiddenSignals: ["overlay.clear"] };
  const report = await replayLandmarks(fixture, { processFrame(_frame, trace) { trace.signals.push({ type: "overlay.clear", t: 0 }); } });
  assert.equal(report.passed, false);
  assert.equal(report.forbiddenSignalViolations.length, 1);
});
