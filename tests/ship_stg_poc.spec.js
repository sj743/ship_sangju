// ship_stg_poc.spec.js
const { test, expect } = require('@playwright/test');
const path = require('path');

const BASE_URL = 'https://staging.shipbaesong.com';
const ACCOUNTS = {
  A: { email: 'deleo.qa@gmail.com', password: 'deleo1234*' },
  B: { email: 'sjlee@deleo.co.kr', password: 'tkdwn0743!!' }
};

async function handlePopup(page) {
  const popupCloseBtn = page.locator('//button[contains(text(), "오늘 그만 보기")]');
  if (await popupCloseBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await popupCloseBtn.click();
    await page.waitForTimeout(500);
  }
  const modalBackdrop = page.locator('#modalContainer');
  if (await modalBackdrop.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }
}

async function login(page, { email, password }) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.press('input[name="password"]', 'Enter');
  await page.waitForLoadState('networkidle');
}

test.describe.serial('쉽배송 PoC 자동화 시나리오', () => {

  // --------------------------
  // Session A : 기본 플로우 (복원 완료)
  // --------------------------
  test('Session A – 비로그인/페이지 이동/로그인/마이페이지 플로우', async ({ page }) => {
    await page.goto(BASE_URL);
    await handlePopup(page);

    // ① 이용안내
    await page.click('text=이용안내');
    await expect(page).toHaveURL(`${BASE_URL}/info`);
    await page.getByRole('img', { name: '쉽배송 로고' }).click();

    // ② 배송신청 페이지 접근
    await page.click('text=배송신청');
    await expect(page).toHaveURL(`${BASE_URL}/request/main`);
    await page.getByRole('img', { name: '쉽배송 로고' }).click();

    // ③ 배송현황 (비로그인 시 로그인 유도 확인)
    await page.click('text=배송현황');
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await page.getByRole('img', { name: '쉽배송 로고' }).click();

    // ④ 고객지원 페이지 접근
    await page.click('text=고객지원');
    await expect(page).toHaveURL(`${BASE_URL}/support`);
    await page.getByRole('img', { name: '쉽배송 로고' }).click();

    // ⑤ 로그인
    await login(page, ACCOUNTS.A);

    // ⑥ 로그인 후 배송현황 페이지
    await page.click('text=배송현황');
    await expect(page).toHaveURL(`${BASE_URL}/delivery`);
    await expect(page.locator('text=최근 신청한 내역이 없어요')).toBeVisible();

    // ⑦ 마이페이지 진입
    await page.click("//a[@class='btn btn-sm btn-outline-gray rounded-1 d-flex align-items-center']");
    await expect(page.locator('text=주소록 관리')).toBeVisible();

    // ⑧ 로그아웃
    await page.click("//p[contains(text(),'로그아웃')]");
    await page.click("//button[@id='commonConfirmModalConfirmButton']");
    await expect(page).toHaveURL(BASE_URL);
  });

  // --------------------------
  // Session B : 배송신청 + 배송현황
  // --------------------------
  test('Session B – 배송신청 및 배송현황 시나리오', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(BASE_URL);
    await handlePopup(page);
    await login(page, ACCOUNTS.B);

    // 배송신청
    await page.locator("//a[contains(text(), '배송신청')]").click();
    await expect(page).toHaveURL(`${BASE_URL}/request/main`);

    await page.locator("(//div[@class='select-delivery-service__item p-20 p-lg-32'])[1]").click();
    await expect(page).toHaveURL(`${BASE_URL}/request`);

    await page.locator("(//button[@type='button'][contains(text(),'다음')])[1]").click();
    await page.locator("(//button[@type='button'][contains(text(),'다음')])[2]").click();
    await page.locator("(//button[@type='button'][contains(text(),'다음')])[3]").click();

    // 금지물품 확인 모달
    const prohibitedModal = page.locator("//div[@id='prohibitedItemsModal']//button[contains(text(),'확인하였습니다')]");
    if (await prohibitedModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      await prohibitedModal.click();
      await page.waitForTimeout(1000);
    }

    await page.waitForSelector("(//button[@type='button'][contains(text(),'다음')])[4]", {
      state: 'visible', timeout: 20000
    });
    await page.locator("(//button[@type='button'][contains(text(),'다음')])[4]").click();
    await page.locator("(//input[@id='chkAgree'])[1]").check();
    await page.locator("(//button[contains(text(),'배송신청 완료')])[1]").click();
    await page.waitForURL(`${BASE_URL}/request/completed`, { timeout: 15000 });

    // 배송현황
    await expect(page.locator("(//button[contains(text(),'배송현황 보러가기')])[1]")).toBeVisible();
    await page.getByRole('img', { name: '쉽배송 로고' }).click();
    await page.click('text=배송현황');
    await expect(page).toHaveURL(`${BASE_URL}/delivery`);

    // 상세보기
    await page.locator("(//i[@class='icon icon-arrow-right bg-999 is-m-24 is-p-24'])[1]").click();
    await page.waitForLoadState('networkidle');

    // 스크롤 시연
    const scrollStep = 800;
    for (let pos = 0; pos <= 5000; pos += scrollStep) {
      await page.evaluate(y => window.scrollTo(0, y), pos);
      await page.waitForTimeout(200);
    }
    for (let pos = 5000; pos >= 0; pos -= scrollStep) {
      await page.evaluate(y => window.scrollTo(0, y), pos);
      await page.waitForTimeout(200);
    }
  });
});
