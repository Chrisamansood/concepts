const PROFILE_VERSION = 1;

const DEFAULT_PROFILE = Object.freeze({
  profileVersion: PROFILE_VERSION,
  id: "default",
  name: "Default",
  dominantHand: "Auto",
  mirror: true,
  thresholds: Object.freeze({
    pinchEnter: 0.42,
    pinchExit: 0.55,
    menuPinchEnter: 0.5,
    palmSpread: 0.12,
    swipeVelocity: 620,
    clapDistance: 0.16
  }),
  timing: Object.freeze({
    primeMs: 50,
    menuHoldMs: 500,
    twoHandConfirmFrames: 6,
    handReturnFrames: 3
  }),
  filters: Object.freeze({ minCutoff: 1, beta: 0.007, predictionMs: 30 })
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slug(value) {
  return String(value || "profile").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "profile";
}

function validateProfile(profile) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) throw new Error("Profile must be an object");
  if (profile.profileVersion !== PROFILE_VERSION) throw new Error(`Unsupported profile version: ${String(profile.profileVersion ?? "missing")}`);
  if (!profile.id || !profile.name) throw new Error("Profile id and name are required");
  if (!["Right", "Left", "Auto"].includes(profile.dominantHand)) throw new Error("Dominant hand must be Right, Left or Auto");
  for (const group of ["thresholds", "timing", "filters"]) {
    if (!profile[group] || Object.values(profile[group]).some((value) => !Number.isFinite(value))) {
      throw new Error(`Profile ${group} must contain numeric values`);
    }
  }
  if (profile.thresholds.pinchEnter >= profile.thresholds.pinchExit) throw new Error("Pinch exit must be greater than pinch enter");
  return clone(profile);
}

function createProfile(input = {}) {
  const base = clone(DEFAULT_PROFILE);
  const name = String(input.name || base.name).trim();
  return validateProfile({
    ...base,
    ...input,
    id: input.id || slug(name),
    name,
    thresholds: { ...base.thresholds, ...(input.thresholds || {}) },
    timing: { ...base.timing, ...(input.timing || {}) },
    filters: { ...base.filters, ...(input.filters || {}) }
  });
}

function derivePinchThresholds({ closedRatios = [], openRatios = [] } = {}) {
  if (!closedRatios.length || !openRatios.length) return clone(DEFAULT_PROFILE.thresholds);
  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const closed = mean(closedRatios);
  const open = mean(openRatios);
  if (!Number.isFinite(closed) || !Number.isFinite(open) || closed >= open) throw new Error("Pinch samples must clearly separate closed and open positions");
  const gap = open - closed;
  return {
    pinchEnter: Number((closed + gap * 0.32).toFixed(3)),
    pinchExit: Number((closed + gap * 0.68).toFixed(3)),
    menuPinchEnter: Number((closed + gap * 0.48).toFixed(3))
  };
}

export { DEFAULT_PROFILE, PROFILE_VERSION, createProfile, derivePinchThresholds, validateProfile };
