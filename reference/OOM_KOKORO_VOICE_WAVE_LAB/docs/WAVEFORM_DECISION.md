# Waveform UX Decision

사용자가 요청한 느낌:

> 실제 음성 파장이 미리 깔려 있고,
> 재생하면 왼쪽에서 오른쪽으로 파형 색이 채워지는 느낌.

이건 real-time spectrum analyzer가 아니라 **decoded waveform + playback mask**가 적합합니다.

즉:

```text
GENERATE TTS
↓
WAV Blob
↓
decode/render waveform once
↓
playback progress
↓
played waveform color fills left → right
```

이 방식의 장점:

- 음성별로 실제 파형이 다름
- 재생 전에 전체 형태가 보임
- UI가 흔들리지 않음
- CPU 부담 낮음
- seek 가능
- script 길이에 상관없이 안정적

---

# 추천 Style

## A · Studio Bars
OOM 추천.

- 2px bar
- 2px gap
- rounded
- inactive neutral
- progress cyan/violet

시험 화면:
cyan 계열

스크립트:
violet 계열

## B · Soft Wave
전형적인 audio editor / podcast player.

조금 더 성숙하지만 OOM만의 signal identity는 약함.

## C · Voice Print
1px bar / 1px gap.

기술적이고 signal/frequency 느낌이 강함.
긴 waveform에서는 예쁠 가능성이 높음.

---

# 실제 OOM에서는

Exam:
- waveform을 너무 강하게 만들지 않음.
- 시험 UI 집중을 방해하지 않아야 함.

Script:
- waveform + scrub 적극 허용.
- 반복 청취에 유리.

Recommended:
- 같은 WavePlayer component
- visual density만 mode prop으로 변경
