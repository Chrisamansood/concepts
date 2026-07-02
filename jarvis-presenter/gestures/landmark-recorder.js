const RECORDING_SCHEMA_VERSION = 1;

function copyLandmark(landmark) {
  return {
    x: Number(landmark.x) || 0,
    y: Number(landmark.y) || 0,
    z: Number(landmark.z) || 0,
    ...(Number.isFinite(landmark.visibility) ? { visibility: landmark.visibility } : {})
  };
}

function copyHandedness(entries = []) {
  return entries.map((entry) => ({
    categoryName: entry.categoryName || entry.displayName || "",
    score: Number.isFinite(entry.score) ? entry.score : null
  }));
}

function createLandmarkRecorder({ maxDurationMs = 60_000, maxFrames = 1_800, now = () => performance.now() } = {}) {
  let active = false;
  let startedAt = 0;
  let recording = null;

  function start({ fixtureId, environment = {}, metadata = {}, expectedCommands = [], forbiddenCommands = [], expectedSignals = [] } = {}) {
    if (!fixtureId || typeof fixtureId !== "string") throw new Error("fixtureId is required");
    startedAt = now();
    active = true;
    recording = {
      schemaVersion: RECORDING_SCHEMA_VERSION,
      fixtureId,
      createdAt: new Date().toISOString(),
      privacy: "Landmarks and classification metadata only. No camera frames or audio.",
      environment: {
        mirror: environment.mirror !== false,
        cameraWidth: Number(environment.cameraWidth) || 0,
        cameraHeight: Number(environment.cameraHeight) || 0,
        lighting: metadata.lighting || "unspecified",
        posture: metadata.posture || "unspecified",
        hand: metadata.hand || "unspecified",
        cameraDistance: metadata.cameraDistance || "unspecified"
      },
      frames: [],
      expectedCommands: [...expectedCommands],
      forbiddenCommands: [...forbiddenCommands],
      expectedSignals: [...expectedSignals]
    };
    return getStatus();
  }

  function capture({ landmarks = [], handedness = [], classifications = [] } = {}, timestamp = now()) {
    if (!active || !recording) return false;
    const elapsed = Math.max(0, timestamp - startedAt);
    if (elapsed > maxDurationMs || recording.frames.length >= maxFrames) {
      active = false;
      return false;
    }
    recording.frames.push({
      t: Math.round(elapsed * 1000) / 1000,
      landmarks: landmarks.map((hand) => hand.map(copyLandmark)),
      handedness: handedness.map(copyHandedness),
      classifications: classifications.map((value) => String(value))
    });
    return true;
  }

  function stop() {
    active = false;
    return getRecording();
  }

  function getRecording() {
    return recording ? structuredClone(recording) : null;
  }

  function getStatus() {
    return Object.freeze({ active, frameCount: recording?.frames.length || 0, fixtureId: recording?.fixtureId || null });
  }

  return Object.freeze({ start, capture, stop, getRecording, getStatus });
}

function recordingToJson(recording) {
  return JSON.stringify(recording, null, 2);
}

export { RECORDING_SCHEMA_VERSION, createLandmarkRecorder, recordingToJson };
