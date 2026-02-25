## Context

- **Stack**: Next.js App Router, existing NextAuth (credentials + possible providers). No dedicated landing; auth may be inline or minimal. App routes (feed, search, etc.) exist without a shared header. Theme is likely default (e.g. Tailwind dark mode unset or ad-hoc).
- **Current state**: Users reach the app without a clear landing; login/register flows are not dedicated pages; no persistent app shell or theme preference.
- **Constraints**: UI and theme only; no new API. Auth must use existing NextAuth endpoints and session. Shell and theme must work with existing routes (/, /feed, /search, /[handle], etc.).

## Goals / Non-Goals

**Goals:**

- **Landing**: Single public page (e.g. `/` or `/home`) with hero and CTAs to login/register; unauthenticated users see it, authenticated users can be redirected to feed or see a different CTA.
- **Auth pages**: Dedicated `/login` and `/register` (or `/auth/login`, `/auth/register`) with forms that call NextAuth signIn and existing register API; redirect after success (e.g. to feed or callbackUrl).
- **App shell**: One header/nav component shown on app routes (feed, search, profile, create-post, etc.) with logo, main nav links, and optional user/active-profile menu; not shown on landing or auth pages.
- **Theme**: Three modes (light, dark, system); preference persisted (cookie or localStorage); applied globally via class on `html` or a provider; no flash of wrong theme on load when possible.

**Non-Goals:**

- New auth backend or new API endpoints. Changing NextAuth configuration beyond what’s needed for the new pages. Server-side theme detection beyond reading stored preference (e.g. cookie) for SSR/initial paint.

## Decisions

1. **Landing vs home**
   - Use `/` as the landing (hero + CTAs). If `/` is already used by the app, use a dedicated route (e.g. `/landing` or `/home`) and redirect root accordingly. **Rationale**: Single clear entry; authenticated users can be redirected from `/` to `/feed` (or similar) in middleware or layout.

2. **Auth route shape**
   - Use `/login` and `/register` (flat routes). **Alternative**: `/auth/login`, `/auth/register`. **Rationale**: Flat is shorter and common; no new API so path shape is a convention only.

3. **Where the shell is rendered**
   - **Global header, hidden on public routes.** Add a single AppShell (header/nav) in the root layout. Do **not** move existing routes into a route group. Hide the header when pathname is `/`, `/login`, or `/register` (pathname check). All other routes show the header. **Rationale**: MVP-fast; avoids refactor. Route groups can be introduced later if desired.

4. **Theme persistence and application**
   - Use **next-themes** with its default persistence (localStorage). It supports light, dark, and system; applies class on `html` (e.g. `dark` for Tailwind); and avoids flash reasonably well with App Router. **Alternative for zero flash**: cookie + script in `<head>` (more effort). **Rationale**: next-themes is SSR-friendly enough for MVP; localStorage is simpler; "perfect" zero-flash can be added later with a cookie if needed.

5. **Theme dependency**
   - **Use next-themes.** Add the package, wrap the app with `ThemeProvider`, use `useTheme()` for the selector (light/dark/system). No custom cookie sync for MVP. **Rationale**: Fast to implement; handles system preference and attribute/class on document; good enough for launch.

## Risks / Trade-offs

- **[Trade-off] Route vs middleware**: Redirecting authenticated users from `/` to `/feed` can be done in layout (client) or middleware (server). Middleware is cleaner for a single redirect; layout is simpler if we already have a “gate” there.
- **[Risk] Theme flash**: If theme is read only on the client, the first paint may be wrong. Mitigation: store theme in a cookie and inject a small script in `<head>` (or use next-themes) to set the class before paint.
- **[Trade-off] Shell visibility**: The header is shown or hidden by pathname check (/, /login, /register = hidden). Adding a new public route later requires adding it to the hide list.

## Migration Plan

- Add new pages and layout only; no data migration. Deploy order: (1) next-themes + ThemeProvider in root layout, (2) landing and auth pages, (3) global AppShell in root layout with hide-on-public-routes. Rollback: remove new routes and AppShell, revert root layout.

## Open Questions

- None blocking. Optional: exact copy and visuals for landing hero and CTAs (can be defined in tasks or later).
