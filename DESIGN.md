---
name: DatCorr
description: Institutional records management platform — permission-gated multi-database interface
colors:
  dark-slate: "#0f172a"
  dark-slate-mid: "#1e293b"
  cerulean: "#0284c7"
  cerulean-glow: "#e0f2fe"
  page-bg: "#f3f4f6"
  card-bg: "#ffffff"
  text-main: "#111827"
  text-muted: "#6b7280"
  border-subtle: "#d1d5db"
  sidebar-bg: "#222433"
  topbar-bg: "#646363"
  success-green: "#16a34a"
  warning-amber: "#d97706"
  danger-red: "#dc2626"
typography:
  body:
    fontFamily: "'Open Sans', system-ui, -apple-system, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Open Sans', system-ui, -apple-system, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    lineHeight: 1.4
  display:
    fontFamily: "'Open Sans', system-ui, -apple-system, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.5px"
  title:
    fontFamily: "'Open Sans', system-ui, -apple-system, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  card: "16px"
  input: "8px"
  sidebar-item: "6px"
  avatar: "50%"
  small: "4px"
spacing:
  page: "24px"
  card: "24px"
  section: "32px"
  tight: "8px"
  group: "16px"
components:
  button-primary:
    backgroundColor: "{colors.dark-slate}"
    textColor: "#ffffff"
    rounded: "{rounded.input}"
    padding: "14px 16px"
    fontWeight: 600
  button-primary-hover:
    backgroundColor: "{colors.dark-slate-mid}"
    textColor: "#ffffff"
    rounded: "{rounded.input}"
    padding: "14px 16px"
    fontWeight: 600
  nav-sidebar-item:
    backgroundColor: "transparent"
    textColor: "#ffffff"
    rounded: "{rounded.sidebar-item}"
    padding: "10px 12px"
  nav-sidebar-item-active:
    backgroundColor: "#4db53f3b"
    textColor: "#ffffff"
    rounded: "{rounded.sidebar-item}"
    padding: "10px 12px"
  input-outlined:
    backgroundColor: "#f8fafc"
    textColor: "{colors.text-main}"
    rounded: "{rounded.input}"
    padding: "12px 16px"
    borderColor: "#e2e8f0"
  input-outlined-focus:
    backgroundColor: "#ffffff"
    textColor: "{colors.text-main}"
    rounded: "{rounded.input}"
    padding: "12px 16px"
    borderColor: "{colors.cerulean}"
  avatar-circle:
    backgroundColor: "#3f51b5"
    textColor: "#ffffff"
    rounded: "{rounded.avatar}"
    size: "36px"
  card-container:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.text-main}"
    rounded: "{rounded.card}"
    padding: "24px"
---

# Design System: DatCorr

## Overview

**Creative North Star: "The Institutional Vault"**

DatCorr presents itself as a secure, authoritative, and calm records management environment. The design language communicates institutional trustworthiness — the digital equivalent of a government records facility where data is protected through professional restraint.

The system operates in **light mode exclusively** (dark mode is disabled in code — the government-design context requires consistent light presentation). It uses two visual registers: the **auth surfaces** (login, registration) employ a dramatic dark gradient with animated constellation data-flow visuals to signal security and technological sophistication, while the **app interior** (dashboard, database browsing, user management) uses a clean light layout with a persistent dark sidebar and neutral top bar. The contrast between these two registers reinforces the transition from "outside" to "inside" the vault.

Typography is utilitarian and legible. Color is used sparingly — the Dark Slate / Cerulean palette provides authority with tech-forward accent moments. Layout favors dense, data-rich screens with clear hierarchy. Micro-elevation (subtle shadows) is used sparingly, mostly on interactive surfaces.

**Key Characteristics:**
- Light mode only, government-institutional context
- Two visual registers: dark auth surfaces / light app interior
- Persistent dark sidebar (`#222433`) anchors navigation
- Cerulean accent for interactive, focused, and active states
- Data-rich: DataGrid tables, KPI cards, structured forms
- Motion is functional: hover transitions, loading spinners, data pulse animations on login
- No glass, no gradient text, no decorative blur

## Colors

The palette is derived from a dark-slate institutional base with a cerulean technological accent.

### Primary
- **Dark Slate** (`#0f172a`): Primary button backgrounds, login gradient base, form titles, strong text. Conveys authority and stability.
- **Dark Slate Mid** (`#1e293b`): Hover states, TOPBAR background, login panel gradient end. One step lighter for surface distinction.

### Accent
- **Cerulean** (`#0284c7`): Interactive accent — focused input borders, link text, active tab indicator, constellation animation color, node value highlights. The "tech in the vault" signal.
- **Cerulean Glow** (`#e0f2fe`): Focus ring backgrounds, subtle highlight fills. Used where Cerulean needs a soft backing.

### Neutral
- **Page BG** (`#f3f4f6`): App interior page background. The canvas behind all cards.
- **Card BG** (`#ffffff`): Card, panel, and container surfaces. Primary content background.
- **Text Main** (`#111827`): Body text, headings, table content. High contrast on white.
- **Text Muted** (`#6b7280`): Secondary text, placeholders, metadata, labels, tab inactive states.
- **Border Subtle** (`#d1d5db`): Table borders, card borders, divider lines.

### Surface Colors
- **Sidebar BG** (`#222433`): The persistent left navigation. Dark enough to recede, light enough to read white text on.
- **TopBar BG** (`#646363`): The top navigation bar. A neutral gray that bridges sidebar and content.

### Semantic
- **Success Green** (`#16a34a`): Positive indicators, status dots, confirmation cues.
- **Warning Amber** (`#d97706`): Caution states, pending indicators.
- **Danger Red** (`#dc2626`): Destructive actions (delete, critical errors).

### Named Rules
**The Monochrome Interior Rule.** Inside the app, color is reserved for interactive states (Cerulean), semantic signals (green/amber/red), and the active sidebar item (green-tinted). Backgrounds remain grayscale. The rarity of color is what gives it meaning.

**The Vault-Entry Rule.** Auth surfaces (login, registration, password reset) use the dark gradient + animated constellation treatment. This visual register is exclusive to unauthenticated entry points. Once inside, the light interior takes over.

## Typography

**Body Font:** Open Sans (with system-ui fallback)

The system uses a single humanist sans-serif stack. Open Sans provides excellent legibility at small sizes for dense data tables while remaining approachable for form labels and headings. MUI components inherit the system font stack when Open Sans is unavailable.

**Character:** Straightforward and utilitarian. No display faces, no decorative weights. Typography recedes in favor of data clarity.

### Hierarchy
- **Display** (700, 1.75rem, 1.2, -0.5px): Login form titles, section welcome headings. Rare — used only for the most prominent single heading on a surface.
- **Title** (600, 1.1rem, 1.3): Card titles, section headers within the app interior. The default "heading" level.
- **Body** (400, 0.95rem, 1.6): Paragraph text, table cell content, descriptive text. Max line length is unconstrained (data displays).
- **Label** (600, 0.85rem, 1.4): Form labels, sidebar section headers, table header text. Bold at small size for scanability.
- **Small** (400, 0.75–0.8rem, 1.4): Metadata, timestamps, secondary info, trust footer text.

### Named Rules
**The Data-Over-Design Rule.** Body copy in data tables, KPI values, and record content is never styled for decorative effect. Font weight, size, and color carry semantic meaning only.

## Layout

The app uses a fixed-sidebar layout with a top navigation bar.

- **Sidebar:** Fixed 220px wide, full viewport height. Contains navigation menu, user profile card, and theme/logout controls. Scrolls independently.
- **TopBar:** Fixed 56px height, spans full width minus sidebar. Holds primary navigation buttons, "Acerca" dropdown, user avatar, and logout button.
- **Main Content:** Positioned below TopBar and to the right of Sidebar. Padded at 24px (top: 80px to clear fixed TopBar). Background: `#f3f4f6`.
- **Login Layout:** Centered two-column grid, max 1000px, min 600px height. Collapses to single column at 768px (brand panel hidden).

Spacing rhythm follows an 8px grid: 8px (tight), 16px (group), 24px (card/page), 32px (section). Cards and sections use consistent internal padding of 24px.

## Elevation & Depth

The system uses **micro-elevation** — shadows are present but intentionally subdued.

- **Login card:** `0 20px 40px rgba(0,0,0,0.3)` combined with `0 1px 3px rgba(0,0,0,0.1)` — the most dramatic shadow in the system, reserved for the vault's entry point.
- **Interactive elements:** Hover states lift buttons `1px` with `box-shadow: 0 4px 12px rgba(15,23,42,0.15)`.
- **Dropdown menus:** `0 4px 12px rgba(0,0,0,0.2)` — light separation from the surface below.
- **Everything else:** Flat. Cards separate from the page background (`#f3f4f6`) via tonal contrast rather than shadows.

### Named Rules
**The Flat-By-Default Rule.** Surfaces inside the app are flat at rest. Shadows appear only as a response to state (hover, focus, active) or on the login card as a deliberate threshold signal.

## Shapes

Corner language is geometric and consistent:

- **Cards / Dialogs:** 16px radius — the largest radius, used on the login card, modals, and large containers.
- **Inputs / Buttons / Selects:** 8px radius — the standard interactive control shape.
- **Sidebar items:** 6px radius — slightly softer than inputs, distinct from cards.
- **TopBar buttons / Small controls:** 4px radius — the smallest radius, for compact UI elements.
- **Avatars:** 50% radius — circular user representation.

All borders are 1px solid. The system avoids pill shapes, decorative borders, and colored side borders.

## Components

### Buttons

- **Shape:** Rounded corners (8px). No uppercase transform (MUI override: `textTransform: "none"`).
- **Primary (Login):** Dark Slate (`#0f172a`) background, white text, full-width, 14px padding. Hover lifts 1px with shadow, transitions in `0.3s cubic-bezier(0.4,0,0.2,1)`. Disabled state: `#cbd5e1` background, `#94a3b8` text, cursor not-allowed.
- **TopBar buttons:** Transparent background, white text, 10px 14px padding, 4px radius. Active page: `#424147` background.
- **Ghost/Link (form links):** Cerulean (`#0284c7`) text, no border, 500 weight, underline on hover. Reserved for "Forgot password" and "Register" links.

### Cards / Containers

- **Corner Style:** 16px radius on auth card and dialog paper; 8px default MUI paper.
- **Background:** White (`#ffffff`) for light mode.
- **Shadow Strategy:** Micro-elevation on login card and interactive states only. Flat at rest.
- **Border:** None or 1px solid `#e2e8f0` (subtle).
- **Internal Padding:** 24px standard, 48px on login panels, 16px for compact cards.

### Inputs / Fields

- **Style:** Outlined. Background `#f8fafc`, border `1px solid #e2e8f0`, 8px radius. Internal padding `12px 16px`.
- **Focus:** Background shifts to white, border to Cerulean (`#0284c7`), 4px glow ring in Cerulean Glow (`#e0f2fe`).
- **Label:** 600 weight, 0.85rem, Dark Slate (`#0f172a`). Floats above input (MUI default behavior).
- **Error:** Red border + background tint (`#fef2f2`), left red accent bar on error boxes.
- **Disabled:** N/A.

### DataGrid (MUI X)

- **Style:** White background, full-width, sort icons always visible.
- **Header:** `#f9fafb` background, 700 weight, 13px font, 2px bottom border.
- **Rows:** White background, hover tint `rgba(37,99,235,0.04)`, selected tint `rgba(37,99,235,0.10)`. Cell borders: 1px solid `#d1d5db`.
- **Footer:** `#f9fafb` background, 2px top border.
- **Dark mode equivalent** uses `#363652` header/footer and cooler hover tints — but dark mode is not active.

### Navigation (Sidebar)

- **Style:** Stacked vertical menu in `#222433` panel. 220px fixed width.
- **Typography:** 14px, white text, 10px 12px padding, 6px radius.
- **Active state:** Green-tinted background (`#4db53f3b`). Not a full green fill — a translucent wash that signals "you are here" without overwhelming.
- **Hover state:** Light tint (`#2a2a3d` background).
- **Sections:** "DATCORR" heading (16px, letter-spaced), divider lines (1px `#333`), "SiMCo" subheading (12px, uppercase, muted).
- **User Card:** Darker insert (`#2a2a3d`), 8px radius, avatar circle + name + role.

### Navigation (TopBar)

- **Style:** Horizontal button row in `#646363` bar. Fixed 56px height.
- **Buttons:** Transparent, white text, 16px, active has `#424147` background.
- **Mobile:** Hidden hamburger menu (`display: none`) — not yet active.
- **Dropdown:** `#373838` background, 4px radius, `1px solid #334155`, shadow.

### User Avatar

- **Style:** Circular, `#3f51b5` background (indigo — distinct from the Dark Slate palette as a personal identifier).
- **Size:** 36px (sidebar), 28px (topbar).
- **Text:** White, 700 weight, single initial uppercase.

### KPI Cards (Dashboard)

- **Style:** Horizontal card with icon (single letter, large), label, value, and optional subtext/details.
- **Icon:** 40px colored circle (iconBg + iconColor) — per-card color coding (blue for bases, green for records, purple for users).
- **Value:** Large bold number, main visual weight.
- **Sub:** Muted description below value.

### Tabs (Database Page & System)

- **Style:** MUI Tabs. Inactive: Muted text (`#6b7280`). Active: Cerulean (`#0284c7`). Underline indicator follows active tab.
- **Close button:** X icon on each tab (except first).

## Do's and Don'ts

### Do:
- **Do** use Dark Slate (`#0f172a`) for all primary action buttons and authoritative text.
- **Do** use Cerulean (`#0284c7`) exclusively for interactive/focused states and links.
- **Do** keep card surfaces flat with tonal separation from `#f3f4f6` page background.
- **Do** use a 1px lift on button hover with a matching shadow for tactile feedback.
- **Do** maintain the two-register system: dark gradient for auth, light interior for the app.
- **Do** prefer MUI DataGrid for all tabular data with sort icons always visible.

### Don't:
- **Don't** enable dark mode — the government context requires light-only presentation.
- **Don't** use gradient text, glass effects, or blur as decoration.
- **Don't** add colored left/right borders to cards or list items.
- **Don't** use uppercase transforms on buttons (MUI override is intentional).
- **Don't** introduce pill-shaped components — use 8px radius for inputs/buttons, 16px for cards.
- **Don't** add motion for decoration — transitions serve state changes only.
- **Don't** invent components the system doesn't have — document only what exists.
