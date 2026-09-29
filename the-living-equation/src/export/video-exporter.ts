import type { AppState, TheoremDefinition, VisualDerivatives } from '../types';
import { drawExportOverlay } from './export-overlay';
import { buildFibonacciGeometry, type GeometryPoint } from '../visual/fibonacci-geometry';

export interface ExportResult { status: 'downloaded' | 'unsupported' | 'failed'; filename?: string; message: string; }

export async function exportStudyClip({ theorem, state, derivatives, durationMs = 10000, includeAudio = false }: { theorem: TheoremDefinition; state: AppState; derivatives: VisualDerivatives; durationMs?: number; includeAudio?: boolean }): Promise<ExportResult> {
  if (!('MediaRecorder' in window) || !HTMLCanvasElement.prototype.captureStream) return { status: 'unsupported', message: 'This browser cannot record a study clip. The live observatory remains available.' };
  const duration = Math.min(20000, Math.max(10000, durationMs));
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1920; const context = canvas.getContext('2d');
  if (!context) return { status: 'failed', message: 'The export canvas could not be created.' };
  const stream = canvas.captureStream(30); const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
  if (!mimeType) return { status: 'unsupported', message: 'This browser does not expose a supported WebM encoder.' };
  const recorder = new MediaRecorder(stream, { mimeType }); const chunks: Blob[] = []; recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
  const start = performance.now();
  const draw = (time: number) => { const progress = Math.min(1, (time - start) / duration); drawFrame(context, theorem, state.parameters, derivatives, progress, progress > .88); if (progress < 1) requestAnimationFrame(draw); else recorder.stop(); };
  const complete = new Promise<ExportResult>(resolve => { recorder.onstop = () => { const blob = new Blob(chunks, { type: mimeType }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `living-equation-${theorem.id}.webm`; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); resolve({ status: 'downloaded', filename: anchor.download, message: includeAudio ? 'Study clip downloaded. Audio is not embedded in this MVP export.' : 'Study clip downloaded.' }); }; recorder.onerror = () => resolve({ status: 'failed', message: 'The browser stopped the recording before it completed.' }); });
  recorder.start(); requestAnimationFrame(draw); return complete;
}

function drawFrame(context: CanvasRenderingContext2D, theorem: TheoremDefinition, values: Record<string, number>, derivatives: VisualDerivatives, progress: number, finalFrame: boolean): void {
  const width = context.canvas.width; const height = context.canvas.height; context.fillStyle = '#080808'; context.fillRect(0, 0, width, height);
  const centerX = width / 2; const centerY = height * .42; context.save(); context.translate(centerX, centerY); context.rotate(progress * derivatives.motionSpeed * .6);
  if (derivatives.sceneKind === 'fibonacci') drawFibonacciFrame(context, derivatives, width, progress);
  else drawGenericFrame(context, derivatives, width);
  context.restore();
  drawExportOverlay(context, theorem, values, width, height, finalFrame);
}

function drawFibonacciFrame(context: CanvasRenderingContext2D, derivatives: VisualDerivatives, width: number, progress: number): void {
  const geometry = buildFibonacciGeometry(derivatives, 520);
  const scale = width * .115;
  context.scale(scale, -scale);
  context.lineCap = 'round'; context.lineJoin = 'round';
  geometry.filaments.forEach(filament => drawExportLine(context, [animatePoint(filament.start, progress), animatePoint(filament.end, progress)], 'rgba(229,225,217,.14)', .012));
  geometry.ribbons.forEach(ribbon => {
    drawExportLine(context, ribbon.points.map(point => animatePoint(point, progress)), 'rgba(241,238,233,.08)', ribbon.width * .9);
    drawExportLine(context, ribbon.points.map(point => animatePoint(point, progress)), 'rgba(241,238,233,.18)', ribbon.width * .42);
  });
  geometry.field.forEach((point, index) => {
    const animated = animatePoint(point, progress, index);
    context.fillStyle = `rgba(241,238,233,${point.alpha})`;
    context.beginPath(); context.arc(animated.x, animated.y, point.size * 1.8, 0, Math.PI * 2); context.fill();
  });
  geometry.guides.forEach(guide => drawExportLine(context, [guide.start, guide.end], 'rgba(119,115,108,.26)', .008));
  geometry.squares.forEach(square => {
    const points = [...square.corners, square.corners[0]];
    drawExportLine(context, points, 'rgba(241,238,233,.02)', .052);
    drawExportLine(context, points, `rgba(188,184,176,${square.opacity * .36})`, .018);
  });
  geometry.arcs.forEach(arc => {
    drawExportLine(context, arc.points, 'rgba(241,238,233,.035)', .08);
    drawExportLine(context, arc.points, `rgba(241,238,233,${arc.opacity * .42})`, .024);
  });
  drawExportLine(context, geometry.spiral, 'rgba(241,238,233,.02)', .09);
  drawExportLine(context, geometry.spiral, 'rgba(241,238,233,.06)', .026);
  context.fillStyle = 'rgba(201,196,187,.38)';
  geometry.dust.forEach(point => { context.beginPath(); context.arc(point.x, point.y, .014, 0, Math.PI * 2); context.fill(); });
  geometry.nodes.forEach(node => {
    context.fillStyle = 'rgba(201,196,187,.16)'; context.beginPath(); context.arc(node.point.x, node.point.y, node.size * 2.8, 0, Math.PI * 2); context.fill();
    context.fillStyle = `rgba(241,238,233,${node.opacity})`; context.beginPath(); context.arc(node.point.x, node.point.y, node.size, 0, Math.PI * 2); context.fill();
  });
}

function animatePoint(point: GeometryPoint, progress: number, index = 0): GeometryPoint {
  const phase = progress * Math.PI * 2;
  const local = Math.sin(phase * (.7 + (index % 7) * .035) + index * .21);
  return { ...point, x: point.x + Math.cos(phase + index * .1) * (.018 + local * .012), y: point.y + Math.sin(phase * .9 + index * .13) * (.018 + local * .012) };
}

function drawGenericFrame(context: CanvasRenderingContext2D, derivatives: VisualDerivatives, width: number): void {
  context.strokeStyle = 'rgba(241,238,233,.86)'; context.lineWidth = 3; context.beginPath();
  const count = 260; for (let index = 0; index <= count; index += 1) { const t = index / count; const theta = t * Math.PI * 2 * derivatives.frequency; const radius = width * (.035 + Math.exp(t * derivatives.growth * 7) * .11); const x = Math.cos(theta) * radius; const y = Math.sin(theta) * radius; if (index === 0) context.moveTo(x, y); else context.lineTo(x, y); } context.stroke();
  context.fillStyle = 'rgba(241,238,233,.74)'; for (let index = 0; index < 180; index += 1) { const t = index / 180; const theta = t * Math.PI * 2 * derivatives.frequency; const radius = width * (.035 + Math.exp(t * derivatives.growth * 7) * .11); context.beginPath(); context.arc(Math.cos(theta) * radius, Math.sin(theta) * radius, 3, 0, Math.PI * 2); context.fill(); }
}

function drawExportLine(context: CanvasRenderingContext2D, points: GeometryPoint[], stroke: string, lineWidth: number): void {
  context.strokeStyle = stroke; context.lineWidth = lineWidth; context.beginPath();
  points.forEach((point, index) => { if (index === 0) context.moveTo(point.x, point.y); else context.lineTo(point.x, point.y); });
  context.stroke();
}
