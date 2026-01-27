# SkillForge Frontend Navigation Flow

## Overview
Complete, deterministic navigation system with proper state management and routing for the SkillForge web application.

## Navigation Architecture

### Pages
1. **Landing Page** (`landing-page`) - Initial entry point
2. **Careers Listing Page** (`careers-list-page`) - Dynamic career paths catalog
3. **Course Selection Page** (`course-selection-page`) - Onboarding for undecided users
4. **Onboarding Flow** (`onboarding-page`) - Role → Level → Commitment
5. **Dashboard** (`dashboard-page`) - Personalized roadmap view
6. **Projects** (`projects-page`) - Mandatory project assignments
7. **Practice** (`practice-page`) - DSA and system design tasks
8. **Mock Interview** (`mock-interview-page`) - AI-powered interview prep
9. **Skill Gap** (`skill-gap-page`) - Resume analysis tool
10. **Profile** (`profile-page`) - User details and statistics

---

## Button Click Actions

### Landing Page CTAs

#### 1. "View Careers" Button
**Action**: `navigateTo('careers-list-page')`
- Routes to dedicated careers listing page
- Displays all career paths dynamically from `CAREERS` array
- Shows: Java Backend, Python Full-Stack, C/C++ Systems, Cloud & DevOps, JavaScript Full-Stack
- Each career card is clickable and navigates to onboarding with pre-selected track

#### 2. "Get Started" Button
**Action**: `navigateTo('course-selection-page')`
- Routes to course selection onboarding page
- For undecided users who need guidance
- Quiz-based recommendation system
- Does NOT directly start roadmap

#### 3. "Start Your Roadmap" Button
**Action**: `startRoadmap()`
- **Smart Navigation Logic**:
  - Checks if `selectedTrackSlug`, `currentUserLevel`, and `currentCommitment` exist in localStorage
  - **If ANY missing**: Redirects to `careers-list-page` with message
  - **If ALL present**: Sets active track and navigates to `dashboard-page`
- Ensures onboarding is complete before dashboard access

---

## Logo Click Navigation

### Clickable Elements
All SkillForge logos/avatars are clickable:
- Landing page logo (`#landing-logo`)
- Careers page logo (`#careers-logo`)
- Course selection page logo (`#course-selection-logo`)
- Onboarding page logo (`#onboarding-logo`)
- Sidebar header logo (`#sidebar-logo`)

**Action**: Navigate to `profile-page`
- **Condition**: Only works if user has completed onboarding or is authenticated
- **Fallback**: Shows toast message if onboarding incomplete

---

## State Management

### LocalStorage Keys
```javascript
{
  authToken: string | null,           // JWT token from backend
  selectedTrack: string | null,       // Track slug (java, python, cpp, etc.)
  selectedTrackId: number | null,     // Track ID for API calls
  selectedRole: string | null,        // Track display name
  userLevel: string,                  // beginner | intermediate | advanced
  userCommitment: string | null,      // Hours per day (1-8)
  onboardingComplete: string,         // 'true' | null
  userData: string                    // JSON string of user profile data
}
```

### State Persistence
- State persists across page refreshes
- URL hash routing enables direct access (`#careers-list`, `#dashboard`, etc.)
- Form inputs restored from localStorage

---

## Routing System

### Hash-based URL Routing
```
http://localhost/                       → Landing Page
http://localhost/#careers-list          → Careers Listing
http://localhost/#course-selection      → Course Selection
http://localhost/#onboarding            → Onboarding Flow
http://localhost/#dashboard             → Dashboard (requires onboarding)
http://localhost/#profile               → User Profile
```

### Navigation Function
```javascript
navigateTo(pageId)
```
- Hides all pages, shows target
- Manages sidebar visibility
- Updates URL hash
- Renders dynamic content
- Validates access (e.g., dashboard requires track selection)

---

## Career Path Data Source

### Dynamic CAREERS Array
Located in `app.js`, line 12:
```javascript
const CAREERS = [
    { id: 1, slug: 'java', title: 'Java Backend Enterprise Arch.', ... },
    { id: 2, slug: 'python', title: 'Python Full-Stack Developer', ... },
    { id: 3, slug: 'cpp', title: 'C / C++ Systems Engineer', ... },
    { id: 4, slug: 'cloud', title: 'Cloud & DevOps Engineer', ... },
    { id: 5, slug: 'javascript', title: 'JavaScript Full-Stack', ... }
]
```

**Why Not Hardcoded in UI**:
- Centralized configuration
- Easy to add/remove careers
- Single source of truth
- Can be replaced with API fetch

---

## Onboarding Flow

### Step 1: Role Selection
- Pre-filled from career card click
- "Change Role" button returns to careers list

### Step 2: Level Selection
- Beginner / Intermediate / Advanced
- Stored in `localStorage.userLevel`

### Step 3: Commitment
- 1-8 hours/day slider
- Stored in `localStorage.userCommitment`

### Completion
- Auto-login if not authenticated
- Enrolls user in selected track via API
- Fetches personalized roadmap from backend
- Navigates to dashboard with track-specific modules

---

## Dashboard Behavior

### Module Filtering
- Modules filtered by **selected track AND level**
- Backend API: `GET /api/roadmap/:trackId?level=<level>`
- Frontend merges backend data with `TRACK_DATA` mock

### Level Switching
- Buttons at top of dashboard
- Re-fetches roadmap for new level
- Updates progress bar
- Preserves track selection

---

## Profile Page

### Data Sources
1. **User Info**: `localStorage.userData` (from backend login)
2. **Track Info**: `localStorage.selectedRole`, `selectedTrack`, `userLevel`, `userCommitment`
3. **Stats**: Calculated from active track's `TRACK_DATA`

### Displayed Fields
- Full Name
- Email
- Institution/College Name
- Google Account (if linked)
- Selected Career Track
- Skill Level
- Daily Commitment
- Modules Completed
- Projects Completed
- Placement Readiness Score

---

## Testing Checklist

### Direct URL Access
- [ ] `#landing` loads landing page
- [ ] `#careers-list` loads careers page
- [ ] `#course-selection` loads course selection
- [ ] `#dashboard` redirects to careers if incomplete
- [ ] `#profile` works after onboarding

### Button Navigation
- [ ] "View Careers" → careers-list-page
- [ ] "Get Started" → course-selection-page
- [ ] "Start Your Roadmap" → smart navigation (careers or dashboard)
- [ ] Career card click → onboarding with pre-filled role

### Logo Navigation
- [ ] All logos redirect to profile (when authenticated)
- [ ] Shows message if onboarding incomplete

### State Persistence
- [ ] Selected track persists after refresh
- [ ] Level persists after refresh
- [ ] Commitment persists after refresh
- [ ] URL hash updates on navigation
- [ ] Back/forward browser buttons work

### Conditional Rendering
- [ ] Sidebar hidden on landing/careers/onboarding
- [ ] Sidebar visible on dashboard/projects/practice
- [ ] Dashboard shows correct track data
- [ ] Level buttons reflect current level

---

## API Integration Points

### Authentication
- `POST /api/auth/login` - Auto-login with demo credentials
- Token stored in localStorage

### Track Enrollment
- `POST /api/track/enroll` - Enroll user in selected track with level
- Called after onboarding completion

### Roadmap Fetch
- `GET /api/roadmap/:trackId?level=<level>` - Get personalized roadmap
- Called on dashboard load and level switch
- Merges with local `TRACK_DATA` for offline support

---

## Key Design Decisions

### Why Separate Pages?
- **Careers List**: Browse all options without commitment
- **Course Selection**: Guided quiz for undecided users (doesn't force roadmap)
- **Onboarding**: Collects level/commitment after role selected
- **Dashboard**: Personalized view after complete setup

### Why Smart "Start Roadmap" Button?
- Prevents users from reaching dashboard without context
- Validates state before navigation
- Guides incomplete users back to setup flow

### Why Clickable Logos?
- Common UX pattern (logo → home/profile)
- Provides quick access to user details
- Works consistently across all pages

### Why Hash Routing?
- Works without server-side routing
- Enables direct URL sharing
- Browser back/forward support
- No page reloads

---

## Future Enhancements

1. **Server-side Routing**: Replace hash routing with React Router or similar
2. **API-based Careers**: Fetch CAREERS array from backend
3. **OAuth Integration**: Link Google accounts
4. **Profile Editing**: Allow users to update details
5. **Progress Persistence**: Save module completion to backend
6. **Analytics**: Track user navigation patterns

---

## File Structure
```
roadmap-dashboard/
├── index.html          # All page views (single-page app)
├── app.js              # Complete navigation + state logic
├── styles.css          # Styling for all pages
└── NAVIGATION_FLOW.md  # This documentation
```

---

**Last Updated**: January 25, 2026
**Version**: 1.0.0
