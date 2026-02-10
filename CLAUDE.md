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

### React Router Framework Structure

- **Full-stack framework**: React Router v7 handles both client and server rendering with SSR enabled (`react-router.config.ts`)
- **Type-safe routing**: Generated types from React Router provide end-to-end type safety (`+types/route-name`)
- **Root layout**: `app/root.tsx` contains the `Layout` component (HTML shell) and root `ErrorBoundary`
- **Path alias**: `~/` maps to `./app/` (e.g., `~/components`, `~/lib/utils`)

### Route Configuration

Routes use **Remix flat routes** convention via `remix-flat-routes`. See `app/routes.ts` for config.

**Flat Routes Convention:**

- `+` suffix = folder route (e.g., `tickets+/` becomes `/tickets`)
- `_` prefix on folders = pathless layout route (e.g., `_protected+/`)
- `_modules/` = non-route files (components, utils, models)
- `_layout.tsx` = layout component for nested routes
- `$param` = dynamic segment (e.g., `$id.tsx` → `/tickets/:id`)
- `.` separator = nested path (e.g., `$id.edit.tsx` → `/tickets/:id/edit`)

**Route Structure Example:**

```text
app/routes/
├── _index.tsx                    # / (home)
├── _auth+/                       # Auth routes (no /auth prefix)
│   ├── login.tsx                 # /login
│   └── register.tsx              # /register
└── _protected+/                  # Protected routes (layout only)
    ├── _layout.tsx              # Auth guard
    ├── tickets+/                # /tickets routes
    │   ├── index.tsx            # /tickets
    │   ├── new.tsx              # /tickets/new
    │   └── $id.tsx              # /tickets/:id
    ├── fractions+/              # /fractions routes
    │   ├── index.tsx            # /fractions
    │   └── $id.tsx              # /fractions/:id
    └── suppliers+/              # /suppliers routes
        ├── index.tsx            # /suppliers
        └── $id.tsx              # /suppliers/:id
```

### Route Module Conventions

Each route file can export:

- `default` — The component to render
- `meta` — Function returning meta tags (type: `Route.MetaArgs`)
- `loader` — Server-side data loading (type: `Route.LoaderArgs`)
- `action` — Server-side form handling (type: `Route.ActionArgs`)
- `ErrorBoundary` — Error UI for this route (type: `Route.ErrorBoundaryProps`)

Type safety is provided through auto-generated `+types/route-name` imports.

## Component Organization

```
app/components/
├── ui/           # shadcn/ui primitives — managed by `bunx shadcn`, don't manually edit
├── brand/        # Logo variants, azulejo pattern, brand-specific visuals
├── layout/       # App shell: sidebar, header, footer, page wrappers
└── [feature]/    # Feature-specific shared components (e.g., tickets/, fractions/)
```

Rules:

- **No loose files** in `components/` root — everything goes in a subfolder
- **`ui/`** is shadcn-managed only — do not manually create or edit files there
- Route-specific components stay colocated in `app/routes/` next to their route

## UI & Styling

- **Tailwind CSS v4** configured entirely in `app/app.css` (no `tailwind.config.js`) using `@theme` blocks and CSS variables in OKLCH color space
- **shadcn/ui** with `base-nova` style, built on **@base-ui/react** headless primitives
- **Icons**: `@hugeicons/react` + `@hugeicons/core-free-icons`
- Components use **class-variance-authority** (CVA) for variants, `cn()` from `~/lib/utils` for class merging, and `data-slot` attributes for styling scopes
- Dark mode via `.dark` class

## Code Style

Prettier config (`.prettierrc`): no semicolons, single quotes, trailing commas, print width 100. Pre-commit hook runs `pretty-quick --staged` via simple-git-hooks.

## Planned Stack (from PRD, not yet implemented)

Better Auth (authentication), Drizzle ORM + Postgres (database), Resend (email), Vercel Blob (file uploads), Lingui (i18n — pt-BR and en), deployed on Vercel.

## Git

- Do not include `Co-Authored-By` in commit messages
