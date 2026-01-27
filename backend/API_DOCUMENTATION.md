# SkillForge Backend - API Documentation

## Overview

Production-ready backend for SkillForge EdTech platform with strict progress tracking, track-based isolation, and enforced prerequisite validation.

**Base URL:** `http://localhost:5000/api`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "institutionId": 1,
  "email": "student@example.edu",
  "password": "securePassword123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "email": "student@example.edu",
    "full_name": "John Doe",
    "institution_name": "TechVidya College"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.edu",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## User Endpoints

### Get Current User
```http
GET /api/user/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "student@example.edu",
    "full_name": "John Doe",
    "role": "student",
    "institution_name": "TechVidya College",
    "institution_type": "college"
  }
}
```

### Get User Profile with Progress
```http
GET /api/user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": { ... },
  "tracks": [
    {
      "trackId": 1,
      "trackName": "Java Development",
      "trackSlug": "java",
      "isActive": true,
      "totalModules": 15,
      "completedModules": 8,
      "completionPercentage": 53
    }
  ]
}
```

---

## Track Endpoints

### Get All Available Tracks
```http
GET /api/track/all
Authorization: Bearer <token>
```

**Response:**
```json
{
  "tracks": [
    {
      "id": 1,
      "name": "Java Development",
      "slug": "java",
      "description": "Master Java programming...",
      "color": "#f89820"
    },
    {
      "id": 2,
      "name": "Python Development",
      "slug": "python",
      "description": "Learn Python for web...",
      "color": "#3776ab"
    }
  ]
}
```

### Get User's Enrolled Tracks
```http
GET /api/track/user
Authorization: Bearer <token>
```

### Get Active Track
```http
GET /api/track/active
Authorization: Bearer <token>
```

**Response:**
```json
{
  "track": {
    "id": 1,
    "user_id": 1,
    "track_id": 1,
    "is_active": 1,
    "name": "Java Development",
    "slug": "java",
    "description": "Master Java programming...",
    "color": "#f89820"
  }
}
```

### Select Active Track
```http
POST /api/track/select
Authorization: Bearer <token>
Content-Type: application/json

{
  "trackId": 1
}
```

**Response:**
```json
{
  "message": "Active track updated successfully",
  "track": { ... }
}
```

**Business Rules:**
- Only ONE track can be active at a time
- Automatically enrolls user if not already enrolled
- Switching tracks preserves progress in previous track

---

## Roadmap Endpoints

### Get Roadmap for Active Track
```http
GET /api/roadmap
Authorization: Bearer <token>
```

**Response:**
```json
{
  "trackId": 1,
  "trackName": "Java Development",
  "trackSlug": "java",
  "roadmap": [
    {
      "id": 1,
      "title": "Java Basics",
      "description": "Variables, data types...",
      "category": "fundamentals",
      "estimatedHours": 8,
      "sequenceOrder": 1,
      "prerequisites": [],
      "isCompleted": true,
      "isUnlocked": true,
      "status": "completed"
    },
    {
      "id": 2,
      "title": "Object-Oriented Programming",
      "description": "Classes, objects...",
      "category": "fundamentals",
      "estimatedHours": 12,
      "sequenceOrder": 2,
      "prerequisites": [1],
      "isCompleted": false,
      "isUnlocked": true,
      "status": "unlocked"
    },
    {
      "id": 5,
      "title": "Arrays and Strings",
      "description": "Array manipulation...",
      "category": "data-structures",
      "estimatedHours": 8,
      "sequenceOrder": 5,
      "prerequisites": [4],
      "isCompleted": false,
      "isUnlocked": false,
      "status": "locked"
    }
  ]
}
```

**Module Status:**
- `completed` - User has completed this module
- `unlocked` - Available to work on (all prerequisites met)
- `locked` - Cannot work on yet (prerequisites not met)

### Get Roadmap for Specific Track
```http
GET /api/roadmap/:trackId
Authorization: Bearer <token>
```

**Note:** User must be enrolled in the track to view its roadmap.

---

## Progress Endpoints

### Get Progress Summary for Active Track
```http
GET /api/progress
Authorization: Bearer <token>
```

**Response:**
```json
{
  "trackId": 1,
  "trackName": "Java Development",
  "progress": {
    "totalModules": 15,
    "completedModules": 8,
    "completionPercentage": 53,
    "categoryProgress": [
      {
        "category": "fundamentals",
        "total": 4,
        "completed": 4
      },
      {
        "category": "data-structures",
        "total": 4,
        "completed": 3
      },
      {
        "category": "algorithms",
        "total": 3,
        "completed": 1
      }
    ]
  }
}
```

### Mark Module as Complete
```http
POST /api/progress/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "moduleId": 5,
  "trackId": 1  // Optional, uses active track if not provided
}
```

**Success Response:**
```json
{
  "message": "Module completed successfully",
  "moduleId": 5,
  "progress": {
    "totalModules": 15,
    "completedModules": 9,
    "completionPercentage": 60
  }
}
```

**Error Response (Prerequisite Not Met):**
```json
{
  "error": "Cannot complete this module. Prerequisite \"Collections Framework\" must be completed first.",
  "missingPrerequisite": "Collections Framework"
}
```

**Critical Business Rules:**
- ✅ Backend validates ALL prerequisites before allowing completion
- ✅ Frontend CANNOT bypass these checks
- ✅ Module completion is permanent (cannot be uncompleted)
- ✅ Progress is tracked per track (isolated from other tracks)

### Get Placement Readiness Score
```http
GET /api/progress/placement-readiness?trackId=1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "trackId": 1,
  "placementReadiness": {
    "readinessScore": 85,
    "isPlacementReady": true,
    "categoryStatus": {
      "fundamentals": {
        "percentage": 100,
        "required": 90,
        "met": true
      },
      "data-structures": {
        "percentage": 88,
        "required": 80,
        "met": true
      },
      "algorithms": {
        "percentage": 75,
        "required": 75,
        "met": true
      },
      "projects": {
        "percentage": 75,
        "required": 60,
        "met": true
      },
      "practice": {
        "percentage": 70,
        "required": 70,
        "met": true
      }
    },
    "recommendation": "Ready for placement opportunities"
  }
}
```

**Placement Readiness Criteria:**
- Overall completion ≥ 80%
- Fundamentals ≥ 90%
- Data Structures ≥ 80%
- Algorithms ≥ 75%
- Projects ≥ 60%
- Practice ≥ 70%

---

## Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T10:30:00.000Z",
  "service": "SkillForge Backend API"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation error, missing fields)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (prerequisite not met, not enrolled)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Key Architecture Principles

### 1. Single Source of Truth
- Backend validates EVERYTHING
- Frontend displays data but cannot manipulate progress
- All business rules enforced server-side

### 2. Track Isolation
- Each user can enroll in multiple tracks
- Only ONE track active at a time
- Progress in Track A does NOT affect Track B
- Module IDs are track-specific

### 3. Prerequisite Enforcement
- Modules have prerequisite chains
- Cannot complete Module B until Module A is done
- Backend validates prerequisites on every completion attempt
- No backdoors or bypass mechanisms

### 4. Institution Scoping
- Users belong to institutions (schools/colleges)
- Future: Can add institution-level admin controls
- Data isolation per institution

### 5. Scalability
- Simple monolithic architecture
- SQLite for development (upgradeable to PostgreSQL)
- Stateless authentication (JWT)
- Ready for horizontal scaling

---

## Development Setup

See main [README.md](README.md) for setup instructions.

---

## Sample Test Flow

1. **Register** a new user
2. **Login** to get JWT token
3. **Get all tracks** to see available options
4. **Select active track** (e.g., Java)
5. **Get roadmap** - see locked/unlocked modules
6. **Complete modules** in sequence
7. **Check progress** after each completion
8. **Get placement readiness** when sufficient progress is made

---

## Notes

- All timestamps are in UTC ISO 8601 format
- Module completion is idempotent (completing twice returns same result)
- Token expiration: 7 days (configurable in .env)
- Database: SQLite (production should use PostgreSQL)
