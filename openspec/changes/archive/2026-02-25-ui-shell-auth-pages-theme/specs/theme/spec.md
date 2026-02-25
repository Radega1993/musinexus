## ADDED Requirements

### Requirement: User can choose light, dark, or system theme

The system SHALL support three theme modes: light, dark, and system. The system SHALL provide a control (e.g. dropdown, toggle, or menu) that allows the user to select one of these modes. When "system" is selected, the system SHALL apply the operating system or browser preference (light or dark). When "light" or "dark" is selected, the system SHALL apply that theme regardless of system preference. The system SHALL apply the selected theme globally (e.g. by setting a class on the root element or via a theme provider) so that all UI components respect the theme.

#### Scenario: User selects light theme

- **WHEN** the user selects the light theme
- **THEN** the system applies the light theme across the application

#### Scenario: User selects dark theme

- **WHEN** the user selects the dark theme
- **THEN** the system applies the dark theme across the application

#### Scenario: User selects system theme

- **WHEN** the user selects the system theme
- **THEN** the system applies light or dark according to the OS/browser preference and updates when that preference changes

### Requirement: Theme preference is persisted

The system SHALL persist the user's theme preference (light, dark, or system) so that it is restored on the next visit or page load. Persistence SHALL be achieved via client or server storage (e.g. cookie or localStorage). The system SHOULD apply the stored theme as early as possible (e.g. before first paint or via a small script in the document head) to minimize a visible flash of the wrong theme.

#### Scenario: Preference restored on reload

- **WHEN** the user has previously selected a theme and then reloads the page or returns later
- **THEN** the system applies the same theme without requiring the user to select it again

#### Scenario: Preference persists across sessions

- **WHEN** the user selects a theme and closes the browser or navigates away
- **THEN** the system SHALL store the preference so that it is available when the user returns
