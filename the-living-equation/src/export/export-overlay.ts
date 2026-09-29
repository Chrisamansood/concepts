import type { TheoremDefinition } from '../types';

export function drawExportOverlay(context: CanvasRenderingContext2D, theorem: TheoremDefinition, values: Record<string, number>, width: number, height: number, finalFrame = false): void {
  const margin = width * .09;
  context.fillStyle = '#f1eee9'; context.font = `500 ${Math.round(width * .019)}px monospace`; context.fillText('THE LIVING EQUATION / STUDY CLIP', margin, margin * .9);
  context.font = `${Math.round(width * .054)}px Georgia`; context.fillText(theorem.title, margin, height * .78);
  context.font = `${Math.round(width * .026)}px Georgia`; context.fillStyle = '#c0bcb5'; context.fillText(theorem.equation, margin, height * .83);
  const valueLine = theorem.parameters.map(parameter => `${parameter.symbol} ${parameter.format(values[parameter.id])}`).join('   ');
  context.font = `${Math.round(width * .018)}px monospace`; context.fillStyle = '#96928b'; context.fillText(valueLine, margin, height * .875);
  if (finalFrame) { context.fillStyle = '#f1eee9'; context.font = `${Math.round(width * .022)}px monospace`; context.fillText(theorem.content.insight, margin, height * .93); }
}
