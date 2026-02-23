Project Specification
A&E Waiting Time Web App (Hong Kong HA Open Data)

Last updated: 2026-02-23
Status: Refined for MVP implementation

1. Objective

Build a lightweight, mobile-first web app that:

- Fetches near real-time A&E waiting-time data from Hong Kong HA public data
- Displays waiting times by hospital
- Supports searching and sorting
- Auto-refreshes every 5 minutes with visible countdown
- Deploys as static hosting (Vercel or Netlify)

Reference dataset page:
https://data.gov.hk/tc-data/dataset/hospital-hadata-ae-waiting-time

2. Confirmed Product Decisions (Locked)

- Primary source strategy: HA official API as primary endpoint, data.gov.hk endpoint as fallback
- Default wait metric for ranking and status: t45p50
- Region filtering: include only if region field exists in API payload; otherwise hide region filter in MVP
- Status thresholds (based on selected metric in minutes):
  - Green: < 60
  - Yellow: 60 to 119
  - Red: >= 120

3. Target Users

- Hong Kong residents checking current A&E crowding/wait
- Mobile-first users
- Non-technical users who need quick status visibility

4. Technical Stack

- Frontend: React + TypeScript (preferred; static SPA)
- State management: React hooks only
- Styling: Tailwind CSS
- Data fetch: native fetch API (SWR optional later)
- Deployment: static build on Vercel or Netlify

5. MVP Scope

5.1 Data Layer

Required module:

- /src/services/aeService.ts

Responsibilities:

- Fetch data from primary endpoint
- Fallback to secondary endpoint on failure
- Validate/normalize payload to app domain model
- Handle timeout, network failure, and invalid payload safely

Domain interface (normalized):

HospitalWaitingTime {
  hospitalName: string
  waitingTimeText: string
  waitingMinutes: number | null
  waitStatus: "short" | "moderate" | "long" | "unknown"
  updateTime: string
  metricUsed: "t45p50"
  region?: string
}

Notes:

- topWaitingCategory is removed from MVP model because it is not guaranteed in source payload
- waitStatus is derived using locked threshold rules

5.2 UI Components

Required structure:

- /src/components/HospitalTable.tsx
- /src/components/HospitalCard.tsx
- /src/components/FilterBar.tsx
- /src/components/LastUpdated.tsx

HospitalTable requirements:

- Sort by waiting time (default)
- Sort alphabetically by hospital name
- Tie-break rule for equal waiting values: hospital name ascending
- Responsive behavior for desktop/tablet

HospitalCard (mobile) requirements:

- Card layout per hospital
- Display status color and text label (color is not the only status indicator)

FilterBar requirements:

- Search by hospital name
- Region filter shown only when region data exists

LastUpdated requirements:

- Show source update timestamp clearly
- Show next-refresh countdown clearly

5.3 Auto Refresh and Failure Behavior

- Poll interval: every 5 minutes
- Countdown timer: visible and updates every second
- On fetch failure:
  - Keep and display last successful data if available
  - Show non-blocking error state/banner
  - Retry on next interval

5.4 UX States

- Loading skeleton state for initial load
- Error state for no data available
- Clear empty-state copy if no search results
- Clean, minimal, mobile-first visual layout

6. Non-Functional Requirements

- TypeScript strict mode enabled
- No runtime console errors in normal flow
- Modular folder structure
- Easy extension path for future charts and map
- Basic accessibility:
  - Keyboard-accessible sort controls
  - Sufficient focus visibility
  - Status text labels in addition to color

7. Recommended Project Structure

- /src/main.tsx
- /src/App.tsx
- /src/types/ae.ts
- /src/services/aeService.ts
- /src/components/HospitalTable.tsx
- /src/components/HospitalCard.tsx
- /src/components/FilterBar.tsx
- /src/components/LastUpdated.tsx
- /src/utils/parseWaitTime.ts
- /src/utils/sort.ts
- /src/utils/time.ts
- /src/constants/thresholds.ts

8. Acceptance Criteria (MVP)

- App loads and displays hospitals with normalized waiting data
- Sorting by wait and alphabet works correctly and deterministically
- Hospital name search works on mobile and desktop
- Status color and status text match locked threshold rules
- Auto-refresh occurs every 5 minutes and countdown is visible
- On network failure, app does not crash and communicates stale/failure state
- Static build deploys successfully on Vercel or Netlify

9. Risks and Mitigations

- Risk: API schema changes
  - Mitigation: normalization guard and safe fallback handling
- Risk: missing region field
  - Mitigation: conditional UI (hide region filter if absent)
- Risk: source latency/temporary outage
  - Mitigation: last-successful-data retention and retry loop

10. Phase 2 (Out of MVP)

- Historical trend chart (requires stable historical data source)
- Map view (requires reliable geospatial mapping source)
- Dark mode
- Region grouping enhancements
- Bookmark favorite hospitals (localStorage)
