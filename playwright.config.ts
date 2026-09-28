import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: "http://127.0.0.1:6143",
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } }
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 393, height: 852 } }
    }
  ],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 6143 --strictPort",
    url: "http://127.0.0.1:6143",
    reuseExistingServer: false,
    timeout: 120_000
  }
});
