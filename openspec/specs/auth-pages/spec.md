## ADDED Requirements

### Requirement: Dedicated login page uses existing auth

The system SHALL expose a login page (e.g. `/login`) with a form that collects credentials (e.g. email and password). On submit, the system SHALL call the existing NextAuth sign-in flow (or equivalent); the system SHALL NOT introduce new login API endpoints. On successful sign-in, the system SHALL redirect the user (e.g. to callbackUrl, default destination, or feed). On failure, the system SHALL display an error message and SHALL allow the user to correct and resubmit.

#### Scenario: User submits valid credentials on login page

- **WHEN** the user submits the login form with valid credentials
- **THEN** the system authenticates via the existing auth API and redirects the user to the configured destination (e.g. feed)

#### Scenario: User submits invalid credentials on login page

- **WHEN** the user submits the login form with invalid credentials
- **THEN** the system displays an error message and leaves the user on the login page

#### Scenario: Login page links to register

- **WHEN** the user is on the login page
- **THEN** the system SHALL provide a link or CTA to the register page for users who do not have an account

### Requirement: Dedicated register page uses existing auth

The system SHALL expose a register page (e.g. `/register`) with a form that collects registration data (e.g. email, password, and any required fields). On submit, the system SHALL call the existing registration API (e.g. POST /api/auth/register or equivalent); the system SHALL NOT introduce new registration API endpoints. On success, the system SHALL redirect the user (e.g. to login or auto sign-in and then feed). On failure (e.g. email already exists), the system SHALL display an error and SHALL allow the user to correct and resubmit.

#### Scenario: User submits valid data on register page

- **WHEN** the user submits the register form with valid data
- **THEN** the system creates the account via the existing API and redirects or signs the user in per product behavior

#### Scenario: Register page links to login

- **WHEN** the user is on the register page
- **THEN** the system SHALL provide a link or CTA to the login page for users who already have an account
