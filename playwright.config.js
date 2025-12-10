// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    screenshot: 'only-on-failure',  // 실패 시에만 스크린샷 저장
    video: 'on',                    // 전체 시나리오 영상 자동 녹화
  },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
