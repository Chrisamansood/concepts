import { expect, test } from '@playwright/test';

test('loads the observatory shell and enters the first theorem', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/The Living Equation/);
  await expect(page.getByRole('heading', { name: /Where equations/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Enter the observatory/ })).toBeVisible();
  await page.getByRole('button', { name: /Enter the observatory/ }).click();
  await expect(page.getByRole('heading', { name: /Fibonacci and the Golden Ratio/ })).toBeVisible();
  await expect(page.locator('#equation')).toContainText('φ');
  await expect(page.locator('#controls input[type="range"]').first()).toBeVisible();
});

test('keyboard slider changes remain readable in the DOM', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Enter the observatory/ }).click();
  const slider = page.locator('#parameter-ratio');
  const before = await page.locator('#value-ratio').textContent();
  await slider.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#value-ratio')).not.toHaveText(before ?? '');
  await expect(page.locator('#explanation')).toContainText('Move the ratio');
  const terms = page.locator('#parameter-terms');
  const termsBefore = await page.locator('#value-terms').textContent();
  await terms.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#value-terms')).not.toHaveText(termsBefore ?? '');
});

test('construction animation narrates the Fibonacci recurrence', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Enter the observatory/ }).click();
  await expect(page.locator('#scene-story')).toContainText('F₀ = 0');
  await page.getByRole('button', { name: /Replay construction/ }).click();
  await expect(page.locator('#scene-story')).toContainText(/F₂ = F₁ \+ F₀ = 1|F₃ = F₂ \+ F₁ = 2/, { timeout: 4000 });
  await expect(page.locator('#scene-story')).toContainText('Building the 14 Fibonacci layers', { timeout: 7000 });
  await expect(page.locator('#scene-story')).toContainText('The recurrence becomes a living field', { timeout: 12000 });
});

test('forced WebGL fallback keeps the lesson available', async ({ page }) => {
  await page.goto('/?forceFallback=1');
  await page.getByRole('button', { name: /Enter the observatory/ }).click();
  await expect(page.locator('#fallback-scene')).toBeVisible();
  await expect(page.locator('#fallback-scene svg [data-layer="field"] circle')).toHaveCount(180);
  await expect(page.locator('#fallback-scene svg [data-layer="construction"]')).toBeVisible();
  await expect(page.locator('#fallback-scene svg [data-layer="arcs"] polyline')).toHaveCount(15);
  await expect(page.locator('#explanation')).toContainText('The Golden Ratio');
});

test('reduced motion is visible as a non-canvas status', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: /Enter the observatory/ }).click();
  await expect(page.locator('#motion-status')).toHaveText('Motion: reduced');
  await expect(page.getByRole('heading', { name: /Fibonacci and the Golden Ratio/ })).toBeVisible();
});

test('atlas selection keeps the same accessible lesson contract', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Pythagorean Theorem/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Pythagorean Theorem' })).toBeVisible();
  await expect(page.locator('#equation')).toContainText('a² + b² = c²');
  await expect(page.locator('#controls input[type="range"]')).toHaveCount(2);
});
