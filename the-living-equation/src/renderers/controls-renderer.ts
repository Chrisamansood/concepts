import type { AppState, AudioState, TheoremDefinition } from '../types';

export interface ControlHandlers {
  updateParameter: (id: string, value: number) => void;
  setAudio: (patch: Partial<AudioState>) => void;
}

export function renderControls(root: HTMLElement, theorem: TheoremDefinition, state: AppState, handlers: ControlHandlers): void {
  root.replaceChildren();
  theorem.parameters.forEach(parameter => {
    const group = document.createElement('div');
    group.className = 'control-group';
    const row = document.createElement('div');
    row.className = 'control-label-row';
    const label = document.createElement('label');
    label.className = 'control-label';
    label.htmlFor = `parameter-${parameter.id}`;
    label.textContent = `${parameter.symbol}  ${parameter.label}`;
    const value = document.createElement('output');
    value.className = 'control-value';
    value.id = `value-${parameter.id}`;
    value.htmlFor = `parameter-${parameter.id}`;
    value.textContent = parameter.format(state.parameters[parameter.id]);
    row.append(label, value);
    const input = document.createElement('input');
    input.type = 'range'; input.id = `parameter-${parameter.id}`; input.name = parameter.id;
    input.min = `${parameter.min}`; input.max = `${parameter.max}`; input.step = `${parameter.step}`;
    input.value = `${state.parameters[parameter.id]}`; input.setAttribute('aria-valuetext', value.textContent);
    input.addEventListener('input', () => handlers.updateParameter(parameter.id, Number(input.value)));
    const help = document.createElement('p'); help.className = 'control-help'; help.textContent = parameter.help;
    group.append(row, input, help); root.append(group);
  });
}

export function renderAudioControls(root: HTMLElement, state: AppState, handlers: ControlHandlers['setAudio']): void {
  root.replaceChildren();
  const mute = checkbox('Mute sound', state.audio.muted, checked => handlers({ muted: checked }));
  const responsive = checkbox('Respond to values', state.audio.responsive, checked => handlers({ responsive: checked }));
  const reduced = checkbox('Reduced sensory mode', state.audio.reducedSensory, checked => handlers({ reducedSensory: checked }));
  const volume = document.createElement('label'); volume.className = 'toggle-line';
  volume.innerHTML = '<span>Volume</span>';
  const volumeInput = document.createElement('input'); volumeInput.type = 'range'; volumeInput.min = '0'; volumeInput.max = '0.5'; volumeInput.step = '0.01'; volumeInput.value = `${state.audio.volume}`; volumeInput.setAttribute('aria-label', 'Volume');
  volumeInput.addEventListener('input', () => handlers({ volume: Number(volumeInput.value) }));
  volume.append(volumeInput); root.append(mute, responsive, reduced, volume);
}

function checkbox(labelText: string, checked: boolean, onChange: (checked: boolean) => void): HTMLElement {
  const label = document.createElement('label'); label.className = 'toggle-line';
  const text = document.createElement('span'); text.textContent = labelText;
  const input = document.createElement('input'); input.type = 'checkbox'; input.checked = checked; input.setAttribute('aria-label', labelText);
  input.addEventListener('change', () => onChange(input.checked)); label.append(text, input); return label;
}
