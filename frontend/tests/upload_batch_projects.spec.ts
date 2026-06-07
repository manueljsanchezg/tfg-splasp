import { test, expect } from '@playwright/test';

test('Upload batch projects via URLs and assert success', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Your username' }).fill('user1');
  await page.getByRole('textbox', { name: 'Your password' }).fill('1234');
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  await page.getByRole('link', { name: 'Sessions' }).click();
  
  const rowSession1 = page.getByRole('row', { name: /Session 1/i }).first();
  await rowSession1.getByRole('button', { name: 'View' }).click();

  await page.getByRole('button', { name: 'Upload projects' }).click();
  
  await expect(page.getByRole('dialog')).toBeVisible();

  const mockUrls = 'https://snap.berkeley.edu/project?username=pxt3852&projectname=Maze%20with%20features%20%28to%20fork%29\nhttps://snap.berkeley.edu/project?username=javclamar&projectname=Maze%20with%20features%20%28to%20fork%29%20Javclamar';
  
  await page.getByRole('textbox').fill(mockUrls);
  await page.getByRole('button', { name: 'Upload', exact: true }).click();

  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });
});