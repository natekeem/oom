# Future Course Scaling

사용자는 향후 OOM이 자리 잡으면 Course를 하나씩 추가할 계획입니다.

이 요구사항을 현재 구현에서 반드시 고려합니다.

---

# 1. Hardcode 금지

금지:

```tsx
<CourseOption id="course1" />
<CourseOption id="course2" />
<CourseOption id="course3" />
```

또는:

```ts
const courseCount = 3;
```

대신 실제 registry / exported course metadata에서 map.

---

# 2. Course list overflow policy

## 1~3 Courses

모두 자연스럽게 보여줍니다.

No internal scroll.

## 4+ Courses

Course options area에만:

```css
max-height: <available-height>;
overflow-y: auto;
overscroll-behavior: contain;
scrollbar-gutter: stable;
```

적용.

Course panel 전체가 늘어나 page scroll을 만들지 않습니다.

---

# 3. Visible capacity

Desktop one-screen 목표상:

- 3 options: 전부 표시
- 4+ options: 약 3개 또는 3.25개 높이를 보여주는 viewport

3.25개처럼 다음 option이 살짝 보이면
"더 있음"을 자연스럽게 암시할 수 있습니다.

단 actual production CSS는 current font/card height를 측정 후 결정.

---

# 4. Selected item visibility

선택 변경 시:

```ts
selectedElement.scrollIntoView({
  block: "nearest",
  behavior: reducedMotion ? "auto" : "smooth",
});
```

Course chooser 내부 scroll만 이동해야 합니다.

페이지가 움직이면 안 됩니다.

---

# 5. Scrollbar

Desktop:
얇고 low-contrast.

Touch:
native scroll.

Scrollbar를 완전히 숨겨 discoverability를 떨어뜨리지 않습니다.

---

# 6. Metrics

`N COURSES`

N은 dynamic.

3이라는 문구를 test에 hardcode하지 않습니다.

Test는 현재 registry count와 UI count가 같은지 확인.

---

# 7. Course-specific content

About에서 Course 선택에 따라 바꿔도 되는 것:

- Course display name
- actual metadata helper if already in registry
- Training Context course name

가급적 바꾸지 않을 것:
- large story/sample details
- survey count
- full storyline list

이 페이지의 목적은 시스템 설명이지 Course browser가 아닙니다.

---

# 8. Representative Course fallback

대표 3개만 노출하는 방식은 현재 사용하지 않습니다.

이유:
- 실제 제공 Course가 누락되어 보일 수 있음
- 사용자에게 Course 수와 chooser 내용이 불일치
- 향후 관리 지점 증가

내부 scroll이 더 단순하고 정직합니다.

---

# 9. Large future count

Course가 10개 이상으로 늘어나면
About chooser UX를 다시 검토할 수 있습니다.

현재 target:
1~9개 정도까지 무리 없이 동작.

10+가 되면:
- search
- category
- carousel
등을 별도 UX project로 검토.

지금 미리 구현하지 않습니다.
