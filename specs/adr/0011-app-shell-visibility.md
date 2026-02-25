# ADR 0011: App Shell Visibility Strategy

## Status
Accepted

## Decision
- Implement a single global AppShell (header) and hide it on public routes: `/`, `/login`, `/register`.
- Avoid route-group refactor for MVP speed.

## Consequences
- Minimal code movement, lower risk
- Easy to migrate to `(app)` route group later