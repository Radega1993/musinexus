## Context

- **Stack**: Next.js App Router, Tailwind v4, existing next-themes (light/dark/system). Landing, login/register, and AppShell (header) already exist; they use default Tailwind classes and ad-hoc styling. Specs/design reference: `specs/design/visual-style.md` (concert/gradient, glass panels, electric blue primary, deep navy base).
- **Current state**: No shared design tokens; pages look functional but not unified. Theme works; we need to apply a single visual system without breaking it.
- **Constraints**: No API changes. Theme provider and persistence stay; we extend Tailwind and globals, then refactor components and pages to use them.

## Goals / Non-Goals

**Goals:**

- **Tokens**: Brand colors as CSS custom properties in globals.css (`:root` for light, `.dark` for dark); Tailwind theme references `var(--brand-*)` so theme switch is automatic and components never duplicate classes. Additional theme keys: borderRadius (xl, 2xl), boxShadow (soft), backdropBlur (glass). Globals: full-height html/body, body background (gradients + base), utility `.glass`.
- **Light/dark**: CSS variables make light/dark automatic (no `dark:` on every component); next-themes toggles class on html; no theme flash.
- **Base components**: Button (primary/secondary, sizes), Card with glass variant, Container (standard layout: max-w 1200px, responsive padding), AppHeader refactored to use tokens and glass/minimal bar style.
- **Landing**: Hero split layout (text left, illustration/placeholder right), gradient background, glass panels for CTAs or feature strip; matches “concert/gradient + glass” reference.
- **Login / Register**: Same system—glass card, token-based buttons and inputs, consistent with landing and feed.
- **AppHeader**: Nav + theme toggle; visible on app routes, hidden on /, /login, /register (existing pathname rule). Styled with tokens/glass or minimal bar.

**Non-Goals:**

- New theme implementation (we keep next-themes). New API or backend. Full design system documentation site. Illustration asset creation (placeholder only).

## Decisions

1. **CSS variables as base tokens (recommended pattern)**
   - In `globals.css` define brand color variables: `:root` for light (`--brand-bg: #ffffff`, `--brand-panel`, `--brand-border`, `--brand-text`, `--brand-muted`) and `.dark` for dark (`--brand-bg: #0B1020`, `--brand-panel: rgba(255,255,255,0.06)`, `--brand-border: rgba(255,255,255,0.12)`, `--brand-text: #EAF0FF`, `--brand-muted`). Tailwind theme then uses `colors.brand: { bg: "var(--brand-bg)", panel: "var(--brand-panel)", border: "var(--brand-border)", text: "var(--brand-text)", muted: "var(--brand-muted)", primary: "#2F6BFF", primaryHover: "#2457D6" }`. Use `darkMode: "class"`. **Rationale**: Theme change = swap variables; components never change; future theming is trivial; no duplicated `dark:` classes.

2. **Global CSS: body background and .glass**
   - In `globals.css`: `html, body { height: 100%; }`; `body` uses the gradient + base (e.g. `var(--brand-bg)` or explicit for gradient). Utility `.glass`: semi-transparent bg, border, `backdrop-filter: blur(12px)`; in `.dark` use rgba(255,255,255,…), in `:root` use rgba(0,0,0,…) so glass adapts to theme. **Rationale**: Single place for mode-specific glass and gradient; consistent with variable-based tokens.

3. **Light vs dark**
   - Handled entirely by CSS variables and class on `html` (next-themes). No component-level `dark:` needed for brand colors. **Rationale**: One source of truth; no refactors when adding themes.

4. **Base components location and API**
   - Under `src/components/`: `Button` (primary/secondary/ghost, default/lg), `Card` (default + `variant="glass"`), `Container` (standard layout, see below), `AppHeader` (tokens + glass/minimal bar). **Container**: `mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8` so all pages share the same visual width. **Rationale**: Reusable; Container ensures global layout consistency.

5. **Landing hero layout**
   - Two-column (or stacked on small): left = headline + subtext + CTAs (using Button), right = illustration placeholder (e.g. div with aspect ratio or image placeholder). Wrap in Container; background from body + optional glass panel behind CTA area. **Rationale**: Matches visual-style “hero split layout” and “glass panels for feature strip/cards”.

6. **Header visibility**
   - Keep current rule: AppShell (header) hidden when pathname is /, /login, /register. No new route groups. **Rationale**: Already decided in ui-shell change; style only here.

## Risks / Trade-offs

- **[Risk] Light mode contrast**: Dark-first palette may need tuned overrides for light (text on light bg). Mitigation: define explicit light token values and test login/landing in both modes.
- **[Trade-off] Tailwind v4**: If the project uses Tailwind v4 with `@theme` in CSS instead of tailwind.config, put token definitions there and keep globals.css for body/.glass. Design intent is the same.

## Migration Plan

- Add tokens and globals first; then Button, Card, Container; then refactor AppHeader; then landing, then login/register. No data or API migration. Rollback: revert config, globals, and component/page changes.

## Open Questions

- None blocking. Optional: exact light-mode gradient and panel values (can match to visual-style and tune in implementation).
