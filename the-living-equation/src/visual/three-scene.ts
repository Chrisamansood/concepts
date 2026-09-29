import * as THREE from 'three';
import type { VisualDerivatives } from '../types';
import type { QualityProfile } from './quality';
import { buildFibonacciGeometry, type GeometryPoint } from './fibonacci-geometry';
import { FibonacciAnimationDirector, type FibonacciAnimationFrame } from './fibonacci-animation-director';

export interface SceneRuntime {
  paused: boolean;
  reducedMotion: boolean;
  pointerX: number;
  pointerY: number;
}

export class ThreeScene {
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private group?: THREE.Group;
  private canvas?: HTMLCanvasElement;
  private container?: HTMLElement;
  private resizeObserver?: ResizeObserver;
  private frame = 0;
  private lastTime = 0;
  private runtime: SceneRuntime = { paused: false, reducedMotion: false, pointerX: 0, pointerY: 0 };
  private derivatives?: VisualDerivatives;
  private profile?: QualityProfile;
  private pointerListener?: (event: PointerEvent) => void;
  private visibilityListener?: () => void;
  private animatedMaterials: THREE.ShaderMaterial[] = [];
  private animationTime = 0;
  private readonly fibonacciDirector = new FibonacciAnimationDirector();
  private storyListener?: (frame: FibonacciAnimationFrame) => void;
  private lastStoryLabel = '';

  mount(container: HTMLElement, profile: QualityProfile, onReady: () => void, onError: (error: unknown) => void, onStoryChange?: (frame: FibonacciAnimationFrame) => void): void {
    this.container = container; this.profile = profile;
    this.storyListener = onStoryChange;
    if (new URLSearchParams(window.location.search).has('forceFallback')) { onError(new Error('Forced fallback for verification')); return; }
    try {
      const canvas = container.querySelector<HTMLCanvasElement>('canvas');
      if (!canvas) throw new Error('Scene canvas is missing');
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.pixelRatio));
      renderer.setClearColor(0x000000, 0);
      this.canvas = canvas; this.renderer = renderer; this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(36, 1, .1, 100); this.camera.position.set(0, 0, 7.4);
      this.scene.add(new THREE.AmbientLight(0xffffff, .8));
      this.scene.fog = new THREE.Fog(0x080808, 6.2, 11.5);
      this.resize();
      this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(container);
      this.pointerListener = event => { const rect = container.getBoundingClientRect(); this.runtime.pointerX = ((event.clientX - rect.left) / rect.width - .5) * 2; this.runtime.pointerY = ((event.clientY - rect.top) / rect.height - .5) * 2; };
      container.addEventListener('pointermove', this.pointerListener, { passive: true });
      this.visibilityListener = () => { if (document.hidden) { if (this.frame) cancelAnimationFrame(this.frame); this.frame = 0; } else if (!this.frame) this.startLoop(); };
      document.addEventListener('visibilitychange', this.visibilityListener);
      if (this.derivatives) this.rebuild(this.derivatives);
      onReady();
      this.startLoop();
    } catch (error) { this.dispose(); onError(error); }
  }

  update(derivatives: VisualDerivatives, runtime: SceneRuntime): void {
    this.runtime = runtime;
    const signature = signatureOf(derivatives);
    if (!this.derivatives || signatureOf(this.derivatives) !== signature) {
      if (derivatives.sceneKind === 'fibonacci') this.fibonacciDirector.replay(derivatives.sequenceLength);
      this.rebuild(derivatives);
    }
    this.derivatives = derivatives;
    if (derivatives.sceneKind === 'fibonacci') this.applyStoryFrame(this.fibonacciDirector.snapshot());
  }

  setPaused(paused: boolean): void { this.runtime.paused = paused; }

  replayConstruction(): void {
    this.fibonacciDirector.replay(this.derivatives?.sequenceLength ?? 14);
    this.applyStoryFrame(this.fibonacciDirector.snapshot());
  }

  dispose(): void {
    if (this.frame) cancelAnimationFrame(this.frame); this.frame = 0;
    this.animationTime = 0;
    this.resizeObserver?.disconnect(); this.resizeObserver = undefined;
    if (this.container && this.pointerListener) this.container.removeEventListener('pointermove', this.pointerListener);
    if (this.visibilityListener) document.removeEventListener('visibilitychange', this.visibilityListener);
    this.disposeGroup(); this.renderer?.dispose(); this.renderer = undefined; this.scene = undefined; this.camera = undefined; this.canvas = undefined; this.container = undefined; this.derivatives = undefined; this.storyListener = undefined;
  }

  private startLoop(): void {
    const loop = (time: number) => {
      const delta = Math.min((time - this.lastTime) / 1000, .05); this.lastTime = time;
      if (!this.runtime.paused && !this.runtime.reducedMotion && this.group && this.derivatives) {
        this.animationTime += delta;
        this.group.rotation.z += delta * this.derivatives.motionSpeed;
        this.group.rotation.y += delta * this.derivatives.cameraDrift * .05;
      }
      if (this.derivatives?.sceneKind === 'fibonacci') this.applyStoryFrame(this.fibonacciDirector.update(delta, this.runtime.paused, this.runtime.reducedMotion));
      this.animatedMaterials.forEach(material => { material.uniforms.uTime.value = this.animationTime; });
      if (this.camera) { this.camera.position.x += (this.runtime.pointerX * .16 - this.camera.position.x) * .04; this.camera.position.y += (-this.runtime.pointerY * .1 - this.camera.position.y) * .04; this.camera.lookAt(0, 0, 0); }
      if (!document.hidden && this.renderer && this.scene && this.camera) this.renderer.render(this.scene, this.camera);
      this.frame = requestAnimationFrame(loop);
    };
    this.frame = requestAnimationFrame(loop);
  }

  private resize(): void {
    if (!this.renderer || !this.camera || !this.container || !this.profile) return;
    const width = Math.max(1, this.container.clientWidth); const height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(width, height, false); this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.profile.pixelRatio));
    this.camera.aspect = width / height;
    // The construction must remain fully legible in the narrow observatory column.
    // Widen the camera distance when the viewport is portrait instead of cropping
    // the outer Fibonacci squares at the frame edges.
    this.camera.position.z = Math.max(7.4, 7.4 / Math.max(this.camera.aspect, .72));
    this.camera.updateProjectionMatrix();
  }

  private rebuild(derivatives: VisualDerivatives): void {
    if (!this.scene || !this.profile) return;
    this.disposeGroup(); this.group = new THREE.Group();
    if (derivatives.sceneKind === 'fibonacci') buildFibonacciSculpture(this.group, derivatives, this.profile.particleBudget, material => this.animatedMaterials.push(material));
    else {
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf1eee9, transparent: true, opacity: .82 });
      const faintMaterial = new THREE.LineBasicMaterial({ color: 0x8b8882, transparent: true, opacity: .24 });
      const pointsMaterial = new THREE.PointsMaterial({ color: 0xf1eee9, size: .024, transparent: true, opacity: .75, sizeAttenuation: true });
      const paths = buildPaths(derivatives);
      paths.forEach((path, index) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(path);
        this.group?.add(new THREE.Line(geometry, index === 0 ? lineMaterial : faintMaterial));
      });
      const particles = buildParticles(derivatives, this.profile.particleBudget);
      const pointGeometry = new THREE.BufferGeometry(); pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));
      this.group.add(new THREE.Points(pointGeometry, pointsMaterial));
    }
    this.scene.add(this.group);
  }

  private disposeGroup(): void {
    if (!this.group) return;
    this.group.traverse(object => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach(item => item.dispose()); else material?.dispose();
    });
    this.scene?.remove(this.group); this.group = undefined;
    this.animatedMaterials = [];
  }

  private applyStoryFrame(frame: FibonacciAnimationFrame): void {
    if (!this.group || this.derivatives?.sceneKind !== 'fibonacci') return;
    this.group.traverse(object => {
      const layer = object.userData.storyLayer as string | undefined;
      if (!layer) return;
      const material = (object as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      const materials = Array.isArray(material) ? material : material ? [material] : [];
      if (layer === 'field') {
        materials.forEach(item => {
          if (item instanceof THREE.ShaderMaterial) {
            item.uniforms.uVisibleStep.value = frame.visibleStep;
            item.uniforms.uFieldReveal.value = frame.fieldReveal;
          }
        });
      }
      const step = Number(object.userData.storyStep ?? 0);
      const reveal = layer === 'construction'
        ? smoothstep(step - .45, step + .35, frame.visibleStep) * (.35 + frame.constructionReveal * .65)
        : layer === 'ribbons' ? frame.fieldReveal : 1;
      materials.forEach(item => {
        const baseOpacity = Number(item.userData.storyBaseOpacity);
        if (Number.isFinite(baseOpacity)) item.opacity = baseOpacity * reveal;
      });
    });
    if (frame.label !== this.lastStoryLabel) {
      this.lastStoryLabel = frame.label;
      this.storyListener?.(frame);
    }
  }
}

function buildFibonacciSculpture(group: THREE.Group, derivatives: VisualDerivatives, particleBudget: number, registerAnimated: (material: THREE.ShaderMaterial) => void): void {
  const geometry = buildFibonacciGeometry(derivatives, particleBudget);
  const squareLine = new THREE.LineBasicMaterial({ color: 0xbcb8b0, transparent: true, opacity: .12, depthWrite: false, fog: false });
  const squareGlow = new THREE.LineBasicMaterial({ color: 0xf1eee9, transparent: true, opacity: .026, depthWrite: false, fog: false });
  const arcLine = new THREE.LineBasicMaterial({ color: 0xf1eee9, transparent: true, opacity: .22, depthWrite: false, fog: false });
  const arcGlow = new THREE.LineBasicMaterial({ color: 0xf1eee9, transparent: true, opacity: .05, depthWrite: false, fog: false });
  const guideLine = new THREE.LineBasicMaterial({ color: 0x77736c, transparent: true, opacity: .045, depthWrite: false, fog: false });
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xf1eee9, transparent: true, opacity: .65, fog: false });
  const haloMaterial = new THREE.MeshBasicMaterial({ color: 0xc9c4bb, transparent: true, opacity: .08, depthWrite: false, fog: false });

  const fieldGeometry = new THREE.BufferGeometry();
  fieldGeometry.setAttribute('position', new THREE.Float32BufferAttribute(geometry.field.flatMap(point => [point.x, point.y, point.z]), 3));
  fieldGeometry.setAttribute('aSize', new THREE.Float32BufferAttribute(geometry.field.map(point => point.size), 1));
  fieldGeometry.setAttribute('aAlpha', new THREE.Float32BufferAttribute(geometry.field.map(point => point.alpha), 1));
  fieldGeometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(geometry.field.map(point => point.seed), 1));
  fieldGeometry.setAttribute('aStep', new THREE.Float32BufferAttribute(geometry.field.map(point => point.step), 1));
  const fieldMaterial = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) }, uVisibleStep: { value: 0 }, uFieldReveal: { value: 0 } },
    vertexShader: `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aSize;
      attribute float aAlpha;
      attribute float aSeed;
      attribute float aStep;
      uniform float uVisibleStep;
      uniform float uFieldReveal;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        float local = sin(uTime * (.42 + aSeed * .24) + aSeed * 18.0 + p.x * 2.2);
        float breath = cos(uTime * .26 + aSeed * 9.0) * .035;
        float reveal = smoothstep(aStep - .55, aStep + .25, uVisibleStep) * smoothstep(0.0, .9, uFieldReveal);
        p.xy = mix(vec2(0.0), p.xy, reveal);
        p.xy += normalize(p.xy + vec2(.0001)) * (local * .022 + breath) * reveal;
        p.z += cos(uTime * .31 + aSeed * 11.0) * .035;
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aSize * uPixelRatio * 520.0 / max(1.0, -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = aAlpha * reveal;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - .5;
        float distanceToCenter = length(uv);
        float softness = 1.0 - smoothstep(.08, .5, distanceToCenter);
        if (softness < .01) discard;
        gl_FragColor = vec4(vec3(.96, .95, .92), softness * vAlpha * 1.15);
      }
    `,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  registerAnimated(fieldMaterial);
  const fieldPoints = new THREE.Points(fieldGeometry, fieldMaterial);
  tagStoryObject(fieldPoints, 0, 'field');
  group.add(fieldPoints);

  const filamentGroup = new THREE.Group();
  const filamentMaterial = new THREE.LineBasicMaterial({ color: 0xe5e1d9, transparent: true, opacity: .28, depthWrite: false, fog: false });
  geometry.filaments.forEach(filament => {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([toVector(filament.start), toVector(filament.end)]), filamentMaterial.clone());
    (line.material as THREE.LineBasicMaterial).opacity = filament.opacity;
    tagStoryObject(line, Math.min(filament.start.step, filament.end.step), 'construction');
    filamentGroup.add(line);
  });
  group.add(filamentGroup);

  const ribbonGroup = new THREE.Group();
  geometry.ribbons.forEach(ribbon => {
    const points = ribbon.points.map(toVector);
    const glow = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0xf1eee9, transparent: true, opacity: ribbon.opacity * .7, depthWrite: false, fog: false }));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0xf1eee9, transparent: true, opacity: ribbon.opacity, depthWrite: false, fog: false }));
    tagStoryObject(glow, 0, 'ribbons'); tagStoryObject(line, 0, 'ribbons');
    ribbonGroup.add(glow, line);
  });
  group.add(ribbonGroup);

  const proportionalTrace = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(geometry.spiral.map(toVector)),
    new THREE.LineBasicMaterial({ color: 0xf1eee9, transparent: true, opacity: .42, depthWrite: false, fog: false }),
  );
  tagStoryObject(proportionalTrace, 0, 'ribbons');
  group.add(proportionalTrace);

  const proportionalGlow = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(geometry.spiral.map(toVector)),
    new THREE.LineBasicMaterial({ color: 0xf1eee9, transparent: true, opacity: .11, depthWrite: false, fog: false }),
  );
  tagStoryObject(proportionalGlow, 0, 'ribbons');
  group.add(proportionalGlow);

  geometry.guides.forEach(guide => {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([toVector(guide.start), toVector(guide.end)]), guideLine.clone());
    (line.material as THREE.LineBasicMaterial).opacity = guide.opacity * .7;
    tagStoryObject(line, 0, 'construction');
    group.add(line);
  });
  geometry.squares.forEach(square => {
    const points = [...square.corners, square.corners[0]].map(toVector);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), squareLine.clone());
    (line.material as THREE.LineBasicMaterial).opacity = square.opacity * .52;
    tagStoryObject(line, square.index, 'construction');
    group.add(line);
    const glow = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), squareGlow.clone());
    tagStoryObject(glow, square.index, 'construction');
    group.add(glow);
  });
  geometry.arcs.forEach(arc => {
    const points = arc.points.map(toVector);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), arcLine.clone());
    (line.material as THREE.LineBasicMaterial).opacity = arc.opacity * .48;
    tagStoryObject(line, arc.index, 'construction');
    group.add(line);
    const glow = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), arcGlow.clone());
    tagStoryObject(glow, arc.index, 'construction');
    group.add(glow);
  });
  geometry.nodes.forEach(node => {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(node.size, 8, 8), nodeMaterial.clone());
    sphere.position.copy(toVector(node.point));
    (sphere.material as THREE.MeshBasicMaterial).opacity = node.opacity * .18;
    tagStoryObject(sphere, node.index, 'construction');
    group.add(sphere);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(node.size * 2.8, 8, 8), haloMaterial.clone());
    halo.position.copy(sphere.position);
    tagStoryObject(halo, node.index, 'construction');
    group.add(halo);
  });
  const dustGeometry = new THREE.BufferGeometry().setFromPoints(geometry.dust.map(toVector));
  const dustMaterial = new THREE.PointsMaterial({ color: 0xc9c4bb, size: .018, transparent: true, opacity: .38, sizeAttenuation: true, depthWrite: false });
  group.add(new THREE.Points(dustGeometry, dustMaterial));
}

function toVector(point: GeometryPoint): THREE.Vector3 {
  return new THREE.Vector3(point.x, point.y, point.z);
}

function tagStoryObject(object: THREE.Object3D, step: number, layer: 'field' | 'construction' | 'ribbons'): void {
  object.userData.storyStep = step;
  object.userData.storyLayer = layer;
  const material = (object as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
  const materials = Array.isArray(material) ? material : material ? [material] : [];
  materials.forEach(item => { item.userData.storyBaseOpacity = item.opacity; });
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / Math.max(.0001, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function signatureOf(d: VisualDerivatives): string { return JSON.stringify([d.sceneKind, d.seed, d.phi, d.sequenceLength, d.growth, d.amplitude, d.frequency, d.phase, d.componentCount, d.orbitRadius, d.orbitSpeed, d.chaos, d.particleCount, d.fieldLayers, d.flowFrequency, d.spiralTurns]); }

function buildPaths(d: VisualDerivatives): THREE.Vector3[][] {
  const paths: THREE.Vector3[][] = [];
  if (d.sceneKind === 'fibonacci') {
    const path: THREE.Vector3[] = [];
    for (let i = 0; i <= 260; i += 1) { const t = i / 260; const theta = t * Math.PI * 2 * d.frequency; const radius = .12 + Math.exp(t * d.growth * 7) * .36; path.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, Math.sin(theta * .55) * .08)); }
    paths.push(path);
  } else if (d.sceneKind === 'pythagorean') {
    const a = d.parameters.a ?? 2.4; const b = d.parameters.b ?? 1.8; paths.push([new THREE.Vector3(-a / 2, -b / 2, 0), new THREE.Vector3(a / 2, -b / 2, 0), new THREE.Vector3(-a / 2, b / 2, 0), new THREE.Vector3(-a / 2, -b / 2, 0)]); paths.push([new THREE.Vector3(a / 2, -b / 2, 0), new THREE.Vector3(-a / 2, b / 2, 0)]);
  } else if (d.sceneKind === 'wave' || d.sceneKind === 'fourier') {
    const path: THREE.Vector3[] = []; const components = d.sceneKind === 'fourier' ? d.componentCount : 2; for (let i = 0; i <= 320; i += 1) { const x = (i / 320 - .5) * 5.6; let y = 0; for (let c = 1; c <= components; c += 1) y += Math.sin(x * d.frequency * c + d.phase * (c === 1 ? 1 : 0)) * d.amplitude / (d.sceneKind === 'fourier' ? c : 2); path.push(new THREE.Vector3(x, y * .6, 0)); } paths.push(path);
  } else if (d.sceneKind === 'orbit') {
    const path: THREE.Vector3[] = []; for (let i = 0; i <= 240; i += 1) { const t = i / 240 * Math.PI * 2; const radius = d.orbitRadius * .2; path.push(new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius * (.65 + d.orbitSpeed * .1), Math.sin(t * 2) * .12)); } paths.push(path); paths.push([new THREE.Vector3(0, 0, 0), new THREE.Vector3(.02, 0, 0)]);
  } else {
    const path: THREE.Vector3[] = []; let x = .05; let y = .08; let z = .05; for (let i = 0; i < 500; i += 1) { const dx = 10 * (y - x); const dy = x * ((d.parameters.rho ?? 28) - z) - y; const dz = x * y - (8 / 3) * z; x += dx * .0025; y += dy * .0025; z += dz * .0025; path.push(new THREE.Vector3(x * .04, (z - 24) * .035, y * .035)); } paths.push(path);
  }
  return paths;
}

function buildParticles(d: VisualDerivatives, budget: number): Float32Array {
  const count = Math.min(budget, d.particleCount); const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) { const t = i / Math.max(1, count - 1); let x = 0; let y = 0; let z = 0;
    if (d.sceneKind === 'fibonacci') { const theta = t * Math.PI * 2 * d.frequency; const radius = .12 + Math.exp(t * d.growth * 7) * .36; x = Math.cos(theta) * radius; y = Math.sin(theta) * radius; z = Math.sin(theta * .55) * .12; }
    else { const theta = t * Math.PI * 2 * (d.sceneKind === 'orbit' ? 1 : d.frequency); const radius = d.sceneKind === 'orbit' ? d.orbitRadius * .2 : 1.8; x = Math.cos(theta) * radius * (d.sceneKind === 'orbit' ? 1 : .9); y = Math.sin(theta) * radius * (d.sceneKind === 'orbit' ? .65 : .35) * d.amplitude; z = Math.sin(theta * 2 + d.phase) * .12; }
    positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
  }
  return positions;
}
