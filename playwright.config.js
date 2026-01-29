
import { defineConfig } from '@playwright/test';



export default defineConfig({
  testDir: './tests',
  use: {
    storageState: undefined,
    screenshot: 'only-on-failure',

    video: 'on', 
    
    viewport: { width: 1728, height: 1117 },
  },
  
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }], 
    ['json', { outputFile: 'test-results.json' }]                
  ],
});

