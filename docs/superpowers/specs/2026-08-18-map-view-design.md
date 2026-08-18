# Map View — Design Spec

**Date:** 2026-08-18
**Status:** Approved (design)
**Feature:** Add a dependency-free SVG map view to the Hong Kong A&E Waiting Time Monitor.

## Goal

Give users a geographic overview of A&E wait times across Hong Kong's public hospitals,
plotted by real coordinates, colored by the selected triage category, and synced with the
existing search/cluster filters and GPS location feature — without adding any runtime
dependency or API key, preserving the app's "ultra-lightweight" principle.

## Decisions (from brainstorming)

1. **Rendering:** Dependency-free SVG schematic. No Leaflet/Mapbox/Google Maps, no tiles,
   no API key. Zero new runtime dependencies.
2. **Filter sync:** The map shows the same filtered set as the list/table (respects search
   and cluster filter), and colors markers by the **selected triage category's** wait status.
3. **Marker tap:** Opens a self-contained info popup on the map (name, wait time for the
   selected triage category, phone dial link, "Open in Maps" link). No view switching.
4. **User location:** Reuse the existing `useLocation` GPS feature; render the user's
   location as a distinct marker plus a faint translucent radius circle for spatial context.

## Architecture

### View tab
- Extend `AppView` in `src/components/AppHeader.tsx` from
  `'wait-times' | 'overview'` to `'wait-times' | 'overview' | 'map'`.
- Add a third `role="tab"` button labelled `labels.viewMap` next to the existing two tabs,
  following the exact same styling/active-indicator pattern.

### Data flow (reuse, do not duplicate)
The map consumes data already produced in `App.tsx`:
- `visibleHospitals` — already filtered by `searchValue` + `selectedCluster` and carries
  `distanceKm` (from `useLocation`). Pass this down as the marker set.
- `selectedTriageCategory` — drives marker color.
- `userLocation` (from `useLocation`) — drives the user-location marker + radius.
- `loading`, `error` — for empty/error/skeleton states.
- `labels`, `languageMode`, `isDark` — for i18n and theming.

No changes to `useWaitingTimes`, `aeService`, or `hospitalMeta`; hospital coordinates
already exist in `HOSPITAL_META`.

### New files
- `src/utils/geoProjection.ts` — pure helper: `projectToSvg(lat, lng, bounds, width, height)`
  returning `{ x, y }`. Equirectangular projection across a fixed HK bounding box:
  - lat range: `22.15`–`22.56`
  - lng range: `113.90`–`114.41`
  - y is flipped (north = up).
  Also export the bounding-box constant and a `HK_MAP_VIEWBOX` / padding config.
- `src/constants/mapColors.ts` — `WAIT_STATUS_COLORS: Record<WaitStatus, string>` mapping
  wait status to **raw hex values** (not Tailwind classes, because SVG `fill` attributes
  require literal colors). Values mirror the legend dots in `AppHeader` (which use the same
  hex for light and dark mode, so they are theme-stable):
  - `short` → `#22c55e` (green-500)
  - `moderate` → `#f59e0b` (amber-500)
  - `long` → `#ef4444` (red-500)
  - `unknown` → `#79747e` (m3-outline)
- `src/components/HospitalMap.tsx` — the SVG canvas, markers, user-location overlay,
  and popup state management.
- `src/components/MapPopup.tsx` — the info card rendered as an accessible `dialog` overlay
  (embedded in the SVG via `<foreignObject>`; see Popup section).

### Modified files
- `src/components/AppHeader.tsx` — add `map` tab.
- `src/App.tsx` — render `<HospitalMap>` when `activeView === 'map'`; pass the props above;
  add `trackEvent('map_view_opened', ...)` in `handleViewChange` when target is `'map'`.
- `src/constants/labels.ts` — **add `viewMap: string` to the `AppLabels` interface** (the
  interface is explicitly typed, so the new key must be declared or TypeScript fails), then
  add `viewMap` to both `EN_LABELS` and `ZH_HK_LABELS`. Popup strings reuse existing keys
  (`hospitalCard.callHospital`, `hospitalCard.viewOnMaps`, `hospitalCard.contact`) — no new
  popup labels are introduced (see i18n section).

## Rendering details

### SVG canvas
- A responsive container with a fixed aspect ratio of `4 / 3`
  (`className="aspect-[4/3]"`), holding an `<svg viewBox="0 0 W H" preserveAspectRatio="xMidYMid meet">`.
- Background: a plain `<rect>` filled with `m3-surface-container` (CSS var) — an honest
  schematic, **no fake coastline**. Theme adapts automatically via CSS vars.
- Projection helper maps each hospital `lat/lng` to `(x, y)` within the padded viewBox.

### Markers
- One `<circle>` (or small `<g>`) per hospital that has a `location`.
- `fill` = `WAIT_STATUS_COLORS[hospital.triage[selectedTriageCategory].waitStatus]` (from
  `src/constants/mapColors.ts`). This is the raw hex for the selected triage category's
  wait status: green (`short`), amber (`moderate`), red (`long`), grey (`unknown`).
- Marker is keyboard-accessible: `role="button"`, `tabIndex={0}`, `aria-label` with hospital
  name + wait time, `onKeyDown` for Enter/Space.
- Clicking/tapping a marker sets the selected hospital and opens the popup.

### User location overlay
- If `userLocation` is present and `locationStatus === 'ready'`, render a distinct blue dot
  (different shape/size from hospital markers) and a faint translucent `<circle>` radius
  (~5 km, computed via the same projection scale) for spatial context.

### Popup (`MapPopup.tsx`)
- Rendered **inside the SVG via `<foreignObject>`** at the selected marker's projected
  `(x, y)` coordinates. Using `foreignObject` keeps the popup in SVG coordinate space, so no
  fragile CSS `left/top` translation is needed (important because `preserveAspectRatio` may
  letterbox the SVG). The `foreignObject` host `<div>` carries `role="dialog"`,
  `aria-modal="false"`, an accessible name, and a close button.
- Contents:
  - Hospital name (localized for `zh-HK` when applicable — reuse existing localization).
  - Wait time text for the **selected triage category** (e.g. "Category III: 45 min (≤ 60)").
  - Phone: `tel:` dial link from `hospital.details.phone.dialHref`, labelled with the
    existing `hospitalCard.callHospital` string.
  - "Open in Maps" link to `hospital.details.mapsUrl` (opens new tab, `rel="noopener"`),
    labelled with the existing `hospitalCard.viewOnMaps` string.
- Closing: Escape key, explicit close button, or tapping the SVG background (a transparent
  `<rect>` behind the markers with an `onClick` that clears the selected hospital). The
  HospitalMap container also wires an `onKeyDown` (Escape) to close.
- **Mobile:** on narrow viewports the `foreignObject` popup is sized to span most of the map
  width (e.g. `width` ≈ 90% of viewBox) and anchored near the bottom of the SVG, so it reads
  as a lightweight bottom card rather than a tiny floating tooltip that could overflow the
  viewport. On `md+` it appears as a compact card near the marker.

## States & edge cases
- `loading`: show a skeleton/placeholder block (mirror existing mobile skeleton style).
- `error` (no hospitals loaded): show the existing error message pattern.
- Hospital with no `location`: skipped from markers (defensive; all 18 current hospitals
  have coordinates).
- No user location: user-location overlay simply not rendered.
- **Filter bar on map view:** the map reuses the same `visibleHospitals` as the list, so it is
  already filter-synced. On desktop the existing `FilterBar` stays visible above the map; on
  mobile the existing filter/sort bottom sheet remains available (same mechanism as the
  wait-times view), letting users narrow what the map shows.
- **Background tap vs marker tap:** the transparent background `<rect>` closes the popup;
  marker `<circle>` elements stop propagation so a marker tap opens (not closes) the popup.

## Telemetry
- `trackEvent('map_view_opened')` when switching to the map tab (in `handleViewChange`).
- `trackEvent('map_marker_tapped', { hospitalName })` on marker selection.
- Mirrors the existing `trackEvent` usage elsewhere in `App.tsx`.

## i18n
Only one new label key is required (popup strings reuse existing `hospitalCard` keys):
- `viewMap` → "Map" / "地圖"
Add `viewMap: string` to the `AppLabels` interface and to both `EN_LABELS` / `ZH_HK_LABELS`.
  The popup reuses `hospitalCard.callHospital` ("Call Hospital" / "致電醫院") and
  `hospitalCard.viewOnMaps` ("View on Maps" / "在地圖查看"). The user-location marker's
  `aria-label` reuses the existing `useMyLocation` string (or a single new minimal key
  `mapYourLocation` if a distinct label is preferred) — no `mapPopup.*` keys are introduced.

## Testing
- `src/utils/geoProjection.test.ts`: projection math (known lat/lng → expected x/y,
  north-up flip, bounds clamping).
- `src/components/HospitalMap.test.tsx`: markers render for the filtered set, popup opens on
  marker activation (click + Enter key) and closes on Escape / close button / background tap,
  user-location marker + radius render when `locationStatus === 'ready'`. Follow the Vitest +
  RTL style; render `<HospitalMap>` directly with a small fixture of hospitals (no fetch mock
  needed since the component is presentational and receives data via props).
- `src/components/MapPopup.test.tsx`: renders hospital name, wait-time text, phone `tel:` link
  (using `hospitalCard.callHospital` label) and maps link (using `hospitalCard.viewOnMaps`
  label); close button fires the `onClose` callback.
- `src/App.test.tsx`: extend the existing suite with a test asserting the new `Map` tab button
  is present and switching to it renders the map (optional but recommended to guard regressions).

## Out of scope (YAGNI)
- No street-level tiles, pan/zoom drag, or scroll/pinch zoom.
- No routing / directions / travel-time computation.
- No new data source, backend, accounts, or API keys.
- No fake coastline / detailed geography beyond real coordinate positioning.
