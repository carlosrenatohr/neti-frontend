# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, Zod, Jest and React Testing Library. The stack was fixed by the assessment, not chosen during discovery.

## Users

People who want a quick, trustworthy reading of the current weather in a city they name. They arrive from a phone or a desktop, usually for one lookup rather than a long session. The interface must work for keyboard and screen-reader users and remain legible at 200% zoom.

## Product Purpose

Atmos answers one question: what is the weather in this city right now? It shows the current temperature, humidity and a short description, then gets out of the way. Success means a first-time visitor can search, understand the reading and recover from a bad city name without instructions.

## Positioning

A single current reading presented as a small meteorological instrument, not a forecast dashboard. No account, no saved places, no radar maps, no invented data.

## Operating Context

The browser talks to a server route that holds the OpenWeatherMap credential. The reading is live and intentionally not cached. The interface is in Spanish; source code, identifiers and documentation are in English. The assessment is evaluated locally and through its test suite.

## Capabilities and Constraints

- Search the current weather for a city.
- Suggest real cities while typing, with country context and keyboard selection.
- Show temperature in Celsius, humidity and the provider description.
- Offer light and dark themes, following the system preference by default.
- Support empty input, unknown city, API, network and timeout failures with safe messages.
- Allow repeated searches and prevent stale responses from replacing a newer reading.
- Use OpenWeatherMap Current Weather API with metric units and Spanish descriptions.
- The API key stays server-side and is supplied through `OPENWEATHER_API_KEY`.
- Automated tests use mocks and require no network access.
- Forecasts, geolocation, accounts, persistence and maps are out of scope.

## Brand Commitments

The product is called Atmos. Its voice is calm, direct and slightly observational: a field note rather than a marketing page. The interface should feel precise and tactile, with room for the reading to breathe.

## Evidence on Hand

No customer testimonials, usage metrics or proprietary weather data exist. All weather values shown in the product come from OpenWeatherMap at runtime. Synthetic values used in tests and screenshots must not be presented as real observations.

## Product Principles

1. One question, one clear answer.
2. Show the reading before explaining the interface.
3. Fail in plain language and preserve the user's next step.
4. Treat the weather provider as untrusted input.
5. Keep the surface small enough to remain fast, accessible and maintainable.

## Accessibility & Inclusion

Target WCAG 2.2 AA: semantic landmarks, labelled controls, visible focus, keyboard operation, sufficient contrast, non-color error cues, reduced-motion support and usable layouts at 200% zoom.
