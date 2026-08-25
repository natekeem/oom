# Integration Architecture

## 목표

현재 OOM의 Web Speech API 중심 TTS를 **adapter 기반**으로 정리합니다.

권장 conceptual structure:

```text
TtsManager
├─ KokoroBrowserEngine
└─ WebSpeechFallback

TtsPreferences
├─ examVoice
└─ scriptVoice

Consumers
├─ STEP 3 preview
├─ Practice / exam question
└─ STEP 4 script learning

Audio UI
└─ OomWavePlayer
```

실제 폴더/파일 이름은 현재 OOM repo conventions에 맞춥니다.

---

# 1. TTS interface

```ts
interface TtsEngine {
  generate(input: {
    text: string;
    voice: OomVoiceId;
    speed?: number;
  }): Promise<TtsAudio>;
}
```

`TtsAudio`는 최소:

```ts
type TtsAudio = {
  blob: Blob;
  mimeType: string;
};
```

필요하면:
- duration
- engine
- voice
- fallback flag

추가 가능.

---

# 2. Kokoro engine

권장:

- `kokoro-js`
- `q8`
- `wasm`
- lazy singleton model
- worker 사용
- sequential generation queue
- browser cache
- first-use loading status

모델은 한 번 로드하고 voice embedding만 변경합니다.

4 voice 지원이 model download 4배를 의미하지 않습니다.

---

# 3. Worker

Kokoro inference는 UI thread를 최대한 막지 않도록 Worker를 권장합니다.

```text
UI
 ↓ postMessage
Kokoro Worker
 ↓ generate
Blob
 ↓
UI
```

현재 repo/build에서 Worker bundling이 문제없다면 적용.

문제가 있다면 first pass에서 main-thread adapter를 구현하고 후속 최적화로 분리할 수 있지만,
가능하면 Worker를 우선합니다.

---

# 4. Preference

독립 key 예:

```text
oom.tts.preferences
```

value:

```json
{
  "examVoice": "af_heart",
  "scriptVoice": "af_bella"
}
```

guard:
- malformed JSON fallback
- unsupported voice fallback
- browser unavailable guard

TrainingSelection / Course / Level storage와 섞지 않습니다.

---

# 5. Preview

STEP3 preview sample은 고정 짧은 text.

Exam sample 예:

```text
Tell me about a place you visit often.
```

Script sample 예:

```text
One place I really enjoy visiting is a quiet beach near my city.
```

공식 시험 음원을 재사용하지 않습니다.

---

# 6. Playback integration

Kokoro output:
`Blob`

WaveSurfer:
`Blob URL`

player lifecycle:

```text
blob
→ URL.createObjectURL
→ WaveSurfer load
→ waveform
→ destroy
→ URL.revokeObjectURL
```

memory leak 금지.

---

# 7. Exam UX

시험 화면은 full audio editor가 아닙니다.

compact player:

```text
[▶]  waveform  0:00 / 0:07
```

- waveform small
- seek 정책은 현재 exam flow를 확인
- 실제 OPIc-like listening restriction을 이미 구현 중이라면 기존 2-listen 정책 보존
- TTS integration 때문에 listen count가 초기화되거나 우회되지 않게 함

---

# 8. Script UX

STEP4:
- play/pause
- waveform
- seek
- replay
- selected script voice

스크립트 학습은 반복 청취가 목적이므로 exam보다 full player 허용.

---

# 9. Existing Web Speech

삭제 금지.

Kokoro runtime failure:
- model load
- generation
- unsupported browser
- worker failure

발생 시 기존 Web Speech path 사용.

사용자가 fallback을 선택하게 하는 복잡한 UI는 필요 없음.

작은 상태 텍스트만 허용:

```text
시스템 음성으로 재생 중
```

---

# 10. Dependency

Phase 1 target:

```json
"kokoro-js": "1.2.1"
"wavesurfer.js": "7.12.11"
```

하지만 Codex는 npm/install 전에 현재 repo의:
- React
- Vite
- TypeScript
- package-lock
- package manager

확인 후 compatibility 검증.

가능하면 기존 package manager 사용.

