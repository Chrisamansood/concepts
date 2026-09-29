import type { QualityMode } from '../types';

export interface QualityProfile {
  particleBudget: number;
  pixelRatio: number;
  label: string;
}

const profiles: Record<Exclude<QualityMode, 'auto'>, QualityProfile> = {
  high: { particleBudget: 820, pixelRatio: 2, label: 'HIGH' },
  medium: { particleBudget: 540, pixelRatio: 1.5, label: 'MEDIUM' },
  low: { particleBudget: 280, pixelRatio: 1, label: 'LOW' },
};

export function resolveQuality(mode: QualityMode): QualityProfile {
  if (mode !== 'auto') return profiles[mode];
  const narrow = window.matchMedia('(max-width: 760px)').matches;
  const slow = Boolean((navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection?.saveData)
    || /2g/.test((navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType ?? '');
  if (slow) return profiles.low;
  if (narrow) return profiles.medium;
  return profiles.high;
}
