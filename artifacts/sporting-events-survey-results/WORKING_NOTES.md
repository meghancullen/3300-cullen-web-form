# Working Notes — University Sports Survey

> **INTERNAL DOCUMENT — NOT PUBLIC-FACING.**
> Do not commit this file to a public repository without review.
> Update this file at the end of every development session.

---

## How to Use This File (For AI Assistants)

1. Read this entire file before writing a single line of code or making any suggestion.
2. Read `README.md` in the same directory for the public-facing project description, tech stack table, and setup steps.
3. Do not change any folder structure, file naming convention, or import alias without discussing it with the developer first.
4. Follow every convention in the **Conventions** section exactly. Do not introduce new patterns unless the existing ones are provably insufficient.
5. Do not suggest anything listed in **What Was Tried and Rejected** — those decisions were made deliberately and are not up for reconsideration.
6. Ask before making any large structural change (moving files, swapping libraries, changing the database schema, adding a new route).
7. This project was scaffolded and developed with AI assistance in Replit. Refactor conservatively — the code works; do not rewrite working sections without a concrete reason.
8. When fixing a bug, make the smallest possible targeted change. Prefer surgical edits over wholesale rewrites.

---

## Current State

**Last Updated:** 2026-03-30

This is a complete, working full-stack survey web application. The survey form collects responses, persists them to Supabase, and the results page renders aggregated bar charts. The app is deployed-ready for Azure Static Web Apps. The Supabase credentials are configured in the Replit shared environment secrets. The database table has been created and is receiving live responses.

### What Is Working

- [x] Home page with "Take the Survey" and "View Results" CTAs
- [x] Five-question survey form with full client-side validation (Zod + React Hook Form)
- [x] Conditional "Other" sport input with Framer Motion animation
- [x] Survey submission persisting to Supabase (`survey_responses` table)
- [x] Thank-you page reading submission summary from `sessionStorage`
- [x] Results page with three Recharts bar charts (sports, states, attendance)
- [x] KPI cards: Total Responses, States Rep'd (true distinct count), Attending Event %
- [x] Global layout with shared header and footer on every page
- [x] Footer text: "Survey by Meghan Cullen, BAIS:3300 - spring 2026."
- [x] `staticwebapp.config.json` SPA fallback for Azure Static Web Apps
- [x] TypeScript strict mode — zero type errors
- [x] Wouter client-side routing with base path support

### What Is Partially Built

- [ ] Results page states chart — shows top 10 states only; no "show all" toggle exists yet
- [ ] No duplicate-submission prevention (no fingerprinting, no session guard)

### What Is Not Started

- [ ] Admin/export view for raw CSV download
- [ ] Dark mode toggle
- [ ] Rate limiting or abuse prevention on the insert RLS policy
- [ ] Time-series chart showing submission volume over time

---

## Current Task

The app is feature-complete for v1.0.0 and ready to deploy to Azure Static Web Apps. The last active work was fixing a Recharts label formatter crash (`Cannot read properties of undefined (reading 'payload')`) on the results page states chart, caused by Recharts calling the formatter with `undefined` during initial render. That bug is now patched.

**Single next step:** Deploy to Azure Static Web Apps — set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Application Settings in the Azure portal, point the build config at `artifacts/sporting-events-survey-results` with output directory `dist/public`.

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 19 | Stable, well-supported UI framework; catalog version in monorepo |
| TypeScript | 5.x | Required for type safety; strict mode enforced |
| Vite | 7.x | Fast dev server and build tool; native ESM; used by rest of monorepo |
| Tailwind CSS | 4.x | Utility-first; v4 uses CSS custom properties — consistent with design tokens |
| Wouter | 3.3 | Lightweight React Router alternative; avoids heavy React Router bundle |
| React Hook Form | 7.x | Minimal re-renders, easy Zod integration, good accessibility primitives |
| Zod | 3.x | Schema-first validation with TypeScript inference; shared with form resolver |
| TanStack Query | 5.x | Handles async server state, caching, and query invalidation after submission |
| Supabase JS | 2.x | Official client for Supabase; handles REST + auth in one package |
| Supabase PostgreSQL | — | Managed Postgres with built-in RLS; no custom backend needed |
| Recharts | 2.x | Composable React chart components; easiest Recharts integration for this scale |
| Framer Motion | 11.x | Smooth conditional field animation (Other sport input); catalog version |
| Lucide React | — | Consistent icon set; tree-shakable |
| canvas-confetti | 1.9 | Confetti burst on the thank-you page; lightweight, no dependencies |
| Azure Static Web Apps | — | Free tier, SPA routing support via `staticwebapp.config.json`, GitHub Actions CI/CD |

---

## Project Structure Notes

```
artifacts/sporting-events-survey-results/
├── public/
│   └── staticwebapp.config.json   # MUST stay here — Azure reads it from the build output root
├── src/
│   ├── components/
│   │   ├── layout.tsx             # SINGLE shared layout — all pages wrap in <Layout>
│   │   └── ui/                    # shadcn/Radix primitives — mostly unused scaffolding
│   ├── hooks/
│   │   └── use-survey.ts          # All Supabase data logic lives here (useSubmitSurvey, useSurveyResults)
│   ├── lib/
│   │   └── supabase.ts            # Supabase client singleton — import from here only
│   ├── pages/
│   │   ├── home.tsx               # Landing page; contains collapsible DB setup SQL for dev use
│   │   ├── survey.tsx             # Form — Zod schema, 5 questions, conditional Other field
│   │   ├── thank-you.tsx          # Reads sessionStorage key "survey_submission" for summary
│   │   ├── results.tsx            # All aggregation logic in useMemo; no raw row exposure
│   │   └── not-found.tsx          # 404 fallback
│   ├── App.tsx                    # Providers + Wouter router; base path from import.meta.env.BASE_URL
│   ├── main.tsx                   # ReactDOM.createRoot entry
│   └── index.css                  # Tailwind v4 @import + CSS custom properties (--primary: #DA3BDB etc.)
├── vite.config.ts                 # Port from $PORT env var; base from $BASE_PATH; build → dist/public
├── tsconfig.json
├── package.json
├── README.md                      # Public-facing documentation
└── WORKING_NOTES.md               # This file
```

### Non-obvious decisions

- **`dist/public` as build output** — the monorepo API server artifact uses `dist/` at root level; using `dist/public` avoids collisions and matches the Azure artifact location setting.
- **`sessionStorage` on thank-you page** — the thank-you page reads the submitted form data from `sessionStorage` rather than re-querying Supabase to avoid an extra network call and because the data is ephemeral by design (one session, one thank-you view).
- **All aggregation in `useMemo` on the client** — there is no server-side aggregation endpoint. The results page fetches all rows with `.select("*")` and aggregates in the browser. This is acceptable at survey scale but would need revisiting at thousands of responses.
- **`CHART_COLOR = "hsl(299, 68%, 55%)"` hardcoded** — Recharts does not resolve CSS custom properties at paint time. The primary color `#DA3BDB` is equivalent to `hsl(299, 68%, 55%)` and is hardcoded in `results.tsx` for this reason.

### Files/folders that must not be changed without discussion

- `public/staticwebapp.config.json` — changing the `rewrite` target or `exclude` glob breaks Azure SPA routing
- `src/lib/supabase.ts` — this is the only Supabase client instantiation; do not create a second one
- `src/hooks/use-survey.ts` — the `SurveyResponse` interface must stay in sync with the Supabase table schema
- `vite.config.ts` — `base: basePath` and `outDir: dist/public` are load-bearing for both Replit preview and Azure deployment

---

## Data / Database

**Provider:** Supabase (PostgreSQL)
**Project URL:** `https://lqqaqsfdhtokibwrjidu.supabase.co`
**Table:** `survey_responses`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `bigint` | auto | Generated always as identity; primary key |
| `created_at` | `timestamptz` | auto | Defaults to `now()` |
| `age` | `text` | yes | Free text; validated on client as integer 13–120 |
| `state` | `text` | yes | One of the 50 US states; enforced by client dropdown |
| `favorite_sports` | `text[]` | yes | Array of sport names from the fixed SPORTS_OPTIONS list |
| `other_sport` | `text` | no | `null` unless "Other" was selected; normalized to `null` if blank |
| `teams` | `text` | yes | Free text; comma-separated team names |
| `attending_event` | `text` | yes | One of `"Yes"`, `"No"`, `"Unsure"` |

**RLS Policies:**
- `anon` role: `INSERT` allowed — no conditions
- `anon` role: `SELECT` allowed — no conditions (aggregate-only display is enforced in application code, not at DB level)

---

## Conventions

### Naming Conventions

- **Files:** `kebab-case.tsx` for pages and components (e.g., `thank-you.tsx`, `use-survey.ts`)
- **Components:** PascalCase named exports (e.g., `export default function Survey()`)
- **Hooks:** `use` prefix, camelCase (e.g., `useSubmitSurvey`, `useSurveyResults`)
- **Types/Interfaces:** PascalCase (e.g., `SurveyResponse`, `SurveyFormData`)
- **CSS classes:** Tailwind utilities only — no custom class names except what exists in `index.css`

### Code Style

- TypeScript strict mode — no `any` types; use explicit interfaces or `unknown` where needed
- All async data fetching goes through TanStack Query hooks in `src/hooks/`
- No inline `fetch()` or `supabase` calls in page components — always use the hook layer
- Prefer `const` over `let`; avoid `var`
- Form validation logic lives in the Zod schema, not in `onSubmit` handlers

### Framework Patterns

- Every page component is wrapped in `<Layout>` — never render a page without the shared header/footer
- Routing: add new routes in `App.tsx` `<Switch>` block only; use `<Link href="...">` for navigation
- Form state: React Hook Form + Zod resolver; use `register`, `control`, `watch`, `formState.errors`
- Server state: TanStack Query for all async reads/writes; invalidate `["survey_responses"]` after mutations

### Git Commit Style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add CSV export button to results page
fix: handle undefined entry in recharts label formatter
chore: update README with Azure deployment steps
refactor: extract aggregation logic into separate utility
```

---

## Decisions and Tradeoffs

- **No backend API server for this app.** The survey app communicates directly with Supabase from the browser using the anon key. The API server artifact in the monorepo exists for other purposes. Do not suggest adding an Express proxy layer — the Supabase anon + RLS model is sufficient and simpler to deploy as a static site.
- **Wouter instead of React Router.** Wouter is ~2KB vs React Router's ~50KB. For a four-page app with no nested layouts or loaders, Wouter is the correct choice. Do not suggest migrating to React Router.
- **Client-side aggregation.** All chart data is computed from a full `.select("*")` fetch in `useMemo`. A dedicated aggregation RPC or view was considered but adds schema complexity. Acceptable for survey-scale data. Do not suggest adding a Supabase RPC unless response count exceeds ~10,000.
- **`other_sport` normalized to `null` before insert.** If the user selects "Other" but the `other_sport` field is blank (which the Zod schema prevents, but defensively), the value is coerced to `null` in the submit handler. This keeps the DB clean. Do not change this normalization.
- **Top 10 states, top 15 sports displayed.** Chart legibility drops off sharply beyond these limits. The KPI card for "States Rep'd" correctly shows the true distinct count across all rows; the chart truncation is cosmetic.

---

## What Was Tried and Rejected

- **React Router DOM** — rejected in favour of Wouter for bundle size reasons. Do not suggest reverting.
- **Server-side aggregation via Supabase RPC** — rejected due to added schema complexity for a low-volume survey. Do not suggest adding a stored procedure or edge function for aggregation.
- **CSS variables passed directly to Recharts `fill` prop** — rejected because Recharts does not resolve CSS custom properties at SVG paint time. The primary color is hardcoded as `hsl(299, 68%, 55%)` in `results.tsx`. Do not suggest switching back to `var(--primary)`.
- **Throwing in `vite.config.ts` when `PORT` or `BASE_PATH` is absent** — earlier version threw `new Error(...)` if env vars were missing. Rejected because it broke cold-start in environments without those vars set. Now uses safe defaults (`?? "5173"` and `?? "/"`).
- **Reading thank-you page data from a second Supabase query** — rejected in favour of `sessionStorage` to avoid a redundant network round-trip for ephemeral data the user just submitted.

---

## Known Issues and Workarounds

**Issue 1: Recharts label formatter called with `undefined` on initial render**
- The `formatter` prop on Recharts `<Bar label={...}>` is called during the initial layout pass before data is bound, passing `undefined` as the `entry` argument.
- **Workaround:** The formatter uses optional chaining: `entry?.payload?.percentage ?? ""`. This was patched in `results.tsx` line 225.
- **Do not remove** the `?` on `entry` — the crash will return.

**Issue 2: No duplicate-submission guard**
- A user can submit the survey multiple times in the same browser session. There is no fingerprinting, cookie, or database constraint preventing this.
- **Workaround:** None currently implemented. Accepted as a known limitation for v1.0.0.
- Do not add a `UNIQUE` constraint to the DB without discussing the UX impact of locked-out users.

**Issue 3: `select("*")` fetches all columns including free-text `teams` field**
- The results page fetches all columns but only uses `favorite_sports`, `other_sport`, `state`, and `attending_event` for the charts.
- **Workaround:** Not a correctness issue. At scale, switch the query to `select("favorite_sports, other_sport, state, attending_event")` to reduce payload size.

---

## Browser / Environment Compatibility

### Front-end

| Browser | Status |
|---|---|
| Chrome 120+ | Tested, fully working |
| Firefox 120+ | Expected working (not yet manually tested) |
| Safari 17+ | Expected working (not yet manually tested) |
| Edge 120+ | Expected working (Chromium-based) |
| IE 11 | Not supported — Vite output targets ES modules |

- The app uses CSS custom properties and `hsl()` color functions — IE 11 is not supported and is not a target.
- Responsive breakpoints tested at 375px (mobile), 768px (tablet), 1280px (desktop).

### Back-end / Build Environment

- **OS:** Linux (NixOS on Replit)
- **Node.js:** 20.x
- **Package manager:** pnpm 9.x (monorepo managed via `pnpm-workspace.yaml`)
- **Environment variables required at build time:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Optional env vars:** `PORT` (dev server port, defaults `5173`), `BASE_PATH` (URL base, defaults `/`)

---

## Open Questions

- Should the survey be one-response-per-person? If yes, what mechanism — cookie, localStorage flag, Supabase unique constraint on a hashed fingerprint?
- Should the results page require any authentication, or remain fully public? Currently it is fully public with no auth.
- Is a CSV export of raw responses needed before the end of the semester? If so, should it be behind a simple passcode or fully open?
- Should "Other" sport write-ins be normalized and merged into a standard category on the chart, or displayed as raw user input?

---

## Session Log

### 2026-03-30

**Accomplished:**
- Built the complete app: Home, Survey, Thank-You, and Results pages
- Wired Supabase client with env vars; created `survey_responses` table schema and RLS policies
- Implemented all five survey questions with Zod validation, conditional "Other" input, and Framer Motion animation
- Built Recharts results dashboard with three bar charts and three KPI cards
- Fixed TypeScript strict-mode errors (removed all `any` types; typed Recharts tooltips correctly)
- Fixed runtime crash in Recharts bar label formatter (`entry?.payload?.percentage`)
- Corrected "States Rep'd" KPI to use `totalDistinctStates` (true count) instead of the sliced top-10 array length
- Removed `@replit` scaffold comments from `button.tsx`; fixed `displayname` → `displayName` typo in `menubar.tsx`
- Wrote `README.md` and `WORKING_NOTES.md`

**Left Incomplete:**
- Duplicate-submission prevention not implemented
- States chart "show all" toggle not built
- Admin CSV export not built

**Decisions Made:**
- Recharts chart color hardcoded as `hsl(299, 68%, 55%)` (equivalent to `#DA3BDB`) because CSS vars do not resolve in SVG
- Client-side aggregation via `useMemo` over full `.select("*")` fetch — no server-side RPC needed at current scale

**Next Step:** Deploy to Azure Static Web Apps; set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Application Settings in the Azure portal.

---

## Useful References

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction) — insert, select, RLS
- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Recharts API Reference](https://recharts.org/en-US/api) — Bar, BarChart, Cell, Tooltip, Label
- [React Hook Form + Zod Integration](https://react-hook-form.com/get-started#SchemaValidation)
- [Zod Documentation](https://zod.dev/) — `superRefine`, `z.enum`, `z.array`
- [Wouter Routing](https://github.com/molefrog/wouter) — `<Switch>`, `<Route>`, `<Link>`, `useLocation`
- [TanStack Query v5 Docs](https://tanstack.com/query/v5/docs/framework/react/overview)
- [Azure Static Web Apps SPA Routing](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#fallback-routes)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode) — `VITE_` prefix for browser-exposed vars
- [Framer Motion Animation](https://www.framer.com/motion/animation/) — `initial`, `animate`, `exit`, `AnimatePresence`
- **AI Tools Used:** Claude (Anthropic) via Replit Agent — used for full initial scaffolding, all page generation, bug diagnosis, type error fixes, and documentation. All generated code was reviewed for correctness before accepting.
