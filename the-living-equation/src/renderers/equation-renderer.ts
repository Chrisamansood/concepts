import type { TheoremDefinition } from '../types';

export function renderEquation(root: HTMLElement, theorem: TheoremDefinition, values: Record<string, number>): void {
  root.replaceChildren();
  const equation = document.createElement('span');
  equation.textContent = theorem.equation;
  equation.setAttribute('data-equation', theorem.id);
  root.append(equation);
  root.setAttribute('aria-label', `${theorem.title}: ${theorem.equation}`);
  root.dataset.values = JSON.stringify(values);
}
