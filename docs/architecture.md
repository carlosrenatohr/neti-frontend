# Architecture

## Flow

```text
weather-search.tsx
  ├── use-city-suggestions.ts
  │     └── city-client.ts
  │           └── GET /api/cities
  │                 └── route.ts
  │                       └── geocoding.service.ts
  │                             └── OpenWeatherMap Geocoding API
  └── use-weather.ts
        └── weather-client.ts
              └── GET /api/weather
                    └── route.ts
                          └── weather.service.ts
                                └── OpenWeatherMap Current Weather API
```

The browser never talks to OpenWeatherMap directly. It only knows the two internal response shapes.

## Boundaries

| Module                                               | Responsibility                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| `src/app/api/weather/route.ts`                       | HTTP boundary: query validation, status codes, no-store response |
| `src/app/api/cities/route.ts`                        | Suggestion boundary: partial-name validation and limits          |
| `src/features/weather/services/weather.service.ts`   | Provider URL, timeout, status mapping and response parsing       |
| `src/features/weather/services/geocoding.service.ts` | Geocoding URL, timeout, deduplication and provider mapping       |
| `src/features/weather/schemas/*`                     | Zod contracts for input, internal APIs and provider payloads     |
| `src/features/weather/mappers/weather.mapper.ts`     | Provider payload to application model                            |
| `src/features/weather/services/weather.errors.ts`    | Safe error codes, messages and HTTP statuses                     |
| `src/features/weather/hooks/use-weather.ts`          | Client state, aborting and stale-response protection             |
| `src/features/weather/hooks/use-city-suggestions.ts` | Debounced suggestions with abort and stale-query protection      |
| `src/components/weather/*`                           | Presentation and interaction only                                |
| `src/components/theme/*`                             | Theme toggle; the cookie is read by the server layout            |

The API key is read in `src/lib/env.ts` and only imported by the server services. No client component imports it.

## Internal APIs

### `GET /api/weather?city=<name>`

Success:

```json
{
  "weather": {
    "city": "Managua",
    "country": "NI",
    "temperature": 32.92,
    "feelsLike": 36.13,
    "humidity": 50,
    "description": "algo de nubes",
    "condition": "clouds",
    "icon": "02d",
    "windSpeed": 7,
    "observedAt": "2026-11-25T20:21:12.000Z"
  }
}
```

### `GET /api/cities?query=<partial name>`

Returns at most five matches. `query` must have at least two characters.

```json
{
  "cities": [
    {
      "id": "12.13,-86.25",
      "name": "Managua",
      "country": "NI",
      "lat": 12.1328,
      "lon": -86.2504
    }
  ]
}
```

Selecting a suggestion submits `Name, CC` to the weather route, so same-name cities do not resolve to another country. Free text still works.

### Errors

```json
{
  "error": {
    "code": "CITY_NOT_FOUND",
    "message": "No encontramos esa ciudad. Revisa cómo la escribiste o elige una sugerencia."
  }
}
```

| Code                   | Status | Cause                                    |
| ---------------------- | ------ | ---------------------------------------- |
| `INVALID_CITY`         | 400    | missing, empty or overlong input         |
| `CITY_NOT_FOUND`       | 404    | provider does not know the city          |
| `INVALID_API_KEY`      | 502    | provider rejects the credential          |
| `RATE_LIMITED`         | 429    | provider quota                           |
| `PROVIDER_UNAVAILABLE` | 502    | provider server failure                  |
| `NETWORK_ERROR`        | 502    | connection failure                       |
| `TIMEOUT`              | 504    | weather exceeded 8s, geocoding 5s        |
| `INVALID_RESPONSE`     | 502    | malformed or unexpected provider payload |
| `CONFIGURATION_ERROR`  | 500    | `OPENWEATHER_API_KEY` missing            |
| `UNKNOWN`              | 500    | unexpected failure                       |

Provider messages and stack traces are never returned to the browser.

## Decisions

1. **Two services, two routes.** Weather and geocoding have different provider endpoints and failure modes; keeping them separate avoids a conditional service.
2. **Zod at both edges.** Incoming queries and outgoing provider payloads are untrusted.
3. **Server-only key.** `OPENWEATHER_API_KEY` has no `NEXT_PUBLIC_` prefix and is read at request time.
4. **Explicit error model.** The UI gets a stable code and a safe Spanish message, not the provider response.
5. **Abort plus request id.** `useWeather` aborts the previous request and ignores any late response from an older search.
6. **Debounced suggestions.** `useCitySuggestions` waits 280 ms, aborts the previous call and discards results for a replaced query.
7. **Country-scoped selection.** A chosen suggestion becomes `Name, CC`, which removes the common ambiguity between countries without changing the weather contract.
8. **Theme before paint.** The chosen theme lives in a cookie; the async layout resolves it on the server and renders `data-theme`, so there is no flash. `light-dark()` supplies both palettes.
9. **No cache.** Both routes are dynamic and use `no-store`.
10. **Local state only.** React state is enough; there is no global store or data library.
11. **Jest at the behavior level.** Tests assert rendered text, status codes and messages, not hook internals.

## Rendering model

The weather experience is a client component. The root layout reads the theme cookie, so `/` is server-rendered per request instead of being statically prerendered. That is the cost of rendering the correct theme before the first paint.

## Testing

- 24 suites, 122 tests.
- Service and route tests run in the Node environment.
- Component and hook tests run in jsdom with `user-event`.
- `fetch` is mocked in every test that would otherwise reach the network.
- Coverage floor: 80% for statements, branches, functions and lines.
- The final measured coverage is reported in the delivery summary.
