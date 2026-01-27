import { test, expect } from '@playwright/test';

test.beforeEach(async () => {
  test.setTimeout(0);
});

const BASE_URL = 'https://staging.shipbaesong.com';

/* =========================
 * 계정 정보 (원본 유지)
 * ========================= */
const ACCOUNTS = {
  A: { id: '_qa-@f5.si', pw: 'deleo1234*' },
  B: { id: 'sjlee@deleo.co.kr', pw: 'tkdwn0743!!' },
  C: { id: 'deleo.qa@gmail.com', pw: 'deleo1234*' }
};

/* =========================
 * 공통 함수 (원본 유지)
 * ========================= */
async function handlePopup(page) {
  const closeButtons = page.locator(
    "//button[contains(text(),'닫기') or contains(text(),'오늘 그만 보기')]"
  );
  const count = await closeButtons.count();

  if (count > 0) {


    for (let i = 0; i < count; i++) {
      const btn = closeButtons.nth(i);
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }
  }
}

async function goToMain(page) {
  await page.setViewportSize({ width: 1728, height: 1117 });
  await page.locator('#header a.navbar-brand[href="/"]').click();
  await page.waitForLoadState('networkidle');


  await handlePopup(page);
}

/* =========================
 * Session A – 퓨어계정 / 데이터 없음 상태 검증
 * ========================= */
test('Session A – 퓨어계정 / 데이터 없음 상태 검증', async ({ page }) => {

  console.log("=================================");
  console.log(" Session A START");
  console.log(" 퓨어 계정 / 데이터 없음 상태 검증");
  console.log("=================================");

  /* ID_0001 | 메인 진입 및 팝업 처리 */
  console.log('ID_0001 | 메인 진입 및 팝업 처리');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await handlePopup(page);

  /* ID_0002 | 이용안내 페이지 이동(비로그인) */
  console.log('ID_0002 | 이용안내 페이지 이동(비로그인)');
  await page.click('text=이용안내');
  await expect(page).toHaveURL(/info/);
  await goToMain(page);

  /* ID_0003 | 배송신청 페이지 이동(비로그인) */
  console.log('ID_0003 | 배송신청 페이지 이동(비로그인)');
  await page.click('text=배송신청');
  await expect(page).toHaveURL(/request\/main/);
  await goToMain(page);

  /* ID_0004 | 배송현황 페이지 이동(비로그인) */
  console.log('ID_0004 | 배송현황 페이지 이동(비로그인)');
  await page.click('text=배송현황');
  await expect(page).toHaveURL(/login\?redirect=%2Fdelivery/);
  await goToMain(page);

  /* ID_0005 | 고객지원 페이지 이동(비로그인) */
  console.log('ID_0005 | 고객지원 페이지 이동(비로그인)');
  await page.click('text=고객지원');
  await expect(page).toHaveURL(/support/);
  await goToMain(page);

  /* ID_0006 | 로그인(퓨어계정) */
  console.log('ID_0006 | 로그인(퓨어계정)');
  const loginBtn = page.locator(
    '#header .btn.btn-sm.btn-outline-primary.rounded-1.d-flex.align-items-center'
  );

  await loginBtn.waitFor({ state: 'visible' });
  await loginBtn.click();

  await expect(page).toHaveURL(/\/login/);

  await page.locator("//input[@id='email']").fill(ACCOUNTS.A.id);
  await page.locator("//input[@id='password']").fill(ACCOUNTS.A.pw);
  await page.locator("button[name='btnSubmit']").click();
  await page.waitForLoadState('networkidle');


  /* ID_0007 | 배송현황 페이지 확인 */
  console.log('ID_0007 | 배송현황 페이지 확인');
  await page.click('text=배송현황');
  await expect(
    page.getByRole('button', { name: /해외배송\s*신청하기/i })
  ).toBeVisible();

  /* ID_0008 | 최근신청 내역 미제공 체크 */
  console.log('ID_0008 | 최근신청 내역 미제공 체크');
  await page.locator(
    'a.btn.btn-sm.btn-outline-gray.rounded-1.d-flex.align-items-center'
  ).click();
  await expect(
    page.getByRole('button', { name: /해외배송\s*신청하기/i })
  ).toBeVisible();

  /* ID_0009 | 최근신청 내역 > 해외배송 신청하기 */
  console.log('ID_0009 | 최근신청 내역 > 해외배송 신청하기');
  const applyBtn = page.getByRole('button', { name: '해외배송 신청하기' });
  await applyBtn.waitFor({ state: 'visible' });
  await applyBtn.click();

  await expect(page).toHaveURL(/request\/main/);
  await goToMain(page);

  /* ID_0010 | 주소록 관리 > 팝업 내 주소 내역 미제공 */
  console.log('ID_0010 | 주소록 관리 > 팝업 내 주소 내역 미제공');
  await page.locator(
    'a.btn.btn-sm.btn-outline-gray.rounded-1.d-flex.align-items-center'
  ).click();
  await page.locator("//p[contains(text(),'보내는 사람 주소록')]").click();
  await page.locator('#addressBookModal').waitFor({ state: 'attached' });
  await page.waitForSelector('#addressBookModal.show');

  await expect(
    page.locator('#addressBookModal').locator('text=저장된 주소 내역이 없습니다')
  ).toBeVisible();

  await page.locator('#addressBookModal')
    .locator('button.icon-close.icon.is-m-24.is-p-32.bg-333.ms-auto.custom-close:visible')
    .click();

  /* ID_0011 | 주소록 > 새로운 주소 추가 시 화면 변경 */
  console.log('ID_0011 | 주소록 > 새로운 주소 추가 시 화면 변경');

  const confirmModal = page.locator('#commonConfirmModal');
  const confirmBtn = page.locator("#commonConfirmModalConfirmButton");

  // ── 보내는 사람 ──
  await page.locator("//p[contains(text(),'보내는 사람 주소록')]").click();
  await page.locator("//button[contains(text(),'+새로운 주소 추가')]").click();

  await expect(page.locator('#senderAddressDetailModalTitle')).toHaveText('새로운 주소 추가');

  await page.locator('#senderAddressDetailModal').waitFor({ state: 'visible' });
  await page.locator("//*[@id='senderAddressDetailModal']/div/div/div[1]/button").click();

  try {
    await confirmModal.waitFor({ state: 'visible', timeout: 3000 });
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    await confirmModal.waitFor({ state: 'hidden', timeout: 5000 });
  } catch (e) { }

  await expect(page.locator('#senderAddressDetailModal')).toBeHidden({ timeout: 10000 });

  await page.locator('#addressBookModal')
    .locator('button.custom-close:visible')
    .click();


  // ── 받는 사람 ──
  await page.locator("//p[contains(text(),'받는 사람 주소록')]").click();
  await page.locator("//button[contains(text(),'+새로운 주소 추가')]").click();

  await expect(page.locator('#senderAddressDetailModalTitle')).toHaveText('새로운 주소 추가');

  // 화면에 Receiver 모달이 떴으면 그거 닫고, 아니면 Sender 모달 닫기
  if (await page.locator('#receiverAddressDetailModal').isVisible()) {
    await page.locator("//*[@id='receiverAddressDetailModal']/div/div/div[1]/button").click();
  } else {
    await page.locator('#senderAddressDetailModal').waitFor({ state: 'visible' });
    await page.locator("//*[@id='senderAddressDetailModal']/div/div/div[1]/button").click();
  }

  try {
    await confirmModal.waitFor({ state: 'visible', timeout: 3000 });
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    await confirmModal.waitFor({ state: 'hidden', timeout: 5000 });
  } catch (e) { }

  await expect(page.locator('#senderAddressDetailModal')).toBeHidden({ timeout: 10000 });
  await expect(page.locator('#receiverAddressDetailModal')).toBeHidden({ timeout: 10000 });

  await page.locator('#addressBookModal')
    .locator('button.custom-close:visible')
    .click();


  /* ID_0012 | 로그아웃 수행 */
  console.log('ID_0012 | 로그아웃 수행');
  await page.locator("button#btnLogout").click();

  const logoutConfirmBtn = page.locator(
    "//button[@id='commonConfirmModalConfirmButton']"
  );

  await logoutConfirmBtn.waitFor({ state: 'visible' });
  await logoutConfirmBtn.click();
  await page.waitForURL(BASE_URL, { timeout: 5000 });

  /* ID_0013 | 메인페이지 > 해외배송 신청하기 랜딩 확인 */
  console.log('ID_0013 | 메인페이지 > 해외배송 신청하기 랜딩 확인');
  await page.click('text=배송신청');
  await expect(page).toHaveURL(`${BASE_URL}/request/main`);
  await goToMain(page);

  /* ID_0014 | 배송조회_tracking 페이지 랜딩 확인 */
  console.log('ID_0014 | 배송조회_tracking 페이지 랜딩 확인');

  const trackingNo = Math.floor(Math.random() * 1_000_000_0000).toString();
  await page.locator('#deleoTrackingNo').fill(trackingNo);

  const [trackingPage] = await Promise.all([
    page.context().waitForEvent('page'),
    page.locator(
      "//button[@onclick='fn_deleoTracePopup()']//i[@class='icon icon-search is-m-20 is-p-24 bg-333']"
    ).click()
  ]);

  await trackingPage.waitForLoadState('domcontentloaded');
  await expect(trackingPage).toHaveURL(
    `https://tracking-staging.deleo.co.kr/?trackingNo=${trackingNo}`
  );

  await trackingPage.close();

  /* ID_0015 | 메인 배너 UI 노출 확인 */
  console.log('ID_0015 | 메인 배너 UI 노출 확인');
  const mainBanner = page.locator('.promotion-banner__wrap').first();
  await expect(mainBanner).toBeVisible({ timeout: 10000 });

  /* ID_0016 | 챗봇 펼치기 > 닫기 확인 */
  console.log('ID_0016 | 챗봇 펼치기 > 닫기 확인');

  await page.locator("//div[@id='chat-icon']//p//img").click();
  await page.waitForTimeout(5000);

  const chatFrame = page.frameLocator('#chat-frame');
  const realCloseBtn = chatFrame.locator('//*[@id="header"]/div[3]/a[2]');

  await realCloseBtn.waitFor({ state: 'attached', timeout: 10000 });
  await realCloseBtn.evaluate(node => node.click());

  const chatConfirmBtn = chatFrame.locator('//*[@id="app"]/div/div/div[2]/a[2]');

  await chatConfirmBtn.waitFor({ state: 'visible', timeout: 5000 });
  await chatConfirmBtn.evaluate(node => node.click());

  await expect(chatConfirmBtn).toBeHidden({ timeout: 10000 });
  await expect(realCloseBtn).toBeHidden({ timeout: 10000 });


  /* ID_0017 | 화면 최하단까지 스크롤(UI체크) */
  console.log('ID_0017 | 화면 최하단까지 스크롤(UI체크)');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));


  const footer = page.locator('footer').first();
  await expect(footer).toBeInViewport({ timeout: 5000 });

  /* ID_0018 | 비즈니스 고객 [서비스 이용하기] 선택 */
  console.log('ID_0018 | 비즈니스 고객 [서비스 이용하기] 선택');

  const [newPage] = await Promise.all([
    page.context().waitForEvent('page'),
    page.locator("//a[contains(text(),'서비스 이용하기')] ").click()
  ]);

  await newPage.waitForLoadState('domcontentloaded');

  await expect(newPage).toHaveURL(/one-express\.kr/);

  await newPage.close();


  /* ID_0019 | 푸터영역 SNS 랜딩 확인 */
  console.log('ID_0019 | 푸터영역 SNS 랜딩 확인');

  const [instaPage] = await Promise.all([
    page.context().waitForEvent('page'),
    page.locator('//*[@id="footer"]/section/div/div[1]/div/div/span[1]/a').click()
  ]);

  await instaPage.waitForLoadState('domcontentloaded');
  await expect(instaPage).toHaveURL(/instagram\.com\/shipbaesong_official/);
  await instaPage.close();

  const [blogPage] = await Promise.all([
    page.context().waitForEvent('page'),
    page.locator('//*[@id="footer"]/section/div/div[1]/div/div/span[2]/a').click()
  ]);

  await blogPage.waitForLoadState('domcontentloaded');
  await expect(blogPage).toHaveURL(/blog\.naver\.com\/shipbaesong/);
  await blogPage.close();


  /* ID_0020 | 푸터영역 약관 팝업 노출 확인 */
  console.log('ID_0020 | 푸터영역 약관 팝업 노출 확인');

  const closeSelector = 'button.icon-close.icon.is-m-24.is-p-32.bg-333.custom-close.ms-auto:visible';

  // 1. 서비스이용약관
  await page.getByRole('button', { name: '서비스이용약관' }).click();
  await page.waitForTimeout(1000); // 팝업 애니메이션 대기
  await page.locator(closeSelector).click();
  await page.waitForTimeout(500);  // 닫힘 대기

  // 2. 개인정보처리방침
  await page.getByRole('button', { name: '개인정보처리방침' }).click();
  await page.waitForTimeout(1000);
  await page.locator(closeSelector).click();
  await page.waitForTimeout(500);

  // 3. 이메일무단수집거부
  await page.getByRole('button', { name: '이메일무단수집거부' }).click();
  await page.waitForTimeout(1000);
  await page.locator(closeSelector).click();


  console.log("=================================");
  console.log(" Session A 종료");
  console.log("=================================");

});

/* =========================
 * Session B - 테스트 계정 1 / 배송신청, 배송현황 기능 동작
 * ========================= */
test('Session B – 테스트 계정 1 / 배송신청 및 배송현황 검증', async ({ page }) => {
  test.setTimeout(90000);

  console.log("\n".repeat(2));
  console.log("=================================");
  console.log(" Session B START");
  console.log(" 테스트 계정 1 / 배송신청, 배송현황");
  console.log("=================================");

  /* ID_0021 | 메인 진입 및 팝업 처리 */
  console.log('ID_0021 | 메인 진입 및 팝업 처리');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await handlePopup(page);

  const loginBtn = page.locator(
    '#header .btn.btn-sm.btn-outline-primary.rounded-1.d-flex.align-items-center'
  );

  await loginBtn.waitFor({ state: 'visible' });
  await loginBtn.click();

  await expect(page).toHaveURL(/\/login/);

  await page.locator("//input[@id='email']").fill(ACCOUNTS.B.id);
  await page.locator("//input[@id='password']").fill(ACCOUNTS.B.pw);
  await page.locator("button[name='btnSubmit']").click();
  await page.waitForLoadState('networkidle');

  // 로그인 후 안정화 대기

  await page.waitForTimeout(1500);

  // spinner / modal 완전 해제 대기
  await page.waitForSelector("//div[@id='commonConfirmModal' and contains(@class,'show')]", {
    state: 'hidden', timeout: 10000
  }).catch(() => { });
  await page.waitForSelector("//div[contains(@class,'spinner-container') and contains(@class,'show')]", {
    state: 'hidden', timeout: 10000
  }).catch(() => { });


  /* ID_0022 | 배송신청 : 해외배송 */
    await test.step('ID_0022 | 배송신청 : 해외배송', async () => {
        console.log('ID_0022 | 배송신청 : 해외배송'); // 대시보드 기록용 유지
        
        await page.locator("//a[contains(text(), '배송신청')]").click();
        await page.waitForLoadState('networkidle');

        if (!(await page.url()).includes('/request/main'))
            throw new Error('페이지 이동 실패: /request/main 아님');

        await page.waitForURL(/\/request(\/main)?$/, { timeout: 15000 }).catch(() => { });
        await page.waitForTimeout(1500);

        const overseasBtnSelector = "//h5[contains(text(),'해외배송')]";
        try {
            await page.waitForSelector(overseasBtnSelector, { timeout: 20000 });
            await page.locator(overseasBtnSelector).click();
        } catch (e) {
            // 버튼 못 찾으면 패스
        }

        await page.waitForURL(/\/request$/, { timeout: 20000 }).catch(() => {});
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const popupSelector = "//div[@id='commonConfirmModalBody']";
        const confirmBtnSelector = "(//button[contains(text(),'새로 입력하기')])[1]";
        let elapsed = 0;

        while (true) {
            const visible = await page.locator(popupSelector).isVisible({ timeout: 1000 }).catch(() => false);
            if (visible) {
                await page.locator(confirmBtnSelector).click();
                await page.waitForSelector("//div[@id='commonConfirmModal']", { state: 'hidden', timeout: 10000 });
                await page.waitForSelector(
                    "//div[contains(@class,'spinner-container') and contains(@class,'show')]",
                    { state: 'hidden', timeout: 10000 }
                ).catch(() => { });
                break;
            }

            const nextStepReady = await page.locator("(//button[contains(text(),'다음')])[1]").isVisible({ timeout: 1000 }).catch(() => false);
            if (nextStepReady) {
                break;
            }

            await page.waitForTimeout(1000);
            elapsed += 1000;
            if (elapsed >= 20000) {
                break;
            }
        }
    });

    /* ID_0023 | 기본주소록 선택 후 단계 진행 */
    await test.step('ID_0023 | 기본주소록 선택 후 단계 진행', async () => {
        console.log('ID_0023 | 기본주소록 선택 후 단계 진행'); // 대시보드 기록용 유지

        const addressBookBtn = page.locator('button.btn.btn-outline-dark.btn-sm.rounded-1.fw-medium:visible').first();
        
        if (await addressBookBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await addressBookBtn.click();
            await page.waitForSelector("text=보내는 사람 주소록", { timeout: 10000 });
            await page.locator("(//button[@class='btn btn-outline-primary btn-sm'][contains(text(),'선택')])[1]").click();
            
            await page.waitForSelector("//div[@id='commonConfirmModal' and contains(@class,'show')]", {
                state: 'hidden', timeout: 10000
            }).catch(() => { });
            await page.waitForTimeout(1000);
        }

        for (let i = 1; i <= 4; i++) {
            const btn = page.locator(`(//button[@type='button'][contains(text(),'다음')])[${i}]`);
            const timeout = (i === 1 || i === 2) ? 40000 : 20000;

            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(500);

            const prohibitedModal = page.locator("//div[@id='prohibitedItemsModal']");
            if (await prohibitedModal.isVisible({ timeout: 3000 }).catch(() => false)) {
                const confirmBtn = page.locator('button.btn.btn-lg.btn-primary.custom-close:visible');
                await confirmBtn.click({ force: true });
                await page.waitForSelector("//div[@id='prohibitedItemsModal']", { state: 'hidden', timeout: 15000 });
                
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(1000);
            }

            await page.waitForTimeout(500);
            
            try {
                await btn.waitFor({ state: 'visible', timeout: i === 4 ? 50000 : timeout });
                
                const isDisabled = await btn.isDisabled().catch(() => false);
                if (!isDisabled) {
                    await btn.click({ force: true });
                }
            } catch (e) {
                // 버튼 못 찾거나 시간 초과 시 패스
            }

            await page.waitForTimeout(i <= 2 ? 1500 : 1000);
        }
    });


  /* ID_0024 | 배송신청 완료 */
  console.log('ID_0024 | 배송신청 완료');
  // === 배송신청 완료 및 이동 ===
  await page.locator("(//input[@id='chkAgree'])[1]").check();
  await page.locator("(//button[contains(text(),'배송신청 완료')])[1]").click();
  await page.waitForURL(`${BASE_URL}/request/completed`, { timeout: 15000 });


  /* ID_0025 | 배송현황 상세보기 진입 */
  console.log('ID_0025 | 배송현황 상세보기 진입');
  // === 배송현황 페이지 이동 ===
  await page.locator("(//button[contains(text(),'배송현황 보러가기')])[1]").click();
  await expect(page).toHaveURL(`${BASE_URL}/delivery`);

  // === 상세보기 클릭 (첫 번째 리스트) ===
  await page.locator("(//i[@class='icon icon-arrow-right bg-999 is-m-24 is-p-24'])[1]").click();
  await page.waitForLoadState('networkidle');


  /* ID_0026 | 상세페이지 스크롤 */
  console.log('ID_0026 | 상세페이지 스크롤');
  const scrollStep = 800;
  for (let pos = 0; pos <= 5000; pos += scrollStep) {
    await page.evaluate(y => window.scrollTo(0, y), pos);
    await page.waitForTimeout(200);
  }
  for (let pos = 5000; pos >= 0; pos -= scrollStep) {
    await page.evaluate(y => window.scrollTo(0, y), pos);
    await page.waitForTimeout(200);
  }


  /* ID_0027 | 배송신청 : 구매대행 */
  console.log('ID_0027 | 배송신청 : 구매대행');
  await page.locator("//a[contains(text(), '배송신청')]").click();
  await page.waitForLoadState('networkidle');

  // 페이지 이동 확인
  if (!(await page.url()).includes('/request/main'))
    throw new Error('페이지 이동 실패: /request/main 아님');

  // request/main → request 전환 안정화
  await page.waitForURL(/\/request(\/main)?$/, { timeout: 15000 }).catch(() => { });
  await page.waitForTimeout(1500);

  // [수정] 변수명 일치 (execute -> executePage)
  const [executePage] = await Promise.all([
    page.context().waitForEvent('page'),
    page.locator("//h5[contains(text(),'구매대행')]").click()
  ]);

  await executePage.waitForLoadState('domcontentloaded');
  // 구매대행 페이지 URL 검증 (forms.app 도메인 체크)
  await expect(executePage).toHaveURL(/forms\.app/);

  await executePage.close();



  /* ID_0028 | 배송현황 기간별 조회 기능 동작 */
  await test.step('ID_0028 | 배송현황 기간별 조회 기능 동작', async () => {
    console.log('ID_0028 | 배송현황 기간별 조회 기능 동작');

    
    await page.locator('//*[@id="navbarSupportedContent"]/div/ul/li[3]/a').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('https://staging.shipbaesong.com/delivery');

    // 1. 기간 설정 모달 열기 및 Default(button[3]) 확인 후 닫기
    await page.locator('//*[@id="setDate"]/div[2]/i').click(); 
    await page.locator('//*[@id="datePeriodModal"]/div/div/div[1]').waitFor({ state: 'visible' });
    
    await page.locator('//*[@id="datePeriodModal"]/div/div/div[1]/button').click();
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // 2. '3개월' 조회 (button[2])
    await page.locator('//*[@id="setDate"]/div[2]/i').click();
    await page.locator('//*[@id="datePeriodModal"]/div/div/div[3]/div[1]/div[1]/button[2]').click();
    await page.locator('//*[@id="datePeriodModalSubmit"]').click(); 
    await page.waitForTimeout(2000); 

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);


    // 3. '30일' 조회 (button[1])
    await page.locator('//*[@id="setDate"]/div[2]/i').click(); 
    await page.locator('//*[@id="datePeriodModal"]/div/div/div[3]/div[1]/div[1]/button[1]').click();
    await page.locator('//*[@id="datePeriodModalSubmit"]').click();

    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
  });

  console.log("=================================");
  console.log(" Session B 종료");
  console.log("=================================");


});


/* =========================
 * Session C - 테스트 계정 2 / 상단메뉴 상세기능 동작
 * ========================= */
test('Session C – 테스트 계정 2 / 상단메뉴 상세기능 동작', async ({ page }) => {
  test.setTimeout(100000);






  



  console.log("=================================");
  console.log(" Session C 종료");
  console.log("=================================");

  

});