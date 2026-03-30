# University Sports Survey

## Description

University Sports Survey is a full-stack web application that collects and visualizes sports preference data from university-affiliated respondents. The app presents a concise five-question survey covering age, home state, favorite sports, team affiliations, and event attendance plans, then persists each submission to a Supabase PostgreSQL database. Aggregated results are displayed on a live results dashboard using interactive Recharts bar charts, giving the broader university community an at-a-glance picture of their collective sports culture. The project was created for BAIS:3300 (Spring 2026) at the University of Iowa as a practical exercise in full-stack web development and data aggregation.

## Badges

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Azure Static Web Apps](https://img.shields.io/badge/Azure_Static_Web_Apps-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## Features

- **Five-question survey** covering age, U.S. state, favorite sports (multi-select with 20 options + "Other"), team affiliations, and event attendance plans
- **Conditional "Other" input** that appears with an animation only when "Other" is selected from the sports list
- **Client-side validation** via Zod schema — every field is validated before submission, with clear inline error messages
- **Persistent storage** — each submission is saved to a Supabase PostgreSQL table in real time
- **Thank-you page** that displays a personalized summary of the respondent's submitted answers
- **Live results dashboard** showing Most Popular Sports, Top States Represented, and Event Attendance breakdown as interactive bar charts
- **Aggregate-only display** — the results page shows only summarized data; no individual responses are ever exposed
- **SPA routing** with a full Azure Static Web Apps fallback so direct links to `/survey`, `/results`, and `/thank-you` always resolve correctly

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI component framework |
| TypeScript | Static typing across the entire codebase |
| Vite | Development server and production build tool |
| Tailwind CSS v4 | Utility-first styling |
| Wouter | Lightweight client-side routing |
| React Hook Form | Form state management |
| Zod | Schema-based form validation |
| Supabase JS Client | Database reads and writes via REST |
| Supabase PostgreSQL | Persistent storage for survey responses |
| Recharts | Animated, responsive bar charts on the results page |
| Framer Motion | Entrance animations and conditional field transitions |
| Lucide React | Icon set |
| Azure Static Web Apps | Production hosting with SPA fallback routing |

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/) — JavaScript runtime
- [pnpm 9+](https://pnpm.io/installation) — package manager used by this monorepo
- A [Supabase](https://supabase.com/) project with the `survey_responses` table created (see SQL below)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/sporting-events-survey-results.git
cd sporting-events-survey-results
```

2. Install dependencies from the monorepo root:

```bash
pnpm install
```

3. Create your Supabase table by running the following SQL in your Supabase SQL Editor:

```sql
CREATE TABLE survey_responses (
  id bigint generated always as identity primary key,
  created_at timestamptz default now() not null,
  age text not null,
  state text not null,
  favorite_sports text[] not null,
  other_sport text,
  teams text not null,
  attending_event text not null
);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert"
  ON survey_responses FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public select"
  ON survey_responses FOR SELECT TO anon USING (true);
```

4. Create a `.env.local` file inside `artifacts/sporting-events-survey-results/` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Start the development server:

```bash
pnpm --filter @workspace/sporting-events-survey-results run dev
```

The app will be available at `http://localhost:5173`.

## Usage

| Route | Description |
|---|---|
| `/` | Home page — links to the survey and results |
| `/survey` | Five-question survey form |
| `/thank-you` | Confirmation page with a summary of submitted answers |
| `/results` | Aggregated results dashboard with three bar charts |

**Configuration options:**

| Environment Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous (public) API key |
| `PORT` | No | Dev server port (defaults to `5173`) |
| `BASE_PATH` | No | Base URL path prefix (defaults to `/`) |

To build for production:

```bash
pnpm --filter @workspace/sporting-events-survey-results run build
```

The compiled static files are output to `artifacts/sporting-events-survey-results/dist/public/`.

## Project Structure

```
artifacts/sporting-events-survey-results/
├── public/
│   └── staticwebapp.config.json   # Azure SPA fallback — rewrites all routes to index.html
├── src/
│   ├── components/
│   │   ├── layout.tsx             # Shared page shell with header and footer
│   │   └── ui/                    # Reusable shadcn/Radix UI primitives
│   ├── hooks/
│   │   └── use-survey.ts          # React Query mutation for submitting and fetching responses
│   ├── lib/
│   │   └── supabase.ts            # Supabase client initialized from env vars
│   ├── pages/
│   │   ├── home.tsx               # Landing page with CTA buttons and DB setup helper
│   │   ├── survey.tsx             # Five-question form with Zod validation
│   │   ├── thank-you.tsx          # Post-submission summary read from sessionStorage
│   │   ├── results.tsx            # Aggregated Recharts charts and KPI cards
│   │   └── not-found.tsx          # 404 fallback page
│   ├── App.tsx                    # Root component — router and providers
│   ├── main.tsx                   # React DOM entry point
│   └── index.css                  # Tailwind base styles and CSS custom properties
├── vite.config.ts                 # Vite config — port, base path, build output dir
├── tsconfig.json                  # TypeScript project config
└── package.json                   # Package manifest and npm scripts
```

## Changelog

### v1.0.0 — 2026-03-30

- Initial release
- Five-question survey form with full client-side validation (Zod + React Hook Form)
- Supabase PostgreSQL integration for persistent response storage with Row Level Security
- Live results dashboard with three Recharts bar charts (sports, states, attendance)
- Thank-you page with personalized submission summary and confetti animation
- Azure Static Web Apps deployment configuration (`staticwebapp.config.json`)
- Responsive layout with Tailwind CSS and `#DA3BDB` primary accent color
- Global footer on every page: "Survey by Meghan Cullen, BAIS:3300 - spring 2026."

## Known Issues / To-Do

- [ ] The survey can be submitted multiple times by the same user — there is currently no duplicate-submission prevention or rate limiting
- [ ] The "States Rep'd" chart shows only the top 10 states; states beyond the top 10 are not visible even though their count is included in the KPI
- [ ] There is no admin view or password-protected page to export raw response data to CSV
- [ ] The bundle size (~1.1 MB JS) is larger than necessary due to unused shadcn/Radix UI components that were scaffolded but are not used by the survey pages

## Roadmap

- Add an optional open-ended "additional comments" question to the survey
- Implement a CSV export feature behind a simple admin passcode
- Add a duplicate-submission guard using a browser fingerprint or session cookie
- Expand the results dashboard with a time-series chart showing submission volume over time
- Introduce dark mode support toggled by a header button

## Contributing

Contributions are welcome. Please open an issue first to discuss any significant changes. To contribute code, fork the repository, create a feature branch, make your changes with clear commit messages, and open a pull request against `main`.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a pull request against the `main` branch

## License

This project is licensed under the [MIT License](./LICENSE).

## Author

**Meghan Cullen**  
University of Iowa  
BAIS:3300 — Business Analytics and Information Systems, Spring 2026

## Contact

GitHub: [github.com/meghancullen](https://github.com/meghancullen)

## Acknowledgements

- [Supabase Documentation](https://supabase.com/docs) — database setup, RLS policies, and JavaScript client
- [Recharts Documentation](https://recharts.org/en-US/) — chart configuration and custom tooltip patterns
- [shadcn/ui](https://ui.shadcn.com/) — accessible UI component primitives
- [Zod](https://zod.dev/) — schema validation patterns
- [React Hook Form](https://react-hook-form.com/) — form state and validation integration
- [Vite](https://vitejs.dev/) — build tooling and dev server configuration
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/) — SPA routing fallback configuration
- [Framer Motion](https://www.framer.com/motion/) — animation patterns for conditional form fields
- [Replit](https://replit.com/) — development environment and AI-assisted scaffolding
- Claude (Anthropic) — AI assistant used during development for code generation, debugging, and review
