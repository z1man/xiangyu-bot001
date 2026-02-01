import { test, expect } from '@playwright/test';

function randUser() {
  const n = Math.floor(Math.random() * 1e9);
  return { username: `user${n}`, password: `Passw0rd!${n}` };
}

test('settings: generate 10 passages (FAKE_LLM) and show in practice', async ({ page }) => {
  const { username, password } = randUser();

  // Register
  await page.goto('/register');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  // Go directly to Settings (less flaky than clicking nav)
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

  await page.getByRole('button', { name: 'Generate 10 passages' }).click();
  await expect(page.getByText(/Created/)).toBeVisible({ timeout: 60_000 });

  // Go to Practice and ensure there is at least one passage card.
  await page.goto('/practice');
  await expect(page.getByRole('heading', { name: 'Practice' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start quiz' }).first()).toBeVisible();
});
