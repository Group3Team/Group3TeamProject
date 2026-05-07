# API Contracts — DogGO (REST)

**Feature**: specs/001-user-account-walk-scheduling/spec.md  
**Base URL** (dev): `http://localhost:8000/api`  
**Auth**: Session-based (Django login form → sets CSRF token + session cookie; subsequent requests include `X-CSRFToken` header and send cookies)

---

## Authentication Endpoints

### POST `/api/auth/register/`
Register a new account. Creates User, OwnerProfile or WalkerProfile based on role.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | 3-150 characters, unique |
| `first_name` | string | No | Given name (shown to walkers) |
| `last_name` | string | No | Family name (shown to walkers) |
| `phone` | string | Yes | Phone number with country code (+1XXXXXXXXXX format) |
| `password` | string | Yes | Meets Django password validators |
| `address` | string | Yes | Full street address for geocoding into PointField |
| `role` | string | No | `'OWNER'` (default) or `'WALKER'`; determines which profile type is auto-created |

**Response 201 Created**:
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+15551234567",
    "role": "OWNER"
  },
  "profile_id": 1,
  "message": "Account created successfully. You are now logged in."
}
```

**Response 400 Bad Request**: `{"error": "<specific validation error>"}` or `{"username": ["Username already taken"]}`

---

### POST `/api/auth/login/` (Django built-in LoginView)
Authenticate and create session. Returns HTTP 200 with Set-Cookie header for Django session cookie.

**Request body**:
```json
{
  "username": "johndoe",
  "password": "secretpass"
}
```

**Response 200 OK**: `{"message": "Logged in successfully."}` (session cookie set automatically)  
**Response 401 Unauthorized**: `{"error": "Invalid credentials"}`

---

### POST `/api/auth/logout/`
Destroy current session. Returns HTTP 200 with cleared session cookie.

**Response 200 OK**: `{}`

---

## User Endpoints (Authenticated)

### GET `/api/users/me/`
Return the currently authenticated user's profile data including full fields (not just id + username).

**Response 200 OK**:
```json
{
  "id": 1,
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+15551234567",
  "role": "OWNER"
}
```

### PATCH `/api/users/me/`
Update current user's basic fields (username, first_name, last_name, phone). Password change requires `old_password`, `new_password`.

**Request body**:
```json
{
  "first_name": "Johnny",
  "phone": "+15559876543"
}
```

or for password change:
```json
{
  "password_change": {
    "old_password": "oldpass",
    "new_password": "newsecurepass!"
  }
}
```

**Response 200 OK**: Updated user object  
**Response 400 Bad Request**: Validation errors  
**Response 403 Forbidden**: `{"error": "Invalid old password"}` for password change failure

---

## Profile Endpoints (Authenticated)

### GET `/api/profiles/current/`
Return the authenticated user's full profile data. For owners: OwnerProfile + Dogs list. For walkers: WalkerProfile info only.

**Response 200 OK**:
```json
{
  "user": { "id": 1, "username": "...", "first_name": "...", "last_name": "...", "phone": "+..." },
  "owner_profile": {
    "home_location": {"type": "Point", "coordinates": [-122.4194, 37.7749]},
    "home_address_text": "123 Main St, San Francisco, CA"
  },
  "dogs": [
    {
      "id": 5,
      "name": "Buddy",
      "breed": "Golden Retriever",
      "size": "LARGE",
      "notes": "Very friendly, well-trained",
      "aggressiveness": "LOW"
    }
  ]
}
```

### PATCH `/api/profiles/address/`
Update the user's home/service address. Triggers server-side geocoding via Nominatim and updates PointField.

**Request body**:
```json
{
  "address_text": "456 Oak Ave, Oakland, CA"
}
```

**Response 200 OK**: Updated profile with new coordinates  
**Response 400 Bad Request**: Geocoding failed or address invalid

---

## Dog Endpoints (Authenticated)

### GET `/api/dogs/`
List all dogs belonging to the authenticated user. Supports pagination and search (`?search=buddy`).

**Query params**: `page`, `limit=20`, `search` (searches name, breed), `ordering` (by name or date created)  
**Response 200 OK** (paginated):
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 5,
      "name": "Buddy",
      "breed": "Golden Retriever",
      "size": "LARGE",
      "notes": "...",
      "aggressiveness": "LOW"
    }
  ]
}
```

### POST `/api/dogs/`
Create a new dog profile for the authenticated user.

**Request body**:
```json
{
  "name": "Buddy",
  "breed": "Golden Retriever",
  "size": "LARGE",
  "notes": "Very friendly, well-trained",
  "aggressiveness": "LOW"
}
```

**Response 201 Created**: New dog object (owner set automatically)  
**Response 400 Bad Request**: Validation errors on size/aggressiveness choices

### PATCH `/api/dogs/{id}/`
Update an existing dog profile. Only the owner can modify their own dogs.

**Request body**: Same fields as POST, all optional except `name`.  
**Response 200 OK**: Updated dog object  
**Response 403 Forbidden**: Not the owner of this dog  
**Response 404 Not Found**: Dog does not exist or is not owned by user

### DELETE `/api/dogs/{id}/`
Soft-delete a dog (sets `active=False` flag; keeps historical walk request references).

**Response 204 No Content** on success.

---

## Walk Request Endpoints (Authenticated)

### GET `/api/walk-requests/`
List walk requests involving the authenticated user — as owner or walker. Supports filtering and ordering.

**Query params**: `status=SEARCHING|ACCEPTED|COMPLETED`, `page`, `limit=20`, `ordering=-scheduled_time`  
**Response 200 OK** (paginated list of WalkRequest summaries with status, scheduled_time, duration_minutes)

### POST `/api/walk-requests/`
Create a new walk scheduling request. Triggers radius matching and WebSocket push to nearby online walkers.

**Request body**:
```json
{
  "dog_ids": [5],
  "duration_minutes": 60,
  "scheduled_time": "2026-05-15T14:00:00Z",
  "owner_phone": "+15559876543",
  "owner_address_text": "789 Pine St, Berkeley, CA"
}
```

**Response 201 Created**: `{"id": 42, "status": "SEARCHING", "message": "Walk request posted. Nearby walkers will be notified."}`  
**Response 400 Bad Request**: Invalid duration (must be 30 or 60), scheduled_time in the past

---

### POST `/api/walk-requests/{id}/accept/`
Walker accepts a walk request using atomic transaction. Prevents double-acceptance via `select_for_update()`.

**Path param**: `id` — walk request ID  
**Response 200 OK**: `{"status": "ACCEPTED", "walker": {"username": "..."}, "message": "Walk accepted successfully"}`  
**Response 409 Conflict**: `{"error": "This walk was already accepted by another walker"}` (atomic transaction detected concurrent modification)

### POST `/api/walk-requests/{id}/cancel/`
Owner or walker cancels a walk request. Requires reason for ACCEPTED status walks.

**Request body** (when cancelling ACCEPTED): `{"reason": "Sick, cannot attend"}`  
**Response 200 OK**: Updated walk with status=CANCELLED

### PATCH `/api/walk-requests/{id}/status/`
Transition walk request to a new lifecycle state: ARRIVING → IN_PROGRESS → COMPLETED.

**Request body**: `{"status": "COMPLETED"}`  
**Response 200 OK**: Updated walk object

---

## Walker Availability Endpoints (Authenticated, role=WALKER only)

### GET `/api/walkers/availability/me/`
Return current walker availability status.

**Response 200 OK**: `{ "is_online": false, "service_radius_km": 5.0 }`

### PATCH `/api/walkers/availability/me/`
Toggle online/offline availability and update service radius. Called from WalkerDashboard.

**Request body**:
```json
{
  "is_online": true,
  "service_radius_km": 8.0
}
```

**Response 200 OK**: Updated availability object  
**Validation**: `service_radius_km` must be > 0 and <= 32 (max ~20 miles)

### GET `/api/walkers/available-requests/`
List walk requests that are within the authenticated walker's service radius and are still SEARCHING. Uses PostGIS spatial query: `pickup_location__distance_lt=(home_location, D(miles=20))`.

**Query params**: `page`, `limit=20`  
**Response 200 OK**: Paginated list of WalkRequests with distance metadata (`"distance_km": 4.2`) — sorted by closest first. This is the WalkerDashboard "Find Jobs" feed.

---

## Calendar Slot Endpoints (Authenticated, role=OWNER only)

### GET `/api/calendar/slots/?month=2026-05`
Return pre-booked time slots for a given month so the calendar widget can mark occupied dates and show available windows.

**Query params**: `month` (YYYY-MM format), optional `week_start` to get specific week  
**Response 200 OK**:
```json
{
  "booked_slots": [
    { "date": "2026-05-15", "time": "14:00", "duration_minutes": 60, "status": "ACCEPTED" }
  ]
}
```
