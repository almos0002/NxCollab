version: "universal-interface-design"
name: "Universal Interface System"
description: "A compact, premium, interface-first design system that can adapt to any project type. It supports dark default and light themes, dense but readable layouts, modular cards, strong hierarchy, reusable component rules, subtle motion, and consistent token-based styling. The system avoids generic templates, overly decorative layouts, inconsistent spacing, random radii, and hardcoded one-off styles."

stack:
framework: "Framework agnostic"
recommended_usage:

- "Works with TanStack Start, Next.js, Remix, Astro, Vite, React, Vue, Svelte, or any modern frontend stack"
- "Use file-based routing if available"
- "Use reusable components and design tokens"
- "Never hardcode visual values inside individual components"

colors:
primary: "#E11D48"
primary-hover: "#BE123C"
primary-contrast: "#FFFFFF"

secondary: "#0C0C0E"
accent: "#E11D48"

background: "#0C0C0E"
surface: "#18181B"
surface-muted: "#111113"
surface-hover: "#202024"

text-primary: "#FFFFFF"
text-secondary: "#A1A1AA"

border: "#27272A"
border-strong: "#3F3F46"

light:
background: "#FFFFFF"
surface: "#F8F9F9"
surface-muted: "#FCFCFC"
surface-hover: "#F1F1F3"
text-primary: "#0C0C0E"
text-secondary: "#52525B"
border: "#DDDDE2"
border-strong: "#C4C4CB"
primary-soft: "#FFF1F2"
primary-border: "#FDA4AF"

dark:
primary-soft: "#2A1017"
primary-border: "#E11D48"

overlay:
background: "#0C0C0E"
text: "#FFFFFF"
note: "Always-dark overlay tokens for labels, badges, and controls placed on visual or media surfaces. Do not invert these with theme."

typography:
display-lg:
fontFamily: "Poppins"
fontSize: "56px"
fontWeight: 600
lineHeight: "1.05"
letterSpacing: "-0.03em"

heading-lg:
fontFamily: "Poppins"
fontSize: "32px"
fontWeight: 600
lineHeight: "1.15"
letterSpacing: "-0.025em"

heading-md:
fontFamily: "Poppins"
fontSize: "24px"
fontWeight: 600
lineHeight: "1.2"
letterSpacing: "-0.02em"

body-md:
fontFamily: "Poppins"
fontSize: "15px"
fontWeight: 400
lineHeight: "1.65"

body-sm:
fontFamily: "Poppins"
fontSize: "13px"
fontWeight: 400
lineHeight: "1.5"

label-md:
fontFamily: "Poppins"
fontSize: "12px"
fontWeight: 600
lineHeight: "1.2"
letterSpacing: "0.02em"

label-xs:
fontFamily: "Poppins"
fontSize: "10px"
fontWeight: 600
lineHeight: "1.2"
letterSpacing: "0.06em"
textTransform: "uppercase"

spacing:
base: "8px"
gap-xs: "8px"
gap-sm: "12px"
gap-md: "16px"
gap-lg: "24px"
gap-xl: "32px"
card-padding: "16px"
panel-padding: "20px"
section-padding: "64px"

rounded:
card: "14px"
control: "10px"
chip: "8px"
pill: "9999px"
note: "Use this radius scale everywhere. Cards, tables, modals, and panels use rounded-card. Inputs, buttons, selects, and filters use rounded-control. Badges, chips, icon buttons, and small inner controls use rounded-chip. Pills are only for fully rounded tabs or special compact controls."

components:
card:
background: "Use surface token"
border: "1px solid border token"
radius: "rounded-card"
padding: "card-padding"
behavior: "Subtle hover lift, border highlight, and clean transition"

panel:
background: "Use surface or surface-muted depending on hierarchy"
border: "1px solid border token"
radius: "rounded-card"
behavior: "Used for grouped information, dashboards, settings, forms, details, and admin views"

button:
primary:
background: "primary"
text: "primary-contrast"
hover: "primary-hover"
secondary:
background: "surface-hover"
text: "text-primary"
border: "border"
ghost:
background: "transparent"
text: "text-secondary"
hover: "surface-hover"
radius: "rounded-control or rounded-pill depending on context"

badge:
shape: "rounded-chip"
size: "uppercase 10px, px-2 py-1, ring-1"
usage: "Status, category, role, tag, metadata, filter state"
behavior: "Always use shared Badge component. Never hand-build badges."

input:
background: "surface"
border: "border"
focus: "primary-border"
radius: "rounded-control"
text: "text-primary"
placeholder: "text-secondary"

table:
background: "surface"
border: "border"
row-hover: "surface-hover"
radius: "rounded-card"
density: "Compact but readable"

modal:
background: "surface"
border: "border"
radius: "rounded-card"
shadow: "Subtle, not heavy"
behavior: "Clear title, compact body, strong primary action"

---

# Universal Interface System

## Overview

This design system creates a compact, premium, interface-first visual language that can be used for any type of project.

It works for:

- SaaS products
- Dashboards
- Admin panels
- Marketplaces
- AI tools
- Developer tools
- Content platforms
- Portfolios
- Product directories
- E-commerce interfaces
- Internal tools
- Community platforms
- Finance or analytics apps
- Project management systems
- Learning platforms
- Any custom web application

The system should feel structured, sharp, modern, and intentional. It should not feel like a generic template.

The design must adapt to the project’s actual content, but the visual language must stay consistent: compact layout, strong hierarchy, reusable cards, clean surfaces, token-based colors, restrained motion, and precise spacing.

## Core Design Direction

The interface should feel like a premium operating system for the project.

Preserve:

- Interface-first composition
- Dense but readable layout
- Modular cards and panels
- Dashboard-style visual rhythm
- Strong information hierarchy
- Clean dark and light themes
- Consistent spacing and radius tokens
- Compact controls and filters
- Subtle motion
- Crisp borders and surface layering

Avoid:

- Generic landing-page templates
- Random card styles
- Inconsistent border radius
- Overly decorative sections
- Huge empty hero areas
- Cartoon styling
- Magazine-style layouts unless the project specifically needs editorial design
- Large images as the main identity unless the project is image/media-first
- Hardcoded colors, spacing, or one-off UI values

## Domain Adaptation Rules

This file must work for any project. Replace the domain nouns based on the actual product.

Examples:

- For a SaaS app: entity = workspace, project, user, report, task
- For a marketplace: entity = product, vendor, order, collection
- For a content app: entity = post, story, video, article, author
- For a portfolio: entity = project, case study, skill, testimonial
- For an admin panel: entity = user, record, transaction, ticket
- For an AI tool: entity = prompt, workflow, generation, model, output
- For a finance app: entity = account, transaction, invoice, metric

Do not force one fixed layout onto every project. Use the same design language, but adapt the content structure to the project’s purpose.

## Page Types

Every project should be built from reusable page patterns.

Recommended page types:

- Home / Overview
- Listing / Browse page
- Detail page
- Search page
- Create / Edit page
- Dashboard page
- Settings page
- Profile / Account page
- Admin page
- Analytics / Reports page
- Auth pages
- Empty states
- Error states

Each page should feel like part of the same interface system.

## Layout System

Use compact layouts with clear hierarchy.

Desktop:

- Use 12-column or flexible grid layout
- Use compact top navigation or side navigation depending on project complexity
- Use 3–4 column grids for dense listing pages
- Use 2-column layouts for detail pages when metadata or controls are needed
- Use dashboard panels for stats, activity, settings, and management screens

Tablet:

- Use 2–3 column grids
- Collapse sidebars into compact drawers or top filters
- Preserve card density without making content cramped

Mobile:

- Use 1-column layout by default
- Use 2-column compact grids only when cards are simple
- Keep controls sticky only when useful
- Avoid oversized mobile hero sections

## First Viewport Rules

The first viewport should immediately communicate the project’s purpose without wasting space.

Recommended structure:

1. Compact navigation
2. Small title or project header
3. Primary action or search/filter controls
4. Main content grid, dashboard summary, or product module
5. Optional compact featured panel or status module

Avoid:

- Oversized marketing hero blocks
- Empty visual space
- Huge decorative illustrations
- Generic “Welcome to...” sections
- Large cards that push useful content below the fold

## Cards and Content Blocks

Cards are the core building block of the system.

Use cards for:

- Products
- Posts
- Videos
- Projects
- Tools
- Tasks
- Users
- Orders
- Reports
- Files
- Metrics
- Collections
- Any repeatable entity

Each card should include only the most useful scan information.

Recommended card anatomy:

- Small label, category, or type
- Main title
- Short description or key metadata
- Secondary metadata row
- Optional small action
- Optional icon, tiny thumbnail, or symbolic accent

Avoid:

- Huge thumbnails unless the project is media-first
- Too many badges
- Long descriptions
- Random icon backgrounds
- Different card radius values
- Overly rounded entertainment-style cards
- Mixed card styles on the same page

## Listing Pages

Listing pages should feel dense, fast, and easy to scan.

Recommended structure:

- Compact page heading
- Search input
- Filter chips or segmented controls
- Optional slim filter rail
- Entity grid or table
- Pagination or infinite loading
- Empty state
- Sort controls when needed

Grid rules:

- Desktop: 3–4 columns depending on card complexity
- Tablet: 2–3 columns
- Mobile: 1 column, or 2 columns for very compact cards

Use tables when precision matters.

Use grids when discovery matters.

## Detail Pages

Detail pages should feel focused and structured.

Recommended layout:

- Compact top bar
- Main content area
- Metadata panel
- Action group
- Related items section
- Activity/history if relevant
- Previous/next or back navigation if useful

For content-heavy detail pages:

- Keep reading width comfortable
- Use clear typography hierarchy
- Keep controls accessible but not distracting
- Avoid oversized author/profile/product blocks above the main content

For data-heavy detail pages:

- Use panels, stat tiles, tables, and grouped metadata
- Prioritize scannability
- Keep actions visible
- Use tabs only when they simplify complexity

## Dashboard Pages

Dashboards should be compact, modular, and information-first.

Use:

- Stat tiles
- Activity panels
- Tables
- Charts
- Compact filters
- Recent items
- Alerts
- Quick actions

Dashboard rules:

- Keep stat tiles visually consistent
- Use the same card radius and border treatment
- Avoid loud gradients
- Avoid decorative chart colors
- Use primary color only for important data emphasis
- Keep data density high but readable

## Forms and Inputs

Forms should feel precise and calm.

Use:

- Clear labels
- Compact input spacing
- Helpful descriptions only when needed
- Inline validation
- Grouped form sections
- Sticky submit actions for long forms when helpful

Avoid:

- Oversized inputs
- Random spacing between fields
- Multiple competing primary buttons
- Decorative form backgrounds
- Hiding important errors

## Navigation

Navigation should be compact and predictable.

Good patterns:

- Top nav for simple projects
- Sidebar for complex apps
- Command/search bar for power-user tools
- Breadcrumbs for nested pages
- Tabs for related views
- Segmented controls for compact state switching

Active state:

- Use neutral selected background
- Use primary color as a small active indicator
- Keep text readable
- Do not turn every active label red

## Search and Filters

Search and filtering should be treated as core UI, not afterthoughts.

Use:

- Compact search input
- Filter chips
- Sort dropdown
- Segmented controls
- Saved filters if useful
- Clear empty states
- Clear active-filter state

Avoid:

- Large filter sections that dominate the page
- Hidden filters that are hard to discover
- Too many badge styles
- Inconsistent chip spacing

## Color and Component Conventions

The brand color is used with restraint.

Use primary color for:

- Primary buttons
- Links
- Focus rings
- Active indicators
- Progress bars
- Small accent marks
- Important chart highlights
- Destructive actions when red is the danger color

Do not overuse primary color.

Avoid:

- Full red backgrounds everywhere
- Primary-soft chips on dark surfaces
- Random alpha values
- Mixing multiple accent colors without reason
- Hardcoded hex values inside components

Component rules:

### Icons

Default icons should be neutral.

Use primary-colored icons only for:

- Active navigation indicators
- Important metrics
- Primary actions
- Destructive actions
- Brand-specific highlights

Do not place every icon inside a colored chip.

### Avatars

Identity avatars may use solid primary fill:

- `bg-primary`
- `text-primary-contrast`

Use this only for user, team, organization, or identity markers.

### Badges

Badges must use alpha-tinted styling:

- `text-color`
- `bg-color/10`
- `ring-color/25`
- `rounded-chip`
- `uppercase`
- `text-[10px]`
- `px-2 py-1`
- `ring-1`

All badges must come from one shared Badge component.

### Active Navigation

Active navigation uses:

- Neutral selected background
- Primary-filled icon chip or small primary indicator
- Stronger label weight
- Normal text color

Do not make the whole active item bright red.

### Destructive Actions

Use primary/danger treatment:

- Icon in danger color
- Soft danger hover
- Clear label
- Confirmation for irreversible actions

### Inline Messages

Use alpha-tinted alert styling:

- `border-primary/30`
- `bg-primary/10`
- `text-primary`

Never use muddy soft fills on dark mode.

## Theme Rules

Dark mode is the native mood.

Light mode must be a true counterpart, not a weaker version.

Both themes must preserve:

- Same density
- Same hierarchy
- Same spacing
- Same component structure
- Same primary color
- Same radius scale
- Same motion language

Do not create separate component designs for dark and light mode. Only tokens should change.

## Motion

Motion should be subtle and premium.

Use motion for:

- Hover lift
- Border glow
- Smooth dropdown reveal
- Modal entrance
- Tab transition
- Progress update
- Skeleton loading
- Small content reveal

Avoid:

- Bouncy animation
- Cartoon motion
- Large animated backgrounds
- Excessive parallax
- Distracting hover effects
- Motion that slows down usability

## Scrollbars

Scrollbars should be thin and themed.

WebKit:

- 8px track
- Transparent track
- Thumb uses `border-strong`
- 2px transparent inset via `background-clip: padding-box`
- Thumb brightens to `text-secondary` on hover

Firefox:

- `scrollbar-width: thin`
- Use matching thumb and track tokens

Use `scrollbar-gutter: stable` so layout does not shift.

## Accessibility

All components must be usable and readable.

Requirements:

- Text must meet WCAG contrast rules
- Icons, badges, and controls must meet at least 3:1 contrast against adjacent colors
- Focus states must be visible
- Interactive elements must have clear hover/focus/active states
- Do not rely only on color to show state
- Buttons and links must have accessible labels
- Forms must show readable validation messages
- Motion should respect reduced-motion preferences

## Implementation Rules

Use design tokens for every visual value.

Do not hardcode:

- Colors
- Border radius
- Font sizes
- Spacing
- Shadows
- Border colors
- Badge styles
- Button styles

Use shared components for:

- Button
- Card
- Badge
- Input
- Select
- Modal
- Table
- Tabs
- Dropdown
- Tooltip
- Avatar
- Empty state
- Page header
- Section header
- Filter chip
- Stat tile

If a component appears more than once, it should be reusable.

## Guardrails

- Do not make the project look like a generic template.
- Do not use random radius values.
- Do not hardcode hex colors in components.
- Do not create one-off button styles.
- Do not create one-off badges.
- Do not overuse the primary color.
- Do not make dark mode muddy.
- Do not make light mode feel empty.
- Do not use huge hero sections unless the project specifically requires marketing emphasis.
- Do not use large images as the main identity unless the project is image-first.
- Do not mix multiple visual systems.
- Do not use cartoon styling unless explicitly required.
- Do not use magazine/editorial layout unless explicitly required.
- Do not flatten everything into plain cards.
- Do not ignore spacing, border, and radius consistency.
- Do not let generated UI invent new styles outside the token system.

## Visual Goal

The final project should feel custom, compact, structured, premium, and interface-first.

It should look like a serious product system, not a generic website template.

Dark mode should feel native, sharp, and controlled.

Light mode should feel equally precise, clean, and usable.

Every project built with this design system should adapt to its own content while preserving the same visual discipline: consistent tokens, compact hierarchy, reusable components, restrained color, and strong information structure.
