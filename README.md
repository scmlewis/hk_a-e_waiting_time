# A&E Waiting Time Web App (MVP)

Mobile-first React + TypeScript app for Hong Kong A&E waiting time data.

## Current UX

- Default triage view on Category III, with quick switch to Category I / II / III / IV&V
- Official HA cluster grouping (Hong Kong, Kowloon, New Territories clusters)
- Search + cluster filter
- Per-hospital expandable details with:
  - All triage category wait times
  - Location, cluster info
  - **Call Hospital CTA** (tel link, dialable on phone)
  - **View on Maps CTA** (eye-catching button aligned with call)
  - Website link removed (redirected to generic HA homepage)

## Stack

- React + Vite + TypeScript (strict mode)
- Tailwind CSS
- Native fetch with endpoint fallback
- Vitest + Testing Library

## Development

```bash
npm install
npm run dev
```

## Testing and Quality

```bash
npm test
npm run lint
npm run build
```

## API Configuration

Copy `.env.example` to `.env` and override endpoints if needed:

```bash
VITE_AE_PRIMARY_ENDPOINT=...
VITE_AE_FALLBACK_ENDPOINT=...
VITE_TELEMETRY_ENDPOINT=...
```

`VITE_TELEMETRY_ENDPOINT` is optional. If provided, the app sends lightweight JSON telemetry events and client errors to this endpoint.

## Observability (Sprint 2)

- App lifecycle event: `app_page_view`
- Data health event: `wait_data_loaded` (count, unknown waits, source staleness, refresh type)
- Interaction events: `sort_mode_changed`, `cluster_filter_changed`, `search_started`, `search_cleared`
- Error tracking: request failures in data loading plus global `window.error` and `unhandledrejection`

Telemetry transport uses `navigator.sendBeacon` when available and falls back to `fetch(..., { keepalive: true })`.

Telemetry schema, KPI definitions, and starter SQL-like queries are documented in [docs/telemetry-dashboard-guide.md](docs/telemetry-dashboard-guide.md).

## CI/CD Scaffold

GitHub Actions workflow is defined in [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml):

- Pull requests to `main`: `npm ci`, `npm test`, `npm run lint`, `npm run build`
- Push to `main`: same quality gates + deploy `dist` to GitHub Pages

### One-time GitHub Pages setup

In your repository settings:

- Go to **Settings → Pages**
- Under **Build and deployment**, set **Source** to **Deploy from a branch**
- Set **Branch** to `gh-pages` and folder to `/ (root)`
- Go to **Settings → Actions → General → Workflow permissions**
- Set **Read and write permissions** and save

After that, each push to `main` automatically publishes the latest build.

## MVP Documentation

Project requirements and acceptance criteria are tracked in [plan.md](plan.md).
