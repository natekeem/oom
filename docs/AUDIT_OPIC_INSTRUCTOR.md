# OOM OPIc Instructor & Curriculum Audit

- Audit date: 2026-08-22
- Scope: `Course 1~3 × Foundation/Intermediate/Advanced`, survey presets, canonical storylines, question variants, replacement guides, roleplays, practice pools, STEP 1~6, STEP 6 coaching prompt
- Mode: **AUDIT ONLY** — 이 문서 외 실제 코드·콘텐츠·질문·스크립트는 수정하지 않았다.
- Perspective: 한국인 학습자의 이해, 재조립, 실제 발화 안정성, 질문 적합성을 우선하는 OPIc 강사·커리큘럼 설계 관점

## Executive Summary

OOM의 교육 철학은 유효하다. “최소한의 이야기 → 여러 질문에 재사용 → 같은 story를 Level에 따라 성장 → opening/pivot/closing을 질문에 맞게 조정”하는 방식은 수십 개의 모범 답안을 외우는 방식보다 실제 말하기 능력으로 전이될 가능성이 높다. 특히 12개 canonical storyline은 모두 Foundation → Intermediate → Advanced에서 장소·사람·사건·핵심 사실을 대체로 유지한다. 이 부분은 OOM의 가장 강한 자산이다.

그러나 현재 시스템 전체가 그 철학을 끝까지 일관되게 지키지는 못한다.

1. canonical story 자체는 잘 성장하지만, **variant/replacement layer가 레벨과 무관한 고급 문단을 제공**한다. Foundation 학습자도 `well-maintained hiking trail`, `surrounding green hills`, `ambitious gym goals`, `warranty and return terms` 같은 표현을 받는다.
2. 일부 variant는 같은 장면의 초점만 바꾸지 않고 `집 근처 해변`, `평소 해안 드라이브`, `카메라`, `warm tea`, `foreign city streets` 같은 새 설정을 만든다. 이는 OOM 핵심 철학과 직접 충돌한다.
3. 연습 질문은 Course × Level별 수와 storyline 배분은 완벽하게 균등하지만, 같은 생성 패턴을 반복한다. Foundation의 12개 최근 경험 질문은 모두 `Tell me about a recent time you + 현재형` 형태의 문법 오류가 있다.
4. Advanced canonical script는 평균 165.5~186.5단어다. 한국인 AL 준비 학습자가 110 wpm 전후로 말하면 평균 90~102초가 걸린다. Course 1과 Course 3은 목표 상한 90초를 넘기기 쉽고, 202단어 답변은 scaffold보다 완성 원고가 되기 쉽다.
5. 롤플레이의 레벨 성장 자체는 좋지만, UI가 모든 상황에서 “동일한 6단계”를 강하게 반복한다. 문제 유형에 따라 4~5개 기능만 필요한 경우를 가르치지 않아 block-filling 습관을 만들 수 있다.
6. STEP 6의 “고칠 점 1가지 + 같은 질문 재시도”는 매우 좋은 코칭 설계다. 다만 결과 화면은 9개 섹션을 요구하므로 실제 학습자가 받는 인지 부담은 여전히 크다.

최종 판정: **교육 철학은 KEEP, canonical story corpus도 대체로 KEEP. P0는 전면 rewrite가 아니라 variant의 레벨 계약, 질문 문법·기능 분리, 6단계 공식의 유연성 복구다.**

## Overall Curriculum Verdict

### OFFICIAL / PROFICIENCY PRINCIPLE

- ACTFL Proficiency Guidelines는 proficiency를 실제 상황에서 의사소통 목표를 달성하는 능력으로 보고, spontaneous and non-rehearsed context를 전제로 한다. 평가는 Functions/Tasks, Accuracy, Context/Content, Text Type을 함께 본다. [ACTFL Proficiency Guidelines Overview](https://www.actfl.org/proficiency-guidelines-overview)
- ACTFL의 OPIc 안내도 OPIc이 spontaneous unrehearsed language ability를 평가하며, background survey가 speaking task의 topic pool을 결정한다고 명시한다. [ACTFL OPIc official page](https://www.actfl.org/assessments/postsecondary-assessments/oral-proficiency-interview-computer-opic)
- Advanced Low는 주요 시간대에서 서술·묘사를 하고, 문장을 paragraph-length connected discourse로 연결하며, complication 또는 unexpected turn을 처리할 수 있어야 한다. 완벽한 essay 문체나 특정 길이의 암송 대본을 요구한다는 뜻은 아니다. [ACTFL Proficiency Guidelines 2024 PDF](https://www.actfl.org/uploads/files/general/Resources-Publications/ACTFL_Proficiency_Guidelines_2024.pdf)
- 이 보고서와 OOM은 공식 등급을 판정할 권한이 없다. 공식 ACTFL rating은 공식 시험과 certified rater를 통해서만 부여된다. [ACTFL official ratings policy](https://www.actfl.org/use-of-actfl-proficiency-guidelines-and-issuing-of-official-actfl-tests)

### COACHING HEURISTIC

- 한국인 학습자에게 script는 “말할 내용을 잊지 않게 해 주는 장면 지도”여야 한다. 문장 순서까지 정확히 재현해야 작동한다면 scaffold가 아니다.
- Level 상승은 단어 수 증가보다 기능 증가로 보여야 한다. Foundation의 안정된 장면에 이유, 최근 경험, 비교, 문제 해결을 단계적으로 얹는 방식이 바람직하다.
- 답변 시간은 등급 기준이 아니라 연습 preset이다. 45초를 채우지 못했다고 자동 실패하거나 90초를 넘겼다고 자동 고득점이 되지 않는다.

### Verdict by core hypothesis

| Hypothesis | Verdict | Reason |
| --- | --- | --- |
| 최소 이야기로 준비량을 줄인다 | PASS | Course별 4개 canonical scene으로 범위를 통제한다. |
| 같은 story가 Level에 따라 성장한다 | PASS | 12/12 storyline에서 anchor와 core facts가 대체로 유지된다. |
| 질문마다 opening/pivot/closing을 바꾼다 | PARTIAL | 설계도 개념은 좋지만 레벨 공용 replacement와 새 사실 추가가 잦다. |
| script는 scaffold다 | PARTIAL | canonical은 scaffold가 될 수 있으나 전체 문단 KEEP과 160~200단어 Advanced 원고는 암기를 유도한다. |
| 실전 질문 적합성을 훈련한다 | WEAK-PARTIAL | STEP 6가 있으나 pool 문구와 기능 분리가 지나치게 기계적이다. |

## What OOM Does Better Than Typical Memorization Prep

1. **Anchor scene이 명시돼 있다.** 학습자가 문장보다 장면을 기억할 수 있는 기반이 있다.
2. **Course와 Level의 책임을 분리한다.** Course는 이야기 세계, Level은 발화 밀도라는 설계가 교육적으로 이해하기 쉽다.
3. **Foundation부터 완결된 작은 장면을 준다.** 대부분 첫 문장, 장소/사람, 2~3개 행동, 느낌이 존재한다.
4. **Intermediate가 같은 장면에 이유·경험·변화를 더한다.** 전혀 다른 story로 바뀌는 사례는 발견되지 않았다.
5. **Advanced가 문제·비교·의미를 추가한다.** 특히 `coastal-camp`, `smart-shopping`, `trail-photo`는 기능 확장이 선명하다.
6. **질문별로 유지/교체를 시각화한다.** “새 답을 하나 더 외우기”보다 “어디를 바꿀지”를 생각하게 하는 방향은 옳다.
7. **롤플레이가 요청 기능을 레벨별로 확장한다.** Foundation의 문제+요청에서 Advanced의 조건 비교+협상으로 성장한다.
8. **STEP 6가 동일 질문 재시도를 제공한다.** 피드백을 읽고 끝내지 않고 다시 말하게 하는 것은 실제 코칭에 가깝다.

## Top 10 Content Risks

| Rank | ID | Severity | Risk |
| --- | --- | --- | --- |
| 1 | OPI-01 | CRITICAL | Level 공용 replacement가 Foundation에 Advanced register를 주입한다. |
| 2 | OPI-02 | CRITICAL | 일부 variant가 same story가 아니라 new story를 만든다. |
| 3 | OPI-03 | HIGH | 질문 pool의 문법 오류와 복합 topic 나열이 질문 듣기 훈련을 방해한다. |
| 4 | OPI-04 | HIGH | Advanced 길이와 완성도가 scaffold보다 암송 원고에 가깝다. |
| 5 | OPI-05 | HIGH | 3-block blueprint가 2문단 Foundation/Intermediate 실제 구조와 맞지 않는다. |
| 6 | OPI-06 | HIGH | 모든 롤플레이를 동일 6단계로 처리하도록 과도하게 고정한다. |
| 7 | OPI-07 | HIGH | 화면의 IM3/IH/AL 라벨이 저장된 Level target과 어긋난다. |
| 8 | OPI-08 | HIGH | Advanced pool이 anchor에 없는 problem/opinion을 매 storyline에 강제한다. |
| 9 | OPI-09 | MEDIUM | Course 1 Advanced에 filler가 집중돼 자연스러움보다 연출된 말투가 된다. |
| 10 | OPI-10 | MEDIUM | STEP 6는 한 가지 수정 철학을 갖지만 출력은 9개 섹션이라 과부하다. |

## Course 1 Audit — Everyday & Getaway

### Course verdict

세 코스 중 가장 균형 잡힌 baseline이다. 가족 여행, 휴식, 취미, 집이라는 익숙한 세계가 beginner friendly하고, Survey와 storyline의 연결도 대체로 직관적이다. 기존 Advanced baseline은 전면 rewrite할 이유가 없다. 다만 Course 1만 Advanced filler가 유독 많고, 추천 Survey의 `interest-cooking`, `vacation-overseas`는 canonical story에서 직접 대응력이 약하다.

| Storyline | Same-story growth | Reuse | Vocabulary cost | Verdict |
| --- | --- | --- | --- | --- |
| `outdoor-travel` | 가족·바닷가·산책·조깅·해산물 유지 | 장소/여행/루틴/변화 강함, problem 약함 | 낮음~중간 | KEEP, Advanced 길이만 관리 |
| `indoor-rest` | 카페 창가·라테·음악·집 휴식 유지 | 카페/집/음악/스트레스에 효율적 | 낮음 | KEEP |
| `sports-hobby` | 친구·테니스·장비·향상 유지 | 운동/취미/쇼핑/변화 강함 | 중간 | KEEP, 장비 어휘 선택화 |
| `home-residence` | 가족 아파트·동네·집안일 유지 | 집/동네/가족/집안일/문제 강함 | 낮음 | KEEP |

### Finding OPI-09

- **ID:** OPI-09
- **Severity:** MEDIUM
- **Course:** Course 1
- **Level:** Advanced
- **Storyline:** 전체 4개
- **Current problem:** 네 Advanced script에 `Actually` 3회, `The thing is` 2회, `You know` 2회, `To be honest` 1회, `I mean` 1회, `Let me think` 1회가 discourse marker로 들어간다. 다른 코스보다 현저히 밀도가 높다.
- **Why this matters for Korean OPIc learners:** 학습자는 filler의 기능보다 위치를 외워 매 문단 앞에 붙이기 쉽다. 그러면 spontaneous speech가 아니라 “자연스러워 보이도록 만든 원고”처럼 들린다.
- **Recommended direction:** filler를 스크립트 구성 요소가 아니라 선택 가능한 recovery tool로 가르친다. 한 답변에 0~2개면 충분하다.
- **Example improvement:** `The thing is, I do not need a complicated plan...` → `I do not need a complicated plan to enjoy a trip.`
- **Risk of changing:** 기존 Advanced baseline의 리듬을 과도하게 평평하게 만들 수 있으므로 일괄 삭제는 금지한다.

### Course 1 survey gaps

- `interest-cooking`: `indoor-rest`의 “make dinner”와 `home-residence`의 kitchen chores가 간접 대응할 뿐, 요리 자체의 routine/recent experience는 없다.
- `vacation-overseas`: `outdoor-travel`의 가족 바닷가 여행으로 여행 일반 질문은 대응 가능하지만 해외여행 고유 질문에는 근거가 없다.
- `leisure-shopping`: `sports-hobby`의 장비 구매와 연결돼 효율적이다.

## Course 2 Audit — Culture & City

### Course verdict

“최소 준비 노력 대비 많은 질문 대응” 역할을 세 코스 중 가장 잘 수행한다. 일상 어휘가 많고, `culture-night` 하나로 영화·공연·콘서트·음악을, `solo-staycation` 하나로 집·휴가·국내여행·여행관 변화를 묶는다. Foundation 평균 58.3단어, Intermediate 89.5단어, Advanced 165.5단어로 전체 길이도 가장 경제적이다.

| Storyline | Same-story growth | Reuse | Vocabulary cost | Verdict |
| --- | --- | --- | --- | --- |
| `culture-night` | 친구·영화·작은 공연·좋아하는 노래 유지 | 문화 4항목을 한 저녁으로 묶음 | 중간 | KEEP |
| `smart-shopping` | 고장·두 모델·착용감·반품 조건 유지 | 쇼핑/비교/문제/롤플레이 연결 우수 | 낮음~중간 | KEEP |
| `light-fitness` | 근처 공원·30분 걷기·짧은 조깅 유지 | 운동 안 함까지 포용 | 낮음 | KEEP |
| `solo-staycation` | 1인 가구·집 휴가·당일 도시여행 유지 | 집/휴가/여행 변화 폭넓음 | 낮음 | KEEP |

### Finding OPI-11

- **ID:** OPI-11
- **Severity:** KEEP
- **Course:** Course 2
- **Level:** 전체
- **Storyline:** 전체 4개
- **Current problem:** 문제 없음. Course 2는 서로 다른 survey topic을 한 장면 안에서 가장 자연스럽게 묶는다.
- **Why this matters for Korean OPIc learners:** 준비해야 할 고유명사와 사건 수가 적고, 익숙한 행동 동사로 다시 조립하기 쉽다.
- **Recommended direction:** 준비 효율 추천 코스 지위를 유지한다.
- **Example improvement:** 없음. `smart-shopping`의 “필요 → 비교 → 선택 → 변화” 구조는 모범적인 재사용 단위다.
- **Risk of changing:** 효율을 높이겠다고 더 많은 topic을 붙이면 현재 장점이 사라진다.

## Course 3 Audit — Nature & Weekend

### Course verdict

Course 1/2와 충분히 다르다. 자연·캠핑·사진·박물관·룸메이트라는 별도 story world가 명확하다. 다만 세 코스 중 vocabulary burden이 가장 높고 Advanced 평균이 186.5단어다. `shared-home-vacation`은 202단어로 가장 길다. beginner가 실제 경험이 없으면 캠핑 장비, 사진 전시, 여행 방식에 관한 detail을 통째로 암기할 위험도 높다.

| Storyline | Same-story growth | Reuse | Vocabulary cost | Verdict |
| --- | --- | --- | --- | --- |
| `trail-photo` | 룸메이트·공원 trail·전망대·사진 유지 | 공원/걷기/하이킹/사진/변화 | 중간 | KEEP, variant 새 사실 통제 |
| `coastal-camp` | 친구·해안 캠핑·강풍·도움·일출 유지 | 캠핑/해변/드라이브/여행/problem | 높음 | 실제 경험자에게 추천 |
| `museum-reading` | 비·작은 박물관·흑백 사진·도록 유지 | 박물관/사진/독서/관점 변화 | 높음 | niche지만 내부 연결 좋음 |
| `shared-home-vacation` | 룸메이트·비 오는 연휴·사진·여행책 유지 | 집/휴가/해외여행/사진/변화 | 중간~높음 | Advanced 압축 필요 |

### Finding OPI-12

- **ID:** OPI-12
- **Severity:** MEDIUM
- **Course:** Course 3
- **Level:** Foundation~Advanced
- **Storyline:** `coastal-camp`, `museum-reading`, `shared-home-vacation`
- **Current problem:** `stakes`, `extra rope`, `exposed site`, `black-and-white photographs`, `exhibition guide`, `attractions`, `restorative`처럼 topic-specific vocabulary가 누적된다.
- **Why this matters for Korean OPIc learners:** 장면에 실제 경험이 없는 beginner는 단어를 장면으로 회상하지 못하고 번역식 암기에 의존한다.
- **Recommended direction:** Course 3를 “쉬운 코스”가 아니라 실제로 자연/사진/박물관 경험이 있는 학습자의 선택형 코스로 유지하고, Foundation에서는 고유 어휘를 최소 세트로 제한한다.
- **Example improvement:** `angle the stakes and use an extra rope`는 Advanced 선택 detail로 두고, Foundation/Intermediate의 핵심은 `The wind was strong, so a camper helped us secure the tent.` 정도면 충분하다.
- **Risk of changing:** niche vocabulary를 모두 제거하면 Course 3의 차별성과 생생한 장면이 사라진다.

## Level Progression Audit

### Same story growth verdict

12개 storyline을 Foundation → Intermediate → Advanced 순서로 검토한 결과, **전부 같은 장소·사람·사건·core facts를 유지한다.** Level 상승 시 새 story로 바뀌는 canonical script는 없다.

- Foundation: 짧은 장소/사람 소개 + 2~4 actions + 감정으로 안정적이다.
- Intermediate: 이유, 최근 또는 기억나는 경험, 간단한 비교/변화가 추가된다.
- Advanced: complication, choice, comparison, meaning이 추가돼 기능적 성장이 보인다.

다만 Advanced는 기능뿐 아니라 문장 수와 추상적 의미까지 한꺼번에 늘어나는 경우가 있어 말하기보다 writing에 가까워진다.

### Finding OPI-04

- **ID:** OPI-04
- **Severity:** HIGH
- **Course:** Course 1, Course 3 중심
- **Level:** Advanced
- **Storyline:** 전체, 특히 `outdoor-travel` 190단어, `shared-home-vacation` 202단어
- **Current problem:** 세 문단이 너무 완결적이고 평균 165.5~186.5단어다. 현실적 학습자 속도에서는 90초를 넘기기 쉽다.
- **Why this matters for Korean OPIc learners:** 긴 문장을 끝내지 못하거나 중간 한 문장을 잊으면 뒤 문단까지 연쇄적으로 무너진다. 질문을 듣고 필요한 부분을 선택하기보다 원고 처음부터 투척하기 쉽다.
- **Recommended direction:** Advanced baseline을 전면 rewrite하지 말고, 각 문단에서 “필수 core line”과 “선택 expansion line”을 구분한다. 120~160단어의 말하기 가능한 core가 먼저 보여야 한다.
- **Example improvement:** `There were bus stops, old signs, people waiting at crosswalks, and small stores...`에서 예시는 두 개만 말하고 나머지는 선택 detail로 둔다.
- **Risk of changing:** 너무 줄이면 paragraph-length connected discourse와 장면의 구체성이 약해질 수 있다.

### Finding OPI-07

- **ID:** OPI-07
- **Severity:** HIGH
- **Course:** 전체
- **Level:** Foundation, Intermediate
- **Storyline:** 전체
- **Current problem:** 저장된 target은 Foundation=`IM2/IM1`, Intermediate=`IH/IM3`인데, script 화면용 `goalLevel`은 Foundation을 `IM3`, Intermediate를 `IH`로 단일 매핑한다. Difficulty의 Foundation 카드도 30~45초 preset과 달리 `40~60초`를 안내한다.
- **Why this matters for Korean OPIc learners:** 같은 학습자가 화면마다 다른 목표를 읽으면 답변 밀도와 성공 기준을 잘못 이해한다.
- **Recommended direction:** 등급 보장이 아닌 preset이라는 문구를 유지하면서 모든 화면에서 동일한 target label과 duration을 사용한다.
- **Example improvement:** `3구간 · IM2/IM1 · 30~45초 연습 preset`처럼 한 줄로 통일한다.
- **Risk of changing:** 기존 테스트/타입의 `GoalLevel`이 세 값만 지원하므로 표시 계약을 먼저 정해야 한다.

## Survey Efficiency Audit

| Course | Recommended survey cluster | Primary mapping | Gap / forced link |
| --- | --- | --- | --- |
| 1 | 공원·해변·카페·쇼핑·음악·요리·테니스·조깅·걷기·3종 휴가 | 4개 storyline에 대부분 연결 | 요리, 해외여행은 간접 연결 |
| 2 | 영화·공연·쇼핑·콘서트·공원·음악·걷기/조깅/운동 안 함·3종 휴가 | 4개 storyline에 직접 연결 | 큰 공백 없음 |
| 3 | 캠핑·공원·해변·드라이브·박물관·사진·독서·걷기·하이킹·3종 휴가 | 4개 storyline에 직접 연결 | 어휘 비용이 높음 |

### Finding OPI-13

- **ID:** OPI-13
- **Severity:** MEDIUM
- **Course:** Course 1
- **Level:** 전체
- **Storyline:** `indoor-rest`, `outdoor-travel`
- **Current problem:** 추천 Survey의 요리와 해외여행을 canonical scene이 직접적으로 가르치지 않는다.
- **Why this matters for Korean OPIc learners:** 추천 선택은 곧 준비 범위 약속으로 받아들여진다. 실제 질문에서 요리 과정이나 해외 경험을 요구하면 학생은 새 story를 급히 만들어야 한다.
- **Recommended direction:** 추천 항목을 삭제하라는 뜻이 아니라, 현재 scene으로 직접 대응 가능한 범위와 간접 전환 범위를 명시한다.
- **Example improvement:** `요리: 본격 레시피 질문용이 아니라 집에서 쉬는 저녁의 simple dinner detail로만 사용`처럼 한계를 표시한다.
- **Risk of changing:** Survey 선택 수나 기존 전략 조합을 건드리면 다른 훈련 경로에 영향이 있다.

## Script Naturalness Audit

### Spoken English verdict

- Foundation은 대부분 짧고 리듬이 안정적이다. 다만 53~68단어를 실제 beginner가 75~90 wpm으로 말하면 일부는 45초를 넘길 수 있다.
- Intermediate는 가장 말하기 친화적이다. 문장 길이, 이유, 경험 detail의 균형이 좋다.
- Advanced는 문법적으로 자연스럽지만 지나치게 완성된 서면형 문장과 추상적 ending이 증가한다.
- 정확히 같은 opening/closing 문장은 36개 canonical script에서 반복되지 않았다. `So yeah`, `Overall`, `For these reasons`도 없다. **lexical repetition은 낮지만 모든 Advanced가 교훈·변화·의미로 완결되는 rhetorical repetition은 높다.**

### Finding OPI-14

- **ID:** OPI-14
- **Severity:** MEDIUM
- **Course:** 전체
- **Level:** Advanced
- **Storyline:** `museum-reading`, `shared-home-vacation`, `coastal-camp` 중심
- **Current problem:** `That idea stayed with me`, `my idea of a good vacation has changed`, `taught me that...`처럼 모든 장면이 의미 있는 깨달음으로 닫히는 경향이 있다.
- **Why this matters for Korean OPIc learners:** 실제 말하기에서는 모든 답변이 교훈으로 끝나지 않는다. 학습자가 질문과 무관한 “배운 점”을 억지로 붙일 수 있다.
- **Recommended direction:** opinion/change 질문에서는 의미 ending을 유지하고, description/routine 질문에서는 마지막 구체 행동이나 짧은 감정으로 자연스럽게 멈추도록 선택지를 준다.
- **Example improvement:** `We stayed at the overlook for a while, took a few more pictures, and then walked home.`
- **Risk of changing:** Advanced의 변화 기능을 모든 variant에서 동시에 제거하면 level 차이가 약해진다.

## Variation / Blueprint Audit

### Finding OPI-01

- **ID:** OPI-01
- **Severity:** CRITICAL
- **Course:** 전체
- **Level:** Foundation, Intermediate
- **Storyline:** 전체 variant/replacement layer
- **Current problem:** replacement guide가 Level별 데이터가 아니어서 같은 문단이 세 레벨에 공통 적용된다. Foundation canonical은 쉬운데 교체 문단은 `well-maintained`, `exceptionally clear`, `evolved over time`, `qualify`, `significantly` 같은 Advanced register를 사용한다.
- **Why this matters for Korean OPIc learners:** 쉬운 원문을 이해해 재조립하던 learner가 variant에서 갑자기 외워야 하는 고급 문단을 받는다. Level progression 계약이 무너진다.
- **Recommended direction:** 교체는 레벨별 완성 문단보다 기능별 cue로 먼저 제공한다. 필요하면 Foundation/Intermediate/Advanced별 1~2문장 micro-example을 둔다.
- **Example improvement:** Foundation park opening: `I like a park near my home. It has an easy trail and a small viewpoint.`
- **Risk of changing:** replacement data 구조와 UI가 영향을 받으므로 P0 content contract를 먼저 정의해야 한다.

### Finding OPI-02

- **ID:** OPI-02
- **Severity:** CRITICAL
- **Course:** 전체
- **Level:** 전체
- **Storyline:** 다수 variant
- **Current problem:** `outdoor-travel`의 가족 리조트 장면이 “집 근처 자주 가는 해변”이 되고, `coastal-camp`가 “평소 해안 드라이브”가 되며, `trail-photo`의 phone이 camera가 되고, `museum-reading`에 warm tea와 corner seat가 추가된다. same focus가 아니라 new fact/new routine이다.
- **Why this matters for Korean OPIc learners:** 질문마다 새 사실을 외워야 하므로 memorization cost가 다시 증가한다. 서로 다른 version을 섞어 말할 가능성도 커진다.
- **Recommended direction:** 각 variant fact를 `KEEP / CHANGE / DROP / NEW`로 검증하고, NEW는 질문에 필수인 최소 사실만 허용한다. anchor와 충돌하는 NEW는 제거한다.
- **Example improvement:** 해변 장소 질문도 `The beach near the small resort is the place I remember most.`처럼 같은 가족 여행 안에서 초점만 바꾼다.
- **Risk of changing:** variant의 표면 다양성이 줄어들지만, 그것이 OOM 철학에 맞는 의도된 축소다.

### Finding OPI-05

- **ID:** OPI-05
- **Severity:** HIGH
- **Course:** 전체
- **Level:** Foundation, Intermediate
- **Storyline:** 전체
- **Current problem:** Blueprint는 opening/details/closing 3-block을 전제하지만 canonical Foundation/Intermediate는 대부분 2문단이다. 현재 조립 로직에서는 2문단 답변의 closing block이 비고 둘째 문단 전체가 details가 된다. 동시에 UI는 “메인 스토리 그대로 사용”을 권한다.
- **Why this matters for Korean OPIc learners:** KEEP가 의미 단위가 아니라 긴 문단 암기를 뜻하게 된다. closing이 비어 있어도 3단계라고 보이므로 학생이 구조를 잘못 배운다.
- **Recommended direction:** 문단 수가 아니라 기능 단위로 `ANSWER`, `SCENE/ACTION`, `RESULT`를 잡고, 각 기능 안에서도 drop 가능한 문장을 표시한다.
- **Example improvement:** Foundation 2문단도 `ANSWER: I play tennis... / ACTION: We practice... / RESULT: It is fun.`으로 3기능을 추출한다.
- **Risk of changing:** 기존 paragraph 기반 시각화와 replacement 연결을 다시 정의해야 한다.

### Blueprint verdict

Blueprint의 “유지/교체/메인에서 빼는 부분” 표현은 KEEP/CHANGE/DROP 개념의 좋은 출발이다. 그러나 학생에게는 아직 “문단 단위 교체 공식”으로 보인다. 가장 중요한 교육적 보완은 **문장보다 fact를 선택하게 만드는 것**이다.

## Roleplay Audit

### Level differentiation

| Level | Actual corpus behavior | Verdict |
| --- | --- | --- |
| Foundation | 문제를 직접 말하고 요청 1개, 필요 시 대안 1개 | PASS |
| Intermediate | 시간/사유 맥락 + 요청 + 대안 1~2개 | PASS |
| Advanced | 조건 확인 + 대안 비교 + 비용/시간/정책 협상 | PASS |

### Finding OPI-06

- **ID:** OPI-06
- **Severity:** HIGH
- **Course:** 전체
- **Level:** 전체
- **Storyline:** 모든 roleplay
- **Current problem:** UI가 “어떤 상황이 와도, 같은 6단계”, “동일한 6단계 공식”이라고 반복한다. 실제 answerStructure는 4~5개이고, 박물관 촬영 정책처럼 문제+두 질문만으로 충분한 상황도 있다.
- **Why this matters for Korean OPIc learners:** 요청보다 설명을 길게 하거나, 없는 대안 2개와 formal closing을 억지로 넣는다. 질문의 communicative function을 놓친다.
- **Recommended direction:** 6단계를 checklist가 아니라 menu로 가르친다. 필수 core는 `문제/목적 → 질문 또는 요청 → 다음 행동`이며, 대안 2와 closing은 필요할 때만 사용한다.
- **Example improvement:** `4-block: 시간 문제 → 같은 티켓 사용 가능? → 다음 시간 가능? → 촬영 규칙?`
- **Risk of changing:** 단순한 기억 장치의 장점이 약해질 수 있으므로 6개 이름은 유지하되 “전부 쓸 필요 없음”을 전면에 둔다.

### Finding OPI-15

- **ID:** OPI-15
- **Severity:** MEDIUM
- **Course:** 전체
- **Level:** 전체
- **Storyline:** roleplay distribution
- **Current problem:** Course당 storyline은 4개지만 roleplay는 3개다. Course 1 `indoor-rest`, Course 2 `light-fitness`, Course 3 `trail-photo`/`shared-home-vacation`은 직접 roleplay 시나리오가 없다. Course 1 manifest의 roleplay ID 4개와 실제 3개 ID도 일치하지 않는다.
- **Why this matters for Korean OPIc learners:** 코스 전체가 균등하게 roleplay로 이어진다고 기대하지만 실제 훈련은 특정 그룹에 몰린다.
- **Recommended direction:** 새 roleplay 추가를 즉시 권하는 것이 아니라, 현재 3개가 어느 survey 기능을 대표하는지 정확히 표시하고 manifest/content 계약을 정리한다.
- **Example improvement:** `이 코스의 roleplay는 예약 변경·서비스 문제·조건 확인 3기능을 대표합니다.`
- **Risk of changing:** 단순히 수를 4개로 맞추면 불필요한 콘텐츠가 늘어난다.

## Practice Question Audit

### Distribution verdict

각 Course는 Level당 12문항, storyline당 정확히 3문항이다. 양적 균형은 매우 좋다. 그러나 한 pool에 기능 유형이 세 가지뿐이고, 문구가 같은 template의 topic slot 교체로 생성돼 자연스러운 시험 질문의 다양성이 부족하다.

| Course | Foundation | Intermediate | Advanced |
| --- | --- | --- | --- |
| 1 | description 4 / routine 4 / recent 4 | description-reason 4 / routine-detail 4 / experience-change 4 | expanded-experience 4 / comparison-change 4 / problem-opinion 4 |
| 2 | description 4 / routine 4 / recent 4 | description-reason 4 / routine-detail 4 / experience-change 4 | expanded-experience 4 / comparison-change 4 / problem-opinion 4 |
| 3 | description 4 / routine 4 / recent 4 | description 4 / routine 4 / recent 4 | recent-experience 4 / comparison 4 / unexpected-situation 4 |

### Finding OPI-03

- **ID:** OPI-03
- **Severity:** HIGH
- **Course:** 전체
- **Level:** Foundation
- **Storyline:** 전체 12개
- **Current problem:** 모든 recent prompt가 `Tell me about a recent time you spend/relax/practice/enjoy/shop/walk/go/visit...`처럼 `a recent time` 뒤에 현재형을 쓴다. 또한 `Describe movies, live performances, concerts, or music. What is it like?`처럼 복수 주제를 한 질문에 묶어 지시 대상도 모호하다.
- **Why this matters for Korean OPIc learners:** 듣기 단계에서 문법적으로 잘못된 시제 패턴을 반복 학습하고, 무엇을 하나 골라 답해야 하는지 판단하기 어렵다.
- **Recommended direction:** 한 prompt에는 하나의 중심 기능과 하나의 topic family만 둔다. 최근 경험은 자연스러운 과거 유도 문장으로 통일한다.
- **Example improvement:** `Tell me about the last time you went camping. Where did you go, and what happened?`
- **Risk of changing:** 질문 수와 storyline balance는 유지해야 한다.

### Finding OPI-08

- **ID:** OPI-08
- **Severity:** HIGH
- **Course:** Course 1, Course 2
- **Level:** Advanced
- **Storyline:** 전체
- **Current problem:** 모든 storyline에 `problem, unexpected situation, or important choice`와 `what did you learn?`을 강제한다. `indoor-rest`, `culture-night`, `light-fitness`의 canonical anchor에는 자연스러운 problem이 없다.
- **Why this matters for Korean OPIc learners:** 새 story를 즉석에서 만드는 것이 아니라 준비하지 않은 가짜 문제를 추가하거나, 질문과 무관한 교훈을 붙이게 된다.
- **Recommended direction:** anchor가 가진 기능에 맞춰 문제형·비교형·opinion형을 분리하고, 모든 story가 모든 기능을 커버해야 한다는 강박을 버린다.
- **Example improvement:** `How has your way of relaxing changed over time, and why does the new routine work better for you?`
- **Risk of changing:** pool의 기계적 대칭은 줄지만 실제 재사용 가능성은 더 정직해진다.

### Finding OPI-16

- **ID:** OPI-16
- **Severity:** MEDIUM
- **Course:** Course 3
- **Level:** Intermediate
- **Storyline:** 전체
- **Current problem:** prompt는 이유와 변화까지 묻는데 type metadata는 Foundation과 동일한 `description/routine/recent-experience`다.
- **Why this matters for Korean OPIc learners:** 화면 label과 실제 요구 기능이 달라 question intent를 잘못 분류한다.
- **Recommended direction:** metadata를 실제 communicative function과 맞추고, label을 난이도 장식이 아니라 듣기 전략 cue로 사용한다.
- **Example improvement:** `experience-change`처럼 실제 prompt가 요구하는 기능을 표시한다.
- **Risk of changing:** 분석/테스트에서 기존 type 문자열을 참조할 수 있다.

## STEP 6 Coaching Audit

### What works

- 녹음 → 재생 → STT 확인/수정 → AI feedback → 같은 질문 재시도의 순서가 좋다.
- transcript만으로 pronunciation/intonation을 평가하지 말라는 규칙이 정직하다.
- 공식 점수나 등급을 보장하지 말라는 규칙이 명확하다.
- `유지할 점 2가지`, `고칠 점 1가지`, `다음 시도 미션`은 실제 수업에서 효과적인 제한 방식이다.

### Finding OPI-10

- **ID:** OPI-10
- **Severity:** MEDIUM
- **Course:** 전체
- **Level:** 전체
- **Storyline:** STEP 6 feedback
- **Current problem:** 화면은 “한 가지만 고쳐보세요”라고 말하지만 AI 출력은 목표 적합도, 질문 대응, 구조, 시제/구체성, 발화량, 유지 2개, 고칠 1개, 표현 3개, 다음 미션까지 9개 섹션이다.
- **Why this matters for Korean OPIc learners:** 학습자가 우선순위 하나보다 전체 평가표를 읽느라 재시도가 늦어진다. 표현 3개도 새 암기 과제가 될 수 있다.
- **Recommended direction:** 첫 화면/첫 단락은 `KEEP 1 / FIX 1 / RETRY 1`만 보여 주고, 나머지는 펼쳐보는 진단으로 둔다.
- **Example improvement:** `이번 재시도 미션: 첫 문장에서 “last Saturday”를 말하고, 과거형으로 끝까지 유지하세요.`
- **Risk of changing:** 상세 피드백을 원하는 고급 학습자에게 정보가 부족할 수 있으므로 삭제보다 계층화가 낫다.

### Missing coaching dimensions

- **Question-function match:** topic만 맞았는지보다 description/routine/past/problem 중 무엇을 요구했는지 확인해야 한다.
- **Repair strategy:** 막혔을 때 짧게 다시 말하기, 쉬운 단어로 바꾸기, 문장을 끊어 재출발하기.
- **Core fact integrity:** anchor facts를 유지했는지, 질문 때문에 불필요한 새 story를 만들었는지.
- **Pause evidence caution:** transcript와 duration만으로 long pause 위치를 알 수 없다. WPM은 사용자가 수정한 transcript일 수도 있으므로 진단 보조값으로만 써야 한다.

## Quantitative Appendix

### Canonical script length

시간 환산은 등급 기준이 아니라 editorial estimate다. Foundation 90 wpm, Intermediate 100 wpm, Advanced 110 wpm을 한국인 학습자의 안정적 연습 속도로 가정했다.

| Course | Level | Scripts | Avg words | Min–Max | Estimated avg | Target |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | Foundation | 4 | 60.0 | 56–64 | 40초 | 30–45초 |
| 1 | Intermediate | 4 | 98.0 | 89–110 | 59초 | 45–65초 |
| 1 | Advanced | 4 | 180.0 | 173–190 | 98초 | 60–90초 |
| 2 | Foundation | 4 | 58.3 | 53–66 | 39초 | 30–45초 |
| 2 | Intermediate | 4 | 89.5 | 82–99 | 54초 | 45–65초 |
| 2 | Advanced | 4 | 165.5 | 154–177 | 90초 | 60–90초 |
| 3 | Foundation | 4 | 63.8 | 55–68 | 43초 | 30–45초 |
| 3 | Intermediate | 4 | 100.0 | 96–106 | 60초 | 45–65초 |
| 3 | Advanced | 4 | 186.5 | 180–202 | 102초 | 60–90초 |

### Practice pool size and storyline coverage

| Course × Level | Questions | Storylines covered | Questions per storyline | Type families |
| --- | ---: | ---: | ---: | ---: |
| 모든 9개 조합 | 12 | 4/4 | 3 | 3 |

총 108문항이다. 수와 storyline 분포는 균등하지만, 각 pool의 type family가 3개뿐이어서 breadth보다 반복성이 강하다.

### Variants and replacement guides

| Course | Storylines | Variants per storyline | Total variants | Replacement guides |
| --- | ---: | ---: | ---: | ---: |
| 1 | 4 | 4 | 16 | 16 |
| 2 | 4 | 4 | 16 | 16 |
| 3 | 4 | 4 | 16 | 16 |

양은 충분하다. 문제는 양이 아니라 level independence와 new-fact drift다.

### Canonical storyline reusability matrix

아래 표는 variant가 새 사실을 추가하기 전, **canonical scene 자체만으로** 대응 가능한 기능을 보수적으로 판정한 것이다. `S`는 직접 지원, `P`는 opening/ending을 바꾸면 부분 지원, `—`는 새 사건이 필요한 경우다.

| Course / Storyline | Description | Routine | Recent | Memorable | Comparison | Change | Problem | Opinion |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| C1 `outdoor-travel` | S | P | S | S | P | P | — | P |
| C1 `indoor-rest` | S | S | P | — | — | — | — | S |
| C1 `sports-hobby` | S | S | S | P | S | S | P | S |
| C1 `home-residence` | S | S | P | P | — | — | S | S |
| C2 `culture-night` | P | P | S | S | P | S | — | S |
| C2 `smart-shopping` | P | S | S | P | S | S | S | S |
| C2 `light-fitness` | P | S | — | — | S | S | P | S |
| C2 `solo-staycation` | S | S | P | P | S | S | — | S |
| C3 `trail-photo` | S | S | S | S | S | S | — | S |
| C3 `coastal-camp` | P | — | P | S | P | S | S | S |
| C3 `museum-reading` | S | P | S | S | P | S | — | S |
| C3 `shared-home-vacation` | S | P | S | S | S | S | P | S |

핵심 해석: 모든 storyline이 8기능을 모두 커버할 필요는 없다. 오히려 `indoor-rest`에 problem을, `light-fitness`에 memorable incident를 억지로 넣는 순간 새 story 비용이 생긴다.

### Vocabulary load proxy

고유 어휘 부담을 비교하기 위해 common function word를 제외한 서로 다른 영어 word type을 storyline별로 계산한 평균이다. 정확한 난이도 점수는 아니지만 Course 간 상대 비교에는 유용하다.

| Course | Foundation avg content-word types | Advanced avg content-word types | Editorial burden |
| --- | ---: | ---: | --- |
| 1 | 26.8 | 82.8 | 낮음~중간 |
| 2 | 27.5 | 76.3 | 가장 낮음 |
| 3 | 30.3 | 91.8 | 가장 높음 |

Course 3의 높은 값은 캠핑 장비, 지형, 사진 전시, 여행 회상 어휘가 서로 겹치지 않기 때문이다. 따라서 이 코스는 경험 적합도가 준비 효율보다 우선돼야 한다.

### Frequent openings, fillers, closings

Canonical 36개 기준:

| Pattern | Count / distribution | Judgment |
| --- | --- | --- |
| Exact duplicate first sentence | 0 | 좋은 다양성 |
| Exact duplicate last sentence | 0 | 좋은 다양성 |
| `Actually` lexical occurrence | 11 | 7회는 “실제로” 의미; filler 통계와 분리 필요 |
| Course 1 Advanced discourse markers | 10 | 한 코스에 과집중 |
| `To be honest` | 2 | 과다하지 않음 |
| `The thing is` | 2 | 둘 다 Course 1 Advanced |
| `You know` | 2 | 둘 다 Course 1 Advanced |
| `I mean` | 1 | 낮음 |
| `Let me think` | 1 | 낮음 |
| `So yeah / Overall / For these reasons` | 0 | KEEP |
| Advanced meaning/change ending | 12/12 | 기능적으로 과도하게 균일 |

### Roleplay example length

| Course | Foundation avg | Intermediate avg | Advanced avg |
| --- | ---: | ---: | ---: |
| 1 | 33.7 words | 47.7 words | 81.0 words |
| 2 | 32.3 words | 41.0 words | 82.3 words |
| 3 | 31.0 words | 49.3 words | 85.3 words |

Roleplay는 Level 증가에 따른 기능과 발화량의 성장이 가장 안정적인 영역이다.

## KEEP — Do Not Rewrite

### Finding OPI-17

- **ID:** OPI-17
- **Severity:** KEEP
- **Course:** 전체
- **Level:** 전체
- **Storyline:** canonical 12개
- **Current problem:** 문제 없음. 같은 anchor scene과 core facts가 세 Level에서 유지된다.
- **Why this matters for Korean OPIc learners:** 한 번 이해한 장면을 쉬운 문장부터 확장할 수 있어 준비량을 줄인다.
- **Recommended direction:** 전면 rewrite 금지. 이후 수정은 길이, 선택 detail, spoken rhythm에 한정한다.
- **Example improvement:** 없음.
- **Risk of changing:** OOM의 가장 중요한 자산인 story continuity를 잃는다.

### Finding OPI-18

- **ID:** OPI-18
- **Severity:** KEEP
- **Course:** 전체
- **Level:** 전체
- **Storyline:** Foundation canonical, roleplay level growth, STEP 6 retry
- **Current problem:** 문제 없음.
- **Why this matters for Korean OPIc learners:** 짧은 완결 장면, 기능별 roleplay 성장, 동일 질문 재시도는 실제 수업에서 유지 가치가 높다.
- **Recommended direction:** 이 세 축을 다음 개선의 회귀 기준으로 삼는다.
- **Example improvement:** 없음.
- **Risk of changing:** UI polish나 콘텐츠 확장 과정에서 핵심 훈련 루프가 흐려질 수 있다.

## Content that should NOT be rewritten

1. Course 1의 네 Advanced baseline 전체 — filler와 optional detail만 국소 조정한다.
2. Course 2 `smart-shopping`의 필요→비교→선택→소비 습관 변화 구조.
3. Course 2 `light-fitness`의 “운동을 좋아하지 않아도 지속 가능한 낮은 압력의 걷기” 설정.
4. Course 3 `coastal-camp`의 강풍→도움 요청→해결 core event.
5. Course 3 `museum-reading`의 전시 관람→도록 읽기→사진 관점 변화 core event.
6. 모든 Foundation canonical의 쉬운 첫 문장과 2문단 완결성.
7. Roleplay의 Foundation→Intermediate→Advanced 기능 성장.
8. STEP 6의 녹음 재생→transcript 확인→한 가지 수정→같은 질문 재시도 흐름.

## P0 / P1 / P2 Content Backlog

### P0 — 철학과 Level 계약 복구

1. Variant/replacement를 Level-aware cue 또는 level별 micro-example로 바꾼다.
2. 모든 variant의 NEW fact를 감사해 anchor와 충돌하는 새 장소·사건·routine을 제거한다.
3. Foundation recent-experience 12문항의 문법 오류를 고치고 복합 topic 나열을 자연스러운 단일 focus 질문으로 바꾼다.
4. Foundation/Intermediate의 target grade와 duration label을 모든 화면에서 통일한다.
5. 6단계 roleplay를 “필요한 블록만 고르는 menu”로 명시한다.

### P1 — 말하기 가능성과 질문 적합성 강화

1. Advanced core와 optional expansion을 구분해 Course 1/3의 실발화 길이를 관리한다.
2. Advanced problem/opinion을 모든 storyline에 강제하지 말고 anchor가 실제 지원하는 기능으로 재분배한다.
3. 2문단 script에 맞는 기능 기반 blueprint를 정의한다.
4. Course 3 Intermediate type metadata를 실제 prompt 기능과 맞춘다.
5. STEP 6 첫 출력은 KEEP 1 / FIX 1 / RETRY 1로 압축하고 상세 진단은 보조로 둔다.

### P2 — 정교화

1. Course 1 Advanced filler를 선택형 recovery phrase로 분산한다.
2. Advanced ending에 행동 종료, 짧은 감정, 열린 종료를 섞는다.
3. Course 1 요리·해외여행 연결의 한계를 Survey 화면에 정직하게 표시한다.
4. Roleplay 대표 기능과 storyline coverage를 명확히 설명한다.
5. 질문 pool에 문구/청취 리듬 다양성을 추가하되 문항 수를 무작정 늘리지 않는다.

## If I were teaching a student with OOM for 4 weeks, the 5 changes I would make first are:

1. **매 script를 문장 암기가 아니라 5개 core facts 카드로 바꾸어 말하게 한다.** 첫 주에는 Foundation scene을 30~45초로 세 번 다르게 말한다.
2. **Variant를 보기 전에 질문 기능을 먼저 고르게 한다.** description, routine, past experience, change, problem 중 무엇인지 듣고, 필요 없는 fact는 DROP한다.
3. **Advanced는 core 120~160단어만 안정화하고 expansion은 선택한다.** 90초 원고 재현보다 60초 안정 답변 후 자연 확장을 우선한다.
4. **Roleplay는 6개 블록을 모두 쓰지 않는다.** 질문의 요구에 따라 4개 또는 5개만 골라 문제→요청→다음 행동을 분명히 한다.
5. **매 attempt에서 한 가지만 고치고 같은 질문을 즉시 다시 말한다.** 첫 문장 직접 답하기, 과거형 유지, detail 하나 추가, 긴 문장 둘로 끊기 중 하나만 미션으로 준다.
