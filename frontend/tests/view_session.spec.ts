import { test, expect } from '@playwright/test';

test('View session details and assert contents', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Your username' }).fill('user1');
  await page.getByRole('textbox', { name: 'Your password' }).fill('1234');
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  await page.getByRole('link', { name: 'Sessions' }).click();
  
  const rowSession1 = page.getByRole('row', { name: /Session 1/i }).first();
  await rowSession1.getByRole('button', { name: 'View' }).click();

  const projectRows = page.locator('tr.cursor-pointer');
  await projectRows.nth(0).click();

  await page.getByRole('button', { name: 'View Results' }).first().click();

  await page.getByRole('button', { name: 'Feedback' }).click();
  await expect(page.getByText(/feedback/i).first()).toBeVisible();

  const closeButton = page.getByRole('button', { name: 'X' });
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }
});