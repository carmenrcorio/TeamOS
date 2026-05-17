// v4.3.0 — Playwright config. WebKit needs ~200ms slow-mo to keep step
// timing stable; Firefox needs ~100ms. Chromium runs at native speed.
// 30s navigation / 15s action timeouts cover the static-asset cold start.
const { devices } = require('@playwright/test');

module.exports = {
  timeout: 30000,
  use: {
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: { slowMo: 100 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        launchOptions: { slowMo: 200 },
      },
    },
  ],
};
