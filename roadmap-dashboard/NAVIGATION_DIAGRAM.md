# SkillForge Navigation Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE                             │
│                                                                  │
│  Logo (Click) ──────────────────────────────> Profile*          │
│                                                                  │
│  [ View Careers ]  ────────────> Careers Listing Page           │
│  [ Get Started ]   ────────────> Course Selection Page          │
│  [ Start Roadmap ] ────────────> Smart Router:                  │
│                                   ├─ Has State? ──> Dashboard   │
│                                   └─ No State?  ──> Careers     │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────┐                    ┌──────────────────────┐
│  CAREERS LIST    │                    │  COURSE SELECTION    │
│                  │                    │                      │
│  Logo (Click) ─> │                    │  Logo (Click) ─────> │
│      Profile*    │                    │      Profile*        │
│                  │                    │                      │
│  [Java Backend]  │                    │  Quiz:               │
│  [Python Full]   │                    │  - Interests?        │
│  [C++ Systems]   │                    │  - Experience?       │
│  [Cloud DevOps]  │                    │                      │
│  [JS Full-Stack] │                    │  [ Get Recommend. ]  │
│        │         │                    │         │            │
│        │         │                    │         ▼            │
│        ▼         │                    │  Recommended:        │
│  ┌──────────┐   │                    │  - Career A          │
│  │ Click on │   │                    │  - Career B          │
│  │  Card    │   │                    │         │            │
│  └──────────┘   │                    │         ▼            │
└────────┬─────────┘                    └─────────┬────────────┘
         │                                        │
         │                                        │
         └────────────────┬───────────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │   ONBOARDING    │
                 │                 │
                 │ Logo (Click) ─> │
                 │     Profile*    │
                 │                 │
                 │ Step 1: Role    │
                 │   (Pre-filled)  │
                 │   [Next]        │
                 │       │         │
                 │       ▼         │
                 │ Step 2: Level   │
                 │   ○ Beginner    │
                 │   ○ Intermediate│
                 │   ○ Advanced    │
                 │   [Next]        │
                 │       │         │
                 │       ▼         │
                 │ Step 3: Hours   │
                 │   [1-8 slider]  │
                 │   [Build Map]   │
                 └────────┬────────┘
                          │
                          │ (Save to localStorage)
                          │
                          ▼
                 ┌─────────────────┐
                 │    DASHBOARD    │
                 │                 │
                 │  ┌──────────┐   │
                 │  │ SIDEBAR  │   │
                 │  │          │   │
                 │  │ Logo ──> │   │────> Profile
                 │  │ Profile* │   │
                 │  │          │   │
                 │  │ Home     │   │────> Dashboard
                 │  │ Projects │   │────> Projects
                 │  │ Practice │   │────> Practice
                 │  │ Mock Int │   │────> Mock Interview
                 │  │ Skill Gap│   │────> Skill Gap
                 │  │ Profile  │   │────> Profile
                 │  │ Logout   │   │────> Landing (Clear State)
                 │  └──────────┘   │
                 │                 │
                 │  Track Title    │
                 │  Progress Bar   │
                 │  Readiness Score│
                 │                 │
                 │  [Beginner]     │
                 │  [Intermediate] │────> Re-fetch Modules
                 │  [Advanced]     │
                 │                 │
                 │  Roadmap Nodes: │
                 │  - Module 1 ✓   │
                 │  - Module 2 ⏳  │
                 │  - Module 3 🔒  │
                 └─────────────────┘
                          │
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐   ┌──────────┐
   │ PROJECTS │    │ PRACTICE │   │ PROFILE  │
   │          │    │          │   │          │
   │ Sidebar  │    │ Sidebar  │   │ Sidebar  │
   │ Visible  │    │ Visible  │   │ Visible  │
   │          │    │          │   │          │
   │ Track-   │    │ DSA      │   │ Name     │
   │ Specific │    │ Problems │   │ Email    │
   │ Projects │    │          │   │ College  │
   │          │    │ System   │   │ Google   │
   │ [Modal]  │    │ Design   │   │ Track    │
   └──────────┘    └──────────┘   │ Level    │
                                   │ Commit   │
                                   │ Stats    │
                                   └──────────┘

* Profile accessible only after onboarding complete

═══════════════════════════════════════════════════════════════

ROUTING RULES:

1. Public Pages (No Auth Required):
   - Landing
   - Careers List
   - Course Selection
   - Onboarding

2. Protected Pages (Requires Onboarding):
   - Dashboard
   - Projects
   - Practice
   - Mock Interview
   - Skill Gap
   - Profile

3. Smart Routing Logic:
   
   startRoadmap() {
     if (hasTrack && hasLevel && hasCommitment) {
       → Dashboard
     } else {
       → Careers List
       + Show: "Please complete setup"
     }
   }

4. Logo Click Logic:
   
   logoClick() {
     if (isAuthenticated || onboardingComplete) {
       → Profile
     } else {
       + Show: "Complete onboarding first"
     }
   }

═══════════════════════════════════════════════════════════════

STATE FLOW:

Landing
  ↓
Select Career (careers-list or course-selection)
  ↓
Onboarding
  ├─ selectedTrackSlug ────> localStorage
  ├─ selectedTrackId ──────> localStorage
  ├─ selectedRole ─────────> localStorage
  ├─ userLevel ────────────> localStorage
  ├─ userCommitment ───────> localStorage
  └─ onboardingComplete ───> localStorage
  ↓
Auto-Login (if not logged in)
  ├─ authToken ────────────> localStorage
  └─ userData ─────────────> localStorage
  ↓
Enroll in Track (backend API)
  ↓
Fetch Roadmap (backend API)
  ↓
Dashboard
  ↓
All Protected Pages Accessible

═══════════════════════════════════════════════════════════════

URL HASH ROUTING:

/                          → Landing Page
/#landing                  → Landing Page
/#careers-list             → Careers Listing
/#course-selection         → Course Selection
/#onboarding               → Onboarding
/#dashboard                → Dashboard (protected)
/#profile                  → Profile (protected)
/#projects                 → Projects (protected)
/#practice                 → Practice (protected)
/#mock-interview           → Mock Interview (protected)
/#skill-gap                → Skill Gap (protected)

Protected routes redirect to careers-list if state incomplete.

═══════════════════════════════════════════════════════════════
```
