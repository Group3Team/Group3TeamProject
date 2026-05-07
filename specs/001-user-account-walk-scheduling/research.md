# Research Log — DogGO User Account & Walk Scheduling

**Feature**: specs/001-user-account-walk-scheduling/spec.md  
**Date**: 2026-05-07

---

## Decision 1: OpenStreetMap + Leaflet for Maps (vs Google Maps API)

**Decision**: Use OpenStreetMap tiles with Leaflet.js for all map rendering, combined with Nominatim for geocoding (address-to-coordinates conversion).

**Rationale**: 
- The constitution (§ IV Styling Standards) explicitly states "Leaflet maps used for location-based features."
- Eliminates dependency on Google Maps API key — reduces operational complexity and removes per-request billing.
- Nominatim provides sufficient geocoding quality for the 20-mile radius matching use case.
- Leaflet is already present in the frontend codebase (`leaflet-setup.js`, `src/assets/`), confirming prior investment.

**Alternatives considered**:
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| Google Maps JS API + Geocoding API | Richer features, better accuracy | Requires paid API key, violates constitution Leaflet preference, adds dependency cost | Constitution mandates Leaflet; no billing overhead needed for MVP |
| Mapbox GL JS | Excellent performance, beautiful tiles | External dependency on third-party provider, requires token | No advantage over Leaflet+OSM for MVP scope; adds auth complexity |

**Implementation notes**: 
- Use `leaflet` npm package (already installed per leaflet-setup.js).
- Geocode addresses server-side via Django task calling Nominatim API (`https://nominatim.openstreetmap.org/search?format=json&q=<address>`) during address save, store resulting PointField.
- Respect Nominatim usage policy: max 1 request/second, include User-Agent header with project name.

---

## Decision 2: Channels + channels-redis for Real-Time Walk Request Alerts (vs WebSockets standalone)

**Decision**: Use Django Channels with `channels-redis` as the ASGI channel layer to power real-time walk request push notifications to online walkers.

**Rationale**:
- The existing codebase already has a Channels infrastructure: `channels==4.3.2` in requirements.txt, `CHANNEL_LAYERS` configured with InMemory backend in settings.py, and a `walks/consumers.py` file exists.
- Switching from InMemory to channels-redis enables production-ready multi-worker deployment (InMemory only works for single-process development).
- The existing `walks/routing.py` already defines WebSocket routes.

**Alternatives considered**:
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| Server-Sent Events (SSE) | Simpler, HTTP-only, no extra infrastructure | Unidirectional only; no built-in subchannel routing for per-walker targeting | Walkers need bidirectional confirmations (accept/decline via WebSocket); SSE cannot handle acknowledgment reliably |
| Polling interval | No Channels complexity needed | Wastes bandwidth, poor real-time experience, contradicts constitution requirement for alerts within 20-mile radius | Constitution requires near-instant alert delivery; polling at >5s intervals degrades UX |

**Implementation notes**:
- Replace `InMemoryChannelLayer` with `channels_redis.core.RedisChannelLayer` in settings.
- Use channel namespaced routing: `walkers-{user_id}` so only the logged-in walker receives their alerts.
- The consumer in `walks/consumers.py` should send walk request JSON payload on new `WalkRequest.status=SEARCHING` creation, filtered by spatial radius using Django's `.distance()` query.

---

## Decision 3: Atomic Database Transactions for Walk Request Acceptance (vs non-atomic)

**Decision**: Wrap the entire walker-accepts-walk-request flow in `transaction.atomic()`, including:
1. Refreshing the WalkRequest from the database to detect concurrent modifications
2. Checking status is still ACCEPTABLE for acceptance (`SEARCHING` or `ARRIVING`)
3. Assigning the walker via `Q(walker=None)` lock guard (prevents double-acceptance)
4. Updating WalkRequest status to `ACCEPTED`

**Rationale**:
- Multiple walkers may see the same walk request simultaneously when it enters their 20-mile radius. Without atomicity, a race condition could cause two walkers to accept the same walk.
- Django's ORM provides built-in atomic transaction support with `select_for_update()` for row-level locking.

**Implementation pattern**:
```python
from django.db import transaction

@transaction.atomic
def accept_walk_request(request, pk):
    walker = request.user
    walk_req = WalkRequest.objects.select_for_update().get(pk=pk)
    
    if walk_req.status != 'SEARCHING':
        return Response({'error': 'Walk request no longer available'}, status=400)
    
    # Prevent double-acceptance: only update if walker is still None
    updated = WalkRequest.objects.filter(
        pk=pk, 
        walker__isnull=True, 
        status='SEARCHING'
    ).update(walker=walker, status='ACCEPTED')
    
    if not updated:
        return Response({'error': 'Walk request was already accepted'}, status=409)
```

**Alternatives considered**:
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| Optimistic locking with version field | No row-level lock contention | Adds complexity; race window still exists between read and write | Row-level `select_for_update()` is simpler and sufficient for low-contention MVP |
| Queue-based single-walker assignment (Celery) | Perfectly prevents races | Overkill for MVP; requires Celery broker + worker process | Atomic transaction with select_for_update() handles concurrency correctly without extra infrastructure |

---

## Decision 4: Soft Role Toggle vs Hard Role Separation in Profile Settings

**Decision**: Use the existing `User.role` CharField (`'OWNER'` / `'WALKER'`) combined with a new boolean field `is_walker_active` on `WalkerProfile` to implement soft role toggle. A user can be registered as both OWNER and WALKER simultaneously; `is_walker_active` controls whether they appear in the walker pool.

**Rationale**:
- The existing User model already has `role = CharField(choices=(('OWNER',...), ('WALKER',...)), default='OWNER')`. Changing this to a soft toggle avoids data migration complexity for users who want both roles.
- `WalkerProfile.is_online` already exists and serves as the availability flag. The settings page checkbox will directly update `is_online = True/False` rather than changing User.role.
- The constitution (§ II Backend Design Standards) says "Database models must avoid unnecessary duplication—use OneToOne and GenericForeignKey relationships instead of separate tables." A single soft toggle field satisfies this.

**Implementation notes**:
- Add `is_walker_active = BooleanField(default=False)` to WalkerProfile model for the settings checkbox.
- When a walker clicks "Go Online" in UI, it sets `walker_profile.is_online = True` (already exists).
- Walk request matching query filters on `WalkerProfile__is_online=True AND WalkerProfile__is_walker_active=True`.
- A dog owner who toggles to WALKER role gets an empty-by-default WalkerProfile auto-created via Django signal (`post_save` on User creation with role='WALKER').

---

## Decision 5: Docker Compose + Nginx HTTP Server for Production Deployment

**Decision**: Deploy using Docker Compose with three services (PostgreSQL/PostGIS, Django ASGI+WSGI, Nginx reverse proxy). Redis for Channels layer. Frontend served as static files via Nginx.

**Rationale**:
- User explicitly specified Docker + Nginx HTTP server hosting.
- Multi-container architecture cleanly separates concerns and enables zero-downtime deployments with health checks (aligns with constitution "easily configurable to deploy to any types of servers with minimum down time").
- Nginx handles: static file serving for React build output, reverse proxy `/api` → Django, SSL termination (via Let's Encrypt certbot in future).

**Service architecture**:
```yaml
services:
  db:        # PostgreSQL + PostGIS
  redis:     # channels-redis channel layer  
  web:       # Django WSGI (gunicorn) — REST API + admin
  worker:    # Django ASGI (daphne) — Channels consumers for WebSockets
  nginx:     # Reverse proxy + static file server
```

**Alternatives considered**:
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| Single Docker container (Django serves everything) | Simpler single-image deploy | No separate Nginx; Django not designed for production static file serving or WebSocket proxying | User explicitly requires Nginx as HTTP server |
| AWS EC2 + systemd services | Direct cloud control | Manual deployment, no orchestration, harder scaling | Docker Compose provides portability across any VPS provider (EC2, DigitalOcean, Hetzner) per user requirement |

**Implementation notes**:
- Build frontend with `npm run build`, copy to `/app/static/` for Nginx serving.
- Nginx config: serve static from `/usr/share/nginx/html/`; proxy_pass `http://web:8000/api` and `ws://worker:8001/ws/`.
- Health checks on all services with restart policy `unless-stopped`.

---

## Decision 6: Phone Number + Address at Signup (vs Email Requirement)

**Decision**: Require username, phone number, password, and address for signup. Do NOT require email. Store phone as CharField with validation; store address as a text field on OwnerProfile/WalkerProfile, geocoded server-side into PointField via Nominatim during save.

**Rationale**:
- User explicitly stated: "Must users provide an email during signup? No — only username, phone, and address are mandatory."
- The existing `register()` view requires email (bug vs spec). This needs to be updated to use session-based auth per the constitution (§ II Backend Design Standards says session authentication by default) rather than JWT.
- Session authentication is already configured in the constitution but not yet reflected in settings.py (currently uses JWT). Update needed: replace `SimpleJWTAuthentication` with `SessionAuthentication`.

**Implementation notes**:
- Phone validation via Django's built-in phone number regex or a lightweight library. Keep as CharField to avoid dependency overhead — MVP constraint favors minimal packages.
- Address geocoding: trigger during profile save, store coordinates in PointField, keep text address for display purposes.
- Session auth means frontend login form posts to `/api/auth/session/login/` (Django's built-in `LoginView`) and receives CSRF token + session cookie.

---

## Decision 7: OwnerDashboard Calendar Widget as Landing Page

**Decision**: The OwnerDashboard page (/dashboard route) will display a Leaflet-based calendar widget showing available walk slots, with a modal for scheduling new walks. This is the owner's landing page after login.

**Rationale**:
- User specified "OwnerDashboard calendar widget landing page."
- Calendar interaction needs to be embedded in the dashboard rather than a separate route to minimize navigation depth (constitution § VIII Governance: "default to the most minimal, reusable solution").
- Use lightweight calendar library approach with custom CSS calendar grid — no heavy UI libraries per constitution exclusions.

**Alternatives considered**:
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| Fullcalendar.io npm package | Feature-complete, production-tested | Heavy dependency (200KB+), violates constitution "no heavy component libraries" principle despite being a calendar library not UI kit; adds bundle bloat | Constitution mandates no heavy packages; custom CSS calendar grid is sufficient for 30/60 min slot selection |
| Custom HTML `<input type="date">` + `<select>` | Zero dependencies, minimal code | Poor UX — no visual month navigation, cannot show available slots visually | User specified "interactive calendar" — date picker alone doesn't meet UX requirement |

**Implementation notes**:
- Build a custom CSS calendar grid using Tailwind utility classes (grid-cols-7 for days-of-week).
- Month navigation arrows as SVG inline elements.
- Walk duration selector: radio buttons for 30 min / 60 min.
- Available dates fetched via API call `/api/walk-requests/owner-slots/?date=YYYY-MM` returns pre-booked slots to avoid collisions.
