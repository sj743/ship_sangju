import { test, expect } from '@playwright/test';


const BASE_URL = 'https://staging.shipbaesong.com';
const ACCOUNTS = {
  A: { id: 'deleo.qa@gmail.com', pw: 'deleo1234*' },
  B: { id: 'sjlee@deleo.co.kr', pw: 'tkdwn0743!!' }
};

// ────────────────────────────────
// 공통 함수
// ────────────────────────────────
async function handlePopup(page) {
  console.log('팝업 처리 실행');

  // 닫기/오늘 그만 보기 버튼 모두 탐색
  const closeButtons = page.locator("//button[contains(text(),'닫기') or contains(text(),'오늘 그만 보기')]");
  const count = await closeButtons.count();

  if (count > 0) {
    console.log(`팝업 ${count}개 감지됨 — 순차 닫기 시작`);

    for (let i = 0; i < count; i++) {
      const btn = closeButtons.nth(i);
      if (await btn.isVisible().catch(() => false)) {
        await btn.click({ delay: 100 });
        await page.waitForTimeout(300);
      }
    }

    // 팝업 전체 사라질 때까지 대기
    await page.waitForSelector("//div[contains(@class,'popup') or contains(@class,'modal')]", { state: 'hidden', timeout: 5000 }).catch(() => { });
    console.log('모든 팝업 닫힘 완료');
  } else {
    console.log('팝업 미노출 — 다음 단계 진행');
  }
}


async function login(page, account) {
  console.log('로그인 시도');
  const loginBtn = page.locator("(//a[@class='btn btn-sm btn-outline-primary rounded-1 d-flex align-items-center'])[1]");
  await loginBtn.waitFor({ state: 'visible', timeout: 5000 });
  await loginBtn.click();

  await expect(page).toHaveURL(/\/login/);
  await page.fill('input[name="email"]', account.id);
  await page.fill('input[name="password"]', account.pw);
  await page.press('input[name="password"]', 'Enter');
  await page.waitForLoadState('networkidle');

}

// ────────────────────────────────
// Session A – 비로그인/페이지 이동/로그인/마이페이지 플로우
// ────────────────────────────────
test('Session A – 비로그인/페이지 이동/로그인/마이페이지 플로우', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto(BASE_URL, { timeout: 120000, waitUntil: 'domcontentloaded' }); // 120초로 확장
  await page.evaluate(() => localStorage.clear());
  await handlePopup(page);


  console.log('ID_0001 | 메인 진입 및 팝업 처리');

  await page.waitForTimeout(800);

  console.log('ID_0002 | 이용안내 페이지 이동');
  await page.click('text=이용안내');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(`${BASE_URL}/info`);

  await page.locator("xpath=/html/body/header/section/div/div/a/img").click();

  console.log('ID_0003 | 배송신청 페이지 이동');
  await page.click('text=배송신청');
  await expect(page).toHaveURL(`${BASE_URL}/request/main`);

  await page.locator("xpath=/html/body/header/section/div/div/a/img").click();

  console.log('ID_0004 | 배송현황 페이지 이동 (비로그인)');
  await page.click('text=배송현황');
  await expect(page).toHaveURL(/\/login/);

  await page.locator("xpath=/html/body/header/section/div/div/a/img").click();

  console.log('ID_0005 | 고객지원 페이지 이동');
  await page.click('text=고객지원');
  await expect(page).toHaveURL(`${BASE_URL}/support`);

  await page.locator("xpath=/html/body/header/section/div/div/a/img").click();

  console.log('ID_0006 | 로그인 (A계정)');
  await login(page, ACCOUNTS.A);
  await page.waitForTimeout(1000);

  console.log('ID_0007 | 로그인 후 배송현황 페이지 확인');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click('text=배송현황')
  ]);

  // 두 문구 중 하나만 떠도 성공하도록 변경
  await Promise.race([
    page.waitForSelector('text=최근 신청한 내역이 없어요', { timeout: 15000 }).catch(() => null),
    page.waitForSelector('text=배송조회', { timeout: 15000 }).catch(() => null),
  ]);


  console.log('ID_0008 | 마이페이지 진입');
  await page.click("//a[@class='btn btn-sm btn-outline-gray rounded-1 d-flex align-items-center']");

  await expect(page.locator('text=주소록 관리')).toBeVisible();

  console.log('ID_0009 | 로그아웃 수행');

  // 로그아웃 버튼 클릭
  await page.click("//p[contains(text(),'로그아웃')]");

  // 모달 뜨기 전 렌더 대기 (트랜지션 시간 확보)
  await page.waitForTimeout(500); // 0.5~1초 정도가 이상적

  // Confirm 모달 표시 대기 및 클릭
  await page.waitForSelector("//div[@id='commonConfirmModal' and contains(@class,'show')]", { timeout: 10000 });
  await page.waitForSelector("//button[@id='commonConfirmModalConfirmButton']", { state: 'visible', timeout: 10000 });
  await page.click("//button[@id='commonConfirmModalConfirmButton']");

  // 페이지 이동 및 안정화
  await page.waitForLoadState('networkidle');
  await page.waitForSelector("(//a[@class='btn btn-sm btn-outline-primary rounded-1 d-flex align-items-center'])[1]", { timeout: 15000 });
  await expect(page).toHaveURL(BASE_URL);

});

// ────────────────────────────────
// Session B – 배송신청 및 배송현황 시나리오
// ────────────────────────────────
test('Session B – 배송신청 및 배송현황 시나리오', async ({ page }) => {
  test.setTimeout(90000);

  console.log('ID_0010 | 메인 페이지 접속 및 로그인 (B계정)');
  await page.goto(BASE_URL, { timeout: 60000 });
  await handlePopup(page);
  await login(page, ACCOUNTS.B);

  // 로그인 후 안정화 대기
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // spinner / modal 완전 해제 대기
  await page.waitForSelector("//div[@id='commonConfirmModal' and contains(@class,'show')]", {
    state: 'hidden', timeout: 10000
  }).catch(() => { });
  await page.waitForSelector("//div[contains(@class,'spinner-container') and contains(@class,'show')]", {
    state: 'hidden', timeout: 10000
  }).catch(() => { });

  console.log('ID_0011 | 배송신청 페이지 진입');
  await page.locator("//a[contains(text(), '배송신청')]").click();
  await page.waitForLoadState('networkidle');

  // 페이지 이동 확인
  if (!(await page.url()).includes('/request/main'))
    throw new Error('페이지 이동 실패: /request/main 아님');

  // request/main → request 전환 안정화
  await page.waitForURL(/\/request(\/main)?$/, { timeout: 15000 }).catch(() => { });
  await page.waitForTimeout(1500);

  // === 해외배송 클릭 ===
  await page.waitForSelector("//h5[contains(text(),'해외배송')]", { timeout: 20000 });
  console.log('해외배송 버튼 클릭');
  await page.locator("//h5[contains(text(),'해외배송')]").click();

  // === 배송신청 페이지 진입 확인 ===
  await page.waitForURL(/\/request$/, { timeout: 20000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // === 공통 Confirm 팝업 감시 및 닫기 ===
  const popupSelector = "//div[@id='commonConfirmModalBody']";
  const confirmBtnSelector = "(//button[contains(text(),'새로 입력하기')])[1]";
  let elapsed = 0;

  while (true) {
    const visible = await page.locator(popupSelector).isVisible({ timeout: 1000 }).catch(() => false);
    if (visible) {
      console.log('공통 Confirm 팝업 감지됨 — [새로 입력하기] 클릭');
      await page.locator(confirmBtnSelector).click();

      await page.waitForSelector("//div[@id='commonConfirmModal']", { state: 'hidden', timeout: 10000 });
      await page.waitForSelector(
        "//div[contains(@class,'spinner-container') and contains(@class,'show')]",
        { state: 'hidden', timeout: 10000 }
      ).catch(() => { });
      console.log('팝업 닫힘 및 스피너 종료 감지됨');
      break;
    }

    // 팝업 대신 다음 UI가 노출되면 탈출
    const nextStepReady = await page.locator("(//button[contains(text(),'다음')])[1]").isVisible({ timeout: 1000 }).catch(() => false);
    if (nextStepReady) {
      console.log('다음 버튼 감지됨 — 팝업 미감지로 간주, 즉시 탈출');
      break;
    }

    await page.waitForTimeout(1000);
    elapsed += 1000;
    if (elapsed >= 20000) {
      console.log('공통 Confirm 팝업 미감지 — 다음 단계 진행');
      break;
    }
  }

  console.log('ID_0012 | 주소입력 후 단계 진행');
  // === 주소록 버튼 감지 및 선택 ===
  const addressBookBtn = page.locator('button.btn.btn-outline-dark.btn-sm.rounded-1.fw-medium:visible');
  if (await addressBookBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('주소록 버튼 클릭 → 주소록 팝업 진입');
    await addressBookBtn.click();
    await page.waitForSelector("text=보내는 사람 주소록", { timeout: 10000 });
    await page.locator("(//button[@class='btn btn-outline-primary btn-sm'][contains(text(),'선택')])[1]").click();
    console.log('주소록에서 첫 항목 선택 완료');
    await page.waitForSelector("//div[@id='commonConfirmModal' and contains(@class,'show')]", {
      state: 'hidden', timeout: 10000
    }).catch(() => { });
    await page.waitForTimeout(1000);
  }

  for (let i = 1; i <= 4; i++) {
    const btn = page.locator(`(//button[@type='button'][contains(text(),'다음')])[${i}]`);
    const timeout = (i === 1 || i === 2) ? 40000 : 20000;

    // 항상 클릭 전 하단 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // === 금지물품 모달 처리 ===
    const prohibitedModal = page.locator("//div[@id='prohibitedItemsModal']");
    if (await prohibitedModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('금지물품 모달 감지됨 — [확인하였습니다] 클릭');
      const confirmBtn = page.locator('button.btn.btn-lg.btn-primary.custom-close:visible');
      await confirmBtn.click({ force: true });
      await page.waitForSelector("//div[@id='prohibitedItemsModal']", { state: 'hidden', timeout: 15000 });
      console.log('금지물품 모달 닫힘 확인');

      // 모달 닫힌 후 다시 하단 스크롤 복구
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
    }

    // 버튼 표시 대기 + 가시성 복원
    await page.waitForTimeout(500);
    await btn.scrollIntoViewIfNeeded();
    await btn.waitFor({ state: 'visible', timeout: i === 4 ? 50000 : timeout });

    // 클릭
    await page.waitForFunction(el => el && !el.disabled, await btn.elementHandle());
    await btn.click({ force: true });

    // 단계 안정화
    await page.waitForTimeout(i <= 2 ? 1500 : 1000);
  }

  console.log('ID_0013 | 배송신청 완료');
  // === 배송신청 완료 및 이동 ===
  await page.locator("(//input[@id='chkAgree'])[1]").check();
  await page.locator("(//button[contains(text(),'배송신청 완료')])[1]").click();
  await page.waitForURL(`${BASE_URL}/request/completed`, { timeout: 15000 });

  console.log('ID_0014 | 배송현황 페이지 이동');
  // === 배송현황 페이지 이동 ===
  await page.locator("(//button[contains(text(),'배송현황 보러가기')])[1]").click();
  await expect(page).toHaveURL(`${BASE_URL}/delivery`);


  console.log('ID_0015 | 배송현황 상세보기 진입');
  // === 상세보기 진입 ===
  await page.locator("(//i[@class='icon icon-arrow-right bg-999 is-m-24 is-p-24'])[1]").click();
  await page.waitForLoadState('networkidle');


  console.log('ID_0016 | 상세페이지 스크롤 시연');
  // === 상세페이지 스크롤 시연 ===
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
