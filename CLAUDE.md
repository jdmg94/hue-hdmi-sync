# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server on port 3000
pnpm build        # Production build
pnpm test         # Run tests with Vitest
pnpm check        # Biome lint + format check (run before committing)
pnpm lint         # Biome lint only
pnpm format       # Biome format only
```

To run a single test file:
```bash
pnpm vitest run src/path/to/file.test.ts
```

Add Shadcn components:
```bash
pnpm dlx shadcn@latest add <component-name>
```

## Architecture

This is a **TanStack Start** app (React SSR framework) using **Nitro** as the server runtime, with **file-based routing** via TanStack Router.

### Key patterns

- **Routing**: Files in `src/routes/` map to routes. `__root.tsx` is the shell (HTML document, Header, Footer). Route files export a `Route` const via `createFileRoute`.
- **Path aliases**: `#/*` maps to `./src/*` (e.g., `import { env } from "#/env"`). Configured via `package.json` `imports` and `tsconfig.json`.
- **Environment variables**: Declared in `src/env.ts` using T3Env + Zod. Server vars go in `server:{}`, client vars must be prefixed `VITE_` and go in `client:{}`. Import as `import { env } from "#/env"`.
- **Styling**: Tailwind CSS v4 (no config file — configured in `src/styles.css`). CSS custom properties define the design tokens (colors like `--sea-ink`, `--lagoon-deep`, etc.). Shadcn uses "new-york" style with zinc base color.
- **Utilities**: `src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge) for conditional classnames.
- **Shadcn aliases**: `#/components/ui` for UI components, `#/lib/utils` for utilities, `#/hooks` for hooks.

### Biome config

- Indent style: **tabs**
- Quote style: **double**
- Biome only lints/formats files in `src/**/*` and `vite.config.ts`. `src/routeTree.gen.ts` and `src/styles.css` are excluded (auto-generated / special handling).

### Server functions & API routes

Use `createServerFn` from `@tanstack/react-start` for server-side logic called from components. API routes are defined with `server.handlers` in route files. The `hue-sync` package (custom GitHub dependency) is the core integration for Philips Hue HDMI sync functionality.
