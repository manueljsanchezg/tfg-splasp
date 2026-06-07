import { test, expect } from '@playwright/test';

test('Compare projects and assert metrics', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Your username' }).fill('user1');
  await page.getByRole('textbox', { name: 'Your password' }).fill('1234');
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  await page.getByRole('link', { name: 'Projects' }).click();
  
  const projectRows = page.locator('tr.cursor-pointer');
  
  await projectRows.nth(0).click();
  await page.getByRole('checkbox').first().check();

  await projectRows.nth(1).click();
  await page.getByRole('checkbox').nth(1).check();

  await page.getByRole('button', { name: 'Compare' }).click();

  await expect(page.getByRole('heading', { name: 'Comparison' })).toBeVisible();
  await expect(page.getByText('2 versions selected')).toBeVisible();

  await page.getByRole('button', { name: 'Duplication ratio' }).click();
  await expect(page.getByRole('button', { name: 'Duplication ratio' })).toHaveClass(/btn-primary/);
  
  await page.getByRole('button', { name: 'Total combinations' }).click();
  await page.getByRole('button', { name: 'Avg tangling' }).click();
  await page.getByRole('button', { name: 'Avg scattering' }).click();
  await page.getByRole('button', { name: 'Modified blocks' }).click();
  await page.getByRole('button', { name: 'Definition changes' }).click();
  await page.getByRole('button', { name: 'Feature guarded changes' }).click();
  await page.getByRole('button', { name: 'AST pipeline changes' }).click();
  
  await expect(page.getByRole('button', { name: 'AST pipeline changes' })).toHaveClass(/btn-primary/);

  await page.getByRole('button', { name: 'X' }).click();
  await expect(page.getByRole('heading', { name: 'Comparison' })).not.toBeVisible();
});