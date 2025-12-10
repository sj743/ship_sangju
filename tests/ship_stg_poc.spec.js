import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://staging.shipbaesong.com';
const ACCOUNTS = {
  A: { id: 'sjlee@deleo.co.kr', pw: 'tkdwn0743!!' },
};

// ────────────────────────────────
// 공통 함수
// ────────────────────────────────
async function handlePopup(page) {
  console.log('팝업 처리 실행');
  const popup = page.locator('#popup');
  if (await popup.isVisible({ timeout: 2000 })) {
    await page.click('text=다시 보지 않기');
  }
}

async function login(page, account) {
  console.log('로그인 시도');
  await page.click('text=로그인');
  await expect(page).toHaveURL(/\/login/);
  await page.fill('input[name="email"]', account.id);
  await page.fill('input[name="password"]', account.pw);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('text=로그아웃')).toBeVisible();
}

// ────────────────────────────────
// Session A
// ────────────────────────────────
test('Session A – 비로그인/페이지 이동/로그인/마이페이지 플로우', async ({ page }) => {
  console.log('ID_0001 | 메인 진입 및 팝업 처리');
  await page.goto(BASE_URL);
  await handlePopup(page);
  await page.waitForTimeout(800);

  console.log('ID_0002 | 이용안내 페이지 이동');
  await page.click('text=이용안내');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(`${BASE_URL}/info`);
  await page.waitForTimeout(800);
  await page.locator("xpath=/html/body/header/section/div/div/a/img").click();

  console.log('ID_0003 | 배송신청 페이지 이동');
  await page.click('text=배송신청');
  await expect(page).toHaveURL(`${BASE_URL}/request/main`);
  await page.waitForTimeout(800);
  await page.locator("xpath=/html/body/header/section/div/div/a/img").click();

  console.log('ID_0004 | 배송현황 페이지 이동 (비로그인)');
  await page.click('text=배송현황');
  await expect(page).toHaveURL(/\/login/);
  await page.waitForTimeout(800);
  await page.locator("xpath=/html/body/header/section/div/div/a/img").click();

  console.log('ID_0005 | 고객지원 페이지 이동');
  await page.click('text=고객지원');
  await expect(page).toHaveURL(`${BASE_URL}/support`);
  await page.waitForTimeout(800);
  await page.locator("xpath=/html/body/header/section/div/div/a/img").click();

  console.log('ID_0006 | 로그인');
  await login(page, ACCOUNTS.A);
  await page.waitForTimeout(1000);

  console.log('ID_0007 | 로그인 후 배송현황 페이지 확인');
  await page.click('text=배송현황');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('text=최근 신청한 내역이 없어요')).toBeVisible();

  console.log('ID_0008 | 마이페이지 진입');
  await page.click("//a[@class='btn btn-sm btn-outline-gray rounded-1 d-flex align-items-center']");
  await page.waitForLoadState('networkidle');
  await expect(page.locator('text=주소록 관리')).toBeVisible();

  console.log('ID_0009 | 로그아웃 수행');
  await page.click("//p[contains(text(),'로그아웃')]");
  await page.waitForSelector("//button[@id='commonConfirmModalConfirmButton']", { state: 'attached', timeout: 10000 });
  await page.waitForTimeout(500);
  await page.click("//button[@id='commonConfirmModalConfirmButton']");
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(BASE_URL);
});

// ────────────────────────────────
// Session B
// ────────────────────────────────
test('Session B – 배송신청 및 배송현황 시나리오', async ({ page }) => {
  test.setTimeout(60000);

  console.log('ID_0010 | 메인 페이지 접속 및 로그인');
  await page.goto(BASE_URL);
  await login(page, ACCOUNTS.A);
  await page.waitForTimeout(800);

  console.log('ID_0011 | 배송신청 페이지 진입');
  await page.click('text=배송신청');
  await expect(page).toHaveURL(`${BASE_URL}/request/main`);
  await page.waitForTimeout(800);

  console.log('ID_0012 | 주소 자동 입력 후 단계 진행');
  await page.locator("(//button[@type='button'][contains(text(),'다음')])[1]").click();
  await page.waitForTimeout(800);

  await page.waitForSelector("(//button[@type='button'][contains(text(),'다음')])[2]", { state: 'visible', timeout: 10000 });
  await page.locator("(//button[@type='button'][contains(text(),'다음')])[2]").click();
  await page.waitForTimeout(800);

  await page.waitForSelector("(//button[@type='button'][contains(text(),'다음')])[3]", { state: 'visible', timeout: 10000 });
  await page.locator("(//button[@type='button'][contains(text(),'다음')])[3]").click();
  await page.waitForTimeout(800);

  console.log('ID_0013 | 금지품목 모달 처리');
  const prohibitedBtn = page.locator("//div[@id='prohibitedItemsModal']//button[contains(text(),'확인하였습니다')]");
  if (await prohibitedBtn.isVisible({ timeout: 2000 })) {
    await prohibitedBtn.click();
    await page.waitForTimeout(800);
  }

  console.log('ID_0014 | 박스 정보 입력 및 신청 완료');
  await page.waitForSelector("(//button[@type='button'][contains(text(),'다음')])[4]", { state: 'visible', timeout: 10000 });
  await page.locator("(//button[@type='button'][contains(text(),'다음')])[4]").click();
  await page.waitForTimeout(800);
  await page.locator("(//input[@id='chkAgree'])[1]").check();
  await page.locator("(//button[contains(text(),'배송신청 완료')])[1]").click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(`${BASE_URL}/request/completed`);

  console.log('ID_0015 | 배송현황 보러가기 클릭');
  await expect(page.locator("(//button[contains(text(),'배송현황 보러가기')])[1]")).toBeVisible();
  await page.locator("(//button[contains(text(),'배송현황 보러가기')])[1]").click();
  await expect(page).toHaveURL(`${BASE_URL}/delivery`);
  await page.waitForTimeout(800);

  console.log('ID_0016 | 상세보기 진입');
  await page.locator("(//i[@class='icon icon-arrow-right bg-999 is-m-24 is-p-24'])[1]").click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  console.log('ID_0017 | 상세 페이지 스크롤 테스트');
  const scrollStep = 800;
  for (let pos = 0; pos <= 5000; pos += scrollStep) {
    await page.evaluate(y => window.scrollTo(0, y), pos);
    await page.waitForTimeout(300);
  }
  for (let pos = 5000; pos >= 0; pos -= scrollStep) {
    await page.evaluate(y => window.scrollTo(0, y), pos);
    await page.waitForTimeout(300);
  }

  console.log('ID_0018 | 메인 페이지 복귀');
  await page.locator("xpath=/html/body/header/section/div/div/a/img").click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(BASE_URL);
  await page.waitForTimeout(800);

  console.log('ID_0019 | 로그아웃');
  await page.click("//p[contains(text(),'로그아웃')]");
  await page.waitForSelector("//button[@id='commonConfirmModalConfirmButton']", { state: 'attached', timeout: 10000 });
  await page.waitForTimeout(500);
  await page.click("//button[@id='commonConfirmModalConfirmButton']");
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(BASE_URL);

  console.log('ID_0020 | 세션 B 완료');
});
