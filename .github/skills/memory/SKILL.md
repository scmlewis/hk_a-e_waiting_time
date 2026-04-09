# A&E Waiting Time App — Development Notes

Summary
- Purpose: display HK HA A&E waiting times fetched from public open-data endpoints and present them sorted/filtered with distance and triage views.
- Scope: robust parsing, localization (en/zh-HK), accessibility, small-medium scale performance, periodic refresh.

API & Payload Handling
- Endpoints: primary and fallback endpoints may be used; implement fallback retry on primary failure.
- Payload shape: API can return either an array OR an object with a `waitTime` array and `updateTime` property. Always normalize both shapes.
- Field variability: fields like `t1wt`, `t2wt`, `t3p50`, `t3p95`, `t45p50`, `t45p95` may be numbers, strings, `'-'`, or missing. Use a `normalizeWaitText` helper and treat `'-'`, `''`, `'n/a'`, `'na'` as missing.
- Strings: values contain human text formats: plain minutes, "less than X hour(s)", "over X hour(s)", combinations like "1 hour 30 minutes", fractional hours, or text messages like "Managing multiple resuscitation cases.".

Parsing & Metrics
- Parse robustly: use regexes to extract hours/minutes, handle fractional hours, treat "less than X hour" as X*60 - 1 (or 0 min floor), and map special phrases to `null`.
- Expose both textual and numeric metrics: keep original text, derived minutes (number|null), and derived wait-status (`short`/`moderate`/`long`/`unknown`).
- Be explicit about which metric is displayed and sorted (e.g., `t3p50` used for triage III primary metric).

Error Handling & Network
- Timeouts: use `AbortController` and a sensible fetch timeout (10s used). Allow callers to pass a signal so fetches can be cancelled on unmount.
- Retries: try fallback endpoint when primary fails. Consider exponential backoff for repeated transient errors.
- Distinguish error types: network errors, empty/invalid payload, parse errors — return/throw typed/clear messages to let UI show helpful text.
- Rate limits & caching: avoid aggressive polling; use sensible refresh intervals and debounce user actions that trigger network calls.

State & UI
- Loading states: use skeleton loaders for lists/cards instead of blocking spinners for better perceived performance.
- Empty & error states: explicit messages with actions (retry, clear filters) and accessible `role` attributes (`alert`, `status`).
- Background refresh: support non-blocking background refresh with separate UI indicator; keep previous good data visible while refreshing.
- Cancellation: abort inflight fetch when starting a new refresh or when component unmounts.

Performance
- Memoize list items (`React.memo`) and stable callbacks (`useCallback`) to avoid unneeded re-renders.
- Debounce filter/search inputs (100–300ms) to reduce renders and heavy computations.
- Virtualize long lists (`react-window` / `react-virtual`), especially for table view on large datasets.

Localization
- Detect Chinese characters and return original if already localized.
- Localize common English phrases and time formats for `zh-HK`; keep the original text for unknown phrases.
- Keep both localized text and numeric minutes for sorting and status derivation.

Accessibility
- Use semantic elements (`main`, `header`, `section`, `article`) and proper ARIA attributes for dynamic regions (`aria-live`, `aria-expanded`, `role=dialog` for modals).
- Keyboard support: make cards and interactive rows keyboard-focusable; ensure focus is trapped/returned when mobile sheets open/close.
- Color: do not rely on color alone for triage status — include labels/icons; verify contrast ratios (WCAG AA).

Telemetry & Privacy
- Telemetry: collect minimal, non-sensitive events (view changes, sort/filter usage, errors). Use `navigator.sendBeacon` with fetch fallback and `keepalive` where appropriate.
- Avoid sending PII: do not include patient data or raw phone numbers; hospital names and non-identifiable counts are acceptable.
- Provide an opt-out or document telemetry endpoint in README/env vars.

Testing
- Unit tests for parsing (`parseWaitingMinutes`, `deriveWaitStatus`) covering edge inputs and localization.
- Service tests: mock `fetch` to validate `normalizePayload`, fallback logic, timeout/abort behavior.
- Component tests: accessibility and interaction tests for `HospitalCard`, `FilterBar`, `HospitalTable` using `vitest` + testing-library.

Dev & Environment Notes
- Windows path caveat: parentheses in workspace path can break `npm` script binary resolution on Windows. Workaround: call local binaries explicitly (`node ./node_modules/vite/bin/vite.js`) or adjust `package.json` scripts to use `node` to invoke binaries.
- Vite HMR overlay will show missing-import errors; keep imports and filenames consistent (case-sensitive on some platforms).
- Vite base path for GitHub Pages handled in `vite.config.ts` via env variables.

UI/UX Recommendations (implementation-friendly)
- Add a small summary card showing hospital count, avg wait, worst wait, and last update.
- Make primary filters (triage, search) prominent; collapse advanced filters on mobile into a bottom sheet.
- Provide legend and short tooltip explaining the metrics (what t3p50 and t3p95 mean).
- Add a map view as optional enhancement (plot hospitals, click to focus) for better discovery.

Deployment
- Ensure `VITE_AE_PRIMARY_ENDPOINT`, `VITE_AE_FALLBACK_ENDPOINT`, and `VITE_TELEMETRY_ENDPOINT` are set in production environment.
- Build step: `tsc -b && vite build`. Confirm runtime errors do not surface in production by running a production build and smoke test.

Things to Avoid
- Relying solely on textual patterns without robust tests — API textual variety is broad.
- Sending unrestricted strings to telemetry (sanitize and limit length).
- Aggressive polling without rate-limiting or exponential backoff.

Useful Implementation Details
- Normalize API payload early in the service layer.
- Keep original texts and derived numeric values together in `HospitalWaitingTime` shape to allow both display and sorting.
- Use `AbortController` and accept `signal` in service functions to support cancellation.

These notes capture repeated gotchas, design choices, and recommended practices for working with HK A&E waiting-time open data and the app's codebase.
