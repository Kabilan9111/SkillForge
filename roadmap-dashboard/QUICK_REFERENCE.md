# SkillForge Navigation - Quick Reference Card

## Button Actions (Landing Page)

| Button | Destination | Purpose |
|--------|-------------|---------|
| **View Careers** | `careers-list-page` | Browse all career paths |
| **Get Started** | `course-selection-page` | Help undecided users choose |
| **Start Your Roadmap** | `careers-list-page` OR `dashboard-page` | Smart routing based on state |

---

## Logo Click Behavior

**All logos route to Profile** (when authenticated)

- Landing page logo
- Careers page logo  
- Course selection logo
- Onboarding logo
- Sidebar logo

**Before onboarding**: Shows toast message  
**After onboarding**: Routes to profile page

---

## State Requirements

### Dashboard Access
```javascript
Required in localStorage:
✓ selectedTrackSlug (e.g., "java")
✓ userLevel ("beginner", "intermediate", or "advanced")
✓ userCommitment ("1" to "8")
```

### Profile Access
```javascript
Required:
✓ authToken OR onboardingComplete === "true"
```

---

## Page Visibility Rules

| Page | Sidebar | Auth Required | State Required |
|------|---------|---------------|----------------|
| Landing | Hidden | No | No |
| Careers List | Hidden | No | No |
| Course Selection | Hidden | No | No |
| Onboarding | Hidden | No | No |
| Dashboard | Visible | Yes | Track + Level + Commitment |
| Projects | Visible | Yes | Track + Level + Commitment |
| Practice | Visible | Yes | Track + Level + Commitment |
| Mock Interview | Visible | Yes | Track + Level + Commitment |
| Skill Gap | Visible | Yes | Track + Level + Commitment |
| Profile | Visible | Yes | Auth OR Onboarding Complete |

---

## Navigation Functions

```javascript
// Basic navigation
navigateTo('page-id')

// Smart roadmap start
startRoadmap()
  → Checks state
  → Routes to careers OR dashboard

// Career selection
selectCareer('slug')
  → Saves track to state
  → Routes to onboarding

// Level switching (dashboard only)
switchLevel('beginner|intermediate|advanced')
  → Updates state
  → Re-fetches modules
```

---

## URL Routing

```
Direct Access URLs:
/#landing
/#careers-list
/#course-selection
/#onboarding
/#dashboard          (requires state)
/#profile            (requires auth)
/#projects           (requires state)
/#practice           (requires state)
```

---

## Data Sources

### Careers
```javascript
CAREERS array (app.js, line 12)
- 5 career tracks
- Can be replaced with API fetch
```

### Roadmap Modules
```javascript
Primary: Backend API
  GET /api/roadmap/:trackId?level=<level>

Fallback: TRACK_DATA (app.js, line 21)
  - Offline support
  - Mock data
```

### User Profile
```javascript
localStorage.userData
- From backend login response
- Displays name, email, institution, etc.
```

---

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | All page views (SPA structure) |
| `app.js` | Complete navigation + state logic |
| `styles.css` | Styling for all pages |
| `NAVIGATION_FLOW.md` | Comprehensive documentation |
| `TESTING_GUIDE.md` | Testing procedures |
| `IMPLEMENTATION_SUMMARY.md` | What was built |
| `NAVIGATION_DIAGRAM.md` | Visual flow diagram |

---

## Common Tasks

### Add a New Career
```javascript
// In app.js, CAREERS array
{
  id: 6,
  slug: 'data-science',
  title: 'Data Science & ML Engineer',
  description: 'Build ML models and data pipelines',
  level: 'Medium',
  time: '7 Months',
  theme: 'theme-python'
}

// Add corresponding TRACK_DATA entry
data-science: {
  stats: { progress: 0, readiness: 0 },
  roadmap: [...],
  projects: [...],
  tasks: { dsa: [...], design: [...] }
}
```

### Add a New Page
```html
<!-- In index.html -->
<section id="new-page" class="page-view hidden">
  <header class="page-header">
    <h2>New Page</h2>
  </header>
  <div class="content">
    <!-- Page content -->
  </div>
</section>
```

```javascript
// In app.js, add navigation handler
document.querySelector('[data-action="nav-new"]')
  .addEventListener('click', () => navigateTo('new-page'));
```

---

## Debugging

### Check State
```javascript
// In browser console
console.log({
  selectedTrackSlug: localStorage.getItem('selectedTrack'),
  userLevel: localStorage.getItem('userLevel'),
  userCommitment: localStorage.getItem('userCommitment'),
  onboardingComplete: localStorage.getItem('onboardingComplete'),
  authToken: !!localStorage.getItem('authToken')
});
```

### Clear State
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Test Without Backend
```javascript
// Works offline with mock data
// All navigation functional
// Login/enroll will show warnings but continue
```

---

## Browser Compatibility

✅ Chrome/Edge (Recommended)  
✅ Firefox  
✅ Safari  
⚠️ IE11 (Not supported - uses modern JS)

---

**Last Updated**: January 25, 2026
