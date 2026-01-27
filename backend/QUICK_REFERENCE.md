# SkillForge Backend - Quick Reference Card

## 🚀 Quick Commands

```bash
# Setup
npm install                  # Install dependencies
cp .env.example .env         # Create environment file
npm run init-db              # Initialize database
npm run seed                 # Seed sample data

# Run
npm start                    # Start server (production)
npm run dev                  # Start server (development with nodemon)

# Test
.\test-api.ps1              # Run automated tests (PowerShell)

# Database
npm run init-db             # Initialize/reset schema
npm run seed                # Seed sample data
```

## 📍 Key URLs

```
Base API:        http://localhost:5000/api
Health Check:    http://localhost:5000/api/health
Documentation:   See API_DOCUMENTATION.md
```

## 🔑 Test Credentials

```
Email:    student1@techvidya.edu
Password: password123

Email:    student2@techvidya.edu
Password: password123

Email:    student3@codemaster.edu
Password: password123
```

## 🎯 Core Endpoints

### Authentication
```http
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/verify
```

### User
```http
GET  /api/user/me
GET  /api/user/profile
GET  /api/user/tracks
```

### Track
```http
GET  /api/track/all
GET  /api/track/active
POST /api/track/select
```

### Roadmap
```http
GET  /api/roadmap
GET  /api/roadmap/:trackId
```

### Progress
```http
GET  /api/progress
POST /api/progress/complete
GET  /api/progress/placement-readiness
```

## 📝 Sample API Calls

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@techvidya.edu","password":"password123"}'
```

### Get Roadmap
```bash
curl http://localhost:5000/api/roadmap \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Complete Module
```bash
curl -X POST http://localhost:5000/api/progress/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"moduleId":1}'
```

## 🗄️ Database Tables

- `institutions` - Schools/colleges
- `users` - User accounts
- `tracks` - Programming tracks (Java/Python/C++)
- `user_tracks` - User enrollments + active status
- `modules` - Roadmap modules
- `module_prerequisites` - Module dependencies
- `user_progress` - Completion records

## 📊 Track IDs

```
1 = Java Development
2 = Python Development
3 = C/C++ Development
```

## 🏷️ Module Categories

```
fundamentals      - Core language concepts
data-structures   - Arrays, lists, trees, graphs
algorithms        - Sorting, searching, DP
projects          - Real-world applications
practice          - Coding challenges
```

## 🔒 Module Status

```
completed  - User has completed this module (✅)
unlocked   - Available to work on (all prerequisites met)
locked     - Cannot work on yet (prerequisites not met) (🔒)
```

## 🎓 Placement Readiness Criteria

```
Overall:          ≥ 80%
Fundamentals:     ≥ 90%
Data Structures:  ≥ 80%
Algorithms:       ≥ 75%
Projects:         ≥ 60%
Practice:         ≥ 70%
```

## 🔐 Environment Variables

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=change-this-in-production
JWT_EXPIRES_IN=7d
DB_PATH=./database.sqlite
CORS_ORIGIN=http://localhost:3000
```

## 🛡️ Security

- JWT authentication on all protected routes
- Bcrypt password hashing (10 rounds)
- Token expiration (default 7 days)
- CORS configuration
- Parameterized SQL queries

## 📁 Key Files

```
server.js                    - Main entry point
src/routes/index.js          - API routes
src/services/               - Business logic
src/models/                 - Database access
src/middleware/auth.js      - JWT authentication
```

## 📚 Documentation

```
README.md                    - Quick start
API_DOCUMENTATION.md         - Complete API reference
TESTING.md                   - Testing guide
DEPLOYMENT.md                - Production deployment
FRONTEND_INTEGRATION.md      - Frontend integration
OVERVIEW.md                  - System overview
ARCHITECTURE.md              - Architecture diagrams
CHECKLIST.md                 - Feature checklist
```

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port is in use
netstat -ano | findstr :5000
# Kill process if needed
```

### Database errors
```bash
# Reset database
rm database.sqlite
npm run init-db
npm run seed
```

### Authentication errors
```bash
# Check JWT_SECRET in .env
# Verify token is being sent in Authorization header
```

### CORS errors
```bash
# Update CORS_ORIGIN in .env
# Ensure frontend URL matches
```

## 💡 Key Concepts

### Track Isolation
- Each user can have multiple tracks
- Only ONE track active at a time
- Progress is separate per track
- Switching tracks preserves all progress

### Prerequisite Enforcement
- Modules have prerequisite chains
- Backend validates on EVERY completion
- Frontend CANNOT bypass
- Clear error messages when prerequisites not met

### Single Source of Truth
- Backend validates EVERYTHING
- Frontend only displays data
- No client-side progress calculation
- No trust in frontend

## 🎯 Testing Flow

1. ✅ Login
2. ✅ Select track
3. ✅ Get roadmap
4. ✅ Complete first module (should work)
5. ✅ Try locked module (should fail)
6. ✅ Switch tracks
7. ✅ Verify isolation
8. ✅ Get progress
9. ✅ Check placement readiness

## 🚢 Deployment Checklist

- [ ] Change JWT_SECRET
- [ ] Update CORS_ORIGIN
- [ ] Set NODE_ENV=production
- [ ] Migrate to PostgreSQL
- [ ] Setup HTTPS/SSL
- [ ] Configure monitoring
- [ ] Setup backups

## 📞 Support

For issues or questions, refer to:
- API_DOCUMENTATION.md for endpoint details
- TESTING.md for testing help
- DEPLOYMENT.md for production setup
- FRONTEND_INTEGRATION.md for frontend integration

## ⚡ Performance

- SQLite: Good for 1-100 concurrent users
- PostgreSQL: Recommended for 100+ users
- Add Redis caching for 1000+ users
- Horizontal scaling: Load balancer + multiple instances

## 🔄 Version

```
Version: 1.0.0
Status: Production Ready
Built: January 22, 2026
Node: 18.x or higher
Database: SQLite (dev), PostgreSQL (prod)
```

---

**Pro Tip**: Run `.\setup.ps1` for automated setup!

**Happy Coding! 🎓🚀**
