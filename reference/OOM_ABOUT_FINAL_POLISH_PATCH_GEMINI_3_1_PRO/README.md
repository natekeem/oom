# OOM About Final Polish Patch

이 패키지는 이미 완성된 `/about/` Interactive System Explorer의 **visual polish만** 수행하기 위한 패치 지시서입니다.

## Gemini에게 전달

Gemini 3.1 Pro 권장.

다음 문장을 같이 전달하세요:

> 이 ZIP을 풀고 `GEMINI_3_1_PRO_FINAL_POLISH_PATCH.md`를 최종 작업지시서로 사용해. `reference/about-final-polish-v2.html`은 최종 비율/밀도/타이포그래피 참고용이다. 이미 구현된 Course/Level registry 연결과 local interaction architecture는 보존하고 visual/layout polish만 수행해. 작업 전에 현재 실제 source를 읽고 문서의 import/API를 추측하지 마. 커밋/푸시는 하지 마.

## 핵심

- Course column 약 310px
- Course title 한 줄 + ellipsis
- Course helper 최대 한 줄, 불필요하면 제거
- metrics 확대
- right map width 약간 감소
- module typography 확대
- right system이 left selector bottom까지 차도록 vertical fill
- 기존 기능/상태/registry 연결 보존
