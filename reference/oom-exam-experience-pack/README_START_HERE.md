# OOM Exam Experience Pack — START HERE

This pack is made specifically for the current OOM repository and a **Gemini 3.6 Flash** implementation pass.

It provides two things the coding agent would otherwise have to invent:

1. **Concrete visual direction**
2. **Reference React/Tailwind code**

## Use order

Give Gemini the whole ZIP and say:

> Read `PROMPT_GEMINI_36_FLASH.md` first and implement it against the current repository. Use the images in `assets/generated/` as the primary visual reference and the `.reference.*` files as implementation references, not blind patches.

## Best visual references

### Main exam screen
`assets/generated/exam-screen-wireframe.png`

This is the cleanest and most explicit target for STEP 6 while the learner is answering.

### Review screen
`assets/generated/review-screen-wireframe.png`

This is the target for the post-answer flow:
recording → STT → transcript → AI feedback → retry.

### EVA
`assets/generated/eva-interviewer-reference.png`

Use it as the first production asset or regenerate from `IMAGE_PROMPTS.md`.

### Design boards
`assets/visual-references/`

These are mood/reference boards. They are **not** intended to be reproduced pixel-for-pixel.

## Production repo recommendation

Copy only:

```text
assets/generated/eva-interviewer-reference.png
assets/generated/exam-guide-reference.png (optional)
```

to `public/assets/exam/`.

The SVG/PNG wireframes are mainly for the coding agent and reviewer; the actual app should be built with React/Tailwind, not with a screenshot as the interface.

## Product behavior

### During answer
Make it feel like a test console.

### After answer
Make it feel like an OOM review tool.

That separation is the core UX decision of this pack.
