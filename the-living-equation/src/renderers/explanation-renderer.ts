import type { TheoremDefinition } from '../types';

function section(title: string, body: string | string[]): HTMLElement {
  const wrapper = document.createElement('section');
  const heading = document.createElement('h3');
  heading.textContent = title;
  wrapper.append(heading);
  if (Array.isArray(body)) {
    const list = document.createElement('ul');
    body.forEach(item => { const li = document.createElement('li'); li.textContent = item; list.append(li); });
    wrapper.append(list);
  } else {
    const paragraph = document.createElement('p');
    paragraph.textContent = body;
    wrapper.append(paragraph);
  }
  return wrapper;
}

export function renderExplanation(root: HTMLElement, theorem: TheoremDefinition): void {
  root.replaceChildren(
    section('Start here', theorem.content.simple),
    section('In precise terms', theorem.content.precise),
    section('Change a value', theorem.content.change),
    section('Why it matters', theorem.content.matters),
    section('Assumptions & limits', theorem.content.limitations),
    section('Go deeper', theorem.content.deeper),
  );
}
