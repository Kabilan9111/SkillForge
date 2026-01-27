# Frontend Integration Guide

## Overview

This guide explains how to integrate the SkillForge backend with your existing roadmap dashboard frontend.

---

## Backend Architecture Summary

The backend enforces:
1. ✅ **Strict prerequisite validation** - modules cannot be completed unless prerequisites are met
2. ✅ **Track-based isolation** - each track's progress is completely separate
3. ✅ **Single source of truth** - all business logic on backend, frontend displays only
4. ✅ **Institution scoping** - data separated by school/college
5. ✅ **Server-side progress calculation** - frontend never calculates, only displays

---

## Integration Steps

### 1. Environment Configuration

**Frontend `.env`:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
# or in production:
# VITE_API_BASE_URL=https://api.skillforge.com/api
```

### 2. API Client Setup

**Create `src/api/client.js`:**
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('skillforge_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('skillforge_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('skillforge_token');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  async register(institutionId, email, password, fullName) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ institutionId, email, password, fullName })
    });
    this.setToken(data.token);
    return data;
  }

  // User
  async getCurrentUser() {
    return this.request('/user/me');
  }

  async getUserProfile() {
    return this.request('/user/profile');
  }

  // Tracks
  async getAllTracks() {
    return this.request('/track/all');
  }

  async getActiveTrack() {
    return this.request('/track/active');
  }

  async selectTrack(trackId) {
    return this.request('/track/select', {
      method: 'POST',
      body: JSON.stringify({ trackId })
    });
  }

  // Roadmap
  async getRoadmap() {
    return this.request('/roadmap');
  }

  async getRoadmapForTrack(trackId) {
    return this.request(`/roadmap/${trackId}`);
  }

  // Progress
  async getProgress() {
    return this.request('/progress');
  }

  async completeModule(moduleId, trackId = null) {
    return this.request('/progress/complete', {
      method: 'POST',
      body: JSON.stringify({ moduleId, trackId })
    });
  }

  async getPlacementReadiness(trackId = null) {
    const query = trackId ? `?trackId=${trackId}` : '';
    return this.request(`/progress/placement-readiness${query}`);
  }
}

export const api = new APIClient();
```

### 3. Authentication Flow

**Login Component:**
```javascript
import { api } from './api/client';

async function handleLogin(email, password) {
  try {
    const response = await api.login(email, password);
    console.log('Logged in:', response.user);
    // Redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}
```

### 4. Roadmap Display

**Roadmap Component:**
```javascript
import { api } from './api/client';
import { useState, useEffect } from 'react';

function RoadmapDashboard() {
  const [roadmap, setRoadmap] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadRoadmap();
  }, []);

  async function loadRoadmap() {
    try {
      const [roadmapData, trackData, progressData] = await Promise.all([
        api.getRoadmap(),
        api.getActiveTrack(),
        api.getProgress()
      ]);

      setRoadmap(roadmapData.roadmap);
      setActiveTrack(trackData.track);
      setProgress(progressData.progress);
    } catch (error) {
      console.error('Failed to load roadmap:', error);
    }
  }

  async function handleCompleteModule(moduleId) {
    try {
      const result = await api.completeModule(moduleId);
      
      if (result.alreadyCompleted) {
        alert('Module already completed');
      } else {
        alert('Module completed successfully!');
        // Reload roadmap to show updated state
        await loadRoadmap();
      }
    } catch (error) {
      // Backend will return error if prerequisites not met
      alert(`Cannot complete: ${error.message}`);
    }
  }

  return (
    <div>
      <h1>{activeTrack?.name} Roadmap</h1>
      <div>
        Progress: {progress?.completedModules}/{progress?.totalModules} 
        ({progress?.completionPercentage}%)
      </div>

      {roadmap.map(module => (
        <div key={module.id} className={`module-card ${module.status}`}>
          <h3>{module.title}</h3>
          <p>{module.description}</p>
          <span>Category: {module.category}</span>
          <span>Est. Hours: {module.estimatedHours}</span>
          
          {module.status === 'completed' && (
            <span className="badge completed">✓ Completed</span>
          )}
          
          {module.status === 'unlocked' && (
            <button onClick={() => handleCompleteModule(module.id)}>
              Mark as Complete
            </button>
          )}
          
          {module.status === 'locked' && (
            <span className="badge locked">🔒 Locked</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 5. Track Selector

**Track Selector Component:**
```javascript
import { api } from './api/client';
import { useState, useEffect } from 'react';

function TrackSelector() {
  const [tracks, setTracks] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);

  useEffect(() => {
    loadTracks();
  }, []);

  async function loadTracks() {
    try {
      const [allTracks, active] = await Promise.all([
        api.getAllTracks(),
        api.getActiveTrack()
      ]);
      setTracks(allTracks.tracks);
      setActiveTrack(active.track);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    }
  }

  async function selectTrack(trackId) {
    try {
      const result = await api.selectTrack(trackId);
      setActiveTrack(result.track);
      // Reload roadmap in parent component
      window.location.reload(); // Or use state management
    } catch (error) {
      alert(`Failed to switch track: ${error.message}`);
    }
  }

  return (
    <div className="track-selector">
      {tracks.map(track => (
        <button
          key={track.id}
          className={track.id === activeTrack?.track_id ? 'active' : ''}
          onClick={() => selectTrack(track.id)}
          style={{ borderColor: track.color }}
        >
          {track.name}
        </button>
      ))}
    </div>
  );
}
```

---

## Key Integration Points

### 1. Module Status Display

Backend returns three statuses:
- `completed` - Module is done (show checkmark, disable button)
- `unlocked` - Module is available (show "Complete" button)
- `locked` - Prerequisites not met (show lock icon, disable)

**Never** calculate this on frontend - backend provides it.

### 2. Prerequisite Enforcement

When user clicks "Complete Module":
1. Frontend sends request to backend
2. Backend validates prerequisites
3. If valid: marks complete and returns updated progress
4. If invalid: returns error with missing prerequisite name

Frontend just displays the error - no logic needed.

### 3. Progress Tracking

Backend calculates:
- Total modules
- Completed modules
- Completion percentage
- Category-wise progress

Frontend displays these values - never recalculates.

### 4. Track Isolation

When user switches tracks:
1. Call `api.selectTrack(newTrackId)`
2. Reload roadmap (automatically shows new track's data)
3. Old track's progress is preserved in database

No special handling needed in frontend.

---

## Error Handling

### Common Errors and How to Handle

**401 Unauthorized:**
```javascript
// Token expired or invalid
api.clearToken();
window.location.href = '/login';
```

**403 Forbidden (Prerequisite not met):**
```javascript
// Show error to user
alert(`Cannot complete: ${error.message}`);
// Backend message will include which prerequisite is missing
```

**404 Not Found (No active track):**
```javascript
// Redirect to track selection
window.location.href = '/select-track';
```

---

## State Management (Optional)

### Using Context API

**Create `src/context/AuthContext.js`:**
```javascript
import { createContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const response = await api.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      api.clearToken();
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const response = await api.login(email, password);
    setUser(response.user);
  }

  function logout() {
    api.clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## Testing Integration

### 1. Start Backend
```bash
cd backend
npm start
```

### 2. Configure Frontend
```bash
cd roadmap-dashboard
# Update .env with backend URL
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env
```

### 3. Test Flow
1. Login with test credentials
2. Select a track
3. View roadmap (should show locked/unlocked correctly)
4. Complete first module (should work)
5. Try to complete locked module (should fail with error)
6. Switch tracks (progress should be isolated)

---

## Migration from Local Data

### Before (Frontend-only):
```javascript
// Hardcoded roadmap data
const roadmapData = {
  java: [...modules],
  python: [...modules]
};
```

### After (Backend-integrated):
```javascript
// Fetch from backend
const { roadmap } = await api.getRoadmap();
```

### Migration Steps:
1. Keep existing UI/styling
2. Replace data source with API calls
3. Remove local progress tracking logic
4. Remove prerequisite checking logic
5. Let backend handle all business rules

---

## Performance Optimization

### 1. Caching
```javascript
// Cache roadmap for 5 minutes
let cachedRoadmap = null;
let cacheTime = null;

async function getRoadmap() {
  if (cachedRoadmap && Date.now() - cacheTime < 300000) {
    return cachedRoadmap;
  }
  
  const data = await api.getRoadmap();
  cachedRoadmap = data;
  cacheTime = Date.now();
  return data;
}
```

### 2. Optimistic Updates
```javascript
async function completeModule(moduleId) {
  // Optimistically update UI
  setModuleStatus(moduleId, 'completed');
  
  try {
    await api.completeModule(moduleId);
  } catch (error) {
    // Revert on error
    setModuleStatus(moduleId, 'unlocked');
    alert(error.message);
  }
}
```

---

## Deployment Configuration

### Development
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Production
```env
VITE_API_BASE_URL=https://api.skillforge.com/api
```

### Build
```bash
npm run build
```

Frontend can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- S3 + CloudFront

Backend should be on:
- VPS (DigitalOcean, AWS)
- Heroku
- Railway
- Render

---

## CORS Configuration

Backend is already configured with CORS. Update backend `.env`:
```env
CORS_ORIGIN=https://yourfrontend.com
```

For development (allow multiple origins):
```javascript
// In server.js
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

---

## Complete Example App Structure

```
roadmap-dashboard/
├── src/
│   ├── api/
│   │   └── client.js          # API wrapper
│   ├── components/
│   │   ├── Login.jsx          # Login form
│   │   ├── TrackSelector.jsx  # Track switcher
│   │   ├── Roadmap.jsx        # Main roadmap display
│   │   └── ModuleCard.jsx     # Individual module
│   ├── context/
│   │   └── AuthContext.jsx    # Auth state management
│   ├── App.jsx
│   └── main.jsx
├── .env
└── package.json
```

---

## Support

If you encounter integration issues:

1. **Check backend logs** - errors are logged server-side
2. **Verify token** - ensure JWT is being sent correctly
3. **Test API directly** - use Postman/cURL to isolate issues
4. **Check CORS** - common issue with cross-origin requests

---

## Next Steps

1. ✅ Backend is ready and running
2. ⏭️ Integrate authentication
3. ⏭️ Replace local data with API calls
4. ⏭️ Test prerequisite enforcement
5. ⏭️ Deploy to production

**Your backend is production-ready and waiting for frontend integration!** 🚀
