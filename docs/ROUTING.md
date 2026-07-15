# View Routing

## Routing Model

OOM uses `BrowserRouter` and `Routes` for clean URL matching. `src/App.tsx` derives the active `ViewId` from `location.pathname` so the shell, sidebar, training header, and next-step controls stay synchronized.

GitHub Pages cannot rewrite unknown paths to the SPA shell. `scripts/generate-static-routes.mjs` therefore runs after Vite build and creates real `dist/**/index.html` files for sitemap routes. These files keep the Vite bundle and include route-specific SEO metadata plus meaningful static body content. Magazine article routes are generated from `src/data/magazine.ts` so the built HTML includes the full article structure instead of a short summary-only placeholder.

`ViewId` and the page-title map are defined in `src/components/layout/Sidebar.tsx`. When adding a view, update all of the following together:

1. `ViewId`
2. `viewTitles`
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
│  ├─ outdoor / travel
│  ├─ indoor / rest
│  ├─ sports / hobby
│  └─ home / residence
├─ STEP 4. role-play formula
│  ├─ formula and question structure
│  ├─ outdoor / travel
│  ├─ indoor / rest
│  ├─ sports / hobby
│  └─ home / residence
└─ STEP 5. practice
OOM magazine
Footer legal pages
├─ about
├─ privacy
├─ terms
├─ image-credits
└─ contact
AI feedback / settings
```

The candidate guide and training hub are independent top-level branches. STEP 1-5 must not be displayed as peers of the guide; they belong to the training hub. The candidate guide also includes the `exam-faq` Q&A child page.

## Header Rule

`AppShell` renders the sticky title/progress header only for the following route family:

- `training-hub`
- `survey`, `difficulty`
- `script-hub` and `script-*`
- `roleplay`, `roleplay-hub`, `roleplay-formula`, and `roleplay-*`
- `practice`

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
| `training-hub` | Training parent | `TrainingHub` | Yes, 0% | Explains STEP 1-5 |
| `survey` | Training / STEP 1 | `BackgroundSurveySheet` | Yes, 20% | Fixed recommendation and rehearsal |
| `difficulty` | Training / STEP 2 | `DifficultyGuide` | Yes, 40% | Default 5-5 guidance |
| `script-hub` | Training / STEP 3 | `ScriptHub` | Yes, 60% | Explains story-set selection |
| `script-outdoor` | Training / STEP 3 child | `ScriptDashboardV2` | Yes, 60% | Outdoor/travel group |
| `script-indoor` | Training / STEP 3 child | `ScriptDashboardV2` | Yes, 60% | Indoor/rest group |
| `script-sports` | Training / STEP 3 child | `ScriptDashboardV2` | Yes, 60% | Sports/hobby group |
| `script-home` | Training / STEP 3 child | `ScriptDashboardV2` | Yes, 60% | Home/residence group |
| `roleplay-hub` | Training / STEP 4 | `RoleplayHub` | Yes, 80% | Explains formula and scenario families |
| `roleplay-formula` | Training / STEP 4 child | `RoleplayFormulaView` | Yes, 80% | Formula and scenario cards only |
| `roleplay-travel` | Training / STEP 4 child | `RoleplayViewV2` | Yes, 80% | Travel service scenarios |
| `roleplay-indoor` | Training / STEP 4 child | `RoleplayViewV2` | Yes, 80% | Cafe/rest service scenarios |
| `roleplay-sports` | Training / STEP 4 child | `RoleplayViewV2` | Yes, 80% | Court and class scenarios |
| `roleplay-home` | Training / STEP 4 child | `RoleplayViewV2` | Yes, 80% | Moving, cleaning, repair scenarios |
| `practice` | Training / STEP 5 | `PracticeView` | Yes, 100% | Random prompt, timer, recording, feedback |
| `magazine-list` | Top-level magazine | `MagazineList` / `MagazineDetail` | No | `/magazine/` lists static articles; `/magazine/:id/` renders the selected article |
| `ai-settings` | Top-level utility | `AiSettingsView` | No | LLM runtime configuration |
| `about` | Footer legal page | `LegalPageView` | No | `/about/` introduces OOM as a study tool |
| `privacy` | Footer legal page | `LegalPageView` | No | `/privacy/` explains privacy, cookies, Google ads, and contact |
| `contact` | Footer legal page | `LegalPageView` | No | `/contact/` lists the inquiry email |
| `terms` | Footer legal page | `LegalPageView` | No | `/terms/` explains study-use terms and non-affiliation |
| `image-credits` | Footer trust page | `LegalPageView` | No | `/image-credits/` lists magazine cover image credits and license links |
| `roleplay` | Compatibility route only | `RoleplayFormulaView` | Yes, 80% | Do not add new navigation links to this alias |

## Next-Step Contract

`nextViewById` in `App.tsx` controls the training header's next-step button. Its active flow is:

```text
survey -> difficulty -> script-outdoor -> roleplay-hub
```

The group-specific script routes also point to `roleplay-hub`. The legacy `roleplay` alias points to `practice`, and `practice` points to `ai-settings`. Parent hubs and detailed scenario routes intentionally do not force a next step because users may choose a branch or repeat training there.

## Synchronization Rules

- `ScriptDashboardV2` reports a group change through `onScriptChange`, and `App.tsx` updates `activeView`. This keeps body content, page title, progress header, and sidebar active state synchronized.
- The sidebar expander state is local presentation state. Selecting a child route explicitly opens its parent family.
- A group page should remain reachable through both its sidebar item and its hub card.
- `roleplay-formula` must show only the formula and scenario-group cards. Detailed Eva questions and sample answers belong in the selected `roleplay-*` route.
