# 01. Final Product Model

## 두 개의 축

### Course = 무엇을 말할까

Course가 소유:
- 추천 Background Survey option IDs
- canonical master storylines
- roleplay situations
- practice question topical pool

### Level = 어떻게 말할까

Level이 소유:
- 난이도 프리셋
- 목표 발화 시간/밀도
- 각 storyline의 level variant
- roleplay complexity
- practice question complexity
- AI feedback target

## Level 표

| 화면 | 내부 ID | 목표 | 기본 난이도 | 답변 방향 |
|---|---|---|---|---|
| 1구간 | `advanced` | AL | 5-5 | 장면·문제·비교·변화·유연성 |
| 2구간 | `intermediate` | IH / IM3 | 4-4 | 이유·최근 경험·간단한 변화 |
| 3구간 | `foundation` | IM2 / IM1 | 3-3 | 짧고 안정적인 장면 완성 |

난이도는 공식 등급 보장 규칙이 아니라 OOM 학습 프리셋입니다.

## 왜 내부 ID는 숫자가 아닌가

화면의 `1구간/2구간/3구간` 순서가 바뀌거나 향후 새 구간이 들어와도 데이터를 덜 깨뜨리기 위해 의미 기반 ID를 씁니다.

## Storyline

각 storyline은 `core.anchorScene`과 `core.facts`를 가집니다.

Level variant가 바뀌어도:
- 등장인물
- 장소
- 핵심 사건
- 주요 명사

는 최대한 유지합니다.

Level-up에서 새로 추가되는 것은 **새 사실의 양보다 발화 기능**이어야 합니다.

## Course 간 차별화

모든 survey option이 100% 달라야 할 필요는 없습니다. 공원·걷기·음악·여행처럼 준비 효율이 좋은 topic은 겹칠 수 있습니다.

대신 anchor scene이 달라야 합니다.

예:
- Course 1 걷기 → 가족 바닷가 리조트
- Course 2 걷기 → 운동을 싫어하는 사람의 30분 공원 루틴
