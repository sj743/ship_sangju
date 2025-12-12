
import { defineConfig } from '@playwright/test';


export default defineConfig({
  testDir: './tests',
  use: {
    storageState: undefined,
    screenshot: 'only-on-failure',
    video: {
      mode: 'on',
      dir: 'tests/video'
    },
    viewport: { width: 1280, height: 720 }, // ★ 16:9 기준
  },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
});

