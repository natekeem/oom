# OOM Kokoro TTS Integration Pack

이 패키지는 **Codex가 현재 OOM repo를 먼저 읽고 실제 구조에 맞춰 통합 작업만 수행하도록 하는 실행 패키지**입니다.

핵심 결정은 이미 끝났습니다. Codex가 새로 제품 설계를 하지 않도록 하세요.

## 이번 1차 통합 목표

- Kokoro browser-local TTS 도입
- Voice shortlist는 정확히 4개
  - `af_heart`
  - `af_bella`
  - `af_sarah`
  - `af_sky`
- 시험 질문 음성 / 스크립트 재생 음성 각각 별도 선택
- STEP 3 난이도 설정 화면에 `음성 설정` UI 추가
- 선택 후 짧은 미리듣기 가능
- 시험 질문 재생은 `examVoice`
- STEP 4 스크립트 학습 재생은 `scriptVoice`
- Studio Bars waveform player
- 실제 생성 음원의 waveform을 미리 그리고 재생 구간만 왼쪽→오른쪽으로 채움
- Kokoro 실패 시 기존 Web Speech API fallback
- 사용자 voice preference는 TrainingSelection과 분리
- 현재 단계에서는 Hugging Face runtime model fetch 허용
- browser cache 사용
- **self-host model asset은 2차 작업으로 분리**
- AI/STT/backend architecture는 이번에 건드리지 않음

## 먼저 읽을 파일

1. `docs/PRODUCT_DECISIONS.md`
2. `docs/INTEGRATION_ARCHITECTURE.md`
3. `docs/PHASE1_RUNTIME_STRATEGY.md`
4. `docs/QA_ACCEPTANCE.md`
5. `CODEX_INTEGRATION_PROMPT.md`

`reference-code/`는 **copy-paste 강제 코드가 아니라 구현 기준/reference**입니다.

Codex는 반드시 현재 OOM repo의 실제 API, component, recorder, TTS 호출 구조를 확인한 뒤 맞춰서 통합해야 합니다.

## 커밋 정책

- 작업 후 lint/test/build
- 완료 보고
- **commit/push 하지 않기**
