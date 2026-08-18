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
- `src/components/HospitalMap.tsx` — the SVG canvas, markers, user-location overlay,
  and popup state management.
- `src/components/MapPopup.tsx` — the info card rendered as an accessible `dialog` overlay.

### Modified files
- `src/components/AppHeader.tsx` — add `map` tab.
- `src/App.tsx` — render `<HospitalMap>` when `activeView === 'map'`; pass the props above;
  add `trackEvent('map_view_opened', ...)` in `handleViewChange` when target is `'map'`.
- `src/constants/labels.ts` — add `viewMap`, and popup strings
  (`mapPopup.phone`, `mapPopup.openInMaps`, `mapPopup.yourLocation`, `mapPopup.waitTime`).
- `src/constants/labels.ts` (zh-HK block) — matching Traditional Chinese strings.

## Rendering details

### SVG canvas
- A responsive container with a fixed aspect ratio (e.g. `aspect-[4/3]` or `16/10`),
  holding an `<svg viewBox="0 0 W H" preserveAspectRatio="xMidYMid meet">`.
- Background: a plain `<rect>` filled with `m3-surface-container` (CSS var) — an honest
  schematic, **no fake coastline**. Theme adapts automatically via CSS vars.
- Projection helper maps each hospital `lat/lng` to `(x, y)` within the padded viewBox.

### Markers
- One `<circle>` (or small `<g>`) per hospital that has a `location`.
- `fill` = the wait-status color of the **selected triage category** for that hospital:
  green (`short`), amber (`moderate`), red (`long`), grey (`unknown`) — reuse the exact
  legend hex values already used in `AppHeader`.
- Marker is keyboard-accessible: `role="button"`, `tabIndex={0}`, `aria-label` with hospital
  name + wait time, `onKeyDown` for Enter/Space.
- Clicking/tapping a marker sets the selected hospital and opens the popup.

### User location overlay
- If `userLocation` is present and `locationStatus === 'ready'`, render a distinct blue dot
  (different shape/size from hospital markers) and a faint translucent `<circle>` radius
  (~5 km, computed via the same projection scale) for spatial context.

### Popup (`MapPopup.tsx`)
- Rendered as an absolutely-positioned HTML overlay (not SVG) with `role="dialog"`,
  `aria-modal="false"`, an accessible name, and a close button.
- Contents:
  - Hospital name (localized for `zh-HK` when applicable — reuse existing localization).
  - Wait time text for the **selected triage category** (e.g. "Category III: 45 min (≤ 60)").
  - Phone: `tel:` dial link from `hospital.details.phone.dialHref`.
  - "Open in Maps" link to `hospital.details.mapsUrl` (opens new tab, `rel="noopener"`).
- Closing: Escape key, explicit close button, or tapping empty map area.

## States & edge cases
- `loading`: show a skeleton/placeholder block (mirror existing mobile skeleton style).
- `error` (no hospitals loaded): show the existing error message pattern.
- Hospital with no `location`: skipped from markers (defensive; all 18 current hospitals
  have coordinates).
- No user location: user-location overlay simply not rendered.

## Telemetry
- `trackEvent('map_view_opened')` when switching to the map tab (in `handleViewChange`).
- `trackEvent('map_marker_tapped', { hospitalName })` on marker selection.
- Mirrors the existing `trackEvent` usage elsewhere in `App.tsx`.

## i18n
New keys in `src/constants/labels.ts` (English + `zh-HK`):
- `viewMap` → "Map" / "地圖"
- `mapPopup.phone` → "Phone" / "電話"
- `mapPopup.openInMaps` → "Open in Maps" / "在地圖中開啟"
- `mapPopup.yourLocation` → "Your location" / "你的位置"
- `mapPopup.waitTime` → "Wait time" / "輪候時間"

## Testing
- `src/utils/geoProjection.test.ts`: projection math (known lat/lng → expected x/y,
  north-up flip, bounds clamping).
- `src/components/HospitalMap.test.tsx`: markers render for the filtered set, popup opens on
  marker activation and closes on Escape/close button, user-location marker renders when
  location is ready. Follow the Vitest + RTL style of `src/App.test.tsx`.

## Out of scope (YAGNI)
- No street-level tiles, pan/zoom drag, or scroll/pinch zoom.
- No routing / directions / travel-time computation.
- No new data source, backend, accounts, or API keys.
- No fake coastline / detailed geography beyond real coordinate positioning.
