# SkillForge - Quick Start Guide

## 🚀 Start the Application

### 1. Start Backend Server

```powershell
# Open terminal in VS Code
# Navigate to backend directory
cd f:\SkillForge\backend

# Start server
node server.js
```

You should see:
```
Connected to SQLite database
✓ Database connected
Database initialized successfully!
✓ Database schema ready

🚀 SkillForge Backend running
📍 Environment : development
🌐 API         : http://localhost:5000/api
💚 Health      : http://localhost:5000/api/health
```

### 2. Open Frontend

```powershell
# In a new terminal or File Explorer
# Open the HTML file
Start-Process f:\SkillForge\roadmap-dashboard\index.html
```

Or use VS Code Live Server:
1. Right-click on `index.html`
2. Select "Open with Live Server"

### 3. Test the Features

#### Register & Login
1. Click "Sign Up" on landing page
2. Fill in details (name, email, password)
3. After signup, you'll be auto-logged in

#### Select Career Track
1. After login, you'll see career selection
2. Click on a track (e.g., "Full-Stack Developer")
3. Click "Get Started"

#### Test Dashboard (Feature 1)
1. Click "Home" in sidebar
2. You'll see three level tabs: Beginner, Intermediate, Advanced
3. Click each tab to see different modules
4. Modules update without page reload

#### Test Practice Arena (Feature 2)
1. Click "Practice" in sidebar
2. You'll see 14 DSA topic cards
3. Click any topic card to expand
4. You'll see problems with difficulty badges
5. Click a problem to view details in modal
6. Try marking a problem as solved

#### Test Skill Gap Analyzer (Feature 3)
1. Click "Skill Gap" in sidebar
2. Drag and drop a PDF/DOC file OR click to browse
3. Click "Analyze Resume" button
4. Wait for analysis to complete
5. View results: Strong, Weak, Missing skills
6. Click "Fix My Roadmap" to adjust learning path

## 🧪 Verify Everything Works

Run the test script:

```powershell
cd f:\SkillForge\backend
.\test-enhanced-flows.ps1
```

Expected output:
```
✓ Health check passed
✓ Endpoint exists (401 Unauthorized as expected)
✓ Endpoint exists (401 Unauthorized as expected)
```

## 🔍 Troubleshooting

### Backend won't start
```powershell
# Make sure you're in the right directory
pwd  # Should show: f:\SkillForge\backend

# Make sure dependencies are installed
npm install

# Check if port 5000 is already in use
netstat -ano | findstr :5000
```

### Frontend shows errors
1. Open browser console (F12)
2. Check for CORS errors → make sure backend is running
3. Check for auth errors → try logging in again
4. Check localStorage → `localStorage.getItem('authToken')`

### File upload fails
1. Make sure uploads directory exists: `f:\SkillForge\backend\uploads\resumes`
2. Check file size (max 5MB)
3. Check file type (PDF, DOC, DOCX only)
4. Check backend logs for multer errors

### Database issues
```powershell
# Delete and recreate database
cd f:\SkillForge\backend
Remove-Item skillforge.db -ErrorAction SilentlyContinue
node server.js  # Will recreate database
```

## 📝 Feature Summary

### ✅ What's Working

1. **Level-Switchable Dashboard**
   - Three level tabs (Beginner/Intermediate/Advanced)
   - Dynamic module rendering
   - State persistence across refreshes

2. **DSA Practice Arena**
   - 14 topic categories (Arrays, Strings, Stack, Queue, etc.)
   - 3 problems per difficulty per topic (Easy/Medium/Hard)
   - Expandable topics with problem lists
   - Problem detail modal
   - Progress tracking

3. **Skill Gap Analyzer**
   - Drag-and-drop file upload
   - File validation (type & size)
   - AI analysis (currently using mock data)
   - Three skill categories: Strong, Weak, Missing
   - Overall skill score (0-100%)
   - One-click roadmap adjustment

### 🚧 Known Limitations

1. **Resume Analysis**: Uses mock data (real PDF extraction pending)
2. **Database**: Practice progress stored in localStorage only
3. **Problems**: Limited to 3 per difficulty per topic
4. **AI**: Skill extraction is simulated

## 🎯 Next Steps

1. **Test all features** to ensure they work end-to-end
2. **Add more problems** to the practice arena
3. **Implement real PDF parsing** for skill gap analyzer
4. **Connect to database** for persistent progress tracking
5. **Add AI integration** for real skill analysis

## 📚 Documentation

- [ENHANCED_FLOWS.md](f:\SkillForge\ENHANCED_FLOWS.md) - Complete documentation
- [API_DOCUMENTATION.md](f:\SkillForge\backend\API_DOCUMENTATION.md) - API reference
- [TESTING.md](f:\SkillForge\backend\TESTING.md) - Testing guide

## 💡 Tips

- Keep backend server running in background
- Use browser DevTools (F12) to debug
- Check Network tab for API call details
- Check Console for JavaScript errors
- Use Application tab to view localStorage

Enjoy using SkillForge! 🎓
