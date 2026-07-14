# Sportshunt App

A clean, premium Next.js web application for:

- turf booking
- player matching
- tournament discovery and management
- admin-controlled venue and organizer approvals

## Stack

- Next.js 16
- React 19
- Tailwind CSS
- localStorage-backed demo state for frontend functionality

## Run locally

```bash
npm install
npm run dev
npm run typecheck
npm run format
```

Then open `http://localhost:3000`

## Shared testing credential

Testing credentials:

- Player / Venue owner / Organizer / Referee
  - Email: `siddharthbhat20@gmail.com`
  - Password: `SH@123`
- Super admin
  - Email: `bhatsiddharth10@gmail.com`
  - Password: `SH@123`

Role routes:

- Player: `/login`
- Venue owner: `/login?role=venue-owner`
- Organizer: `/login?role=organizer`
- Super admin: `/login?role=admin`
- Referee: `/login?role=referee`

## Architecture

See `docs/architecture.md` for the current folder strategy, state layer split, and route model.

## Notes

- This build includes a fully functional frontend and role-aware dashboards.
- State is persisted in browser localStorage.
- The app is currently locked to a single shared testing credential across all roles.
- State is still persisted in browser localStorage.
- The next backend step is replacing demo persistence with real Supabase-backed auth + database tables.
# Sportshunt
