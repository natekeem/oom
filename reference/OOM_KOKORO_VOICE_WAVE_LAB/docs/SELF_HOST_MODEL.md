# Self-host Model Notes

현재 Dev Lab은 편의를 위해 Hugging Face model repo에서 최초 model asset을 가져옵니다.

최종 사내망에서는 외부 모델 다운로드를 차단하고
모델 asset 자체를 사내 서버에 둘 수 있습니다.

권장 두 방식:

## A. Browser inference + Intranet static model

```text
Intranet static server
  /models/kokoro/...

Browser
  → same-origin model assets
  → WASM inference
```

장점:
서버 GPU/CPU TTS process 불필요.

단점:
각 client가 모델을 다운로드/캐시.

---

## B. Server inference — 장기 추천

```text
Frontend
  → /api/tts
Backend
  → local Kokoro model
```

임직원 수가 적더라도,
AI backend를 결국 둘 계획이라면 운영 일관성은 B가 좋습니다.

---

# Model mirror

모델을 사내로 반입할 때는 원본 model repository의:
- license
- model card
- voice metadata

도 함께 보관하세요.

Model:
`onnx-community/Kokoro-82M-v1.0-ONNX`

Kokoro weights:
Apache-2.0 계열 확인.
