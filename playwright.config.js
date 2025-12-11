
import { defineConfig } from '@playwright/test';


export default defineConfig({
  testDir: './tests',
  use: {
    storageState: undefined,  // 이전 세션 쿠키 공유 방지
    screenshot: 'only-on-failure',  // 실패 시 캡처
    video: {
      mode: 'on',              // 전체 시나리오 녹화
      dir: 'tests/video',      // tests/video 폴더에 저장
      size: { width: 1728, height: 1117 } // 영상 크기
    },
  },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
