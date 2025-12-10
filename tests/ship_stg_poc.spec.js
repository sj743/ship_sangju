const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://staging.shipbaesong.com';
const ACCOUNTS = {
  A: { email: 'deleo.qa@gmail.com', password: 'deleo1234*' },
  B: { email: 'sjlee@deleo.co.kr', password: 'tkdwn0743!!' }
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

async function captureStep(page, name, folder) {
  await page.screenshot({ path: path.join(folder, `${name}.png`), fullPage: true });
  await page.waitForTimeout(800);
}

async function login(page, { email, password }) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.press('input[name="password"]', 'Enter');
  await page.waitForLoadState('networkidle');
}

// 병렬 실행 활성화
test.describe.serial('쉽배송 PoC 세션 순차 시나리오', () => {

  // --------------------------
  // Session A : 기본 플로우
  // --------------------------
  test('Session A – 비로그인/로그인/마이페이지 플로우', async ({ page }) => {
    const timestamp = getTimestamp();
    const resultDir = path.join(__dirname, 'results', `sessionA_${timestamp}`);
    fs.mkdirSync(resultDir, { recursive: true });

    await page.goto(BASE_URL);
    await handlePopup(page);
    await captureStep(page, '01_main', resultDir);

    // 이용안내 이동
    await page.click('text=이용안내');
    await expect(page).toHaveURL(`${BASE_URL}/info`);
    await captureStep(page, '02_info', resultDir);
    await page.getByRole('img', { name: '쉽배송 로고' }).click();

    // 로그인
    await login(page, ACCOUNTS.A);
    await captureStep(page, '03_logged_in', resultDir);

    // 마이페이지 이동
    await page.click("//a[@class='btn btn-sm btn-outline-gray rounded-1 d-flex align-items-center']");
    await expect(page.locator('text=최근 신청한 내역이 없어요')).toBeVisible();
    await captureStep(page, '04_my_page', resultDir);

    // 로그아웃
    await page.click("//p[contains(text(),'로그아웃')]");
    await page.click("//button[@id='commonConfirmModalConfirmButton']");
    await captureStep(page, '05_logged_out', resultDir);
  });

  // --------------------------
  // Session B : 배송신청 + 배송현황
  // --------------------------
  test('Session B – 배송신청 및 배송현황 시나리오', async ({ page }) => {
    test.setTimeout(60000)
    const timestamp = getTimestamp();
    const resultDir = path.join(__dirname, 'results', `sessionB_${timestamp}`);
    fs.mkdirSync(resultDir, { recursive: true });

    await page.goto(BASE_URL);
    await handlePopup(page);
    await login(page, ACCOUNTS.B);
    await captureStep(page, '01_logged_in', resultDir);

    // 배송신청
    await page.locator("//a[contains(text(), '배송신청')]").click();
    await expect(page).toHaveURL(`${BASE_URL}/request/main`);
    await captureStep(page, '02_request_main', resultDir);

    await page.locator("(//div[@class='select-delivery-service__item p-20 p-lg-32'])[1]").click();
    await expect(page).toHaveURL(`${BASE_URL}/request`);
    await captureStep(page, '03_request_page', resultDir);

    await page.locator("(//button[@type='button'][contains(text(),'다음')])[1]").click();
    await page.locator("(//button[@type='button'][contains(text(),'다음')])[2]").click();
    await page.locator("(//button[@type='button'][contains(text(),'다음')])[3]").click();

    await page.waitForTimeout(2000);

    const prohibitedModal = page.locator("//div[@id='prohibitedItemsModal']//button[@type='button'][contains(text(),'확인하였습니다')]");
    if (await prohibitedModal.isVisible({ timeout: 3000 })) {
      await prohibitedModal.click();
      await page.waitForTimeout(2000);
    }

    await page.waitForSelector("(//button[@type='button'][contains(text(),'다음')])[4]", {
      state: 'visible',
      timeout: 20000   // 최대 20초까지 기다림
    });
    await page.waitForTimeout(1000); // 렌더링/애니메이션 대기
    await page.locator("(//button[@type='button'][contains(text(),'다음')])[4]").click();
    await page.waitForTimeout(1000);

    await page.locator("(//input[@id='chkAgree'])[1]").check();
    await page.waitForTimeout(500);
    await page.locator("(//button[contains(text(),'배송신청 완료')])[1]").click();
    await page.waitForTimeout(3500);


    await expect(page).toHaveURL(`${BASE_URL}/request/completed`);
    await captureStep(page, '04_request_completed', resultDir);

    // 배송현황
    await expect(page.locator("(//button[contains(text(),'배송현황 보러가기')])[1]")).toBeVisible();
    await page.getByRole('img', { name: '쉽배송 로고' }).click();
    await page.click('text=배송현황');
    await expect(page).toHaveURL(`${BASE_URL}/delivery`);
    await captureStep(page, '05_delivery_main', resultDir);

    await page.locator("(//i[@class='icon icon-arrow-right bg-999 is-m-24 is-p-24'])[1]").click();
    await page.waitForLoadState('networkidle');
    await captureStep(page, '06_delivery_detail', resultDir);

    const scrollStep = 800;
    for (let pos = 0; pos <= 5000; pos += scrollStep) {
      await page.evaluate(y => window.scrollTo(0, y), pos);
      await page.waitForTimeout(300);
    }
    for (let pos = 5000; pos >= 0; pos -= scrollStep) {
      await page.evaluate(y => window.scrollTo(0, y), pos);
      await page.waitForTimeout(300);
    }
    await captureStep(page, '07_delivery_detail_scrolled', resultDir);
  });
});
