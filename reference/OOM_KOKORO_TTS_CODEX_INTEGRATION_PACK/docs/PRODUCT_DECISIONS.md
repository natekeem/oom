# Product Decisions — LOCKED

## 1. Voice 후보

사용자 청취 결과를 반영해 정확히 다음 4개만 제품에 노출합니다.

- `af_heart`
- `af_bella`
- `af_sarah`
- `af_sky`

다른 Kokoro voice는 1차 제품 UI에 노출하지 않습니다.

## 2. 시험용 / 스크립트용 분리

동일 사용자가 두 개를 별도로 선택합니다.

```ts
type TtsPreferences = {
  examVoice: "af_heart" | "af_bella" | "af_sarah" | "af_sky";
  scriptVoice: "af_heart" | "af_bella" | "af_sarah" | "af_sky";
};
```

권장 default:

```ts
examVoice: "af_heart"
scriptVoice: "af_bella"
```

제품적으로 시험용과 학습용 역할이 다르므로 하나의 voice setting으로 합치지 않습니다.

## 3. STEP 3 배치

Voice 설정 UI는 **STEP 3 난이도 설정 화면**에 둡니다.

이 위치는 학습 흐름상 사용자가:
- Course
- Level
- Difficulty
- Voice

를 한 번에 설정하게 하기 위한 UX 위치일 뿐입니다.

**TTS preference를 Level data나 TrainingSelection에 넣지 않습니다.**

## 4. 미리듣기

각 voice option마다 별도 재생 버튼을 4개 늘어놓지 않습니다.

권장 interaction:

```text
시험 질문 음성
[Heart] [Bella] [Sarah] [Sky]   ▶ 미리듣기

스크립트 재생 음성
[Heart] [Bella] [Sarah] [Sky]   ▶ 미리듣기
```

- 선택 → 미리듣기
- 미리듣기는 짧은 샘플
- 모델 로드 중이면 progress/status
- preview 실패 시 fallback 가능

## 5. Waveform

최종 선택:

**A · Studio Bars**

제품에 B/C variant selector는 넣지 않습니다.

요구사항:

- 실제 생성 audio waveform 사용
- 전체 waveform은 재생 전부터 보임
- played portion만 왼쪽→오른쪽으로 accent fill
- play/pause
- current / duration
- script player에서는 seek 허용
- exam player에서는 compact / 최소 UI

## 6. 시험 질문 / 스크립트 재생

### Exam
`examVoice`

### Script learning
`scriptVoice`

별도 preference를 정확히 적용합니다.

## 7. Fallback

정상:

```text
Kokoro → generated audio → waveform
```

실패:

```text
Kokoro fail → existing Web Speech API
```

기존 TTS를 삭제하지 말고 fallback adapter로 남깁니다.

## 8. Backend

이번 1차 통합에서 TTS를 backend로 보내지 않습니다.

AI/STT 때문에 향후 사내 backend가 생겨도 Kokoro browser-local inference는 계속 유지할 수 있습니다.

즉:

```text
AI/STT → future backend
TTS    → frontend-local
```

도 정상적인 최종 architecture입니다.

## 9. 모델 asset

1차:
- runtime model fetch 허용
- browser cache
- lazy load

2차:
- OOM 자체 static asset / 사내 static host로 mirror
- remote model loading off

**1차 통합에 self-host CI/model mirror까지 억지로 묶지 않습니다.**

## 10. 실제 OPIc/Ava

- 실제 시험 음원 추출 금지
- Ava 음성 clone을 이번 작업에 포함하지 않음
- Kokoro 기반 OOM interviewer voice만 사용
