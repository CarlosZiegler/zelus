# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Zelus is an internal condominium management system for residential condominiums in Portugal, built with React Router v7 in framework/SSR mode. See `docs/PRD.md` for full product requirements.

## Commands

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run start        # Serve production build (react-router-serve)
bun run typecheck    # Generate route types + tsc
```

Add shadcn/ui components with `bunx shadcn@latest add [component-name]`.

## Troubleshooting

If `react-router typegen` gets stuck or fails with esbuild errors, remove `node_modules` and reinstall:

```bash
rm -rf node_modules && bun install
```

## Architecture

- **React Router v7** framework mode with SSR (`react-router.config.ts`)
- **Type-safe routing** via generated `+types/route-name` imports
- **Path alias**: `~/` maps to `./app/`
- **Remix flat routes** convention via `remix-flat-routes` (see `app/routes.ts`)
  - `+` suffix = folder route, `_` prefix = pathless layout, `$param` = dynamic segment
  - `_layout.tsx` = layout component, `_modules/` = non-route files

### Route Modules

Each route file can export: `default` (component), `meta`, `loader`, `action`, `ErrorBoundary`. Types from `+types/route-name`.

## Component Organization

```
app/components/
├── ui/           # shadcn/ui primitives — managed by `bunx shadcn`, don't manually edit
├── brand/        # Logo, azulejo pattern, CardLink — brand identity components
├── layout/       # App shell: sidebar, header, page wrappers
└── [feature]/    # Feature-specific shared components
```

- **No loose files** in `components/` root — everything in a subfolder
- **`ui/`** is shadcn-managed — do not manually create files there
- Route-specific components stay colocated in `app/routes/`

## UI & Styling

**Read `.interface-design/system.md` before making any UI changes.** It documents the full design system: palette, typography, spacing, radius, sizing, accessibility rules, and brand components.

Key facts:

- **shadcn/ui `base-maia`** style + **@base-ui/react** headless primitives
- **Tailwind CSS v4** with OKLCH color variables in `app/app.css`
- **Icons**: `@hugeicons/react` + `@hugeicons/core-free-icons`
- **Target audience**: elderly, non-technical users — h-10 buttons/inputs, no text-xs, 4.5:1+ contrast

## Code Style

Prettier: no semicolons, single quotes, trailing commas, print width 100. Pre-commit hook runs `pretty-quick --staged`.

## Git

- Do not include `Co-Authored-By` in commit messages
