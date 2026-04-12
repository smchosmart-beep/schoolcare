

# 로그인 페이지 아이콘 교체 + 파비콘 변경

## 변경 내용

### 1. 업로드된 이미지를 프로젝트에 복사
- `user-uploads://보건일지_아이콘-Photoroom.png` → `src/assets/schoolcare-logo.png`
- `user-uploads://보건일지_아이콘-Photoroom.png` → `public/favicon.png` (파비콘용)

### 2. `src/pages/Login.tsx`
- `Heart` 아이콘 import 제거
- 녹색 배경 + 하트 아이콘 div를 업로드된 이미지로 교체:
```tsx
import schoolcareLogo from "@/assets/schoolcare-logo.png";
// ...
<img src={schoolcareLogo} alt="SchoolCare" className="mx-auto mb-4 h-20 w-20 rounded-2xl" />
```

### 3. `index.html`
- 기존 favicon을 새 이미지로 교체:
```html
<link rel="icon" href="/favicon.png" type="image/png">
```

## 변경 파일
- `src/pages/Login.tsx`
- `index.html`
- 새 파일: `src/assets/schoolcare-logo.png`, `public/favicon.png`

