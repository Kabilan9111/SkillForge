# SkillForge Backend - Architecture Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  (React/Vue/Angular - Your existing roadmap dashboard)          │
│                                                                 │
│  - Displays roadmap from backend                               │
│  - Shows locked/unlocked/completed status                      │
│  - Sends completion requests                                   │
│  - DOES NOT calculate or manipulate progress                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         │ JWT Token in Header
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      BACKEND API                                │
│                   (Node.js + Express)                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Routes (API Endpoints)                     │  │
│  │  /auth, /user, /track, /roadmap, /progress             │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │                                        │
│  ┌────────────────────▼────────────────────────────────────┐  │
│  │              Controllers                                │  │
│  │  Handle HTTP requests/responses                         │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │                                        │
│  ┌────────────────────▼────────────────────────────────────┐  │
│  │              Services (Business Logic)                  │  │
│  │  - AuthService: Login/Register                          │  │
│  │  - TrackService: Track selection                        │  │
│  │  - RoadmapService: Roadmap with unlock status           │  │
│  │  - ProgressService: Prerequisite validation             │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │                                        │
│  ┌────────────────────▼────────────────────────────────────┐  │
│  │              Models (Data Access)                       │  │
│  │  User, Track, Module, UserProgress, etc.                │  │
│  └────────────────────┬────────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      DATABASE                                   │
│                   (SQLite / PostgreSQL)                         │
│                                                                 │
│  institutions, users, tracks, modules,                          │
│  user_tracks, module_prerequisites, user_progress               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request Flow: Complete Module

```
Frontend                Backend                     Database
   │                       │                            │
   │  POST /progress/      │                            │
   │  complete             │                            │
   │  {moduleId: 5}        │                            │
   ├──────────────────────>│                            │
   │                       │                            │
   │                       │  1. Auth Middleware        │
   │                       │     Verify JWT Token       │
   │                       │                            │
   │                       │  2. ProgressController     │
   │                       │     Extract userId         │
   │                       │                            │
   │                       │  3. ProgressService        │
   │                       │     Get module details ────┤
   │                       │<───────────────────────────┤
   │                       │                            │
   │                       │  4. Get prerequisites ─────┤
   │                       │<───────────────────────────┤
   │                       │                            │
   │                       │  5. Check each prereq ─────┤
   │                       │     is completed       ────┤
   │                       │<───────────────────────────┤
   │                       │                            │
   │                       │  ✅ All prerequisites met  │
   │                       │                            │
   │                       │  6. Mark complete ─────────┤
   │                       │<───────────────────────────┤
   │                       │                            │
   │                       │  7. Calculate progress ────┤
   │                       │<───────────────────────────┤
   │                       │                            │
   │   200 OK              │                            │
   │   {                   │                            │
   │     message: "...",   │                            │
   │     progress: {...}   │                            │
   │   }                   │                            │
   │<──────────────────────┤                            │
   │                       │                            │

OR if prerequisites NOT met:

   │                       │                            │
   │                       │  5. Check prereq X ────────┤
   │                       │<───────────────────────────┤
   │                       │                            │
   │                       │  ❌ Prerequisite not done  │
   │                       │                            │
   │   403 Forbidden       │                            │
   │   {                   │                            │
   │     error: "Cannot    │                            │
   │     complete..."      │                            │
   │   }                   │                            │
   │<──────────────────────┤                            │
   │                       │                            │
```

---

## Database Schema Relationships

```
┌──────────────────┐
│   institutions   │
│                  │
│  - id            │
│  - name          │
│  - type          │
│  - location      │
└────────┬─────────┘
         │
         │ 1:N
         │
┌────────▼─────────┐
│      users       │
│                  │
│  - id            │
│  - institution_id│─────┐
│  - email         │     │
│  - password      │     │
│  - full_name     │     │
│  - role          │     │
└────────┬─────────┘     │
         │               │
         │ N:M           │
         │ (via          │
         │ user_tracks)  │
         │               │
┌────────▼─────────┐     │
│  user_tracks     │     │
│                  │     │
│  - id            │     │
│  - user_id       │◄────┘
│  - track_id      │────┐
│  - is_active     │    │
│  - enrolled_at   │    │
└──────────────────┘    │
                        │
                        │
┌───────────────────────▼┐
│       tracks          │
│                       │
│  - id                 │
│  - name               │
│  - slug               │
│  - description        │
└───────────┬───────────┘
            │
            │ 1:N
            │
┌───────────▼───────────┐
│      modules          │
│                       │
│  - id                 │
│  - track_id           │
│  - title              │
│  - category           │
│  - sequence_order     │
└──────┬────────┬───────┘
       │        │
       │        │ Self-referencing N:M
       │        │ (via module_prerequisites)
       │        │
       │   ┌────▼────────────────────┐
       │   │  module_prerequisites   │
       │   │                         │
       │   │  - module_id            │
       │   │  - prerequisite_id      │
       │   └─────────────────────────┘
       │
       │ Related to UserProgress
       │
┌──────▼──────────────────┐
│    user_progress        │
│                         │
│  - id                   │
│  - user_id              │
│  - track_id             │
│  - module_id            │
│  - status               │
│  - completed_at         │
│                         │
│  UNIQUE(user_id,        │
│         track_id,       │
│         module_id)      │
└─────────────────────────┘
```

---

## Track Isolation Flow

```
User: John
─────────────────────────────────────────────────

Java Track (Active)              Python Track (Inactive)
┌─────────────────┐              ┌─────────────────┐
│ Progress: 8/15  │              │ Progress: 0/15  │
│                 │              │                 │
│ Module 1 ✅     │              │ Module 1 ⬜     │
│ Module 2 ✅     │              │ Module 2 🔒     │
│ Module 3 ✅     │              │ Module 3 🔒     │
│ Module 4 ✅     │              │ Module 4 🔒     │
│ Module 5 ✅     │              │ ...             │
│ Module 6 ✅     │              │                 │
│ Module 7 ✅     │              │                 │
│ Module 8 ✅     │              │                 │
│ Module 9 ⬜     │              │                 │
│ Module 10 🔒    │              │                 │
│ ...             │              │                 │
└─────────────────┘              └─────────────────┘

✅ = Completed
⬜ = Unlocked (can work on)
🔒 = Locked (prerequisites not met)

When John switches to Python:
1. Python becomes active
2. Java progress saved (still 8/15)
3. Python shows 0/15 (fresh start)

When John switches back to Java:
1. Java becomes active again
2. Still shows 8/15 (progress preserved)
3. Module 9 still unlocked, can continue

NO MIXING, NO CROSS-CONTAMINATION!
```

---

## Prerequisite Chain Example

```
Java Track - Module Dependencies:

Module 1: Java Basics
   └──> Module 2: OOP
           ├──> Module 3: Exception Handling
           └──> Module 4: Collections
                   └──> Module 5: Arrays & Strings
                           ├──> Module 6: Linked Lists
                           │       └──> Module 8: Trees & Graphs
                           ├──> Module 7: Stacks & Queues
                           └──> Module 9: Searching & Sorting
                                   ├──> Module 10: Dynamic Programming
                                   └──> Module 11: Recursion

Validation Logic:
─────────────────
To complete Module 5:
  ✅ Check Module 4 completed
     ✅ Check Module 2 completed
        ✅ Check Module 1 completed

To complete Module 8:
  ✅ Check Module 6 completed
     ✅ Check Module 5 completed
        ✅ Check Module 4 completed
           ✅ Check Module 2 completed
              ✅ Check Module 1 completed

If ANY prerequisite is not completed:
  ❌ BLOCK the completion
  ❌ Return error with missing prerequisite name
  ❌ Frontend cannot bypass this
```

---

## Placement Readiness Calculation

```
┌─────────────────────────────────────────────────────────────────┐
│                   PLACEMENT READINESS                           │
│                                                                 │
│  Overall Progress: ────────────────┐                            │
│    15/15 completed = 100%          │                            │
│    Must be ≥ 80%                   │                            │
│                                    ▼                            │
│  Category Breakdown:         ┌──────────┐                       │
│    ┌─────────────────────┐  │  Score   │                       │
│    │ Fundamentals  4/4   │──┤  100%    │─┐                     │
│    │ Required: ≥ 90%     │  └──────────┘ │                     │
│    └─────────────────────┘               │                     │
│    ┌─────────────────────┐  ┌──────────┐ │                     │
│    │ Data Structures 4/4 │──┤   100%   │─┤                     │
│    │ Required: ≥ 80%     │  └──────────┘ │                     │
│    └─────────────────────┘               │                     │
│    ┌─────────────────────┐  ┌──────────┐ │                     │
│    │ Algorithms  3/3     │──┤   100%   │─┤                     │
│    │ Required: ≥ 75%     │  └──────────┘ │                     │
│    └─────────────────────┘               ├──> All Met?         │
│    ┌─────────────────────┐  ┌──────────┐ │                     │
│    │ Projects  2/2       │──┤   100%   │─┤    ┌──────────┐     │
│    │ Required: ≥ 60%     │  └──────────┘ │    │   YES    │     │
│    └─────────────────────┘               ├───►│ READY!   │     │
│    ┌─────────────────────┐  ┌──────────┐ │    └──────────┘     │
│    │ Practice  2/2       │──┤   100%   │─┘                     │
│    │ Required: ≥ 70%     │  └──────────┘                       │
│    └─────────────────────┘                                     │
│                                                                 │
│  Result: ✅ PLACEMENT READY                                     │
│  Recommendation: "Ready for placement opportunities"            │
└─────────────────────────────────────────────────────────────────┘

If ANY category requirement is not met OR overall < 80%:
  Result: ❌ NOT PLACEMENT READY
  Recommendation: "Continue completing modules to reach readiness"
```

---

## Layered Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ROUTES LAYER                             │
│  - Define HTTP endpoints                                        │
│  - Apply middleware (auth, validation)                          │
│  - Map URLs to controllers                                      │
│                                                                 │
│  Example: router.post('/complete', auth, controller.complete)   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     CONTROLLERS LAYER                           │
│  - Handle HTTP request/response                                 │
│  - Extract data from req.body, req.params                       │
│  - Call service methods                                         │
│  - Return JSON responses                                        │
│                                                                 │
│  Example: const result = await service.complete(userId, modId)  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      SERVICES LAYER                             │
│  - Business logic                                               │
│  - Validation (prerequisites, enrollment)                       │
│  - Orchestrate multiple model calls                             │
│  - Calculate derived data (progress, readiness)                 │
│                                                                 │
│  Example: Check prerequisites, mark complete, calculate progress│
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       MODELS LAYER                              │
│  - Database queries                                             │
│  - CRUD operations                                              │
│  - Data retrieval and persistence                               │
│  - No business logic                                            │
│                                                                 │
│  Example: db.run("INSERT INTO user_progress...")                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       DATABASE                                  │
│  - Data storage                                                 │
│  - Constraints and indexes                                      │
│  - Referential integrity                                        │
└─────────────────────────────────────────────────────────────────┘

Benefits:
─────────
✅ Separation of concerns
✅ Easy to test each layer
✅ Easy to maintain and modify
✅ Business logic centralized in services
✅ Routes are thin and clean
```

---

## Authentication Flow

```
1. User Registration:
   ─────────────────
   Frontend                    Backend
      │                           │
      │  POST /auth/register      │
      │  email, password, name    │
      ├──────────────────────────>│
      │                           │ 1. Hash password (bcrypt)
      │                           │ 2. Create user in DB
      │                           │ 3. Generate JWT token
      │                           │
      │  200 OK                   │
      │  { user, token }          │
      │<──────────────────────────┤
      │                           │
      │  Store token in           │
      │  localStorage             │
      │                           │

2. User Login:
   ────────────
   Frontend                    Backend
      │                           │
      │  POST /auth/login         │
      │  email, password          │
      ├──────────────────────────>│
      │                           │ 1. Find user by email
      │                           │ 2. Compare passwords (bcrypt)
      │                           │ 3. Generate JWT token
      │                           │
      │  200 OK                   │
      │  { user, token }          │
      │<──────────────────────────┤
      │                           │
      │  Store token              │
      │                           │

3. Authenticated Request:
   ───────────────────────
   Frontend                    Backend
      │                           │
      │  GET /roadmap             │
      │  Authorization: Bearer    │
      │  <token>                  │
      ├──────────────────────────>│
      │                           │ 1. Extract token from header
      │                           │ 2. Verify token (jwt.verify)
      │                           │ 3. Get user from token payload
      │                           │ 4. Attach user to req.user
      │                           │ 5. Continue to controller
      │                           │
      │  200 OK                   │
      │  { roadmap }              │
      │<──────────────────────────┤
      │                           │

JWT Token Structure:
────────────────────
Header:
  {
    "alg": "HS256",
    "typ": "JWT"
  }

Payload:
  {
    "userId": 1,
    "institutionId": 1,
    "role": "student",
    "iat": 1737536400,
    "exp": 1738141200
  }

Signature:
  HMACSHA256(
    base64UrlEncode(header) + "." +
    base64UrlEncode(payload),
    JWT_SECRET
  )
```

---

These diagrams provide a visual understanding of the SkillForge backend architecture, data flow, and core concepts. Use them as reference when integrating the frontend or explaining the system to others.
