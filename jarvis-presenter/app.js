import { FilesetResolver, HandLandmarker } from "./vendor/tasks-vision/vision_bundle.mjs";
import { OneEuroFilter } from "./one-euro-filter.js";
import { createAppState } from "./core/app-state.js";
import { createCommandBus } from "./core/command-bus.js?v=whisper-local-1";
import { createLandmarkRecorder, recordingToJson } from "./gestures/landmark-recorder.js";
import { deterministicTrace, replayLandmarks } from "./gestures/landmark-replay.js";
import { createProfile, derivePinchThresholds } from "./gestures/calibration.js";
import { createProfileStorage } from "./core/profile-storage.js";
import { createSpeechAdapter } from "./voice/speech-adapter.js";
import { createVoiceController } from "./voice/voice-controller.js";
import { parseCommand, splitLiveCommands } from "./voice/command-parser.js?v=whisper-local-1";
import { createDiagramScene, updateDiagramScene } from "./presentation/diagram-model.js";
import { renderDiagram } from "./presentation/diagram-renderer.js?v=diagram-shelf-drag";
import { createDiagramSession } from "./presentation/diagram-session.js";
import { getDiagramTemplates } from "./presentation/diagram-templates.js";
import { createPalmNavigationController } from "./gestures/palm-navigation.js";

const captureBtn = document.getElementById("captureBtn");
const slidesBtn = document.getElementById("slidesBtn");
const slidesInput = document.getElementById("slidesInput");
const handBtn = document.getElementById("handBtn");
const voiceBtn = document.getElementById("voiceBtn");
const voiceCommandsBtn = document.getElementById("voiceCommandsBtn");
const whisperContinuousBtn = document.getElementById("whisperContinuousBtn");
const whisperCommandBtn = document.getElementById("whisperCommandBtn");
const voiceDiagnostic = document.getElementById("voiceDiagnostic");
const voiceDiagnosticState = document.getElementById("voiceDiagnosticState");
const voiceDiagnosticTranscript = document.getElementById("voiceDiagnosticTranscript");
const voiceDiagnosticError = document.getElementById("voiceDiagnosticError");
const actionNotice = document.getElementById("actionNotice");
const clearBtn = document.getElementById("clearBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const collapseBtn = document.getElementById("collapseBtn");
const runtimeIdentity = document.getElementById("runtimeIdentity");
const runtimeBuildReadout = document.getElementById("runtimeBuildReadout");
const runtimeRootReadout = document.getElementById("runtimeRootReadout");
const runtimeProfileReadout = document.getElementById("runtimeProfileReadout");
const statusBuildReadout = document.getElementById("statusBuildReadout");
const expandBtn = document.getElementById("expandBtn");
const presentBtn = document.getElementById("presentBtn");
const exitPresentBtn = document.getElementById("exitPresentBtn");
const helpBtn = document.getElementById("helpBtn");
const cameraToggle = document.getElementById("cameraToggle");
const sectionHeaders = [...document.querySelectorAll(".section-header")];
const commandInput = document.getElementById("commandInput");
const commandBtn = document.getElementById("commandBtn");
const toolButtons = [...document.querySelectorAll("[data-tool]")];
const radialMenu = document.getElementById("radialMenu");
const radialItems = [...document.querySelectorAll(".radial-item")];
const radialActionButtons = [...document.querySelectorAll("[data-radial-action]")];
const radialCoreLabel = document.querySelector(".radial-core-label");
const swatches = [...document.querySelectorAll("[data-color]")];
const mirrorInput = document.getElementById("mirrorInput");
const stabilityInput = document.getElementById("stabilityInput");
const responsivenessInput = document.getElementById("responsivenessInput");
const predictionInput = document.getElementById("predictionInput");
const primeDelayInput = document.getElementById("primeDelayInput");
const sizeInput = document.getElementById("sizeInput");
const glowInput = document.getElementById("glowInput");
const sourceLayer = document.getElementById("sourceLayer");
const sourceVideo = document.getElementById("sourceVideo");
const slideImage = document.getElementById("slideImage");
const pptxCanvas = document.getElementById("pptxCanvas");
const cameraVideo = document.getElementById("cameraVideo");
const drawCanvas = document.getElementById("drawCanvas");
const previewCanvas = document.getElementById("previewCanvas");
const gestureCursor = document.getElementById("gestureCursor");
const gestureIndicator = document.getElementById("gestureIndicator");
const gestureIndicatorIcon = document.getElementById("gestureIndicatorIcon");
const gestureIndicatorLabel = document.getElementById("gestureIndicatorLabel");
const gestureIndicatorDetail = document.getElementById("gestureIndicatorDetail");
const onboarding = document.getElementById("onboarding");
const dismissOnboardingBtn = document.getElementById("dismissOnboardingBtn");
const closeOnboardingBtn = document.getElementById("closeOnboardingBtn");
const stage = document.getElementById("stage");
const emptyState = document.getElementById("emptyState");
const hudText = document.getElementById("hudText");
const systemState = document.getElementById("systemState");
const toolReadout = document.getElementById("toolReadout");
const handReadout = document.getElementById("handReadout");
const gestureReadout = document.getElementById("gestureReadout");
const lockReadout = document.getElementById("lockReadout");
const historyReadout = document.getElementById("historyReadout");
const slideReadout = document.getElementById("slideReadout");
const mirrorReadout = document.getElementById("mirrorReadout");
const stabilityReadout = document.getElementById("stabilityReadout");
const responsivenessReadout = document.getElementById("responsivenessReadout");
const predictionReadout = document.getElementById("predictionReadout");
const primeDelayReadout = document.getElementById("primeDelayReadout");
const voiceReadout = document.getElementById("voiceReadout");
const heardText = document.getElementById("heardText");
const commandAudit = document.getElementById("commandAudit");
const replayLab = document.getElementById("replayLab");
const replayFixtureSelect = document.getElementById("replayFixtureSelect");
const replaySpeedSelect = document.getElementById("replaySpeedSelect");
const replayRunBtn = document.getElementById("replayRunBtn");
const recordLandmarksBtn = document.getElementById("recordLandmarksBtn");
const stopLandmarksBtn = document.getElementById("stopLandmarksBtn");
const replayReport = document.getElementById("replayReport");
const profileSelect = document.getElementById("profileSelect");
const calibrateBtn = document.getElementById("calibrateBtn");
const renameProfileBtn = document.getElementById("renameProfileBtn");
const exportProfileBtn = document.getElementById("exportProfileBtn");
const importProfileBtn = document.getElementById("importProfileBtn");
const resetProfileBtn = document.getElementById("resetProfileBtn");
const profileImportInput = document.getElementById("profileImportInput");
const profileStatus = document.getElementById("profileStatus");
const calibrationWizard = document.getElementById("calibrationWizard");
const calibrationTitle = document.getElementById("calibrationTitle");
const calibrationInstruction = document.getElementById("calibrationInstruction");
const calibrationProgress = document.getElementById("calibrationProgress");
const calibrationChoiceRow = document.getElementById("calibrationChoiceRow");
const calibrationDominantHand = document.getElementById("calibrationDominantHand");
const calibrationNextBtn = document.getElementById("calibrationNextBtn");
const calibrationCancelBtn = document.getElementById("calibrationCancelBtn");
const diagramOverlay = document.getElementById("diagramOverlay");
const diagramDraftPreview = document.getElementById("diagramDraftPreview");
const diagramShelfOpenBtn = document.getElementById("diagramShelfOpenBtn");
const diagramShelfOverlay = document.getElementById("diagramShelfOverlay");
const diagramShelfCloseBtn = document.getElementById("diagramShelfCloseBtn");
const diagramShelfActiveName = document.getElementById("diagramShelfActiveName");
const diagramShelfParkBtn = document.getElementById("diagramShelfParkBtn");
const diagramShelfHideBtn = document.getElementById("diagramShelfHideBtn");
const diagramTemplateGrid = document.getElementById("diagramTemplateGrid");
const diagramParkedList = document.getElementById("diagramParkedList");
const diagramDockZone = document.getElementById("diagramDockZone");

const drawCtx = drawCanvas.getContext("2d");
const previewCtx = previewCanvas.getContext("2d");

const Gesture = {
  NONE: "NONE",
  FIST: "FIST",
  INDEX_ONLY: "INDEX_ONLY",
  PEACE: "PEACE",
  PALM: "PALM",
  PINCH: "PINCH",
  OTHER: "OTHER"
};

const State = {
  IDLE: "IDLE",
  TRACKING: "TRACKING",
  POINTING: "POINTING",
  PRIMING: "PRIMING",
  DRAWING: "DRAWING",
  COOLDOWN: "COOLDOWN",
  PAUSED: "PAUSED",
  MENU: "MENU",
  LOCKED: "LOCKED"
};

let activeTool = "pen";
let activeColor = "#00e5ff";
let mirrorMovement = true;
let stability = 1;
let responsiveness = 0.007;
let predictionMs = 30;
let primeDelayMs = 50;
let pointerDown = false;
let startPoint = null;
let lastPoint = null;
let recognition = null;
let voiceOn = false;
let voiceShouldRun = false;
let voiceMode = "off";
let voicePreflightPassed = false;
let whisperRecorder = null;
let whisperStream = null;
let whisperChunks = [];
let whisperRecording = false;
let whisperContinuousOn = false;
let whisperChunkBusy = false;
let handLandmarker = null;
let handLandmarkerPromise = null;
let cameraStream = null;
let handModeOn = false;
let handStarting = false;
let gestureLocked = false;
let lastClapAt = 0;
let clapActive = false;
let clapTimer = null;
let clearHoldStartedAt = null;
let clearHoldArmed = false;
let gestureState = State.IDLE;
let pendingState = State.IDLE;
let pendingFrames = 0;
let handSeenFrames = 0;
let lastHandAt = 0;
let replayClock = null;
let replayContext = null;
let stateEnteredAt = performance.now();
let gestureStartPoint = null;
let gestureLastPoint = null;
let lastVideoTime = -1;
let gestureAnimationId = null;
let positionHistory = [];
let radialCenter = null;
let radialSelectedItem = { type: "tool", value: "pen" };
let menuPinchFrames = 0;
let canvasHistory = [];
let redoHistory = [];
let lastSwipeAt = 0;
let laserPositions = [];
let slideSwipeHistory = [];
let zoomScale = 1;
let panX = 0;
let panY = 0;
let pinchZoomStart = null;
let panStart = null;
let lastSlideSwipeAt = 0;
let slideSwipeArmed = true;
let slideSwipeReleaseFrames = 0;
let slideSwipeCandidateUntil = 0;
let slideDeck = [];
let currentSlideIndex = 0;
let slideMode = false;
let slideSourceType = "images";
let pptxViewer = null;
let pptxRendering = false;
let presentMode = false;
let editModeCameraVisible = true;
let twoHandMode = false;
let twoHandCandidateFrames = 0;
let twoHandLostFrames = 0;
let zoomCandidateFrames = 0;
let lastPrimaryWrist = null;
let palmMenuBlockedUntil = 0;
let palmHoldAnchor = null;
let missingInferenceFrames = 0;
let drawingHandLostAt = null;
let returnStableFrames = 0;
let menuPinchActive = false;
let calibrationStep = 0;
let calibrationSamples = { pinchRatios: [], palmSpreads: [], movementX: [], movementY: [] };
let draftDiagram = null;
let committedDiagram = null;
let diagramHistory = [];
let diagramRedoHistory = [];
let diagramDrag = null;
let diagramShelfHoveredCard = null;
let diagramShelfPinchActive = false;
let diagramShelfArmedTarget = null;
let diagramShelfArmedAt = 0;

const profileStorage = createProfileStorage();
const diagramTemplates = getDiagramTemplates();
const diagramSession = createDiagramSession();
let activeProfile = createProfile();
const palmNavigation = createPalmNavigationController();
const VERIFIED_DEMO_PROFILE = createProfile({
  id: "verified-demo",
  name: "Verified Demo",
  dominantHand: "Auto",
  mirror: true,
  thresholds: {
    pinchEnter: 0.42,
    pinchExit: 0.55,
    menuPinchEnter: 0.5,
    palmSpread: 0.12,
    swipeVelocity: 620,
    clapDistance: 0.16
  },
  timing: {
    primeMs: 50,
    menuHoldMs: 500,
    twoHandConfirmFrames: 6,
    handReturnFrames: 3
  },
  filters: { minCutoff: 1, beta: 0.007, predictionMs: 30 }
});

const appState = createAppState({ activeTool, activeColor });
const commandBus = createCommandBus({
  allowedTypes: [
    "tool.select",
    "color.select",
    "overlay.undo",
    "overlay.redo",
    "presentation.next",
    "presentation.previous",
    "zoom.in",
    "zoom.out",
    "zoom.reset",
    "control.lock",
    "control.unlock",
    "diagram.prepare",
    "diagram.prepare-present",
    "diagram.present",
    "diagram.hide",
    "diagram.highlight",
    "diagram.gallery.open",
    "diagram.gallery.close",
    "diagram.template.present",
    "diagram.active.move",
    "diagram.active.park",
    "diagram.shelf.restore",
    "diagram.shelf.remove"
  ]
});
const landmarkRecorder = createLandmarkRecorder();

function gestureNow() {
  return replayClock === null ? performance.now() : replayClock;
}

function recordReplaySignal(type, detail = {}) {
  if (!replayContext) return;
  replayContext.signals.push({ type, t: gestureNow(), ...detail });
}

const pointFilters = {
  cursor: {
    x: new OneEuroFilter({ freq: 30, minCutoff: 1, beta: 0.007, dCutoff: 1 }),
    y: new OneEuroFilter({ freq: 30, minCutoff: 1, beta: 0.007, dCutoff: 1 }),
    history: []
  },
  draw: {
    x: new OneEuroFilter({ freq: 30, minCutoff: 1, beta: 0.007, dCutoff: 1 }),
    y: new OneEuroFilter({ freq: 30, minCutoff: 1, beta: 0.007, dCutoff: 1 }),
    history: []
  }
};

function setStatus(message) {
  hudText.textContent = message;
  systemState.textContent = message;
}

function showActionNotice(message, error = false) {
  actionNotice.textContent = message;
  actionNotice.hidden = false;
  actionNotice.classList.toggle("error", error);
}

function hideActionNotice() {
  actionNotice.hidden = true;
  actionNotice.classList.remove("error");
}

function setGestureStateLabel(label) {
  gestureReadout.textContent = label;
  gestureIndicatorLabel.textContent = label;
}

function gestureIndicatorContent(state) {
  const content = {
    [State.IDLE]: { icon: "●", label: "Standby", detail: handModeOn ? "Show your hand" : "Hand control off" },
    [State.TRACKING]: { icon: "◎", label: "Ready", detail: "Gesture control active" },
    [State.POINTING]: { icon: "⌖", label: "Pointer", detail: zoomScale > 1 ? "Move to pan" : "Move without ink" },
    [State.PRIMING]: { icon: "◔", label: "Priming", detail: `${activeTool} ready` },
    [State.DRAWING]: {
      icon: activeTool === "eraser" ? "◇" : "●",
      label: activeTool === "eraser" ? "Erasing" : toolReadout.textContent,
      detail: activeTool === "laser" ? "Laser trail active" : "Drawing"
    },
    [State.COOLDOWN]: { icon: "◌", label: "Ready", detail: "Gesture released" },
    [State.PAUSED]: { icon: "Ⅱ", label: "Paused", detail: "Hold for tool menu" },
    [State.MENU]: { icon: "✦", label: "Tools", detail: "Point and pinch" },
    [State.LOCKED]: { icon: "×", label: "Locked", detail: "Clap to resume" }
  };
  return content[state] || content[State.IDLE];
}

function updateGestureIndicator(state = gestureState) {
  const content = gestureIndicatorContent(state);
  gestureIndicator.className = `gesture-indicator state-${state.toLowerCase()}`;
  gestureIndicator.style.setProperty("--active-color", activeColor);
  gestureIndicatorIcon.textContent = content.icon;
  gestureIndicatorLabel.textContent = content.label;
  gestureIndicatorDetail.textContent = content.detail;
}

function applySourceTransform() {
  sourceLayer.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomScale})`;
}

function clampPan() {
  if (zoomScale <= 1) {
    panX = 0;
    panY = 0;
    return;
  }

  const rect = stage.getBoundingClientRect();
  const maxX = (rect.width * (zoomScale - 1)) / 2;
  const maxY = (rect.height * (zoomScale - 1)) / 2;
  panX = Math.min(maxX, Math.max(-maxX, panX));
  panY = Math.min(maxY, Math.max(-maxY, panY));
}

function setZoom(nextScale, center = stageCenter()) {
  const previousScale = zoomScale;
  const scale = Math.min(4, Math.max(1, nextScale));
  if (scale === previousScale) {
    setStatus(scale <= 1 ? "Zoom already at minimum" : "Zoom already at maximum");
    return;
  }

  const rect = stage.getBoundingClientRect();
  const centerOffsetX = center.x - rect.width / 2;
  const centerOffsetY = center.y - rect.height / 2;
  const ratio = scale / previousScale;
  panX = centerOffsetX - (centerOffsetX - panX) * ratio;
  panY = centerOffsetY - (centerOffsetY - panY) * ratio;
  zoomScale = scale;
  clampPan();
  applySourceTransform();
  setStatus(`Zoom ${zoomScale.toFixed(1)}x`);
  recordReplaySignal("zoom.change", { scale: Number(zoomScale.toFixed(3)) });
}

function resetZoom() {
  zoomScale = 1;
  panX = 0;
  panY = 0;
  pinchZoomStart = null;
  panStart = null;
  applySourceTransform();
  setStatus("Zoom reset");
}

function zoomIn() {
  setZoom(zoomScale + 0.25);
}

function zoomOut() {
  setZoom(zoomScale - 0.25);
}

function resizeCanvases() {
  const rect = stage.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  for (const canvas of [drawCanvas, previewCanvas]) {
    const snapshot = document.createElement("canvas");
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    snapshot.getContext("2d").drawImage(canvas, 0, 0);

    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    if (snapshot.width && snapshot.height && canvas === drawCanvas) {
      ctx.drawImage(snapshot, 0, 0, snapshot.width / ratio, snapshot.height / ratio, 0, 0, rect.width, rect.height);
    }
  }
  clampPan();
  applySourceTransform();
}

function canvasPoint(event) {
  const rect = drawCanvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function configureStroke(ctx, color = activeColor) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Number(sizeInput.value);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = Number(glowInput.value);
}

function clearPreview() {
  const rect = previewCanvas.getBoundingClientRect();
  previewCtx.clearRect(0, 0, rect.width, rect.height);
}

function canvasSnapshot() {
  if (!drawCanvas.width || !drawCanvas.height) return null;
  return drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
}

function updateHistoryReadout() {
  historyReadout.textContent = `${canvasHistory.length}/20`;
  appState.update({ canUndo: canvasHistory.length > 0, canRedo: redoHistory.length > 0 });
}

function restoreCanvasSnapshot(snapshot) {
  if (!snapshot) return;
  const rect = drawCanvas.getBoundingClientRect();
  drawCtx.clearRect(0, 0, rect.width, rect.height);
  drawCtx.putImageData(snapshot, 0, 0);
}

function pushCanvasHistory() {
  const snapshot = canvasSnapshot();
  if (!snapshot) return;
  canvasHistory.push(snapshot);
  canvasHistory = canvasHistory.slice(-20);
  redoHistory = [];
  updateHistoryReadout();
}

function applyUndoDrawing() {
  if (diagramHistory.length) {
    diagramRedoHistory.push(committedDiagram ? structuredClone(committedDiagram) : null);
    committedDiagram = diagramHistory.pop();
    renderCurrentDiagram();
    syncDiagramSessionFromCommitted();
    setStatus("Undo diagram");
    return;
  }
  const current = canvasSnapshot();
  const previous = canvasHistory.pop();
  if (!previous || !current) {
    setStatus("Nothing to undo");
    return;
  }
  redoHistory.push(current);
  restoreCanvasSnapshot(previous);
  clearPreview();
  updateHistoryReadout();
  setStatus("Undo");
}

function applyRedoDrawing() {
  if (diagramRedoHistory.length) {
    diagramHistory.push(committedDiagram ? structuredClone(committedDiagram) : null);
    committedDiagram = diagramRedoHistory.pop();
    renderCurrentDiagram();
    syncDiagramSessionFromCommitted();
    setStatus("Redo diagram");
    return;
  }
  const current = canvasSnapshot();
  const next = redoHistory.pop();
  if (!next || !current) {
    setStatus("Nothing to redo");
    return;
  }
  canvasHistory.push(current);
  canvasHistory = canvasHistory.slice(-20);
  restoreCanvasSnapshot(next);
  clearPreview();
  updateHistoryReadout();
  setStatus("Redo");
}

function clearGestureDrawingState() {
  gestureStartPoint = null;
  gestureLastPoint = null;
  clearPreview();
  gestureCursor.classList.remove("drawing", "paused", "priming", "pointing", "laser");
  gestureCursor.style.setProperty("--prime-progress", "0deg");
}

function setGestureLocked(locked) {
  gestureLocked = locked;
  lockReadout.textContent = locked ? "Locked" : "Open";
  clearGestureDrawingState();
  hideGestureCursor();
  transitionTo(locked ? State.LOCKED : State.TRACKING, true);
  setStatus(locked ? "Gesture lock active" : "Gesture control resumed");
}

function resetClearHold() {
  clearHoldStartedAt = null;
  clearHoldArmed = false;
}

function drawHudSegment(ctx, from, to, color = activeColor) {
  ctx.save();
  configureStroke(ctx, color);
  ctx.globalCompositeOperation = "source-over";
  ctx.lineWidth = Number(sizeInput.value) + 8;
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.globalAlpha = 0.85;
  ctx.lineWidth = Number(sizeInput.value) + 2;
  ctx.shadowBlur = Number(glowInput.value) + 10;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.lineWidth = Math.max(1.5, Number(sizeInput.value) * 0.38);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function drawHudNode(ctx, point, radius = 4, color = activeColor) {
  ctx.save();
  configureStroke(ctx, color);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(point.x, point.y, Math.max(1.5, radius * 0.36), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLine(ctx, from, to) {
  drawHudSegment(ctx, from, to);
}

function drawLaser(ctx, point, persistent = false, from = null) {
  if (persistent) {
    ctx.save();
    configureStroke(ctx, "#ff3b6b");
    ctx.lineWidth = Math.max(2, Number(sizeInput.value) * 0.55);
    ctx.shadowBlur = Number(glowInput.value) + 24;
    ctx.globalAlpha = 0.82;
    if (from) {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  const now = gestureNow();
  laserPositions.push({ ...point, timestamp: now });
  laserPositions = laserPositions.filter((entry) => now - entry.timestamp <= 400).slice(-15);

  clearPreview();
  ctx.save();
  ctx.globalCompositeOperation = "source-over";

  for (const entry of laserPositions) {
    const age = now - entry.timestamp;
    const alpha = Math.max(0.08, 1 - age / 400);
    ctx.strokeStyle = `rgba(255, 59, 107, ${alpha * 0.88})`;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.shadowColor = "#ff3b6b";
    ctx.shadowBlur = (Number(glowInput.value) + 18) * alpha;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(entry.x, entry.y, 8 + alpha * 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(entry.x, entry.y, 2 + alpha * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255, 209, 102, 0.84)";
  ctx.shadowBlur = Number(glowInput.value) + 12;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(point.x - 28, point.y);
  ctx.lineTo(point.x - 12, point.y);
  ctx.moveTo(point.x + 12, point.y);
  ctx.lineTo(point.x + 28, point.y);
  ctx.moveTo(point.x, point.y - 28);
  ctx.lineTo(point.x, point.y - 12);
  ctx.moveTo(point.x, point.y + 12);
  ctx.lineTo(point.x, point.y + 28);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(point.x, point.y, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fill();
  ctx.restore();
}

function drawArrow(ctx, from, to) {
  const headLength = 28;
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const left = {
    x: to.x - headLength * Math.cos(angle - Math.PI / 6),
    y: to.y - headLength * Math.sin(angle - Math.PI / 6)
  };
  const right = {
    x: to.x - headLength * Math.cos(angle + Math.PI / 6),
    y: to.y - headLength * Math.sin(angle + Math.PI / 6)
  };

  drawHudSegment(ctx, from, to);
  drawHudSegment(ctx, to, left);
  drawHudSegment(ctx, to, right);
  drawHudNode(ctx, from, 5);
  drawHudNode(ctx, to, 4);
}

function drawCircle(ctx, from, to) {
  const radiusX = Math.abs(to.x - from.x) / 2;
  const radiusY = Math.abs(to.y - from.y) / 2;
  const centerX = (from.x + to.x) / 2;
  const centerY = (from.y + to.y) / 2;
  const radius = Math.max(8, Math.max(radiusX, radiusY));

  ctx.save();
  configureStroke(ctx);
  ctx.lineWidth = Number(sizeInput.value) + 7;
  ctx.globalAlpha = 0.16;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, Math.max(4, radiusX), Math.max(4, radiusY), 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.92;
  ctx.lineWidth = Number(sizeInput.value) + 1.5;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, Math.max(4, radiusX), Math.max(4, radiusY), 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.82;
  ctx.lineWidth = 1.4;
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, Math.max(4, radiusX * 0.72), Math.max(4, radiusY * 0.72), 0, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 12; i += 1) {
    const angle = (Math.PI * 2 * i) / 12;
    const inner = radius * 0.88;
    const outer = radius * 1.04;
    drawHudSegment(ctx, {
      x: centerX + Math.cos(angle) * inner,
      y: centerY + Math.sin(angle) * inner
    }, {
      x: centerX + Math.cos(angle) * outer,
      y: centerY + Math.sin(angle) * outer
    });
  }

  drawHudNode(ctx, { x: centerX, y: centerY }, 3);
  ctx.restore();
}

function drawSpotlight(ctx, from, to) {
  const radius = Math.max(28, Math.hypot(to.x - from.x, to.y - from.y));
  const gradient = ctx.createRadialGradient(from.x, from.y, 8, from.x, from.y, radius);
  gradient.addColorStop(0, "rgba(255, 213, 154, 0.46)");
  gradient.addColorStop(0.42, "rgba(255, 138, 42, 0.22)");
  gradient.addColorStop(1, "rgba(255, 138, 42, 0)");

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.shadowColor = "#ff8a2a";
  ctx.shadowBlur = Number(glowInput.value) + 12;
  ctx.beginPath();
  ctx.arc(from.x, from.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 211, 138, 0.82)";
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.38)";
  ctx.beginPath();
  ctx.arc(from.x, from.y, radius * 0.62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function stageCenter() {
  const rect = drawCanvas.getBoundingClientRect();
  return {
    x: rect.width / 2,
    y: rect.height / 2
  };
}

function commandShapeBounds(shape) {
  const rect = drawCanvas.getBoundingClientRect();
  const center = stageCenter();
  const size = Math.min(rect.width, rect.height);
  const wide = Math.max(96, size * 0.22);
  const tall = Math.max(72, size * 0.16);

  if (shape === "arrow") {
    return {
      from: { x: center.x - wide, y: center.y + tall * 0.45 },
      to: { x: center.x + wide, y: center.y - tall * 0.45 }
    };
  }

  if (shape === "circle") {
    return {
      from: { x: center.x - wide, y: center.y - tall },
      to: { x: center.x + wide, y: center.y + tall }
    };
  }

  return {
    from: center,
    to: { x: center.x + wide * 0.65, y: center.y }
  };
}

function drawCommandShape(shape) {
  const { from, to } = commandShapeBounds(shape);
  pushCanvasHistory();

  if (shape === "arrow") drawArrow(drawCtx, from, to);
  if (shape === "circle") drawCircle(drawCtx, from, to);
  if (shape === "spotlight") drawSpotlight(drawCtx, from, to);

  setStatus(`${shape.charAt(0).toUpperCase() + shape.slice(1)} placed`);
}

function updateGestureCursor(point, mode = "tracking") {
  gestureCursor.style.left = `${point.x}px`;
  gestureCursor.style.top = `${point.y}px`;
  gestureCursor.style.setProperty("--cursor-color", activeColor);
  gestureCursor.classList.add("active");
  gestureCursor.classList.toggle("drawing", mode === "drawing");
  gestureCursor.classList.toggle("paused", mode === "paused");
  gestureCursor.classList.toggle("priming", mode === "priming");
  gestureCursor.classList.toggle("pointing", mode === "pointing");
  gestureCursor.classList.toggle("laser", mode === "laser");
}

function hideGestureCursor() {
  gestureCursor.classList.remove("active", "drawing", "paused", "priming", "pointing", "laser");
  gestureCursor.style.setProperty("--prime-progress", "0deg");
}

function setPausedCursor(point) {
  updateGestureCursor(point, "paused");
}

function eraseCommandArea() {
  const center = stageCenter();
  pushCanvasHistory();
  drawCtx.save();
  drawCtx.globalCompositeOperation = "destination-out";
  drawCtx.beginPath();
  drawCtx.arc(center.x, center.y, Math.max(48, Number(sizeInput.value) * 7), 0, Math.PI * 2);
  drawCtx.fill();
  drawCtx.restore();
  setStatus("Center erased");
}

async function loadHandLandmarker() {
  if (handLandmarker) return handLandmarker;
  if (handLandmarkerPromise) return handLandmarkerPromise;

  setStatus("Loading hand model");
  handLandmarkerPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks("./vendor/tasks-vision/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "./vendor/mediapipe-models/hand_landmarker.task"
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.6,
      minHandPresenceConfidence: 0.6,
      minTrackingConfidence: 0.6
    });
    return handLandmarker;
  })();

  try {
    return await handLandmarkerPromise;
  } catch (error) {
    handLandmarker = null;
    throw error;
  } finally {
    handLandmarkerPromise = null;
  }
}

function describeStartupError(error) {
  const message = String(error?.message || error?.name || error || "unknown error");

  if (message.includes("Permission") || message.includes("NotAllowed")) return "Camera permission blocked";
  if (message.includes("getUserMedia")) return "Camera unavailable in this browser";
  if (message.includes("Failed to fetch") || message.includes("import") || message.includes("load")) return "Hand model download blocked";
  return `Hand startup failed: ${message.slice(0, 72)}`;
}

function landmarkDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function palmCenter(hand) {
  return {
    x: (hand[0].x + hand[5].x + hand[17].x) / 3,
    y: (hand[0].y + hand[5].y + hand[17].y) / 3
  };
}

function screenPointFromLandmark(landmark) {
  const rect = drawCanvas.getBoundingClientRect();
  return {
    x: (mirrorMovement ? 1 - landmark.x : landmark.x) * rect.width,
    y: landmark.y * rect.height
  };
}

function resetFilters() {
  for (const filterSet of Object.values(pointFilters)) {
    filterSet.x.update({ minCutoff: stability, beta: responsiveness });
    filterSet.y.update({ minCutoff: stability, beta: responsiveness });
    filterSet.x.reset();
    filterSet.y.reset();
    filterSet.history = [];
  }
  positionHistory = [];
}

function pointFromLandmark(landmark, timestamp = gestureNow(), mode = "cursor") {
  const filterSet = pointFilters[mode] || pointFilters.cursor;
  const raw = screenPointFromLandmark(landmark);
  filterSet.history.push({ ...raw, timestamp });
  filterSet.history = filterSet.history.filter((point) => timestamp - point.timestamp <= 160).slice(-4);

  let predicted = raw;
  if (filterSet.history.length >= 3 && predictionMs > 0) {
    const first = filterSet.history[0];
    const last = filterSet.history[filterSet.history.length - 1];
    const elapsed = Math.max(1, last.timestamp - first.timestamp);
    predicted = {
      x: raw.x + ((last.x - first.x) / elapsed) * predictionMs,
      y: raw.y + ((last.y - first.y) / elapsed) * predictionMs
    };
  }

  return {
    x: filterSet.x.filter(predicted.x, timestamp),
    y: filterSet.y.filter(predicted.y, timestamp)
  };
}

function jointAngle(a, joint, c) {
  const first = { x: a.x - joint.x, y: a.y - joint.y };
  const second = { x: c.x - joint.x, y: c.y - joint.y };
  const magnitude = Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y);
  if (!magnitude) return 0;
  const cosine = Math.min(1, Math.max(-1, (first.x * second.x + first.y * second.y) / magnitude));
  return (Math.acos(cosine) * 180) / Math.PI;
}

function isFingerExtended(hand, tip, pip, mcp) {
  const straight = jointAngle(hand[mcp], hand[pip], hand[tip]) > 152;
  const reachesPastJoint = landmarkDistance(hand[tip], hand[0]) > landmarkDistance(hand[pip], hand[0]) * 1.06;
  return straight && reachesPastJoint;
}

function isThumbExtended(hand) {
  const straight = jointAngle(hand[2], hand[3], hand[4]) > 145;
  const reachesPastJoint = landmarkDistance(hand[4], hand[0]) > landmarkDistance(hand[3], hand[0]) * 1.04;
  return straight && reachesPastJoint;
}

function isPrecisionPinch(hand) {
  const palmWidth = Math.max(0.001, landmarkDistance(hand[5], hand[17]));
  const pinchRatio = landmarkDistance(hand[8], hand[4]) / palmWidth;
  const middle = isFingerExtended(hand, 12, 10, 9);
  const ring = isFingerExtended(hand, 16, 14, 13);
  const pinky = isFingerExtended(hand, 20, 18, 17);
  return pinchRatio < activeProfile.thresholds.pinchEnter && [middle, ring, pinky].filter(Boolean).length <= 1;
}

function isMenuSelectionPinch(hand) {
  const palmWidth = Math.max(0.001, landmarkDistance(hand[5], hand[17]));
  const ratio = landmarkDistance(hand[8], hand[4]) / palmWidth;
  if (menuPinchActive) {
    if (ratio > activeProfile.thresholds.pinchExit) menuPinchActive = false;
  } else if (ratio < activeProfile.thresholds.menuPinchEnter) {
    menuPinchActive = true;
  }
  return menuPinchActive;
}

function classifyGesture(hand) {
  const index = isFingerExtended(hand, 8, 6, 5);
  const middle = isFingerExtended(hand, 12, 10, 9);
  const ring = isFingerExtended(hand, 16, 14, 13);
  const pinky = isFingerExtended(hand, 20, 18, 17);
  const thumb = isThumbExtended(hand);
  const fingers = [index, middle, ring, pinky].filter(Boolean).length;

  if (fingers >= 4) return Gesture.PALM;
  if (isPrecisionPinch(hand)) return Gesture.PINCH;
  if (fingers === 0 && !thumb) return Gesture.FIST;
  if (index && !middle && !ring && !pinky) return Gesture.INDEX_ONLY;
  if (index && middle && !ring && !pinky) return Gesture.PEACE;
  return Gesture.OTHER;
}

function stableTargetState(gesture) {
  if (gestureLocked) return State.LOCKED;
  if (gesture === Gesture.FIST) return State.IDLE;
  if (gesture === Gesture.INDEX_ONLY) return State.PRIMING;
  if (gesture === Gesture.PEACE) return State.POINTING;
  if (gesture === Gesture.PALM) return State.PAUSED;
  return State.TRACKING;
}

function stateLabel(state) {
  const labels = {
    [State.IDLE]: "Idle",
    [State.TRACKING]: "Ready",
    [State.POINTING]: "Pointer",
    [State.PRIMING]: "Priming",
    [State.DRAWING]: activeTool === "eraser" ? "Erasing" : "Drawing",
    [State.COOLDOWN]: "Cooldown",
    [State.PAUSED]: "Paused",
    [State.MENU]: "Menu",
    [State.LOCKED]: "Locked"
  };
  return labels[state] || state;
}

function layoutRadialMenu() {
  radialItems.forEach((item, index) => {
    const angle = (index / radialItems.length) * Math.PI * 2 - Math.PI / 2;
    item.style.setProperty("--angle", `${angle}rad`);
    item.style.setProperty("--angle-inverse", `${-angle}rad`);
  });
}

function clampMenuPoint(point) {
  const rect = stage.getBoundingClientRect();
  const margin = Math.ceil((radialMenu.offsetWidth || 286) / 2) + 18;
  return {
    x: Math.min(Math.max(point.x, margin), Math.max(margin, rect.width - margin)),
    y: Math.min(Math.max(point.y, margin), Math.max(margin, rect.height - margin))
  };
}

function openRadialMenu(point) {
  radialCenter = clampMenuPoint(point);
  radialSelectedItem = { type: "tool", value: activeTool };
  menuPinchFrames = 0;
  if (radialCoreLabel) radialCoreLabel.textContent = toolReadout.textContent;
  radialMenu.style.left = `${radialCenter.x}px`;
  radialMenu.style.top = `${radialCenter.y}px`;
  radialMenu.classList.add("open");
  radialMenu.setAttribute("aria-hidden", "false");
  radialItems.forEach((item) => item.classList.remove("menu-hot"));
  setStatus("Tool menu open");
  recordReplaySignal("menu.open");
}

function closeRadialMenu() {
  radialMenu.classList.remove("open");
  radialMenu.setAttribute("aria-hidden", "true");
  radialItems.forEach((item) => item.classList.remove("menu-hot"));
  radialCenter = null;
  menuPinchFrames = 0;
}

function updateRadialSelection(point) {
  if (!radialCenter || !radialItems.length) return;
  const angle = Math.atan2(point.y - radialCenter.y, point.x - radialCenter.x);
  const normalized = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
  const index = Math.round(normalized / ((Math.PI * 2) / radialItems.length)) % radialItems.length;
  const item = radialItems[index];
  radialSelectedItem = item.dataset.radialAction
    ? { type: "action", value: item.dataset.radialAction }
    : { type: "tool", value: item.dataset.tool || activeTool };
  radialItems.forEach((candidate) => candidate.classList.toggle("menu-hot", candidate === item));
  updateGestureCursor(point, "pointing");
}

function selectRadialTool() {
  if (!radialSelectedItem?.value) return;
  if (radialSelectedItem.type === "action" && radialSelectedItem.value === "diagrams") {
    dispatchPresentationCommand("diagram.gallery.open", {}, "gesture");
  } else {
    selectTool(radialSelectedItem.value, "gesture");
  }
  closeRadialMenu();
  transitionTo(State.TRACKING, true);
}

function transitionTo(nextState, force = false) {
  if (!force && nextState === gestureState) return;
  gestureState = nextState;
  stateEnteredAt = gestureNow();
  recordReplaySignal(`state.${nextState}`);
  setGestureStateLabel(stateLabel(nextState));
  updateGestureIndicator(nextState);

  if (nextState !== State.PAUSED) palmHoldAnchor = null;

  if (nextState !== State.MENU) {
    closeRadialMenu();
  }

  if ([State.IDLE, State.TRACKING, State.POINTING, State.PAUSED, State.LOCKED].includes(nextState)) {
    clearGestureDrawingState();
  }

  if ([State.IDLE, State.LOCKED].includes(nextState)) {
    hideGestureCursor();
  }
}

function requestState(nextState, requiredFrames = 3) {
  if (nextState === gestureState) {
    pendingState = nextState;
    pendingFrames = 0;
    return;
  }

  if (pendingState !== nextState) {
    pendingState = nextState;
    pendingFrames = 1;
  } else {
    pendingFrames += 1;
  }

  if (pendingFrames >= requiredFrames) {
    transitionTo(nextState);
    pendingFrames = 0;
  }
}

function handednessLabel(entry) {
  return entry?.[0]?.categoryName || entry?.[0]?.displayName || "";
}

function validTwoHandPair(hands, handedness = []) {
  if (hands.length < 2) return false;
  const firstLabel = handednessLabel(handedness[0]);
  const secondLabel = handednessLabel(handedness[1]);
  if (firstLabel && secondLabel && firstLabel === secondLabel) return false;
  const centerDistance = landmarkDistance(palmCenter(hands[0]), palmCenter(hands[1]));
  return centerDistance > 0.025;
}

function updateTwoHandMode(hands, handedness = []) {
  const validPair = validTwoHandPair(hands, handedness);

  if (validPair) {
    twoHandCandidateFrames += 1;
    twoHandLostFrames = 0;
    if (!twoHandMode && twoHandCandidateFrames >= activeProfile.timing.twoHandConfirmFrames) {
      twoHandMode = true;
      clearGestureDrawingState();
      resetFilters();
      hideGestureCursor();
      setGestureStateLabel("Two hands");
      setStatus("Two-hand controls ready");
      recordReplaySignal("two-hand.enter");
    }
  } else {
    twoHandCandidateFrames = 0;
    if (twoHandMode) {
      twoHandLostFrames += 1;
      if (twoHandLostFrames >= 5) {
        twoHandMode = false;
        twoHandLostFrames = 0;
        zoomCandidateFrames = 0;
        pinchZoomStart = null;
        resetClearHold();
        resetFilters();
        transitionTo(State.TRACKING, true);
        setStatus("Single-hand controls ready");
        recordReplaySignal("two-hand.exit");
      }
    }
  }

  return { validPair, active: twoHandMode };
}

function selectPrimaryHand(hands, handedness = []) {
  if (activeProfile.dominantHand !== "Auto") {
    const preferred = hands.find((hand, index) => handednessLabel(handedness[index]) === activeProfile.dominantHand);
    if (preferred) return preferred;
  }
  if (hands.length === 1) {
    lastPrimaryWrist = hands[0][0];
    return hands[0];
  }
  if (!lastPrimaryWrist) {
    lastPrimaryWrist = hands[0][0];
    return hands[0];
  }
  const selected = hands.reduce((best, hand) => (
    landmarkDistance(hand[0], lastPrimaryWrist) < landmarkDistance(best[0], lastPrimaryWrist) ? hand : best
  ), hands[0]);
  lastPrimaryWrist = selected[0];
  return selected;
}

function isOpenPalm(hand) {
  return classifyGesture(hand) === Gesture.PALM;
}

function isClapGesture(hands) {
  if (hands.length < 2) return false;
  const left = palmCenter(hands[0]);
  const right = palmCenter(hands[1]);
  return landmarkDistance(left, right) < activeProfile.thresholds.clapDistance && isOpenPalm(hands[0]) && isOpenPalm(hands[1]);
}

function handleClapEvent() {
  const now = gestureNow();

  if (now - lastClapAt < 500) {
    window.clearTimeout(clapTimer);
    clapTimer = null;
    lastClapAt = 0;
    resetZoom();
    setGestureStateLabel("Zoom reset");
    return;
  }

  lastClapAt = now;
  window.clearTimeout(clapTimer);
  clapTimer = window.setTimeout(() => {
    setGestureLocked(!gestureLocked);
    clapTimer = null;
  }, 520);
}

function isClearHoldGesture(hands) {
  if (hands.length < 2) return false;
  const left = palmCenter(hands[0]);
  const right = palmCenter(hands[1]);
  const distance = landmarkDistance(left, right);
  return distance > 0.24 && distance < 0.62 && isOpenPalm(hands[0]) && isOpenPalm(hands[1]);
}

function isTwoHandPinchZoom(hands) {
  return hands.length >= 2 && isPrecisionPinch(hands[0]) && isPrecisionPinch(hands[1]);
}

function handleTwoHandPinchZoom(hands) {
  const first = screenPointFromLandmark(hands[0][8]);
  const second = screenPointFromLandmark(hands[1][8]);
  const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
  const center = {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2
  };

  if (!pinchZoomStart) {
    pinchZoomStart = {
      distance,
      scale: zoomScale
    };
    setGestureStateLabel("Zoom");
    setStatus("Spread hands to zoom in, bring them together to zoom out");
    return;
  }

  const ratio = distance / pinchZoomStart.distance;
  if (Math.abs(ratio - 1) < 0.035) return;
  setZoom(pinchZoomStart.scale * ratio, center);
  setGestureStateLabel(`Zoom ${zoomScale.toFixed(1)}x`);
}

function trackPointerPan(point, gesture) {
  if (zoomScale <= 1 || gesture !== Gesture.PEACE) {
    panStart = null;
    return;
  }

  if (!panStart) {
    panStart = { point, panX, panY };
    return;
  }

  panX = panStart.panX + point.x - panStart.point.x;
  panY = panStart.panY + point.y - panStart.point.y;
  clampPan();
  applySourceTransform();
}

function trackPointerSwipe(hand, timestamp) {
  const wristPoint = screenPointFromLandmark(hand[0]);
  positionHistory.push({ ...wristPoint, timestamp });
  positionHistory = positionHistory.filter((point) => timestamp - point.timestamp <= 220);

  if (gestureNow() - lastSwipeAt < 400 || positionHistory.length < 3) return;

  const first = positionHistory[0];
  const last = positionHistory[positionHistory.length - 1];
  const elapsedSeconds = Math.max(0.001, (last.timestamp - first.timestamp) / 1000);
  const velocityX = (last.x - first.x) / elapsedSeconds;
  const velocityY = (last.y - first.y) / elapsedSeconds;

  if (Math.abs(velocityX) > Math.max(800, activeProfile.thresholds.swipeVelocity) && Math.abs(velocityY) < 200) {
    lastSwipeAt = gestureNow();
    positionHistory = [];
    if (velocityX < 0) {
      undoDrawing("gesture");
    } else {
      redoDrawing("gesture");
    }
  }
}

function setSlideMode(enabled) {
  slideMode = enabled;
  sourceVideo.classList.toggle("slides-active", enabled);
  slideImage.classList.toggle("active", enabled && slideSourceType === "images");
  pptxCanvas.classList.toggle("active", enabled && slideSourceType === "pptx");
  slideReadout.textContent = enabled && slideDeck.length ? `${currentSlideIndex + 1}/${slideDeck.length}` : "Off";
  appState.update({
    slideIndex: enabled ? currentSlideIndex : 0,
    slideCount: enabled ? slideDeck.length : 0
  });
}

async function showSlide(index) {
  if (!slideDeck.length) return;
  currentSlideIndex = Math.min(slideDeck.length - 1, Math.max(0, index));
  appState.update({ slideIndex: currentSlideIndex, slideCount: slideDeck.length });

  if (slideSourceType === "pptx") {
    if (!pptxViewer || pptxRendering) return;
    pptxRendering = true;
    setStatus(`Rendering slide ${currentSlideIndex + 1} / ${slideDeck.length}`);
    try {
      await pptxViewer.renderSlide(currentSlideIndex, pptxCanvas);
      slideReadout.textContent = `${currentSlideIndex + 1}/${slideDeck.length}`;
      setStatus(`Slide ${currentSlideIndex + 1} / ${slideDeck.length}`);
    } catch (error) {
      setStatus(`PowerPoint slide failed: ${String(error?.message || error).slice(0, 72)}`);
      console.warn("PowerPoint slide render failed", error);
    } finally {
      pptxRendering = false;
    }
    return;
  }

  const targetSlide = slideDeck[currentSlideIndex];
  if (!targetSlide) return;
  slideImage.style.opacity = "0";
  window.setTimeout(() => {
    slideImage.onload = () => {
      slideImage.style.opacity = "1";
      slideImage.onload = null;
      slideImage.onerror = null;
    };
    slideImage.onerror = () => {
      slideImage.style.opacity = "1";
      setStatus(`Could not load ${targetSlide.name}`);
      slideImage.onload = null;
      slideImage.onerror = null;
    };
    slideImage.src = targetSlide.url;
  }, 90);
  slideReadout.textContent = `${currentSlideIndex + 1}/${slideDeck.length}`;
  setStatus(`Slide ${currentSlideIndex + 1} / ${slideDeck.length}`);
}

function applyNextSlide() {
  if (!slideMode || !slideDeck.length) throw new Error("Load slides before using next slide");
  if (currentSlideIndex >= slideDeck.length - 1) throw new Error("Already on the last slide");
  void showSlide(currentSlideIndex + 1);
}

function applyPreviousSlide() {
  if (!slideMode || !slideDeck.length) throw new Error("Load slides before using previous slide");
  if (currentSlideIndex <= 0) throw new Error("Already on the first slide");
  void showSlide(currentSlideIndex - 1);
}

function trackSlideSwipe(hand, timestamp) {
  if (!slideMode || sourceVideo.srcObject || !slideSwipeArmed) return false;
  const center = screenPointFromLandmark(palmCenter(hand));
  slideSwipeHistory.push({ ...center, timestamp });
  slideSwipeHistory = slideSwipeHistory.filter((point) => timestamp - point.timestamp <= 320);

  if (slideSwipeHistory.length < 3) return false;

  const first = slideSwipeHistory[0];
  const last = slideSwipeHistory[slideSwipeHistory.length - 1];
  const elapsedSeconds = Math.max(0.001, (last.timestamp - first.timestamp) / 1000);
  const travelX = last.x - first.x;
  const travelY = last.y - first.y;
  const velocityX = (last.x - first.x) / elapsedSeconds;
  const velocityY = (last.y - first.y) / elapsedSeconds;

  if (Math.abs(travelX) >= 26 && Math.abs(travelX) > Math.abs(travelY) * 1.25) {
    slideSwipeCandidateUntil = gestureNow() + 700;
    palmMenuBlockedUntil = Math.max(palmMenuBlockedUntil, slideSwipeCandidateUntil);
    setGestureStateLabel("Swipe detected");
  }

  if (
    Math.abs(travelX) >= 54
    && Math.abs(velocityX) > 420
    && Math.abs(travelX) > Math.abs(travelY) * 1.4
    && Math.abs(velocityY) < Math.abs(velocityX) * 0.7
  ) {
    lastSlideSwipeAt = gestureNow();
    slideSwipeArmed = false;
    slideSwipeReleaseFrames = 0;
    palmMenuBlockedUntil = lastSlideSwipeAt + 1200;
    slideSwipeHistory = [];
    if (velocityX < 0) {
      nextSlide("gesture");
    } else {
      previousSlide("gesture");
    }
    return true;
  }
  return false;
}

function revokeSlideUrls() {
  slideDeck.forEach((slide) => {
    if (slide.url) URL.revokeObjectURL(slide.url);
  });
  pptxViewer?.destroy?.();
  pptxViewer = null;
}

async function loadPowerPoint(file) {
  if (!window.PptxViewJS?.PPTXViewer) throw new Error("PowerPoint renderer did not load");
  pptxCanvas.width = 1280;
  pptxCanvas.height = 720;
  pptxViewer = new window.PptxViewJS.PPTXViewer({
    canvas: pptxCanvas,
    enableThumbnails: false,
    autoRenderFirstSlide: false,
    autoChartRerenderDelayMs: 200
  });
  await pptxViewer.loadFile(file);
  const count = pptxViewer.getSlideCount();
  if (!count) throw new Error("No slides were found in this PowerPoint file");
  slideDeck = Array.from({ length: count }, (_, index) => ({ name: `${file.name} — slide ${index + 1}` }));
  slideSourceType = "pptx";
}

async function loadSlides(files) {
  const selectedFiles = [...files];
  const powerPoints = selectedFiles.filter((file) => file.name.toLowerCase().endsWith(".pptx"));
  const images = selectedFiles.filter((file) => file.type.startsWith("image/"));

  if (powerPoints.length) {
    if (selectedFiles.length !== 1) {
      setStatus("Choose one PowerPoint file at a time");
      slidesInput.value = "";
      return;
    }
    slidesBtn.disabled = true;
    slidesBtn.textContent = "Loading PowerPoint...";
    setStatus("Reading PowerPoint locally");
    showActionNotice("Opening the PowerPoint in your browser. The file stays on this device.");
  }

  if (!images.length && !powerPoints.length) {
    setStatus("Choose a PPTX, PNG, JPG, or WebP file");
    slidesInput.value = "";
    return;
  }

  try {
    sourceVideo.srcObject?.getTracks().forEach((track) => track.stop());
    sourceVideo.srcObject = null;
    revokeSlideUrls();
    if (powerPoints.length) {
      await loadPowerPoint(powerPoints[0]);
    } else {
      slideSourceType = "images";
      slideDeck = images.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }));
    }
    currentSlideIndex = 0;
    setSlideMode(true);
    resetZoom();
    clearDrawing();
    emptyState.classList.add("hidden");
    await showSlide(0);
    showActionNotice(powerPoints.length ? "PowerPoint loaded. Use palm swipes or arrow keys to change slides." : "Slides loaded.");
  } catch (error) {
    slideDeck = [];
    setSlideMode(false);
    setStatus(`Could not open PowerPoint: ${String(error?.message || error).slice(0, 72)}`);
    showActionNotice("This PowerPoint could not be rendered. Try saving it again as PPTX or export it to slide images.", true);
    console.warn("Slide loading failed", error);
  } finally {
    slidesBtn.disabled = false;
    slidesBtn.textContent = "Load Slides";
    slidesInput.value = "";
  }
}

function clearDrawing() {
  pushCanvasHistory();
  const rect = drawCanvas.getBoundingClientRect();
  drawCtx.clearRect(0, 0, rect.width, rect.height);
  clearPreview();
  setStatus("Overlay cleared");
  recordReplaySignal("overlay.clear");
}

function handleClearHold() {
  const now = gestureNow();
  if (clearHoldStartedAt === null) {
    clearHoldStartedAt = now;
    clearHoldArmed = true;
  }

  const elapsed = now - clearHoldStartedAt;
  const remaining = Math.max(0, Math.ceil((1000 - elapsed) / 100) / 10);
  setGestureStateLabel(`Clear ${remaining.toFixed(1)}s`);
  setStatus(`Hold to clear ${remaining.toFixed(1)}s`);

  if (elapsed >= 1000 && clearHoldArmed) {
    clearHoldArmed = false;
    clearDrawing();
    setGestureStateLabel("Cleared");
    window.setTimeout(resetClearHold, 450);
  }
}

function processHands(hands, timestamp, handedness = []) {
  const handMode = updateTwoHandMode(hands, handedness);

  if (!hands.length) {
    missingInferenceFrames += 1;
    returnStableFrames = 0;
    cancelGestureDiagramDrag();
    if (gestureState === State.DRAWING && drawingHandLostAt === null) drawingHandLostAt = gestureNow();
    if (gestureState === State.DRAWING && missingInferenceFrames >= 2) {
      hideGestureCursor();
      setGestureStateLabel("Tracking interrupted");
      recordReplaySignal("drawing.suspended", { missingFrames: missingInferenceFrames });
    }
    if (gestureState === State.DRAWING && drawingHandLostAt !== null && gestureNow() - drawingHandLostAt >= 150) {
      finishDrawing(gestureLastPoint || gestureStartPoint);
      transitionTo(State.TRACKING, true);
      recordReplaySignal("drawing.tracking-loss-stop");
    }
    clapActive = false;
    pinchZoomStart = null;
    panStart = null;
    lastPrimaryWrist = null;
    if (handMode.active) {
      hideGestureCursor();
      return;
    }
    if (gestureNow() - lastHandAt > 500) {
      transitionTo(State.IDLE);
      handReadout.textContent = "Searching";
      hideGestureCursor();
    }
    return;
  }

  if (missingInferenceFrames >= 2) {
    if (gestureState === State.DRAWING) {
      finishDrawing(gestureLastPoint || gestureStartPoint);
      transitionTo(State.TRACKING, true);
      recordReplaySignal("drawing.tracking-loss-stop");
    }
    returnStableFrames += 1;
    if (returnStableFrames < activeProfile.timing.handReturnFrames) {
      handReadout.textContent = "Stabilizing";
      hideGestureCursor();
      return;
    }
    resetFilters();
  }
  missingInferenceFrames = 0;
  drawingHandLostAt = null;
  returnStableFrames = Math.min(returnStableFrames, activeProfile.timing.handReturnFrames);

  if (!onboarding.hidden) dismissOnboarding();
  handSeenFrames += 1;
  lastHandAt = gestureNow();

  if (handMode.active) {
    handReadout.textContent = handMode.validPair ? "Two hands" : "Releasing";
    clearGestureDrawingState();
    cancelGestureDiagramDrag();
    hideGestureCursor();

    if (!handMode.validPair) return;

    const pair = hands.slice(0, 2);
    const clapping = isClapGesture(pair);
    if (clapping && !clapActive) {
      clapActive = true;
      handleClapEvent();
      return;
    }
    if (!clapping) clapActive = false;
    if (clapping) return;

    if (gestureLocked) {
      transitionTo(State.LOCKED);
      return;
    }

    if (isClearHoldGesture(pair)) {
      zoomCandidateFrames = 0;
      pinchZoomStart = null;
      handleClearHold();
      return;
    }

    resetClearHold();
    if (isTwoHandPinchZoom(pair)) {
      zoomCandidateFrames += 1;
      if (zoomCandidateFrames >= 5) handleTwoHandPinchZoom(pair);
      else setStatus("Hold both pinches to start zoom");
      return;
    }

    zoomCandidateFrames = 0;
    pinchZoomStart = null;
    setGestureStateLabel("Two hands");
    setStatus("Pinch with both hands to zoom");
    return;
  }

  clapActive = false;
  zoomCandidateFrames = 0;
  pinchZoomStart = null;
  resetClearHold();
  handReadout.textContent = hands.length > 1 ? "Confirming" : "Tracking";

  if (gestureLocked) {
    transitionTo(State.LOCKED);
    return;
  }

  const hand = selectPrimaryHand(hands, handedness);
  captureCalibrationSample(hand);
  let gesture = classifyGesture(hand);
  if (gestureState === State.MENU) {
    if (isMenuSelectionPinch(hand)) {
      menuPinchFrames += 1;
      if (menuPinchFrames >= 2) gesture = Gesture.PINCH;
    } else {
      menuPinchFrames = 0;
    }
  }
  const cursorPoint = pointFromLandmark(hand[5], timestamp, "cursor");
  const drawingPoint = pointFromLandmark(hand[8], timestamp, "draw");
  const target = stableTargetState(gesture);

  if (gesture === Gesture.PEACE) {
    trackPointerSwipe(hand, timestamp);
  } else {
    positionHistory = [];
  }

  if (gesture === Gesture.PALM) {
    const palmResult = palmNavigation.observePalm(
      screenPointFromLandmark(palmCenter(hand)),
      timestamp,
      { enabled: slideMode && !sourceVideo.srcObject }
    );
    if (palmResult.action) {
      if (palmResult.action === "NEXT") nextSlide("gesture");
      else previousSlide("gesture");
      palmHoldAnchor = null;
      transitionTo(State.TRACKING, true);
      setGestureStateLabel(palmResult.action === "NEXT" ? "Next slide" : "Previous slide");
      setStatus(palmResult.action === "NEXT" ? "Next slide" : "Previous slide");
      recordReplaySignal("palm-navigation.commit", { action: palmResult.action });
      hideGestureCursor();
      return;
    }
  } else {
    const release = palmNavigation.observeNonPalm();
    if (release.rearmed) setGestureStateLabel("Swipe ready");
  }

  if (gestureState === State.MENU) {
    runStateBehavior(cursorPoint, drawingPoint, gesture);
    return;
  }

  if (gestureState === State.DRAWING && target !== State.PRIMING) {
    finishDrawing(drawingPoint);
    transitionTo(State.COOLDOWN, true);
    return;
  }

  if (gestureState === State.DRAWING && target === State.PRIMING) {
    drawActiveTool(drawingPoint);
    return;
  }

  if (gestureState === State.COOLDOWN) {
    if (gestureNow() - stateEnteredAt >= 80) transitionTo(State.TRACKING, true);
    return;
  }

  if (handSeenFrames < 3) {
    transitionTo(State.TRACKING);
    updateGestureCursor(cursorPoint, "tracking");
    return;
  }

  if (handleDiagramPinchInteraction(drawingPoint, gesture)) return;

  requestState(target, 3);
  runStateBehavior(cursorPoint, drawingPoint, gesture);
}

function runStateBehavior(cursorPoint, drawingPoint, gesture = Gesture.NONE) {
  if (gestureState === State.IDLE) {
    panStart = null;
    hideGestureCursor();
    return;
  }

  if (gestureState === State.TRACKING) {
    panStart = null;
    updateGestureCursor(cursorPoint, "tracking");
    return;
  }

  if (gestureState === State.POINTING) {
    trackPointerPan(cursorPoint, gesture);
    if (activeTool === "laser") {
      updateGestureCursor(cursorPoint, "laser");
      drawLaser(previewCtx, cursorPoint);
    } else {
      updateGestureCursor(cursorPoint, "pointing");
      laserPositions = [];
      clearPreview();
    }
    return;
  }

  if (gestureState === State.PAUSED) {
    panStart = null;
    setPausedCursor(cursorPoint);
    if (
      gesture === Gesture.PALM
      && palmNavigation.menuReady(gestureNow(), activeProfile.timing.menuHoldMs)
    ) {
      openRadialMenu(cursorPoint);
      transitionTo(State.MENU, true);
    }
    return;
  }

  if (gestureState === State.MENU) {
    panStart = null;
    if (gesture === Gesture.PINCH) {
      selectRadialTool();
      return;
    }
    if (gesture === Gesture.FIST || gesture === Gesture.NONE) {
      closeRadialMenu();
      transitionTo(State.TRACKING, true);
      return;
    }
    updateRadialSelection([Gesture.INDEX_ONLY, Gesture.PEACE, Gesture.OTHER].includes(gesture) ? drawingPoint : cursorPoint);
    return;
  }

  if (gestureState === State.PRIMING) {
    panStart = null;
    const progress = Math.min(1, (gestureNow() - stateEnteredAt) / Math.max(1, primeDelayMs));
    gestureCursor.style.setProperty("--prime-progress", `${progress * 360}deg`);
    updateGestureCursor(drawingPoint, "priming");
    if (gestureNow() - stateEnteredAt >= primeDelayMs) {
      startDrawing(drawingPoint);
      transitionTo(State.DRAWING, true);
    }
    return;
  }

  if (gestureState === State.DRAWING) {
    drawActiveTool(drawingPoint);
  }
}

function startDrawing(point) {
  gestureStartPoint = point;
  gestureLastPoint = point;
  if (activeTool !== "laser") pushCanvasHistory();
  if (activeTool === "eraser") eraseAt(point);
  if (activeTool === "laser") drawLaser(previewCtx, point);
  recordReplaySignal("drawing.start", { tool: activeTool });
}

function finishDrawing(point) {
  if (["arrow", "circle", "spotlight"].includes(activeTool) && gestureStartPoint) {
    startPoint = gestureStartPoint;
    commitShape(point);
    startPoint = null;
  }
  clearGestureDrawingState();
  pendingState = State.TRACKING;
  pendingFrames = 0;
  resetFilters();
  recordReplaySignal("drawing.stop", { tool: activeTool });
}

function drawActiveTool(point) {
  updateGestureCursor(point, activeTool === "laser" ? "laser" : "drawing");
  if (activeTool === "pen" && gestureLastPoint) {
    drawLine(drawCtx, gestureLastPoint, point);
  } else if (activeTool === "eraser") {
    eraseAt(point);
  } else if (["arrow", "circle", "spotlight"].includes(activeTool)) {
    startPoint = gestureStartPoint;
    previewShape(point);
    startPoint = null;
  } else if (activeTool === "laser") {
    drawLaser(drawCtx, point, true, gestureLastPoint);
  }
  gestureLastPoint = point;
}

function processLandmarkFrame({ landmarks = [], handedness = [] }, timestamp, { record = true } = {}) {
  if (record) {
    landmarkRecorder.capture({
      landmarks,
      handedness,
      classifications: landmarks.map((hand) => classifyGesture(hand))
    }, timestamp);
  }
  processHands(landmarks, timestamp, handedness);
}

function resetGesturePipelineForReplay() {
  window.clearTimeout(clapTimer);
  clapTimer = null;
  clapActive = false;
  clearHoldStartedAt = null;
  clearHoldArmed = false;
  gestureLocked = false;
  handSeenFrames = 0;
  lastHandAt = -Infinity;
  pendingState = State.IDLE;
  pendingFrames = 0;
  twoHandMode = false;
  twoHandCandidateFrames = 0;
  twoHandLostFrames = 0;
  zoomCandidateFrames = 0;
  pinchZoomStart = null;
  panStart = null;
  lastPrimaryWrist = null;
  lastSwipeAt = -Infinity;
  lastSlideSwipeAt = -Infinity;
  slideSwipeArmed = true;
  slideSwipeReleaseFrames = 0;
  slideSwipeCandidateUntil = 0;
  palmMenuBlockedUntil = 0;
  palmHoldAnchor = null;
  missingInferenceFrames = 0;
  drawingHandLostAt = null;
  returnStableFrames = 0;
  menuPinchActive = false;
  palmNavigation.reset();
  slideSwipeHistory = [];
  positionHistory = [];
  resetFilters();
  transitionTo(State.IDLE, true);
}

async function runReplayFixture(recording, speed = 0) {
  const previous = {
    tool: activeTool,
    mirror: mirrorMovement,
    slideMode,
    slideDeck,
    slideSourceType,
    slideIndex: currentSlideIndex,
    sourceStream: sourceVideo.srcObject,
    zoomScale,
    panX,
    panY
  };
  const setup = recording.metadata?.setup || {};
  const transparentSlide = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  try {
    return await replayLandmarks(recording, {
      speed,
      beforeReplay(_fixture, trace) {
        replayContext = trace;
        replayClock = 0;
        mirrorMovement = recording.environment?.mirror !== false;
        sourceVideo.srcObject = null;
        if (setup.slideMode) {
          slideDeck = [
            { name: "Replay slide 1", url: transparentSlide },
            { name: "Replay slide 2", url: transparentSlide }
          ];
          slideSourceType = "images";
          currentSlideIndex = 0;
          setSlideMode(true);
        } else {
          setSlideMode(false);
        }
        resetZoom();
        resetGesturePipelineForReplay();
        if (setup.tool && validTools.has(setup.tool)) applyToolSelection(setup.tool);
      },
      processFrame(frame) {
        replayClock = frame.t;
        processLandmarkFrame(frame, frame.t, { record: false });
      }
    });
  } finally {
    replayClock = null;
    replayContext = null;
    mirrorMovement = previous.mirror;
    slideDeck = previous.slideDeck;
    slideSourceType = previous.slideSourceType;
    currentSlideIndex = previous.slideIndex;
    sourceVideo.srcObject = previous.sourceStream;
    setSlideMode(previous.slideMode);
    zoomScale = previous.zoomScale;
    panX = previous.panX;
    panY = previous.panY;
    applySourceTransform();
    applyToolSelection(previous.tool);
    resetGesturePipelineForReplay();
  }
}

function summarizeReplayRuns(recording, reports) {
  return {
    fixtureId: recording.fixtureId,
    passed: reports.every((report) => report.passed),
    deterministic: new Set(reports.map(deterministicTrace)).size === 1,
    runs: reports.map((report, index) => ({
      run: index + 1,
      passed: report.passed,
      frameCount: report.frameCount,
      commands: report.commands,
      missingCommands: report.missingCommands,
      missingSignals: report.missingSignals,
      forbiddenViolations: report.forbiddenViolations,
      forbiddenSignalViolations: report.forbiddenSignalViolations
    })),
    signals: reports[0]?.signals || []
  };
}

async function runReplayThreeTimes(recording, speed = 0) {
  const reports = [];
  for (let index = 0; index < 3; index += 1) reports.push(await runReplayFixture(recording, speed));
  return summarizeReplayRuns(recording, reports);
}

function downloadRecording(recording) {
  const blob = new Blob([recordingToJson(recording)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${recording.fixtureId}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function initializeReplayLab() {
  const enabled = new URLSearchParams(window.location.search).get("debugReplay") === "1";
  if (!enabled || !replayLab) return;
  replayLab.hidden = false;
  const fixtureBuild = new URLSearchParams(window.location.search).get("build") || "reproducible-local-release-1";
  const { coreFixtures } = await import(`./tests/replay/core-fixtures.js?v=${encodeURIComponent(fixtureBuild)}`);
  coreFixtures.forEach((fixture, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = fixture.fixtureId;
    replayFixtureSelect.append(option);
  });

  replayRunBtn.addEventListener("click", async () => {
    const fixture = coreFixtures[Number(replayFixtureSelect.value) || 0];
    replayRunBtn.disabled = true;
    replayReport.textContent = `Running ${fixture.fixtureId} three times...`;
    try {
      const summary = await runReplayThreeTimes(fixture, Number(replaySpeedSelect.value));
      replayReport.textContent = JSON.stringify(summary, null, 2);
    } catch (error) {
      replayReport.textContent = `Replay failed: ${String(error?.message || error)}`;
    } finally {
      replayRunBtn.disabled = false;
    }
  });

  recordLandmarksBtn.addEventListener("click", () => {
    if (!handModeOn) {
      replayReport.textContent = "Start Hand Control before recording landmarks.";
      return;
    }
    const fixtureId = `live-landmarks-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    landmarkRecorder.start({
      fixtureId,
      environment: {
        mirror: mirrorMovement,
        cameraWidth: cameraVideo.videoWidth,
        cameraHeight: cameraVideo.videoHeight
      },
      metadata: { lighting: "unspecified", posture: "unspecified", hand: "unspecified", cameraDistance: "unspecified" }
    });
    recordLandmarksBtn.disabled = true;
    stopLandmarksBtn.disabled = false;
    replayReport.textContent = `Recording ${fixtureId}. No image or audio is stored.`;
  });

  stopLandmarksBtn.addEventListener("click", () => {
    const recording = landmarkRecorder.stop();
    recordLandmarksBtn.disabled = false;
    stopLandmarksBtn.disabled = true;
    if (!recording) return;
    downloadRecording(recording);
    replayReport.textContent = `Exported ${recording.frames.length} landmark frames. No image or audio was included.`;
  });

  window.jarvisReplay = Object.freeze({ coreFixtures, runFixture: runReplayFixture, runThreeTimes: runReplayThreeTimes });
}

function runGestureLoop() {
  if (!handModeOn || !handLandmarker || cameraVideo.readyState < 2) {
    if (handModeOn) gestureAnimationId = window.requestAnimationFrame(runGestureLoop);
    return;
  }

  if (cameraVideo.currentTime !== lastVideoTime) {
    lastVideoTime = cameraVideo.currentTime;
    try {
      const timestamp = performance.now();
      const results = handLandmarker.detectForVideo(cameraVideo, timestamp);
      processLandmarkFrame(results, timestamp);
    } catch (error) {
      console.warn("Hand tracking frame failed", error);
      setStatus("Hand tracking recovering");
    }
  }

  gestureAnimationId = window.requestAnimationFrame(runGestureLoop);
}

async function startHandControl() {
  if (handStarting || handModeOn) return;
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus("Camera unavailable");
    showActionNotice("Camera access is unavailable. Open Jarvis Presenter in Google Chrome.", true);
    return;
  }

  handStarting = true;
  handBtn.disabled = true;
  handBtn.textContent = "Allow Camera...";
  handReadout.textContent = "Starting";
  setStatus("Waiting for camera permission");
  showActionNotice("Allow camera access when Chrome asks.");

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      audio: false
    });
    cameraVideo.srcObject = cameraStream;
    await cameraVideo.play();
    handBtn.textContent = "Loading Hand Model...";
    handReadout.textContent = "Loading";
    setStatus("Loading hand model");
    showActionNotice("Camera connected. Loading hand tracking...");
    await loadHandLandmarker();
    handModeOn = true;
    handSeenFrames = 0;
    twoHandMode = false;
    twoHandCandidateFrames = 0;
    twoHandLostFrames = 0;
    zoomCandidateFrames = 0;
    lastPrimaryWrist = null;
    slideSwipeArmed = true;
    slideSwipeReleaseFrames = 0;
    slideSwipeCandidateUntil = 0;
    slideSwipeHistory = [];
    palmNavigation.reset();
    missingInferenceFrames = 0;
    drawingHandLostAt = null;
    returnStableFrames = 0;
    resetFilters();
    transitionTo(State.TRACKING, true);
    handBtn.textContent = "Stop Hand Control";
    handBtn.classList.add("listening");
    cameraVideo.classList.add("active");
    applyCameraVisibility();
    handReadout.textContent = "Searching";
    setStatus("Hand control online");
    showActionNotice("Hand control is ready. Hold your hand inside the camera view.");
    runGestureLoop();
  } catch (error) {
    handModeOn = false;
    cameraStream?.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    cameraVideo.srcObject = null;
    handReadout.textContent = "Off";
    const startupMessage = describeStartupError(error);
    setStatus(startupMessage);
    showActionNotice(
      startupMessage === "Camera permission blocked"
        ? "Camera access is blocked. In Chrome, click the camera icon beside the address bar, allow access, then try again."
        : startupMessage,
      true
    );
    heardText.textContent = String(error?.message || error?.name || error || "unknown startup error");
    console.warn("Hand control startup failed", error);
  } finally {
    handStarting = false;
    handBtn.disabled = false;
    if (!handModeOn) handBtn.textContent = "Start Hand Control";
  }
}

function stopHandControl() {
  handStarting = false;
  handModeOn = false;
  window.cancelAnimationFrame(gestureAnimationId);
  window.clearTimeout(clapTimer);
  clapTimer = null;
  clapActive = false;
  lastClapAt = 0;
  twoHandMode = false;
  twoHandCandidateFrames = 0;
  twoHandLostFrames = 0;
  zoomCandidateFrames = 0;
  lastPrimaryWrist = null;
  slideSwipeArmed = true;
  slideSwipeReleaseFrames = 0;
  slideSwipeCandidateUntil = 0;
  slideSwipeHistory = [];
  palmNavigation.reset();
  missingInferenceFrames = 0;
  drawingHandLostAt = null;
  returnStableFrames = 0;
  clearGestureDrawingState();
  hideGestureCursor();
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  cameraVideo.srcObject = null;
  cameraVideo.classList.remove("active");
  handBtn.textContent = "Start Hand Control";
  handBtn.classList.remove("listening");
  handReadout.textContent = "Off";
  setGestureLocked(false);
  transitionTo(State.IDLE, true);
  setStatus("Hand control offline");
  showActionNotice("Hand control stopped.");
}

function eraseAt(point) {
  drawCtx.save();
  drawCtx.globalCompositeOperation = "destination-out";
  drawCtx.beginPath();
  drawCtx.arc(point.x, point.y, Number(sizeInput.value) * 2.8, 0, Math.PI * 2);
  drawCtx.fill();
  drawCtx.restore();
}

function previewShape(to) {
  clearPreview();
  if (!startPoint) return;
  if (activeTool === "arrow") drawArrow(previewCtx, startPoint, to);
  if (activeTool === "circle") drawCircle(previewCtx, startPoint, to);
  if (activeTool === "spotlight") drawSpotlight(previewCtx, startPoint, to);
}

function commitShape(to) {
  clearPreview();
  if (!startPoint) return;
  if (activeTool === "arrow") drawArrow(drawCtx, startPoint, to);
  if (activeTool === "circle") drawCircle(drawCtx, startPoint, to);
  if (activeTool === "spotlight") drawSpotlight(drawCtx, startPoint, to);
}

function applyToolSelection(tool) {
  const toolChanged = activeTool !== tool;
  activeTool = tool;
  toolButtons.forEach((button) => button.classList.toggle("active", button.dataset.tool === tool));
  toolReadout.textContent = tool.charAt(0).toUpperCase() + tool.slice(1);
  if (radialCoreLabel) radialCoreLabel.textContent = toolReadout.textContent;
  if (tool !== "laser") laserPositions = [];
  clearPreview();
  if (toolChanged) {
    clearGestureDrawingState();
    pendingState = State.TRACKING;
    pendingFrames = 0;
    resetFilters();
  }
  updateGestureIndicator();
  setStatus(`${toolReadout.textContent} online`);
  appState.update({ activeTool });
}

function applyColorSelection(color) {
  activeColor = color;
  swatches.forEach((button) => button.classList.toggle("active", button.dataset.color === color));
  gestureCursor.style.setProperty("--cursor-color", activeColor);
  gestureIndicator.style.setProperty("--active-color", activeColor);
  setStatus("Color updated");
  appState.update({ activeColor });
}

function dispatchPresentationCommand(type, payload = {}, source = "ui") {
  const result = commandBus.dispatch({ type, source, payload, risk: "normal" });
  if (result.status !== "accepted") {
    console.warn("Command rejected", result.event);
    setStatus(result.event?.reason || "Command rejected");
  }
  return result;
}

function selectTool(tool, source = "ui") {
  return dispatchPresentationCommand("tool.select", { tool }, source);
}

function selectColor(color, source = "ui") {
  return dispatchPresentationCommand("color.select", { color }, source);
}

function undoDrawing(source = "ui") {
  return dispatchPresentationCommand("overlay.undo", {}, source);
}

function redoDrawing(source = "ui") {
  return dispatchPresentationCommand("overlay.redo", {}, source);
}

function nextSlide(source = "ui") {
  return dispatchPresentationCommand("presentation.next", {}, source);
}

function previousSlide(source = "ui") {
  return dispatchPresentationCommand("presentation.previous", {}, source);
}

function createCommittedTemplateScene(templateId) {
  return updateDiagramScene(createDiagramScene(templateId), { type: "commit" });
}

function renderCurrentDiagram() {
  renderDiagram(diagramOverlay, committedDiagram);
  diagramOverlay.classList.toggle("management", isDiagramManagementActive() && !!committedDiagram && committedDiagram.status === "committed");
}

function activeDiagramBounds() {
  if (!committedDiagram || committedDiagram.status !== "committed" || !committedDiagram.nodes?.length) return null;
  const rect = drawCanvas.getBoundingClientRect();
  const transform = committedDiagram.transform || { x: 0, y: 0, scale: 1 };
  const minX = Math.min(...committedDiagram.nodes.map((node) => node.x));
  const minY = Math.min(...committedDiagram.nodes.map((node) => node.y));
  const maxX = Math.max(...committedDiagram.nodes.map((node) => node.x + node.width));
  const maxY = Math.max(...committedDiagram.nodes.map((node) => node.y + node.height));
  const scale = transform.scale || 1;
  return {
    left: (transform.x + minX * scale) * rect.width,
    top: (transform.y + minY * scale) * rect.height,
    right: (transform.x + maxX * scale) * rect.width,
    bottom: (transform.y + maxY * scale) * rect.height
  };
}

function pointInsideActiveDiagram(point, padding = 18) {
  const bounds = activeDiagramBounds();
  return !!bounds
    && point.x >= bounds.left - padding
    && point.x <= bounds.right + padding
    && point.y >= bounds.top - padding
    && point.y <= bounds.bottom + padding;
}

function isDiagramManagementActive() {
  return diagramDrag || isDiagramShelfOpen();
}

function isDiagramShelfOpen() {
  return !!diagramShelfOverlay && !diagramShelfOverlay.hidden && diagramShelfOverlay.classList.contains("open");
}

function setDiagramManagementClasses() {
  const active = isDiagramManagementActive();
  stage.classList.toggle("diagram-management", active);
  stage.classList.toggle("diagram-dragging", !!diagramDrag);
  diagramOverlay.classList.toggle("management", active && !!committedDiagram && committedDiagram.status === "committed");
}

function setDiagramDockVisible(visible, active = false) {
  if (!diagramDockZone) return;
  diagramDockZone.hidden = !visible;
  diagramDockZone.classList.toggle("open", visible);
  diagramDockZone.classList.toggle("active", visible && active);
}

function isPointInDiagramDock(point) {
  const rect = drawCanvas.getBoundingClientRect();
  return point.x >= rect.width - Math.min(132, rect.width * 0.18);
}

function viewportPointFromStagePoint(point) {
  const rect = drawCanvas.getBoundingClientRect();
  return { x: rect.left + point.x, y: rect.top + point.y };
}

function findDiagramShelfTargetAt(point) {
  if (!diagramShelfOverlay || diagramShelfOverlay.hidden || !diagramShelfOverlay.classList.contains("open")) return null;
  const viewportPoint = viewportPointFromStagePoint(point);
  const element = document.elementFromPoint(viewportPoint.x, viewportPoint.y);
  const target = element?.closest?.("[data-diagram-control], .diagram-template-card, .diagram-shelf-card") || null;
  return target?.closest?.("#diagramShelfOverlay") ? target : null;
}

function setDiagramShelfHoveredTarget(target) {
  if (diagramShelfHoveredCard === target) return;
  diagramShelfHoveredCard?.classList.remove("gesture-hot");
  diagramShelfHoveredCard = target;
  diagramShelfHoveredCard?.classList.add("gesture-hot");
}

function clearDiagramShelfGestureTarget() {
  setDiagramShelfHoveredTarget(null);
  diagramShelfArmedTarget = null;
  diagramShelfArmedAt = 0;
}

function armDiagramShelfTarget(target) {
  if (!target || target.disabled) return;
  diagramShelfArmedTarget = target;
  diagramShelfArmedAt = gestureNow();
}

function latchedDiagramShelfTarget(currentTarget) {
  if (currentTarget && !currentTarget.disabled) return currentTarget;
  if (
    diagramShelfArmedTarget
    && diagramShelfArmedTarget.isConnected
    && !diagramShelfArmedTarget.disabled
    && gestureNow() - diagramShelfArmedAt < 1200
  ) {
    return diagramShelfArmedTarget;
  }
  return null;
}

function executeDiagramShelfTarget(target, source = "gesture") {
  if (!target || target.disabled) return false;
  if (target.dataset.diagramControl === "close-shelf") {
    dispatchPresentationCommand("diagram.gallery.close", {}, source);
    return true;
  }
  if (target.dataset.diagramControl === "park-active") {
    dispatchPresentationCommand("diagram.active.park", {}, source);
    return true;
  }
  if (target.dataset.diagramControl === "hide-active") {
    dispatchPresentationCommand("diagram.hide", {}, source);
    return true;
  }
  if (target.dataset.diagramAction === "present-template") {
    dispatchPresentationCommand("diagram.template.present", { templateId: target.dataset.diagramId }, source);
    return true;
  }
  if (target.dataset.diagramAction === "restore-parked") {
    dispatchPresentationCommand("diagram.shelf.restore", { instanceId: target.dataset.diagramId }, source);
    return true;
  }
  return false;
}

function handleDiagramShelfGestureSelection(point, gesture) {
  if (!isDiagramShelfOpen()) {
    clearDiagramShelfGestureTarget();
    diagramShelfPinchActive = false;
    return false;
  }

  if (gesture !== Gesture.PINCH) diagramShelfPinchActive = false;
  if (![Gesture.INDEX_ONLY, Gesture.PEACE, Gesture.OTHER, Gesture.PINCH].includes(gesture)) {
    setDiagramShelfHoveredTarget(null);
    return false;
  }

  const target = findDiagramShelfTargetAt(point);
  setDiagramShelfHoveredTarget(target);
  if (target && gesture !== Gesture.PINCH) armDiagramShelfTarget(target);
  if (!target && gesture !== Gesture.PINCH) return false;

  updateGestureCursor(point, "pointing");
  if (gesture !== Gesture.PINCH) return true;
  if (diagramShelfPinchActive) return true;

  const selectedTarget = latchedDiagramShelfTarget(target);
  if (!selectedTarget) return false;

  diagramShelfPinchActive = true;
  executeDiagramShelfTarget(selectedTarget, "gesture");
  clearDiagramShelfGestureTarget();
  return true;
}

function renderDiagramCardSvg(svg, scene) {
  renderDiagram(svg, { ...structuredClone(scene), transform: { x: 0, y: 0, scale: 1 } });
  svg.removeAttribute("hidden");
  svg.setAttribute("aria-hidden", "true");
}

function createDiagramCard({ title, meta, scene, buttonLabel, actionType, actionId, onClick }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = buttonLabel === "Restore" ? "diagram-shelf-card" : "diagram-template-card";
  button.setAttribute("aria-label", `${buttonLabel} ${title}`);
  if (actionType) button.dataset.diagramAction = actionType;
  if (actionId) button.dataset.diagramId = actionId;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  renderDiagramCardSvg(svg, scene);
  const name = document.createElement("span");
  name.className = "diagram-card-name";
  name.textContent = title;
  const detail = document.createElement("span");
  detail.className = "diagram-card-meta";
  detail.textContent = meta;
  button.append(svg, name, detail);
  button.addEventListener("click", onClick);
  return button;
}

function renderDiagramShelf() {
  const state = diagramSession.snapshot();
  clearDiagramShelfGestureTarget();
  if (diagramShelfActiveName) diagramShelfActiveName.textContent = state.active ? state.active.name : "No active diagram";
  if (diagramShelfParkBtn) diagramShelfParkBtn.disabled = !state.active;
  if (diagramShelfHideBtn) diagramShelfHideBtn.disabled = !committedDiagram || committedDiagram.status === "hidden";

  if (diagramTemplateGrid) {
    diagramTemplateGrid.replaceChildren(...diagramTemplates.map((template) => createDiagramCard({
      title: template.name,
      meta: template.category || template.thumbnailLabel,
      scene: createCommittedTemplateScene(template.id),
      buttonLabel: "Present",
      actionType: "present-template",
      actionId: template.id,
      onClick: () => dispatchPresentationCommand("diagram.template.present", { templateId: template.id }, "ui")
    })));
  }

  if (diagramParkedList) {
    if (!state.shelf.length) {
      const empty = document.createElement("div");
      empty.className = "diagram-empty-state";
      empty.textContent = "No parked diagrams";
      diagramParkedList.replaceChildren(empty);
    } else {
      diagramParkedList.replaceChildren(...state.shelf.map((item) => createDiagramCard({
        title: item.name,
        meta: "Parked",
        scene: item.scene,
        buttonLabel: "Restore",
        actionType: "restore-parked",
        actionId: item.instanceId,
        onClick: () => dispatchPresentationCommand("diagram.shelf.restore", { instanceId: item.instanceId }, "ui")
      })));
    }
  }
}

function openDiagramShelf({ quiet = false } = {}) {
  diagramSession.setOverlayMode("gallery");
  renderDiagramShelf();
  diagramShelfOverlay.hidden = false;
  requestAnimationFrame(() => {
    diagramShelfOverlay.classList.add("open");
    setDiagramManagementClasses();
  });
  if (!quiet) setStatus("Diagram shelf open");
}

function closeDiagramShelf({ quiet = false } = {}) {
  diagramSession.setOverlayMode("hidden");
  clearDiagramShelfGestureTarget();
  diagramShelfPinchActive = false;
  diagramShelfOverlay.classList.remove("open");
  diagramShelfOverlay.hidden = true;
  setDiagramManagementClasses();
  if (!quiet) setStatus("Diagram shelf closed");
}

function setActiveDiagramFromSession(state, statusMessage) {
  committedDiagram = state.active ? structuredClone(state.active.scene) : null;
  draftDiagram = committedDiagram ? structuredClone(committedDiagram) : null;
  renderCurrentDiagram();
  renderDiagramShelf();
  if (statusMessage) setStatus(statusMessage);
}

function syncDiagramSessionFromCommitted() {
  if (committedDiagram) diagramSession.presentScene(committedDiagram);
  else diagramSession.clearActive();
  draftDiagram = committedDiagram ? structuredClone(committedDiagram) : null;
  renderDiagramShelf();
}

function moveActiveDiagramBy({ dx = 0, dy = 0 } = {}) {
  const state = diagramSession.moveActiveBy({ dx, dy });
  committedDiagram = structuredClone(state.active.scene);
  draftDiagram = structuredClone(committedDiagram);
  renderCurrentDiagram();
  return state;
}

function beginDiagramDrag(point, source) {
  if (!isDiagramManagementActive()) return false;
  if (!pointInsideActiveDiagram(point)) return false;
  pushDiagramHistory();
  diagramDrag = {
    source,
    lastPoint: { ...point },
    dockActive: isPointInDiagramDock(point)
  };
  setDiagramManagementClasses();
  setDiagramDockVisible(true, diagramDrag.dockActive);
  setStatus(source === "gesture" ? "Diagram grabbed" : "Drag diagram");
  clearPreview();
  return true;
}

function updateDiagramDrag(point, source) {
  if (!diagramDrag || diagramDrag.source !== source) return false;
  const dxPx = point.x - diagramDrag.lastPoint.x;
  const dyPx = point.y - diagramDrag.lastPoint.y;
  const rect = drawCanvas.getBoundingClientRect();
  if (Math.abs(dxPx) > 0.1 || Math.abs(dyPx) > 0.1) {
    dispatchPresentationCommand("diagram.active.move", { dx: dxPx / Math.max(1, rect.width), dy: dyPx / Math.max(1, rect.height) }, source);
  }
  diagramDrag.lastPoint = { ...point };
  diagramDrag.dockActive = isPointInDiagramDock(point);
  setDiagramDockVisible(true, diagramDrag.dockActive);
  return true;
}

function finishDiagramDrag(point, source) {
  if (!diagramDrag || diagramDrag.source !== source) return false;
  const shouldPark = isPointInDiagramDock(point);
  diagramDrag = null;
  setDiagramDockVisible(false);
  if (shouldPark) {
    parkActiveDiagram({ pushHistory: false });
  } else {
    setDiagramManagementClasses();
    setStatus("Diagram dropped");
  }
  return true;
}

function cancelGestureDiagramDrag() {
  if (!diagramDrag || diagramDrag.source !== "gesture") return;
  diagramDrag = null;
  setDiagramDockVisible(false);
  setDiagramManagementClasses();
  setStatus("Diagram grab cancelled");
}

function handleDiagramPinchInteraction(point, gesture) {
  if (handleDiagramShelfGestureSelection(point, gesture)) return true;
  if (diagramShelfPinchActive) {
    if (gesture !== Gesture.PINCH) diagramShelfPinchActive = false;
    else {
      updateGestureCursor(point, "pointing");
      return true;
    }
  }
  if (diagramDrag?.source === "gesture") {
    if (gesture === Gesture.PINCH) {
      updateDiagramDrag(point, "gesture");
    } else {
      finishDiagramDrag(point, "gesture");
    }
    updateGestureCursor(point, "pointing");
    return true;
  }
  if (
    gesture === Gesture.PINCH
    && gestureState !== State.MENU
    && gestureState !== State.DRAWING
    && beginDiagramDrag(point, "gesture")
  ) {
    updateGestureCursor(point, "pointing");
    return true;
  }
  return false;
}

function presentTemplateFromShelf(templateId) {
  pushDiagramHistory();
  const state = diagramSession.presentTemplate(templateId);
  setActiveDiagramFromSession(state, "Diagram presented");
  closeDiagramShelf({ quiet: true });
}

function parkActiveDiagram({ pushHistory = true } = {}) {
  if (pushHistory) pushDiagramHistory();
  const state = diagramSession.parkActive();
  setActiveDiagramFromSession(state, "Diagram parked");
  openDiagramShelf({ quiet: true });
}

function restoreParkedDiagram(instanceId) {
  pushDiagramHistory();
  const state = diagramSession.restoreParked(instanceId);
  setActiveDiagramFromSession(state, "Diagram restored");
  closeDiagramShelf({ quiet: true });
}

function removeParkedDiagram(instanceId) {
  const state = diagramSession.removeParked(instanceId);
  renderDiagramShelf();
  setStatus(state.shelf.length ? "Parked diagram removed" : "Shelf empty");
}

function pushDiagramHistory() {
  diagramHistory.push(committedDiagram ? structuredClone(committedDiagram) : null);
  diagramHistory = diagramHistory.slice(-20);
  diagramRedoHistory = [];
}

function prepareDiagram(templateId) {
  draftDiagram = createDiagramScene(templateId);
  diagramDraftPreview.textContent = `${draftDiagram.name} ready — ${draftDiagram.nodes.map((node) => node.label).join(" → ")}`;
  setStatus("Diagram ready");
}

function prepareAndPresentDiagram(templateId) {
  prepareDiagram(templateId);
  presentDiagram();
}

function presentDiagram() {
  if (!draftDiagram) throw new Error("Prepare a diagram first");
  pushDiagramHistory();
  const scene = updateDiagramScene(draftDiagram, { type: "commit" });
  const state = diagramSession.presentScene(scene);
  setActiveDiagramFromSession(state, "Diagram presented");
}

function hideDiagram() {
  if (!committedDiagram) throw new Error("No diagram is visible");
  pushDiagramHistory();
  committedDiagram = updateDiagramScene(committedDiagram, { type: "hide" });
  try {
    diagramSession.updateActiveScene(committedDiagram);
  } catch (error) {
    console.warn("Diagram session was not active while hiding", error);
  }
  renderCurrentDiagram();
  renderDiagramShelf();
  setStatus("Diagram hidden");
}

function highlightDiagram(label) {
  if (!committedDiagram) throw new Error("Present a diagram first");
  committedDiagram = updateDiagramScene(committedDiagram, { type: "highlight", label });
  try {
    diagramSession.updateActiveScene(committedDiagram);
  } catch (error) {
    console.warn("Diagram session was not active while highlighting", error);
  }
  draftDiagram = structuredClone(committedDiagram);
  renderCurrentDiagram();
  renderDiagramShelf();
  setStatus(label ? `Highlighting ${label}` : "Complete diagram");
}

const validTools = new Set(["pen", "arrow", "circle", "spotlight", "laser", "eraser"]);
const validColors = new Set(swatches.map((button) => button.dataset.color));

commandBus.register("tool.select", ({ payload }) => {
  if (!validTools.has(payload.tool)) throw new Error("Unknown drawing tool");
  applyToolSelection(payload.tool);
});
commandBus.register("color.select", ({ payload }) => {
  if (!validColors.has(payload.color)) throw new Error("Unknown drawing color");
  applyColorSelection(payload.color);
});
commandBus.register("overlay.undo", applyUndoDrawing);
commandBus.register("overlay.redo", applyRedoDrawing);
commandBus.register("presentation.next", applyNextSlide);
commandBus.register("presentation.previous", applyPreviousSlide);
commandBus.register("zoom.in", zoomIn);
commandBus.register("zoom.out", zoomOut);
commandBus.register("zoom.reset", resetZoom);
commandBus.register("control.lock", () => setGestureLocked(true));
commandBus.register("control.unlock", () => setGestureLocked(false));
commandBus.register("diagram.prepare", ({ payload }) => prepareDiagram(payload.templateId));
commandBus.register("diagram.prepare-present", ({ payload }) => prepareAndPresentDiagram(payload.templateId));
commandBus.register("diagram.present", presentDiagram);
commandBus.register("diagram.hide", hideDiagram);
commandBus.register("diagram.highlight", ({ payload }) => highlightDiagram(payload.label ?? null));
commandBus.register("diagram.gallery.open", openDiagramShelf);
commandBus.register("diagram.gallery.close", closeDiagramShelf);
commandBus.register("diagram.template.present", ({ payload }) => presentTemplateFromShelf(payload.templateId));
commandBus.register("diagram.active.move", ({ payload }) => moveActiveDiagramBy(payload));
commandBus.register("diagram.active.park", parkActiveDiagram);
commandBus.register("diagram.shelf.restore", ({ payload }) => restoreParkedDiagram(payload.instanceId));
commandBus.register("diagram.shelf.remove", ({ payload }) => removeParkedDiagram(payload.instanceId));

const commandAuditEnabled = new URLSearchParams(window.location.search).get("debugCommands") === "1";
if (commandAudit && commandAuditEnabled) commandAudit.hidden = false;
commandBus.subscribe((event) => {
  if (replayContext && event.commandSource === "gesture") {
    replayContext.commands.push({ type: event.commandType, status: event.status, t: gestureNow() });
  }
  if (!commandAudit || !commandAuditEnabled) return;
  const item = document.createElement("li");
  item.textContent = `${event.order}. ${event.commandType || "invalid"} — ${event.status}`;
  commandAudit.querySelector("ol")?.prepend(item);
  const entries = commandAudit.querySelectorAll("li");
  for (let index = 8; index < entries.length; index += 1) entries[index].remove();
});

async function startCapture() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    setStatus("Screen capture unavailable");
    showActionNotice("Screen sharing is unavailable here. Open Jarvis Presenter in Google Chrome.", true);
    return;
  }

  captureBtn.disabled = true;
  captureBtn.textContent = "Choose Window...";
  setStatus("Choose a screen or window");
  showActionNotice("Chrome is opening the screen-sharing picker. Choose a screen, window, or tab.");

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: "window" },
      audio: false
    });
    setSlideMode(false);
    sourceVideo.srcObject = stream;
    emptyState.classList.add("hidden");
    setStatus("Source connected");
    showActionNotice("Source connected. Share this Jarvis window in Teams or Google Meet.");
    stream.getVideoTracks()[0]?.addEventListener("ended", () => {
      emptyState.classList.remove("hidden");
      sourceVideo.srcObject = null;
      setStatus("Source disconnected");
      showActionNotice("Screen sharing stopped.");
    });
  } catch (error) {
    setStatus("Source selection cancelled");
    showActionNotice("No source was selected. Click Share Source and choose a screen, window, or tab.", true);
  } finally {
    captureBtn.disabled = false;
    captureBtn.textContent = "Share Source";
  }
}

function handlePointerDown(event) {
  const point = canvasPoint(event);
  if (beginDiagramDrag(point, "ui")) {
    previewCanvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    return;
  }
  pointerDown = true;
  startPoint = point;
  lastPoint = startPoint;
  previewCanvas.setPointerCapture?.(event.pointerId);
  if (activeTool !== "laser") pushCanvasHistory();
  if (activeTool === "eraser") eraseAt(startPoint);
  if (activeTool === "laser") drawLaser(previewCtx, startPoint);
}

function handlePointerMove(event) {
  const point = canvasPoint(event);
  if (updateDiagramDrag(point, "ui")) {
    event.preventDefault();
    return;
  }
  if (!pointerDown) return;

  if (activeTool === "pen" && lastPoint) {
    drawLine(drawCtx, lastPoint, point);
  } else if (activeTool === "eraser") {
    eraseAt(point);
  } else if (activeTool === "laser") {
    drawLaser(previewCtx, point);
  } else {
    previewShape(point);
  }

  lastPoint = point;
}

function handlePointerUp(event) {
  const point = canvasPoint(event);
  if (finishDiagramDrag(point, "ui")) {
    event.preventDefault();
    return;
  }
  if (!pointerDown) return;
  if (["arrow", "circle", "spotlight"].includes(activeTool)) commitShape(point);
  if (activeTool === "laser") clearPreview();
  pointerDown = false;
  startPoint = null;
  lastPoint = null;
}

function applyVoiceCommand(rawText, source = "voice", { quietIgnored = false } = {}) {
  heardText.textContent = rawText;
  const liveVoice = source === "voice" || source === "whisper";
  const label = source === "whisper" ? "Whisper" : source === "voice" ? "Chrome" : "Typed";
  const splitCommands = splitLiveCommands(rawText);
  const commandTexts = splitCommands.length ? splitCommands : [rawText];
  if (liveVoice && !commandTexts.length) {
    if (quietIgnored) return { status: "ignored", reason: "missing-prefix" };
    voiceDiagnosticTranscript.textContent = `${label} heard: "${rawText}"`;
    voiceDiagnosticError.textContent = "Say Jarvis before a voice command.";
    setStatus("Say Jarvis before a voice command");
    return { status: "ignored", reason: "missing-prefix" };
  }
  const results = [];
  for (const commandText of commandTexts) {
    const parsed = parseCommand(commandText, { live: liveVoice });
    if (parsed.status === "ignored") {
      if (quietIgnored) return parsed;
      voiceDiagnosticError.textContent = "Say Jarvis before a voice command.";
      setStatus("Say Jarvis before a voice command");
      return parsed;
    }
    if (parsed.status !== "matched") {
      const normalized = parsed.normalized ? ` "${parsed.normalized}"` : "";
      voiceDiagnosticTranscript.textContent = `${label} heard: "${rawText}"`;
      voiceDiagnosticError.textContent = `Command not recognized${normalized}.`;
      setStatus("Command not recognized");
      return parsed;
    }
    const result = dispatchPresentationCommand(parsed.command.type, parsed.command.payload, source);
    results.push({ parsed, result });
  }
  const blocked = results.find((entry) => entry.result.status !== "accepted");
  const understood = results.map((entry) => entry.parsed.normalized).join(" | ");
  if (!liveVoice) {
    voiceDiagnosticTranscript.textContent = `Typed command understood: "${understood}"`;
    if (blocked) {
      const reason = blocked.result.event?.reason || "Command was not executed.";
      voiceDiagnosticError.textContent = reason;
      setStatus(reason);
      return blocked.result;
    }
    voiceDiagnosticError.textContent = "";
    return results.at(-1)?.result || { status: "ignored" };
  }
  voiceDiagnosticTranscript.textContent = `${label} heard: "${rawText}" · Jarvis understood: "${understood}"`;
  if (blocked) {
    const reason = blocked.result.event?.reason || "Command was not executed.";
    voiceDiagnosticError.textContent = reason;
    voiceDiagnosticTranscript.textContent += " · blocked";
    return blocked.result;
  }
  voiceDiagnosticError.textContent = "";
  voiceDiagnosticTranscript.textContent += results.length > 1 ? ` · executed ${results.length} commands` : " · executed";
  return results.at(-1)?.result || { status: "ignored" };
}

const speechAdapter = createSpeechAdapter(window);
const voiceController = createVoiceController({
  adapter: speechAdapter,
  onInterim(text) {
    heardText.textContent = text;
    voiceDiagnosticTranscript.textContent = `Hearing: ${text}`;
    voiceReadout.textContent = "Hearing";
  },
  onFinal(text) {
    voiceDiagnosticTranscript.textContent = `Chrome heard: “${text}”`;
    if (voiceMode === "preflight") {
      if (text.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim() === "jarvis test microphone") {
        voicePreflightPassed = true;
        voiceCommandsBtn.disabled = false;
        voiceDiagnostic.classList.add("ready");
        voiceDiagnosticState.textContent = "Microphone test passed";
        voiceDiagnosticError.textContent = "";
        setStatus("Microphone test passed — voice commands can now be started");
        voiceMode = "off";
        voiceController.stop();
      } else {
        voiceDiagnosticState.textContent = "Microphone heard a different phrase";
        voiceDiagnosticError.textContent = "Please say exactly: Jarvis test microphone";
      }
      return;
    }
    if (voiceMode === "commands") applyVoiceCommand(text, "voice");
  },
  onState(state, error) {
    voiceOn = state === "LISTENING" || state === "STARTING" || state === "RESTARTING";
    voiceBtn.classList.toggle("listening", voiceOn && voiceMode === "preflight");
    voiceCommandsBtn.classList.toggle("listening", voiceOn && voiceMode === "commands");
    voiceBtn.textContent = voiceOn && voiceMode === "preflight" ? "Stop Microphone Test" : "Test Microphone";
    voiceCommandsBtn.textContent = voiceOn && voiceMode === "commands" ? "Stop Chrome Commands" : "Start Chrome Commands";
    voiceReadout.textContent = state === "ERROR" ? "Fallback" : state === "LISTENING" ? "On" : state === "RESTARTING" ? "Reconnecting" : state.charAt(0) + state.slice(1).toLowerCase();
    if (state === "ERROR") {
      voiceDiagnosticState.textContent = "Microphone test failed";
      voiceDiagnosticError.textContent = `Chrome recognition error: ${error}. Typed commands remain available.`;
      setStatus(`Voice unavailable (${error}). Gestures and typed commands remain ready.`);
    }
    if (state === "LISTENING") {
      voiceDiagnosticState.textContent = voiceMode === "preflight" ? "Listening for test phrase" : "Voice commands listening";
      voiceDiagnosticError.textContent = "";
      setStatus(voiceMode === "preflight" ? "Say: Jarvis test microphone" : "Voice online — say Jarvis before each command");
    }
    if (state === "RESTARTING") {
      voiceDiagnosticState.textContent = "Chrome voice reconnecting";
      voiceDiagnosticError.textContent = "Keep presenting — Jarvis is restoring microphone recognition automatically.";
      setStatus("Voice reconnecting. Gestures remain available.");
    }
  }
});

function startVoicePreflight() {
  voiceMode = "preflight";
  voiceShouldRun = true;
  voiceDiagnostic.classList.remove("ready");
  voiceDiagnosticState.textContent = "Starting microphone test";
  voiceDiagnosticTranscript.textContent = "Say: “Jarvis test microphone”";
  if (!voiceController.start()) setStatus("Voice unsupported. Typed commands remain ready.");
}

function startVoiceCommands() {
  voiceMode = "commands";
  voiceShouldRun = true;
  voiceDiagnosticState.textContent = "Starting voice commands";
  if (!voiceController.start()) setStatus("Voice unsupported. Typed commands remain ready.");
}

function stopVoice() {
  voiceShouldRun = false;
  voiceMode = "off";
  voiceController.stop();
  voiceDiagnosticState.textContent = voicePreflightPassed ? "Microphone test passed" : "Microphone stopped";
}

function setWhisperRecordingUi(recording) {
  whisperRecording = recording;
  whisperCommandBtn.classList.toggle("listening", recording);
  whisperCommandBtn.textContent = recording ? "Stop Whisper Recording" : "Record Whisper Command";
  voiceReadout.textContent = recording ? "Whisper" : voiceOn ? "On" : "Off";
}

async function transcribeWhisperBlob(blob, { quiet = false } = {}) {
  if (!quiet) {
    voiceDiagnosticState.textContent = "Whisper transcribing";
    voiceDiagnosticTranscript.textContent = "Sending audio to local whisper.cpp...";
    voiceDiagnosticError.textContent = "";
  }
  const response = await fetch("/__jarvis__/whisper/transcribe", {
    method: "POST",
    headers: { "Content-Type": blob.type || "audio/webm" },
    body: blob
  });
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.reason || "Whisper transcription failed");
  const transcript = String(payload.transcript || "").trim();
  if (!transcript) throw new Error("Whisper returned an empty transcript");
  if (!quiet) {
    voiceDiagnosticState.textContent = "Whisper transcript ready";
    voiceDiagnosticTranscript.textContent = `Whisper heard: "${transcript}"`;
    voiceDiagnosticError.textContent = "";
  }
  return applyVoiceCommand(transcript, "whisper", { quietIgnored: quiet });
}

function stopWhisperRecording() {
  if (!whisperRecorder || whisperRecorder.state === "inactive") return;
  whisperRecorder.stop();
}

async function startWhisperRecording() {
  if (whisperContinuousOn) stopWhisperContinuous();
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    voiceDiagnosticState.textContent = "Whisper unavailable";
    voiceDiagnosticError.textContent = "This browser cannot record microphone audio for Whisper.";
    setStatus("Whisper microphone recording unavailable.");
    return;
  }
  if (voiceOn) stopVoice();
  whisperChunks = [];
  try {
    whisperStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    whisperRecorder = new MediaRecorder(whisperStream);
    whisperRecorder.ondataavailable = (event) => {
      if (event.data?.size) whisperChunks.push(event.data);
    };
    whisperRecorder.onerror = (event) => {
      voiceDiagnosticState.textContent = "Whisper recording error";
      voiceDiagnosticError.textContent = String(event.error?.message || event.error || "Recording failed");
      setWhisperRecordingUi(false);
    };
    whisperRecorder.onstop = async () => {
      const chunks = whisperChunks;
      whisperChunks = [];
      whisperStream?.getTracks().forEach((track) => track.stop());
      whisperStream = null;
      setWhisperRecordingUi(false);
      const blob = new Blob(chunks, { type: whisperRecorder?.mimeType || "audio/webm" });
      whisperRecorder = null;
      if (!blob.size) {
        voiceDiagnosticState.textContent = "Whisper heard no audio";
        voiceDiagnosticError.textContent = "Try recording a little longer.";
        return;
      }
      try {
        await transcribeWhisperBlob(blob);
      } catch (error) {
        voiceDiagnosticState.textContent = "Whisper not ready";
        voiceDiagnosticError.textContent = String(error?.message || error);
        setStatus("Whisper local engine is not configured yet.");
      }
    };
    whisperRecorder.start();
    setWhisperRecordingUi(true);
    voiceDiagnosticState.textContent = "Whisper recording";
    voiceDiagnosticTranscript.textContent = "Speak one Jarvis command, then click Stop Whisper Recording.";
    voiceDiagnosticError.textContent = "";
    setStatus("Whisper recording...");
  } catch (error) {
    setWhisperRecordingUi(false);
    voiceDiagnosticState.textContent = "Whisper microphone blocked";
    voiceDiagnosticError.textContent = String(error?.message || error);
    setStatus("Microphone permission is needed for Whisper.");
  }
}

function toggleWhisperRecording() {
  if (whisperRecording) stopWhisperRecording();
  else void startWhisperRecording();
}

function setWhisperContinuousUi(enabled) {
  whisperContinuousOn = enabled;
  whisperContinuousBtn.classList.toggle("listening", enabled);
  whisperContinuousBtn.textContent = enabled ? "Stop Whisper Commands" : "Start Whisper Commands";
  voiceReadout.textContent = enabled ? "Whisper" : voiceOn ? "On" : "Off";
}

function stopWhisperContinuous() {
  setWhisperContinuousUi(false);
  if (whisperRecorder && whisperRecorder.state !== "inactive") whisperRecorder.stop();
  whisperStream?.getTracks().forEach((track) => track.stop());
  whisperStream = null;
  whisperRecorder = null;
  whisperChunks = [];
  whisperChunkBusy = false;
  setStatus("Whisper command mode stopped.");
}

function startWhisperContinuousChunk() {
  if (!whisperContinuousOn || !whisperStream || whisperChunkBusy) return;
  whisperChunks = [];
  whisperRecorder = new MediaRecorder(whisperStream);
  whisperRecorder.ondataavailable = (event) => {
    if (event.data?.size) whisperChunks.push(event.data);
  };
  whisperRecorder.onerror = (event) => {
    voiceDiagnosticState.textContent = "Whisper command mode error";
    voiceDiagnosticError.textContent = String(event.error?.message || event.error || "Recording failed");
    stopWhisperContinuous();
  };
  whisperRecorder.onstop = async () => {
    const chunks = whisperChunks;
    whisperChunks = [];
    if (!whisperContinuousOn || !chunks.length) {
      whisperChunkBusy = false;
      return;
    }
    whisperChunkBusy = true;
    const blob = new Blob(chunks, { type: whisperRecorder?.mimeType || "audio/webm" });
    try {
      await transcribeWhisperBlob(blob, { quiet: true });
    } catch (error) {
      const message = String(error?.message || error);
      if (!/empty transcript|say jarvis/i.test(message)) voiceDiagnosticError.textContent = message;
    } finally {
      whisperChunkBusy = false;
      if (whisperContinuousOn) window.setTimeout(startWhisperContinuousChunk, 120);
    }
  };
  whisperRecorder.start();
  window.setTimeout(() => {
    if (whisperRecorder?.state === "recording") whisperRecorder.stop();
  }, 3200);
}

async function startWhisperContinuous() {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    voiceDiagnosticState.textContent = "Whisper unavailable";
    voiceDiagnosticError.textContent = "This browser cannot record microphone audio for Whisper.";
    return;
  }
  if (voiceOn) stopVoice();
  if (whisperRecording) stopWhisperRecording();
  try {
    whisperStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    setWhisperContinuousUi(true);
    voiceDiagnosticState.textContent = "Whisper commands listening";
    voiceDiagnosticTranscript.textContent = "Say Jarvis before each command. Jarvis ignores chunks without the wake word.";
    voiceDiagnosticError.textContent = "";
    setStatus("Whisper command mode listening.");
    startWhisperContinuousChunk();
  } catch (error) {
    setWhisperContinuousUi(false);
    voiceDiagnosticState.textContent = "Whisper microphone blocked";
    voiceDiagnosticError.textContent = String(error?.message || error);
  }
}

function toggleWhisperContinuous() {
  if (whisperRecording && !whisperContinuousOn) stopWhisperRecording();
  if (whisperContinuousOn) stopWhisperContinuous();
  else void startWhisperContinuous();
}

function runTypedCommand() {
  const command = commandInput.value.trim();
  if (!command) return;
  applyVoiceCommand(command, "keyboard");
  commandInput.select();
}

function setMirrorMovement(enabled) {
  mirrorMovement = enabled;
  mirrorInput.checked = enabled;
  mirrorReadout.textContent = enabled ? "On" : "Off";
  resetFilters();
  clearGestureDrawingState();
  setStatus(enabled ? "Mirror movement on" : "Mirror movement off");
}

function updateGestureSettings() {
  stability = Number(stabilityInput.value);
  responsiveness = Number(responsivenessInput.value);
  predictionMs = Number(predictionInput.value);
  primeDelayMs = Number(primeDelayInput.value);
  stabilityReadout.textContent = stability.toFixed(1);
  responsivenessReadout.textContent = responsiveness.toFixed(3);
  predictionReadout.textContent = `${predictionMs} ms`;
  primeDelayReadout.textContent = `${primeDelayMs} ms`;
  for (const filterSet of Object.values(pointFilters)) {
    filterSet.x.update({ minCutoff: stability, beta: responsiveness });
    filterSet.y.update({ minCutoff: stability, beta: responsiveness });
  }
}

function setPanelCollapsed(collapsed) {
  document.querySelector(".shell").classList.toggle("panel-collapsed", collapsed);
  window.setTimeout(resizeCanvases, 180);
}

function applyCameraVisibility() {
  cameraVideo.classList.toggle("camera-visible", handModeOn && cameraToggle.checked);
}

function setCameraVisible(visible) {
  cameraToggle.checked = visible;
  applyCameraVisibility();
}

function setPresentMode(enabled) {
  if (presentMode === enabled) return;
  presentMode = enabled;
  const shell = document.querySelector(".shell");
  shell.classList.toggle("present-mode", enabled);
  presentBtn.textContent = enabled ? "Exit Present Mode" : "Enter Present Mode";

  if (enabled) {
    editModeCameraVisible = cameraToggle.checked;
    setCameraVisible(false);
    setStatus("Present mode");
  } else {
    setCameraVisible(editModeCameraVisible);
    setStatus("Edit mode");
  }

  window.setTimeout(() => {
    resizeCanvases();
  }, 180);
}

function togglePanelSection(header) {
  const section = header.closest(".panel-section");
  const open = !section.classList.contains("open");
  section.classList.toggle("open", open);
  header.setAttribute("aria-expanded", String(open));
}

function showOnboarding() {
  onboarding.hidden = false;
}

function dismissOnboarding() {
  onboarding.hidden = true;
  try {
    localStorage.setItem("jarvisPresenterOnboardingSeen", "true");
  } catch (error) {
    console.warn("Could not save onboarding preference", error);
  }
}

function initializeOnboarding() {
  let seen = false;
  try {
    seen = localStorage.getItem("jarvisPresenterOnboardingSeen") === "true";
  } catch (error) {
    console.warn("Could not read onboarding preference", error);
  }
  onboarding.hidden = seen;
}

const calibrationSteps = [
  ["Camera health", "Start hand control and confirm the camera tracks smoothly at a comfortable distance."],
  ["Lighting and confidence", "Keep your hand visible. Reposition lighting if tracking drops or flickers."],
  ["Mirror direction", "Move your hand right and confirm the cursor also moves right."],
  ["Dominant hand", "Choose the hand you normally use to point and draw."],
  ["Peace pointer", "Hold a comfortable peace sign and move across your normal presentation range."],
  ["Open palm", "Show a relaxed open palm. Keep it stationary long enough to reveal the tool menu."],
  ["Pinch range", "Close thumb and index, then open them comfortably. Jarvis keeps normalized hysteresis between both positions."],
  ["Two-hand visibility", "Show both hands apart and confirm Jarvis reports Two hands."],
  ["Movement range", "Trace the comfortable left, right, top and bottom limits of your presenting space."],
  ["Verification", "Verify draw, stationary-palm menu, palm swipe and two-hand zoom. Finish to save locally."]
];

function activeProfileFromStore(state = profileStorage.read()) {
  return state.profiles.find((profile) => profile.id === state.activeId) || state.profiles[0] || createProfile();
}

function applyProfile(profile) {
  activeProfile = createProfile(profile);
  setMirrorMovement(activeProfile.mirror);
  stabilityInput.value = activeProfile.filters.minCutoff;
  responsivenessInput.value = activeProfile.filters.beta;
  predictionInput.value = activeProfile.filters.predictionMs;
  primeDelayInput.value = activeProfile.timing.primeMs;
  updateGestureSettings();
  profileStatus.textContent = `${activeProfile.name} active${profileStorage.persistent ? " — saved locally" : " — memory only"}`;
  runtimeProfileReadout.textContent = activeProfile.name;
}

function refreshProfileSelect(state = profileStorage.read()) {
  profileSelect.replaceChildren(...state.profiles.map((profile) => {
    const option = document.createElement("option"); option.value = profile.id; option.textContent = profile.name; return option;
  }));
  profileSelect.value = state.activeId;
  applyProfile(activeProfileFromStore(state));
}

function initializeLaunchProfile() {
  const requestedProfile = new URLSearchParams(window.location.search).get("profile");
  if (requestedProfile === VERIFIED_DEMO_PROFILE.id) {
    refreshProfileSelect(profileStorage.save(VERIFIED_DEMO_PROFILE, { select: true }));
    return;
  }
  refreshProfileSelect();
}

async function initializeRuntimeIdentity() {
  const requestedBuild = new URLSearchParams(window.location.search).get("build");
  try {
    const response = await fetch("./__jarvis__/health.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`health ${response.status}`);
    const identity = await response.json();
    if (!identity.build || !identity.root) throw new Error("incomplete runtime identity");
    if (requestedBuild && requestedBuild !== identity.build) {
      throw new Error(`URL build ${requestedBuild} does not match server build ${identity.build}`);
    }
    runtimeIdentity.classList.add("verified");
    runtimeIdentity.classList.remove("error");
    runtimeBuildReadout.textContent = identity.build;
    statusBuildReadout.textContent = identity.build;
    runtimeRootReadout.textContent = identity.root;
    runtimeIdentity.title = `Verified local release\nBuild: ${identity.build}\nRoot: ${identity.root}\nCache: ${identity.cache}`;
    document.documentElement.dataset.build = identity.build;
    document.documentElement.dataset.runtimeVerified = "true";
  } catch (error) {
    runtimeIdentity.classList.add("error");
    runtimeIdentity.classList.remove("verified");
    runtimeBuildReadout.textContent = "unverified";
    statusBuildReadout.textContent = "unverified";
    runtimeRootReadout.textContent = "Use launch-jarvis.command";
    runtimeIdentity.title = String(error?.message || error);
    document.documentElement.dataset.runtimeVerified = "false";
    console.warn("Jarvis runtime identity could not be verified", error);
  }
}

async function initializeWhisperStatus() {
  try {
    const response = await fetch("./__jarvis__/whisper/status.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`whisper status ${response.status}`);
    const status = await response.json();
    if (status.ok) {
      whisperCommandBtn.disabled = false;
      voiceDiagnosticState.textContent = "Whisper ready";
      voiceDiagnosticTranscript.textContent = "Local whisper.cpp is configured. Click Record Whisper Command to use it.";
      voiceDiagnosticError.textContent = "";
    } else {
      whisperCommandBtn.disabled = false;
      voiceDiagnosticState.textContent = "Whisper not configured";
      voiceDiagnosticTranscript.textContent = "Chrome voice and typed commands are still available.";
      voiceDiagnosticError.textContent = status.reason || "Set JARVIS_WHISPER_BIN and JARVIS_WHISPER_MODEL.";
    }
  } catch (error) {
    whisperCommandBtn.disabled = false;
    voiceDiagnosticState.textContent = "Whisper status unavailable";
    voiceDiagnosticError.textContent = String(error?.message || error);
  }
}

function showCalibrationStep() {
  const [title, instruction] = calibrationSteps[calibrationStep];
  calibrationTitle.textContent = title;
  calibrationInstruction.textContent = instruction;
  calibrationProgress.style.width = `${((calibrationStep + 1) / calibrationSteps.length) * 100}%`;
  calibrationChoiceRow.hidden = calibrationStep !== 3;
  calibrationNextBtn.textContent = calibrationStep === calibrationSteps.length - 1 ? "Save profile" : "Looks good — next";
}

function startCalibration() {
  calibrationStep = 0;
  calibrationSamples = { pinchRatios: [], palmSpreads: [], movementX: [], movementY: [] };
  calibrationDominantHand.value = activeProfile.dominantHand;
  calibrationWizard.hidden = false;
  showCalibrationStep();
}

function finishCalibration() {
  const sortedPinches = [...calibrationSamples.pinchRatios].sort((a, b) => a - b);
  const sampleSize = Math.max(1, Math.floor(sortedPinches.length * 0.25));
  const thresholds = sortedPinches.length >= 8
    ? derivePinchThresholds({ closedRatios: sortedPinches.slice(0, sampleSize), openRatios: sortedPinches.slice(-sampleSize) })
    : activeProfile.thresholds;
  const palmSpread = calibrationSamples.palmSpreads.length
    ? calibrationSamples.palmSpreads.reduce((sum, value) => sum + value, 0) / calibrationSamples.palmSpreads.length
    : activeProfile.thresholds.palmSpread;
  const name = `${calibrationDominantHand.value} profile ${new Date().toLocaleDateString()}`;
  const profile = createProfile({
    ...activeProfile,
    id: `profile-${Date.now()}`,
    name,
    dominantHand: calibrationDominantHand.value,
    thresholds: { ...activeProfile.thresholds, ...thresholds, palmSpread: Number(palmSpread.toFixed(3)) },
    timing: { ...activeProfile.timing, primeMs: primeDelayMs },
    filters: { minCutoff: stability, beta: responsiveness, predictionMs }
  });
  const state = profileStorage.save(profile);
  calibrationWizard.hidden = true;
  refreshProfileSelect(state);
  showActionNotice("Calibration saved. No camera frames or microphone audio were stored.");
}

function captureCalibrationSample(hand) {
  if (calibrationWizard.hidden || !hand) return;
  const palmWidth = Math.max(.001, landmarkDistance(hand[5], hand[17]));
  if (calibrationStep === 5) {
    const spread = (landmarkDistance(hand[8], hand[12]) + landmarkDistance(hand[12], hand[16]) + landmarkDistance(hand[16], hand[20])) / (palmWidth * 3);
    calibrationSamples.palmSpreads.push(spread);
    calibrationSamples.palmSpreads = calibrationSamples.palmSpreads.slice(-90);
  }
  if (calibrationStep === 6) {
    calibrationSamples.pinchRatios.push(landmarkDistance(hand[4], hand[8]) / palmWidth);
    calibrationSamples.pinchRatios = calibrationSamples.pinchRatios.slice(-120);
  }
  if (calibrationStep === 8) {
    calibrationSamples.movementX.push(hand[5].x);
    calibrationSamples.movementY.push(hand[5].y);
    calibrationSamples.movementX = calibrationSamples.movementX.slice(-120);
    calibrationSamples.movementY = calibrationSamples.movementY.slice(-120);
  }
}

function nextCalibrationStep() {
  if (calibrationStep >= calibrationSteps.length - 1) return finishCalibration();
  calibrationStep += 1;
  showCalibrationStep();
}

function downloadText(filename, text) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  link.download = filename; link.click(); URL.revokeObjectURL(link.href);
}

function renameActiveProfile() {
  const name = window.prompt("Profile name", activeProfile.name)?.trim();
  if (!name) return;
  const state = profileStorage.save(createProfile({ ...activeProfile, name }), { select: true });
  refreshProfileSelect(state);
}

async function importProfiles(file) {
  if (!file) return;
  try { refreshProfileSelect(profileStorage.importJson(await file.text())); showActionNotice("Calibration profiles imported."); }
  catch (error) { showActionNotice(String(error.message || error), true); }
  profileImportInput.value = "";
}

captureBtn.addEventListener("click", startCapture);
slidesBtn.addEventListener("click", () => slidesInput.click());
slidesInput.addEventListener("change", () => loadSlides(slidesInput.files));
handBtn.addEventListener("click", () => (handModeOn ? stopHandControl() : startHandControl()));
voiceBtn.addEventListener("click", () => (voiceOn ? stopVoice() : startVoicePreflight()));
voiceCommandsBtn.addEventListener("click", () => (voiceOn ? stopVoice() : startVoiceCommands()));
whisperContinuousBtn.addEventListener("click", toggleWhisperContinuous);
whisperCommandBtn.addEventListener("click", toggleWhisperRecording);
profileSelect.addEventListener("change", () => refreshProfileSelect(profileStorage.select(profileSelect.value)));
calibrateBtn.addEventListener("click", startCalibration);
calibrationNextBtn.addEventListener("click", nextCalibrationStep);
calibrationCancelBtn.addEventListener("click", () => { calibrationWizard.hidden = true; });
renameProfileBtn.addEventListener("click", renameActiveProfile);
exportProfileBtn.addEventListener("click", () => downloadText("jarvis-calibration-profiles.json", profileStorage.exportJson()));
importProfileBtn.addEventListener("click", () => profileImportInput.click());
profileImportInput.addEventListener("change", () => importProfiles(profileImportInput.files[0]));
resetProfileBtn.addEventListener("click", () => refreshProfileSelect(profileStorage.reset()));
clearBtn.addEventListener("click", clearDrawing);
undoBtn.addEventListener("click", () => undoDrawing("ui"));
redoBtn.addEventListener("click", () => redoDrawing("ui"));
diagramShelfOpenBtn.addEventListener("click", () => dispatchPresentationCommand("diagram.gallery.open", {}, "ui"));
diagramShelfCloseBtn.addEventListener("click", () => dispatchPresentationCommand("diagram.gallery.close", {}, "ui"));
diagramShelfParkBtn.addEventListener("click", () => dispatchPresentationCommand("diagram.active.park", {}, "ui"));
diagramShelfHideBtn.addEventListener("click", () => dispatchPresentationCommand("diagram.hide", {}, "ui"));
collapseBtn.addEventListener("click", () => setPanelCollapsed(true));
expandBtn.addEventListener("click", () => setPanelCollapsed(false));
presentBtn.addEventListener("click", () => setPresentMode(!presentMode));
exitPresentBtn.addEventListener("click", () => setPresentMode(false));
helpBtn.addEventListener("click", showOnboarding);
cameraToggle.addEventListener("change", applyCameraVisibility);
sectionHeaders.forEach((header) => header.addEventListener("click", () => togglePanelSection(header)));
dismissOnboardingBtn.addEventListener("click", dismissOnboarding);
closeOnboardingBtn.addEventListener("click", dismissOnboarding);
onboarding.addEventListener("click", (event) => {
  if (event.target === onboarding) dismissOnboarding();
});
commandBtn.addEventListener("click", runTypedCommand);
commandInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    runTypedCommand();
  }
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && presentMode) {
    setPresentMode(false);
    return;
  }
  if (!event.metaKey && !event.ctrlKey && slideMode) {
    if (event.key === "ArrowRight") {
      nextSlide("keyboard");
      return;
    }
    if (event.key === "ArrowLeft") {
      previousSlide("keyboard");
      return;
    }
  }
  if (!event.metaKey && !event.ctrlKey) return;
  if (event.key.toLowerCase() !== "z") return;
  event.preventDefault();
  if (event.shiftKey) {
    redoDrawing("keyboard");
  } else {
    undoDrawing("keyboard");
  }
});
mirrorInput.addEventListener("change", () => setMirrorMovement(mirrorInput.checked));
[stabilityInput, responsivenessInput, predictionInput, primeDelayInput].forEach((input) => {
  input.addEventListener("input", updateGestureSettings);
});
toolButtons.forEach((button) => button.addEventListener("click", () => selectTool(button.dataset.tool)));
radialActionButtons.forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.radialAction === "diagrams") dispatchPresentationCommand("diagram.gallery.open", {}, "ui");
}));
swatches.forEach((button) => button.addEventListener("click", () => selectColor(button.dataset.color)));

previewCanvas.addEventListener("pointerdown", handlePointerDown);
previewCanvas.addEventListener("pointermove", handlePointerMove);
previewCanvas.addEventListener("pointerup", handlePointerUp);
previewCanvas.addEventListener("pointercancel", handlePointerUp);
window.addEventListener("resize", resizeCanvases);

resizeCanvases();
layoutRadialMenu();
renderDiagramShelf();
selectTool("pen");
setMirrorMovement(true);
updateGestureSettings();
updateHistoryReadout();
transitionTo(State.IDLE, true);
initializeOnboarding();
initializeLaunchProfile();
void initializeRuntimeIdentity();
void initializeWhisperStatus();
void initializeReplayLab();
if (
  new URLSearchParams(window.location.search).get("debugReplay") === "1"
  && new URLSearchParams(window.location.search).get("previewMenu") === "1"
) {
  window.setTimeout(() => {
    openRadialMenu(stageCenter());
    transitionTo(State.MENU, true);
  }, 120);
}
