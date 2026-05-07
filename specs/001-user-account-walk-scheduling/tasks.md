# Tasks: DogGO User Account & Walk Scheduling Management

**Feature Branch**: `001-user-account-walk-scheduling`  
**Spec**: [spec.md](./specs/001-user-account-walk-scheduling/spec.md)  
**Plan**: [plan.md](./specs/001-user-account-walk-scheduling/plan.md)  

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Finalize existing project structure, dependencies, and configuration to match the implementation plan.

- [ ] T001 Update `backend/settings.py` — add `channels_redis`, replace InMemoryChannelLayer with Redis channel layer, set up session/auth backend config
- [ ] T002 Add missing Python dependencies (`channels-redis`, `psycopg2-binary` already present) to `backend/requirements.txt` and install them in the virtual environment
- [ ] T003 Update `docker-compose.yml` — add Redis service, ensure PostgreSQL with PostGIS extension image, configure proper network and healthchecks for all services (db, redis, backend, frontend, nginx)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure changes that MUST be complete before any user story can function correctly. **CRITICAL: No user story work can begin until this phase is complete.**

### Authentication Migration (JWT → Session-Based)
- [ ] T004 Remove `djangorestframework-simplejwt` dependency from `backend/requirements.txt`, uninstall in venv, and remove all JWT-related imports/configuration (`SimpleJWT` views, token refresh logic, JWT authentication class in settings)
- [ ] D005 Update `backend/settings.py` — set `AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']`, configure session engine to use database backend (`SESSION_ENGINE = 'django.contrib.sessions.backends.db'`), enable CSRF middleware (already present), add `SESSION_COOKIE_HTTPONLY = True` and `CSRF_COOKIE_HTTPONLY = True`
- [ ] D006 Create `backend/users/views.py` — implement `register()` view: remove email validation, add phone field to request parsing, use Django's built-in password hashing (`create_user`), set session cookie via `login()` instead of JWT tokens, return user object with session cookie
- [ ] D007 Update `backend/urls.py` — replace TokenObtainPairView and TokenRefreshView paths with Django Session authentication endpoints: add `LoginView` route at `/api/auth/login/`, add logout view at `/api/auth/logout/` that clears the session

### Frontend Auth Migration (JWT → Session)
- [ ] D008 Update `frontend/src/services/api.js` — remove Bearer token interceptor, replace with `{ withCredentials: true }` for cookie-based auth so CSRF tokens and session cookies are sent automatically; add CSRF token fetch on app initialization via `/api/csrf/` endpoint
- [ ] D009 Update `frontend/src/context/AuthContext.jsx` — rewrite `login()` to use session POST (no localStorage tokens), remove `localStorage.getItem/setItem('access_token'/'refresh_token')`, update `register()` to not pass email, update `isLoggedIn` check to rely on `/api/users/me/` response rather than token presence
- [ ] D010 Update `frontend/src/pages/LoginPage.jsx` — change login API call from JWT endpoint (`/auth/token/`) to Django session login endpoint with CSRF header and credentials flag

### Model Foundation Migration
- [ ] T011 Create migration for User model: add `first_name`, `last_name`, `phone` (CharField max_length=20, regex validated), remove email from required fields — update `backend/users/models.py` to match data-model.md spec
- [ ] D012 Create migration for OwnerProfile: add `home_address_text` (CharField max_length=500, default empty string) alongside existing `home_location` PointField; create initial migration applying these changes

---

**Checkpoint**: Foundation ready — authentication now uses Django sessions with cookie-based CSRF protection. User model supports phone/role fields. No JWT remains in the codebase. User Story implementation can begin.

---

## Phase 3: User Story 1 - Account Creation and Authentication (Priority: P1) 🎯 MVP

**Goal**: New users register with username/phone/password/address, log in via session auth, and access authenticated dashboard. Dog walkers enable walker role via settings checkbox.

**Independent Test**: A new user can register without email using username+phone+password+address and be automatically logged into the app's core interface.

- [ ] D013 Update `frontend/src/pages/SignupPage.jsx` — remove email field from form state and JSX inputs, add phone number input with validation (`^\+?\d{7,20}$`), change API call to session-based register endpoint without email
- [ ] D014 Implement role toggle on settings page: update `frontend/src/pages/ProfileOwner.jsx` or create new RolePage to include "I am a dog walker" checkbox that updates user.role via PATCH `/api/users/me/`; if WalkerProfile does not exist yet, auto-create it when role changes
- [ ] D015 Update `backend/users/views.py` — modify existing register endpoint to match new spec (remove email validation, add phone field), ensure session login on registration success; update UserSerializer in `serializers.py` to include `first_name`, `last_name`, `phone`, remove `email` from required fields

**Checkpoint**: Users can sign up with username/phone/password/address (no email) and get a Django session cookie. Dog walkers can toggle walker role via settings page.

---

## Phase 4: User Story 2 - Account Profile Management (Priority: P1)

**Goal**: Logged-in users view and update their account information, address, and password through the settings/profile pages without losing their login session.

**Independent Test**: A logged-in user navigates to profile page, edits phone number and address fields, saves changes, and sees updated values reflected immediately — all without re-login required.

- [ ] D016 Update `frontend/src/pages/ProfileOwner.jsx` — add editable form for username, first name, last name, phone number fields; implement save handler calling PATCH `/api/users/me/`; handle 400 validation errors from the API
- [ ] D017 Implement password change in profile page: add "Change Password" section with current-password verification (old_password/new_password fields), call appropriate endpoint on `backend/users/views.py` that validates current password before updating
- [ ] D018 Update address edit functionality in ProfileOwner — ensure home_address_text update triggers server-side geocoding via Nominatim; update frontend to show loading state during geocoding and display error if geocoding fails
- [ ] D019 Create walker settings page: add role toggle checkbox, service radius input field (numeric, 0.1–32 km range validation), max_dogs selector (1–10) into `frontend/src/pages/ProfileWalker.jsx`

**Checkpoint**: Users can fully manage their profile including username, phone, address changes with geocoding refresh, and password updates — all within an active session without interruption.

---

## Phase 5: User Story 3 - Dog Profile Creation (Priority: P2)

**Goal**: Dog owners create dog profiles containing name, breed, size/disposition text, aggressiveness level via existing DogsPage; walkers see this information on walk requests.

**Independent Test**: A logged-in owner creates a dog profile with name/breed/notes/aggressiveness and views it in their dashboard.

- [ ] D020 Update `backend/walks/models.py` — replace `size` CharField (SMALL/MEDIUM/LARGE) with `notes` TextField for disposition description, add back `size` as optional field if needed; ensure `aggressiveness` choices are (`LOW`, `MEDIUM`, `HIGH`)
- [ ] D021 Update dog serializer in `backend/walks/serializers.py` — adjust fields to match new model (notes replacing size), keep owner read-only, add aggressiveness default value ('LOW') in serializer Meta
- [ ] D022 Update `frontend/src/pages/DogsPage.jsx` — update form inputs: replace dropdown with text field for disposition notes (or optional size dropdown + notes text area); ensure aggressiveness level selector renders LOW/MEDIUM/HIGH options; add validation that name is non-empty on submit

**Checkpoint**: Dog profiles store disposition information via notes/text fields and aggressiveness levels. Frontend allows owners to create/edit dogs with all required information visible to walkers on requests.

---

## Phase 6: User Story 4 - Walk Scheduling by Dog Owner (Priority: P2)

**Goal**: Dog owner uses calendar interface to select date/time, chooses walk duration (30 or 60 min), enters pickup details, and submits scheduling request matched with nearby walkers.

**Independent Test**: A logged-in dog owner opens a schedule page, selects a future date/time from calendar widget, picks walk duration, enters pickup address, and the scheduling request is created successfully.

### Backend Implementation
- [ ] D023 Add `scheduled_time` (DateTimeField) to `backend/walks/models.py` WalkRequest model; add serializer field in `backend/walks/serializers.py`; update migration for new column
- [ ] D024 Implement walk request creation view logic in `backend/walks/views.py` — POST `/api/walk-requests/`: validate duration_minutes is 30 or 60 only, validate scheduled_time is not in the past, geocode pickup address via Nominatim server-side (create service function), create WalkRequest with SEARCHING status
- [ ] D025 Create `backend/services/geocoding.py` — implement `geocode_address(address_text)` function that calls Nominatim API (`https://nominatim.openstreetmap.org/search`) with proper User-Agent header, rate limiting respect (max 1 req/sec), returns lat/lng point; add error handling for failed geocoding
- [ ] D026 Create `backend/walks/services.py` — implement walker matching query: use PostGIS `.distance()` to find WalkerProfile instances within specified radius from pickup_location where `is_online=True AND is_walker_active=True`; return ordered list by distance with calculated km

### Frontend Implementation
- [ ] D027 Update or create Owner scheduling page component — replace current DashboardPage/OwnerView scheduling flow: add calendar month grid widget (custom CSS, no external library) showing booked slots from existing WalkRequests, clickable time slot selection for future dates only
- [ ] D028 Implement walk request submission form in scheduling page — dropdown/radio for 30 vs 60 minute duration, date picker constrained to future-only times, phone/address confirmation fields (pre-filled from profile but editable), submit calling POST `/api/walk-requests/`

**Checkpoint**: Dog owners can schedule walks through a calendar interface with proper validation. Walk requests are created server-side with geocoded pickup locations and matched against online walkers within radius.

---

## Phase 7: User Story 5 - Walker Availability and Request Matching (Priority: P3)

**Goal**: Online walkers receive real-time walk request notifications, review details including map/dog info, accept/decline requests. Owners receive confirmation when walker accepts.

**Independent Test**: An online walker receives a WebSocket notification for a nearby walk request within 20 miles, reviews full details on the "Find Jobs" feed, and successfully accepts or declines it.

### WebSocket Infrastructure
- [ ] D029 Rewrite `backend/walks/consumers.py` — implement WalkAlertConsumer: connect at `/ws/walk-alerts/`, authenticate via session cookie, join private channel `walkers-{user_id}`, handle ping messages (respond with pong), close connection after 60s without ping
- [ ] D030 Update `backend/walks/routing.py` — change WebSocket URL pattern from per-walk group chat (`ws/walk/{walk_id}/`) to walk-alerts consumer route at `ws/walk-alerts/`; update `urls.py` for Django Channels ASGI routing configuration
- [ ] D031 Implement walk request alert trigger: in WalkRequestViewSet's `perform_create()`, after creating a SEARCHING WalkRequest, send WebSocket alerts via channel_layer.group_send to all active online walkers within radius using the walker matching query from T026

### Walker Dashboard Frontend
- [ ] D032 Create/update `frontend/src/pages/WalkerDashboard.jsx` — implement "Find Jobs" feed showing available walk requests filtered by PostGIS distance query; display owner name, dog info (name/breed/aggressiveness), pickup address text, scheduled time, duration, and calculated distance in km
- [ ] D033 Implement Leaflet map integration on WalkerDashboard — render OpenStreetMap tiles centered on walker's location with markers for each walk request's pickup address using the `leaflet-setup.js` already present; add "Go Online" / "Go Offline" toggle button that calls PATCH `/api/walkers/availability/me/`
- [ ] D034 Implement real-time WebSocket connection in frontend — create custom React hook or service file connecting to `/ws/walk-alerts/`, handle incoming `walk_alert` and `walk_status_change` events; add new walk request notification UI (toast/badge counter) when walker receives alert

### Acceptance/Decline Flow
- [ ] D035 Implement atomic accept endpoint in backend: ensure POST `/api/walk-requests/{id}/accept/` uses `transaction.atomic()` + `select_for_update()` on WalkRequest where status=SEARCHING AND walker is null; return HTTP 409 Conflict if double-accepted; update WalkRequestSerializer to expose acceptance flow
- [ ] D036 Implement cancel endpoint: POST `/api/walk-requests/{id}/cancel/` — owner can cancel SEARCHING walks, mutual cancellation required for ACCEPTED status with reason field; validate transition rules from data-model.md state machine
- [ ] D037 Update walk request listing in WalkerDashboard to include Accept/Decline action buttons on each job card wired to accept/cancel endpoints

**Checkpoint**: Walkers receive real-time push notifications when new walk requests appear within their service radius. They can review full details with a map view, accept or decline walks atomically (preventing double-booking), and owners get confirmation notifications.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories that improve correctness, consistency, and completeness.

- [ ] D038 Implement calendar slot endpoint: GET `/api/calendar/slots/?month=YYYY-MM` in `backend/walks/views.py` — query accepted/SEARCHING WalkRequests for a given month range, return booked_slots array as specified in contracts
- [ ] D039 Add Django management command for walker matching report (development/debugging aid) and verify all model validators from data-model.md are enforced in serializers (phone regex, duration values 30/60 only, aggressiveness choices)
- [ ] D040 Ensure all address update flows trigger Nominatim geocoding: when OwnerProfile.home_address_text changes OR WalkerProfile.service_address_text changes, server-side call to `geocode_address()` updates the corresponding PointField (lazy on save rather than async for MVP simplicity)
- [ ] D041 Update `frontend/src/App.jsx` and routing — add `/schedule` route for walk scheduling page, ensure walker-only routes are gated behind role check in PrivateRoute logic or conditional rendering based on user.role === 'WALKER'

---

## Dependencies & Execution Order

### Phase Dependencies
| Phase | Description | Depends On |
|-------|-------------|------------|
| Phase 1 | Setup infrastructure | None — start immediately |
| Phase 2 | Foundational (auth migration) | Phase 1 complete — **BLOCKS all user stories** |
| Phase 3–7 | User Stories 1–5 | Phase 2 complete; can proceed in priority order or parallel after Phase 2 |
| Phase 8 | Polish & cross-cutting | All desired user stories complete |

### Critical Path
```
Phase 1 → Phase 2 → US1 → US2 ↔ US3 → US4 → US5 → Phase 8
                          ↕           ↕
                         (independent) (can parallelize with US3/US4)
```

- **US1 and US2** can partially overlap — both modify user model/views/profile pages, but US1 should land first since US2 builds on the session auth foundation.
- **US3 is independent** of US1–US2 once Phase 2 foundations are done (dog profiles don't depend on authentication method).
- **US4 depends on** US1 (need authenticated owner) and D025/D026 (geocoding + matching services must exist before scheduling can trigger walker discovery).
- **US5 depends on** US3+US4 (walker needs dog info to review, walk request must be created first), plus WebSocket infrastructure from Phase 2.

### Parallel Opportunities
- Within Phase 1: T001–T003 modify different files (`settings.py`, `requirements.txt`, `docker-compose.yml`) — can work in parallel
- Within Phase 2: Backend auth changes (D004–D007) and frontend auth changes (D008–D010) are independent — two agents can work simultaneously
- US3 is fully independent of US1/US2 once foundational migrations land

### Recommended MVP Scope
**MVP = Phase 1 + Phase 2 + Phase 3 (US1 only)**: This delivers a working signup/login system with session authentication, allowing users to register and access the app. A functional demo at this point proves the core platform works before adding profile management, dog profiles, scheduling, and walker matching.

---

## Task Count Summary

| Category | Tasks |
|----------|-------|
| Phase 1: Setup | 3 tasks (T001–D003) |
| Phase 2: Foundational | 8 tasks (D004–D012) |
| US1: Account Creation/Auth | 3 tasks (D013–D015) |
| US2: Profile Management | 4 tasks (D016–D019) |
| US3: Dog Profiles | 3 tasks (D020–D022) |
| US4: Walk Scheduling | 7 tasks (D023–D028) |
| US5: Walker Matching/Availability | 11 tasks (D029–D037) |
| Phase 8: Polish & Cross-Cutting | 4 tasks (D038–D041) |
| **Total** | **41 tasks** |

---

## Notes
- Tasks marked with `D` prefix indicate design-phase refinement of existing files rather than new file creation.
- No test tasks generated per constitution § VII exclusion. Validation via quickstart.md flow.
- All task descriptions include exact file paths for LLM-executable clarity.
- Geocoding service (D025) is shared infrastructure used by US4 — it must be ready before walk scheduling can function end-to-end, even though geocoding itself doesn't belong to a single user story phase.
