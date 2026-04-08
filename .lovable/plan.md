

# 🌡️ 아이콘 선택 시 체온 입력창 추가

## 개요
키오스크에서 학생이 스스로 치료 항목 중 🌡️ 아이콘 항목을 선택하면, 바로 저장하지 않고 체온 입력 화면을 거친 후 저장합니다.

## 변경 사항

### `src/pages/Kiosk.tsx`

**1. 새 step 추가**
- `KioskStep` 타입에 `"inputTemperature"` 추가
- `selectedTreatment` state 추가 (선택된 치료 항목 저장)
- `temperatureInput` state 추가

**2. `handleSelfTreatment` 수정**
- 선택된 항목의 icon이 `"🌡️"`이면 → `selectedTreatment`에 저장 후 `step`을 `"inputTemperature"`로 전환
- 그 외 아이콘이면 → 기존처럼 바로 visits에 insert

**3. 체온 입력 화면 UI** (`step === "inputTemperature"`)
- 큰 숫자패드 스타일의 체온 입력 UI (키오스크에 적합하게)
- 숫자 버튼(0~9)과 소수점(.) 버튼으로 터치 입력
- 입력 예시 표시: "36.5"
- [확인] 버튼 → visits insert 시 `temperature` 필드에 입력값 포함
- [건너뛰기] 버튼 → 체온 없이 저장

**4. goBack 수정**
- `"inputTemperature"` → `"selfTreatment"`로 돌아가기

**5. stepTitle 추가**
- `inputTemperature`: `"체온을 입력하세요"`

