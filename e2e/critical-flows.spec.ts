import { expect, test } from '@playwright/test';

test('loads the authentication entry on mobile', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toContainText(/DevQuest/i);
});
