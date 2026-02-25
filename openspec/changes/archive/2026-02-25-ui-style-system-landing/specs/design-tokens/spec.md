## ADDED Requirements

### Requirement: Brand tokens via CSS variables and Tailwind

The system SHALL define brand color tokens as CSS custom properties in globals.css: `:root` for light theme (e.g. --brand-bg, --brand-panel, --brand-border, --brand-text, --brand-muted) and `.dark` for dark theme (same keys, concert/navy values). The Tailwind theme SHALL reference these variables (e.g. colors.brand.bg: "var(--brand-bg)") and SHALL include primary and primaryHover (e.g. hex values). The system SHALL support dark mode via class (darkMode: "class") so the theme provider toggles modes by changing the class on html; components SHALL not need dark: variants for brand colors. Border radius, box shadow, and backdrop blur SHALL be defined in the theme (e.g. xl, 2xl, soft, glass).

#### Scenario: Components can reference brand colors

- **WHEN** a component uses Tailwind classes that reference the extended theme (e.g. bg-brand-bg, text-brand-text)
- **THEN** the rendered styles use the CSS variable values for the active theme

#### Scenario: Theme responds to dark class

- **WHEN** the html element has class "dark" (or "light")
- **THEN** the applied token values correspond to the active theme (dark or light) without component changes

### Requirement: Global CSS provides base background and glass utility

The system SHALL set html and body to full height (e.g. height: 100%). The system SHALL define a default body background (e.g. radial gradients plus a base color) that matches the concert/gradient reference style. The system SHALL provide a utility class (e.g. .glass) that applies a semi-transparent background, a subtle border, and backdrop-filter blur so panels and cards can use a consistent glass look. Light mode SHALL override body background and glass values as needed so the look is correct when the light theme is active.

#### Scenario: Body has gradient background

- **WHEN** the user loads any page in the default (dark) theme
- **THEN** the body displays the defined gradient and base background

#### Scenario: Glass class applies panel style

- **WHEN** an element has the glass utility class applied
- **THEN** the element displays with the defined translucent background, border, and backdrop blur
