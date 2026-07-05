# CN Award Finder

CN Award Finder is a Chinese-first bilingual web app for estimating how far mainland China airline miles or points can take a traveler on one-way domestic award tickets.

The app calculates airport-to-airport great-circle distance, applies static award chart rules, and ranks affordable destination airports by distance and value.

## 功能 / Features

- 中文优先界面，并支持 English 切换
- Search origin airports by city, airport name, or IATA code
- Treats every airport separately, including multi-airport cities such as Beijing and Shanghai
- Calculates estimated airport-to-airport distance with the Haversine formula
- Supports three airline families:
  - 国航系 / Air China family
  - 东航系 / China Eastern family
  - 南航系 / China Southern family
- Supports economy, premium economy where available, business, and first class
- Shows:
  - 最远可兑换目的地机场 / Furthest affordable destination airports
  - 最高价值目的地机场 / Best-value destination airports
- Applies China Southern special city-pair route rules while still displaying airport-level distance
- Includes validation and an empty state when no destination is affordable

## Important Assumptions

Results are estimates only.

- Distance is calculated between airport coordinates, not city centers.
- Award costs are based on static award chart data in this repo.
- Results do not confirm actual flight routes, official airline route mileage, routings, or award seat availability.
- The current scope is mainland China domestic, one-way awards only.
- There is no backend, login, scraping, external API call, or live availability lookup.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vitest
- Static TypeScript data files

## Project Structure

```text
src/app/page.tsx              Main bilingual calculator UI
src/data/airports.ts          Mainland China airport seed data
src/data/awardCharts.ts       Airline award charts and special route overrides
src/lib/distance.ts           Airport-to-airport Haversine distance
src/lib/awardCalculator.ts    Award mileage and ranking logic
src/lib/search.ts             Airport search helper
src/lib/awardCalculator.test.ts
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev      # Start local Next.js dev server
npm run build    # Build production app
npm run lint     # Type-check with TypeScript
npm test         # Run unit tests
```

## Testing Coverage

The unit tests cover:

- PEK-CAN, PEK-PKX, and SHA-PVG airport-to-airport distances
- Same-airport exclusion from destination results
- Award chart distance band boundaries
- China Southern special route overrides in both directions
- Airport-specific displayed distances for PEK-CAN vs PKX-CAN
- Affordable-only filtering
- Furthest and best-value sorting
- Value score calculation

## Data Maintenance

Airport coordinates and award chart rules are static and intentionally easy to update.

When changing data:

1. Update airport records in `src/data/airports.ts`.
2. Update award bands or special overrides in `src/data/awardCharts.ts`.
3. Run `npm test` to confirm boundary and route-rule behavior.
4. Run `npm run build` before shipping.
