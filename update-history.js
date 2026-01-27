const fs = require('fs');
const path = require('path');

// 파일 경로 설정
const resultsPath = path.join(__dirname, 'test-results.json');
const historyPath = path.join(__dirname, 'history.json');

// ★ ID별 상세 진행 내용 매핑 (유지)
const DESCRIPTION_MAP = {
    // Session A
    "ID_0001": "메인 페이지 진입 후 프로모션 팝업 닫기 버튼 클릭, 팝업 제거 확인",
    "ID_0002": "헤더의 [이용안내] 메뉴 클릭, /guide 페이지 URL 이동 및 타이틀 노출 확인",
    "ID_0003": "비로그인 상태로 [배송신청] 클릭, 로그인 유도 페이지 대신 안내 페이지 노출 확인",
    "ID_0004": "비로그인 상태로 [배송현황] 클릭, 로그인 페이지(/login)로 리다이렉트 확인",
    "ID_0005": "고객지원 메뉴 클릭, FAQ 리스트 및 검색창 UI 정상 노출 확인",
    "ID_0006": "퓨어 계정(user_pure) 아이디/비번 입력 후 로그인 버튼 클릭, 메인 이동 확인",
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

    // Session B
    "ID_0021": "테스트 계정(user_test) 로그인 수행, 메인 대시보드 정상 진입 확인",
    "ID_0022": "배송신청 메뉴 클릭, 임시저장 팝업에서 [새로 작성] 선택하여 진입",
    "ID_0023": "보내는분/받는분 주소록 선택, 물품 정보(의류, 1kg) 입력 후 다음 단계 이동",
    "ID_0024": "약관 전체 동의 체크 후 [신청하기] 버튼 클릭, 완료 페이지 노출 확인",
    "ID_0025": "배송현황 리스트에서 최상단 항목 클릭, 상세 페이지 데이터 로딩 확인",
    "ID_0026": "상세 페이지 스크롤 동작, 운송장 정보 및 결제 금액 영역 UI 확인",
    "ID_0027": "구매대행 신청 메뉴 클릭, 외부 제휴 신청 폼(Forms.app) 새 탭 연결 확인"
};

try {
    if (!fs.existsSync(resultsPath)) {
        console.log("⚠️ test-results.json 파일이 없습니다.");
        process.exit(0);
    }
    const rawData = fs.readFileSync(resultsPath, 'utf8');
    const testResults = JSON.parse(rawData);

    // ★ [수정] 날짜 포맷 변경 (YYYY.MM.DD HH:mm:ss)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // 예: "2026.01.27 14:30:05"
    const dateStr = `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;

    let passed = 0;
    let failed = 0;
    const sessionALogs = [];
    const sessionBLogs = [];
    const processedIDs = new Set();

    testResults.suites.forEach(suite => {
        suite.specs.forEach(spec => {
            spec.tests.forEach(test => {
                const result = test.results[0];
                if (!result) return;
                const parentStatus = result.status === 'passed' ? 'pass' : 'fail';

                if (result.stdout && result.stdout.length > 0) {
                    result.stdout.forEach(logItem => {
                        const text = (logItem.text || "").trim();
                        const match = text.match(/(ID_\d+)\s*[|: ]\s*(.+)/);

                        if (match) {
                            const id = match[1];
                            const title = match[2];

                            if (processedIDs.has(id)) return;
                            processedIDs.add(id);

                            if (parentStatus === 'pass') passed++; else failed++;

                            const descText = DESCRIPTION_MAP[id] || title;

                            const logEntry = {
                                id: id,
                                title: title,
                                desc: descText,
                                status: parentStatus
                            };

                            const idNum = parseInt(id.replace('ID_', ''), 10);
                            if (idNum <= 20) sessionALogs.push(logEntry);
                            else sessionBLogs.push(logEntry);
                        }
                    });
                }
            });
        });
    });

    const total = sessionALogs.length + sessionBLogs.length;
    
    if (total === 0) {
        console.log("⚠️ 경고: 로그에서 ID를 찾지 못했습니다.");
    }

    const newEntry = {
        date: dateStr, // 시:분:초가 포함된 고유값
        timestamp: now.getTime(),
        stats: {
            total,
            passed,
            failed,
            duration: `${Math.floor(testResults.stats.duration / 60000)}m ${Math.floor((testResults.stats.duration % 60000) / 1000)}s`
        },
        sessionA: sessionALogs.sort((a, b) => a.id.localeCompare(b.id)),
        sessionB: sessionBLogs.sort((a, b) => a.id.localeCompare(b.id))
    };

    let history = [];
    if (fs.existsSync(historyPath)) {
        try { history = JSON.parse(fs.readFileSync(historyPath, 'utf8')); } 
        catch (e) { history = []; }
    }

    // ★ [수정] 무조건 맨 앞에 추가 (unshift) - 시간까지 다르므로 중복될 일 없음
    history.unshift(newEntry);
    
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
    console.log(`✅ [${dateStr}] 신규 이력 추가 완료 (Total: ${total}건)`);

} catch (e) {
    console.error("❌ 오류 발생:", e);
}