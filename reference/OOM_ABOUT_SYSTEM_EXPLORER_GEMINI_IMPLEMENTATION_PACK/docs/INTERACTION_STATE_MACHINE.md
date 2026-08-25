# Interaction State Machine

## State

```ts
type AboutFocusMode = "course" | "level" | "all";

type AboutExplorerState = {
  selectedCourseId: TrainingCourseId;
  selectedLevelId: TrainingLevelId;
  focusMode: AboutFocusMode;
};
```

실제 project type 이름을 확인하여 맞춥니다.

문서의 type 이름을 억지로 새로 만들지 않습니다.

---

# Initial State

권장:

```ts
{
  selectedCourseId: courseIds[0],
  selectedLevelId: "intermediate",
  focusMode: "course"
}
```

단 실제 level ID가 다르면 현재 source-of-truth 사용.

---

# Course card click

Course panel 배경/title 클릭:
- `focusMode = "course"`

Course option 클릭:
- `selectedCourseId = id`
- `focusMode = "course"`

UI response:
- Course panel selected/focused
- Survey module highlight
- Story module highlight
- STEP4 module highlight
- Training Context pulse
- selected Course name update
- current flow summary update

---

# Level card click

Level panel 클릭:
- `focusMode = "level"`

Level option click:
- `selectedLevelId = id`
- `focusMode = "level"`

UI response:
- Level panel selected/focused
- Difficulty highlight
- Answer Density highlight
- STEP4/STEP6 highlight as appropriate
- AI Coach highlight
- target time update
- Training Context update
- current flow summary update

---

# Full system

Button:
`전체 시스템 보기`

Action:
`focusMode = "all"`

Response:
- Course panel + Level panel active
- all relevant modules clear/active
- 1~6 rail all active
- AI KEEP/FIX/RETRY active
- `FULL SYSTEM` badge

No change to selected Course / Level.

---

# Hover

Fine pointer only.

Example:
Course option hover:
- may temporarily preview related modules
- must not change selectedCourseId

Mouse leave:
- restore persistent selection/focusMode state

If implementing preview state adds complexity:
**skip hover preview.**
Keep only hover styling.

Persistent click behavior is more important than fancy hover.

---

# Animations

Duration:
150~260ms

Allowed:
- border clarity
- background tint
- 2px translate
- short box-shadow pulse
- connector brightness
- crossfade text

Avoid:
- scale > 1.02
- large bounce
- layout-moving animation
- height accordion
- auto scrolling page

Selection change should feel immediate.

---

# Reduced motion

If `prefers-reduced-motion`:
- no flash keyframe
- no translate
- color/border state may change instantly
- all content remains visible
