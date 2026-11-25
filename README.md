# Atmos

A small weather app. You type a city, it returns the current temperature, humidity and sky description from OpenWeatherMap.

The interface is in Spanish. Code, tests and documentation are in English.

## Stack

| Area                  | Version                        |
| --------------------- | ------------------------------ |
| Node.js               | 26.13.1                        |
| pnpm                  | 12.23.0                        |
| Next.js               | 16.4.6 (App Router, Turbopack) |
| React / React DOM     | 19.3.1                         |
| TypeScript            | 6.0.3                          |
| Tailwind CSS          | 4.3.5                          |
| Zod                   | 4.6.7                          |
| Jest / jsdom          | 30.5.0 / 30.5.2                |
| React Testing Library | 16.3.3                         |

TypeScript is pinned to 6.0.3 because `typescript-eslint`, used by the official Next.js ESLint config, does not support TypeScript 7 yet. ESLint is pinned to 9.39.5 for the same reason: the plugins bundled with `eslint-config-next@16.4.6` do not accept ESLint 10.

## Run locally

```bash
nvm use
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
# put a real OpenWeatherMap key in .env.local
pnpm dev
```

Open <http://localhost:3000>.

Get a free key at <https://openweathermap.org/api>. The app does not ship one. Without `OPENWEATHER_API_KEY` the page still loads and the API returns a safe configuration error.

## Tests

```bash
pnpm test              # run once
pnpm test:watch        # watch mode
pnpm test:coverage     # enforce coverage thresholds
```

Jest is configured with a global 80% floor for statements, branches, functions and lines. Tests mock `fetch`; they do not need network access or a real API key.

The suite covers successful searches, empty and invalid city input, city-not-found, bad credentials, rate limiting, provider failures, network errors, timeouts, malformed responses, loading state, repeated searches and stale-response protection.

## Quality checks

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm build
pnpm check             # all of the above plus coverage
```

## Docker

The image builds the standalone Next.js output and runs as a non-root user.

```bash
docker build -t atmos-weather .
docker run --rm -p 3000:3000 --env-file .env.local atmos-weather
```

The API key is read at runtime. It is never copied into the image or sent to the browser.

## How it works

```text
Browser
  └── GET /api/weather?city=Madrid
        └── weather.service.ts
              └── OpenWeatherMap Current Weather API
```

- `src/app/api/weather/route.ts` validates the query and returns the internal JSON contract.
- `src/features/weather/services/weather.service.ts` owns the provider URL, timeout and error mapping.
- `weather.schema.ts` and `open-weather.schema.ts` validate input and provider responses with Zod.
- `weather.mapper.ts` turns the provider payload into the model the UI uses.
- `use-weather.ts` handles loading, errors, aborts and stale responses.
- The provider key is only read by `src/lib/env.ts` on the server. There are no `NEXT_PUBLIC_` secrets.

The route is dynamic and responses are sent with `Cache-Control: no-store`; current weather should not be cached by accident.

## Project layout

```text
src/
  app/                 routes, layout and global styles
  components/weather/  search, result, icon and state components
  features/weather/    schemas, service, mapper, hook and utilities
  lib/                 server environment access
  __tests__/           unit and component tests
docs/
  architecture.md      boundaries and error contract
```

## Known limitations

- Only current weather is shown. There is no forecast, radar, history, geolocation or saved cities.
- A valid OpenWeatherMap key is required for live data. The repository does not include one.
- The search result is not stored in the URL, so a reading cannot be deep-linked.
- The app uses OpenWeatherMap's Spanish descriptions when the provider supplies them; some locations may fall back to English.
- The automated audit reports two moderate advisories in Jest's transitive `glob`/`minimatch` dependencies. They are development-only and have no runtime exposure. No patched Jest release is available at the pinned version.

## Why the versions are pinned

`pnpm-lock.yaml` is committed and installs use `--frozen-lockfile`. The exact versions above were verified together on Node 26.13.1. Updating TypeScript to 7 or ESLint to 10 currently breaks the lint gate, so those upgrades should wait for compatible upstream releases.
