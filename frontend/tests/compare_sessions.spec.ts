import { test, expect } from '@playwright/test';

test('Compare sessions and assert metrics', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Your username' }).fill('user1');
  await page.getByRole('textbox', { name: 'Your password' }).fill('1234');
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  await page.getByRole('link', { name: 'Sessions' }).click();

  await expect(page.getByRole('cell', { name: 'Session 1' }).first()).toBeVisible();

  const rowSession1 = page.getByRole('row', { name: /Session 1/i }).first();
  await rowSession1.getByRole('checkbox').check();

  const rowSession2 = page.getByRole('row', { name: /Session 2/i }).first();
  await rowSession2.getByRole('checkbox').check();

  await page.getByRole('button', { name: 'Compare' }).click();

  await expect(page.getByRole('heading', { name: 'Comparison' })).toBeVisible();
  await expect(page.getByText('2 versions selected')).toBeVisible();

  await page.getByRole('button', { name: 'Avg tangling' }).click();
  await expect(page.getByRole('button', { name: 'Avg tangling' })).toHaveClass(/btn-primary/);

  await page.getByRole('button', { name: 'Avg scattering' }).click();
  await expect(page.getByRole('button', { name: 'Avg scattering' })).toHaveClass(/btn-primary/);

  await page.getByRole('button', { name: 'X' }).click();
  await expect(page.getByRole('heading', { name: 'Comparison' })).not.toBeVisible();
});