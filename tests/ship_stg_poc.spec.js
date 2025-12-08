// playwright/ship_stg_poc.spec.js

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://staging.shipbaesong.com';
const TEST_ACCOUNT = {
  email: 'deleo.qa@gmail.com',
  password: 'deleo1234*'
};

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
}

async function handlePopup(page) {
  const popupCloseBtn = page.locator('//button[contains(text(), "오늘 그만 보기")]');
  while (await popupCloseBtn.isVisible({ timeout: 1000 })) {
    await popupCloseBtn.click();
    await page.waitForTimeout(500);
  }

  const modalBackdrop = page.locator('#modalContainer');
  while (await modalBackdrop.isVisible({ timeout: 1000 })) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }
}

async function captureStep(page, stepName, folder) {
  await page.screenshot({ path: path.join(folder, `${stepName}.png`), fullPage: true });
  await page.waitForTimeout(1000); // 시연용 1초 대기
}

test.use({ headless: false });

test('쉽배송 전체 시나리오 PoC', async ({ page }) => {
  const timestamp = getTimestamp();
  const resultDir = path.join(__dirname, 'results', `run_${timestamp}`);
  fs.mkdirSync(resultDir, { recursive: true });

  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await handlePopup(page);
  await captureStep(page, '01_main_page', resultDir);

  await page.click('text=이용안내');
  await expect(page).toHaveURL(`${BASE_URL}/info`);
  await captureStep(page, '02_info_page', resultDir);
  await page.getByRole('img', { name: '쉽배송 로고' }).click();
  await expect(page).toHaveURL(BASE_URL);

  await page.locator("//a[contains(text(), '배송신청')]").click();
  await expect(page).toHaveURL(`${BASE_URL}/request/main`);
  await captureStep(page, '03_request_page', resultDir);
  await page.getByRole('img', { name: '쉽배송 로고' }).click();
  await expect(page).toHaveURL(BASE_URL);

  await page.click('text=배송현황');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator("//button[contains(text(), '로그인')]")).toBeVisible();
  await captureStep(page, '04_delivery_login_required', resultDir);

  await page.click('text=고객지원');
  await expect(page).toHaveURL(`${BASE_URL}/support`);
  await captureStep(page, '05_support_page', resultDir);
  await page.getByRole('img', { name: '쉽배송 로고' }).click();
  await expect(page).toHaveURL(BASE_URL);

  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', TEST_ACCOUNT.email);
  await page.fill('input[name="password"]', TEST_ACCOUNT.password);
  await page.press('input[name="password"]', 'Enter');
  await page.waitForLoadState('networkidle');
  await expect(page.locator("//a[@class='btn btn-sm btn-outline-gray rounded-1 d-flex align-items-center']")).toBeVisible();
  await captureStep(page, '06_logged_in', resultDir);

  await page.click("//a[@class='btn btn-sm btn-outline-gray rounded-1 d-flex align-items-center']");
  await expect(page.locator('text=최근 신청한 내역이 없어요')).toBeVisible();
  await captureStep(page, '07_my_page', resultDir);
  await page.getByRole('img', { name: '쉽배송 로고' }).click();
  await expect(page).toHaveURL(BASE_URL);

  await page.click("//a[@class='btn btn-sm btn-outline-gray rounded-1 d-flex align-items-center']");
  await page.click("//p[contains(text(),'로그아웃')]");
  await page.click("//button[@id='commonConfirmModalConfirmButton']");
  await expect(page.locator(".btn.btn-sm.btn-outline-primary.rounded-1.d-flex.align-items-center")).toBeVisible();
  await captureStep(page, '08_logged_out', resultDir);
});