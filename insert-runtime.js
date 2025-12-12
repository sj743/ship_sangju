const fs = require('fs');
const path = require('path');

// =====================
// 1. 실행일시 치환
// =====================
const now = new Date();
const formatted =
  now.getFullYear() + '-' +
  String(now.getMonth() + 1).padStart(2, '0') + '-' +
  String(now.getDate()).padStart(2, '0') + ' ' +
  String(now.getHours()).padStart(2, '0') + ':' +
  String(now.getMinutes()).padStart(2, '0') + ':' +
  String(now.getSeconds()).padStart(2, '0');

const root = process.cwd();
const indexPath = path.join(root, 'index.html');

let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace('{{RUN_TIME}}', formatted);
fs.writeFileSync(indexPath, html, 'utf8');

console.log('✓ 실행일시 반영됨:', formatted);

// =====================
// 2. 최신 영상 자동 복사
// =====================
const testResultsDir = path.join(root, 'test-results');
const videosDir = path.join(root, 'videos');

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir);
}

function copyLatestSessionVideo(prefix, targetName) {
  if (!fs.existsSync(testResultsDir)) return;

  const candidates = fs.readdirSync(testResultsDir)
    .filter(d => d.startsWith(prefix))
    .map(d => {
      const full = path.join(testResultsDir, d);
      return { dir: full, time: fs.statSync(full).mtimeMs };
    });

  if (candidates.length === 0) return;

  const latest = candidates.sort((a, b) => b.time - a.time)[0].dir;
  const src = path.join(latest, 'video.webm');
  const dest = path.join(videosDir, targetName);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ ${targetName} 갱신됨`);
  }
}

copyLatestSessionVideo('ship_stg_poc-Session-A', 'SessionA.webm');
copyLatestSessionVideo('ship_stg_poc-Session-B', 'SessionB.webm');
