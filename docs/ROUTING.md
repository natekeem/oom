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
Brand landing (`/`, no AppShell)
OOM learning philosophy (`/about/`)
OPIc candidate guide
├─ overview and grades
├─ exam screen & controls
├─ membership, application, and fees
├─ identification, admission, and exam flow
├─ results, certificate, and coupon
└─ FAQ
OPIc training hub
├─ STEP 1. target level & course setup
├─ STEP 2. recommended survey
├─ STEP 3. difficulty
├─ STEP 4. reusable scripts
│  ├─ group 1 storyline
│  ├─ group 2 storyline
│  ├─ group 3 storyline
│  └─ group 4 storyline
├─ STEP 5. role-play formula
│  ├─ group 1 scenario
│  ├─ group 2 scenario
│  └─ group 3 scenario
└─ STEP 6. practice
   ├─ quick practice
   └─ full mock
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

The candidate guide and training hub are independent top-level branches. STEP 1-6 belong to the training hub. The candidate guide also includes the `exam-screen` exam console guide and `exam-faq` Q&A child page. Sidebar labels for STEP 4 and STEP 5 are rendered dynamically from the active Course's storylines and actual roleplays. Current manifests declare three roleplay IDs; roleplay count does not have to equal the four-storyline count.

## Header Rule

`AppShell` renders the sticky title/progress header only for the following route family:

- `training-hub` (shows 6 STEP overview title and roadmap status)
- `training-setup` (STEP 1, 0%)
- `survey` (STEP 2, 20%), `difficulty` (STEP 3, 40%)
- `script-hub`, `script-self-introduction`, and `script-*` (STEP 4, 60%)
- `roleplay-hub`, `roleplay-formula`, and `roleplay-*` (STEP 5, 80%)
- `practice`, `practice-quick`, and `practice-mock` (STEP 6, 100%)

The header dynamically shows the current course group title and progress percentage (0% -> 20% -> 40% -> 60% -> 80% -> 100%).
Home, all `exam-*` views, `magazine-list` (including article detail URLs), footer legal pages, and `ai-settings` do not render the sticky training header. Their mobile experience uses compact floating controls instead.

## Route Table

Public route targets use the canonical `https://opic-on-me.com/path/` form. Internal navigation must preserve the trailing slash; the root route remains `https://opic-on-me.com/`.
| ViewId | Sidebar location | Screen owner | Header | Notes |
| --- | --- | --- | --- | --- |
| `home` | Brand landing, outside sidebar shell | `LandingPage` | No | Independent full-bleed product landing; no AppShell/sidebar/footer |
| `exam-guide` | Candidate guide parent | `ExamGuideHub` | No | Explains the guide sections |
| `exam-overview` | Candidate guide child | `ExamGuideOverview` | No | OPIc format and grade framework |
| `exam-screen` | Candidate guide child | `ExamGuideScreen` | No | Annotated exam screen shell, 5-step flow, timer disclaimer |
| `exam-apply` | Candidate guide child | `ExamGuideDashboard` | No | Membership, application, fees |
| `exam-day` | Candidate guide child | `ExamGuideDay` | No | ID, admission cutoff, OT/test visual flow |
| `exam-results` | Candidate guide child | `ExamGuideDashboard` | No | Results, certificate, coupons |
| `exam-faq` | Candidate guide child | `ExamGuideFaq` | No | Frequently asked OPIc questions |
| `training-hub` | Training Overview Hub | `TrainingHub` | Yes, Overview | 6 STEP overview, concept cards, roadmap |
| `training-setup` | Training / STEP 1 | `TrainingSetupView` | Yes, 0% | Target level & course setup |
| `survey` | Training / STEP 2 | `BackgroundSurveySheet` | Yes, 20% | Course-specific recommendation and rehearsal |
| `difficulty` | Training / STEP 3 | `DifficultyGuide` | Yes, 40% | Level difficulty presets (5-5, 4-4, 3-3) |
| `script-hub` | Training / STEP 4 | `ScriptHub` | Yes, 60% | Explains canonical storyline structure |
| `script-self-introduction` | Training / STEP 4 child | `SelfIntroductionView` | Yes, 60% | Course-neutral, Level-aware speaking warm-up |
| `script-outdoor` | Training / STEP 4 child | `ScriptDashboardV2` | Yes, 60% | Generic slot 0 storyline (e.g. outdoor/travel) |
| `script-indoor` | Training / STEP 4 child | `ScriptDashboardV2` | Yes, 60% | Generic slot 1 storyline (e.g. indoor/rest) |
| `script-sports` | Training / STEP 4 child | `ScriptDashboardV2` | Yes, 60% | Generic slot 2 storyline (e.g. sports/hobby) |
| `script-home` | Training / STEP 4 child | `ScriptDashboardV2` | Yes, 60% | Generic slot 3 storyline (e.g. home/residence) |
| `roleplay-hub` | Training / STEP 5 | `RoleplayHub` | Yes, 80% | Integrated formula, question flow, phrases, scenarios |
| `roleplay-formula` | Training / STEP 5 alias | `RoleplayHub` | Yes, 80% | Backward-compatible formula route |
| `roleplay-travel` | Training / STEP 5 child | `RoleplayViewV2` | Yes, 80% | Generic slot 0 scenario (e.g. travel/outdoor) |
| `roleplay-indoor` | Training / STEP 5 child | `RoleplayViewV2` | Yes, 80% | Generic slot 1 scenario (e.g. cafe/indoor) |
| `roleplay-sports` | Training / STEP 5 child | `RoleplayViewV2` | Yes, 80% | Generic slot 2 scenario (e.g. sports/fitness) |
| `roleplay-home` | Compatibility route, hidden from current sidebar | `RoleplayViewV2` | Yes, 80% | Legacy slot 3 URL; current three-scenario manifests fall back safely to slot 0 |
| `practice` | Training / STEP 6 parent | `PracticeHubView` | Yes, 100% | `/practice/` route-only Hub; no exam runtime mounted |
| `practice-quick` | Training / STEP 6 child | `PracticeView` | Yes, 100% | `/practice/quick/`; Quick warm-up, one-question review/retry |
| `practice-mock` | Training / STEP 6 child | `FullMockPracticeView` | Yes, 100% | `/practice/mock/`; Survey-first Full Mock with in-memory session state |
| `magazine-list` | Top-level magazine | `MagazineList` / `MagazineDetail` | No | `/magazine/` lists static articles; `/magazine/:id/` renders the selected article |
| `ai-settings` | Top-level utility | `AiSettingsView` | No | LLM runtime configuration |
| `about` | App sidebar and footer information page | `HomeView` | No | `/about/` keeps the shared AppShell width and presents a compact editorial metrics rail, four-step OOM Method, AI Coach closing, and training/guide CTAs in one desktop-view composition |
| `privacy` | Footer legal page | `LegalPageView` | No | `/privacy/` explains privacy, cookies, Google ads, and contact |
| `contact` | Footer legal page | `LegalPageView` | No | `/contact/` lists the inquiry email |
| `terms` | Footer legal page | `LegalPageView` | No | `/terms/` explains study-use terms and non-affiliation |
| `editorial-policy` | Footer trust page | `LegalPageView` | No | `/editorial-policy/` identifies operator/author responsibility and explains sourcing, review, corrections, and AI-assistance rules |
| `image-credits` | Footer trust page | `LegalPageView` | No | `/image-credits/` lists magazine cover image credits and license links |

## Next-Step Contract

`nextViewById` in `App.tsx` controls the training header's next-step button. Its active flow is:

```text
survey -> difficulty -> script-hub
```

The self-introduction route points to the first generic storyline slot so its Next action does not skip STEP 4. Group-specific script routes point to `roleplay-hub`. `roleplay-hub`, its compatibility formula route, and scenario routes point to the STEP 6 Hub at `practice`. STEP 6 is the end of the six-step flow and intentionally has no next-step action. Its Quick and Mock child URLs are sidebar leaves, share the selection guard and 100% progress, and are emitted as separate static canonical routes. `training-hub` and `script-hub` intentionally have no forced next step because the user must choose or configure a branch there.

## Synchronization Rules

- `ScriptDashboardV2` uses four generic storyline slots. `RoleplayViewV2` retains slot routes 0..3 for URL compatibility, while the current registry and sidebar expose only the three IDs declared by each manifest.
- The sidebar expander dynamically displays group titles for the currently selected Course context.
- A group page remains reachable through both its sidebar item and its hub card.
- `roleplay-formula` shows only the formula and scenario-group cards. Detailed questions and sample answers belong in the selected `roleplay-*` route.
