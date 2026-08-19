# View Routing

## Routing Model

OOM uses `BrowserRouter` and `Routes` for clean URL matching. `src/App.tsx` derives the active `ViewId` from `location.pathname` so the shell, sidebar, training header, and next-step controls stay synchronized.

GitHub Pages cannot rewrite unknown paths to the SPA shell. `scripts/generate-static-routes.mjs` therefore runs after Vite build and creates real `dist/**/index.html` files for sitemap routes. These files keep the Vite bundle and include route-specific SEO metadata plus meaningful static body content. Magazine article routes are generated from `src/data/magazine.ts` so the built HTML includes the full article structure instead of a short summary-only placeholder.

`ViewId` and the page-title map are defined in `src/components/layout/Sidebar.tsx`. Dynamic titles based on active Course context are resolved with `getViewTitle`. When adding a view, update all of the following together:

1. `ViewId`
2. `viewTitles` and `getViewTitle`
3. the `screen` selection in `App.tsx`
4. the sidebar hierarchy in `ExpandableSidebar.tsx`
5. this document
6. route smoke tests when user-visible navigation changes

## Sidebar Hierarchy

```text
Home / strategy overview
OPIc candidate guide
├─ overview and grades
├─ membership, application, and fees
├─ identification, admission, and exam flow
└─ results, certificate, and coupon
OPIc training hub
├─ STEP 1. fixed survey
├─ STEP 2. difficulty
├─ STEP 3. reusable scripts
│  ├─ group 1 storyline
│  ├─ group 2 storyline
│  ├─ group 3 storyline
│  └─ group 4 storyline
├─ STEP 4. role-play formula
│  ├─ formula and question structure
│  ├─ group 1 scenario
│  ├─ group 2 scenario
│  ├─ group 3 scenario
│  └─ group 4 scenario
└─ STEP 5. practice
OOM magazine
Footer legal pages
├─ about
├─ privacy
├─ terms
├─ editorial-policy
├─ image-credits
└─ contact
AI feedback / settings
```

The candidate guide and training hub are independent top-level branches. STEP 1-5 belong to the training hub. The candidate guide also includes the `exam-faq` Q&A child page. Sidebar labels for STEP 3 and STEP 4 are rendered dynamically from the active Course's storylines and roleplays.

## Header Rule

`AppShell` renders the sticky title/progress header only for the following route family:

- `training-hub`
- `survey`, `difficulty`
- `script-hub` and `script-*`
- `roleplay`, `roleplay-hub`, `roleplay-formula`, and `roleplay-*`
- `practice`

The header dynamically shows the current course group title and progress percentage.
Home, all `exam-*` views, `magazine-list` (including article detail URLs), footer legal pages, and `ai-settings` do not render the sticky training header. Their mobile experience uses compact floating controls instead.

## Route Table

Public route targets use the canonical `https://opic-on-me.com/path/` form. Internal navigation must preserve the trailing slash; the root route remains `https://opic-on-me.com/`.
| ViewId | Sidebar location | Screen owner | Header | Notes |
| --- | --- | --- | --- | --- |
| `home` | Home | `HomeView` | No | Strategy overview |
| `exam-guide` | Candidate guide parent | `ExamGuideHub` | No | Explains the guide sections |
| `exam-overview` | Candidate guide child | `ExamGuideOverview` | No | OPIc format and grade framework |
| `exam-apply` | Candidate guide child | `ExamGuideDashboard` | No | Membership, application, fees |
| `exam-day` | Candidate guide child | `ExamGuideDay` | No | ID, admission cutoff, OT/test visual flow |
| `exam-results` | Candidate guide child | `ExamGuideDashboard` | No | Results, certificate, coupons |
| `exam-faq` | Candidate guide child | `ExamGuideFaq` | No | Frequently asked OPIc questions |
| `training-hub` | Training parent | `TrainingHub` | Yes, 0% | Gates on training selection (shows setup or STEP 1-5) |
| `survey` | Training / STEP 1 | `BackgroundSurveySheet` | Yes, 20% | Course-specific recommendation and rehearsal |
| `difficulty` | Training / STEP 2 | `DifficultyGuide` | Yes, 40% | Level difficulty presets (5-5, 4-4, 3-3) |
| `script-hub` | Training / STEP 3 | `ScriptHub` | Yes, 60% | Explains canonical storyline structure |
| `script-outdoor` | Training / STEP 3 child | `ScriptDashboardV2` | Yes, 60% | Generic slot 0 storyline (e.g. outdoor/travel) |
| `script-indoor` | Training / STEP 3 child | `ScriptDashboardV2` | Yes, 60% | Generic slot 1 storyline (e.g. indoor/rest) |
| `script-sports` | Training / STEP 3 child | `ScriptDashboardV2` | Yes, 60% | Generic slot 2 storyline (e.g. sports/hobby) |
| `script-home` | Training / STEP 3 child | `ScriptDashboardV2` | Yes, 60% | Generic slot 3 storyline (e.g. home/residence) |
| `roleplay-hub` | Training / STEP 4 | `RoleplayHub` | Yes, 80% | Explains formula and scenario families |
| `roleplay-formula` | Training / STEP 4 child | `RoleplayFormulaView` | Yes, 80% | Formula and scenario cards only |
| `roleplay-travel` | Training / STEP 4 child | `RoleplayViewV2` | Yes, 80% | Generic slot 0 scenario (e.g. travel/outdoor) |
| `roleplay-indoor` | Training / STEP 4 child | `RoleplayViewV2` | Yes, 80% | Generic slot 1 scenario (e.g. cafe/indoor) |
| `roleplay-sports` | Training / STEP 4 child | `RoleplayViewV2` | Yes, 80% | Generic slot 2 scenario (e.g. sports/fitness) |
| `roleplay-home` | Training / STEP 4 child | `RoleplayViewV2` | Yes, 80% | Generic slot 3 scenario (e.g. home/neighborhood) |
| `practice` | Training / STEP 5 | `PracticeView` | Yes, 100% | Random prompt by Course × Level, timer, recording, feedback |
| `magazine-list` | Top-level magazine | `MagazineList` / `MagazineDetail` | No | `/magazine/` lists static articles; `/magazine/:id/` renders the selected article |
| `ai-settings` | Top-level utility | `AiSettingsView` | No | LLM runtime configuration |
| `about` | Footer legal page | `LegalPageView` | No | `/about/` introduces OOM as a study tool |
| `privacy` | Footer legal page | `LegalPageView` | No | `/privacy/` explains privacy, cookies, Google ads, and contact |
| `contact` | Footer legal page | `LegalPageView` | No | `/contact/` lists the inquiry email |
| `terms` | Footer legal page | `LegalPageView` | No | `/terms/` explains study-use terms and non-affiliation |
| `editorial-policy` | Footer trust page | `LegalPageView` | No | `/editorial-policy/` identifies operator/author responsibility and explains sourcing, review, corrections, and AI-assistance rules |
| `image-credits` | Footer trust page | `LegalPageView` | No | `/image-credits/` lists magazine cover image credits and license links |
| `roleplay` | Compatibility route only | `RoleplayFormulaView` | Yes, 80% | Do not add new navigation links to this alias |

## Next-Step Contract

`nextViewById` in `App.tsx` controls the training header's next-step button. Its active flow is:

```text
survey -> difficulty -> script-outdoor -> roleplay-hub
```

The group-specific script routes also point to `roleplay-hub`. The legacy `roleplay` alias points to `practice`, and `practice` points to `ai-settings`. Parent hubs and detailed scenario routes intentionally do not force a next step because users may choose a branch or repeat training there.

## Synchronization Rules

- `ScriptDashboardV2` and `RoleplayViewV2` use generic `slotIndex` props (0..3) to resolve against active Course storylines and roleplays.
- The sidebar expander dynamically displays group titles for the currently selected Course context.
- A group page remains reachable through both its sidebar item and its hub card.
- `roleplay-formula` shows only the formula and scenario-group cards. Detailed questions and sample answers belong in the selected `roleplay-*` route.
