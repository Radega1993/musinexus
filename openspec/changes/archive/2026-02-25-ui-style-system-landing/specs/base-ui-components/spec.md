## ADDED Requirements

### Requirement: Button component uses tokens and supports variants

The system SHALL provide a Button component that uses the design tokens (colors, radius, shadow as defined). The Button SHALL support at least primary and secondary variants and SHALL support size variants (e.g. default and large). The Button SHALL render with consistent hover and focus styles so buttons look the same across landing, auth, and app pages.

#### Scenario: Primary button uses brand primary

- **WHEN** a primary Button is rendered
- **THEN** it uses the brand primary color (and primaryHover on hover) and matches the token system

#### Scenario: Secondary and size variants work

- **WHEN** a secondary or large Button is rendered
- **THEN** it uses the appropriate variant styles from the token system without ad-hoc colors

### Requirement: Card component supports glass variant

The system SHALL provide a Card component that can render as a default card or with a glass variant (using the .glass style or equivalent token-based panel look). The Card SHALL use the shared border radius and spacing so cards look consistent across the app.

#### Scenario: Glass card matches panel style

- **WHEN** a Card with glass variant is rendered
- **THEN** it displays with the translucent background, border, and backdrop blur defined in the design tokens

### Requirement: Container component provides standard layout

The system SHALL provide a Container component that applies a single standard layout for all pages: centered (mx-auto), full width up to a maximum of 1200px (max-w-[1200px]), and responsive horizontal padding (e.g. px-4 sm:px-6 lg:px-8). The Container SHALL be used on landing, auth, and app content so every page shares the same visual width and padding.

#### Scenario: Container constrains content width

- **WHEN** content is wrapped in Container
- **THEN** the content does not exceed 1200px and has consistent responsive horizontal padding

### Requirement: AppHeader uses tokens and includes nav and theme toggle

The system SHALL provide or refactor an AppHeader component that uses the design tokens (and optionally glass or minimal bar style). The AppHeader SHALL include navigation links and the theme toggle. The AppHeader SHALL be the same component used to show the shell on app routes (visibility rules are defined elsewhere).

#### Scenario: Header uses token-based styling

- **WHEN** the AppHeader is rendered on an app route
- **THEN** it uses the design tokens for background, border, and text so it matches the rest of the style system

#### Scenario: Header includes theme toggle

- **WHEN** the user views the AppHeader
- **THEN** the theme toggle (light/dark/system) is visible and functional
