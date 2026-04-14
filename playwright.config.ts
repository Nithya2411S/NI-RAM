import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4321',
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Start dev server before running tests.
  // reuseExistingServer: false ensures we always own the server on 4321.
  webServer: {
    command: 'npm run dev -- --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
