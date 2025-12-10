// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    screenshot: 'only-on-failure',  // 실패 시 캡처
    video: {
      mode: 'on',                   // 전체 시나리오 녹화
      dir: 'tests/video',           // ✅ tests/video 폴더에 저장
      size: { width: 1728, height: 1117 }, // 영상 크기 (옵션)
    },
  },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
