
import { defineConfig } from '@playwright/test';


export default defineConfig({
  testDir: './tests',
  use: {
    storageState: undefined, // 세션 공유 방지
    screenshot: 'only-on-failure',
    video: {
      mode: 'on',
      dir: 'tests/video',
      size: { width: 1920, height: 1080 } // 영상 해상도
    },
    viewport: { width: 1920, height: 1080 }, // 브라우저 창 크기 통일
    launchOptions: {
      args: ['--start-maximized'], // 실제 브라우저 창 최대화
    },
  },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
});

