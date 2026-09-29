export type QualityMode = 'auto' | 'high' | 'medium' | 'low';
export type SceneKind = 'fibonacci' | 'pythagorean' | 'wave' | 'fourier' | 'orbit' | 'lorenz';

export interface ParameterDefinition {
  id: string;
  label: string;
  symbol: string;
  min: number;
  max: number;
  step: number;
  default: number;
  format: (value: number) => string;
  help: string;
}

export type ParameterValues = Record<string, number>;

export interface LessonContent {
  simple: string;
  precise: string;
  change: string;
  matters: string;
  limitations: string[];
  deeper: string;
  insight: string;
}

export interface VisualDerivatives {
  theoremId: string;
  sceneKind: SceneKind;
  seed: number;
  phi: number;
  sequenceLength: number;
  growth: number;
  lineWidth: number;
  particleCount: number;
  motionSpeed: number;
  cameraDrift: number;
  amplitude: number;
  frequency: number;
  phase: number;
  componentCount: number;
  orbitRadius: number;
  orbitSpeed: number;
  chaos: number;
  squareCount: number;
  spiralTurns: number;
  ratioBias: number;
  fieldLayers: number;
  flowFrequency: number;
  parameters: ParameterValues;
}

export interface AudioDerivatives {
  harmonicBrightness: number;
  pulseRate: number;
  spatialWidth: number;
  tonalDensity: number;
}

export interface TheoremDefinition {
  id: string;
  index: string;
  title: string;
  meta: string;
  question: string;
  equation: string;
  sceneKind: SceneKind;
  parameters: ParameterDefinition[];
  content: LessonContent;
  deriveVisuals: (values: ParameterValues, quality: QualityMode) => VisualDerivatives;
  deriveAudio: (values: ParameterValues) => AudioDerivatives;
}

export interface AudioState {
  muted: boolean;
  volume: number;
  responsive: boolean;
  reducedSensory: boolean;
}

export interface AppState {
  selectedTheoremId: string;
  parameters: ParameterValues;
  paused: boolean;
  entered: boolean;
  audio: AudioState;
  reducedMotion: boolean;
  qualityMode: QualityMode;
  exportStatus: string;
}

export type StoreListener = (state: AppState) => void;
