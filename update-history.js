const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, 'test-results.json');
const historyPath = path.join(__dirname, 'history.json');
const videoDir = path.join(__dirname, 'videos');

if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

// ★ 1. 짧은 제목 (화면에 굵게 나올 텍스트)
const SHORT_TITLES = {
    "ID_0001": "메인 진입 및 팝업 처리",
    "ID_0002": "이용안내 페이지 이동(비로그인)",
    "ID_0003": "배송신청 페이지 이동(비로그인)",
    "ID_0004": "배송현황 페이지 이동(비로그인)",
    "ID_0005": "고객지원 페이지 이동(비로그인)",
    "ID_0006": "로그인(퓨어계정)",
    "ID_0007": "배송현황 페이지 확인",
    "ID_0008": "최근신청 내역 미제공 체크",
    "ID_0009": "최근신청 내역 > 해외배송 신청하기",
    "ID_0010": "주소록 관리 > 팝업 내 주소 내역 미제공",
    "ID_0011": "주소록 > 새로운 주소 추가 시 화면 변경",
    "ID_0012": "로그아웃 수행",
    "ID_0013": "메인페이지 > 해외배송 신청하기 랜딩 확인",
    "ID_0014": "배송조회_tracking 페이지 랜딩 확인",
    "ID_0015": "메인 배너 UI 노출 확인",
    "ID_0016": "챗봇 펼치기 > 닫기 확인",
    "ID_0017": "화면 최하단까지 스크롤(UI체크)",
    "ID_0018": "비즈니스 고객 [서비스 이용하기] 선택",
    "ID_0019": "푸터영역 SNS 랜딩 확인",
    "ID_0020": "푸터영역 약관 팝업 노출 확인",
    "ID_0021": "메인 진입 및 팝업 처리",
    "ID_0022": "배송신청 : 해외배송",
    "ID_0023": "기본주소록 선택 후 단계 진행",
    "ID_0024": "1박스,픽업발송_배송신청 완료",
    "ID_0025": "배송현황 상세보기 진입",
    "ID_0026": "상세페이지 스크롤",
    "ID_0027": "배송신청 : 구매대행",
    "ID_0028": "배송현황 기간별 조회 기능 동작",
    "ID_0029": "2박스,든든보험,직접발송_배송신청 완료",
    "ID_0030": "배송현황 상세보기 및 송장번호 입력",
    "ID_0031": "배송현황 : 받는 사람 주소 수정",
    "ID_0032": "배송현황 : 배송조회, Tracking 페이지 기능동작"
};

// ★ 2. 상세 진행 내용 (화면에 회색으로 나올 긴 텍스트)
const DESCRIPTIONS = {
    "ID_0001": "메인 페이지 진입 후 프로모션 팝업 닫기 버튼 클릭, 팝업 제거 확인",
    "ID_0002": "헤더의 [이용안내] 메뉴 클릭, /guide 페이지 URL 이동 및 타이틀 노출 확인",
    "ID_0003": "비로그인 상태로 [배송신청] 클릭, 로그인 유도 페이지 대신 안내 페이지 노출 확인",
    "ID_0004": "비로그인 상태로 [배송현황] 클릭, 로그인 페이지(/login)로 리다이렉트 확인",
    "ID_0005": "고객지원 메뉴 클릭, FAQ 리스트 및 검색창 UI 정상 노출 확인",
    "ID_0006": "배송신청 이력없는 계정 아이디/비번 입력 후 로그인 버튼 클릭, 메인 이동 확인",
    "ID_0007": "배송현황 메뉴 진입, '신청 내역 없음' 문구 및 Empty 이미지 노출 확인",
    "ID_0008": "마이페이지 진입, 최근 신청 내역 영역이 비어있는 상태 확인",
    "ID_0009": "빈 내역 화면 내 [해외배송 신청하기] 버튼 클릭, 신청서 작성 페이지 이동 확인",
    "ID_0010": "주소록 관리 팝업 호출, 등록된 주소가 0건임을 확인",
    "ID_0011": "주소록 팝업 내 [새 주소 추가] 버튼 클릭, 입력 폼 모달 활성화 확인",
    "ID_0012": "헤더의 [로그아웃] 버튼 클릭, 세션 종료 및 메인 페이지 이동 확인",
    "ID_0013": "메인 배너 내 [신청하기] 버튼 클릭, 신청 페이지로 정상 랜딩 확인",
    "ID_0014": "운송장 번호 입력 후 조회 버튼 클릭, 트래킹 페이지 새 창 열림 확인",
    "ID_0015": "메인 슬라이드 배너 드래그 동작 및 인디케이터 변경 확인",
    "ID_0016": "우측 하단 챗봇 아이콘 클릭하여 열기, 닫기 버튼으로 닫힘 동작 확인",
    "ID_0017": "페이지 최하단 푸터(Footer) 영역까지 스크롤, 사업자 정보 노출 확인",
    "ID_0018": "비즈니스 배너 클릭, 사업자 전용 소개 페이지 이동 확인",
    "ID_0019": "푸터 영역 인스타그램/블로그 아이콘 클릭, 외부 링크 연결 확인",
    "ID_0020": "이용약관/개인정보처리방침 링크 클릭, 약관 내용 모달 팝업 노출 확인",
    "ID_0021": "테스트 계정 로그인 수행, 메인 대시보드 정상 진입 확인",
    "ID_0022": "배송신청 : 해외배송 클릭, 진입 후 팝업 발생 시 [새로 입력하기] 처리 확인",
    "ID_0023": "보내는사람/받는사람 주소록에서 [기본주소] 호출 및 적용, 금지물품 팝업 닫기 후 단계 완료",
    "ID_0024": "(1박스,픽업발송 선택)약관동의 후 [배송신청 완료]버튼 클릭, 완료 페이지 노출 확인",
    "ID_0025": "배송현황 리스트에서 최상단 항목 클릭, 상세 페이지 데이터 로딩 확인",
    "ID_0026": "상세 페이지 스크롤 동작, 운송장 정보 및 결제 정보 영역 UI 확인",
    "ID_0027": "배송신청 : 구매대행 클릭, 외부 제휴 신청 폼(Forms.app) 새 탭 연결 확인",
    "ID_0028": "배송현황 진입 > 기간 필터(1년, 3개월, 30일) 변경 및 조회 결과 스크롤 확인",
    "ID_0029": "(2박스,든든보험,직접발송 선택)약관동의 후 [배송신청 완료]버튼 클릭, 완료 페이지 노출 확인",
    "ID_0030": "배송현황 리스트에서 운송장 번호 입력 유도, 상세 페이지 진입 시 박스별 택배사,운송장번호 선택 및 입력 확인",
    "ID_0031": "모달 진입 > 영문 이름/주소 수정 > 저장 후 변경 확인",
    "ID_0032": "새 탭 열림 > 송장번호 검증 > 배송상태 상세보기 > 다국어(KO/EN/JA) 변경 확인"
};

try {
    if (!fs.existsSync(resultsPath)) { console.log("⚠️ 파일 없음"); process.exit(0); }
    const rawData = fs.readFileSync(resultsPath, 'utf8');
    const testResults = JSON.parse(rawData);

    const now = new Date();
    const dateStr = now.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/\./g, '.').replace(/(\d)\.(\s)/g, '$1.');

    let passCount = 0;
    let failCount = 0;
    
    const sessionALogs = [];
    const sessionBLogs = [];
    const processedIDs = new Set();
    
    let videoA = null;
    let videoB = null;

    testResults.suites.forEach(suite => {
        const suiteTitle = suite.title || "";

        suite.specs.forEach(spec => {
            spec.tests.forEach(test => {
                const result = test.results[test.results.length - 1];
                if (!result) return;

                // 1. 비디오 복사
                if (result.attachments) {
                    const vid = result.attachments.find(a => a.name === 'video' && a.contentType === 'video/webm');
                    if (vid && fs.existsSync(vid.path)) {
                        if (suiteTitle.includes("Session A")) {
                            fs.copyFileSync(vid.path, path.join(videoDir, "SessionA.webm"));
                            videoA = "SessionA.webm";
                        } else if (suiteTitle.includes("Session B")) {
                            fs.copyFileSync(vid.path, path.join(videoDir, "SessionB.webm"));
                            videoB = "SessionB.webm";
                        }
                    }
                }

                // 2. 로그 추출
                const processLog = (text, duration) => {
                    const match = text.match(/(ID_\d{4})/);
                    if (match) {
                        const id = match[1];
                        if (!processedIDs.has(id)) {
                            processedIDs.add(id);
                            
                            const status = result.status === 'passed' ? 'pass' : 'fail';
                            if (status === 'pass') passCount++; else failCount++;

                            const logItem = {
                                id: id,
                                title: SHORT_TITLES[id] || text, // ★ 짧은 제목 적용
                                desc: DESCRIPTIONS[id] || "설명 없음", // ★ 긴 설명 적용
                                status: status,
                                duration: duration
                            };

                            if (parseInt(id.split('_')[1]) <= 20) sessionALogs.push(logItem);
                            else sessionBLogs.push(logItem);
                        }
                    }
                };

                if (result.steps) result.steps.forEach(s => processLog(s.title, s.duration));
                if (result.stdout) result.stdout.forEach(l => processLog(l.text || "", result.duration));
            });
        });
    });

    sessionALogs.sort((a, b) => a.id.localeCompare(b.id));
    sessionBLogs.sort((a, b) => a.id.localeCompare(b.id));

    let history = [];
    if (fs.existsSync(historyPath)) { try { history = JSON.parse(fs.readFileSync(historyPath)); } catch(e) { history = []; } }

    const newEntry = {
        timestamp: now.getTime(),
        date: dateStr,
        stats: {
            total: sessionALogs.length + sessionBLogs.length,
            passed: passCount,
            failed: failCount,
            duration: (testResults.stats.duration / 1000).toFixed(1) + 's'
        },
        videos: { sessionA: videoA, sessionB: videoB },
        sessionA: sessionALogs,
        sessionB: sessionBLogs
    };

    history.unshift(newEntry);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    console.log(`✅ 업데이트 완료 (Total: ${newEntry.stats.total})`);

} catch (e) { console.error(e); }