import { FilesetResolver, HandLandmarker } from "./vendor/tasks-vision/vision_bundle.mjs";
import { OneEuroFilter } from "./one-euro-filter.js";

const captureBtn = document.getElementById("captureBtn");
const slidesBtn = document.getElementById("slidesBtn");
const slidesInput = document.getElementById("slidesInput");
const handBtn = document.getElementById("handBtn");
const voiceBtn = document.getElementById("voiceBtn");
const actionNotice = document.getElementById("actionNotice");
const clearBtn = document.getElementById("clearBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const collapseBtn = document.getElementById("collapseBtn");
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
const radialCore = document.querySelector(".radial-core");
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

const drawCtx = drawCanvas.getContext("2d");
const previewCtx = previewCanvas.getContext("2d");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

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
let stateEnteredAt = performance.now();
let gestureStartPoint = null;
let gestureLastPoint = null;
let lastVideoTime = -1;
let gestureAnimationId = null;
let positionHistory = [];
let radialCenter = null;
let radialSelectedTool = "pen";
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
  if (scale === previousScale) return;

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

function undoDrawing() {
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

function redoDrawing() {
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

  const now = performance.now();
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

function pointFromLandmark(landmark, timestamp = performance.now(), mode = "cursor") {
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
  return pinchRatio < 0.42 && [middle, ring, pinky].filter(Boolean).length <= 1;
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
  const margin = 124;
  return {
    x: Math.min(Math.max(point.x, margin), Math.max(margin, rect.width - margin)),
    y: Math.min(Math.max(point.y, margin), Math.max(margin, rect.height - margin))
  };
}

function openRadialMenu(point) {
  radialCenter = clampMenuPoint(point);
  radialSelectedTool = activeTool;
  radialCore.textContent = toolReadout.textContent;
  radialMenu.style.left = `${radialCenter.x}px`;
  radialMenu.style.top = `${radialCenter.y}px`;
  radialMenu.classList.add("open");
  radialMenu.setAttribute("aria-hidden", "false");
  updateRadialSelection(point);
  setStatus("Tool menu open");
}

function closeRadialMenu() {
  radialMenu.classList.remove("open");
  radialMenu.setAttribute("aria-hidden", "true");
  radialItems.forEach((item) => item.classList.remove("menu-hot"));
  radialCenter = null;
}

function updateRadialSelection(point) {
  if (!radialCenter || !radialItems.length) return;
  const angle = Math.atan2(point.y - radialCenter.y, point.x - radialCenter.x);
  const normalized = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
  const index = Math.round(normalized / ((Math.PI * 2) / radialItems.length)) % radialItems.length;
  const item = radialItems[index];
  radialSelectedTool = item.dataset.tool || activeTool;
  radialItems.forEach((candidate) => candidate.classList.toggle("menu-hot", candidate === item));
  updateGestureCursor(point, "pointing");
}

function selectRadialTool() {
  if (!radialSelectedTool) return;
  selectTool(radialSelectedTool);
  closeRadialMenu();
  transitionTo(State.TRACKING, true);
}

function transitionTo(nextState, force = false) {
  if (!force && nextState === gestureState) return;
  gestureState = nextState;
  stateEnteredAt = performance.now();
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
    if (!twoHandMode && twoHandCandidateFrames >= 6) {
      twoHandMode = true;
      clearGestureDrawingState();
      resetFilters();
      hideGestureCursor();
      setGestureStateLabel("Two hands");
      setStatus("Two-hand controls ready");
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
      }
    }
  }

  return { validPair, active: twoHandMode };
}

function selectPrimaryHand(hands) {
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
  return landmarkDistance(left, right) < 0.16 && isOpenPalm(hands[0]) && isOpenPalm(hands[1]);
}

function handleClapEvent() {
  const now = performance.now();

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

  if (performance.now() - lastSwipeAt < 400 || positionHistory.length < 3) return;

  const first = positionHistory[0];
  const last = positionHistory[positionHistory.length - 1];
  const elapsedSeconds = Math.max(0.001, (last.timestamp - first.timestamp) / 1000);
  const velocityX = (last.x - first.x) / elapsedSeconds;
  const velocityY = (last.y - first.y) / elapsedSeconds;

  if (Math.abs(velocityX) > 800 && Math.abs(velocityY) < 200) {
    lastSwipeAt = performance.now();
    positionHistory = [];
    if (velocityX < 0) {
      undoDrawing();
    } else {
      redoDrawing();
    }
  }
}

function setSlideMode(enabled) {
  slideMode = enabled;
  sourceVideo.classList.toggle("slides-active", enabled);
  slideImage.classList.toggle("active", enabled && slideSourceType === "images");
  pptxCanvas.classList.toggle("active", enabled && slideSourceType === "pptx");
  slideReadout.textContent = enabled && slideDeck.length ? `${currentSlideIndex + 1}/${slideDeck.length}` : "Off";
}

async function showSlide(index) {
  if (!slideDeck.length) return;
  currentSlideIndex = Math.min(slideDeck.length - 1, Math.max(0, index));

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

  slideImage.style.opacity = "0";
  window.setTimeout(() => {
    slideImage.onload = () => {
      slideImage.style.opacity = "1";
      slideImage.onload = null;
      slideImage.onerror = null;
    };
    slideImage.onerror = () => {
      slideImage.style.opacity = "1";
      setStatus(`Could not load ${slideDeck[currentSlideIndex].name}`);
      slideImage.onload = null;
      slideImage.onerror = null;
    };
    slideImage.src = slideDeck[currentSlideIndex].url;
  }, 90);
  slideReadout.textContent = `${currentSlideIndex + 1}/${slideDeck.length}`;
  setStatus(`Slide ${currentSlideIndex + 1} / ${slideDeck.length}`);
}

function nextSlide() {
  if (!slideMode || currentSlideIndex >= slideDeck.length - 1) return;
  void showSlide(currentSlideIndex + 1);
}

function previousSlide() {
  if (!slideMode || currentSlideIndex <= 0) return;
  void showSlide(currentSlideIndex - 1);
}

function trackSlideSwipe(hand, timestamp) {
  if (!slideMode || sourceVideo.srcObject || performance.now() - lastSlideSwipeAt < 600) return false;
  const center = screenPointFromLandmark(palmCenter(hand));
  slideSwipeHistory.push({ ...center, timestamp });
  slideSwipeHistory = slideSwipeHistory.filter((point) => timestamp - point.timestamp <= 240);

  if (slideSwipeHistory.length < 3) return false;

  const first = slideSwipeHistory[0];
  const last = slideSwipeHistory[slideSwipeHistory.length - 1];
  const elapsedSeconds = Math.max(0.001, (last.timestamp - first.timestamp) / 1000);
  const velocityX = (last.x - first.x) / elapsedSeconds;
  const velocityY = (last.y - first.y) / elapsedSeconds;

  if (Math.abs(velocityX) > 600 && Math.abs(velocityY) < 200) {
    lastSlideSwipeAt = performance.now();
    palmMenuBlockedUntil = lastSlideSwipeAt + 900;
    slideSwipeHistory = [];
    if (velocityX < 0) {
      nextSlide();
    } else {
      previousSlide();
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
}

function handleClearHold() {
  const now = performance.now();
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
    clapActive = false;
    pinchZoomStart = null;
    panStart = null;
    lastPrimaryWrist = null;
    if (handMode.active) {
      hideGestureCursor();
      return;
    }
    if (performance.now() - lastHandAt > 500) {
      transitionTo(State.IDLE);
      handReadout.textContent = "Searching";
      hideGestureCursor();
    }
    return;
  }

  if (!onboarding.hidden) dismissOnboarding();
  handSeenFrames += 1;
  lastHandAt = performance.now();

  if (handMode.active) {
    handReadout.textContent = handMode.validPair ? "Two hands" : "Releasing";
    clearGestureDrawingState();
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

  const hand = selectPrimaryHand(hands);
  const gesture = classifyGesture(hand);
  const cursorPoint = pointFromLandmark(hand[5], timestamp, "cursor");
  const drawingPoint = pointFromLandmark(hand[8], timestamp, "draw");
  const target = stableTargetState(gesture);

  if (gesture === Gesture.PEACE) {
    trackPointerSwipe(hand, timestamp);
  } else {
    positionHistory = [];
  }

  if (gesture === Gesture.PALM) {
    if (trackSlideSwipe(hand, timestamp)) {
      palmHoldAnchor = null;
      transitionTo(State.TRACKING, true);
      setGestureStateLabel("Slide changed");
      hideGestureCursor();
      return;
    }
  } else {
    slideSwipeHistory = [];
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
    if (performance.now() - stateEnteredAt >= 80) transitionTo(State.TRACKING, true);
    return;
  }

  if (handSeenFrames < 3) {
    transitionTo(State.TRACKING);
    updateGestureCursor(cursorPoint, "tracking");
    return;
  }

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
    if (!palmHoldAnchor) palmHoldAnchor = { ...cursorPoint };
    const palmMovement = Math.hypot(cursorPoint.x - palmHoldAnchor.x, cursorPoint.y - palmHoldAnchor.y);
    if (palmMovement > 34) {
      palmHoldAnchor = { ...cursorPoint };
      stateEnteredAt = performance.now();
      palmMenuBlockedUntil = Math.max(palmMenuBlockedUntil, performance.now() + 220);
      setGestureStateLabel("Palm moving");
    }
    if (
      gesture === Gesture.PALM
      && performance.now() >= palmMenuBlockedUntil
      && performance.now() - stateEnteredAt >= 500
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
    if (gesture === Gesture.FIST || gesture === Gesture.OTHER || gesture === Gesture.NONE) {
      closeRadialMenu();
      transitionTo(State.TRACKING, true);
      return;
    }
    updateRadialSelection(gesture === Gesture.INDEX_ONLY ? drawingPoint : cursorPoint);
    return;
  }

  if (gestureState === State.PRIMING) {
    panStart = null;
    const progress = Math.min(1, (performance.now() - stateEnteredAt) / Math.max(1, primeDelayMs));
    gestureCursor.style.setProperty("--prime-progress", `${progress * 360}deg`);
    updateGestureCursor(drawingPoint, "priming");
    if (performance.now() - stateEnteredAt >= primeDelayMs) {
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
      processHands(results.landmarks || [], timestamp, results.handedness || []);
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

function selectTool(tool) {
  const toolChanged = activeTool !== tool;
  activeTool = tool;
  toolButtons.forEach((button) => button.classList.toggle("active", button.dataset.tool === tool));
  toolReadout.textContent = tool.charAt(0).toUpperCase() + tool.slice(1);
  if (radialCore) radialCore.textContent = toolReadout.textContent;
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
}

function selectColor(color) {
  activeColor = color;
  swatches.forEach((button) => button.classList.toggle("active", button.dataset.color === color));
  gestureCursor.style.setProperty("--cursor-color", activeColor);
  gestureIndicator.style.setProperty("--active-color", activeColor);
  setStatus("Color updated");
}

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
  pointerDown = true;
  startPoint = canvasPoint(event);
  lastPoint = startPoint;
  previewCanvas.setPointerCapture?.(event.pointerId);
  if (activeTool !== "laser") pushCanvasHistory();
  if (activeTool === "eraser") eraseAt(startPoint);
  if (activeTool === "laser") drawLaser(previewCtx, startPoint);
}

function handlePointerMove(event) {
  if (!pointerDown) return;
  const point = canvasPoint(event);

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
  if (!pointerDown) return;
  const point = canvasPoint(event);
  if (["arrow", "circle", "spotlight"].includes(activeTool)) commitShape(point);
  if (activeTool === "laser") clearPreview();
  pointerDown = false;
  startPoint = null;
  lastPoint = null;
}

function applyVoiceCommand(rawText) {
  const text = rawText.toLowerCase();
  heardText.textContent = rawText;
  const colorMap = [
    ["red", "#ff3b6b"],
    ["blue", "#00e5ff"],
    ["cyan", "#00e5ff"],
    ["yellow", "#ffd166"],
    ["green", "#7cff6b"],
    ["white", "#ffffff"],
    ["orange", "#ff8a2a"]
  ];

  if (text.includes("clear")) {
    clearDrawing();
    return;
  }
  if (text.includes("undo")) {
    undoDrawing();
    return;
  }
  if (text.includes("redo")) {
    redoDrawing();
    return;
  }
  for (const [word, color] of colorMap) {
    if (text.includes(word)) selectColor(color);
  }
  if (text.includes("arrow")) {
    selectTool("arrow");
    drawCommandShape("arrow");
  } else if (text.includes("circle")) {
    selectTool("circle");
    drawCommandShape("circle");
  } else if (text.includes("spotlight") || text.includes("highlight")) {
    selectTool("spotlight");
    drawCommandShape("spotlight");
  } else if (text.includes("erase") || text.includes("eraser")) {
    selectTool("eraser");
    eraseCommandArea();
  } else if (text.includes("laser") || text.includes("pointer")) {
    selectTool("laser");
  } else if (text.includes("draw") || text.includes("pen")) {
    selectTool("pen");
  } else {
    setStatus("Command not mapped");
  }
}

function startVoice() {
  if (!SpeechRecognition) {
    setStatus("Voice unsupported. Use Chrome or type a command.");
    voiceReadout.textContent = "Unavailable";
    return;
  }

  voiceShouldRun = true;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";
  recognition.onstart = () => {
    voiceOn = true;
    voiceBtn.classList.add("listening");
    voiceBtn.textContent = "Stop Voice";
    voiceReadout.textContent = "On";
    setStatus("Voice online");
  };
  recognition.onend = () => {
    if (voiceShouldRun) {
      window.setTimeout(() => {
        try {
          recognition.start();
        } catch (error) {
          setStatus("Voice restart failed");
        }
      }, 350);
      return;
    }
    voiceOn = false;
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "Start Voice";
    voiceReadout.textContent = "Off";
  };
  recognition.onerror = (event) => {
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      voiceShouldRun = false;
      setStatus("Microphone permission blocked");
      return;
    }
    if (event.error === "no-speech") {
      setStatus("Listening");
      return;
    }
    setStatus(`Voice ${event.error}`);
  };
  recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const latest = result[0].transcript.trim();
    heardText.textContent = latest;
    if (result.isFinal) applyVoiceCommand(latest);
  };
  try {
    recognition.start();
  } catch (error) {
    setStatus("Voice already starting");
  }
}

function stopVoice() {
  voiceShouldRun = false;
  recognition?.stop();
}

function runTypedCommand() {
  const command = commandInput.value.trim();
  if (!command) return;
  applyVoiceCommand(command);
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

  window.setTimeout(resizeCanvases, 180);
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

captureBtn.addEventListener("click", startCapture);
slidesBtn.addEventListener("click", () => slidesInput.click());
slidesInput.addEventListener("change", () => loadSlides(slidesInput.files));
handBtn.addEventListener("click", () => (handModeOn ? stopHandControl() : startHandControl()));
voiceBtn.addEventListener("click", () => (voiceOn ? stopVoice() : startVoice()));
clearBtn.addEventListener("click", clearDrawing);
undoBtn.addEventListener("click", undoDrawing);
redoBtn.addEventListener("click", redoDrawing);
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
  if (event.key === "Enter") runTypedCommand();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && presentMode) {
    setPresentMode(false);
    return;
  }
  if (!event.metaKey && !event.ctrlKey && slideMode) {
    if (event.key === "ArrowRight") {
      nextSlide();
      return;
    }
    if (event.key === "ArrowLeft") {
      previousSlide();
      return;
    }
  }
  if (!event.metaKey && !event.ctrlKey) return;
  if (event.key.toLowerCase() !== "z") return;
  event.preventDefault();
  if (event.shiftKey) {
    redoDrawing();
  } else {
    undoDrawing();
  }
});
mirrorInput.addEventListener("change", () => setMirrorMovement(mirrorInput.checked));
[stabilityInput, responsivenessInput, predictionInput, primeDelayInput].forEach((input) => {
  input.addEventListener("input", updateGestureSettings);
});
toolButtons.forEach((button) => button.addEventListener("click", () => selectTool(button.dataset.tool)));
swatches.forEach((button) => button.addEventListener("click", () => selectColor(button.dataset.color)));

previewCanvas.addEventListener("pointerdown", handlePointerDown);
previewCanvas.addEventListener("pointermove", handlePointerMove);
previewCanvas.addEventListener("pointerup", handlePointerUp);
previewCanvas.addEventListener("pointercancel", handlePointerUp);
window.addEventListener("resize", resizeCanvases);

resizeCanvases();
layoutRadialMenu();
selectTool("pen");
setMirrorMovement(true);
updateGestureSettings();
updateHistoryReadout();
transitionTo(State.IDLE, true);
initializeOnboarding();
