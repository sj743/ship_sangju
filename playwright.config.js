
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
    viewport: { width: 1728, height: 1117 },
  },
  // ▼▼▼ 수정된 부분 ▼▼▼
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }], // 기존 HTML 리포트
    ['json', { outputFile: 'test-results.json' }]                   // ★ 추가된 JSON 리포트
  ],
});

