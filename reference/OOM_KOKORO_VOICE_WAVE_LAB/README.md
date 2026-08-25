# OOM · Kokoro Voice + Waveform Lab

실제 OOM에 넣기 전에 **시험 질문용 음성 / 스크립트 학습용 음성 / waveform player 스타일**을 한 번에 비교하는 개발용 Lab입니다.

## 무엇을 테스트하나

### Kokoro voice 후보
- `af_heart`
- `af_bella`
- `af_sarah`
- `af_nicole`
- `af_nova`
- `af_sky`

각 후보를 같은 문장/같은 speed로 생성해서 직접 비교할 수 있습니다.

### 두 개의 최종 선택
- Exam / Interviewer voice
- Script / Natural voice

각각 따로 선택해서 `localStorage`에 Lab 결과를 저장합니다.

### Waveform 스타일
- A · Studio Bars — 추천
- B · Soft Wave
- C · Voice Print

모두 실제 생성 음성의 파형을 표시하고 재생된 부분이 왼쪽→오른쪽으로 채워집니다.

---

# 실행

Node.js 20+ 권장.

```bash
npm install
npm run dev
```

브라우저:
- Chrome 권장
- Edge 권장

Vite가 표시하는 localhost 주소로 접속하세요.

---

# 첫 실행 시 주의

현재 Lab은 실제 비교를 쉽게 하기 위해 모델 파일을:

`onnx-community/Kokoro-82M-v1.0-ONNX`

에서 최초 1회 가져옵니다.

기본 runtime:

- `kokoro-js 1.2.1`
- `q8`
- `WASM`
- 약 92 MB 급 모델
- 브라우저 cache 재사용
- TTS inference 자체는 브라우저 로컬

첫 음성 생성 전 모델 다운로드/초기화 시간이 필요합니다.

`6개 후보 모두 생성`은 **동시에 생성하지 않고 순차 생성**합니다. 브라우저 WASM 메모리 부담을 줄이기 위한 의도적인 동작입니다.

---

# 왜 q8 + WASM인가

Voice Lab의 목표는 최고 benchmark가 아니라:

- 다운로드 크기
- 실행 안정성
- GitHub Pages / 일반 정적 host 호환
- 동일 조건 A/B 비교

입니다.

WebGPU fp32는 더 큰 model download와 브라우저/driver 차이를 만들 수 있으므로 이 Lab의 기본값으로 쓰지 않습니다.

---

# 실제 OPIc / Ava 음성

이 Lab에는 실제 OPIc 시험 음원이나 Ava voice clone이 포함되어 있지 않습니다.

공식 sample은 별도로 청취하면서 이 Lab의 Kokoro 후보와 사람이 A/B 비교하세요.

`Ava와 가장 유사`는 자동 판정하지 않습니다.

---

# 나중에 사내 서버가 생기면

현재:

```text
Browser
  → Kokoro q8 / WASM
  → audio Blob
  → WaveSurfer
```

향후:

```text
OOM Frontend
  → Intranet TTS API
  → Kokoro server
     - fixed model
     - fixed OOM interviewer voice
     - optional voice blend
     - generated audio cache
  → WAV/MP3
  → same waveform player
```

로 옮길 수 있습니다.

즉 player/UI는 그대로 두고 TTS adapter만 교체하는 방향이 좋습니다.

자세한 내용은:

- `docs/RESEARCH.md`
- `docs/BACKEND_MIGRATION.md`
- `docs/WAVEFORM_DECISION.md`
- `docs/SELF_HOST_MODEL.md`

참조.

---

# OOM 본 프로젝트로 옮길 때

추천 분리:

```text
src/
  tts/
    TtsEngine.ts
    BrowserKokoroEngine.ts
    IntranetKokoroEngine.ts   // future
    WebSpeechFallback.ts

  audio/
    OomWavePlayer.tsx
```

Exam voice와 Script voice는 별도 설정값으로 둡니다.

```ts
type OomVoiceSettings = {
  examVoice: string;
  scriptVoice: string;
};
```

시험 질문과 스크립트 낭독의 역할이 다르기 때문입니다.
