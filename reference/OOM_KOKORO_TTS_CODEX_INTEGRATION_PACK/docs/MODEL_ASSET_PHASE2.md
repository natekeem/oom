# Phase 2 — Self-host Model Asset

**이번 1차 구현 범위 아님.**

목표:

- runtime Hugging Face 의존 제거
- OOM 또는 사내 static server에서 model asset 제공
- inference는 계속 browser-local

가능한 최종:

```text
OOM frontend
  ↓
/models/kokoro/...
  ↓
browser WASM inference
```

사내 server가 생겨도 `/models/` static hosting만 사용 가능.

TTS backend inference로 반드시 마이그레이션할 이유 없음.

## Git repository

90MB급 binary를 Git repo에 직접 commit하는 것은 피하는 방향 권장.

대안:
- deploy pipeline에서 fetch/mirror
- release artifact
- object/static storage
- 사내 web server model directory

## 중요한 설계 포인트

Phase 1 consumer가 model URL/source를 몰라야 함.

즉:

```text
Practice
→ TtsManager.generate()
```

까지만 알고
실제 model source는 engine 내부 책임.

그래야 Phase2 변경이 작아짐.
