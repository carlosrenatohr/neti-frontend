# Architecture

## Flow

```text
weather-search.tsx
  └── use-weather.ts
        └── weather-client.ts
              └── GET /api/weather
                    └── route.ts
                          └── weather.service.ts
                                └── OpenWeatherMap
```

The browser never talks to OpenWeatherMap directly. It only knows the internal response shape.

## Boundaries

| Module                                             | Responsibility                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| `src/app/api/weather/route.ts`                     | HTTP boundary: query validation, status codes, no-store response |
| `src/features/weather/services/weather.service.ts` | Provider URL, timeout, status mapping and response parsing       |
| `src/features/weather/schemas/*`                   | Zod contracts for the city, internal API and provider payload    |
| `src/features/weather/mappers/weather.mapper.ts`   | Provider payload to application model                            |
| `src/features/weather/services/weather.errors.ts`  | Safe error codes, messages and HTTP statuses                     |
| `src/features/weather/hooks/use-weather.ts`        | Client state, aborting and stale-response protection             |
| `src/components/weather/*`                         | Presentation and interaction only                                |

The API key is read in `src/lib/env.ts` and only imported by the server service. No client component imports it.

## Internal API

`GET /api/weather?city=<name>`

Success:

```json
{
  "weather": {
    "city": "Madrid",
    "country": "ES",
    "temperature": 18.4,
    "feelsLike": 17.9,
    "humidity": 64,
    "description": "cielo claro",
    "condition": "clear",
    "icon": "01d",
    "windSpeed": 12,
    "observedAt": "2026-11-25T12:00:00.000Z"
  }
}
```

Error:

```json
{
  "error": {
    "code": "CITY_NOT_FOUND",
    "message": "No encontramos esa ciudad. Revisa el nombre e inténtalo de nuevo."
  }
}
```

| Code                   | Status | Cause                                    |
| ---------------------- | ------ | ---------------------------------------- |
| `INVALID_CITY`         | 400    | missing, empty or overlong city          |
| `CITY_NOT_FOUND`       | 404    | provider does not know the city          |
| `INVALID_API_KEY`      | 502    | provider rejects the credential          |
| `RATE_LIMITED`         | 429    | provider quota                           |
| `PROVIDER_UNAVAILABLE` | 502    | provider server failure                  |
| `NETWORK_ERROR`        | 502    | connection failure                       |
| `TIMEOUT`              | 504    | request exceeded 8 seconds               |
| `INVALID_RESPONSE`     | 502    | malformed or unexpected provider payload |
| `CONFIGURATION_ERROR`  | 500    | `OPENWEATHER_API_KEY` missing            |
| `UNKNOWN`              | 500    | unexpected failure                       |

Provider messages and stack traces are never returned to the browser.

## Decisions

1. **One service, one route.** The assessment does not justify a repository layer, state library or generic HTTP abstraction.
2. **Zod at both edges.** The incoming city and the outgoing provider payload are untrusted.
3. **Server-only key.** `OPENWEATHER_API_KEY` has no `NEXT_PUBLIC_` prefix and is read at request time.
4. **Explicit error model.** The UI gets a stable code and a safe Spanish message, not the provider response.
5. **Abort plus request id.** The hook aborts the previous request and ignores any late response from an older search.
6. **No cache.** The route is dynamic and both the browser and server use `no-store`.
7. **Local state only.** React state is enough; the search is a single request.
8. **Jest at the behavior level.** Tests assert rendered text, status codes and messages, not hook internals.

## Testing

- 17 suites, 75 tests.
- Service and route tests run in the Node environment.
- Component and hook tests run in jsdom with `user-event`.
- `fetch` is mocked in every test that would otherwise reach the network.
- Coverage floor: 80% for statements, branches, functions and lines.
- The final measured coverage is reported in the delivery summary.
