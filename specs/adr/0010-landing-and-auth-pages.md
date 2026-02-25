# ADR 0010: Landing + Auth Pages

## Status
Accepted

## Decision
- `/` is the public landing page.
- `/login` and `/register` are dedicated public pages.
- Authenticated users visiting `/`, `/login`, `/register` are redirected to `/feed`.

## Consequences
- Clear onboarding entry point
- Predictable navigation for new users