function createIntentArbiter(options = {}) {
  const config = { twoHandConfirmFrames: 6, oneHandReturnFrames: 3, menuPinchFrames: 2, ...options };
  let twoHandCandidateFrames = 0;
  let twoHandMode = false;
  let returnFrames = 0;
  let menuPinchFrames = 0;
  let lastReason = "ready";

  function evaluate(candidates = [], context = {}) {
    const handCount = Number(context.handCount || 0);
    if (handCount >= 2) {
      twoHandCandidateFrames += 1;
      returnFrames = 0;
      if (twoHandCandidateFrames >= config.twoHandConfirmFrames) twoHandMode = true;
      const twoHand = candidates.filter((candidate) => candidate.handCount >= 2);
      if (!twoHandMode) return reject("two-hand-candidate-suppresses-one-hand");
      return choose(twoHand, "confirmed-two-hand-mode");
    }

    twoHandCandidateFrames = 0;
    if (twoHandMode) {
      returnFrames += 1;
      if (returnFrames < config.oneHandReturnFrames) return reject("one-hand-return-stabilizing");
      twoHandMode = false;
      returnFrames = 0;
    }

    if (context.menuOpen) {
      const pinch = candidates.find((candidate) => candidate.type === "MENU_PINCH" && candidate.confidence >= 0.7);
      menuPinchFrames = pinch ? menuPinchFrames + 1 : 0;
      if (pinch && menuPinchFrames >= config.menuPinchFrames) return accept(pinch, "stable-menu-pinch");
      if (pinch) return reject("menu-pinch-stabilizing");
    } else {
      menuPinchFrames = 0;
    }

    const swipe = candidates.find((candidate) => candidate.type.startsWith("PALM_SWIPE") && candidate.confidence >= 0.75);
    const hold = candidates.find((candidate) => candidate.type === "PALM_HOLD" && candidate.confidence >= 0.75);
    if (swipe && hold) return swipe.stableForMs >= 100 ? accept(swipe, "moving-palm-wins") : reject("palm-intent-uncertain");
    return choose(candidates.filter((candidate) => candidate.confidence >= 0.75), "highest-confidence");
  }

  function choose(candidates, reason) {
    if (!candidates.length) return reject(reason === "confirmed-two-hand-mode" ? "no-valid-two-hand-intent" : "classification-uncertain");
    return accept([...candidates].sort((a, b) => b.confidence - a.confidence)[0], reason);
  }

  function accept(candidate, reason) {
    lastReason = reason;
    return Object.freeze({ accepted: true, candidate, reason, twoHandMode });
  }

  function reject(reason) {
    lastReason = reason;
    return Object.freeze({ accepted: false, candidate: null, reason, twoHandMode });
  }

  function reset() {
    twoHandCandidateFrames = 0; twoHandMode = false; returnFrames = 0; menuPinchFrames = 0; lastReason = "reset";
  }

  return Object.freeze({ evaluate, reset, getDiagnostics: () => ({ twoHandMode, twoHandCandidateFrames, returnFrames, menuPinchFrames, lastReason }) });
}

export { createIntentArbiter };
