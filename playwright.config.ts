import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000, // 2 minutes for demo video test

  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
    viewport: { width: 1920, height: 1080 },
    screenshot: 'off',
    video: 'off'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true
  }
});
