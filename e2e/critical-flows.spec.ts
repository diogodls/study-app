import { expect, test } from '@playwright/test';

test('loads the authentication entry on mobile', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'DevQuest' })).toBeVisible();
  await expect(page.locator('#auth-sign-in-tab')).toHaveClass(/active/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('validates account fields without contacting the backend', async ({ page }) => {
  await page.goto('/');
  await page.locator('#auth-submit-btn').click();
  await expect(page.getByText('Enter an email and a password with at least 6 characters.')).toBeVisible();
  await page.locator('#auth-sign-up-tab').click();
  await page.locator('#auth-email-input').fill('user@example.com');
  await page.locator('#auth-password-input').fill('password');
  await page.locator('#auth-submit-btn').click();
  await expect(page.getByText('Enter a valid Gemini API key.')).toBeVisible();
});

test('blocks authentication safely after connection is lost', async ({ page, context }) => {
  await page.goto('/');
  await page.locator('#auth-email-input').fill('user@example.com');
  await page.locator('#auth-password-input').fill('password');
  await context.setOffline(true);
  await page.locator('#auth-submit-btn').click();
  await expect(page.getByText('Connect to the internet to sign in.')).toBeVisible();
});

test('applies a resolved theme before rendering', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
