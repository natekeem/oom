# 04. Content Authoring Rules

## 제품의 핵심 교육 원칙

**최소한의 이야기 재고로 최대한 많은 질문에 대응**한다.

학습자는 문장 전체를 기계적으로 외우는 대신 다음을 익힌다.

1. anchor scene
2. core facts 5~8개
3. reusable chunks
4. question-specific opening/pivot
5. level-up에서 추가되는 발화 기능

## Foundation / 3구간

대략 30~45초.

필수:
- 질문에 직접 답
- 장소/사람
- 행동 2~3개
- 이유/감정
- 짧은 최근 경험 가능

피할 것:
- 긴 종속절
- 과도한 filler
- 너무 많은 새로운 고유명사

## Intermediate / 2구간

대략 45~65초.

Foundation facts 대부분 유지 +:
- 구체 이유
- 최근 경험 1개
- 간단한 before/now
- 세부 묘사 1~2개

## Advanced / 1구간

현재 OOM main script의 60~90초 밀도를 기준.

Intermediate facts 유지 +:
- 예상 밖 상황 또는 문제
- 선택/대안
- 비교/변화
- 감정의 변화 또는 의미
- 질문에 따라 일부 block을 버리고 다시 연결하는 능력

## 나쁜 level-up

Foundation 문장에 형용사와 filler만 늘려 길게 만드는 것.

## 좋은 level-up

Foundation:
`공원에서 30분 걷는다. 편해서 좋다.`

Intermediate:
`예전엔 강한 운동 계획을 오래 못 지켰지만 걷기는 부담이 적어 유지한다.`

Advanced:
`강한 운동만 운동이라고 생각했던 관점이 바뀌었고, 압박을 줄이자 실제 빈도가 늘었다.`

즉 Level-up은 **문장 길이 증가가 아니라 기능 증가**다.

## Roleplay

Foundation:
- 문제
- 핵심 요청 한 가지
- 대안 한 가지

Intermediate:
- 문제 맥락
- 대안 2개
- 기본 조건 확인

Advanced:
- 구체 조건
- 대안 비교
- 비용/시간/가능 여부 확인
- 상대 입장을 고려한 현실적 협상

## Practice

Foundation:
- 묘사
- 루틴
- 최근 경험

Intermediate:
- 묘사+이유
- 루틴+세부
- 경험+변화

Advanced:
- 경험 확장
- 비교/변화
- 문제/의견/예상 밖 상황

## AI Feedback

AI에는:
- courseId/title
- levelId/target label
- current question
- target response range
- storyline core facts

를 전달할 수 있습니다.

평가는 reference script와 문장 일치 여부가 아니라:
- 질문에 직접 답했는가
- 현재 level에 맞는 기능을 사용했는가
- 같은 facts를 자연스럽게 변형했는가
- 지나친 통암기 느낌 없이 연결되는가
를 중심으로 합니다.
