# Product Decisions — Source of Truth

## 1. `/about/`의 역할

`/about/`은 랜딩 페이지가 아닙니다.

Landing `/`:
- 브랜드 경험
- cinematic motion
- 첫 인상
- 제품 진입

About `/about/`:
- OOM 시스템을 한 화면에서 이해
- Course × Level 구조 설명
- STEP 4 / STEP 6 / AI 연결 이해
- interactive product map

따라서 About에 WebGL / scroll pin / cinematic landing motion을 복사하지 않습니다.

---

## 2. Desktop first viewport

Desktop에서 AppShell/header/footer를 포함한 현재 레이아웃 안에서 가능한 한 **첫 화면에 핵심 내용이 전부 보여야 합니다.**

목표 viewport:
- 1440×900
- 1920×1080

허용:
- 내부 Course list scroll (Course가 4개 이상일 때)

비권장:
- page 자체 vertical scroll

1024×900에서는 약간의 page scroll을 허용할 수 있습니다.

Mobile에서는 정상 stacked scroll입니다.

---

## 3. Global content width

기존 OOM AppShell의 공통 content container 폭을 유지합니다.

금지:
- About만 max-width 확대
- full-width About
- viewport 기준 별도 wide layout

문제는 폭이 아니라 내부 구성입니다.

---

## 4. 핵심 설명 모델

OOM을 다음 causal model로 설명합니다.

```text
COURSE
무엇을 준비할지
        \
         → TRAINING CONTEXT
        /
LEVEL
얼마나 깊게 말할지

TRAINING CONTEXT
→ Survey / Story
→ Difficulty
→ Script / Question Adaptation
→ Roleplay
→ Practice
→ AI Feedback
→ Retry
```

---

## 5. 실제 제품 truth

OOM은 다음을 돕습니다.

- 준비할 기본 story 범위를 줄임
- 기본 script/scaffold를 익힘
- 질문에 맞게 필요한 fact를 바꿈
- Level에 맞춰 답변 길이/밀도를 조절
- 실제로 말함
- AI feedback을 확인
- 같은 질문에 다시 답함

다음 표현은 피합니다.

- 완전 자유회화 훈련
- 점수/등급 보장
- 최소 노력으로 무조건 고득점
- AI가 모든 것을 자동 해결
- 공식 OPIc 채점

---

## 6. AI wording

사용:
- AI Coach
- AI Assist
- KEEP / FIX / RETRY

설명:
- 답변 분석
- 스크립트/질문 Assist
- 재시도 미션

표시:
`AI 피드백은 공식 OPIc 점수·등급 판정이 아닙니다.`

---

## 7. Course scalability

Course는 앞으로 추가될 수 있습니다.

따라서:
- hardcoded 3-course JSX 금지
- course registry 기반 렌더링
- Course count dynamic
- overflow는 Course chooser 내부에서 처리

Level은 현재 3개 training preset을 유지합니다.

---

## 8. No duplicated explanation

화면에서 같은 내용을 여러 섹션으로 반복하지 않습니다.

상단 metrics:
- 숫자/구조만

왼쪽 input:
- Course / Level의 의미

오른쪽 system:
- 무엇에 영향을 주는지

하단 summary:
- 현재 선택에 대한 한 문장

CTA:
- 실제 제품 진입

이 역할이 겹치지 않아야 합니다.
