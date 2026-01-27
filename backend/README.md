# SkillForge Backend

Production-ready backend for career-first EdTech platform with strict progress tracking and track-based isolation.

## Features

- 🔐 JWT-based authentication
- 🏫 Institution scoping (schools/colleges)
- 🎯 Track-based isolation (Java, Python, C/C++)
- 📚 Mandatory roadmap with prerequisite validation
- ✅ Server-side progress calculation
- 🎓 Placement readiness scoring
- 🚀 Single source of truth - never trusts frontend

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create .env file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Initialize database:
```bash
npm run init-db
```

4. Seed sample data (optional):
```bash
npm run seed
```

5. Start server:
```bash
npm start
# or for development:
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User
- `GET /api/user/me` - Get current user details
- `GET /api/user/tracks` - Get user's tracks with progress

### Track
- `POST /api/track/select` - Select active track
- `GET /api/track/active` - Get active track details

### Roadmap
- `GET /api/roadmap` - Get roadmap for active track
- `GET /api/roadmap/:trackId` - Get roadmap for specific track

### Progress
- `GET /api/progress` - Get progress summary for active track
- `POST /api/progress/complete` - Mark module as complete (with validation)
- `GET /api/progress/placement-readiness` - Get placement readiness score

## Database Schema

- **institutions** - Schools/colleges
- **users** - User accounts
- **tracks** - Programming tracks (Java, Python, C/C++)
- **user_tracks** - User's enrolled tracks with active status
- **modules** - Roadmap modules with prerequisites
- **user_progress** - Module completion records

## Business Rules

1. Each user can have multiple tracks but only ONE active track at a time
2. Progress in one track NEVER affects another track
3. Modules cannot be completed unless ALL prerequisites are met
4. Frontend cannot unlock or manipulate progress - backend validates everything
5. Placement readiness is calculated only from verified completion states
6. Institution scoping ensures data isolation per school/college

## Architecture

- Monolithic architecture (no microservices)
- Single database (SQLite, upgradeable to PostgreSQL)
- Layered structure: Routes → Controllers → Services → Models
- Middleware for auth, validation, and error handling
