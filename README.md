# claim-management-system-fe

Angular frontend for the Chubb APAC Fullstack Developer take-home assessment: claimant and claims-officer workflows served from one codebase. Backend lives in the sibling repo [`claim-management-system-be`](https://github.com/IvanLimChoonKiat/claim-management-system-be) — that's also where the authoritative `AI_WORKING_JOURNAL.md` and architecture docs live.

## Architecture

Angular 19 (standalone components — this dev machine's Node version is below the newest CLI's minimum, 19 is the most recent compatible major), feature-based folders, Reactive Forms, signals for local state, functional HTTP interceptor for the auth token. One shared `claim-detail` view serves both roles, conditionally rendering claimant vs. officer actions — see `CLAUDE.md` "Architecture rules" for why.

```
src/app/
  core/        auth service + state, HTTP interceptor, route guard, DTO models
  shared/      small reusable bits (status badge)
  features/
    auth/            dev-login
    claimant/         submit claim, my claims list
    claims-officer/   unassigned queue, my workload
    claims/           shared claim-detail view (role-conditional actions)
```

## Setup

Prerequisites: Node.js. This dev machine has Node 22.18, below the Angular CLI's newest major's minimum — the project is pinned to **Angular CLI 19** (`npx @angular/cli@19 ...`) for that reason; a newer Node lets you drop the `@19` pin.

```bash
npm install
```

## Running the frontend

Requires the backend running at `http://localhost:5299` (see `claim-management-system-be` README) — the base URL is set in `src/app/core/api-config.ts`.

```bash
npx @angular/cli@19 serve
```

Open `http://localhost:4200`. Dev-only mock login: enter any email/display name and pick a role (Claimant or Claims Officer) — there is no password, see the warning banner on the login page and `CLAUDE.md` "Security standards".

## Building

```bash
npx @angular/cli@19 build
```

Output in `dist/claim-management-system-fe/`.

## Unit tests

```bash
npx @angular/cli@19 test --no-watch --browsers=ChromeHeadless
```

## Browser verification

The full golden path (claimant submit → officer assign → officer requests info → claimant responds → officer approves) was driven end-to-end in a real headless Chromium browser against both servers running locally, with zero console errors. Screenshots and the driver script are referenced in `claim-management-system-be/AI_WORKING_JOURNAL.md` Phase 6.

## GitHub Actions

`.github/workflows/ci.yml` — `npm ci`, Angular build verification, unit tests. Runs on push/PR to `main`/`develop` and manual dispatch.

## Known limitations

- Dev-only mock authentication (see backend `README.md` "Known limitations") — no password, token is a non-production JWT.
- The Angular route guard (`core/guards/auth.guard.ts`) is a UX convenience only; every permission is independently enforced by the backend.
- No design system / visual polish — functional UI, kept deliberately small per the assessment brief's "backend gets the majority of time" guidance. No dashboard (deferred, see backend `docs/ASSUMPTIONS.md`).
- `API_BASE_URL` in `core/api-config.ts` is a hardcoded constant rather than environment-file-based config — reasonable at this app's single-target scale, would need revisiting for multiple deployment environments.
