# CLAUDE.md — Frontend Engineering Instructions

## Project context

Angular frontend for the Chubb APAC Fullstack Developer take-home assessment. Serves both claimant and claims-officer workflows from one codebase against the backend API in the sibling repo [`claim-management-system-be`](https://github.com/IvanLimChoonKiat/claim-management-system-be) (the authoritative source for architecture, domain model, and the AI working journal).

Sprint-format assessment: backend got the majority of the time budget per the brief's own guidance ("A well-built backend with a partial frontend will outscore a rushed attempt at both"). This frontend is deliberately minimal — functional, not polished.

Stack: Angular 19 (standalone components — Node on this dev machine is below the newer CLI's minimum, 19 is the most recent compatible major), TypeScript strict mode, Reactive Forms, `HttpClient` with functional interceptors, feature-based folder structure. No NgRx/state-management library — app state is small enough for a couple of injectable services with signals.

## Architecture rules

```
src/app/
  core/        auth service + state, HTTP interceptors, route guards, shared models/DTOs
  shared/      small reusable presentational bits (loading/empty states)
  features/
    auth/            dev-login
    claimant/         submit claim, my claims list
    claims-officer/   unassigned queue, my workload
    claims/           shared claim-detail view (role-conditional actions) used by both roles
```

Both roles share one `claim-detail` view rather than two separate components — it reads the claim once and conditionally renders the claimant's "respond to info request" form or the officer's "assign / request info / decide" actions based on the logged-in user's role and the claim's current status. This is the answer to "how does the frontend serve two distinct user types from one codebase."

**The Angular route guard is a UX convenience only.** Every permission it checks (role, ownership) is independently and authoritatively re-enforced by the backend — a forged request or a bug in the guard must never be able to bypass server-side authorization. Don't trust client-side checks for anything security-relevant.

## Coding standards

- Standalone components only, no NgModules.
- Typed API service per feature area (`ClaimsApiService`), TypeScript interfaces mirroring the backend's DTOs (see `claim-management-system-be/docs/API.md` for the contract).
- Signals for local component/service state over RxJS Subjects where either would do — simpler for this app's scale.
- Every API-calling component tracks loading/error/empty state explicitly; no silent failures.
- Strict TypeScript (`strict: true`, already the Angular 19 default).

## Security standards

- JWT from `/api/auth/dev-login` stored in memory + `localStorage` (so a refresh doesn't log the user out) — this is a dev-only mock token, not a production credential; document that limitation wherever login is surfaced in the UI.
- `authInterceptor` attaches the bearer token; `authGuard` redirects unauthenticated/wrong-role navigation — again, UX only, not the real security boundary.

## Testing rules

- Default Angular/Jasmine/Karma scaffolding kept for `ng test`; business logic worth testing lives in `AuthService`/`ClaimsApiService`, not in template-heavy components — keep what tests exist focused there rather than inflating coverage with trivial component specs.
- `ng build` must succeed before every commit.

## Development workflow

- Build (`ng build`) after every meaningful change.
- Update `AI_WORKING_JOURNAL.md` — maintained in the backend repo, referenced from this repo's README — don't duplicate it here.
- Keep this frontend small; defer anything beyond the claimant/officer core flows (see backend `docs/ASSUMPTIONS.md` for the agreed deferred scope).

## Git rules

Same as the backend repo: small logical commits per verified milestone, meaningful messages, no fabricated history, nothing in `.gitignore` (notably `node_modules/`, `dist/`) ever committed.
