<div align="center">

<h1>Hue HDMI Sync</h1>

<p>
  A web app that syncs your Philips Hue lights to any video input in real time.
</p>

<!-- Badges -->
<p>
  <a href="https://github.com/jdmg94/hue-hdmi-sync/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/jdmg94/hue-hdmi-sync" alt="contributors" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/jdmg94/hue-hdmi-sync" alt="last update" />
  </a>
  <a href="https://github.com/jdmg94/hue-hdmi-sync/issues/">
    <img src="https://img.shields.io/github/issues/jdmg94/hue-hdmi-sync" alt="open issues" />
  </a>
  <a href="https://github.com/jdmg94/hue-hdmi-sync/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/jdmg94/hue-hdmi-sync.svg" alt="license" />
  </a>
</p>

<h4>
  <a href="https://github.com/jdmg94/hue-hdmi-sync/issues/">Report Bug or Request Feature</a>
</h4>
</div>

<br />

# Table of Contents

- [About the Project](#about-the-project)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
  - [Commands](#commands)
  - [Environment Variables](#environment-variables)
  - [Routing](#routing)
  - [Styling](#styling)
  - [Linting & Formatting](#linting--formatting)
  - [Testing](#testing)
- [License](#license)

## About the Project

**Hue HDMI Sync** is a self-hosted web application that captures a video input source (display, camera, or screen) and streams real-time color data to your Philips Hue Entertainment Area. It uses the [Philips Hue Entertainment API](https://developers.meethue.com/develop/hue-api-v2/api-reference/) over a DTLS connection to push color updates with minimal latency.

Built with:
- [TanStack Start](https://tanstack.com/start) — React SSR framework
- [TanStack Router](https://tanstack.com/router) — file-based routing
- [Nitro](https://nitro.unjs.io/) — server runtime
- [hue-sync](https://github.com/jdmg94/Hue-Sync) — Philips Hue API V2 client
- [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn](https://ui.shadcn.com/)

## Getting Started

### Prerequisites
- FFMPEG
- Node.js 24+
- [pnpm](https://pnpm.io/)
- A Philips Hue Bridge with at least one Entertainment Area configured
- an HDMI capture card (optional but reccommended)

### Installation

```bash
git clone https://github.com/jdmg94/hue-hdmi-sync.git
cd hue-hdmi-sync
pnpm install
```

## Usage

1. Start the dev server:

```bash
pnpm dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Pair your Bridge** — click **Bridges**, discover your Hue Bridge on the local network, and follow the pairing prompt (press the button on the bridge when asked).

4. **Select an Entertainment Area** — choose the room or zone you want to sync.

5. **Select a Video Input** — pick the screen, window, or camera to capture.

6. **Press Play** — the app starts streaming color updates from the video input to your lights in real time.

> **HTTPS note:** The Hue Bridge requires a secure DTLS connection. The `signify.pem` CA certificate is included at the root of the project. The dev server is pre-configured to load it via `NODE_EXTRA_CA_CERTS`. For production deployments set that environment variable accordingly.

## Development

### Commands

```bash
pnpm dev      # Start dev server on port 3000
pnpm build    # Production build
pnpm preview  # Preview production build
pnpm test     # Run tests with Vitest
pnpm check    # Biome lint + format check (run before committing)
pnpm lint     # Biome lint only
pnpm format   # Biome format only
```

To run a single test file:

```bash
pnpm vitest run src/path/to/file.test.ts
```

### Environment Variables

Environment variables are declared in [src/env.ts](src/env.ts) using [T3Env](https://env.t3.gg/) + Zod. Server-only vars go in `server: {}`, client-exposed vars must be prefixed `VITE_` and go in `client: {}`.

```ts
import { env } from "#/env";

console.log(env.VITE_APP_TITLE);
```

### Routing

Routes are file-based under [src/routes/](src/routes/). Each file exports a `Route` const via `createFileRoute`. The root shell (HTML document, global layout) lives in [src/routes/__root.tsx](src/routes/__root.tsx).

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/my-page")({
  component: MyPage,
});
```

### Styling

Tailwind CSS v4 is configured entirely in [src/styles.css](src/styles.css) — no config file. Design tokens (colors, spacing) are defined as CSS custom properties (e.g. `--sea-ink`, `--lagoon-deep`).

Use the `cn()` utility from [src/lib/utils.ts](src/lib/utils.ts) for conditional classnames:

```ts
import { cn } from "#/lib/utils";

cn("base-class", condition && "conditional-class");
```

Add Shadcn components:

```bash
pnpm dlx shadcn@latest add <component-name>
```

### Linting & Formatting

[Biome](https://biomejs.dev/) handles both linting and formatting with the following conventions:
- Indent style: **tabs**
- Quote style: **double**

```bash
pnpm check    # lint + format check
pnpm lint     # lint only
pnpm format   # format only
```

### Testing

Tests use [Vitest](https://vitest.dev/) with [jsdom](https://github.com/jsdom/jsdom) and [Testing Library](https://testing-library.com/):

```bash
pnpm test
```

## License

Apache License 2.0 — see the [LICENSE](LICENSE) file for details.
