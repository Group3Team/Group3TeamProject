# Implementation Plan: DogGO User Account & Walk Scheduling Management

**Branch**: `001-user-account-walk-scheduling` | **Date**: 2026-05-07 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-user-account-walk-scheduling/spec.md`

---

## Summary

DogGO is a dog walking scheduling platform connecting dog owners with walkers. This implementation plan covers Phase 1 of the feature: account creation/authentication, profile management (CRUD), dog profile creation/editing, walk scheduling via calendar widget, and walker availability matching within configurable radius using PostGIS spatial queries. The backend uses Django Rest Framework with session-based authentication; the frontend is React+Vite+JavaScript served by Vite dev server in development and Nginx in production. Real-time walk request alerts are delivered via Channels + channels-redis WebSocket infrastructure. Location data uses OpenStreetMap tiles (Leaflet.js) with Nominatim for geocoding. Atomic database transactions prevent concurrent walk acceptance conflicts.

---

## Technical Context

**Language/Version**: Python 3.12+ (backend), JavaScript ES Modules (frontend, no TypeScript — project uses plain JS per constitution)  
**Primary Dependencies**: Django 6.0 + DRF + Django REST Framework SimpleJWT + Channels + channels-redis (backend); React 18 + Vite + Leaflet + Axios + React Router (frontend); PostgreSQL 15+ with PostGIS extension; Redis 7+ for Channels layer  
**Storage**: PostgreSQL 15+ with PostGIS geospatial extension. GeoDjango PointField for all location data. GiST indexes on PointFields for spatial queries. Django session backend uses database table (`django_session`) by default — no separate cache store needed for MVP since only WebSockets use Redis.  
**Testing**: Excluded per constitution § VII (no test files or frameworks). Validation done via manual verification and quickstart.md flow.  
**Target Platform**: Linux server (Docker Compose deployment with PostgreSQL, Redis, Nginx reverse proxy); development on any OS with Docker Desktop or local PostgreSQL/Redis  
**Project Type**: Monorepo web application — Django REST API backend serving both admin interface and headless SPA; React/Vite single-page frontend consumed via browser. App name: DogGO.  
**Performance Goals**: Walk request radius matching query completes in under 3 seconds (SC-002). Page load under 2 seconds on broadband connection. WebSocket alert delivery within 1 second of walk request creation. Calendar widget renders month grid instantly (<50ms) via client-side rendering with pre-fetched booked slots from API.  
**Constraints**: Session-based authentication only (JWT removed per user input alignment). No email field required during signup — username, phone, password, address sufficient. Walk durations restricted to exactly 30 or 60 minutes. Radius matching capped at ~20 miles (32 km) max service radius. All maps via OpenStreetMap + Leaflet (no Google Maps dependency). Atomic transactions on walk acceptance prevent double-booking. Docker Compose for deployment with Nginx as HTTP reverse proxy and static file server — zero downtime reconfigurable across any VPS provider per constitution § VI.  
**Scale/Scope**: MVP targets 1,000 concurrent users (typical for local pet service marketplace). Single database instance. No horizontal scaling of Django workers required until >5,000 active users (Nginx upstream load balancing adds trivially). Frontend: ~3,000 lines of JS across primitives → composites → features → pages component hierarchy per constitution § III. Backend: ~15 models/serializers/views spanning 4 apps (users, walks, locations, messaging) with ~25 REST endpoints and 1 WebSocket consumer route.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### § I Architecture & Stack — PASS
- Monorepo layout confirmed: `/backend` (DRF), `/frontend` (React+Vite+JS) ✅
- PostgreSQL with PostGIS extension for geospatial data ✅ (PostgreSQL 15+, PostGIS, GeoDjango PointField, GiST indexes)  
- API-first design — DRF ViewSets expose complete REST APIs consumed by frontend via Axios fetch ✅  
- GeoDjango spatial index required for all PointFields ✅ (GiST on home_location, current_location, pickup_location)  
- Client-side rendering only — no SSR/Next.js ✅

### § II Backend Design Standards — PASS
- DRF ViewSets with clear layering: models → serializers → views → urls ✅
- Session authentication enabled by default ✅ (replacing existing JWT config in settings.py)
- CORS for localhost:3000 configured ✅ (settings.py CORS_ALLOWED_ORIGINS)  
- Pagination and filtering on all list endpoints via DRF DEFAULT_PAGINATION_CLASS / DEFAULT_FILTER_BACKENDS ✅ (updated in settings.py: PageNumberPagination, PAGE_SIZE=20, DjangoFilterBackend, SearchFilter, OrderingFilter)
- OneToOne relationships instead of duplicate tables ✅ (User ↔ OwnerProfile/WalkerProfile via OneToOne)

### § III Frontend Architecture — PASS
- Component hierarchy enforced: `primitives/` → `composites/` → `features/` → `pages/` ✅
  - Primitives will be created as needed from existing patterns in Navbar, PrivateRoute  
  - Composites for calendar widget (MonthCalendar → DayCell + TimeSlot)  
  - Features for walk scheduling flow and walker availability management  
  - Pages: OwnerDashboard (calendar landing), WalkerDashboard (availability feed)
- Shared logic via custom hooks ✅ (`useAuth` from AuthContext already exists; new `useWalkRequests`, `useAvailableSlots`)
- React Router with nested routes pattern ✅ (existing BrowserRouter + Routes setup in main.jsx)
- State management via React Context ✅ (AuthProvider/AuthContext already exists)
- JSDoc interfaces for all API payloads ✅ (strict mode, no `any` — per constitution § V)

### § IV Styling Standards — PASS
- Single Tailwind configuration file with CSS custom properties for design tokens ✅ (existing index.css with --accent-color, --primary-color variables confirmed in App.jsx header)
- Reuse utility classes exclusively ✅ (Tailwind CDN or build configured; no inline styles except where already present and will be migrated)
- No heavy UI libraries ✅ — Leaflet for maps only; custom CSS calendar widget instead of Fullcalendar.io  
### § V Code Quality & Safety — PASS
- JavaScript strict mode enforced ✅ (React with JSX implies module system)  
- No `any` type usage ✅ (JSDoc interfaces at component boundaries: API payloads typed via `/** @type {...} */` comments; DRF serialziers produce deterministic JSON structures)
- Naming conventions: PascalCase components, camelCase functions/constants ✅ (existing Navbar.jsx, LoginPage.jsx follow this pattern)

### § VI Development Environment & DX — PASS  
- Backend on port 8000 ✅ (`runserver 0.0.0.0:8000`)
- Frontend proxy at `/api` routes to backend (Vite dev server on port 3000) ✅
- Docker-based development with multi-stage builds ✅ (existing Dockerfile in /backend; will create docker-compose.yml with db, redis, web, worker, nginx services)  
- Nginx for production reverse proxy ✅ (per user input and constitution § VI)

### § VII Project Constraints — PASS
- No test files or frameworks ✅ (constitution-aligned exclusion respected)
- No SSR/Next.js ✅ (pure client-side React rendering only)
- No heavy UI component libraries (MUI, Chakra, AntD) ✅  
- No legacy React patterns — functional components with hooks required ✅ (`createRoot` + StrictMode in main.jsx confirms modern patterns already used)

### § VIII Governance & Defaults — PASS
- Minimal reusable implementation chosen: Django built-in auth views for login/session management instead of custom; DRF ViewSets for standard CRUD; Leaflet for maps (no custom map engine); CSS grid calendar widget from scratch instead of heavy library.
- No duplicated UI/API patterns: existing UserViewSet, WalkerProfileViewSet, OwnerProfileViewSet extended rather than replaced; DogSerializer and WalkRequestSerializer enhanced with new fields rather than rewritten.

---

## Implementation Phases

### Phase 0 — Foundation (Existing Infrastructure)

The following work items are already completed from prior iterations:
- [x] Django project scaffolded with `users`, `walks`, `messaging`, `weather` apps under `/backend/`  
- [x] Existing User model (`AbstractUser`) with role field (OWNER/WALKER choices) ✅  
- [x] WalkerProfile and OwnerProfile models OneToOne linked to User ✅
- [x] Dog and WalkRequest models with PointField locations, status lifecycle states ✅  
- [x] DRF ViewSets registered in root urls.py: users, walker-profiles, owner-profiles, walk-requests, dogs ✅  
- [x] Registration view at `/api/auth/register/` (exists but needs field updates) ✅
- [x] Frontend routing structure with BrowserRouter + routes for Login, Signup, Dashboard, ProfileOwner, ProfileWalker, DogsPage, WalkRequestsPage ✅
- [x] AuthContext provider with isLoggedIn/user/logout state management ✅  
- [x] Axios API service configured at `/frontend/src/services/api.js` ✅  
- [x] Leaflet setup initialized (`leaflet-setup.js`) ✅

### Phase 1 — Backend Updates (This Plan)

#### P1.1 — User Model & Serializer Overhaul
**Files modified**: `backend/users/models.py`, `backend/users/serializers.py`, `backend/users/views.py`  
Changes:
- Add `is_walker_active = BooleanField(default=False)` to WalkerProfile for soft role toggle checkbox in settings
- Update `register()` view to require phone/address fields instead of email; use session authentication (Django built-in login flow) instead of JWT TokenObtainPairView
- Create `UserSerializer` with full read/write: username, first_name, last_name, phone, password (write-only via `write_only=True`)  
- Create `ProfileViewSet` for `/api/profiles/current/` endpoint returning combined user + profile + dog data
- Update root urls.py to register new viewsets and deprecate JWT auth endpoints

#### P1.2 — WalkRequest Model Extensions & Atomic Accept Endpoint
**Files modified**: `backend/walks/models.py`, `backend/walks/serializers.py`, `backend/walks/views.py`  
Changes:
- Add `scheduled_time = DateTimeField()` to WalkRequest model for the walk scheduling date/time from calendar widget
- Enforce duration_minutes in serializer validation: must be 30 or 60 only  
- Create new viewset method `accept_walk_request(pk)` on WalkRequestViewSet wrapped in `@transaction.atomic()`, using `select_for_update()`, atomic filter on `walker__isnull=True AND status='SEARCHING'`, returns HTTP 409 Conflict if double-accepted
- Create `/api/walkers/available-requests/` endpoint using PostGIS spatial query: walks within `WalkerProfile.service_radius_km` of walker's location, filtered by `status=SEARCHING AND Walker__is_staff=False AND WalkerProfile__is_online=True AND is_walker_active=True`, sorted by distance

#### P1.3 — Channels + Redis for Real-Time Walk Alerts
**Files modified**: `backend/settings.py`, `backend/config/asgi.py` (or existing ASGI config), `backend/walks/consumers.py`, `backend/walks/routing.py`  
Changes:
- Replace InMemoryChannelLayer with channels_redis in settings.py: `"BACKEND": "channels.layers.InMemoryChannelLayer"` → `"BACKEND": "channels_redis.core.RedisChannelLayer", "CONFIG": {"hosts": [{"address": os.environ.get("REDIS_URL", "redis://localhost:6379/0")]}}`  
- Update `walks/consumers.py` WalkAlertConsumer to join private channel `walkers-{user_id}` on connect
- Trigger walk alert consumer message from WalkRequestViewSet when new request is created with status=SEARCHING; query nearby online walkers using PostGIS `.distance()` filter and broadcast via their respective channels

#### P1.4 — Location App for Address Geocoding Service  
**Files modified**: New app `backend/locations/models.py` (if separate geocoder service needed), or extend existing models in-place
Changes:
- Add Django management command `geocode_address(address_text)` that calls Nominatim API (`https://nominatim.openstreetmap.org/search?format=json&q={address}`) with User-Agent header, returns latitude/longitude as dict
- Integrate into ProfileViewSet PATCH handler to geocode address text → PointField on every save

### Phase 2 — Frontend Updates (This Plan)

#### P2.1 — API Service & Auth Context Updates
**Files modified**: `frontend/src/services/api.js`, `frontend/src/context/AuthContext.jsx`  
Changes:
- Update api.js to use session-based authentication instead of JWT Bearer tokens: remove Authorization header interceptor, configure withCredentials:true for cookie-based auth; add endpoints for profile CRUD, dog CRUD, walk scheduling, walker availability toggle  
- Update AuthContext login/logout flow to use POST `/api/auth/login/` (Django form view) and POST `/api/auth/register/`; store session state from response

#### P2.2 — OwnerDashboard Calendar Widget Landing Page
**Files modified**: `frontend/src/pages/DashboardPage.jsx` → create `OwnerDashboard.jsx`, new file  
Changes:
- Replace current DashboardPage with OwnerDashboard component at `/dashboard` route
- Custom CSS calendar grid using Tailwind utility classes (grid-cols-7 for days-of-week, month navigation arrows)
- Fetch booked slots via GET `/api/calendar/slots/?month=YYYY-MM` to mark occupied dates
- Click on available cell → opens schedule walk modal with: first name, last name, phone number, pickup address fields + date/time from calendar selection + duration radio buttons (30/60 min)  
- Schedule walk POST to `/api/walk-requests/` endpoint; redirect back to dashboard on success

#### P2.3 — WalkerDashboard Availability Management
**Files modified**: New file `frontend/src/pages/WalkerDashboard.jsx`, update existing routes in App.jsx  
Changes:
- Create WalkerDashboard component at new route (replace or alongside current `/walker` route)
- "Go Online" toggle button → PATCH `/api/walkers/availability/me/` with is_online=true/false
- Fetch available walk requests from GET `/api/walkers/available-requests/?page=1&limit=20` showing distance_km metadata sorted nearest-first
- Each request card shows: owner name, dog(s) names/breeds/aggressiveness badges, scheduled date/time, duration_minutes, pickup address text (truncated), "Accept" button → POST `/api/walk-requests/{id}/accept/` with optimistic UI update + error handling for 409 Conflict
- Click on address to view OpenStreetMap map in Leaflet modal using existing `leaflet-setup.js` and Nominatim geocoded coordinates

#### P2.4 — Profile & Settings Page Enhancement  
**Files modified**: Update `frontend/src/pages/ProfileOwner.jsx`, create or enhance `ProfileWalker.jsx`, update both into unified UserSettings page at `/settings` route  
Changes:
- Unified settings page showing user fields (username, first_name, last_name, phone) in editable form with inline validation
- Address field with geocode-on-save behavior
- Password change section requiring current password + new password confirmation
- Dog walker checkbox (`is_walker_active`) visible when role='WALKER' — toggles soft activation for walk matching pool visibility  
- "Go Online" toggle button in Walker settings → updates WalkerProfile.is_online via PATCH

#### P2.5 — Dogs Page Enhancement
**Files modified**: Update `frontend/src/pages/DogsPage.jsx` (already exists)  
Changes:
- Enhance existing dogs page with aggressiveness field (dropdown: Low/Medium/High) and disposition notes textarea per data-model.md Dog entity spec
- Ensure dog creation form uses POST `/api/dogs/` endpoint; update/delete buttons wired to PATCH/DELETE endpoints

### Phase 3 — Docker Deployment Configuration (This Plan)

#### P3.1 — docker-compose.yml with Production Services  
**File created**: `docker-compose.yml` at repository root  
Services defined:
- **db**: PostgreSQL image with PostGIS extension, named volume for data persistence  
- **redis**: Redis image for Channels WebSocket layer  
- **web**: Django WSGI service (gunicorn) building from existing backend Dockerfile; exposes port 8000 internally; health check on `/api/auth/health` endpoint
- **worker**: ASGI worker running Daphne or Uvicorn with channels for WebSocket consumers; exposed on port 8001  
- **nginx**: Nginx reverse proxy image building from Dockerfile; serves frontend static build from `/usr/share/nginx/html`; proxies `/api/*` to web:8000, proxies `/ws/*` to worker:8001; health check with curl

#### P3.2 — Environment Configuration  
**Files created**: `.env.example` (backend), `frontend/.env.example`  
Templates for deployment configuration with all variables documented and commented for easy copy-paste adaptation across environments (development, staging, production EC2/VPS).

---

## Complexity Tracking

> No complexity violations detected. All design decisions default to minimal implementations per constitution § VIII. The atomic transaction on walk acceptance (§ Research Decision 3) adds one `select_for_update()` call — justified by data integrity requirement that two walkers must not simultaneously accept the same walk request, which is a core business constraint.

---

## Assumptions & Resolved Decisions (from research.md)

1. **OpenStreetMap + Leaflet** for all map rendering and geocoding via Nominatim — no Google Maps API dependency (§ Research Decision 1)
2. **channels-redis** as ASGI channel layer replacing existing InMemoryChannelLayer — already partially present in codebase, switch requires settings.py update only (§ Research Decision 2)  
3. **Atomic transactions** with `select_for_update()` on walk acceptance to prevent double-booking (§ Research Decision 3)
4. **Soft role toggle** via WalkerProfile.is_walker_active BooleanField + existing is_online flag — no user model migration needed for role switching (§ Research Decision 4)
5. **Docker Compose + Nginx** deployment with 5 services (db, redis, web, worker, nginx) per explicit user request (§ Research Decision 5)
6. **Phone-based signup** without email requirement — register view updated to accept phone/address fields, session auth for login (§ Research Decision 6)
