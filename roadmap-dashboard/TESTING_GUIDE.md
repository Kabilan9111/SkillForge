# SkillForge Frontend - Testing Guide

## Quick Start

1. **Open the Application**
   ```
   Open index.html in your browser:
   - Right-click index.html in VS Code
   - Select "Open with Live Server" (if installed)
   - OR double-click index.html to open in browser
   ```

2. **Test Landing Page**
   - Verify 3 buttons are visible:
     - "View Careers" (header + hero)
     - "Get Started" (header)
     - "Start Your Roadmap" (hero)
   - Verify logo is clickable (should show message if not logged in)

3. **Test "View Careers" Flow**
   ```
   Click "View Careers" → Should show careers-list-page with 5 career options
   - Java Backend Enterprise Arch.
   - Python Full-Stack Developer
   - C / C++ Systems Engineer
   - Cloud & DevOps Engineer
   - JavaScript Full-Stack
   
   Click any career card → Should navigate to onboarding with role pre-filled
   ```

4. **Test "Get Started" Flow**
   ```
   From landing page, click "Get Started"
   → Should show course-selection-page with quiz
   
   Answer quiz questions:
   - Select an interest (backend/fullstack/systems/cloud)
   - Select experience level (none/some/intermediate)
   
   Click "Get Recommendations"
   → Should show recommended careers
   
   Click recommended career
   → Should navigate to onboarding with role pre-filled
   ```

5. **Test "Start Your Roadmap" Flow**
   ```
   CASE 1: First-time user (no state in localStorage)
   - Click "Start Your Roadmap"
   - Should redirect to careers-list-page
   - Should show toast: "Please complete the roadmap setup first"
   
   CASE 2: Returning user (has completed onboarding)
   - Click "Start Your Roadmap"
   - Should navigate directly to dashboard-page
   - Should show personalized roadmap
   ```

6. **Test Onboarding Flow**
   ```
   Select a career (e.g., Java Backend)
   → Onboarding page opens
   
   Step 1: Role (pre-filled)
   - Click "Next"
   
   Step 2: Level
   - Select level (Beginner/Intermediate/Advanced)
   - Click "Next"
   
   Step 3: Commitment
   - Adjust slider (1-8 hours/day)
   - Click "Build Roadmap"
   
   → Should auto-login
   → Should enroll in track
   → Should navigate to dashboard with personalized modules
   ```

7. **Test Dashboard**
   ```
   After completing onboarding:
   - Verify sidebar is visible
   - Verify track title matches selection
   - Verify progress bar shows percentage
   - Verify roadmap modules are displayed
   - Verify level buttons work (Beginner/Intermediate/Advanced)
   
   Click level button:
   - Should update modules based on level
   - Should show loading feedback
   ```

8. **Test Logo Navigation**
   ```
   Click any SkillForge logo:
   - Landing page logo
   - Careers page logo
   - Course selection logo
   - Onboarding logo
   - Sidebar logo
   
   BEFORE onboarding:
   - Should show toast: "Please complete onboarding to view your profile"
   
   AFTER onboarding:
   - Should navigate to profile-page
   - Should display user details
   - Should show stats (modules, projects, readiness)
   ```

9. **Test Sidebar Navigation**
   ```
   From dashboard, click sidebar items:
   - Home → dashboard-page
   - Projects → projects-page (shows track-specific projects)
   - Practice → practice-page (shows DSA + System Design tasks)
   - Mock Interview → mock-interview-page
   - Skill Gap → skill-gap-page
   - Profile → profile-page
   ```

10. **Test URL Routing**
    ```
    Manually change URL hash:
    
    #landing → Landing page
    #careers-list → Careers listing
    #course-selection → Course selection
    #onboarding → Onboarding (may redirect if no role selected)
    #dashboard → Dashboard (redirects to careers if incomplete)
    #profile → Profile page
    #projects → Projects page
    #practice → Practice page
    ```

11. **Test State Persistence**
    ```
    Complete onboarding flow
    → Refresh page (F5)
    → State should persist:
      - Selected track
      - Level
      - Commitment
      - Auth token
    
    Navigate to dashboard
    → Refresh page
    → Should stay on dashboard
    → Should show same track and level
    ```

12. **Test Browser Back/Forward**
    ```
    Landing → Careers → Onboarding → Dashboard
    
    Click browser back button:
    Dashboard → Onboarding → Careers → Landing
    
    Click browser forward button:
    Landing → Careers → Onboarding → Dashboard
    ```

---

## Console Debugging

Open browser console (F12) to see navigation logs:
```
App initialized
Stored state: {selectedTrackSlug: "java", currentUserLevel: "beginner", ...}
Navigating to: careers-list-page
Start Roadmap clicked
State: {selectedTrackSlug: "java", currentUserLevel: "beginner", currentCommitment: "2"}
```

---

## LocalStorage Inspection

After onboarding, check localStorage (F12 → Application → Local Storage):
```javascript
{
  "authToken": "eyJhbGciOiJIUzI1NiIs...",
  "selectedTrack": "java",
  "selectedTrackId": "1",
  "selectedRole": "Java Backend Enterprise Arch.",
  "userLevel": "beginner",
  "userCommitment": "2",
  "onboardingComplete": "true",
  "userData": "{\"id\":1,\"email\":\"student1@techvidya.edu\",...}"
}
```

---

## Expected Behavior Summary

| Button/Action | Destination | Condition |
|--------------|-------------|-----------|
| View Careers | careers-list-page | Always |
| Get Started | course-selection-page | Always |
| Start Your Roadmap | careers-list-page OR dashboard-page | Depends on state |
| Career Card Click | onboarding-page | Always |
| Logo Click | profile-page | If onboarding complete |
| Onboarding Complete | dashboard-page | After all 3 steps |
| Level Button | Same page, re-render | On dashboard only |
| Sidebar Nav | Various pages | Only visible on dashboard+ |

---

## Common Issues & Fixes

### Issue: "Start Your Roadmap" always redirects to careers
**Fix**: Complete onboarding flow first. Check localStorage has all 3 keys:
- selectedTrack
- userLevel
- userCommitment

### Issue: Logo click doesn't go to profile
**Fix**: Complete onboarding first. Check `onboardingComplete` in localStorage.

### Issue: Dashboard shows wrong track
**Fix**: Clear localStorage and re-select career.

### Issue: Level buttons don't work
**Fix**: Ensure backend is running (npm start in backend folder).

### Issue: URL hash doesn't change
**Fix**: Check console for navigation errors. Verify page IDs match.

---

## Manual Testing Checklist

- [ ] Landing page loads correctly
- [ ] "View Careers" button works
- [ ] "Get Started" button works
- [ ] "Start Your Roadmap" button works (both cases)
- [ ] All 5 career cards display
- [ ] Career card click starts onboarding
- [ ] Course selection quiz works
- [ ] Course selection recommendations work
- [ ] Onboarding step 1-3 progression works
- [ ] Onboarding completion navigates to dashboard
- [ ] Dashboard shows correct track
- [ ] Dashboard level buttons work
- [ ] Sidebar navigation works (all 6 items)
- [ ] All logos navigate to profile (when authenticated)
- [ ] Profile page displays user data
- [ ] Profile page displays stats
- [ ] URL hash routing works
- [ ] Browser back/forward works
- [ ] State persists after refresh
- [ ] Logout clears state and returns to landing

---

**Testing Duration**: ~15 minutes for complete flow
**Required**: Modern browser (Chrome/Edge/Firefox), No backend required for frontend testing
