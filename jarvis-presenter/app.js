const captureBtn = document.getElementById("captureBtn");
const handBtn = document.getElementById("handBtn");
const voiceBtn = document.getElementById("voiceBtn");
const clearBtn = document.getElementById("clearBtn");
const collapseBtn = document.getElementById("collapseBtn");
const expandBtn = document.getElementById("expandBtn");
const commandInput = document.getElementById("commandInput");
const commandBtn = document.getElementById("commandBtn");
const toolButtons = [...document.querySelectorAll("[data-tool]")];
const swatches = [...document.querySelectorAll("[data-color]")];
const mirrorInput = document.getElementById("mirrorInput");
const pinchInput = document.getElementById("pinchInput");
const smoothingInput = document.getElementById("smoothingInput");
const drawDelayInput = document.getElementById("drawDelayInput");
const deadZoneInput = document.getElementById("deadZoneInput");
const sizeInput = document.getElementById("sizeInput");
const glowInput = document.getElementById("glowInput");
const sourceVideo = document.getElementById("sourceVideo");
const cameraVideo = document.getElementById("cameraVideo");
const drawCanvas = document.getElementById("drawCanvas");
const previewCanvas = document.getElementById("previewCanvas");
const gestureCursor = document.getElementById("gestureCursor");
const stage = document.getElementById("stage");
const emptyState = document.getElementById("emptyState");
const hudText = document.getElementById("hudText");
const systemState = document.getElementById("systemState");
const toolReadout = document.getElementById("toolReadout");
const handReadout = document.getElementById("handReadout");
const gestureReadout = document.getElementById("gestureReadout");
const lockReadout = document.getElementById("lockReadout");
const mirrorReadout = document.getElementById("mirrorReadout");
const pinchReadout = document.getElementById("pinchReadout");
const smoothingReadout = document.getElementById("smoothingReadout");
const delayReadout = document.getElementById("delayReadout");
const deadZoneReadout = document.getElementById("deadZoneReadout");
const voiceReadout = document.getElementById("voiceReadout");
const heardText = document.getElementById("heardText");

const drawCtx = drawCanvas.getContext("2d");
const previewCtx = previewCanvas.getContext("2d");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let activeTool = "pen";
let activeColor = "#00e5ff";
let mirrorMovement = true;
let pinchThreshold = 0.065;
let smoothingFactor = 0.35;
let drawDelayMs = 180;
let deadZonePx = 3;
let pointerDown = false;
let startPoint = null;
let lastPoint = null;
let recognition = null;
let voiceOn = false;
let voiceShouldRun = false;
let handLandmarker = null;
let handsFrameBusy = false;
let cameraStream = null;
let handModeOn = false;
let gestureLocked = false;
let lastClapAt = 0;
let clearHoldStartedAt = null;
let clearHoldArmed = false;
let gestureDrawing = false;
let gestureStartPoint = null;
let gestureLastPoint = null;
let pinchStartedAt = null;
let pendingGestureStartPoint = null;
let lastVideoTime = -1;
let smoothedGesturePoint = null;
let gestureAnimationId = null;

function setStatus(message) {
  hudText.textContent = message;
  systemState.textContent = message;
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

function clearGestureDrawingState() {
  gestureDrawing = false;
  gestureStartPoint = null;
  gestureLastPoint = null;
  pinchStartedAt = null;
  pendingGestureStartPoint = null;
  clearPreview();
  gestureCursor.classList.remove("drawing", "paused");
}

function setGestureLocked(locked) {
  gestureLocked = locked;
  lockReadout.textContent = locked ? "Locked" : "Open";
  clearGestureDrawingState();
  hideGestureCursor();
  setStatus(locked ? "Gesture lock active" : "Gesture control resumed");
  setGestureState(locked ? "Locked" : "Pointing");
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
  configureStroke(ctx);
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

  if (shape === "arrow") drawArrow(drawCtx, from, to);
  if (shape === "circle") drawCircle(drawCtx, from, to);
  if (shape === "spotlight") drawSpotlight(drawCtx, from, to);

  setStatus(`${shape.charAt(0).toUpperCase() + shape.slice(1)} placed`);
}

function updateGestureCursor(point, drawing) {
  gestureCursor.style.left = `${point.x}px`;
  gestureCursor.style.top = `${point.y}px`;
  gestureCursor.classList.add("active");
  gestureCursor.classList.toggle("drawing", drawing);
  gestureCursor.classList.remove("paused");
}

function hideGestureCursor() {
  gestureCursor.classList.remove("active", "drawing", "paused");
}

function setGestureState(state) {
  gestureReadout.textContent = state;
}

function setPausedCursor(point) {
  gestureCursor.style.left = `${point.x}px`;
  gestureCursor.style.top = `${point.y}px`;
  gestureCursor.classList.add("active", "paused");
  gestureCursor.classList.remove("drawing");
}

function eraseCommandArea() {
  const center = stageCenter();
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

  setStatus("Loading hand model");
  if (!window.Hands) {
    throw new Error("MediaPipe Hands script did not load");
  }

  handLandmarker = new window.Hands({
    locateFile: (file) => `./vendor/hands/${file}`
  });

  handLandmarker.setOptions({
    selfieMode: true,
    modelComplexity: 0,
    numHands: 2,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
  });

  handLandmarker.onResults((result) => {
    const hands = result.multiHandLandmarks || [];

    if (hands.length) {
      processHands(hands);
    } else {
      clearGestureDrawingState();
      resetClearHold();
      hideGestureCursor();
      handReadout.textContent = "Searching";
      setGestureState("Searching");
    }
  });

  return handLandmarker;
}

function describeStartupError(error) {
  const message = String(error?.message || error?.name || error || "unknown error");

  if (message.includes("Permission") || message.includes("NotAllowed")) {
    return "Camera permission blocked";
  }

  if (message.includes("getUserMedia")) {
    return "Camera unavailable in this browser";
  }

  if (message.includes("Failed to fetch") || message.includes("import") || message.includes("load")) {
    return "Hand model download blocked";
  }

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

function pointFromLandmark(landmark) {
  const rect = drawCanvas.getBoundingClientRect();
  const raw = {
    x: (mirrorMovement ? landmark.x : 1 - landmark.x) * rect.width,
    y: landmark.y * rect.height
  };

  if (!smoothedGesturePoint) {
    smoothedGesturePoint = raw;
    return raw;
  }

  const next = {
    x: smoothedGesturePoint.x * (1 - smoothingFactor) + raw.x * smoothingFactor,
    y: smoothedGesturePoint.y * (1 - smoothingFactor) + raw.y * smoothingFactor
  };

  if (Math.hypot(next.x - smoothedGesturePoint.x, next.y - smoothedGesturePoint.y) < deadZonePx) {
    return smoothedGesturePoint;
  }

  smoothedGesturePoint = next;

  return smoothedGesturePoint;
}

function isFingerExtended(hand, tip, pip) {
  return hand[tip].y < hand[pip].y - 0.018;
}

function isOpenPalm(hand, pinchDistance) {
  const extendedCount = [
    isFingerExtended(hand, 8, 6),
    isFingerExtended(hand, 12, 10),
    isFingerExtended(hand, 16, 14),
    isFingerExtended(hand, 20, 18)
  ].filter(Boolean).length;

  return extendedCount >= 4 && pinchDistance > pinchThreshold * 1.35;
}

function isClapGesture(hands) {
  if (hands.length < 2) return false;
  const left = palmCenter(hands[0]);
  const right = palmCenter(hands[1]);
  const palmDistance = landmarkDistance(left, right);
  const handAOpen = isOpenPalm(hands[0], landmarkDistance(hands[0][8], hands[0][4]));
  const handBOpen = isOpenPalm(hands[1], landmarkDistance(hands[1][8], hands[1][4]));

  return palmDistance < 0.16 && handAOpen && handBOpen;
}

function isClearHoldGesture(hands) {
  if (hands.length < 2) return false;
  const left = palmCenter(hands[0]);
  const right = palmCenter(hands[1]);
  const palmDistance = landmarkDistance(left, right);
  const handAOpen = isOpenPalm(hands[0], landmarkDistance(hands[0][8], hands[0][4]));
  const handBOpen = isOpenPalm(hands[1], landmarkDistance(hands[1][8], hands[1][4]));

  return palmDistance > 0.24 && palmDistance < 0.62 && handAOpen && handBOpen;
}

function handleClearHold() {
  const now = performance.now();

  if (clearHoldStartedAt === null) {
    clearHoldStartedAt = now;
    clearHoldArmed = true;
  }

  const elapsed = now - clearHoldStartedAt;
  const remaining = Math.max(0, Math.ceil((1000 - elapsed) / 100) / 10);
  setGestureState(`Clear ${remaining.toFixed(1)}s`);
  setStatus(`Hold to clear ${remaining.toFixed(1)}s`);

  if (elapsed >= 1000 && clearHoldArmed) {
    clearHoldArmed = false;
    clearDrawing();
    setGestureState("Cleared");
    window.setTimeout(resetClearHold, 450);
  }
}

function processHands(hands) {
  if (isClapGesture(hands)) {
    const now = performance.now();
    if (now - lastClapAt > 1200) {
      lastClapAt = now;
      setGestureLocked(!gestureLocked);
    }
    return;
  }

  if (gestureLocked) {
    resetClearHold();
    clearGestureDrawingState();
    hideGestureCursor();
    setGestureState("Locked");
    return;
  }

  if (isClearHoldGesture(hands)) {
    clearGestureDrawingState();
    hideGestureCursor();
    handleClearHold();
    return;
  }

  resetClearHold();

  processHandLandmarks(hands[0]);
}

function processHandLandmarks(hand) {
  const indexTip = hand[8];
  const thumbTip = hand[4];
  const point = pointFromLandmark(indexTip);
  const pinchDistance = landmarkDistance(indexTip, thumbTip);
  const pinching = pinchDistance < pinchThreshold;

  handReadout.textContent = "Tracking";

  if (gestureLocked) {
    clearGestureDrawingState();
    hideGestureCursor();
    setGestureState("Locked");
    return;
  }

  if (isOpenPalm(hand, pinchDistance)) {
    clearGestureDrawingState();
    setPausedCursor(point);
    setGestureState("Paused");
    return;
  }

  handleGestureDraw(point, pinching);
}

function setMirrorMovement(enabled) {
  mirrorMovement = enabled;
  mirrorInput.checked = enabled;
  mirrorReadout.textContent = enabled ? "On" : "Off";
  smoothedGesturePoint = null;
  clearGestureDrawingState();
  setStatus(enabled ? "Mirror movement on" : "Mirror movement off");
}

function handleGestureDraw(point, pinching) {
  if (!pinching) {
    updateGestureCursor(point, false);
    if (gestureDrawing && ["arrow", "circle", "spotlight"].includes(activeTool)) {
      startPoint = gestureStartPoint;
      commitShape(point);
      startPoint = null;
    }
    clearGestureDrawingState();
    updateGestureCursor(point, false);
    setGestureState("Pointing");
    return;
  }

  if (!gestureDrawing) {
    if (pinchStartedAt === null) {
      pinchStartedAt = performance.now();
      pendingGestureStartPoint = point;
    }

    if (performance.now() - pinchStartedAt < drawDelayMs) {
      updateGestureCursor(point, false);
      setGestureState("Priming");
      return;
    }

    gestureDrawing = true;
    gestureStartPoint = pendingGestureStartPoint || point;
    gestureLastPoint = point;
  }

  updateGestureCursor(point, true);
  setGestureState(activeTool === "eraser" ? "Erasing" : "Drawing");

  if (activeTool === "pen" && gestureLastPoint) {
    drawLine(drawCtx, gestureLastPoint, point);
  } else if (activeTool === "eraser") {
    eraseAt(point);
  } else if (["arrow", "circle", "spotlight"].includes(activeTool)) {
    startPoint = gestureStartPoint;
    previewShape(point);
    startPoint = null;
  }

  gestureLastPoint = point;
}

function updateGestureSettings() {
  pinchThreshold = Number(pinchInput.value) / 1000;
  smoothingFactor = Number(smoothingInput.value) / 100;
  drawDelayMs = Number(drawDelayInput.value);
  deadZonePx = Number(deadZoneInput.value);

  const pinchLabel = pinchThreshold < 0.052 ? "Low" : pinchThreshold > 0.078 ? "High" : "Medium";
  const smoothingLabel = smoothingFactor < 0.25 ? "High" : smoothingFactor > 0.55 ? "Low" : "Medium";

  pinchReadout.textContent = pinchLabel;
  smoothingReadout.textContent = smoothingLabel;
  delayReadout.textContent = `${drawDelayMs} ms`;
  deadZoneReadout.textContent = `${deadZonePx} px`;
  clearGestureDrawingState();
}

function runGestureLoop() {
  if (!handModeOn || !handLandmarker || cameraVideo.readyState < 2) {
    if (handModeOn) gestureAnimationId = window.requestAnimationFrame(runGestureLoop);
    return;
  }

  if (!handsFrameBusy && cameraVideo.currentTime !== lastVideoTime) {
    lastVideoTime = cameraVideo.currentTime;
    handsFrameBusy = true;
    handLandmarker.send({ image: cameraVideo })
      .catch((error) => {
        setStatus(describeStartupError(error));
        heardText.textContent = String(error?.message || error?.name || error);
      })
      .finally(() => {
        handsFrameBusy = false;
      });
  }

  gestureAnimationId = window.requestAnimationFrame(runGestureLoop);
}

async function startHandControl() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus("Camera unavailable");
    return;
  }

  try {
    await loadHandLandmarker();
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user"
      },
      audio: false
    });
    cameraVideo.srcObject = cameraStream;
    await cameraVideo.play();
    handModeOn = true;
    handBtn.textContent = "Stop Hand Control";
    handBtn.classList.add("listening");
    cameraVideo.classList.add("active");
    handReadout.textContent = "Searching";
    setStatus("Hand control online");
    runGestureLoop();
  } catch (error) {
    handModeOn = false;
    handReadout.textContent = "Off";
    setStatus(describeStartupError(error));
    heardText.textContent = String(error?.message || error?.name || error || "unknown startup error");
    console.warn("Hand control startup failed", error);
  }
}

function stopHandControl() {
  handModeOn = false;
  window.cancelAnimationFrame(gestureAnimationId);
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
  setStatus("Hand control offline");
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
  activeTool = tool;
  toolButtons.forEach((button) => button.classList.toggle("active", button.dataset.tool === tool));
  toolReadout.textContent = tool.charAt(0).toUpperCase() + tool.slice(1);
  setStatus(`${toolReadout.textContent} online`);
}

function selectColor(color) {
  activeColor = color;
  swatches.forEach((button) => button.classList.toggle("active", button.dataset.color === color));
  setStatus("Color updated");
}

function clearDrawing() {
  const rect = drawCanvas.getBoundingClientRect();
  drawCtx.clearRect(0, 0, rect.width, rect.height);
  clearPreview();
  setStatus("Overlay cleared");
}

async function startCapture() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    setStatus("Screen capture unavailable");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "window"
      },
      audio: false
    });
    sourceVideo.srcObject = stream;
    emptyState.classList.add("hidden");
    setStatus("Source connected");

    const [track] = stream.getVideoTracks();
    track.addEventListener("ended", () => {
      emptyState.classList.remove("hidden");
      setStatus("Source disconnected");
    });
  } catch (error) {
    setStatus("Source selection cancelled");
  }
}

function handlePointerDown(event) {
  pointerDown = true;
  startPoint = canvasPoint(event);
  lastPoint = startPoint;
  previewCanvas.setPointerCapture?.(event.pointerId);

  if (activeTool === "eraser") eraseAt(startPoint);
}

function handlePointerMove(event) {
  if (!pointerDown) return;
  const point = canvasPoint(event);

  if (activeTool === "pen" && lastPoint) {
    drawLine(drawCtx, lastPoint, point);
  } else if (activeTool === "eraser") {
    eraseAt(point);
  } else {
    previewShape(point);
  }

  lastPoint = point;
}

function handlePointerUp(event) {
  if (!pointerDown) return;
  const point = canvasPoint(event);
  if (["arrow", "circle", "spotlight"].includes(activeTool)) {
    commitShape(point);
  }
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
    ["white", "#ffffff"]
  ];

  if (text.includes("clear")) {
    clearDrawing();
    return;
  }

  for (const [word, color] of colorMap) {
    if (text.includes(word)) {
      selectColor(color);
    }
  }

  if (text.includes("arrow")) {
    selectTool("arrow");
    drawCommandShape("arrow");
    return;
  }

  if (text.includes("circle")) {
    selectTool("circle");
    drawCommandShape("circle");
    return;
  }

  if (text.includes("spotlight") || text.includes("highlight")) {
    selectTool("spotlight");
    drawCommandShape("spotlight");
    return;
  }

  if (text.includes("erase") || text.includes("eraser")) {
    selectTool("eraser");
    eraseCommandArea();
    return;
  }

  if (text.includes("stop drawing")) {
    selectTool("pen");
    setStatus("Drawing paused");
    return;
  }

  if (text.includes("draw") || text.includes("pen")) {
    selectTool("pen");
    setStatus("Pen ready");
    return;
  }

  setStatus("Command not mapped");
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

    if (result.isFinal) {
      applyVoiceCommand(latest);
    }
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

function setPanelCollapsed(collapsed) {
  document.querySelector(".shell").classList.toggle("panel-collapsed", collapsed);
  window.setTimeout(resizeCanvases, 180);
}

captureBtn.addEventListener("click", startCapture);
handBtn.addEventListener("click", () => (handModeOn ? stopHandControl() : startHandControl()));
voiceBtn.addEventListener("click", () => (voiceOn ? stopVoice() : startVoice()));
clearBtn.addEventListener("click", clearDrawing);
collapseBtn.addEventListener("click", () => setPanelCollapsed(true));
expandBtn.addEventListener("click", () => setPanelCollapsed(false));
commandBtn.addEventListener("click", runTypedCommand);
commandInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") runTypedCommand();
});
mirrorInput.addEventListener("change", () => setMirrorMovement(mirrorInput.checked));
[pinchInput, smoothingInput, drawDelayInput, deadZoneInput].forEach((input) => {
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
selectTool("pen");
setMirrorMovement(true);
updateGestureSettings();
