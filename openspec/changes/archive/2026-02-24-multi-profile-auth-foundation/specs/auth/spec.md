## ADDED Requirements

### Requirement: User can register with email and password

The system SHALL expose POST /api/auth/register accepting email and password. The system MUST create a User record with a hashed password and MUST return 201 with a JSON body containing userId. The system SHALL NOT store plaintext passwords.

#### Scenario: Successful registration

- **WHEN** client sends POST /api/auth/register with valid email and password (min length 8)
- **THEN** system creates a User with that email and a hashed password, and responds 201 with body { userId }

#### Scenario: Registration rejected when email already exists

- **WHEN** client sends POST /api/auth/register with an email that already exists
- **THEN** system responds 409 and does not create a new user

#### Scenario: Registration rejected for invalid payload

- **WHEN** client sends POST /api/auth/register with missing email or password, or password shorter than 8 characters
- **THEN** system responds 400 with application/problem+json

### Requirement: User can sign in with credentials

The system SHALL support sign-in with email and password via NextAuth Credentials provider. The system MUST establish a session (cookie) on successful sign-in and MUST reject invalid credentials without revealing whether the email exists.

#### Scenario: Successful sign-in

- **WHEN** user submits valid email and password via the configured sign-in flow
- **THEN** system establishes a session and redirects or returns success per NextAuth config

#### Scenario: Sign-in rejected for invalid credentials

- **WHEN** user submits incorrect password or unknown email
- **THEN** system does not create a session and returns an error response

### Requirement: Session is persisted and available to the app

The system SHALL persist sessions in the database via the NextAuth Prisma adapter. The system MUST make the current user (and optionally activeProfileId) available to API routes and server components via getServerSession or equivalent.

#### Scenario: Session available after sign-in

- **WHEN** a user has signed in and sends a request that includes the session cookie
- **THEN** getServerSession (or equivalent) returns the session with user id and email

#### Scenario: Unauthenticated request has no session

- **WHEN** a request is made without a valid session cookie
- **THEN** getServerSession returns null and protected routes SHALL respond 401 when required

### Requirement: User can sign out

The system SHALL support sign-out. The system MUST invalidate the current session so that subsequent requests are unauthenticated.

#### Scenario: Sign-out clears session

- **WHEN** the user signs out via the configured sign-out flow
- **THEN** the session is removed and subsequent requests are treated as unauthenticated
