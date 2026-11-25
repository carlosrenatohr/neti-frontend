# Atmos

A small weather app. You type a city, it suggests real places, and it returns the current temperature, humidity and sky description from OpenWeatherMap. It has a light and a dark theme.

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
npm install -g pnpm@12.23.0
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

The suite covers successful searches, city suggestions, empty and invalid city input, city-not-found, bad credentials, rate limiting, provider failures, network errors, timeouts, malformed responses, loading state, repeated searches, stale-response protection, theme persistence and keyboard selection.

## Features

- City autocomplete backed by a short curated list of common cities plus OpenWeatherMap geocoding, limited to five matches and resolved on the server.
- Current temperature, feels-like temperature, humidity, wind and condition description.
- Light and dark themes. The first visit follows the system preference; the toggle stores the choice in a cookie and the server renders it before paint.
- Keyboard support for the suggestion list: arrow keys, Enter and Escape.

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

The API key is read at runtime. It is never copied into the image or sent to the browser. The container respects an injected `PORT`, so the same image works locally and on a platform that assigns its own port.

## Deploy

The repository includes a Dockerfile that can run on a container platform. The intended free preview target is [Render](https://render.com/):

1. Create a **Web Service** from this repository and choose the Docker runtime.
2. Add `OPENWEATHER_API_KEY` as an environment variable. Do not commit it.
3. Let Render inject `PORT`; the image already binds to `0.0.0.0`.
4. Use the generated `onrender.com` URL, or attach a custom domain.

Render's free instance sleeps after 15 minutes without traffic and takes about a minute to wake. It is a preview target, not an always-on production host; a paid instance removes the sleep. See [Render's free plan limits](https://render.com/docs/free).

## How it works

```text
Browser
  ├── GET /api/cities?query=Manag
  │     └── geocoding.service.ts
  │           └── OpenWeatherMap Geocoding API
  └── GET /api/weather?city=Managua,%20NI
        └── weather.service.ts
              └── OpenWeatherMap Current Weather API
```

- `src/app/api/weather/route.ts` validates the query and returns the internal JSON contract.
- `src/app/api/cities/route.ts` validates the partial name and returns at most five suggestions.
- `src/features/weather/services/weather.service.ts` owns the provider URL, timeout and error mapping.
- `src/features/weather/data/featured-cities.ts` keeps a short list of common cities, because the provider only matches prefixes.
- `src/features/weather/services/geocoding.service.ts` owns the geocoding call, merges both sources and removes duplicates.
- `weather.schema.ts`, `geocoding.schema.ts` and `open-weather.schema.ts` validate input and provider responses with Zod.
- `weather.mapper.ts` turns the provider payload into the model the UI uses.
- `use-weather.ts` handles loading, errors, aborts and stale responses; `use-city-suggestions.ts` debounces and cancels suggestion requests.
- `src/lib/theme.ts` and `theme-toggle.tsx` keep the light/dark choice in a cookie.
- The provider key is only read by `src/lib/env.ts` on the server. There are no `NEXT_PUBLIC_` secrets.

The routes are dynamic and responses are sent with `Cache-Control: no-store`; current weather should not be cached by accident.

## Project layout

```text
src/
  app/                 routes, layout and global styles
  components/theme/    light and dark toggle
  components/weather/  search, suggestions, result, icon and state components
  features/weather/    schemas, services, mapper, hooks and utilities
  lib/                 server environment access and theme cookie
  __tests__/           unit and component tests
docs/
  architecture.md      boundaries and error contract
```

## Manual smoke test

No end-to-end suite is committed. Run these checks against the running app:

1. Open `/`. The search field shows `Managua, Nicaragua` as its placeholder.
2. Type `Manag`. A suggestion for `Managua — Nicaragua` appears; the list closes with `Escape`.
3. Select the suggestion with the mouse, then repeat with `ArrowDown` + `Enter`. The reading shows Managua and a humidity value.
4. Toggle the theme in the top bar. The whole page changes palette; reload and confirm the choice survives.
5. Resize to 320 px and 390 px. There is no horizontal scroll and the search button spans the column.
6. Submit an unknown city. The error is announced, uses text (not color alone), and offers a next step.

## Known limitations

- Only current weather is shown. There is no forecast, radar, history, geolocation or saved cities.
- Suggestions combine a curated list of common cities with OpenWeatherMap geocoding; there is no offline mode.
- A valid OpenWeatherMap key is required for live data. The repository does not include one.
- The search result is not stored in the URL, so a reading cannot be deep-linked.
- The app uses OpenWeatherMap's Spanish descriptions when the provider supplies them; some locations may fall back to English.
- The free Render preview sleeps after inactivity, so the first request after a quiet period can take about a minute.
- The automated audit reports two moderate advisories in Jest's transitive `glob`/`minimatch` dependencies. They are development-only and have no runtime exposure. No patched Jest release is available at the pinned version.

## Why the versions are pinned

`pnpm-lock.yaml` is committed and installs use `--frozen-lockfile`. The exact versions above were verified together on Node 26.13.1. Updating TypeScript to 7 or ESLint to 10 currently breaks the lint gate, so those upgrades should wait for compatible upstream releases.
