# Portland City Council vote scraper

Scrapes vote roll calls from [city council votes](https://www.portland.gov/council/votes), aggregates counts per councilor (yea, nay, absent, abstain), prints JSON to stdout, then renders terminal charts with [Ink](https://github.com/vadimdemedes/ink) and [@pppp606/ink-chart](https://www.npmjs.com/package/@pppp606/ink-chart).

## Requirements

- Node.js 20+

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

Or: `npx tsx index.ts`

Progress URLs are logged to **stderr**; the JSON block and chart output go to **stdout**. To capture only JSON:

```bash
npm start 2>/dev/null | jq .
```

## Configuration

In `src/scrape.ts`, adjust:

- **`MIN_DOC_YEAR`** — Pagination stops when a row’s document number no longer starts with this year or higher (e.g. `2025` for `2025-116`). Missing or non-matching doc numbers also stop the crawl.

## Project layout

| Path | Purpose |
|------|---------|
| `index.ts` | Entry: scrape, print JSON, render charts |
| `src/scrape.ts` | HTTP fetch + Cheerio parsing |
| `src/charts.tsx` | Ink chart UI |
| `src/types.ts` | Shared types |

TypeScript is run directly via **tsx** (no build step).
