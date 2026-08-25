# 14. Adding Course 4+ With Minimal Code Changes

## 결론

네. 구현을 이 reference 구조대로 하면 앞으로 코스 추가는 거의 콘텐츠 작업이 된다.

다만 OOM은 static Vite 앱이므로 새 파일을 서버에 그냥 던졌다고 이미 배포된 JS가 런타임에 자동 인식하는 구조는 아니다.

권장 흐름:
1. 새 course source 폴더 생성
2. content 작성
3. validation
4. Vite build
5. deploy

## 권장 실서비스 폴더

```text
src/data/training/courses/
  course-1/
    manifest.ts
    survey.ts
    storylines.ts
    roleplays.ts
    questions.ts
  course-2/
    ...
  course-3/
    ...
  course-4/
    ...
```

`manifest.ts`가 나머지를 bundle로 export하게 만들면 가장 관리하기 쉽다.

## 자동 발견

`reference/autoCourseRegistry.reference.ts`처럼 `import.meta.glob`을 사용한다.

그러면 Course 4를 만들 때:
- `TrainingCourseId` union 수정 불필요
- CourseSelector JSX 수정 불필요
- 중앙 registry 배열 수정 불필요

새 course 폴더가 다음 build에서 자동 포함된다.

## Course 작성 체크리스트

새 코스는 최소:
- manifest 1개
- survey preset 1개
- canonical storylines 약 4개
- 각 storyline의 foundation/intermediate/advanced
- roleplay 3개 이상, 각각 3 level
- 각 level practice questions 12개 이상

validator가 이 조건을 검사하게 한다.

## 중요한 규칙

Course 4를 추가한다고 새로운 UI 단계나 Story Set을 만들지 않는다.

항상:
`Level 선택 → Course 선택 → 기존 STEP 1~5`

새로운 다양성은 Course data에서 해결한다.
