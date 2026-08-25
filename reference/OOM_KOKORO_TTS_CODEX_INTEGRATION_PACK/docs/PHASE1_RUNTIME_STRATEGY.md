# Phase 1 Runtime Strategy

이번 통합은 기능 안정화를 우선합니다.

## 현재

```text
first Kokoro use
↓
model asset fetch
↓
browser cache
↓
q8/WASM inference
```

모델을 앱 startup에서 미리 받지 않습니다.

lazy load.

## Why

현재 한 번에:
- TTS architecture
- STEP3 UI
- Preferences
- waveform
- self-host model mirror
- CI asset fetch

까지 모두 넣으면 원인 분리가 어려워집니다.

따라서 1차는 voice/runtime UX를 먼저 검증합니다.

## First-use UX

모델 최초 로딩 중:

```text
음성 모델 준비 중 · 최초 1회
```

가능하면 progress 표시.

UI freeze 금지.

## Cache

브라우저가 모델을 캐시하므로 정상 조건에서 매 재생마다 전체 모델을 다시 받지 않습니다.

## Model version

한 곳에서 상수화:

```ts
const KOKORO_MODEL_ID = "...";
const KOKORO_DTYPE = "q8";
const KOKORO_DEVICE = "wasm";
```

random inline literals 반복 금지.

## Future self-host

2차에서 동일 engine interface를 유지하고 model source만 OOM static path로 바꿉니다.

consumer component 수정 최소화.

