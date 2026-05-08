# Polymarket Scanner

A Next.js application that surfaces active [Polymarket](https://polymarket.com) prediction markets alongside computed trading signals to help inform trading decisions.

## What it does

The app fetches active markets from Polymarket's APIs and presents them with additional analysis layered on top:

- **Trading signals** — Each market is evaluated against a set of rules in [lib/markets/rules.ts](lib/markets/rules.ts):
  - **Significant price move** — fires when 24h price change is ≥ 10% (high severity at ≥ 20%)
  - **High volume surge** — fires when 24h volume exceeds $500k (high severity above $1M)
  - **Near resolution** — fires when a market resolves within 7 days (high severity within 2 days)
  - **Tossup** — fires when the "Yes" outcome sits between 40–60%
- **Market detail view** — drill into a single market to see top holders and order book context
- **Watchlist** — pin markets you want to follow, persisted locally
- **Alerts** — client-side polling evaluates rules against watched markets and dispatches browser notifications
- **Settings** — import/export your local state (watchlist, alert preferences)

## How to run it

Requires Node.js 20+.

```bash
npm install
npm run dev
```

The dev server starts on `http://localhost:3000`.

Other scripts:

```bash
npm run build      # production build
npm run start      # run the production build
npm run lint       # eslint
npm run prettier   # format the codebase
```

## What it contains

- [app/](app/) — Next.js routes and route handlers
- [components/](components/) — React components
- [lib/](lib/) — utilities, types, domain logic

## Libraries and tools

**Framework**

- [Next.js 16](https://nextjs.org) (App Router) with React 19
- TypeScript (strict)

**Data**

- [TanStack Query](https://tanstack.com/query) — client-side fetching and caching
- [TanStack Virtual](https://tanstack.com/virtual) — virtualised long lists
- [decimal.js](https://mikemcl.github.io/decimal.js/) — precise numeric handling
- [nuqs](https://nuqs.47ng.com/) — URL-synced search params

**State**

- [Jotai](https://jotai.org) — atomic state management

**UI**

- [shadcn/ui](https://ui.shadcn.com) on top of [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS 4](https://tailwindcss.com)
- [lucide-react](https://lucide.dev) — icon set
- [sonner](https://sonner.emilkowal.ski) — toasts
- [boring-avatars](https://boringavatars.com) — generated avatars

**Utilities**

- [@mantine/hooks](https://mantine.dev/hooks/) — common React hooks
- [lodash](https://lodash.com)

**Tooling**

- ESLint, Prettier
