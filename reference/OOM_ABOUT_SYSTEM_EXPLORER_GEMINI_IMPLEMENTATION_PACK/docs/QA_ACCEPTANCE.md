# QA / Acceptance

## Desktop layout

### 1440×900
- [ ] Header visible
- [ ] Metrics visible
- [ ] Course selector visible
- [ ] Level selector visible
- [ ] Training Context visible
- [ ] System map visible
- [ ] AI Coach visible
- [ ] Summary + CTA visible
- [ ] No page vertical scrollbar, if reasonably possible with current AppShell/footer
- [ ] Course list itself may scroll only if count > 3

### 1920×1080
- [ ] Content width same as other AppShell pages
- [ ] No large dead zone under explorer
- [ ] No stretching components to absurd heights

---

## Course

- [ ] Derived from registry
- [ ] Current number shown dynamically
- [ ] Selection updates Training Context
- [ ] Course focus highlights Survey / Story / STEP4
- [ ] No TrainingSelection write
- [ ] No localStorage write
- [ ] 4+ options internal scroll
- [ ] selected option remains visible

---

## Level

- [ ] Derived from canonical level data
- [ ] Selection updates level label
- [ ] Selection updates target time
- [ ] Level focus highlights Difficulty / Density / Practice / AI
- [ ] No duplicated level truth

---

## Full system

- [ ] Does not reset selected Course/Level
- [ ] Shows all system paths
- [ ] All 6 steps visually active

---

## Content

- [ ] No duplicated Principles block
- [ ] No fake metrics
- [ ] AI disclaimer
- [ ] No score guarantee
- [ ] Course × Level concept clear
- [ ] STEP4 and STEP6 clear

---

## Accessibility

- [ ] Selectors usable by keyboard
- [ ] Selected state announced
- [ ] Focus visible
- [ ] Hover not required
- [ ] Reduced motion supported
- [ ] No fake buttons on non-actions
- [ ] Internal Course scroll keyboard/wheel usable

---

## Mobile

390×844 / 430×932:
- [ ] App drawer behavior unchanged
- [ ] About stacks normally
- [ ] No horizontal overflow
- [ ] Course list not trapped
- [ ] Right map readable
- [ ] CTA reachable

---

## Regression

- [ ] `/training/` unchanged
- [ ] STEP1–6 unchanged
- [ ] `/practice/` unchanged
- [ ] sidebar unchanged
- [ ] landing `/` unchanged
- [ ] magazine unchanged

---

## Commands

Run repo-supported equivalents:

```bash
npm run lint
npm run test
npm run build
npm run verify:pages
npm run docs:generate
npm run docs:check
git diff --check
```

If a command does not exist:
do not invent it.
Report exact package.json scripts instead.
