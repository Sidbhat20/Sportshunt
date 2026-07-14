# Sportshunt Architecture

## Current shape

Sportshunt is a Next.js App Router application with a demo-first state layer.

- `app/` — route segments and page composition
- `components/` — reusable UI and layout building blocks
- `lib/auth-*` — auth configuration and login helpers
- `lib/demo/` — seeded demo data
- `lib/state/` — state contracts, persistence helpers, and provider support utilities
- `types/` — shared domain models

## Route model

Primary workspace entry points:

- Player: `/`
- Venue owner: `/venue`
- Organizer: `/organizer`
- Referee: `/referee`
- Super admin: `/admin`

Legacy routes under `/dashboard/*` are intentionally redirect-only wrappers.

## State model

`components/app-provider.tsx` remains the application boundary for now, but it now delegates to:

- `lib/demo/seed-state.ts`
- `lib/demo/turfs.ts`
- `lib/state/auth-actions.ts`
- `lib/state/organization-actions.ts`
- `lib/state/activity-actions.ts`
- `lib/state/tournament-actions.ts`
- `lib/state/moderation-actions.ts`
- `lib/state/helpers.ts`
- `lib/state/selectors.ts`
- `lib/state/types.ts`
- `lib/state/use-app-persistence.ts`
- `lib/auth-config.ts`

This keeps route components simple while making future migration to Supabase-backed persistence easier.

## Auth model

- Shared testing credential only
- Same email/password can enter all role-specific workspaces
- Role selection is determined by the route being used at login time

## Recommended next evolution

1. Replace demo persistence with Supabase tables.
2. Split app-provider actions by domain (`auth`, `organizations`, `turfs`, `tournaments`).
3. Add tests around tournament progression and role guards.
4. Introduce a design-token backed component system for forms and tables.
