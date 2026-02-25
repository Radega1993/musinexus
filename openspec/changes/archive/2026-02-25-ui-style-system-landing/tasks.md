## 1. Design tokens and globals

- [x] 1.1 In globals.css define CSS variables: :root (light — brand bg, panel, border, text, muted) and .dark (dark — same keys with concert/navy values); add body gradient and .glass utility (theme-aware rgba and blur 12px)
- [x] 1.2 Extend Tailwind theme with colors.brand referencing var(--brand-bg), var(--brand-panel), var(--brand-border), var(--brand-text), var(--brand-muted), primary: #2F6BFF, primaryHover: #2457D6; borderRadius xl/2xl; boxShadow soft; backdropBlur glass; darkMode: "class"
- [x] 1.3 Set html/body height 100% and body default background (radial gradients + base); ensure no theme flash (class on html before paint)

## 2. Base UI components

- [x] 2.1 Implement Button component with primary/secondary (and optional ghost) variants and default/lg sizes using design tokens
- [x] 2.2 Implement Card component with default and glass variant using tokens and .glass style
- [x] 2.3 Implement Container component: mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 for consistent layout across all pages
- [x] 2.4 Refactor AppHeader to use design tokens and include nav links and theme toggle (visibility rule unchanged)

## 3. Landing page

- [x] 3.1 Apply gradient background and token-based layout to landing page (/)
- [x] 3.2 Implement hero split layout: text (headline, subtext, CTAs) left, illustration placeholder right (stack on small screens), wrapped in Container
- [x] 3.3 Use Button and glass Card/panels for CTAs or feature strip so landing matches concert/gradient + glass reference

## 4. Auth pages and header visibility

- [x] 4.1 Apply design system to login page: shared body background, glass Card for form, token-based Button and Container
- [x] 4.2 Apply design system to register page: same as login for consistency
- [x] 4.3 Ensure theme persistence (next-themes) and no theme flash on load across landing, auth, and app; confirm AppHeader hidden on /, /login, /register and visible on app routes
