import type { AudioDerivatives } from '../types';

export class AudioModulator {
  private context?: AudioContext;
  private master?: GainNode;
  private tone?: OscillatorNode;
  private overtone?: OscillatorNode;
  private muted = true;
  private volume = .22;
  private responsive = true;
  private reducedSensory = false;

  start(): void {
    if (this.context) { void this.context.resume(); return; }
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass(); const master = context.createGain(); master.gain.value = 0;
    const tone = context.createOscillator(); tone.type = 'sine'; tone.frequency.value = 110;
    const overtone = context.createOscillator(); overtone.type = 'triangle'; overtone.frequency.value = 164.8;
    const toneGain = context.createGain(); toneGain.gain.value = .22; const overtoneGain = context.createGain(); overtoneGain.gain.value = .08;
    tone.connect(toneGain).connect(master); overtone.connect(overtoneGain).connect(master); master.connect(context.destination);
    tone.start(); overtone.start(); this.context = context; this.master = master; this.tone = tone; this.overtone = overtone;
    void context.resume(); this.applyGain();
  }

  update(derivatives: AudioDerivatives): void {
    if (!this.context || !this.tone || !this.overtone) return;
    const now = this.context.currentTime; const scale = this.reducedSensory ? .35 : 1;
    const brightness = this.responsive ? derivatives.harmonicBrightness : .4;
    this.tone.frequency.setTargetAtTime(92 + brightness * 45, now, .18);
    this.overtone.frequency.setTargetAtTime(138 + derivatives.pulseRate * 80, now, .18);
    if (this.master && !this.muted) this.master.gain.setTargetAtTime(this.volume * derivatives.tonalDensity * scale, now, .25);
  }

  setMuted(muted: boolean): void { this.muted = muted; this.applyGain(); }
  setVolume(volume: number): void { this.volume = Math.min(.5, Math.max(0, volume)); this.applyGain(); }
  setResponsive(responsive: boolean): void { this.responsive = responsive; }
  setReducedSensory(reducedSensory: boolean): void { this.reducedSensory = reducedSensory; this.applyGain(); }

  dispose(): void { this.tone?.stop(); this.overtone?.stop(); this.tone?.disconnect(); this.overtone?.disconnect(); this.master?.disconnect(); void this.context?.close(); this.context = undefined; this.master = undefined; this.tone = undefined; this.overtone = undefined; }

  private applyGain(): void { if (!this.master || !this.context) return; this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume * (this.reducedSensory ? .35 : 1), this.context.currentTime, .08); }
}
