# Telemetry Dashboard Guide

This guide defines the event schema emitted by the app and provides starter queries/KPIs so you can build a first dashboard quickly.

## 1) Event Envelope

All telemetry payloads follow this envelope:

```json
{
  "type": "event | error",
  "name": "string",
  "timestamp": "ISO-8601 UTC",
  "properties": { "...": "..." },
  "error": {
    "message": "string",
    "stack": "string (optional)"
  }
}
```

Notes:
- `error` is only present when `type = "error"`
- `properties` may be empty or omitted for some events

## 2) Event Dictionary

### `app_page_view`
When the app is loaded by a user.

Properties:
- none

Use for:
- Daily active usage trend

---

### `wait_data_loaded`
When waiting-time data is successfully loaded (initial or background refresh).

Properties:
- `hospitalCount` (number): count of normalized hospital records
- `hasUnknownWait` (boolean): at least one hospital has unknown wait time
- `sourceStale` (boolean): source timestamp appears older than 30 minutes
- `refreshType` (`initial | background`): load type

Use for:
- Data freshness reliability
- Data completeness monitoring

---

### `sort_mode_changed`
When sort is changed by user.

Properties:
- `mode` (`waiting | name`)

Use for:
- Feature usage preference

---

### `cluster_filter_changed`
When cluster filter changes.

Properties:
- `from` (string): previous region (`all` for no filter)
- `to` (string): new region (`all` for no filter)

Use for:
- Regional filter adoption

---

### `search_started`
When search input transitions from empty to non-empty.

Properties:
- `queryLength` (number): current typed query length

Use for:
- Search feature usage

---

### `search_cleared`
When search input transitions from non-empty to empty.

Properties:
- none

Use for:
- Search interaction completion pattern

---

### Error events (`type = "error", name = "client_error"`)
Captured from:
- data load failures (handled path)
- global `window.error`
- global `unhandledrejection`

Common properties:
- Data load path:
  - `area = "wait_data_load"`
  - `refreshType = "initial | background"`
  - `hasCachedData` (boolean)
- Global error path:
  - `source = "window.error" | "window.unhandledrejection"`
  - Optional browser context fields (`filename`, `lineno`, `colno`)

Use for:
- Production error-rate tracking
- Error source triage

## 3) Baseline Dashboard KPIs

### Reliability
- Load success ratio:
  - success events: `wait_data_loaded`
  - failure events: `client_error` where `properties.area = "wait_data_load"`
- Background refresh failure count:
  - `client_error` where `properties.refreshType = "background"`

### Freshness
- Source staleness rate:
  - `% of wait_data_loaded where properties.sourceStale = true`

### Data Completeness
- Unknown wait-rate:
  - `% of wait_data_loaded where properties.hasUnknownWait = true`
- Average hospital records loaded:
  - `avg(properties.hospitalCount)` over time

### Engagement
- Daily page views:
  - count of `app_page_view`
- Sort preference split:
  - count by `sort_mode_changed.properties.mode`
- Filter usage:
  - count of `cluster_filter_changed`
- Search adoption:
  - count of `search_started`

## 4) Example Queries (SQL-like)

Assume a table `telemetry_events` with columns:
- `type`, `name`, `timestamp`, `properties` (JSON), `error` (JSON)

### A. Hourly load success ratio
```sql
WITH success AS (
  SELECT date_trunc('hour', timestamp) AS hour, count(*) AS success_count
  FROM telemetry_events
  WHERE name = 'wait_data_loaded'
  GROUP BY 1
),
failures AS (
  SELECT date_trunc('hour', timestamp) AS hour, count(*) AS fail_count
  FROM telemetry_events
  WHERE type = 'error'
    AND name = 'client_error'
    AND properties->>'area' = 'wait_data_load'
  GROUP BY 1
)
SELECT
  COALESCE(s.hour, f.hour) AS hour,
  COALESCE(success_count, 0) AS success_count,
  COALESCE(fail_count, 0) AS fail_count,
  CASE
    WHEN COALESCE(success_count, 0) + COALESCE(fail_count, 0) = 0 THEN NULL
    ELSE COALESCE(success_count, 0)::float
      / (COALESCE(success_count, 0) + COALESCE(fail_count, 0))
  END AS success_ratio
FROM success s
FULL OUTER JOIN failures f ON s.hour = f.hour
ORDER BY 1;
```

### B. Source staleness rate (daily)
```sql
SELECT
  date_trunc('day', timestamp) AS day,
  avg(CASE WHEN (properties->>'sourceStale')::boolean THEN 1 ELSE 0 END) AS stale_rate
FROM telemetry_events
WHERE name = 'wait_data_loaded'
GROUP BY 1
ORDER BY 1;
```

### C. Sort mode distribution
```sql
SELECT
  properties->>'mode' AS sort_mode,
  count(*) AS event_count
FROM telemetry_events
WHERE name = 'sort_mode_changed'
GROUP BY 1
ORDER BY 2 DESC;
```

### D. Top client error sources
```sql
SELECT
  COALESCE(properties->>'source', properties->>'area', 'unknown') AS source,
  count(*) AS error_count
FROM telemetry_events
WHERE type = 'error'
  AND name = 'client_error'
GROUP BY 1
ORDER BY 2 DESC;
```

## 5) Minimal Backend Storage Contract

If you are building a telemetry ingest API now, start with:
- accept `POST` JSON payload (single event per request)
- enforce max payload size (for example 64KB)
- reject invalid/missing `type`, `name`, or `timestamp`
- store `properties` and `error` as JSON blobs
- apply short retention first (for example 30 days), then tune

## 6) Suggested First Dashboard Layout

- Row 1: `Daily Page Views`, `Load Success Ratio`, `Source Staleness Rate`
- Row 2: `Avg Hospital Count`, `Background Refresh Failures`, `Unknown Wait-Rate`
- Row 3: `Sort Mode Split`, `Cluster Filter Usage`, `Top Error Sources`
