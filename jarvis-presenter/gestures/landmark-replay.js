function validateRecording(recording) {
  if (!recording || recording.schemaVersion !== 1) throw new Error("Unsupported landmark recording schema");
  if (!recording.fixtureId || !Array.isArray(recording.frames)) throw new Error("Invalid landmark recording");
  let previous = -Infinity;
  for (const frame of recording.frames) {
    if (!Number.isFinite(frame.t) || frame.t < previous) throw new Error("Frame timestamps must be ordered");
    if (!Array.isArray(frame.landmarks) || !Array.isArray(frame.handedness)) throw new Error("Invalid replay frame");
    previous = frame.t;
  }
  return recording;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function matchTimedExpectation(actual, expectation) {
  if (actual.type !== expectation.type) return false;
  if (!expectation.betweenMs) return true;
  return actual.t >= expectation.betweenMs[0] && actual.t <= expectation.betweenMs[1];
}

function createReplayReport(recording, trace = {}) {
  const commands = trace.commands || [];
  const signals = trace.signals || [];
  const expectedCommands = recording.expectedCommands || [];
  const expectedSignals = recording.expectedSignals || [];
  const forbiddenCommands = recording.forbiddenCommands || [];
  const forbiddenSignals = recording.forbiddenSignals || [];
  const missingCommands = expectedCommands.filter((expected) => !commands.some((actual) => matchTimedExpectation(actual, expected)));
  const missingSignals = expectedSignals.filter((expected) => !signals.some((actual) => matchTimedExpectation(actual, expected)));
  const forbiddenViolations = commands.filter((command) => forbiddenCommands.includes(command.type));
  const forbiddenSignalViolations = signals.filter((signal) => forbiddenSignals.includes(signal.type));

  return Object.freeze({
    fixtureId: recording.fixtureId,
    passed: missingCommands.length === 0 && missingSignals.length === 0 && forbiddenViolations.length === 0 && forbiddenSignalViolations.length === 0,
    frameCount: recording.frames.length,
    commands,
    signals,
    missingCommands,
    missingSignals,
    forbiddenViolations,
    forbiddenSignalViolations
  });
}

async function replayLandmarks(recording, { processFrame, speed = 0, beforeReplay, afterReplay } = {}) {
  validateRecording(recording);
  if (typeof processFrame !== "function") throw new TypeError("processFrame is required");
  const trace = { commands: [], signals: [] };
  await beforeReplay?.(recording, trace);
  let previousTime = 0;
  for (const frame of recording.frames) {
    if (speed > 0 && frame.t > previousTime) await wait((frame.t - previousTime) / speed);
    await processFrame(frame, trace);
    previousTime = frame.t;
  }
  await afterReplay?.(recording, trace);
  return createReplayReport(recording, trace);
}

function deterministicTrace(report) {
  return JSON.stringify({ commands: report.commands, signals: report.signals });
}

export { createReplayReport, deterministicTrace, replayLandmarks, validateRecording };
