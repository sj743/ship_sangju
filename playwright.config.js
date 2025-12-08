// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    recordVideo: {
      dir: 'test-results/videos',
      size: { width: 1728, height: 1117 },
    },
  },
  reporter: [['html', { outputFolder: 'test-results/html-report', open: 'never' }]],
});
