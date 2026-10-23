import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against the dev server with the local backend
// (PGlite and built-in auth), in the installed Chrome.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PPC_BASE_URL ?? "http://localhost:3000",
    channel: "chrome",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
  },
  webServer: process.env.PPC_BASE_URL
    ? undefined
    : { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 180_000 },
});
