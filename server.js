const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// public 폴더의 정적 파일들 제공
app.use(express.static('public'));

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다!`);
    console.log('💡 종료하려면 Ctrl+C를 누르세요.');
});