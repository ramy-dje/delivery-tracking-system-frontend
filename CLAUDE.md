# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Next.js with Turbo, 1536MB heap)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Architecture

**Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui

### Routing

All routes live under `app/`. The main protected area is `app/dashboard/` with sub-routes for each resource (branches, shipments, drivers, managers, merchants, staffs, vehicles, delivery-fees, bulk-import). Public routes: `/login`, `/register`, `/activation/[token]`, `/company/create`, `/unauthorized`.

### State Management

Single Zustand store at `stores/userStore.ts` persisted to `localStorage` (`user-storage`). Holds user profile, access token, and authentication state. Access via the `useAuth()` hook (`hooks/useAuth.ts`).

### API Layer

`lib/api.ts` creates an Axios instance pointed at `http://localhost:5113/api` (override with `NEXT_PUBLIC_API_URL`). Request interceptors inject `Authorization: Bearer <token>`. Response interceptors handle 401s by queuing requests and refreshing the token automatically before retrying. Auth endpoints (`/auth/*`, `/public`) are excluded from token injection.

Service modules in `services/` (one per resource: Auth, Branch, Company, DeliveryFee, Driver, Location, Manager, Merchant, Shipment, Staff, Vehicle) are the only place that should call the Axios instance directly.

### Role-Based Access

`lib/roles.ts` defines 14 roles with a numeric hierarchy (Admin=200 down to Driver=20). `hasRole()` / `hasAnyRole()` helpers are used for authorization checks. `useRoleGuard()` hook handles route-level protection.

### Types

`types/` contains the full domain model. `ShipmentStatus` has 14 states. All service calls are typed end-to-end — match the types directory when adding new API integrations.

### Key Libraries

- **Forms:** React Hook Form + Zod validation
- **Maps:** Leaflet / React Leaflet (transpiled in `next.config.mjs`)
- **Charts:** Recharts
- **Barcode/QR:** qrcode.react, html5-qrcode, jsbarcode, react-barcode
- **Bulk import:** XLSX
- **Animations:** Framer Motion
- **Toasts:** nextjs-toast-notify (use `toastHelper.ts` utility)
- **Error handling:** `utils/apiErrorHandler.ts`

### Theming

Tailwind config (`tailwind.config.ts`) uses a dark theme with amber/cyan accents. Custom fonts: Syne (display), DM Sans (body), JetBrains Mono (mono). Custom utility classes for glass-effect cards are in `components/commons/`.

## Notes

- TypeScript build errors are suppressed (`ignoreBuildErrors: true`) — do not rely on build success as a type-safety signal; run `tsc --noEmit` explicitly if needed.
- No test suite is configured.
- Images are unoptimized in Next.js config.
