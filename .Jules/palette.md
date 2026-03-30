## 2025-05-14 - ARIA attributes for Radio Roles
**Learning:** Adding `aria-pressed` to elements with `role="radio"` is redundant and technically incorrect according to WAI-ARIA standards. `role="radio"` should use `aria-checked` to indicate state.
**Action:** Always use `aria-checked` for radio roles and reserve `aria-pressed` for toggle buttons.

## 2025-05-14 - Component Interface Consistency
**Learning:** When localizing hardcoded strings by moving them to a shared labels constant, ensure the sub-component's label interface is also updated to avoid ReferenceErrors and maintain type safety.
**Action:** Trace all localized string usages back to their component interfaces and update them accordingly.
