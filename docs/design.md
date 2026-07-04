---
name: Academic Core
colors:
  surface: '#fbf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fbf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f4'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e3'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45474c'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#041528'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a2a3e'
  on-tertiary-container: '#8191a9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#fbf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e3'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  table-header:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  stack-gap: 16px
  grid-gutter: 24px
  sidebar-width: 280px
  section-margin: 32px
---

## Brand & Style

The design system is engineered for high-stakes educational environments, prioritizing clarity, trust, and cognitive ease. The brand personality is professional and institutional yet modern, moving away from legacy "academic" clutter toward a streamlined, data-first experience.

The design style follows **Modern Minimalism** with a focus on functional hierarchy. It utilizes a structured layout, generous whitespace, and a sophisticated "Dark Sidebar / Light Content" model to reduce visual noise and anchor the user's navigation. The emotional response should be one of competence and reliability—ensuring administrators and educators feel in control of complex data.

## Colors

The palette is divided into two distinct functional zones:
- **Navigation Zone (Primary):** A deep Navy (#1E293B) is reserved for the sidebar and global navigation elements, providing a strong structural anchor and high contrast for menu items.
- **Action & Workspace (Secondary/Neutral):** A professional Blue (#3B82F6) drives primary actions and focus states. The content area uses a very light Slate gray (#F8FAFC) to minimize glare during long periods of use.

Status indicators (Success, Warning, Danger) follow standard semantic conventions to ensure immediate recognition of student performance or system alerts.

## Typography

This design system utilizes **Inter** exclusively to leverage its exceptional legibility and systematic weight distribution. 

- **Hierarchy:** Use `display-lg` for dashboard overviews and `headline-md` for card titles or section headers.
- **Readability:** Body text is set at `16px` for optimal scanning. For data-dense environments like student rosters or gradebooks, `body-sm` (14px) is the preferred standard.
- **Utility:** Use `label-caps` for small metadata, category tags, and non-interactive descriptors to differentiate them from actionable body text.

## Layout & Spacing

The layout employs a **Fixed Sidebar + Fluid Content** model. 

- **The Grid:** Use a 12-column grid for desktop content areas with 24px gutters. 
- **Rhythm:** A 4px baseline shift is used for all spacing. Standard component padding is `p-6` (24px) for cards and main containers to ensure breathing room around dense data.
- **Mobile Adaptation:** On mobile devices (below 768px), the sidebar collapses into a hamburger menu, and container padding reduces to 16px. Cards stack vertically, occupying 100% of the viewport width minus margins.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layers** and **Ambient Shadows**.

- **Level 0 (Background):** The application background (#F8FAFC) is the lowest layer.
- **Level 1 (Cards/Surface):** The primary workspace uses white (#FFFFFF) surfaces with a subtle 1px border (#E2E8F0) and a soft ambient shadow (0px 1px 3px rgba(0,0,0,0.1)).
- **Level 2 (Modals/Popovers):** Floating elements use a more pronounced shadow (0px 10px 15px -3px rgba(0,0,0,0.1)) to indicate temporary interaction and focus.
- **Active State:** Items being dragged or actively selected should utilize a secondary color glow or a slightly deeper shadow to indicate lifting from the surface.

## Shapes

The shape language is modern and approachable, utilizing `rounded-xl` (1rem / 16px) for major components like cards and main container wrappers. 

- **Buttons & Inputs:** Use a standard `rounded-lg` (0.5rem / 8px) to maintain a crisp, professional appearance that feels cohesive with the larger card radius.
- **Status Badges:** Use fully rounded (pill-shaped) geometry to distinguish them clearly from interactive buttons.

## Components

- **Sidebar:** Deep navy background (#1E293B). Inactive links are slate-400; active links feature a blue-500 left-border accent (4px) and a subtle background highlight (white at 10% opacity).
- **Cards:** White background, `rounded-xl`, 1px border (#E2E8F0), and `p-6` padding. Used for grouping student metrics, schedules, and profile summaries.
- **Tables:** Headers use `table-header` typography with a light gray bottom border. Rows use a subtle hover state (#F1F5F9). Status badges (e.g., "Enrolled", "Late") are pill-shaped with low-opacity background tints of the semantic colors.
- **Buttons:** 
    - *Primary:* Solid #3B82F6 with white text.
    - *Secondary:* Transparent background with a 1px border of #E2E8F0 and text in slate-700.
- **Inputs:** Minimal 1px border (#D1D5DB). On focus, the border transitions to #3B82F6 with a 3px soft blue outer glow.
- **Progress Bars:** Thin 8px tracks using a light gray base and a solid semantic color fill to represent attendance or grade averages.