// src/theme/colors.ts
// ─────────────────────────────────────────────────────────────────────────────
// AppColors — Academic Core Design System
// The TypeScript equivalent of Flutter's AppColors class.
// Use these constants anywhere you need raw hex values in JS/TS logic
// (e.g. chart libraries, canvas, dynamic styles).
// For className-based styling, use the Tailwind tokens in tailwind.config.js.
// ─────────────────────────────────────────────────────────────────────────────

export const AppColors = {

  // ── Surface ─────────────────────────────────────────────────────────────────
  surface:                  '#fbf8fa',
  surfaceDim:               '#dcd9db',
  surfaceBright:            '#fbf8fa',
  surfaceContainerLowest:   '#ffffff',
  surfaceContainerLow:      '#f5f3f4',
  surfaceContainer:         '#f0edef',
  surfaceContainerHigh:     '#eae7e9',
  surfaceContainerHighest:  '#e4e2e3',
  surfaceVariant:           '#e4e2e3',
  surfaceTint:              '#545f73',

  // ── On-Surface ──────────────────────────────────────────────────────────────
  onSurface:                '#1b1b1d',
  onSurfaceVariant:         '#45474c',

  // ── Inverse ─────────────────────────────────────────────────────────────────
  inverseSurface:           '#303032',
  inverseOnSurface:         '#f3f0f2',
  inversePrimary:           '#bcc7de',

  // ── Outline ─────────────────────────────────────────────────────────────────
  outline:                  '#75777d',
  outlineVariant:           '#c5c6cd',

  // ── Primary (deep navy — sidebar & structural chrome) ───────────────────────
  primary:                  '#091426',
  primaryContainer:         '#1e293b',
  onPrimary:                '#ffffff',
  onPrimaryContainer:       '#8590a6',
  primaryFixed:             '#d8e3fb',
  primaryFixedDim:          '#bcc7de',
  onPrimaryFixed:           '#111c2d',
  onPrimaryFixedVariant:    '#3c475a',

  // ── Secondary (action blue — CTA buttons, focus, links) ─────────────────────
  secondary:                '#0058be',
  secondaryContainer:       '#2170e4',
  onSecondary:              '#ffffff',
  onSecondaryContainer:     '#fefcff',
  secondaryFixed:           '#d8e2ff',
  secondaryFixedDim:        '#adc6ff',
  onSecondaryFixed:         '#001a42',
  onSecondaryFixedVariant:  '#004395',

  // ── Tertiary (deep navy variant) ────────────────────────────────────────────
  tertiary:                 '#041528',
  tertiaryContainer:        '#1a2a3e',
  onTertiary:               '#ffffff',
  onTertiaryContainer:      '#8191a9',
  tertiaryFixed:            '#d3e4fe',
  tertiaryFixedDim:         '#b7c8e1',
  onTertiaryFixed:          '#0b1c30',
  onTertiaryFixedVariant:   '#38485d',

  // ── Error ───────────────────────────────────────────────────────────────────
  error:                    '#ba1a1a',
  errorContainer:           '#ffdad6',
  onError:                  '#ffffff',
  onErrorContainer:         '#93000a',

  // ── Background ──────────────────────────────────────────────────────────────
  background:               '#fbf8fa',
  onBackground:             '#1b1b1d',

  // ── Semantic Status (badges, alerts, progress) ───────────────────────────────
  // Not in the base Material scheme — added for app-level status indicators.
  statusSuccess:            '#16a34a',
  statusSuccessContainer:   '#dcfce7',
  onStatusSuccess:          '#ffffff',

  statusWarning:            '#d97706',
  statusWarningContainer:   '#fef3c7',
  onStatusWarning:          '#ffffff',

  statusDanger:             '#ba1a1a',   // mirrors error
  statusDangerContainer:    '#ffdad6',
  onStatusDanger:           '#ffffff',

  statusInfo:               '#0058be',   // mirrors secondary
  statusInfoContainer:      '#d8e2ff',
  onStatusInfo:             '#ffffff',

  statusNeutral:            '#45474c',
  statusNeutralContainer:   '#e4e2e3',

  // ── Sidebar (component-level constants) ─────────────────────────────────────
  // Use these directly when building the Sidebar component.
  sidebarBackground:        '#1e293b',   // primary-container
  sidebarInactiveText:      '#8590a6',   // on-primary-container
  sidebarActiveAccent:      '#0058be',   // secondary
  sidebarActiveBg:          'rgba(255, 255, 255, 0.10)',

  // ── Card / Input borders ─────────────────────────────────────────────────────
  cardBorder:               '#e2e8f0',
  inputBorder:              '#d1d5db',
  inputBorderFocus:         '#0058be',   // secondary

} as const

// Derive a union type of all color keys — useful for prop typing
export type AppColorKey = keyof typeof AppColors
