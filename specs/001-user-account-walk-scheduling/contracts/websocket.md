# WebSocket Contract — DogGO Real-Time Walk Alerts

**Feature**: specs/001-user-account-walk-scheduling/spec.md  
**WebSocket URL** (dev): `ws://localhost:8001/ws/walk-alerts/`  
**Channel Layer**: channels-redis

---

## Connection

### Client → Server
Connect to `/ws/walk-alerts/` after session authentication. The Django Channels middleware authenticates via the session cookie included in the WebSocket handshake headers.

**Connection message**:
```json
{ "type": "connect" }
```

**Server response**: `{"type": "websocket.accept"}` on success, or close with 403 if not authenticated.

### Channel Naming Pattern
Upon successful connection, the consumer joins a private channel named:
- `walkers-{user_id}` — only relevant walk request events are sent to this channel

---

## Server → Client Messages

### WalkRequest Alert (new searchable walk within radius)
Sent when a new `WalkRequest` with status `SEARCHING` is created and the authenticated walker's location is within the specified radius of the pickup location.

```json
{
  "type": "walk_alert",
  "event": "new_walk_request",
  "data": {
    "id": 42,
    "owner_username": "johndoe",
    "owner_first_name": "John",
    "duration_minutes": 60,
    "scheduled_time": "2026-05-15T14:00:00Z",
    "pickup_address": "789 Pine St, Berkeley, CA",
    "dogs": [
      { "name": "Buddy", "breed": "Golden Retriever", "aggressiveness": "LOW" }
    ],
    "distance_km": 3.2,
    "action_url": "/api/walk-requests/42/accept/"
  }
}
```

**Delivery guarantee**: Each SEARCHING walk request is sent to ALL walkers within radius who are both `is_online=True` AND `is_walker_active=True`. The atomic transaction on acceptance (see rest-api.md POST /walk-requests/{id}/accept/) ensures only one walker actually gets the assignment. If a second walker's WebSocket fires before the first completes, their accept attempt will receive HTTP 409 Conflict and can show "Already taken" to the user.

---

### Walk Request Accepted/Declined
Sent back to the owner when their walk request status changes from SEARCHING → ACCEPTED or CANCELLED.

**Accept notification**:
```json
{
  "type": "walk_status_change",
  "event": "walker_accepted",
  "data": {
    "id": 42,
    "status": "ACCEPTED",
    "walker_username": "sarah_walker",
    "message": "Sarah accepted your walk request!"
  }
}
```

**Cancel notification**:
```json
{
  "type": "walk_status_change",
  "event": "walk_cancelled",
  "data": {
    "id": 42,
    "status": "CANCELLED",
    "reason": "Sick, cannot attend"
  }
}
```

---

## Heartbeat

### Client → Server (ping)
Every 30 seconds, clients send: `{ "type": "ping" }`  
**Server response**: `{ "type": "pong" }`  

If server does not receive a ping from a client within 60 seconds, it closes the WebSocket connection and removes the channel subscription.
