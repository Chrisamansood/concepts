import type { VisualDerivatives } from '../types';

export interface GeometryPoint {
  x: number;
  y: number;
  z: number;
}

export interface FibonacciSquare {
  index: number;
  side: number;
  corners: GeometryPoint[];
  z: number;
  opacity: number;
}

export interface FibonacciArc {
  index: number;
  points: GeometryPoint[];
  z: number;
  opacity: number;
}

export interface FibonacciNode {
  index: number;
  point: GeometryPoint;
  size: number;
  opacity: number;
}

export interface FibonacciGuide {
  start: GeometryPoint;
  end: GeometryPoint;
  opacity: number;
}

export interface FibonacciFieldPoint extends GeometryPoint {
  alpha: number;
  size: number;
  seed: number;
  step: number;
}

export interface FibonacciFilament {
  start: FibonacciFieldPoint;
  end: FibonacciFieldPoint;
  opacity: number;
}

export interface FibonacciRibbon {
  points: GeometryPoint[];
  opacity: number;
  width: number;
}

export interface FibonacciGeometry {
  squares: FibonacciSquare[];
  arcs: FibonacciArc[];
  spiral: GeometryPoint[];
  nodes: FibonacciNode[];
  guides: FibonacciGuide[];
  dust: GeometryPoint[];
  field: FibonacciFieldPoint[];
  filaments: FibonacciFilament[];
  ribbons: FibonacciRibbon[];
}

const GOLDEN_RATIO = 1.61803398875;

/** Builds one deterministic construction model for WebGL, SVG, and export. */
export function buildFibonacciGeometry(derivatives: VisualDerivatives, budget: number): FibonacciGeometry {
  const count = Math.max(2, Math.min(20, Math.round(derivatives.squareCount || derivatives.sequenceLength)));
  const ratioBias = clamp(derivatives.ratioBias || derivatives.phi / GOLDEN_RATIO, .86, 1.14);
  const sideLengths = fibonacciLengths(count).map((value, index) => value * Math.pow(ratioBias, index * .36));
  const placements = placeSquares(sideLengths);
  const bounds = placements.reduce((current, square) => ({
    minX: Math.min(current.minX, square.x),
    minY: Math.min(current.minY, square.y),
    maxX: Math.max(current.maxX, square.x + square.side),
    maxY: Math.max(current.maxY, square.y + square.side),
  }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const scale = 4.85 / Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  const turns = clamp(derivatives.spiralTurns || derivatives.frequency, 1.8, 3.4);
  const sweep = Math.PI / 2 * clamp(turns / 2.6, .72, 1.28);

  const squares: FibonacciSquare[] = [];
  const arcs: FibonacciArc[] = [];
  const nodes: FibonacciNode[] = [];
  const guides: FibonacciGuide[] = [];
  const rawDust: GeometryPoint[] = [];

  placements.forEach((placement, index) => {
    const squareZ = (index - count / 2) * .035;
    const corners = [
      { x: placement.x, y: placement.y, z: squareZ },
      { x: placement.x + placement.side, y: placement.y, z: squareZ },
      { x: placement.x + placement.side, y: placement.y + placement.side, z: squareZ },
      { x: placement.x, y: placement.y + placement.side, z: squareZ },
    ].map(point => normalizePoint(point, centerX, centerY, scale));
    squares.push({ index, side: placement.side * scale, corners, z: squareZ, opacity: .13 + (count - index) / count * .24 });

    const arcCenter = arcCenterFor(placement, index);
    const arcPoints: GeometryPoint[] = [];
    const samples = 36;
    for (let step = 0; step <= samples; step += 1) {
      const angle = arcCenter.startAngle + sweep * (step / samples);
      arcPoints.push(normalizePoint({
        x: arcCenter.x + Math.cos(angle) * placement.side,
        y: arcCenter.y + Math.sin(angle) * placement.side,
        z: squareZ + .012,
      }, centerX, centerY, scale));
    }
    const arcOpacity = .34 + index / count * .58;
    arcs.push({ index, points: arcPoints, z: squareZ + .012, opacity: arcOpacity });
    nodes.push({ index, point: arcPoints[Math.floor(arcPoints.length * .56)], size: .035 + index / count * .032, opacity: .46 + index / count * .5 });

    const midpoint = normalizePoint({
      x: placement.x + placement.side / 2,
      y: placement.y + placement.side / 2,
      z: squareZ - .01,
    }, centerX, centerY, scale);
    guides.push({ start: { x: 0, y: 0, z: -.12 }, end: midpoint, opacity: .055 + (count - index) / count * .12 });

    const dustCount = Math.max(4, Math.round((budget / count) * .5));
    for (let dustIndex = 0; dustIndex < dustCount; dustIndex += 1) {
      const phase = hash(index * 97 + dustIndex * 13 + derivatives.seed);
      const t = hash(index * 31 + dustIndex * 7 + derivatives.seed + 9);
      const edge = Math.floor(phase * 4);
      const along = t * placement.side;
      const inset = (.08 + hash(index * 61 + dustIndex * 17) * .18) * Math.max(placement.side, .1);
      const point = edge === 0
        ? { x: placement.x + along, y: placement.y + inset, z: squareZ + .025 }
        : edge === 1
          ? { x: placement.x + placement.side - inset, y: placement.y + along, z: squareZ + .025 }
          : edge === 2
            ? { x: placement.x + along, y: placement.y + placement.side - inset, z: squareZ + .025 }
            : { x: placement.x + inset, y: placement.y + along, z: squareZ + .025 };
      rawDust.push(normalizePoint(point, centerX, centerY, scale));
    }
  });

  const spiral = buildHeroSpiral(derivatives, turns);
  const field = buildParticleField(derivatives, budget);
  const filaments = buildFilaments(field);
  const ribbons = buildRibbons(derivatives);
  return {
    squares, arcs, spiral, nodes, guides,
    dust: rawDust.slice(0, Math.max(0, Math.min(budget, rawDust.length))),
    field, filaments, ribbons,
  };
}

function buildParticleField(derivatives: VisualDerivatives, budget: number): FibonacciFieldPoint[] {
  const count = Math.max(64, Math.min(Math.max(64, budget), Math.round(600 + derivatives.fieldLayers * 18)));
  const field: FibonacciFieldPoint[] = [];
  const ratio = clamp(derivatives.phi || GOLDEN_RATIO, 1.4, 1.8);
  const ratioScale = clamp(ratio / GOLDEN_RATIO, .86, 1.14);
  for (let index = 0; index < count; index += 1) {
    const lobe = index % 2 === 0 ? -1 : 1;
    const localIndex = Math.floor(index / 2);
    const localCount = Math.ceil(count / 2);
    const t = localIndex / Math.max(1, localCount - 1);
    const band = localIndex % Math.max(1, derivatives.fieldLayers);
    const bandProgress = (band + .5) / Math.max(1, derivatives.fieldLayers);
    const seeded = hash(index * 17.71 + derivatives.seed * 1.31);
    const seeded2 = hash(index * 31.17 + derivatives.seed * 2.07 + 9);
    const phase = t * Math.PI * 2 * derivatives.flowFrequency + bandProgress * Math.PI * 2 + seeded * .8;
    const growth = Math.pow(ratioScale, bandProgress * 4.2);
    const envelope = .08 + Math.sin(t * Math.PI) * (.3 + bandProgress * .16);
    const radius = (.11 + Math.pow(Math.sin(t * Math.PI), .7) * .52) * growth;
    const wobble = Math.sin(phase * 1.7 + seeded2 * 5) * (.04 + envelope * .08);
    const x = lobe * (.64 + Math.sin(t * Math.PI) * .1) + Math.cos(phase) * radius * .78 + wobble;
    const y = (t - .5) * 1.9 + Math.sin(phase * .92 + lobe * .28) * radius * .62 + (seeded - .5) * .06;
    const z = Math.cos(phase * .7 + seeded2 * 4) * (.07 + envelope * .1) + (bandProgress - .5) * .22;
    field.push({
      x, y, z,
      alpha: .36 + Math.sin(t * Math.PI) * .28 + seeded * .28,
      size: .018 + Math.sin(t * Math.PI) * .018 + seeded2 * .012,
      seed: seeded,
      step: Math.min(derivatives.sequenceLength - 1, Math.floor(t * derivatives.sequenceLength)),
    });
  }
  return field;
}

function buildFilaments(field: FibonacciFieldPoint[]): FibonacciFilament[] {
  const filaments: FibonacciFilament[] = [];
  for (let index = 0; index + 2 < field.length; index += 2) {
    const start = field[index]; const end = field[index + 2];
    filaments.push({ start, end, opacity: .08 + ((index / Math.max(1, field.length)) * .14) });
  }
  return filaments;
}

function buildRibbons(derivatives: VisualDerivatives): FibonacciRibbon[] {
  const ribbons: FibonacciRibbon[] = [];
  for (let ribbonIndex = 0; ribbonIndex < 4; ribbonIndex += 1) {
    const points: GeometryPoint[] = [];
    const lobe = ribbonIndex % 2 === 0 ? -1 : 1;
    const band = (ribbonIndex + .5) / 4;
    for (let index = 0; index <= 120; index += 1) {
      const t = index / 120;
      const phase = t * Math.PI * 2 * (derivatives.flowFrequency * .72) + band * Math.PI * 2;
      const radius = .1 + Math.sin(t * Math.PI) * (.42 + band * .1);
      points.push({
        x: lobe * (.64 + Math.sin(t * Math.PI) * .1) + Math.cos(phase) * radius * .75,
        y: (t - .5) * 1.9 + Math.sin(phase * .94) * radius * .64,
        z: Math.sin(phase * .55 + ribbonIndex) * .09 + (band - .5) * .04,
      });
    }
    ribbons.push({ points, opacity: .14 + ribbonIndex * .02, width: .026 + ribbonIndex * .004 });
  }
  return ribbons;
}

function buildHeroSpiral(derivatives: VisualDerivatives, turns: number): GeometryPoint[] {
  const points: GeometryPoint[] = [];
  const ratio = clamp(derivatives.phi || GOLDEN_RATIO, 1.4, 1.8);
  const endpoint = 2.25 * clamp(ratio / GOLDEN_RATIO, .86, 1.14);
  const totalAngle = turns * Math.PI * 2;
  for (let index = 0; index <= 260; index += 1) {
    const t = index / 260;
    const angle = -Math.PI / 2 + t * totalAngle;
    const radius = .08 * Math.exp(t * Math.log(endpoint / .08));
    points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: .11 + Math.sin(t * Math.PI) * .025 });
  }
  return points;
}

function fibonacciLengths(count: number): number[] {
  const values = [1, 1];
  while (values.length < count) values.push(values[values.length - 1] + values[values.length - 2]);
  return values.slice(0, count);
}

interface Placement { x: number; y: number; side: number; }

function placeSquares(sides: number[]): Placement[] {
  const placements: Placement[] = [
    { x: 0, y: 0, side: sides[0] },
    { x: sides[0], y: 0, side: sides[1] },
  ];
  let minX = 0; let minY = 0; let maxX = sides[0] + sides[1]; let maxY = sides[0];
  for (let index = 2; index < sides.length; index += 1) {
    const side = sides[index];
    const direction = index % 4;
    const placement = direction === 2
      ? { x: minX, y: maxY, side }
      : direction === 3
        ? { x: minX - side, y: minY, side }
        : direction === 0
          ? { x: minX, y: minY - side, side }
          : { x: maxX, y: minY, side };
    placements.push(placement);
    minX = Math.min(minX, placement.x); minY = Math.min(minY, placement.y);
    maxX = Math.max(maxX, placement.x + side); maxY = Math.max(maxY, placement.y + side);
  }
  return placements;
}

function arcCenterFor(placement: Placement, index: number): { x: number; y: number; startAngle: number } {
  switch (index % 4) {
    case 0: return { x: placement.x, y: placement.y, startAngle: 0 };
    case 1: return { x: placement.x + placement.side, y: placement.y, startAngle: Math.PI / 2 };
    case 2: return { x: placement.x + placement.side, y: placement.y + placement.side, startAngle: Math.PI };
    default: return { x: placement.x, y: placement.y + placement.side, startAngle: Math.PI * 1.5 };
  }
}

function normalizePoint(point: GeometryPoint, centerX: number, centerY: number, scale: number): GeometryPoint {
  return { x: (point.x - centerX) * scale, y: (point.y - centerY) * scale, z: point.z };
}

function hash(value: number): number {
  const result = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
  return result - Math.floor(result);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
