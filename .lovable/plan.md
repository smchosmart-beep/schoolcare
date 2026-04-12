

# 하트 아이콘을 로고 이미지로 교체

로그인 후에도 여러 페이지에서 Heart 아이콘이 사용되고 있습니다. 모두 로고 이미지로 교체합니다.

## 변경 파일 및 내용

### 1. `src/pages/Index.tsx`
- Heart → 로고 이미지 (로딩 스피너용, `h-12 w-12`)

### 2. `src/pages/Admin.tsx`
- 로딩 화면 Heart → 로고 이미지 (`h-12 w-12`)
- 헤더 좌측 아이콘 Heart → 로고 이미지 (`h-5 w-5` → `h-10 w-10 rounded-xl`)

### 3. `src/pages/Kiosk.tsx`
- 로딩 화면 Heart → 로고 이미지
- 헤더 Heart → 로고 이미지 (2곳)
- 학생 명단 업로드 안내 Heart → 로고 이미지
- 스스로 치료 버튼 Heart → 로고 이미지

### 4. `src/pages/Signup.tsx`
- 회원가입 페이지 상단 Heart → 로고 이미지

### 5. `src/components/admin/AdminDashboard.tsx`
- 스스로 치료 섹션 Heart → 로고 이미지

모든 곳에서 `import schoolcareLogo from "@/assets/schoolcare-logo.png"` 사용하고, Heart 아이콘 대신 `<img>` 태그로 교체합니다. 크기는 기존 Heart 아이콘 크기에 맞춰 조정합니다.

