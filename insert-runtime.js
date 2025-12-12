import fs from 'fs';
import path from 'path';

// 현재 시간 포맷
const now = new Date();
const formatted =
  now.getFullYear() + '-' +
  String(now.getMonth() + 1).padStart(2, '0') + '-' +
  String(now.getDate()).padStart(2, '0') + ' ' +
  String(now.getHours()).padStart(2, '0') + ':' +
  String(now.getMinutes()).padStart(2, '0') + ':' +
  String(now.getSeconds()).padStart(2, '0');

// index.html 경로 (너 프로젝트 구조 맞춰서 그대로 둬도 됨)
const filePath = path.join(process.cwd(), 'index.html');

let html = fs.readFileSync(filePath, 'utf8');

// {{RUN_TIME}} 토큰 치환
html = html.replace('{{RUN_TIME}}', formatted);

// 다시 저장
fs.writeFileSync(filePath, html, 'utf8');

console.log('✓ 실행일시 반영됨:', formatted);
