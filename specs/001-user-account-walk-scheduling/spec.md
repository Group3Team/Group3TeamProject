# Feature Specification: User Account & Walk Scheduling Management

**Feature Branch**: `001-user-account-walk-scheduling`  
**Created**: 2026-05-07  
**Status**: Draft  
**Input**: User description: "Dog walking app with user signup/login, account management (CRUD), dog profile creation, walk scheduling via calendar, location-based walker matching within 20-mile radius"

## User Scenarios & Testing

### User Story 1 - Account Creation and Authentication (Priority: P1)

A new dog owner or dog walker visits the app and creates an account by providing their username, phone number, password, and address. After signup they are logged in automatically or prompted to log in if they already have an account. A dog walker can optionally enable the dog walking role via a checkbox on their settings page.

**Why this priority**: This is the foundational entry point for all other functionality — without accounts there can be no scheduling, matching, or walk management. No value can be delivered without user accounts.

**Independent Test**: A new user can register with username/phone/password/address and immediately access the app's core interface.

**Acceptance Scenarios**:

1. **Given** a new user visits the signup page, **When** they enter a valid username, phone number, password, and address then submit the form, **Then** their account is created and they are logged in
2. **Given** an existing user attempts to log in, **When** they enter their registered credentials (username/phone and password), **Then** they gain access to their authenticated dashboard
3. **Given** a newly registered dog walker, **When** they navigate to User Settings and check the "I am a dog walker" checkbox, **Then** their profile is updated with the walker role enabled

### User Story 2 - Account Profile Management (Priority: P1)

A logged-in user can view and update their own account information at any time. The settings page displays current username, phone number, address, and password fields in editable form modals. Users can modify their information without losing their login session.

**Why this priority**: Users must be able to maintain accurate contact and location data — walk scheduling depends on valid addresses for pickup locations, and walkers need reliable phone numbers for coordination.

**Independent Test**: A logged-in user navigates to settings, edits their phone number and address fields, saves changes, and sees the updated values reflected immediately.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they navigate to the User Settings page, **Then** all their account fields (username, phone, address) are displayed pre-populated
2. **Given** a user on the settings page edits their phone number or address and clicks Save, **Then** the changes are persisted and reflected throughout the application
3. **Given** a user on the settings page updates their password using the existing password for verification, **Then** the new password takes effect immediately for subsequent authentication

### User Story 3 - Dog Profile Creation (Priority: P2)

A dog owner creates a profile for each of their dogs during signup or later via settings. The dog profile captures name, breed, age, disposition (temperament), and aggressiveness level. This information allows potential walkers to assess whether they are comfortable walking the specific dog.

**Why this priority**: Walkers need to know about the dog's temperament before accepting a walk request — especially aggressiveness data which directly affects safety decisions. However, basic account functionality works independently without it.

**Independent Test**: A logged-in dog owner creates a dog profile with name, breed, age, disposition, and aggressiveness fields and views it in their dashboard.

**Acceptance Scenarios**:

1. **Given** a logged-in dog owner, **When** they add a new dog profile via settings or signup flow, **Then** the system stores all required dog information (name, breed, age, disposition, aggressiveness)
2. **Given** a dog walker viewing a scheduled walk request with attached dog info, **When** they review the dog's profile details, **Then** they see name, breed, age, disposition, and aggressiveness level to inform their acceptance decision

### User Story 4 - Walk Scheduling by Dog Owner (Priority: P2)

A logged-in dog owner uses an interactive calendar interface to select a date and time slot for a walk. They choose between a 30-minute or 60-minute duration, confirm pickup location details, and submit the scheduling request to be matched with available walkers nearby.

**Why this priority**: This is the core business transaction that connects dog owners with walkers — it delivers direct value but depends on having accounts (Story 1) and dog profiles (Story 3). Still deliverable as a standalone scheduling flow once auth exists.

**Independent Test**: A logged-in dog owner opens calendar, selects a date/time, picks walk duration, enters pickup details, and submits the request successfully.

**Acceptance Scenarios**:

1. **Given** a logged-in dog owner with an existing account and at least one dog profile, **When** they click Schedule Walk on the calendar interface, **Then** they see available date/time slots with options for 30-minute or 60-minute walk durations
2. **Given** a dog owner selecting a time slot, **When** they enter their first name, last name, phone number, and pickup address then click the Schedule button, **Then** the scheduling request is created and stored with all details including location data

### User Story 5 - Walker Availability and Request Matching (Priority: P3)

A dog walker who has enabled their walker role can toggle an Online status indicator. When online, they receive notifications of walk requests from dog owners within a 20-mile radius of the walker's registered address. They can review each request details — including owner info, pickup location on a map, dog profile, and scheduled time — then accept or decline the walk request.

**Why this priority**: This completes the service marketplace flow by enabling walkers to find and respond to requests, but depends on users having accounts (Story 1) and owners creating scheduling requests (Story 4). It represents the matching layer of the business logic.

**Independent Test**: An online walker receives a notification for a walk request within their radius, reviews the request details including a map view of the pickup address, and successfully accepts or declines it.

**Acceptance Scenarios**:

1. **Given** a user with an enabled walker role who clicks the "Go Online" button, **When** they become available, **Then** they receive alerts when new walk requests are created by owners within 20 miles of their registered address
2. **Given** a walker viewing a pending walk request, **When** they open it, **Then** they see owner information, a map showing the pickup address location (using Google Maps), dog profile details, scheduled date/time, and chosen duration with Accept/Decline action buttons
3. **Given** a walker who accepts a walk request, **When** they confirm acceptance, **Then** both the owner and walker receive confirmation of the accepted booking

## Edge Cases

- What happens when a dog owner schedules a walk for a date/time that is in the past? System must reject it with an appropriate error message
- How does system handle a walk request where no walkers are within the 20-mile radius at the scheduled time? Request remains pending and visible to any walker who later comes online or changes location
- What happens when a user tries to edit their own password without providing their current password? System must validate the current password before allowing the change
- How does system handle duplicate usernames during signup? Display an error message and prevent account creation with the existing username

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with a unique username, phone number, password, and address without requiring an email address
- **FR-002**: System MUST authenticate registered users via session-based login using credentials from Story 1 registration fields
- **FR-003**: Users MUST be able to view and update their own account information (username, phone number, password, home address) through a settings page with editable field modals
- **FR-004**: System MUST persist all user location data using PostGIS PointField for geospatial queries and spatial indexing
- **FR-005**: Users MUST be able to create and manage dog profiles containing name, breed, age, disposition (temperament description), and aggressiveness level
- **FR-006**: Dog owners MUST be able to schedule a walk by selecting a date/time from an interactive calendar, choosing 30-minute or 60-minute duration, entering pickup address details, and submitting the request
- **FR-007**: Walker users MUST be able to enable/disable their walker role via a toggle in settings
- **FR-008**: Online walkers MUST receive notifications of walk requests from owners within a 20-mile radius calculated using PostGIS spatial queries on registered addresses
- **FR-009**: Walkers MUST be able to view pending walk request details including owner information, dog profile, scheduled time/duration, and a map visualization of the pickup address (Google Maps integration) with Accept/Decline actions
- **FR-010**: System MUST validate that walk scheduling requests reference valid, active user accounts before persisting

### Key Entities *(include only when feature involves data)*

- **User**: Core identity entity with username, phone number, password hash, address (stored as geospatial point), registered role (dog owner or dog walker), and online status indicator; each User has one to many DogProfile records and many WalkRequest/Schedule records as either the requesting owner or assigned walker
- **DogProfile**: Child entity linked to a User via OneToOne relationship representing a specific dog with name, breed, age (integer in years), disposition text, and aggressiveness level (enum: low/medium/high); owned exclusively by one DogOwner account
- **WalkRequest**: Transactional entity capturing the scheduling interaction between an owner and walker with pickup address (geospatial point), scheduled date/time, chosen duration (30 or 60 minutes in minutes), dog profile reference, status lifecycle states of pending/accepted/completed/cancelled, assigned DogOwner and DogWalker user references

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account registration in under 2 minutes from first page visit to authenticated dashboard
- **SC-002**: System retrieves walk requests within the matching radius for online walkers in under 3 seconds using spatial indexing
- **SC-003**: 95% of scheduled walks are successfully matched with an available walker within 1 hour of request submission during business hours
- **SC-004**: Users can update their account profile information with zero downtime — changes reflect immediately across the application without requiring re-login

## Assumptions

- Users have stable internet connectivity for calendar interaction, map loading, and real-time walk matching notifications
- Google Maps API key is available and will be configured via environment variables at deployment time
- Passwords are hashed using Django's built-in PBKDF2 algorithm — no custom hashing logic needed
- Walk duration values are restricted to exactly 30 or 60 minutes only, with no partial durations supported in this version
- The 20-mile radius matching threshold is a fixed constant configurable via environment variable for different deployment environments
- User roles (dog owner vs. dog walker) coexist on a single account — one signup covers both potential user types with role selection at settings level
- Location coordinates are derived server-side from street addresses using Google Maps geocoding service during address update or walk scheduling
