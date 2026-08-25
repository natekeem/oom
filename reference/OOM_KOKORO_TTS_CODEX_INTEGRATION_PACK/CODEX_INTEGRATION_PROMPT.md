# Codex 작업 지시서
## OOM — Kokoro 4 Voice + STEP 3 Voice Settings + Studio Wave Player

이번 작업은 새 기능의 제품 방향을 설계하는 작업이 아니다.

제품 결정과 reference architecture는 이 integration pack에 이미 확정되어 있다.

Codex의 역할:

> **현재 OOM repository를 실제로 읽고, 확정된 설계를 현재 API/component/state 구조에 맞게 안전하게 통합한다.**

---

# 0. 작업 시작 전

반드시:

```bash
git status
git rev-parse HEAD
git rev-parse origin/main
```

기록.

그 다음 repository 전체에서 다음을 찾는다.

- 현재 TTS / `speechSynthesis`
- 질문 재생
- STEP 4 script playback
- Practice exam audio/listen state
- listen count 0/2
- STEP 3 difficulty component
- TrainingSelection type/storage
- settings/localStorage helpers
- AppShell/theme tokens
- existing audio/player components
- Vite worker pattern
- package manager / lock file
- tests

가능하면:

```bash
rg -n "speechSynthesis|SpeechSynthesisUtterance|getVoices|tts|TTS|listen|audio|playback" src
```

사용.

**reference-code의 import/path/component 이름을 현재 repo에 그대로 존재한다고 가정하지 않는다.**

---

# 1. 먼저 integration pack 읽기

필수:

- `docs/PRODUCT_DECISIONS.md`
- `docs/INTEGRATION_ARCHITECTURE.md`
- `docs/PHASE1_RUNTIME_STRATEGY.md`
- `docs/QA_ACCEPTANCE.md`
- `docs/MODEL_ASSET_PHASE2.md`

reference:

- `reference-code/tts/*`
- `reference-code/workers/kokoro.worker.ts`
- `reference-code/audio/*`
- `reference-code/ui/VoiceSettingsReference.tsx`

---

# 2. Dependencies

현재 package manager 확인.

검토 후 추가:

```text
kokoro-js 1.2.1
wavesurfer.js 7.12.11
```

현재 React/Vite/TS와 compatibility 확인.

기존 lock file 사용.

---

# 3. Voice list LOCK

정확히 4개:

```text
af_heart
af_bella
af_sarah
af_sky
```

UI labels:

```text
Heart
Bella
Sarah
Sky
```

다른 voice 노출 금지.

default:

```text
Exam   = af_heart
Script = af_bella
```

---

# 4. Preference architecture

별도 storage.

TrainingSelection에 넣지 않는다.

Level object에 넣지 않는다.

Course에 넣지 않는다.

예:

```text
oom.tts.preferences
```

shape:

```json
{
  "examVoice": "af_heart",
  "scriptVoice": "af_bella"
}
```

malformed/legacy guard.

---

# 5. STEP 3 UI

현재 STEP 3 난이도 설정 UX를 먼저 읽고
기존 card/token hierarchy에 맞춰 `음성 설정` section 추가.

목표:

```text
음성 설정

시험 질문 음성
[Heart] [Bella] [Sarah] [Sky]   ▶ 미리듣기

스크립트 재생 음성
[Heart] [Bella] [Sarah] [Sky]   ▶ 미리듣기
```

중요:

- 너무 큰 설정 panel 금지
- 현재 STEP3 design language 재사용
- selection 명확
- preview loading/status compact
- mobile wrap

---

# 6. Preview text

Exam:

```text
Tell me about a place you visit often.
```

Script:

```text
One place I really enjoy visiting is a quiet beach near my city.
```

실제 OPIc official audio/prompt를 scraping/extract하지 않는다.

---

# 7. Kokoro runtime

Phase 1:

- q8
- WASM
- lazy
- singleton
- browser cache
- worker preferred
- sequential queue

model source는 이번 pass에서 runtime fetch 허용.

**self-host model mirror/CI는 이번 작업 범위 아님.**

---

# 8. Loading UX

Kokoro model이 최초로 필요할 때만 load.

앱 startup에 90MB급 model fetch 금지.

first preview/play:

```text
음성 모델 준비 중 · 최초 1회
```

가능하면 progress.

다른 navigation/UI는 계속 responsive해야 함.

---

# 9. Existing Web Speech fallback

기존 `speechSynthesis` code를 삭제하지 않는다.

Kokoro:
- load error
- generate error
- unsupported environment

이면 기존 path로 fallback.

fallback UI는 과하지 않게:

```text
시스템 음성으로 재생 중
```

정도.

---

# 10. Practice / exam integration

현재 Practice exam flow를 반드시 보존.

질문 audio 생성 시:

```text
preferences.examVoice
```

사용.

절대 깨지면 안 되는 것:

- exam shell
- question lifecycle
- recording
- answer end
- review
- listen max 2
- listen count
- optional question text
- no transcript/feedback during answer

TTS 때문에 listen count가 reset되거나 bypass되면 실패.

---

# 11. STEP 4 script integration

현재 script learning playback 위치를 찾는다.

재생 시:

```text
preferences.scriptVoice
```

사용.

selected storyline/variant/tab state 유지.

STEP4 learning architecture 자체는 수정 금지.

---

# 12. Waveform

Studio Bars 하나만.

`wavesurfer.js`.

actual generated audio waveform.

visual:

- 전체 waveform 미리 표시
- neutral unplayed
- accent played
- left→right fill
- bars 2px-ish
- gap 2px-ish
- rounded

raw color literal보다 existing OOM tokens 사용.

---

# 13. Player variants

공용 player를 만들되:

### exam
- compact
- height 작음
- current play state
- 기존 listen rule 보존
- seek는 현재 시험 UX와 충돌하면 disable

### script
- 조금 더 큼
- seek enable
- 반복 청취

---

# 14. Object URL / WaveSurfer cleanup

반드시:

```text
WaveSurfer.destroy()
URL.revokeObjectURL()
```

blob/voice 변경 시 old instance 정리.

메모리 leak 금지.

---

# 15. Audio generation cache

이번 pass에서 거대한 persistent audio cache 시스템 만들지 않는다.

component/session 수준에서 동일:
- text
- voice
- speed

조합을 짧게 memo/cache하는 건 허용.

모델 cache와 generated audio cache를 혼동하지 않는다.

---

# 16. Speed

기존 OOM TTS speed preference가 이미 있다면 확인.

제품 기본은 1.0 또는 현재 natural default를 우선.

새 speed setting UI를 이번 작업에 추가하지 않는다.

Preview는 동일 speed로 비교.

---

# 17. Theme

dark/light 둘 다.

waveform:
- unplayed neutral
- played OOM accent
- contrast 충분

hardcoded dark-only background 금지.

---

# 18. Mobile

390×844
430×932

voice buttons:
- wrap
- no overflow
- preview button readable

wave:
- shrink
- no horizontal overflow

---

# 19. Tests

최소:

### preference
- defaults
- independent exam/script
- persistence
- malformed fallback
- invalid voice fallback

### STEP3
- 4 voices
- select exam
- select script
- preview selected voice
- TrainingSelection untouched

### runtime
- Kokoro success
- Kokoro fail → Web Speech fallback
- lazy model load
- queue behavior where testable

### exam
- examVoice used
- listen max semantics unchanged

### script
- scriptVoice used

### wave
- player mounts on Blob
- cleanup
- exam/script seek policy

SVG/canvas exact pixels brittle test 금지.

---

# 20. Validation

실제 scripts 확인 후 가능한 것:

```bash
npm run lint
npm run test
npm run build
npm run verify:pages
git diff --check
```

repo에 있는 경우:

```bash
npm run docs:generate
npm run docs:check
```

없는 script invent 금지.

---

# 21. Scope guard

이번 작업에서 금지:

- model self-host CI
- GitHub Pages migration
- backend TTS
- Ava cloning
- actual OPIc audio extraction
- STT refactor
- AI refactor
- STEP4 redesign
- Practice redesign
- STEP3 full redesign
- global typography pass
- new settings page
- Magazine
- About
- Landing

---

# 22. Completion report

다음 순서:

1. baseline SHA
2. current TTS source inspection
3. STEP3 integration location
4. Practice exam integration location
5. STEP4 script integration location
6. files changed
7. dependencies
8. preference storage
9. Kokoro worker/runtime
10. first-load behavior
11. exam voice flow
12. script voice flow
13. preview flow
14. WaveSurfer implementation
15. fallback behavior
16. listen-count regression result
17. dark/light QA
18. responsive QA
19. tests
20. validation
21. remaining issues
22. intentionally deferred Phase2 self-host items

**commit / push 하지 않는다.**
