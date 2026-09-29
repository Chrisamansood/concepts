import type { ParameterDefinition, ParameterValues, TheoremDefinition } from '../types';
import { audioDerivatives, fibonacciDerivatives, genericDerivatives } from '../visual/derivatives';

const fixed = (value: number, digits = 3) => value.toFixed(digits);
const fibonacciParameters: ParameterDefinition[] = [
  { id: 'ratio', label: 'Ratio', symbol: 'r', min: 1.4, max: 1.8, step: .001, default: 1.618, format: value => fixed(value, 3), help: 'The ratio between neighbouring terms.' },
  { id: 'terms', label: 'Terms', symbol: 'n', min: 8, max: 20, step: 1, default: 14, format: value => `${Math.round(value)}`, help: 'How many sequence steps shape the field.' },
  { id: 'turns', label: 'Turns', symbol: 'θ', min: 1.8, max: 3.4, step: .1, default: 2.6, format: value => fixed(value, 1), help: 'The visible sweep of the spiral.' },
];

const common = {
  content: {
    simple: 'The Fibonacci sequence begins with 0 and 1. Each new number is the sum of the two before it. As the sequence grows, the ratio between neighbours settles toward one special number: the Golden Ratio.',
    precise: 'For Fₙ = Fₙ₋₁ + Fₙ₋₂, the quotient Fₙ₊₁ / Fₙ approaches φ = (1 + √5) / 2 ≈ 1.6180339887. The approach is not exact at finite n; it is a limit.',
    change: 'Replay the construction to watch each recurrence add a new square, arc, and layer. Move the ratio away from φ or add terms to change the resulting field. The visual is not claiming that every spiral in nature is “golden”; it is showing how a recurrence creates a stable proportion.',
    matters: 'It is a compact lesson in emergence: a local rule, repeated many times, can create a global shape that feels inevitable.',
    limitations: ['The construction and field are a deterministic visual model, not a proof of the recurrence.', 'The ratio control lets you explore nearby growth laws, even though only the limiting value is the Golden Ratio.', 'No claim is made that natural forms universally follow φ.'],
    deeper: 'The Golden Ratio is the positive solution of φ² = φ + 1. That same self-similarity is why a spiral built from successive proportional turns can preserve its character as it grows.',
    insight: 'At φ, each turn grows by the same proportion. The spiral changes scale, but not its underlying relationship.',
  },
};

function generic(
  id: string, index: string, title: string, meta: string, question: string, equation: string,
  sceneKind: TheoremDefinition['sceneKind'], parameters: ParameterDefinition[], content: TheoremDefinition['content'],
): TheoremDefinition {
  return { id, index, title, meta, question, equation, sceneKind, parameters, content,
    deriveVisuals: (values, quality) => genericDerivatives(id, sceneKind, values, quality),
    deriveAudio: values => audioDerivatives(values),
  };
}

export const theorems: TheoremDefinition[] = [
  { id: 'fibonacci', index: '01', title: 'Fibonacci and the Golden Ratio', meta: 'GROWTH / LIMITS', question: 'How can a simple recurrence make a proportion appear?', equation: 'Fₙ = Fₙ₋₁ + Fₙ₋₂   ·   φ = (1 + √5) / 2 ≈ 1.618', sceneKind: 'fibonacci', parameters: fibonacciParameters, ...common,
    deriveVisuals: (values, quality) => fibonacciDerivatives(values, quality), deriveAudio: values => audioDerivatives(values) },
  generic('pythagorean', '02', 'Pythagorean Theorem', 'GEOMETRY / AREA', 'Why does a right angle make three lengths agree?', 'a² + b² = c²', 'pythagorean', [
    { id: 'a', label: 'Side a', symbol: 'a', min: 1, max: 4, step: .1, default: 2.4, format: value => fixed(value, 1), help: 'One leg of the right triangle.' },
    { id: 'b', label: 'Side b', symbol: 'b', min: 1, max: 4, step: .1, default: 1.8, format: value => fixed(value, 1), help: 'The other leg of the right triangle.' },
  ], { simple: 'In a right triangle, the square built on the longest side has the same area as the two squares built on the shorter sides together.', precise: 'For a right triangle with perpendicular sides a and b and hypotenuse c, a² + b² = c².', change: 'Change either leg and the hypotenuse responds as the diagonal of the new triangle.', matters: 'It connects shape, distance, and area in one relationship used everywhere from construction to navigation.', limitations: ['The theorem applies to right triangles in flat Euclidean geometry.'], deeper: 'The equation is an area statement: the squares are not decorative; their areas are exactly what add.', insight: 'The diagonal is constrained by the two perpendicular directions.', }),
  generic('wave', '03', 'Wave Interference', 'MOTION / SUPERPOSITION', 'What happens when two rhythms share the same space?', 'y = y₁ + y₂', 'wave', [
    { id: 'amplitude', label: 'Amplitude', symbol: 'A', min: .2, max: 1.8, step: .1, default: 1, format: value => fixed(value, 1), help: 'Height of each wave.' },
    { id: 'frequency', label: 'Frequency', symbol: 'f', min: .4, max: 3.5, step: .1, default: 1.3, format: value => fixed(value, 1), help: 'How quickly the wave repeats.' },
    { id: 'phase', label: 'Phase', symbol: 'φ', min: -3.14, max: 3.14, step: .1, default: 0, format: value => fixed(value, 1), help: 'The offset between the waves.' },
  ], { simple: 'When waves overlap, their displacements add. Peaks can reinforce one another, while a peak and a trough can cancel.', precise: 'The resulting displacement is the pointwise sum y(x,t) = y₁(x,t) + y₂(x,t).', change: 'Amplitude changes the height, frequency changes the spacing, and phase changes where reinforcement and cancellation occur.', matters: 'Superposition explains sound, light, ripples, and the way complex signals can be understood as combinations.', limitations: ['This field uses ideal sinusoidal waves without dissipation or boundaries.'], deeper: 'Interference is not a collision between objects; it is the arithmetic of simultaneous displacements.', insight: 'The shape you see is the equation adding two moving possibilities together.', }),
  generic('fourier', '04', 'Fourier Decomposition', 'SIGNALS / SUMS', 'Can a complicated shape be rebuilt from simple waves?', 'f(t) = Σ Aₖ sin(kωt + φₖ)', 'fourier', [
    { id: 'components', label: 'Components', symbol: 'k', min: 2, max: 10, step: 1, default: 5, format: value => `${Math.round(value)}`, help: 'How many harmonics build the signal.' },
    { id: 'amplitude', label: 'Amplitude', symbol: 'A', min: .2, max: 1.8, step: .1, default: 1, format: value => fixed(value, 1), help: 'Overall signal height.' },
  ], { simple: 'Fourier’s idea is that a complex repeating signal can be described as a sum of simple waves.', precise: 'A Fourier series represents a periodic function as weighted sine and cosine components at integer multiples of a base frequency.', change: 'More components let the sum trace sharper changes. The visual becomes less like one wave and more like a constructed signal.', matters: 'The same idea powers audio analysis, image compression, and the language of frequency.', limitations: ['This is a small finite sum, not an exact decomposition of every possible signal.'], deeper: 'The basis waves act like coordinates: they give another way to describe the same object.', insight: 'Complexity can be assembled from a vocabulary of simple oscillations.', }),
  generic('orbit', '05', 'Gravity and Orbits', 'FORCE / PATHS', 'When does falling become an orbit?', 'F = Gm₁m₂ / r²', 'orbit', [
    { id: 'distance', label: 'Distance', symbol: 'r', min: 1, max: 4, step: .1, default: 2.2, format: value => fixed(value, 1), help: 'Distance from the central body.' },
    { id: 'velocity', label: 'Velocity', symbol: 'v', min: .5, max: 1.8, step: .1, default: 1, format: value => fixed(value, 1), help: 'Tangential starting velocity.' },
  ], { simple: 'An orbit is continuous falling: gravity bends a moving body’s path so it keeps missing the thing it is falling toward.', precise: 'Newton’s inverse-square law describes the gravitational force between masses. Stable paths depend on position and velocity together.', change: 'Distance changes the scale of the path; velocity changes whether the path closes, escapes, or falls inward.', matters: 'Orbital thinking links a local force to large-scale motion, from moons to satellites.', limitations: ['This is an idealized two-body sketch; real systems have more bodies, perturbations, and relativistic effects.'], deeper: 'The apparent stillness of an orbit is a balance of continual acceleration and forward motion.', insight: 'An orbit is not the absence of falling. It is falling with enough sideways motion.', }),
  generic('lorenz', '06', 'Lorenz Chaos', 'SYSTEMS / SENSITIVITY', 'How can deterministic rules make a path that never repeats?', 'dx/dt = σ(y − x)', 'lorenz', [
    { id: 'rho', label: 'ρ / forcing', symbol: 'ρ', min: 18, max: 40, step: 1, default: 28, format: value => `${Math.round(value)}`, help: 'A control on convection strength.' },
    { id: 'sigma', label: 'σ / coupling', symbol: 'σ', min: 4, max: 16, step: 1, default: 10, format: value => `${Math.round(value)}`, help: 'How quickly the dimensions exchange influence.' },
  ], { simple: 'Chaos does not mean no rules. It means small differences can grow until long-term prediction becomes difficult.', precise: 'The Lorenz system is a set of coupled nonlinear differential equations. Its trajectories are deterministic but highly sensitive to initial conditions.', change: 'Move ρ or σ and the attractor’s folds and density change. The visual traces one bounded numerical approximation.', matters: 'It is a precise way to think about weather, feedback, and why prediction has horizons.', limitations: ['This browser visual is a low-resolution numerical sketch, not a weather model.', 'Changing integration step size would change the trace; the step is held fixed here.'], deeper: 'The butterfly-like shape is not the point by itself. The point is a system that keeps obeying its rules while refusing to settle into a repeating loop.', insight: 'Predictability can have a limit even when the rules are completely known.', }),
];

export const theoremMap = new Map(theorems.map(theorem => [theorem.id, theorem]));

export function defaultParameters(theorem: TheoremDefinition): ParameterValues {
  return Object.fromEntries(theorem.parameters.map(parameter => [parameter.id, parameter.default]));
}
