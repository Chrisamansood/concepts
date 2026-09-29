import type { VisualDerivatives } from '../types';
import { buildFibonacciGeometry, type GeometryPoint } from './fibonacci-geometry';

export class FallbackScene {
  constructor(private readonly root: HTMLElement) {}

  render(derivatives: VisualDerivatives): void {
    this.root.replaceChildren();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '-3 -3 6 6');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `${derivatives.theoremId} static mathematical field`);
    svg.dataset.scene = derivatives.sceneKind;
    if (derivatives.sceneKind === 'fibonacci') renderFibonacci(svg, derivatives);
    else renderGeneric(svg, derivatives);
    this.root.append(svg);
  }
}

function renderFibonacci(svg: SVGSVGElement, derivatives: VisualDerivatives): void {
  const geometry = buildFibonacciGeometry(derivatives, 180);
  const glowGroup = element('g', { 'data-layer': 'glow', opacity: '.22' });
  const constructionGroup = element('g', { 'data-layer': 'construction' });
  const arcGroup = element('g', { 'data-layer': 'arcs' });
  const guideGroup = element('g', { 'data-layer': 'guides' });
  const dustGroup = element('g', { 'data-layer': 'dust' });
  const fieldGroup = element('g', { 'data-layer': 'field' });
  const filamentGroup = element('g', { 'data-layer': 'filaments' });
  const ribbonGroup = element('g', { 'data-layer': 'ribbons' });

  geometry.field.forEach(point => fieldGroup.append(circle(point, point.size * 1.9, '#f1eee9', point.alpha)));
  geometry.filaments.forEach(filament => filamentGroup.append(polyline([filament.start, filament.end], '#e5e1d9', filament.opacity, '0.012')));
  geometry.ribbons.forEach(ribbon => {
    ribbonGroup.append(polyline(ribbon.points, '#f1eee9', ribbon.opacity * .72, `${ribbon.width * .9}`));
    ribbonGroup.append(polyline(ribbon.points, '#f1eee9', ribbon.opacity, `${ribbon.width * .42}`));
  });

  geometry.guides.forEach(guide => guideGroup.append(line(guide.start, guide.end, '#77736c', guide.opacity, '0.008')));
  geometry.squares.forEach(square => {
    const points = [...square.corners, square.corners[0]];
    constructionGroup.append(polyline(points, '#bcb8b0', square.opacity * .28, '0.018'));
    glowGroup.append(polyline(points, '#f1eee9', .035, '0.07'));
  });
  geometry.arcs.forEach(arc => {
    arcGroup.append(polyline(arc.points, '#f1eee9', arc.opacity * .45, '0.024'));
    glowGroup.append(polyline(arc.points, '#f1eee9', .045, '0.09'));
  });
  glowGroup.append(polyline(geometry.spiral, '#f1eee9', .035, '0.10'));
  arcGroup.append(polyline(geometry.spiral, '#f1eee9', .08, '0.026'));
  geometry.dust.forEach(point => dustGroup.append(circle(point, .014, '#c9c4bb', .35)));
  geometry.nodes.forEach(node => {
    constructionGroup.append(circle(node.point, node.size * 1.7, '#c9c4bb', .14));
    constructionGroup.append(circle(node.point, node.size, '#f1eee9', node.opacity));
  });
  svg.append(glowGroup, guideGroup, dustGroup, fieldGroup, filamentGroup, ribbonGroup, constructionGroup, arcGroup);
}

function renderGeneric(svg: SVGSVGElement, derivatives: VisualDerivatives): void {
  const pathPoints: GeometryPoint[] = [];
  for (let index = 0; index < 220; index += 1) {
    const t = index / 219;
    pathPoints.push({ x: (t - .5) * 5.2, y: Math.sin(t * Math.PI * 2 * derivatives.frequency + derivatives.phase) * .9 * derivatives.amplitude, z: 0 });
  }
  svg.append(polyline(pathPoints, '#f1eee9', .8, '0.022'));
}

function element(tag: string, attributes: Record<string, string>): SVGGElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag) as SVGGElement;
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function polyline(points: GeometryPoint[], stroke: string, opacity: number, width: string): SVGPolylineElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  node.setAttribute('points', points.map(point => `${point.x.toFixed(4)},${(-point.y).toFixed(4)}`).join(' '));
  node.setAttribute('fill', 'none'); node.setAttribute('stroke', stroke); node.setAttribute('stroke-width', width); node.setAttribute('opacity', `${opacity}`); node.setAttribute('stroke-linecap', 'round'); node.setAttribute('stroke-linejoin', 'round');
  return node;
}

function line(start: GeometryPoint, end: GeometryPoint, stroke: string, opacity: number, width: string): SVGLineElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  node.setAttribute('x1', `${start.x}`); node.setAttribute('y1', `${-start.y}`); node.setAttribute('x2', `${end.x}`); node.setAttribute('y2', `${-end.y}`); node.setAttribute('stroke', stroke); node.setAttribute('stroke-width', width); node.setAttribute('opacity', `${opacity}`);
  return node;
}

function circle(point: GeometryPoint, radius: number, fill: string, opacity: number): SVGCircleElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  node.setAttribute('cx', `${point.x}`); node.setAttribute('cy', `${-point.y}`); node.setAttribute('r', `${radius}`); node.setAttribute('fill', fill); node.setAttribute('opacity', `${opacity}`);
  return node;
}
