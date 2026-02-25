## 1. Theme foundation

- [x] 1.1 Add next-themes; wrap root layout with ThemeProvider (default: localStorage persistence)
- [x] 1.2 Configure attribute/class on html for Tailwind dark (e.g. class or data-theme); next-themes handles initial paint
- [x] 1.3 Create theme selector component (light / dark / system) using useTheme for use in header

## 2. Landing page

- [x] 2.1 Create or replace landing at / with hero/headline and CTAs to /login and /register
- [x] 2.2 Redirect authenticated users visiting / to /feed (middleware or layout)

## 3. Auth pages

- [x] 3.1 Add /login page: form (email, password), call NextAuth signIn, show error, link to /register
- [x] 3.2 Add /register page: form, call existing register API, show error, link to /login
- [x] 3.3 Redirect to /feed or callbackUrl after successful login/register

## 4. App shell

- [x] 4.1 Add AppShell (header) in root layout; hide header when pathname is /, /login, or /register (pathname check, no route move)
- [x] 4.2 Build header component: logo (link to /feed), nav links (Feed, Search, New post), theme selector
- [ ] 4.3 Optional: user or active-profile menu in header (e.g. profile switcher, logout)
