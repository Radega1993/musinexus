## Why

Users need a clear entry point (landing), straightforward login/register flows, and a consistent app shell with navigation. A persistent theme (light/dark/system) improves accessibility and comfort. Right now the app lacks a proper landing, dedicated auth pages, and a shared header; adding them makes onboarding and daily use predictable and professional.

## What Changes

- **Landing page**: Public entry page with clear CTAs to log in or register.
- **Auth pages**: Dedicated login and register pages that use the existing auth API (NextAuth); no new backend.
- **App shell**: Persistent header/navigation (e.g. logo, links to feed, search, profile/create) shown on authenticated app routes.
- **Theme**: Light / dark / system preference persisted (e.g. cookie or localStorage) and applied via a theme provider; no new API.
- Scope: UI only, theme, and auth flows; no new API endpoints.

## Capabilities

### New Capabilities

- **landing-page**: Public landing with hero and CTAs to login/register.
- **auth-pages**: Login and register pages; forms and redirects using existing auth (NextAuth).
- **app-shell**: Persistent header and navigation for app routes (logo, nav links, optional user menu).
- **theme**: Light, dark, and system theme with persisted preference and global application.

### Modified Capabilities

- None (UI and client-side theme only; no requirement changes to existing specs).

## Impact

- **Code**: New pages (landing, login, register), app layout with shell, header component, theme provider and persistence (cookie or localStorage). Possible root layout or middleware for theme.
- **APIs**: None new; auth pages call existing sign-in/register endpoints.
- **Dependencies**: Existing Next.js and NextAuth; optional small dependency for theme if desired (e.g. next-themes or custom).
- **Systems**: None.
