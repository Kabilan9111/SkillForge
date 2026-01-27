# SkillForge Backend - Testing Guide

## Quick Start Testing

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create .env File
```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work fine for development).

### 3. Initialize Database
```bash
npm run init-db
```

### 4. Seed Sample Data
```bash
npm run seed
```

This creates:
- 2 institutions
- 3 sample students
- 3 tracks (Java, Python, C/C++)
- Complete module roadmaps with prerequisites

### 5. Start Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server runs on `http://localhost:5000`

---

## Testing with cURL

### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@techvidya.edu","password":"password123"}'
```

Save the token from response.

### 2. Get Current User
```bash
curl http://localhost:5000/api/user/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get All Tracks
```bash
curl http://localhost:5000/api/track/all \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Select Java Track
```bash
curl -X POST http://localhost:5000/api/track/select \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"trackId":1}'
```

### 5. Get Roadmap
```bash
curl http://localhost:5000/api/roadmap \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Complete First Module
```bash
curl -X POST http://localhost:5000/api/progress/complete \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"moduleId":1}'
```

### 7. Try to Complete Locked Module (Should Fail)
```bash
curl -X POST http://localhost:5000/api/progress/complete \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"moduleId":5}'
```

This should return an error about missing prerequisites!

### 8. Get Progress Summary
```bash
curl http://localhost:5000/api/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 9. Get Placement Readiness
```bash
curl http://localhost:5000/api/progress/placement-readiness \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing with Postman

1. Import the endpoints from `API_DOCUMENTATION.md`
2. Create environment variable `token` to store JWT
3. Test the flow described above

---

## Testing Track Isolation

### Verify Progress Isolation Between Tracks

1. Login as student
2. Select Java track
3. Complete modules 1, 2, 3
4. Switch to Python track
```bash
curl -X POST http://localhost:5000/api/track/select \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"trackId":2}'
```
5. Get Python roadmap - should show NO completed modules
6. Switch back to Java - progress should still be there

This proves track isolation works!

---

## Testing Prerequisite Enforcement

### Test Case 1: Linear Prerequisites
- Complete Module 1 ✅
- Try Module 2 (prerequisite: 1) ✅
- Try Module 3 (prerequisite: 2) ✅

### Test Case 2: Blocked Access
- Try Module 5 without completing Module 4 ❌
- Should fail with prerequisite error

### Test Case 3: Multiple Prerequisites
- Module 8 requires Module 6
- Module 6 requires Module 5
- Module 5 requires Module 4
- Must complete in order!

---

## Sample Credentials

**User 1:**
- Email: `student1@techvidya.edu`
- Password: `password123`
- Institution: TechVidya College

**User 2:**
- Email: `student2@techvidya.edu`
- Password: `password123`
- Institution: TechVidya College

**User 3:**
- Email: `student3@codemaster.edu`
- Password: `password123`
- Institution: CodeMaster School

---

## Expected Behavior

### ✅ Should Work
- Login with valid credentials
- Register new user
- Select any available track
- View roadmap for enrolled tracks
- Complete unlocked modules
- Switch between tracks
- Progress is preserved per track

### ❌ Should Fail
- Complete locked modules (prerequisites not met)
- View roadmap for non-enrolled track
- Access endpoints without authentication
- Complete same module twice (idempotent, returns already completed)

---

## Database Reset

To reset database and start fresh:

```bash
# Delete database
rm database.sqlite

# Reinitialize
npm run init-db
npm run seed
```

---

## Troubleshooting

### "Database is locked"
- Stop all running server instances
- Close any DB browser connections

### "Token expired"
- Login again to get new token
- Default expiry: 7 days

### "Module not found"
- Check module IDs in database
- Module IDs are auto-incremented

### Port already in use
- Change PORT in .env file
- Or kill process on port 5000

---

## Next Steps

1. Test all endpoints systematically
2. Verify prerequisite chains work correctly
3. Test with multiple users
4. Verify institution isolation
5. Test error cases
6. Load test with many modules/users
