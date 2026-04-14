/**
 * chart.spec.ts
 * E2E tests for the NIRAM Vedic Astrology app.
 * Rule 8: Mandatory End-to-End Testing with Playwright.
 *
 * Covers:
 * 1. Page loads correctly
 * 2. Sidebar is visible and collapsible
 * 3. Birth form renders all fields
 * 4. Form validation — empty submit
 * 5. Chart generation — full happy path
 * 6. Chart style switching (North/South/East)
 * 7. Reset returns to form
 */

import { test, expect } from '@playwright/test';

const VALID_BIRTH = {
  name:  'Test User',
  date:  '1990-08-15',
  time:  '06:30',
  place: 'Chennai, India',
};

/**
 * Wait for React client:load hydration to complete.
 * We know hydration is done when the submit button is enabled
 * (it starts enabled on SSR too, so we wait for networkidle which
 * fires after the hydration scripts have run).
 */
async function waitForHydration(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle');
}

// ─── 1. Page Loads ────────────────────────────────────────────────────────────

test('page loads with NIRAM title and form', async ({ page }) => {
  await page.goto('/');
  await waitForHydration(page);
  await expect(page).toHaveTitle(/NIRAM/i);
  await expect(page.getByLabel(/full name/i)).toBeVisible();
});

// ─── 2. Sidebar ───────────────────────────────────────────────────────────────

test('sidebar is visible and can be collapsed', async ({ page }) => {
  await page.goto('/');
  await waitForHydration(page);

  const sidebar   = page.locator('nav.sidebar');
  const toggleBtn = sidebar.locator('button[aria-label]');

  await expect(sidebar).toBeVisible();
  await expect(toggleBtn).toBeVisible();

  await toggleBtn.click();
  await expect(sidebar).toHaveClass(/collapsed/, { timeout: 5_000 });

  await toggleBtn.click();
  await expect(sidebar).not.toHaveClass(/collapsed/, { timeout: 5_000 });
});

// ─── 3. Form Fields ───────────────────────────────────────────────────────────

test('birth form has all required fields', async ({ page }) => {
  await page.goto('/');
  await waitForHydration(page);

  await expect(page.getByLabel(/full name/i)).toBeVisible();
  await expect(page.getByLabel(/date of birth/i)).toBeVisible();
  await expect(page.getByLabel(/time of birth/i)).toBeVisible();
  await expect(page.getByLabel(/place of birth/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /generate birth chart/i })).toBeVisible();
});

// ─── 4. Form Validation ───────────────────────────────────────────────────────

test('form does not submit with empty fields', async ({ page }) => {
  await page.goto('/');
  await waitForHydration(page);

  await page.getByRole('button', { name: /generate birth chart/i }).click();
  // Form must still be visible — chart must NOT appear
  await expect(page.getByLabel(/full name/i)).toBeVisible();
});

// ─── Helper: fill form and wait for chart ─────────────────────────────────────

async function generateChart(page: import('@playwright/test').Page) {
  await page.goto('/');
  await waitForHydration(page);

  await page.getByLabel(/full name/i).fill(VALID_BIRTH.name);
  await page.getByLabel(/date of birth/i).fill(VALID_BIRTH.date);
  await page.getByLabel(/time of birth/i).fill(VALID_BIRTH.time);
  await page.getByLabel(/place of birth/i).fill(VALID_BIRTH.place);
  await page.getByRole('button', { name: /generate birth chart/i }).click();

  // Wait for chart tabs — geocoding + SSR calculation takes a few seconds
  await expect(
    page.getByRole('button', { name: /north indian/i })
  ).toBeVisible({ timeout: 40_000 });
}

// ─── 5. Happy Path — Chart Generation ────────────────────────────────────────

test('generates a Vedic birth chart with valid inputs', async ({ page }) => {
  await generateChart(page);

  await expect(page.getByText(VALID_BIRTH.name)).toBeVisible();
  await expect(page.getByRole('button', { name: /south indian/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /east indian/i })).toBeVisible();
});

// ─── 6. Chart Style Switching ─────────────────────────────────────────────────

test('can switch between North, South, and East chart styles', async ({ page }) => {
  await generateChart(page);

  await page.getByRole('button', { name: /south indian/i }).click();
  await expect(page.getByRole('button', { name: /south indian/i })).toHaveClass(/active/);

  await page.getByRole('button', { name: /east indian/i }).click();
  await expect(page.getByRole('button', { name: /east indian/i })).toHaveClass(/active/);

  await page.getByRole('button', { name: /north indian/i }).click();
  await expect(page.getByRole('button', { name: /north indian/i })).toHaveClass(/active/);
});

// ─── 7. Reset ─────────────────────────────────────────────────────────────────

test('reset button returns to the form', async ({ page }) => {
  await generateChart(page);

  await page.getByRole('button', { name: /generate another chart/i }).click();
  await expect(page.getByLabel(/full name/i)).toBeVisible();
});
