import { test, expect } from '@playwright/test';

function randUser() {
  const n = Math.floor(Math.random() * 1e9);
  return { username: `user${n}`, password: `Passw0rd!${n}` };
}

test('end-to-end: register → practice → quiz → submit → rubric → review → history', async ({ page }) => {
  const { username, password } = randUser();

  // Register
  await page.goto('/register');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  // Practice page
  await expect(page.getByRole('heading', { name: 'Practice' })).toBeVisible();

  // Start quiz
  await page.getByRole('button', { name: 'Start quiz' }).first().click();
  await expect(page.getByRole('heading', { name: 'Quiz' })).toBeVisible();

  // Answer all questions (always choose A)
  const radios = page.locator('input[type="radio"]');
  const count = await radios.count();
  expect(count).toBeGreaterThanOrEqual(40);
  for (let i = 0; i < 40; i += 4) {
    await radios.nth(i).check();
  }

  await page.getByRole('button', { name: 'Submit' }).click();

  // Result page
  await expect(page.getByRole('heading', { name: 'Result' })).toBeVisible();
  await expect(page.getByText(/MCQ score:/)).toBeVisible();

  // Save rubric
  await page.getByLabel('Evidence').fill('4');
  await page.getByLabel('Reasoning').fill('3');
  await page.getByLabel('Style').fill('2');
  await page.getByLabel('Notes (optional)').fill('E2E test note');
  await page.getByRole('button', { name: 'Save rubric' }).click();
  await expect(page.getByText('Saved.')).toBeVisible();

  // Review section should show 10 questions
  await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
  await expect(page.getByText(/Q1\./)).toBeVisible();
  await expect(page.getByText(/Q10\./)).toBeVisible();

  // Go to history
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();

  // Should have at least one attempt
  await expect(page.getByRole('button', { name: 'View' }).first()).toBeVisible();

  // View should navigate back to result
  await page.getByRole('button', { name: 'View' }).first().click();
  await expect(page.getByRole('heading', { name: 'Result' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
});
