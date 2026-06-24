class LowPassFilter {
  constructor(alpha, initialValue = null) {
    this.alpha = alpha;
    this.initialized = initialValue !== null;
    this.lastValue = initialValue;
  }

  setAlpha(alpha) {
    this.alpha = alpha;
  }

  filter(value) {
    if (!this.initialized) {
      this.initialized = true;
      this.lastValue = value;
      return value;
    }

    const filtered = this.alpha * value + (1 - this.alpha) * this.lastValue;
    this.lastValue = filtered;
    return filtered;
  }

  last() {
    return this.lastValue;
  }
}

class OneEuroFilter {
  constructor({ freq = 30, minCutoff = 1, beta = 0.007, dCutoff = 1 } = {}) {
    this.freq = freq;
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.xFilter = new LowPassFilter(this.alpha(minCutoff));
    this.dxFilter = new LowPassFilter(this.alpha(dCutoff));
    this.lastTimestamp = null;
  }

  alpha(cutoff) {
    const tau = 1 / (2 * Math.PI * cutoff);
    const te = 1 / this.freq;
    return 1 / (1 + tau / te);
  }

  update({ freq, minCutoff, beta, dCutoff } = {}) {
    if (freq !== undefined) this.freq = freq;
    if (minCutoff !== undefined) this.minCutoff = minCutoff;
    if (beta !== undefined) this.beta = beta;
    if (dCutoff !== undefined) this.dCutoff = dCutoff;
  }

  reset() {
    this.xFilter = new LowPassFilter(this.alpha(this.minCutoff));
    this.dxFilter = new LowPassFilter(this.alpha(this.dCutoff));
    this.lastTimestamp = null;
  }

  filter(value, timestamp = performance.now()) {
    if (this.lastTimestamp !== null) {
      const elapsed = Math.max(1, timestamp - this.lastTimestamp) / 1000;
      this.freq = 1 / elapsed;
    }
    this.lastTimestamp = timestamp;

    const previous = this.xFilter.last();
    const derivative = previous === null ? 0 : (value - previous) * this.freq;
    const filteredDerivative = this.dxFilter.filter(derivative);
    const cutoff = this.minCutoff + this.beta * Math.abs(filteredDerivative);

    this.xFilter.setAlpha(this.alpha(cutoff));
    return this.xFilter.filter(value);
  }
}

export { LowPassFilter, OneEuroFilter };
