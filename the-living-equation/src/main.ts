import './styles.css';
import { AudioModulator } from './audio/audio-modulator';
import { theoremMap, theorems, defaultParameters } from './content/theorems';
import { exportStudyClip } from './export/video-exporter';
import { renderControls, renderAudioControls } from './renderers/controls-renderer';
import { renderEquation } from './renderers/equation-renderer';
import { renderExplanation } from './renderers/explanation-renderer';
import { createStore } from './state/store';
import type { AppState, TheoremDefinition } from './types';
import { FallbackScene } from './visual/fallback-scene';
import { resolveQuality } from './visual/quality';
import { ThreeScene } from './visual/three-scene';

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector);
const loading = $('#loading-state');
const entryScreen = $('#entry-screen')!; const observatory = $('#observatory')!;
const entryButton = $('#enter-button'); const atlasButton = $('#atlas-button'); const backButton = $('#back-to-atlas');
const mainField = $('#visual-field')!; const mainCanvas = $('#scene-canvas')!; const fallbackRoot = $('#fallback-scene')!;
const theoremIndex = $('#theorem-index')!; const theoremRail = $('#theorem-index-rail')!; const controls = $('#controls')!; const audioControls = $('#audio-controls')!;
const equation = $('#equation')!; const explanation = $('#explanation')!; const theoremTitle = $('#theorem-title')!; const theoremQuestion = $('#theorem-question')!;
const theoremKicker = $('#theorem-kicker'); const insight = $('#insight-text')!; const pauseButton = $('#pause-button')!; const replayButton = $('#replay-button')!; const resetButton = $('#reset-button')!;
const sceneStory = $('#scene-story')!;
const motionStatus = $('#motion-status'); const sceneKind = $('#scene-kind'); const sceneStatus = $('#scene-status'); const sceneSeed = $('#scene-seed'); const sceneQuality = $('#scene-quality');
const exportButton = $('#export-button')!; const exportStatus = $('#export-status'); const headerSound = $('#header-sound');

if (!entryScreen || !observatory || !mainField || !mainCanvas || !fallbackRoot || !theoremIndex || !theoremRail || !controls || !audioControls || !equation || !explanation || !theoremTitle || !theoremQuestion || !insight || !pauseButton || !replayButton || !resetButton || !exportButton || !sceneStory) throw new Error('The observatory shell is incomplete.');

const initialTheorem = theoremMap.get('fibonacci') ?? theorems[0];
const store = createStore(initialTheorem);
const mainScene = new ThreeScene(); const entryScene = new ThreeScene(); const fallback = new FallbackScene(fallbackRoot);
const audio = new AudioModulator();
let fallbackActive = false; let mounted = false; let lastTheoremId = '';

function renderIndex(root: HTMLElement, state: AppState): void {
  root.replaceChildren();
  theorems.forEach(theorem => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'theorem-item'; button.dataset.theoremId = theorem.id;
    if (theorem.id === state.selectedTheoremId) { button.classList.add('is-selected'); button.setAttribute('aria-current', 'true'); }
    const number = document.createElement('span'); number.className = 'theorem-item-index'; number.textContent = theorem.index;
    const title = document.createElement('span'); title.className = 'theorem-item-title'; title.textContent = theorem.title;
    const meta = document.createElement('span'); meta.className = 'theorem-item-meta'; meta.textContent = theorem.meta;
    button.append(number, title, meta); button.addEventListener('click', () => { const chosen = theoremMap.get(theorem.id); if (!chosen) return; store.selectTheorem(chosen); store.set({ entered: true }); observatory.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); root.append(button);
  });
}

function syncControls(theorem: TheoremDefinition, state: AppState): void {
  theorem.parameters.forEach(parameter => {
    const input = $<HTMLInputElement>(`#parameter-${parameter.id}`); const output = $<HTMLOutputElement>(`#value-${parameter.id}`); if (!input || !output) return;
    const formatted = parameter.format(state.parameters[parameter.id]); input.value = `${state.parameters[parameter.id]}`; output.textContent = formatted; input.setAttribute('aria-valuetext', formatted);
  });
}

function renderState(state: AppState): void {
  const theorem = theoremMap.get(state.selectedTheoremId) ?? initialTheorem;
  const theoremChanged = theorem.id !== lastTheoremId;
  if (theoremChanged) {
    renderControls(controls, theorem, state, { updateParameter: (id, value) => store.updateParameter(theorem, id, value), setAudio: patch => store.setAudio(patch) });
    lastTheoremId = theorem.id;
  } else syncControls(theorem, state);
  if (theoremChanged || state.audio !== undefined) renderAudioControls(audioControls, state, patch => store.setAudio(patch));
  renderIndex(theoremIndex, state); renderIndex(theoremRail, state);
  renderEquation(equation, theorem, state.parameters); renderExplanation(explanation, theorem);
  theoremTitle.textContent = theorem.title; theoremQuestion.textContent = theorem.question; insight.textContent = theorem.content.insight;
  if (theoremKicker) theoremKicker.textContent = `THEOREM ${theorem.index} / ${theorem.meta.split(' / ')[0]}`;
  const derivatives = theorem.deriveVisuals(state.parameters, state.qualityMode);
  audio.setMuted(state.audio.muted); audio.setVolume(state.audio.volume); audio.setResponsive(state.audio.responsive); audio.setReducedSensory(state.audio.reducedSensory); audio.update(theorem.deriveAudio(state.parameters));
  mainScene.update(derivatives, { paused: state.paused, reducedMotion: state.reducedMotion, pointerX: 0, pointerY: 0 });
  entryScene.update(initialTheorem.deriveVisuals(defaultParameters(initialTheorem), state.qualityMode), { paused: false, reducedMotion: state.reducedMotion, pointerX: 0, pointerY: 0 });
  if (fallbackActive) fallback.render(derivatives);
  if (sceneKind) sceneKind.textContent = `${theorem.meta} / PROCEDURAL FIELD`;
  if (sceneSeed) sceneSeed.textContent = `SEED ${String(derivatives.seed).padStart(4, '0')}`;
  if (sceneQuality) sceneQuality.textContent = `QUALITY ${resolveQuality(state.qualityMode).label}`;
  if (sceneStatus) sceneStatus.textContent = state.paused ? 'PAUSED' : fallbackActive ? 'FALLBACK' : 'LIVE';
  pauseButton.innerHTML = state.paused ? '<span aria-hidden="true">▶</span><span>Resume field</span>' : '<span aria-hidden="true">Ⅱ</span><span>Pause field</span>';
  if (motionStatus) motionStatus.textContent = `Motion: ${state.reducedMotion ? 'reduced' : 'full'}`;
  if (headerSound) { headerSound.textContent = state.audio.muted ? 'Sound off' : 'Sound on'; headerSound.setAttribute('aria-pressed', `${!state.audio.muted}`); headerSound.setAttribute('aria-label', state.audio.muted ? 'Sound is off' : 'Sound is on'); }
  entryScreen.hidden = state.entered; observatory.hidden = !state.entered;
  if (exportStatus) exportStatus.textContent = state.exportStatus;
  document.documentElement.dataset.reducedMotion = `${state.reducedMotion}`;
  if (mounted && loading) loading.classList.add('is-ready');
}

function enterObservatory(): void { audio.start(); mainScene.replayConstruction(); store.set({ entered: true }); observatory.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
entryButton?.addEventListener('click', enterObservatory);
atlasButton?.addEventListener('click', () => $('#atlas')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
backButton?.addEventListener('click', () => { store.set({ entered: false }); $('#atlas')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
pauseButton.addEventListener('click', () => store.set({ paused: !store.getState().paused }));
replayButton.addEventListener('click', () => mainScene.replayConstruction());
resetButton.addEventListener('click', () => store.reset(theoremMap.get(store.getState().selectedTheoremId) ?? initialTheorem));
headerSound?.addEventListener('click', () => { audio.start(); const muted = !store.getState().audio.muted; store.setAudio({ muted }); });
exportButton.addEventListener('click', async () => {
  const state = store.getState(); const theorem = theoremMap.get(state.selectedTheoremId) ?? initialTheorem; const derivatives = theorem.deriveVisuals(state.parameters, state.qualityMode);
  store.set({ exportStatus: 'Preparing a 10 second vertical study clip…' }); const result = await exportStudyClip({ theorem, state, derivatives, includeAudio: false }); store.set({ exportStatus: result.message });
});

window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => store.set({ reducedMotion: event.matches }));
store.subscribe(renderState); renderState(store.getState());

const profile = resolveQuality(store.getState().qualityMode);
mainScene.mount(mainField, profile, () => { mounted = true; renderState(store.getState()); }, () => { fallbackActive = true; fallbackRoot.hidden = false; mainCanvas.hidden = true; mounted = true; renderState(store.getState()); }, frame => { sceneStory.textContent = frame.label; });
entryScene.mount($('#entry-visual') ?? mainField, profile, () => renderState(store.getState()), () => undefined);
window.addEventListener('pagehide', () => { mainScene.dispose(); entryScene.dispose(); audio.dispose(); });
