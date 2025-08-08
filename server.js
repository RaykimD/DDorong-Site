const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 캐시 방지 미들웨어
app.use((req, res, next) => {
    // HTML 파일에 대해 캐시 방지
    if (req.url.endsWith('.html') || req.url === '/') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }

    // 버전 헤더 추가
    res.setHeader('X-App-Version', '2.3.0');
    res.setHeader('X-App-Mode', 'local-only');
    res.setHeader('X-Build-Time', new Date().toISOString());

    next();
});

// 정적 파일 서빙 (public 폴더)
app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            // HTML 파일은 캐시하지 않음
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else if (path.endsWith('.js') || path.endsWith('.css')) {
            // JS, CSS 파일은 짧은 캐시 (5분)
            res.setHeader('Cache-Control', 'public, max-age=300');
        } else {
            // 기타 파일들 (이미지 등)
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }
    }
}));

// 메인 라우트
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } catch (error) {
        console.error('Main route error:', error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        version: '2.3.0',
        mode: 'local-only',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime())
    });
});

// 앱 정보 API
app.get('/api/info', (req, res) => {
    res.json({
        name: 'DDorong Timer',
        version: '2.3.0',
        mode: 'local-only',
        description: '또롱쓰 시참시간 관리 사이트 (로컬 전용)',
        features: [
            'Local Storage',
            'Backup/Restore',
            'Timer Management',
            'Admin Mode'
        ],
        buildTime: new Date().toISOString()
    });
});

// 404 처리
app.use((req, res) => {
    console.log('404 - Not found:', req.url);
    res.status(404).send(`
        <h1>404 - 페이지를 찾을 수 없습니다</h1>
        <p>요청한 페이지 "${req.url}"를 찾을 수 없습니다.</p>
        <a href="/">메인 페이지로 돌아가기</a>
    `);
});

// 에러 처리
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).send(`
        <h1>500 - 서버 오류</h1>
        <p>서버에서 오류가 발생했습니다.</p>
        <a href="/">메인 페이지로 돌아가기</a>
    `);
});

// 서버 시작
const server = app.listen(PORT, () => {
    console.log('🚀 또롱쓰 시참 시간 관리 사이트 시작!');
    console.log(`📡 서버: http://localhost:${PORT}`);
    console.log(`📊 헬스체크: http://localhost:${PORT}/health`);
    console.log(`📋 앱 정보: http://localhost:${PORT}/api/info`);
    console.log(`🔧 버전: 2.3.0 (로컬 전용)`);
    console.log(`💾 모드: Local Storage Only`);
    console.log('💡 종료하려면 Ctrl+C를 누르세요.');
    console.log('-----------------------------------');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM 신호를 받았습니다. 서버를 안전하게 종료합니다...');
    server.close(() => {
        console.log('서버가 종료되었습니다.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT 신호를 받았습니다. 서버를 안전하게 종료합니다...');
    server.close(() => {
        console.log('서버가 종료되었습니다.');
        process.exit(0);
    });
});