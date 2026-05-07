# Specification Language Quality Checklist: DogGO User Account & Walk Scheduling

**Purpose**: Validate the clarity, precision, and internal consistency of requirement language in the specification — testing whether the written English is unambiguous, well-defined, and internally consistent.  
**Created**: 2026-05-07  
**Feature**: [spec.md](../spec.md)

## Term Definitions & Precision

- [ ] CHK013 Is the term "modals" in FR-003 clarified as modal dialogs vs inline field editors? [Clarity, Spec §FR-003]
- [ ] CHK014 Is "session-based login" in FR-002 qualified with session lifetime / timeout policy? [Gap]
- [ ] CHK015 Is the password hashing algorithm named explicitly in FR-001 rather than deferred to Assumptions (PBKDF2)? [Clarity, Spec §Assumption 3]
- [ ] CHK016 Is "interactive calendar" defined with enough specificity for implementation — month grid, navigation, slot selection? [Ambiguity, Spec §FR-006]
- [ ] CHK017 Is the aggressiveness enum values (low/medium/high) mapped to behavioral meaning or acceptance criteria? [Clarity, Spec §FR-005]
- [ ] CHK018 Is "online" status for walkers defined with activation mechanism and persistence behavior? [Gap]
- [ ] CHK019 Are the WalkRequest status values (pending/accepted/completed/cancelled) each given a trigger condition that causes the state transition? [Ambiguity, Spec §Key Entities — WalkRequest]

## Terminology Consistency Across Sections

- [ ] CHK020 Is "dog owner" used consistently versus "owner" across User Scenarios, FRs, and Key Entities sections? [Consistency, Spec §§FR-006 to FR-009]
- [ ] CHK021 Does "User Settings page" terminology align between Story 1 (settings checkbox for walker role) and FR-003 (settings with editable field modals)? [Consistency, Spec §Story 1 vs §FR-003]
- [ ] CHK022 Is the term "location" used consistently — does it refer to street address or geospatial coordinates across User Stories, FRs, and Edge Cases? [Ambiguity, Spec §§FR-004, FR-006, Edge Case 1]
- [ ] CHK023 Does "pickup location on a map" in Scenario S5-A2-2 match the map technology described elsewhere (spec says Google Maps; plan clarifies OpenStreetMap + Leaflet)? [Consistency, Spec §S5-A2-2 vs Implementation Plan Summary]
- [ ] CHK024 Is "walk request" terminology consistent with "scheduling request" — are these the same entity or different concepts? [Ambiguity, Spec §§Story 3, FR-010]

## Temporal & Flow Clarity

- [ ] CHK025 Is the timing contradiction in Story 1 resolved — it says a new walker can check "I am a dog walker" during signup via settings, but users are not logged in or navigable to settings before account creation? [Ambiguity, Spec §Story 1]
- [ ] CHK026 Are the chronological steps of walk completion (after acceptance) defined — does acceptance transition directly to completed, or is there an intermediate scheduled/in-progress state? [Gap, Spec §S5-A3-2 vs WalkRequest entity]
- [ ] CHK027 Is the expected timeline for a walker's "Go Online" activation to take effect described — instant or with some propagation delay for WebSocket connections? [Ambiguity, Spec §Story 5]

## Measurable Language & Quantifier Gaps

- [ ] CHK028 Is SC-001's registration time metric defined from a clear start point and end state — does "first page visit" include initial load time, and does "authenticated dashboard" mean any authenticated view or the home dashboard? [Ambiguity, Spec §SC-001]
- [ ] CHK029 Is SC-003's threshold of "within 1 hour" qualified with a reference start point — from request submission or from business hours beginning? [Clarity, Spec §SC-003]
- [ ] CHK030 Is the term "business hours" in SC-003 defined — is it configurable, time-zone dependent, or assumed fixed (e.g., 6 AM–10 PM)? [Gap, Spec §SC-003]
- [ ] CHK031 Are walk request notification delivery timing expectations specified for online walkers — immediate real-time push per WebSocket design, or with acceptable polling delay? [Gap, Spec §FR-008 vs Implementation Plan Summary]

## Edge Case & Error Path Language Quality

- [ ] CHK032 Is "appropriate error message" in the past-datetime edge case qualified with content guidance (user-facing wording vs technical detail)? [Ambiguity, Spec §Edge Cases 1]
- [ ] CHK033 Does the unmatched walk request edge case define how long a pending request remains visible to walkers before auto-expiration? [Gap, Spec §Edge Cases 2]
- [ ] CHK034 Is duplicate username validation described with specific error messaging behavior — does the signup form validate uniqueness in real-time or only on submission? [Ambiguity, Spec §Edge Cases 4]

## Assumptions & Dependencies Language Quality

- [ ] CHK035 Is the Google Maps geocoding dependency conflict resolved — spec says "Location coordinates are derived server-side from street addresses using Google Maps geocoding" but plan uses Nominatim/OpenStreetMap? [Conflict, Spec §Assumption 7 vs Implementation Plan Summary]
- [ ] CHK036 Is the assumption about stable internet connectivity linked to user-facing behavior — does poor connectivity trigger an offline fallback message or a retry mechanism? [Gap, Spec §Assumption 1]

## Acceptance Criteria Alignment

- [ ] CHK037 Does SC-004's "zero downtime" claim have a measurable interpretation — zero page reload required, zero session invalidation, or both? [Ambiguity, Spec §SC-004]
- [ ] CHK038 Is there an acceptance criterion for walk scheduling error states (invalid date, unavailable slots) beyond the past-datetime edge case? [Gap]

## Notes

This checklist focuses on language quality — whether terms are defined, usage is consistent across sections, temporal flows are unambiguous, quantifiers are precise, and stated assumptions align with documented decisions. Items reference specific spec locations for traceability.
