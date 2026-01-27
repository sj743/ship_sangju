# 쉽배송 E2E 테스트

> **⚠️ 안내**
>
> 본 저장소는 내부 테스트 자동화 작업을 위한 **임시 저장소**이며,
> 작업 완료 후 **회사 저장소로 이전될 예정**입니다.


## 🚀 실행 방법

1. **터미널에서 테스트 실행**
    
    npx playwright test ship_stg_poc.spec.js --headed

2. **터미널에서 데이터 업데이트**

    node update-history.js

3. **대시보드 보기**
    - VS Code에서 `index.html` 우클릭 -> **Open with Live Server**