// v4.6.0 — Playwright config. The static site is a single index.html; a
// local http.server on :8990 serves it. Tests use page.goto('/').
// Multi-browser projects are declared; only the chromium project runs by
// default on the dev container (firefox + webkit need `npx playwright
// install firefox webkit` first). WebKit slowMo:200 / Firefox slowMo:100
// keep timing stable on those engines when they are available.
const { devices, defineConfig } = require('/opt/node22/lib/node_modules/playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8990',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'], launchOptions: { slowMo: 100 } } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'],  launchOptions: { slowMo: 200 } } },
  ],
});
