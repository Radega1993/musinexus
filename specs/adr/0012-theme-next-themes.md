# ADR 0012: Theme Implementation

## Status
Accepted

## Decision
Use `next-themes` with class-based Tailwind dark mode.
- Modes: light / dark / system
- Persistence: localStorage (handled by next-themes)

## Consequences
- Fast, reliable theme switching
- Minimal custom code