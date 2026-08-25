# Research Notes

조사 기준: 2026-08-24

## Kokoro

### kokoro-js
- npm: `kokoro-js`
- current package checked: `1.2.1`
- Apache-2.0
- browser local TTS
- WASM / WebGPU
- `RawAudio.toBlob()` 사용 가능
- q8 / fp32 / fp16 등 지원

공식 모델 후보:
`onnx-community/Kokoro-82M-v1.0-ONNX`

미국 여성 voice:
- af_heart
- af_alloy
- af_aoede
- af_bella
- af_jessica
- af_kore
- af_nicole
- af_nova
- af_river
- af_sarah
- af_sky

이번 shortlist는 품질과 비교 다양성을 고려해 6개만 노출했습니다.

### 브라우저 Local
Kokoro.js는 모델을 브라우저에서 실행할 수 있습니다.
Streaming Kokoro 구현들도 WebGPU/WASM fallback과 browser caching 패턴을 사용합니다.

---

# Waveform shortlist

## 1. WaveSurfer.js — 선택/구현

장점:
- 실제 waveform rendering
- `waveColor`
- `progressColor`
- playback progress fill
- seek
- barWidth / barGap / barRadius
- precomputed peaks 지원
- TypeScript
- dependency 0
- BSD-3-Clause

OOM처럼:
`미리 보이는 파형 + 재생된 구간만 왼쪽→오른쪽으로 채움`

에 가장 적합.

## 2. Peaks.js

장점:
- waveform
- overview + zoom
- marker
- segment
- played waveform color
- annotation

단점:
OOM의 단순 playback player에는 기능이 과함.

롤플레이/녹음 분석 편집툴처럼:
- 특정 구간 표시
- transcript marker
- feedback segment

까지 갈 때 다시 고려할 가치가 있음.

## 3. Custom Web Audio + Canvas

장점:
- dependency 0
- OOM 고유 시각 언어 완전 제어

단점:
- decode
- peaks calculation
- resize
- seek
- accessibility
- browser bugs

를 직접 유지해야 함.

현재는 WaveSurfer가 더 합리적.

---

# 링크

Kokoro:
- https://www.npmjs.com/package/kokoro-js
- https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- https://github.com/xenova/kokoro-web

WaveSurfer:
- https://wavesurfer.xyz/
- https://www.npmjs.com/package/wavesurfer.js
- https://github.com/katspaugh/wavesurfer.js

Peaks:
- https://github.com/bbc/peaks.js
