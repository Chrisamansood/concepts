function createPalmNavigationController(options = {}) {
  const config = {
    swipeTravelPx: 36,
    stationaryRadiusPx: 18,
    horizontalDominance: 1.25,
    releaseFrames: 4,
    classificationGraceFrames: 2,
    ...options
  };
  let anchor = null;
  let latched = false;
  let nonPalmFrames = 0;
  let lastAction = null;

  function observePalm(point, timestamp, { enabled = true } = {}) {
    nonPalmFrames = 0;
    if (latched) return { action: null, latched: true, menuEligible: false };
    if (!anchor) anchor = { ...point, timestamp };

    const dx = point.x - anchor.x;
    const dy = point.y - anchor.y;
    const distance = Math.hypot(dx, dy);
    const horizontal = Math.abs(dx) >= config.swipeTravelPx && Math.abs(dx) >= Math.abs(dy) * config.horizontalDominance;

    if (enabled && horizontal) {
      latched = true;
      lastAction = dx < 0 ? "NEXT" : "PREVIOUS";
      anchor = null;
      return { action: lastAction, latched: true, menuEligible: false };
    }

    if (distance > config.stationaryRadiusPx) anchor = { ...point, timestamp };
    return { action: null, latched: false, menuEligible: true };
  }

  function observeNonPalm() {
    nonPalmFrames += 1;
    if (latched && nonPalmFrames >= config.releaseFrames) {
      latched = false;
      lastAction = null;
      anchor = null;
      return { rearmed: true, latched: false };
    }
    if (!latched && nonPalmFrames > config.classificationGraceFrames) anchor = null;
    return { rearmed: false, latched };
  }

  function menuReady(timestamp, holdMs) {
    return !latched && Boolean(anchor) && timestamp - anchor.timestamp >= holdMs;
  }

  function reset() {
    anchor = null;
    latched = false;
    nonPalmFrames = 0;
    lastAction = null;
  }

  return Object.freeze({
    observePalm,
    observeNonPalm,
    menuReady,
    reset,
    getDiagnostics: () => ({ anchor: anchor ? { ...anchor } : null, latched, nonPalmFrames, lastAction })
  });
}

export { createPalmNavigationController };
