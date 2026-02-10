# Zelus Design System

## Intent

**Who:** Condominium administrators and residents in Portugal. Non-technical users accessing between errands — on phones or older laptops. Admins after hours approving access, residents checking ticket status.

**Task:** Approve association requests. File and track maintenance tickets. Find supplier contacts. Review history. Practical, operational work.

**Feel:** Trustworthy like a building's front desk — orderly, quiet, competent. The feeling of a well-kept ledger. Warm enough to not feel institutional, structured enough to feel safe.

## Domain

Portuguese residential buildings — limestone facades, azulejo tile patterns, cobalt blue ceramics, iron railings, courtyards behind heavy doors.

## Palette

- **Primary:** Cobalt blue (OKLCH hue ~260) — the blue of Portuguese azulejo tiles
- **Neutrals:** Warm grays — limestone calm
- **Destructive:** Warm red (OKLCH hue ~27)
- All colors defined as OKLCH CSS variables in `app/app.css`
- Light and dark modes supported via `.dark` class

## Depth

- **Borders over shadows** — flat, tiled surfaces like azulejo grout lines
- 1px borders with low-contrast separation (`--border` token)
- No drop shadows on cards or containers
- Depth conveyed through background color shifts between surface levels

## Surfaces

- **Level 0:** `--background` (page)
- **Level 1:** `--card` (cards, panels)
- **Level 2:** `--muted` (nested sections, table headers)
- **Level 3:** `--accent` (hover states, active items)
- Temperature: neutral-cool in light mode, warm-dark in dark mode

## Typography

- **Primary:** Inter (loaded via Google Fonts) — humanist clarity, excellent legibility at small sizes
- Scale follows Tailwind defaults (text-xs through text-4xl)
- Body: text-sm (14px) for density without strain

## Spacing

- **Base unit:** 4px (Tailwind's default)
- Compact but breathable — favor `gap-3` (12px) and `p-4` (16px) for cards
- Dense lists: `gap-2` (8px) between items

## Radius

- Base: `--radius: 0.625rem` (10px)
- Buttons/inputs: `rounded-md` (8px)
- Cards: `rounded-lg` (10px)
- Consistent rounding — never mix sharp and rounded in the same context

## Components

- Built on **shadcn/ui** (base-nova style) + **@base-ui/react** headless primitives
- Variants via **class-variance-authority** (CVA)
- Class merging via `cn()` from `~/lib/utils`
- `data-slot` attributes for styling scopes
- Icons: `@hugeicons/react` + `@hugeicons/core-free-icons`

## Signature Element

Subtle 1px borders with very low-contrast separation — like grout lines between tiles. Clean grid structure that echoes the regularity of apartment blocks. Information-forward, no decorative noise.
