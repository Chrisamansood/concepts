import type { AppState, AudioState, ParameterValues, QualityMode, StoreListener } from '../types';
import type { TheoremDefinition } from '../types';
import { defaultParameters } from '../content/theorems';

function cloneState(state: AppState): AppState {
  return { ...state, parameters: { ...state.parameters }, audio: { ...state.audio } };
}

export function createStore(theorem: TheoremDefinition): {
  getState: () => AppState;
  subscribe: (listener: StoreListener) => () => void;
  updateParameter: (theorem: TheoremDefinition, id: string, value: number) => void;
  selectTheorem: (theorem: TheoremDefinition) => void;
  set: (patch: Partial<AppState>) => void;
  setAudio: (patch: Partial<AudioState>) => void;
  reset: (theorem: TheoremDefinition) => void;
} {
  let state: AppState = {
    selectedTheoremId: theorem.id,
    parameters: defaultParameters(theorem),
    paused: false, entered: false,
    audio: { muted: true, volume: .22, responsive: true, reducedSensory: false },
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    qualityMode: (new URLSearchParams(window.location.search).get('quality') as QualityMode | null) ?? 'auto',
    exportStatus: '',
  };
  const listeners = new Set<StoreListener>();
  const emit = () => listeners.forEach(listener => listener(cloneState(state)));
  const set = (patch: Partial<AppState>) => { state = { ...state, ...patch }; emit(); };
  return {
    getState: () => cloneState(state),
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    updateParameter: (selected, id, value) => {
      const definition = selected.parameters.find(parameter => parameter.id === id);
      if (!definition) return;
      const bounded = Math.min(definition.max, Math.max(definition.min, value));
      state = { ...state, parameters: { ...state.parameters, [id]: bounded } };
      emit();
    },
    selectTheorem: selected => { state = { ...state, selectedTheoremId: selected.id, parameters: defaultParameters(selected), paused: false }; emit(); },
    set,
    setAudio: patch => { state = { ...state, audio: { ...state.audio, ...patch } }; emit(); },
    reset: selected => { state = { ...state, parameters: defaultParameters(selected), paused: false, exportStatus: '' }; emit(); },
  };
}
