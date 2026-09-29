export type FibonacciAnimationPhase = 'seed' | 'recurrence' | 'construction' | 'field' | 'hero';

export interface FibonacciAnimationFrame {
  phase: FibonacciAnimationPhase;
  visibleStep: number;
  fieldReveal: number;
  constructionReveal: number;
  label: string;
}

const SEED_DURATION = .8;
const STEP_DURATION = .45;
const CONSTRUCTION_DURATION = 1.8;
const FIELD_DURATION = 1.7;

export class FibonacciAnimationDirector {
  private elapsed = 0;
  private termCount = 14;
  private frame: FibonacciAnimationFrame = frameFor(0, this.termCount);

  replay(termCount: number): void {
    this.termCount = Math.max(2, Math.min(20, Math.round(termCount)));
    this.elapsed = 0;
    this.frame = frameFor(this.elapsed, this.termCount);
  }

  update(deltaSeconds: number, paused: boolean, reducedMotion: boolean): FibonacciAnimationFrame {
    if (reducedMotion) {
      this.frame = staticFrame(this.termCount);
      return this.frame;
    }
    if (!paused) this.elapsed = Math.min(this.totalDuration(), this.elapsed + Math.max(0, Math.min(deltaSeconds, .05)));
    this.frame = frameFor(this.elapsed, this.termCount);
    return this.frame;
  }

  snapshot(): FibonacciAnimationFrame {
    return this.frame;
  }

  private totalDuration(): number {
    return SEED_DURATION + Math.max(1, this.termCount - 2) * STEP_DURATION + CONSTRUCTION_DURATION + FIELD_DURATION;
  }
}

function frameFor(elapsed: number, termCount: number): FibonacciAnimationFrame {
  if (elapsed < SEED_DURATION) return {
    phase: 'seed', visibleStep: 0, fieldReveal: 0, constructionReveal: 0,
    label: 'F₀ = 0   ·   F₁ = 1',
  };

  const recurrenceStart = SEED_DURATION;
  const recurrenceDuration = Math.max(1, termCount - 2) * STEP_DURATION;
  if (elapsed < recurrenceStart + recurrenceDuration) {
    const recurrenceTime = elapsed - recurrenceStart;
    const step = Math.min(termCount - 1, 2 + Math.floor(recurrenceTime / STEP_DURATION));
    const local = (recurrenceTime % STEP_DURATION) / STEP_DURATION;
    const values = fibonacciValues(termCount);
    return {
      phase: 'recurrence', visibleStep: step - 1 + local, fieldReveal: 0, constructionReveal: 0,
      label: `F${subscript(step)} = F${subscript(step - 1)} + F${subscript(step - 2)} = ${values[step]}`,
    };
  }

  const constructionStart = recurrenceStart + recurrenceDuration;
  if (elapsed < constructionStart + CONSTRUCTION_DURATION) {
    const progress = (elapsed - constructionStart) / CONSTRUCTION_DURATION;
    return {
      phase: 'construction', visibleStep: (termCount - 1) * progress, fieldReveal: 0, constructionReveal: progress,
      label: `Building the ${termCount} Fibonacci layers`,
    };
  }

  const fieldStart = constructionStart + CONSTRUCTION_DURATION;
  if (elapsed < fieldStart + FIELD_DURATION) {
    const progress = (elapsed - fieldStart) / FIELD_DURATION;
    return {
      phase: 'field', visibleStep: termCount, fieldReveal: progress, constructionReveal: 1,
      label: 'The recurrence becomes a living field',
    };
  }

  return staticFrame(termCount);
}

function staticFrame(termCount: number): FibonacciAnimationFrame {
  return {
    phase: 'hero', visibleStep: termCount, fieldReveal: 1, constructionReveal: 1,
    label: 'φ ≈ 1.618   ·   proportional growth',
  };
}

function fibonacciValues(count: number): number[] {
  const values = [0, 1];
  while (values.length < count) values.push(values.at(-1)! + values.at(-2)!);
  return values;
}

function subscript(value: number): string {
  return String(value).replace(/[0-9]/g, digit => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)]);
}
