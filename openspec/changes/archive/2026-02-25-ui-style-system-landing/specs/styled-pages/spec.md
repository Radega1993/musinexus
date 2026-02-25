## ADDED Requirements

### Requirement: Landing page matches concert/gradient and glass style

The system SHALL style the landing page (/) so it matches the "concert/gradient + glass panels" reference. The landing SHALL use the shared body background (gradient) and SHALL present a hero in split layout: text (headline, subtext, CTAs) on one side and an illustration placeholder on the other (or stacked on small screens). CTAs or feature areas SHALL use the glass panel style (Card glass or .glass) so the landing is visually consistent with the design system.

#### Scenario: Landing has hero split layout

- **WHEN** an unauthenticated user visits /
- **THEN** the page displays a hero with text content and illustration placeholder in the defined split (or stacked) layout

#### Scenario: Landing uses gradient and glass

- **WHEN** the user views the landing page
- **THEN** the background uses the defined gradient and any panels/CTAs use the glass style

### Requirement: Login and Register pages use the style system

The system SHALL style the login and register pages with the same design tokens and base components (Button, Card, Container). Forms and buttons on these pages SHALL look consistent with the landing and with each other. The pages SHALL use the shared body background and glass (or token-based) card for the form container.

#### Scenario: Auth pages use token-based components

- **WHEN** the user visits /login or /register
- **THEN** the page uses the design tokens and base UI components (e.g. Button, Card, Container) so the look matches the rest of the app

#### Scenario: Buttons and cards consistent with landing

- **WHEN** the user compares landing CTAs with login/register buttons
- **THEN** the buttons and card styling are consistent (same variants and token usage)

### Requirement: Theme persists and no layout shift on load

The system SHALL persist the user's theme preference (light/dark/system) so it is restored on reload. The system SHALL apply the theme in a way that avoids a visible flash or layout shift on first paint (e.g. script in head or theme provider that runs before paint). This requirement applies across landing, auth, and app pages.

#### Scenario: Theme restored on refresh

- **WHEN** the user has selected a theme and refreshes the page
- **THEN** the same theme is applied without the user reselecting

#### Scenario: No flash of wrong theme

- **WHEN** the user loads any page
- **THEN** the initial paint SHALL not show the wrong theme followed by a switch (minimal or no flash)

### Requirement: AppHeader visible on app routes with nav and theme toggle

The system SHALL show the AppHeader (with nav links and theme toggle) on app routes (e.g. /feed, /search, /create-post, profile routes). The system SHALL hide the full app header on /, /login, and /register (or show a minimal public header per product decision). The header SHALL be styled with the design system so it matches the styled pages.

#### Scenario: Header on app routes

- **WHEN** the user navigates to an app route (e.g. /feed)
- **THEN** the AppHeader is visible with navigation and theme toggle, styled with the token system

#### Scenario: Header hidden on public routes

- **WHEN** the user is on /, /login, or /register
- **THEN** the full app header is not shown (or a minimal variant is shown per design)
