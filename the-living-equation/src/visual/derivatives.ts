import type { ParameterValues, QualityMode, VisualDerivatives } from '../types';
import { resolveQuality } from './quality';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function fibonacciDerivatives(values: ParameterValues, quality: QualityMode): VisualDerivatives {
  const ratio = clamp(values.ratio ?? 1.618, 1.4, 1.8);
  const terms = Math.round(clamp(values.terms ?? 14, 8, 20));
  const turns = clamp(values.turns ?? 2.6, 1.8, 3.4);
  const profile = resolveQuality(quality);
  const deviation = Math.abs(ratio - 1.61803398875);
  return {
    theoremId: 'fibonacci', sceneKind: 'fibonacci', seed: 3141,
    phi: ratio, sequenceLength: terms, growth: 0.11 + (ratio - 1.4) * 0.13,
    lineWidth: 1 + (1 - Math.min(deviation * 3, 1)) * 0.8,
    particleCount: Math.min(profile.particleBudget, 150 + terms * 28),
    motionSpeed: 0.05 + (1 - Math.min(deviation * 4, 1)) * 0.15,
    cameraDrift: turns * 0.12, amplitude: 1, frequency: turns, phase: 0,
    componentCount: terms, orbitRadius: 1, orbitSpeed: 0.1, chaos: deviation,
    squareCount: terms, spiralTurns: turns, ratioBias: ratio / 1.61803398875,
    parameters: { ...values, ratio, terms, turns },
    fieldLayers: Math.round(clamp(terms * .72, 6, 14)),
    flowFrequency: clamp(turns * .82 + (ratio - 1.61803398875) * 1.6, 1.25, 3.25),
  };
}

export function genericDerivatives(
  theoremId: string,
  sceneKind: VisualDerivatives['sceneKind'],
  values: ParameterValues,
  quality: QualityMode,
): VisualDerivatives {
  const profile = resolveQuality(quality);
  const amplitude = clamp(values.amplitude ?? 1, 0.2, 1.8);
  const frequency = clamp(values.frequency ?? 1, 0.4, 3.5);
  const phase = clamp(values.phase ?? 0, -Math.PI, Math.PI);
  const componentCount = Math.round(clamp(values.components ?? 5, 2, 10));
  const distance = clamp(values.distance ?? 2, 1, 4);
  const velocity = clamp(values.velocity ?? 1, 0.5, 1.8);
  const rho = clamp(values.rho ?? 28, 18, 40);
  return {
    theoremId, sceneKind, seed: theoremId.length * 613 + 17,
    phi: 1.618, sequenceLength: componentCount, growth: .12,
    lineWidth: 1.2, particleCount: Math.min(profile.particleBudget, 220 + componentCount * 32),
    motionSpeed: .05 + Math.abs(velocity) * .08, cameraDrift: distance * .08,
    amplitude, frequency, phase, componentCount,
    orbitRadius: distance, orbitSpeed: velocity, chaos: (rho - 18) / 22,
    squareCount: componentCount, spiralTurns: frequency, ratioBias: 1,
    fieldLayers: componentCount, flowFrequency: frequency,
    parameters: { ...values, amplitude, frequency, phase, components: componentCount, distance, velocity, rho },
  };
}

export function audioDerivatives(values: ParameterValues): { harmonicBrightness: number; pulseRate: number; spatialWidth: number; tonalDensity: number } {
  const ratio = clamp(values.ratio ?? 1.618, 1.4, 1.8);
  const deviation = Math.abs(ratio - 1.61803398875);
  const terms = clamp(values.terms ?? values.components ?? 5, 2, 20);
  return {
    harmonicBrightness: clamp(0.25 + (1 - deviation * 3) * 0.5, 0.15, 0.8),
    pulseRate: clamp(0.08 + terms / 70, 0.08, 0.38),
    spatialWidth: clamp(0.25 + terms / 28, 0.2, 0.9),
    tonalDensity: clamp(0.12 + terms / 32, 0.12, 0.75),
  };
}
