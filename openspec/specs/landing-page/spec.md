## ADDED Requirements

### Requirement: Unauthenticated users see a public landing page

The system SHALL expose a public landing page (e.g. at `/` or a dedicated route) that any unauthenticated user can view. The page SHALL display a hero or headline and SHALL provide clear call-to-action links or buttons to log in and to register. The system MAY redirect authenticated users away from the landing page (e.g. to feed) when they visit the landing route; if not redirected, the landing MAY show a different CTA (e.g. "Go to feed").

#### Scenario: Unauthenticated user sees landing with CTAs

- **WHEN** an unauthenticated user visits the landing route
- **THEN** the system displays the landing page with hero/headline and at least one CTA to login and one CTA to register

#### Scenario: CTAs navigate to auth pages

- **WHEN** the user clicks the login CTA on the landing page
- **THEN** the system navigates to the login page (e.g. `/login`)

- **WHEN** the user clicks the register CTA on the landing page
- **THEN** the system navigates to the register page (e.g. `/register`)
