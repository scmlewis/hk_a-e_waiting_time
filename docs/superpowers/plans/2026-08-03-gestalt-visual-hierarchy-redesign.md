# Gestalt & Visual Hierarchy Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Gestalt psychology principles and visual hierarchy to reduce cognitive load and improve scanability of the A&E waiting time app.

**Architecture:** Four incremental visual changes to existing components — cluster headers, hospital rows, filter bar, and hero section. Each section is self-contained and can be verified independently. No new data flow or state management changes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Vite 7, Vitest

## Global Constraints

- Dark theme only (existing M3 color tokens in `index.css`)
- Must maintain existing responsive behavior (mobile bottom bar, desktop sticky filter)
- Must preserve accessibility (ARIA labels, focus states, keyboard navigation)
- No new dependencies
- Existing tests must pass; update tests as needed for changed DOM structure

---

## File Map

| File | Change |
|------|--------|
| `src/utils/waitTone.ts` | Add `getWaitingTimeBorderColor` utility |
| `src/components/HospitalTable.tsx` | Color-coded left borders, row redesign, cluster header restyle |
| `src/components/HospitalCard.tsx` | Adjust border width from 3px to 4px for consistency |
| `src/components/FilterBar.tsx` | Merge two rows into single-line toolbar |
| `src/components/AppHeader.tsx` | Collapse legend + hint into expandable info bar |
| `src/components/LastUpdated.tsx` | Make collapsible, integrate into info bar |
| `src/App.tsx` | Move location prompt below filter bar, update sticky container |

---

### Task 1: Add border color utility to waitTone.ts

**Files:**
- Modify: `src/utils/waitTone.ts`
- Test: `src/utils/waitTone.test.ts` (create if needed)

**Interfaces:**
- Consumes: `WaitStatus` type from `src/types/ae.ts`
- Produces: `getWaitingTimeBorderColor(waitStatus, isDark)` → string of Tailwind border-left classes

- [ ] **Step 1: Add the new utility function**

```typescript
export function getWaitingTimeBorderColor(waitStatus: WaitStatus, isDark: boolean): string {
  if (isDark) {
    return {
      short: 'border-l-green-400',
      moderate: 'border-l-amber-400',
      long: 'border-l-red-400',
      unknown: 'border-l-neutral-500',
    }[waitStatus]
  }

  return {
    short: 'border-l-green-600',
    moderate: 'border-l-amber-600',
    long: 'border-l-red-600',
    unknown: 'border-l-neutral-500',
  }[waitStatus]
}
```

- [ ] **Step 2: Run existing tests to verify no regressions**

Run: `npm test`
Expected: PASS (existing tests unaffected)

- [ ] **Step 3: Commit**

```bash
git add src/utils/waitTone.ts
git commit -m "feat: add getWaitingTimeBorderColor utility for left-border coloring"
```

---

### Task 2: Redesign hospital table rows (desktop)

**Files:**
- Modify: `src/components/HospitalTable.tsx:110-158`

**Interfaces:**
- Consumes: `getWaitingTimeBorderColor` from Task 1, existing `getWaitingTimeTone` and `getWaitingTimeDot`
- Produces: Modified table row JSX (no new exports)

- [ ] **Step 1: Update the row `<tr>` to include color-coded left border**

Replace the `<tr>` at line 112-114 with:

```tsx
<tr
  onClick={() => onToggleExpanded(hospital.hospitalName)}
  className={`group cursor-pointer border-t border-m3-outline-variant border-l-[4px] transition-colors duration-150 hover:bg-m3-surface-container-low ${getWaitingTimeBorderColor(selectedTriage.waitStatus, isDark)}`}
>
```

- [ ] **Step 2: Update the hospital name cell for larger text**

Replace the `<td>` at line 116-124 with:

```tsx
<td className="px-4 py-3">
  <div className="text-base font-bold text-m3-on-surface">{hospital.hospitalName}</div>
  {typeof hospital.distanceKm === 'number' && (
    <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-normal text-m3-on-surface-variant">
      <Icon name="map-pin" className="h-3 w-3" strokeWidth={2} />
      {formatDistanceKm(hospital.distanceKm, languageMode)}
    </div>
  )}
</td>
```

- [ ] **Step 3: Update the waiting time cell for dominant visual weight**

Replace the `<td>` at line 125-143 with:

```tsx
<td className="px-4 py-3">
  <div className="flex items-center gap-2">
    <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-m3-on-surface-variant">
      <span className={`h-1.5 w-1.5 rounded-full ${getWaitingTimeDot(selectedTriage.waitStatus)}`} />
      {selectedTriage.waitStatus === 'short' ? labels.shortWait : selectedTriage.waitStatus === 'moderate' ? labels.moderateWait : selectedTriage.waitStatus === 'long' ? labels.longWait : labels.unknownWait}
    </span>
    <span className={`text-lg font-bold font-mono tracking-tight ${getWaitingTimeTone(selectedTriage.waitStatus, isDark)}`}>
      {selectedTriage.waitingTimeText}
    </span>
    {selectedTriage.upperBoundText && (
      <span className="text-sm font-normal text-m3-on-surface-variant/60">
        (<span className={`font-semibold font-mono ${getWaitingTimeTone(selectedTriage.upperBoundWaitStatus ?? deriveWaitStatusFromText(selectedTriage.upperBoundText, selectedTriage.waitStatus), isDark)}`}>
          {selectedTriage.upperBoundText}
        </span>)
      </span>
    )}
  </div>
</td>
```

- [ ] **Step 4: Replace the "View" button with a chevron icon**

Replace the `<td>` at line 145-158 with:

```tsx
<td className="px-4 py-3">
  <Icon
    name="chevron-down"
    className="h-4 w-4 -rotate-90 text-m3-on-surface-variant group-hover:text-m3-on-surface"
  />
</td>
```

- [ ] **Step 5: Run tests and verify visually**

Run: `npm test`
Expected: PASS

Run: `npm run dev`
Expected: Hospital rows show color-coded left borders, larger waiting times, chevron instead of "View" button

- [ ] **Step 6: Commit**

```bash
git add src/components/HospitalTable.tsx
git commit -m "feat: redesign hospital table rows with color-coded borders and visual hierarchy"
```

---

### Task 3: Redesign cluster headers (desktop)

**Files:**
- Modify: `src/components/HospitalTable.tsx:97-103`

**Interfaces:**
- Consumes: None (styling change only)
- Produces: Modified cluster header row JSX

- [ ] **Step 1: Update cluster header `<tr>` styling**

Replace the cluster header `<tr>` at line 99-103 with:

```tsx
<tr>
  <td colSpan={3} className="border-l-2 border-l-m3-primary px-4 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-m3-on-surface-variant">
    {group.displayCluster} ({group.hospitals.length})
  </td>
</tr>
```

- [ ] **Step 2: Remove the background fill and old borders**

The old `<tr>` had `border-y border-m3-outline-variant bg-m3-surface-container`. The new version removes those — the left accent border and vertical padding create the visual separation.

- [ ] **Step 3: Run tests and verify visually**

Run: `npm test`
Expected: PASS

Run: `npm run dev`
Expected: Cluster headers show left accent border, no background fill, increased vertical spacing

- [ ] **Step 4: Commit**

```bash
git add src/components/HospitalTable.tsx
git commit -m "feat: restyle cluster headers with left accent border and vertical spacing"
```

---

### Task 4: Match mobile hospital card border width

**Files:**
- Modify: `src/components/HospitalCard.tsx:57`

**Interfaces:**
- Consumes: None (styling change only)
- Produces: Updated border width class

- [ ] **Step 1: Update border width from 3px to 4px**

In `HospitalCard.tsx` line 57, change `border-l-[3px]` to `border-l-[4px]`:

```tsx
className={`enter-fade-up cursor-pointer border-l-[4px] border-r border-y border-t-transparent border-b-transparent p-4 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface ${getWaitingTimeBorder(selectedTriage.waitStatus, isDark)} ${
```

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/HospitalCard.tsx
git commit -m "fix: match mobile card border width to desktop table (4px)"
```

---

### Task 5: Merge filter bar into single-line toolbar

**Files:**
- Modify: `src/components/FilterBar.tsx`

**Interfaces:**
- Consumes: Existing `FilterBarProps` (no interface changes)
- Produces: Single-line flex layout on desktop

- [ ] **Step 1: Restructure the filter bar layout**

Replace the entire return block (lines 35-118) with:

```tsx
return (
  <section className="flex flex-wrap items-end gap-3 border border-m3-outline-variant p-3 md:p-4">
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label={labels.triageCategory}>
      {(['I', 'II', 'III', 'IV_V'] as const).map((category) => {
        const selected = selectedTriageCategory === category
        const label = category === 'IV_V' ? 'IV & V' : category

        return (
          <button
            key={category}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onTriageCategoryChange(category)}
            className={`min-h-10 cursor-pointer px-3 py-1.5 text-xs font-medium transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface ${
              selected
                ? 'border border-m3-primary bg-m3-primary-container text-m3-on-primary-container'
                : 'border border-m3-outline text-m3-on-surface-variant hover:bg-m3-surface-container-high'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>

    <div className="flex-1 min-w-[160px]">
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={labels.searchPlaceholder}
          className="w-full border-b border-m3-outline bg-transparent px-1 py-2 pr-8 text-sm font-medium text-m3-on-surface placeholder:text-m3-on-surface-variant/50 transition-colors duration-200 focus-visible:border-m3-primary focus-visible:outline-none"
        />
        {searchValue.length > 0 && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-m3-on-surface-variant hover:text-m3-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary"
            aria-label="Clear search"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>

    {clusterOptions.length > 0 && (
      <div className="min-w-[140px]">
        <select
          value={selectedCluster}
          onChange={(event) => onClusterChange(event.target.value)}
          style={{ colorScheme: 'dark' }}
          className="w-full cursor-pointer border-b border-m3-outline bg-transparent px-1 py-2 text-sm font-medium text-m3-on-surface transition-colors duration-200 focus-visible:border-m3-primary focus-visible:outline-none"
        >
          <option value="">{labels.allClusters}</option>
          {clusterOptions.map((cluster) => (
            <option key={cluster.value} value={cluster.value}>
              {cluster.label}
            </option>
          ))}
        </select>
      </div>
    )}
  </section>
)
```

- [ ] **Step 2: Remove unused label properties**

Remove `defaultTriageView` and `triageCategory` from `FilterBarLabels` and update the interface. Remove `searchHospital` and `cluster` labels (no longer displayed as separate headers).

Updated interface:

```typescript
interface FilterBarLabels {
  searchPlaceholder: string
  allClusters: string
}
```

- [ ] **Step 3: Update App.tsx to pass only required labels**

In `App.tsx`, update the FilterBar label prop (around line 467):

```tsx
<FilterBar
  labels={{
    searchPlaceholder: labels.filter.searchPlaceholder,
    allClusters: labels.filter.allClusters,
  }}
  searchValue={searchValue}
  onSearchChange={handleSearchChange}
  selectedTriageCategory={selectedTriageCategory}
  onTriageCategoryChange={handleTriageCategoryChange}
  clusterOptions={clusterOptions}
  selectedCluster={selectedCluster}
  onClusterChange={handleClusterChange}
/>
```

Do this for both the desktop FilterBar (line 467) and the mobile sheet FilterBar (line 644).

- [ ] **Step 4: Run tests and verify visually**

Run: `npm test`
Expected: PASS (update any tests that reference removed labels)

Run: `npm run dev`
Expected: Filter bar is a single line on desktop with triage pills, search, and cluster dropdown

- [ ] **Step 5: Commit**

```bash
git add src/components/FilterBar.tsx src/App.tsx
git commit -m "feat: merge filter bar into single-line toolbar"
```

---

### Task 6: Collapse hero info into expandable bar

**Files:**
- Modify: `src/components/AppHeader.tsx`
- Modify: `src/components/LastUpdated.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: Existing props (no new data needed)
- Produces: Collapsible info bar combining timestamp, legend, and hint

- [ ] **Step 1: Update AppHeader to use collapsible info bar**

Replace the legend and hint sections (lines 108-185) with a single collapsible info bar. The timestamp will be passed as a child or integrated separately.

Update `AppHeaderProps` to include timestamp props:

```typescript
interface AppHeaderProps {
  labels: AppLabels
  languageMode: LanguageMode
  loading: boolean
  isRefreshing: boolean
  activeView: AppView
  isLegendExpanded: boolean
  sourceUpdateTime: string
  countdownSeconds: number
  isStale: boolean
  waitSemanticsHint: string
  toggleLanguageMode: () => void
  loadData: () => Promise<void>
  handleViewChange: (view: AppView) => void
  setIsLegendExpanded: (expanded: boolean) => void
}
```

Replace lines 108-185 with:

```tsx
{activeView === 'wait-times' && (
  <div className="mt-4">
    <button
      type="button"
      onClick={() => setIsLegendExpanded(!isLegendExpanded)}
      className="flex w-full items-center justify-between gap-2 border border-m3-outline-variant px-3 py-2.5 text-xs font-medium tracking-wide text-m3-on-surface-variant transition-colors duration-200 hover:bg-m3-surface-container-high"
    >
      <span className="flex items-center gap-2">
        <Icon name="info" className="h-3.5 w-3.5" strokeWidth={2.5} />
        <span className="font-mono text-[11px] text-m3-on-surface">
          {sourceUpdateTime || labels.lastUpdated.unknownTimestamp}
        </span>
        <span className="text-m3-on-surface-variant/60">·</span>
        <span className="text-[10px] text-m3-primary font-mono">
          {formatCountdown(countdownSeconds)}
        </span>
      </span>
      <Icon
        name="chevron-down"
        className={`h-3.5 w-3.5 transition-transform duration-200 ${isLegendExpanded ? 'rotate-180' : ''}`}
        strokeWidth={2.5}
      />
    </button>
    <div
      className={`grid overflow-hidden transition-all duration-200 ${
        isLegendExpanded ? 'mt-2 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="min-h-0">
        <div className="flex flex-wrap gap-3 border border-m3-outline-variant border-t-0 px-3 py-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {labels.shortWait}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {labels.moderateWait}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {labels.longWait}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-m3-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-m3-outline" />
            {labels.unknownWait}
          </span>
        </div>
        <div
          className="border border-m3-outline-variant border-t-0 border-l-2 border-l-m3-outline pl-3 py-2 text-xs leading-relaxed font-medium text-m3-on-surface-variant"
          role="note"
        >
          {waitSemanticsHint}
        </div>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 2: Add formatCountdown import to AppHeader**

```typescript
import { formatCountdown } from '../utils/time'
```

- [ ] **Step 3: Remove the standalone LastUpdated component from App.tsx**

In `App.tsx`, remove the `<LastUpdated>` component render (around lines 435-441). The timestamp is now inside AppHeader.

- [ ] **Step 4: Update App.tsx to pass timestamp props to AppHeader**

Add the new props to the AppHeader render in App.tsx:

```tsx
<AppHeader
  labels={labels}
  languageMode={languageMode}
  loading={loading}
  isRefreshing={isRefreshing}
  activeView={activeView}
  isLegendExpanded={isLegendExpanded}
  sourceUpdateTime={sourceUpdateTime}
  countdownSeconds={countdown}
  isStale={isStale}
  waitSemanticsHint={waitSemanticsHint}
  toggleLanguageMode={toggleLanguageMode}
  loadData={loadData}
  handleViewChange={handleViewChange}
  setIsLegendExpanded={setIsLegendExpanded}
/>
```

- [ ] **Step 5: Run tests and verify visually**

Run: `npm test`
Expected: PASS (update any tests that reference LastUpdated as a separate element)

Run: `npm run dev`
Expected: Hero shows a single collapsible bar with timestamp and countdown; expanding reveals legend and hint

- [ ] **Step 6: Commit**

```bash
git add src/components/AppHeader.tsx src/App.tsx
git commit -m "feat: collapse hero info into expandable bar"
```

---

### Task 7: Move location prompt below filter bar

**Files:**
- Modify: `src/App.tsx:443-462`

**Interfaces:**
- Consumes: Existing location state and handlers
- Produces: Location prompt rendered after filter bar

- [ ] **Step 1: Move the location prompt section**

In `App.tsx`, move the `shouldShowLocationPrompt` block (lines 443-462) to after the sticky filter bar container (after line 478). The new location:

```tsx
{/* After the sticky filter bar div closes */}

{shouldShowLocationPrompt && (
  <section
    className="border border-m3-outline-variant p-3 md:p-4"
    aria-live="polite"
  >
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-m3-on-surface-variant md:text-base">
        {labels.sortNearest} &bull; {labels.distanceEstimateHint}
      </p>
      <button
        type="button"
        onClick={() => void handleUseMyLocation()}
        className="inline-flex min-h-11 items-center bg-m3-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-m3-on-primary transition-colors duration-200 hover:bg-m3-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-surface"
      >
        <Icon name="map-pin" className="mr-2 h-3.5 w-3.5" strokeWidth={2.5} />
        {labels.useMyLocation}
      </button>
    </div>
  </section>
)}
```

- [ ] **Step 2: Run tests and verify visually**

Run: `npm test`
Expected: PASS

Run: `npm run dev`
Expected: Location prompt appears below the filter bar, not in the hero section

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: move location prompt below filter bar"
```

---

### Task 8: Final verification and cleanup

**Files:**
- No new files

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All tests PASS

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Visual QA on desktop and mobile**

Run: `npm run dev`
Check:
- [ ] Hero section is compact — single collapsible bar
- [ ] Expanding info bar shows legend + hint
- [ ] Filter bar is single line on desktop
- [ ] Hospital rows have color-coded left borders
- [ ] Waiting times are larger and dominant
- [ ] Chevron replaces "View" button
- [ ] Cluster headers have left accent border
- [ ] Location prompt is below filter bar
- [ ] Mobile layout still works (bottom bar, card layout)
- [ ] All interactive elements have focus states

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: apply Gestalt principles and visual hierarchy redesign"
```
