# Data Model — DogGO User Account & Walk Scheduling

**Feature**: specs/001-user-account-walk-scheduling/spec.md  
**Date**: 2026-05-07  
**Source of truth**: PostgreSQL with PostGIS extension (GeoDjango)

---

## Entity: User (`users.User`)

*Core identity entity. Inherits from `django.contrib.auth.models.AbstractUser`.*

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, auto | Primary key (inherited) |
| `username` | CharField(max_length=150) | UNIQUE, NOT NULL, min 3 chars | Unique login identifier; required at signup |
| `password` | CharField | NOT NULL, hashed via PBKDF2SHA256 | Password hash — never stored plaintext (inherited from AbstractUser) |
| `first_name` | CharField(max_length=150) | BLANK=True | User's given name; shown on walk request details to walkers |
| `last_name` | CharField(max_length=150) | BLANK=True | User's family name; shown on walk request details to walkers |
| `phone` | CharField(max_length=20) | BLANK=False, regex `^\+?\d{7,20}$` | Contact phone number with country code; required at signup and for walk coordination |
| `role` | CharField(max_length=10) | Choices: (`OWNER`, `WALKER`), default=`'OWNER'` | User type — inherited from AbstractUser (not a custom field). Read-only via API after initial role selection |

**Relationships**:
- One-to-one → `OwnerProfile` (when role='OWNER')
- One-to-one → `WalkerProfile` (when role='WALKER' and `is_walker_active=True`)
- Many-to-one ← `Dog` (each Dog has one Owner via FK)
- Many-to-one ← `WalkRequest.owner` (walk requests created by this user)
- Many-to-one ← `WalkRequest.walker` (walk requests accepted/assigned to this user; nullable)

**Validation rules**:
1. `username` must be unique across all users at registration time
2. `password` must meet Django's built-in password validators (minimum length, not too similar to username)
3. `phone` format: 7–20 digits with optional leading `+` for country code

---

## Entity: OwnerProfile (`users.OwnerProfile`)

*One-to-one profile attached to a User with role='OWNER'. Stores geospatial and contact data.*

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, auto | Primary key |
| `user` | OneToOneField(User) | UNIQUE, CASCADE delete on User deletion, related_name=`'owner_profile'` | The owner user this profile belongs to |
| `home_location` | PointField(srid=4326) | NULL=True (geocoded lazily), SRID 4326 = WGS84 GPS coordinates | Geospatial point derived from home address via Nominatim geocoder; used for walk request radius matching |
| `home_address_text` | CharField(max_length=500) | BLANK=True, default empty string | Human-readable street address; stored alongside PointField for display and re-geocoding when updated |

**Relationships**:
- One-to-one ↔ `User` (owner user)
- One-to-many → `Dog` (dogs belonging to this owner via FK on Dog model's `owner` field which points to User, accessible via `user.owner_profile`)
- One-to-many ← `WalkRequest.owner`

**Validation rules**:
1. Created automatically when a new User with role='OWNER' is registered
2. `home_location` coordinates are computed server-side from `home_address_text` using Nominatim; stored asynchronously or on first walk request submission if address changes

---

## Entity: WalkerProfile (`users.WalkerProfile`)

*One-to-one profile attached to a User with role='WALKER'. Stores availability and service area data.*

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, auto | Primary key |
| `user` | OneToOneField(User) | UNIQUE, CASCADE delete on User deletion, related_name=`'walker_profile'` | The walker user this profile belongs to |
| `is_walker_active` | BooleanField(default=False) | NOT NULL | Soft role toggle — the settings page checkbox. False means walker is registered but not in active pool; True means they can receive walk requests |
| `current_location` | PointField(srid=4326) | NULL=True, SRID 4326 | Geospatial point derived from service address via Nominatim geocoder; used for radius matching against owner home locations and pickup addresses |
| `service_address_text` | CharField(max_length=500) | BLANK=True, default empty string | Human-readable street address for walker's base location |
| `max_dogs` | IntegerField(default=1) | >= 1, <= 10 | Maximum concurrent walks a single walker can accept (prevents overbooking) |
| `service_radius_km` | FloatField(default=5.0) | > 0, default 5.0 km = ~3.1 miles; expanded by user to support up to ~20 mile matching | Service radius in kilometers — walk requests within this distance from walker's location are pushed via WebSocket
| `is_online` | BooleanField(default=False) | NOT NULL | Live availability flag — toggled ON/OFF via "Go Online" button on WalkerDashboard; only online active walkers receive push alerts

**Relationships**:
- One-to-one ↔ `User` (walker user)
- Many-to-one ← `WalkRequest.walker` (walk requests accepted by this walker, filtered by `is_online=True AND is_walker_active=True`)

**Validation rules**:
1. Created automatically when a new User with role='WALKER' is registered OR when an existing OWNER toggles the "I am a dog walker" checkbox in settings
2. `current_location` computed from `service_address_text` via Nominatim geocoder on address update

---

## Entity: Dog (`walks.Dog`)

*Represents one of a dog owner's dogs. Stored during signup or later via ProfileOwner page.*

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, auto | Primary key |
| `owner` | ForeignKey(User) | NOT NULL, CASCADE delete on owner deletion, related_name=`'dogs'` | The dog's owner (user with role='OWNER') |
| `name` | CharField(max_length=100) | NOT NULL | Dog's name; shown to walkers on walk request details |
| `breed` | CharField(max_length=100) | BLANK=True, default empty string | Breed or breed mix description (e.g., "Labrador Mix") |
| `size` | CharField(max_length=20) | Choices: (`SMALL`, `MEDIUM`, `LARGE`) | Size category — affects walker's safety assessment and capacity decisions |
| `notes` | TextField(blank=True, max_length=500) | BLANK=True, default empty string | Free-text description of dog temperament (disposition), training status, special needs. Maps to spec field "disposition" |
| `aggressiveness` | CharField(max_length=10) | Choices: (`LOW`, `MEDIUM`, `HIGH`), default=`'LOW'` | Aggressiveness level — critical safety information shown prominently to walkers before they accept a walk request |

**Validation rules**:
1. A dog can only be viewed/modified by its owner (enforced in DogViewSet.get_queryset())
2. Walker sees all Dog fields when viewing an accepted/pending WalkRequest that includes this dog

---

## Entity: WalkRequest (`walks.WalkRequest`)

*Represents a single walk scheduling interaction between an owner and potentially one walker.*

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BigAutoField | PK, auto | Primary key |
| `owner` | ForeignKey(User) | NOT NULL, CASCADE delete; related_name=`'walk_requests_as_owner'` | The dog owner who created the scheduling request |
| `walker` | ForeignKey(User) | NULL=True (before acceptance), SET NULL on cancellation if status=SEARCHING; related_name=`'walk_requests_as_walker'` | The walker assigned to this walk after acceptance. Null before acceptance or after cancellation |
| `dogs` | ManyToManyField(Dog, blank=True) | Can be multiple dogs per request for multi-dog owners | Dogs involved in this walk request — shown to the accepting walker |
| `status` | CharField(max_length=20) | Choices: (`SEARCHING`, `ACCEPTED`, `ARRIVING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), default=`'SEARCHING'` | State machine tracking walk lifecycle; transitions documented below |
| `pickup_location` | PointField(srid=4326) | NOT NULL, SRID 4326 | Geospatial point of the dog pickup location; computed from owner_address via Nominatim geocoder when scheduling. Displayed on WalkerDashboard map (OpenStreetMap + Leaflet) |
| `owner_phone` | CharField(max_length=20, blank=True, null=True) | Contact phone for this specific walk request | Copied from owner's profile at scheduling time; may differ if owner has multiple numbers |
| `owner_address` | CharField(max_length=500, blank=True, null=True) | Full street address text for pickup location | Human-readable address displayed in WalkerDashboard alongside map view |
| `duration_minutes` | IntegerField(blank=True, null=True) | Values: 30 or 60 only — enforced at serializer level | Walk duration chosen from calendar widget during scheduling; stored as integer minutes |
| `scheduled_time` | DateTimeField | NOT NULL, must be > now() when created | The date and time for the scheduled walk (new field to replace auto_now timestamp) |
| `created_at` | DateTimeField(auto_now_add=True) | Read-only | Timestamp of scheduling request creation |
| `updated_at` | DateTimeField(auto_now=True) | Read-only | Last modification timestamp |

**State machine transitions**:
```
SEARCHING → ACCEPTED   (walker accepts via atomic transaction)
ACCEPTED → ARRIVING    (walker clicks "On the way" or owner confirms walker arrived)
ARRIVING → IN_PROGRESS (walk begins — either auto-transition at scheduled_time or manual confirm)
IN_PROGRESS → COMPLETED (duration elapsed OR manual completion by walker)
SEARCHING/ACCEPTED/ARRIVING → CANCELLED (either party cancels; requires validation: only SEARCHING can be cancelled by owner, ACCEPTED requires mutual cancellation with reason)
```

**Concurrency guard**: 
- `accept_walk_request` uses `transaction.atomic()` + `select_for_update()` + atomic filter on `walker__isnull=True AND status='SEARCHING'`. Returns HTTP 409 Conflict if double-accepted.

---

## Spatial Index Strategy

| Entity | PointField Column | Index Type | Purpose |
|--------|-------------------|------------|---------|
| OwnerProfile.home_location | PostGIS geometry POINT, SRID=4326 | GiST index on `home_location` | Fast radius query for "find owners within 20 miles of walker" |
| WalkerProfile.current_location | PostGIS geometry POINT, SRID=4326 | GiST index on `current_location` | Fast radius query for matching walkers to owner pickup addresses |
| WalkRequest.pickup_location | PostGIS geometry POINT, SRID=4326 | GiST index on `pickup_location` | Distance calculation during walk request creation (validate owner is within walker's service area) |

**Index SQL**: Generated via Django migration using `models.Index(fields=['home_location'], name='owner_profile_loc_idx', opclasses=['point_distance_op'])` and analogous indexes for other PointFields.

---

## Entity Relationship Diagram (Conceptual)

```
User (AbstractUser)
 ├──[1:1] OwnerProfile ──┐
 │                        ├──[1:N] Dog
 │                        └──[1:N] WalkRequest.owner
 │
 └──[1:1] WalkerProfile ──┘
                         └──[N:1] WalkRequest.walker (nullable)

Dog ──[M:N] WalkRequest.dogs
```
