# QA / Acceptance

## A. Preferences

- [ ] voice 후보는 Heart / Bella / Sarah / Sky 정확히 4개
- [ ] Exam 기본 Heart
- [ ] Script 기본 Bella
- [ ] 두 선택이 독립
- [ ] 새로고침 후 유지
- [ ] malformed storage fallback
- [ ] unsupported legacy voice fallback

## B. STEP 3

- [ ] 난이도/레벨 기존 UI 흐름 깨지지 않음
- [ ] `음성 설정` 섹션 추가
- [ ] Exam voice selection
- [ ] Script voice selection
- [ ] 선택 voice preview
- [ ] 최초 model load status
- [ ] preview 실패 시 fallback
- [ ] TrainingSelection mutation 없음

## C. Exam

- [ ] 질문 음성이 `examVoice`
- [ ] existing listen 0/2 semantics 보존
- [ ] listen count 우회 불가
- [ ] waveform A / Studio Bars
- [ ] compact
- [ ] actual audio waveform
- [ ] played portion left→right fill
- [ ] no transcript/AI during answer regression

## D. Script

- [ ] STEP4 script playback가 `scriptVoice`
- [ ] actual Kokoro output
- [ ] Studio Bars
- [ ] seek 가능
- [ ] play/pause/replay
- [ ] selected variant/story state regression 없음

## E. Kokoro runtime

- [ ] lazy load
- [ ] singleton
- [ ] no 4x model download per voice
- [ ] q8
- [ ] WASM
- [ ] worker where compatible
- [ ] concurrent generation pressure guard
- [ ] first use does not hang app
- [ ] errors handled

## F. Fallback

- [ ] Kokoro load fail → Web Speech
- [ ] Kokoro generate fail → Web Speech
- [ ] current browser TTS code preserved or cleanly wrapped
- [ ] no crash

## G. WaveSurfer lifecycle

- [ ] WaveSurfer destroy
- [ ] Blob URL revoke
- [ ] route/unmount leak 없음
- [ ] switching voice replaces player correctly
- [ ] repeated playback stable

## H. Responsive

- [ ] 1440×900
- [ ] 1792×861
- [ ] 1024×900
- [ ] 430×932
- [ ] 390×844
- [ ] no horizontal overflow

## I. Theme

- [ ] dark
- [ ] light
- [ ] waveform neutral unplayed
- [ ] played accent consistent with OOM
- [ ] no hardcoded light/dark regression

## J. Build

- [ ] lint
- [ ] test
- [ ] build
- [ ] verify:pages if present
- [ ] git diff --check
