# Future Intranet Backend Migration

사용자는 향후 AI 기능 때문에 사내 서버를 둘 계획입니다.

따라서 browser-local Kokoro는 최종 architecture의 막다른 길이 아닙니다.

---

# Phase 1 — Now

```text
React/Vite
  ↓
kokoro-js Worker
  ↓
q8 WASM
  ↓
RawAudio Blob
  ↓
WaveSurfer
```

장점:
- 빠른 voice selection
- backend 불필요
- same UI prototype
- privacy

---

# Phase 2 — Intranet Server

추천:

```text
Frontend
  ↓
POST /api/tts
  ↓
Kokoro TTS Service
  ↓
WAV / MP3
  ↓
WaveSurfer
```

TTS adapter interface를 유지하면 UI는 거의 안 바뀝니다.

예:

```ts
interface TtsEngine {
  generate(input: {
    text: string;
    voice: string;
    speed: number;
  }): Promise<Blob>;
}
```

Browser engine:
`BrowserKokoroEngine`

Future:
`IntranetKokoroEngine`

---

# Backend의 장점

- 모든 임직원 동일 voice
- browser machine 성능 차이 제거
- model download 없음
- generated audio cache
- 긴 script 사전 생성
- voice blend
- 중앙 voice version 관리

---

# Voice Blend

Kokoro server implementations에는 voice tensor blending을 지원하는 예가 있습니다.

예:
- Bella + Sarah
- weighted blends

따라서 Browser Lab에서 single voice를 먼저 고르고,
나중에 server 단계에서:

`OOM Interviewer v2`

같은 독자적인 blend를 추가 테스트할 수 있습니다.

단 공식 OPIc/Ava 음성을 clone training data로 쓰는 것은
별도 권리 허가 없이 진행하지 않는 것이 안전합니다.

---

# Cache Recommendation

시험 질문 / 고정 script:

```text
hash(text + voice + speed + modelVersion)
↓
audio cache
```

로 서버에서 pre-generate/cache하면
실전 UI에서 TTS inference wait를 거의 없앨 수 있습니다.
