

# 로그인 로고 크기 변경

## 변경 파일
`src/pages/Login.tsx`

## 변경 내용
로고 이미지의 클래스를 `h-20 w-20` → `h-32 w-32`로 변경 (80px → 128px)

```tsx
<img src={schoolcareLogo} alt="SchoolCare" className="mx-auto mb-4 h-32 w-32 rounded-2xl" />
```

