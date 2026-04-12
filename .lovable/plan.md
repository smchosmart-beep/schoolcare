

# 회원가입 에러 메시지 한글 변환

## 변경 파일
`src/pages/Signup.tsx`

## 변경 내용
에러 메시지를 한글로 매핑하는 헬퍼 함수를 추가하고, `toast.error`에서 사용:

```tsx
const translateAuthError = (message: string): string => {
  if (message.includes("weak") || message.includes("easy to guess")) {
    return "비밀번호가 너무 쉽습니다. 더 복잡한 비밀번호를 사용해주세요.";
  }
  if (message.includes("already registered") || message.includes("already been registered")) {
    return "이미 가입된 이메일입니다.";
  }
  if (message.includes("invalid email")) {
    return "유효하지 않은 이메일 형식입니다.";
  }
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
  }
  return message;
};
```

그리고 34행을:
```tsx
toast.error("회원가입 실패: " + translateAuthError(error.message));
```
로 변경.

