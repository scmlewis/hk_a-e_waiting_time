# Gestalt & Visual Hierarchy Redesign

**Date:** 2026-08-03
**Status:** Approved
**Approach:** Progressive Disclosure + Visual Weight (Approach A)

---

## Goal

Reduce cognitive load and improve visual appeal by applying Gestalt psychology principles and visual hierarchy to the A&E waiting time app. Primary focus: hero section density and hospital row scanability.

---

## Design Principles Applied

| Principle | Application |
|-----------|-------------|
| **Similarity** | Color-coded left borders (green/amber/red/gray) for instant wait-status scanning |
| **Proximity** | Filters merged into one unit; cluster content tightly grouped with vertical spacing |
| **Figure-ground** | Waiting time becomes the dominant figure; hospital name becomes contextual ground |
| **Continuity** | Left borders create a visual scan line down the hospital list |
| **Closure** | Collapsible info bar — user infers more content behind the expand trigger |

---

## Section 1: Hero/Header Restructure

### Current State
Five stacked elements before any data:
1. Title + tabs
2. Color legend row
3. "Half of waiting patients..." hint
4. Last source update + countdown
5. Location prompt

### Proposed Change
Collapse items 2-4 into a single **collapsible info bar** below the title.

**Collapsed state (default):**
```
[info icon] Last updated: 3/8/2026 10:00AM · Refreshes in 04:49    [▼ Details]
```

**Expanded state:**
```
[info icon] Last updated: 3/8/2026 10:00AM · Refreshes in 04:49    [▲ Details]
  ├─ Color legend: ● Short  ● Moderate  ● Long  ● Unknown
  └─ Hint: "Half of waiting patients can be seen within the following time..."
```

- Default: collapsed
- Location prompt moves below the filter bar (it's an action, not context)

### Rationale
The legend and hint are "learn once, forget" information. Collapsing removes ~60% of pre-data vertical space. The timestamp stays visible because it's time-sensitive.

### Components Affected
- `AppHeader.tsx` — wrap legend/hint in collapsible section
- `App.tsx` — move location prompt below filter bar

---

## Section 2: Filter Bar Restructure

### Current State
Two rows on desktop:
- Row 1: Triage category pills (I, II, III, IV & V)
- Row 2: Search input + Cluster dropdown

### Proposed Change
Merge into a **single sticky toolbar** on desktop:

```
[ I ] [ II ] [ III ] [ IV&V ]    🔍 Search...    [ All clusters ▾ ]
```

- Triage pills on the left (compact — Roman numerals only)
- Search input in the middle
- Cluster dropdown on the right
- Entire bar: subtle bottom border + `backdrop-blur-md` when sticky
- Mobile: no change (bottom bar already handles this)

### Rationale
One line instead of two. Triage pills are the primary filter (used most), so they stay prominent. Search and cluster are secondary but accessible. All filters become one visual unit (Gestalt proximity).

### Components Affected
- `FilterBar.tsx` — restructure to single-row flex layout
- `App.tsx` — update sticky container styling

---

## Section 3: Hospital Row Redesign

### Current State
Each row:
- Hospital name (bold)
- Distance (small, gray)
- Status dot + "Short" label + waiting time + upper bound in parentheses
- "View" button on the right

All rows look identical — must read text to identify wait severity.

### Proposed Change

**Layout (left to right):**
```
[colored border] │ Hospital Name          │  ● SHORT  18 min (44 min)  ›
                 │ 0.8 km                 │
```

- **Left border**: 4px, color-coded by wait status
  - `short` → green (`#4CAF50` or `m3-primary`)
  - `moderate` → amber (`#FF9800`)
  - `long` → red (`#F44336` or `m3-error`)
  - `unknown` → gray (`m3-outline`)
- **Hospital name**: `text-base` (16px), bold, left side
- **Distance**: `text-xs`, muted, below name
- **Waiting time**: `text-lg` (18px), bold, monospace, colored to match border
- **Status label**: small uppercase badge (`text-[10px]`) next to time
- **Upper bound**: parentheses, smaller, muted
- **Chevron icon** (›): replaces "View" button on far right — whole row is clickable

### Visual Weight Distribution
| Element | Weight | Purpose |
|---------|--------|---------|
| Waiting time | Highest (18px, bold, colored) | What users look for first |
| Hospital name | Medium (16px, bold) | Context for the time |
| Status badge | Low (10px, uppercase) | Confirmation of severity |
| Distance | Lowest (11px, muted) | Supplementary info |

### Rationale
Color-coding leverages pre-attentive processing — you can scan the list and spot long waits without reading. The waiting time becomes the figure; the name is the ground.

### Components Affected
- `HospitalTable.tsx` — restructure `<tr>` layout, add left border logic
- `HospitalCard.tsx` — apply same color-coded border treatment for mobile
- `utils/waitTone.ts` — add border color mapping alongside existing text color

---

## Section 4: Cluster Headers

### Current State
Full-width row with:
- Background fill (`bg-m3-surface-container`)
- Bold uppercase text: "HONG KONG EAST (3)"
- Border above and below

Headers blend into the table — don't feel like strong section dividers.

### Proposed Change
- Remove full-width background fill
- **Left accent border**: 2px `m3-primary`, with left padding
- Text: uppercase, `text-[10px]`, wider letter-spacing
- **Vertical padding**: 16px above, 8px below
- Remove bottom border — the gap itself becomes the separator

**Visual result:**
```
  ┃ HONG KONG EAST (3)

  Pamela Youde...              ● SHORT  14 min  ›
  St John Hospital             ● SHORT  14 min  ›

  ┃ HONG KONG WEST (1)

  Queen Mary Hospital          ● SHORT  20 min  ›
```

### Rationale
Left accent creates clear visual hierarchy: cluster headers are labels, not data. Vertical spacing applies Gestalt proximity — content within a cluster is closer than content across clusters.

### Components Affected
- `HospitalTable.tsx` — update cluster header `<tr>` styling
- `App.tsx` — update mobile cluster header styling (border-l approach already partially exists)

---

## Implementation Order

1. **Cluster headers** (Section 4) — smallest change, low risk
2. **Hospital rows** (Section 3) — core visual improvement
3. **Filter bar** (Section 2) — layout restructure
4. **Hero/header** (Section 1) — progressive disclosure

Each section should be implemented and visually verified before moving to the next.

---

## Out of Scope

- Mobile layout changes (bottom bar already works well)
- New color palette — uses existing M3 tokens
- Data flow or state management changes
- Adding new features (map view, etc.)

---

## Accessibility Notes

- Color-coded borders must not be the **only** indicator — status text labels remain
- Collapsible info bar needs `aria-expanded` and `aria-controls`
- Chevron icon needs `aria-hidden="true"` (row is already a clickable element)
- Focus states must remain visible on all interactive elements
