# Design

## Direction

Atmos is a pocket meteorological instrument, not a dashboard. The page reads like a field note: a large editorial statement, one precise reading, and a small set of measurements. The visual system stays quiet so the weather itself carries the color.

## Type

- **Display:** Bricolage Grotesque. Tight tracking, large scale, italic only for the changing word in the headline.
- **Body:** Atkinson Hyperlegible. Chosen for legibility at small sizes.
- **Data:** JetBrains Mono for labels, timestamps and metadata.

No decorative type is used inside the reading. Numbers are tabular so they do not jump between searches.

## Color

The base surface is a pale mineral sky (`#dfe7e2`), with deep green-black ink (`#10231d`) and a warm ochre accent. The surface tints with the returned condition:

| Condition      | Sky       | Accent    |
| -------------- | --------- | --------- |
| idle           | `#dfe7e2` | `#b67822` |
| clear          | `#efe4c8` | `#a86b13` |
| clouds         | `#d8dfdc` | `#526a61` |
| rain / drizzle | `#cbdad6` | `#2f6f68` |
| thunderstorm   | `#d5d3dd` | `#5b4b8a` |
| snow           | `#e4edef` | `#4a7f95` |
| mist / unknown | `#e1e3dc` | `#6b756f` |

A single soft orb sits behind the page and drifts slowly. It is the only atmospheric decoration. There are no grid overlays, glass panels used as a default, or stock weather photos.

## Layout

Desktop uses a two-column asymmetry: the statement and search on the left, the reading on the right. The reading card is a bordered sheet with corner ticks, not a floating rounded card. Mobile collapses to one column, keeps the headline large, and turns the humidity meter into a full-width row.

The reading is the focal point:

1. city and country
2. condition description
3. temperature at display scale
4. humidity, feels-like temperature and wind
5. observation time and source

## States

- **Idle:** a crosshair instrument and an invitation to search.
- **Loading:** the same instrument with a sweeping arc and skeleton text.
- **Success:** the full reading, with condition-specific color and icon.
- **Error:** a signal mark and a plain-language message with a recovery suggestion.
- **Empty input:** treated as an error and announced through the live region.

## Motion

One purposeful motion per element:

- the orb drifts slowly
- the sun breathes and its rays rotate
- clouds drift, rain falls, the bolt flickers
- the loading arc sweeps
- the card enters once

All motion uses transform or opacity and stops under `prefers-reduced-motion`.

## Accessibility

- skip link to the main region
- one `h1`, one `h2` per reading
- labelled search field and native submit button
- visible focus ring on every interactive element
- live region for results and errors
- icon is decorative and hidden from assistive technology
- error is not communicated by color alone
- contrast checked with axe-core for WCAG 2.2 AA
- no horizontal overflow at 320 px
- touch targets at least 44 px

## What to avoid

Do not add generic dashboard cards, gradients used as decoration, glassmorphism, weather emoji, stock sky photography, or a second accent color without a product reason. The system should remain one sheet, one reading, one accent.
