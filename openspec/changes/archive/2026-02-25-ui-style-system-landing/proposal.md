## Why

MusiNexus needs a consistent visual identity: a single style system (tokens + base UI components) applied across the landing, login/register, and app header so the product feels cohesive. Implementing design tokens and glass/gradient styling now, with light/dark/system theme persistence already in place, ensures new and existing pages share the same look and avoid layout shifts or theme flash on load.

## What Changes

- **Design tokens**: Tailwind theme extension (colors, borderRadius, boxShadow, backdropBlur) and global CSS (base background, gradient, glass panel helper) so all UI can reference the same values.
- **Theme**: Keep existing theme provider (light/dark/system) and ThemeToggle; ensure persistence and no flash on load.
- **Base UI components**: Button, Card (glass), Container, and AppHeader built or refactored to use the tokens and glass style.
- **Landing page (/)** : Hero in split layout (text + illustration placeholder), concert/gradient + glass panels style matching the reference.
- **Login / Register**: Styled with the same system (buttons, cards, container).
- **AppHeader**: Visible on app routes, hidden (or minimal public header) on /, /login, /register; includes nav + theme toggle.
- **Scope**: No API changes.

## Capabilities

### New Capabilities

- **design-tokens**: Tailwind theme extend (brand colors, radii, shadow, blur) and globals.css (body background gradient, .glass utility); light/dark variants where needed.
- **base-ui-components**: Button, Card (glass), Container, and AppHeader components that consume tokens and expose consistent props/variants.
- **styled-pages**: Application of the style system to landing (/), login/register, and app header so they match the concert/gradient + glass look and behave consistently (theme persists, no layout shift/flash).

### Modified Capabilities

- None (styling and component implementation only; no requirement changes to existing auth or app-shell specs).

## Impact

- **Code**: tailwind.config (or equivalent), globals.css, new or updated components (Button, Card, Container, AppHeader), updates to landing, login, register, and header layout/styles.
- **APIs**: None.
- **Dependencies**: Existing Tailwind and theme stack; no new runtime deps required.
- **Systems**: None.
