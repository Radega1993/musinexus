## ADDED Requirements

### Requirement: App routes show a persistent header and navigation

The system SHALL render a persistent app shell (header and navigation) on routes that are considered "in-app" (e.g. feed, search, profile, create-post, handle-based profile). The shell SHALL include a logo or brand element that links to a home destination (e.g. feed). The shell SHALL include navigation links to the main app destinations (e.g. feed, search, create post). The shell SHALL NOT be shown on the landing page or on the login/register pages. The system MAY include a user or active-profile menu (e.g. profile switcher, logout) in the shell.

#### Scenario: User on app route sees header and nav

- **WHEN** an authenticated user visits an in-app route (e.g. /feed, /search)
- **THEN** the system displays the persistent header with logo and navigation links

#### Scenario: Logo navigates to home destination

- **WHEN** the user clicks the logo or brand element in the header
- **THEN** the system navigates to the configured home destination (e.g. /feed)

#### Scenario: Nav links go to correct routes

- **WHEN** the user clicks a navigation link in the shell (e.g. Feed, Search)
- **THEN** the system navigates to the corresponding route

#### Scenario: Landing and auth pages do not show shell

- **WHEN** the user is on the landing page or on the login or register page
- **THEN** the system does NOT render the app shell header on that page
