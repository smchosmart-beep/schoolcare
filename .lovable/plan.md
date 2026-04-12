

# 키오스크 PWA 설치 지원 — 검토 결과 및 수정 계획

## 검토에서 발견한 문제점

### 1. 아이콘 크기 부족 (중요)
- 현재 `public/favicon.png`은 **493×482px** (정사각형 아님)
- PWA manifest에는 **512×512 정사각형** 아이콘이 필수
- 비정사각형 이미지를 그대로 쓰면 설치 시 아이콘이 찌그러짐
- **해결**: favicon.png를 512×512 정사각형 캔버스에 중앙 배치하여 `public/pwa-icon-512.png`, `public/pwa-icon-192.png` 생성

### 2. OAuth 경로 보호 불필요
- 기존 계획에 서비스 워커가 없으므로 `navigateFallbackDenylist` 걱정은 없음 → 문제 없음

### 3. Lovable 프리뷰 환경 충돌 없음
- manifest.json만 추가하고 서비스 워커를 사용하지 않으므로 프리뷰 환경에 영향 없음 → 문제 없음

### 4. Capacitor와의 충돌
- 이미 `capacitor.config.ts`가 존재함
- PWA manifest와 Capacitor는 독립적이므로 충돌 없음 → 문제 없음

## 수정된 구현 계획

### 1. PWA 아이콘 생성 (Python 스크립트)
`favicon.png`(493×482)를 기반으로 512×512, 192×192 정사각형 아이콘 생성

### 2. `public/manifest.json` 생성
```json
{
  "name": "스쿨케어 키오스크",
  "short_name": "스쿨케어",
  "start_url": "/kiosk",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2B4A7F",
  "icons": [
    { "src": "/pwa-icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/pwa-icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 3. `index.html` — manifest 및 iOS 메타태그 추가
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#2B4A7F" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="스쿨케어" />
<link rel="apple-touch-icon" href="/pwa-icon-192.png" />
```

### 결론
기존 계획에서 **아이콘 크기/비율 문제**만 수정하면 나머지는 안전하게 적용 가능합니다. 서비스 워커 없이 manifest만 사용하므로 기존 기능에 영향 없습니다.

