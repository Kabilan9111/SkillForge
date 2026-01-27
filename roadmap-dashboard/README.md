# SkillForge Frontend - Roadmap Dashboard

## 🎯 Overview

Complete, deterministic frontend navigation system for SkillForge with proper routing, state management, and page-to-page flow.

## ✨ Features

- **Smart Routing**: Button actions respect user intent and state
- **State Persistence**: Works across refreshes and direct URLs
- **Dynamic Careers**: All career paths sourced from centralized config
- **Profile Access**: Quick access via clickable logos
- **URL-based Navigation**: Hash routing with browser back/forward support
- **Offline Support**: Full functionality without backend

## 🚀 Quick Start

### 1. Open the App
```bash
# Option A: Live Server (Recommended)
Right-click index.html → Open with Live Server

# Option B: Direct Browser
Double-click index.html
```

### 2. Test the Flow
```
Landing Page → View Careers → Select Career → Onboarding → Dashboard
```

## 📁 File Structure

```
roadmap-dashboard/
├── index.html                  # Single-page app structure
├── app.js                      # Complete navigation logic
├── styles.css                  # All page styling
├── README.md                   # This file
├── NAVIGATION_FLOW.md          # Comprehensive documentation
├── NAVIGATION_DIAGRAM.md       # Visual flow diagram
├── IMPLEMENTATION_SUMMARY.md   # What was built
├── TESTING_GUIDE.md            # Testing procedures
└── QUICK_REFERENCE.md          # Quick reference card
```

## 🎨 Pages

1. **Landing Page** - Entry point with 3 distinct CTAs
2. **Careers Listing** - Browse all career paths
3. **Course Selection** - Quiz-based career recommendations
4. **Onboarding** - Role → Level → Commitment flow
5. **Dashboard** - Personalized roadmap view
6. **Projects** - Mandatory project assignments
7. **Practice** - DSA & system design tasks
8. **Mock Interview** - AI interview preparation
9. **Skill Gap** - Resume analysis
10. **Profile** - User details and statistics

## 🔄 Navigation Flow

### Button Actions

| Button | Destination | Purpose |
|--------|-------------|---------|
| View Careers | Careers List | Browse all options |
| Get Started | Course Selection | Help undecided users |
| Start Roadmap | Smart Router | Continue or setup |

### Smart Routing

**"Start Your Roadmap"** checks state:
- Has track + level + commitment? → Dashboard
- Missing any? → Careers List (with message)

### Logo Navigation

All logos route to **Profile** (when authenticated):
- Landing logo
- Careers logo
- Course selection logo
- Onboarding logo
- Sidebar logo

## 💾 State Management

### LocalStorage Keys
```javascript
{
  authToken: string,
  selectedTrack: string,
  selectedTrackId: number,
  selectedRole: string,
  userLevel: "beginner|intermediate|advanced",
  userCommitment: "1-8",
  onboardingComplete: "true",
  userData: JSON string
}
```

## 🌐 URL Routing

```
/#landing              → Landing Page
/#careers-list         → Careers Listing
/#course-selection     → Course Selection
/#onboarding           → Onboarding
/#dashboard            → Dashboard (protected)
/#profile              → Profile (protected)
/#projects             → Projects (protected)
```

## 🔌 Backend Integration

### Optional Backend
Backend is optional - app works offline with mock data.

### API Endpoints
```javascript
POST /api/auth/login          # Auto-login
POST /api/track/enroll        # Track enrollment
GET /api/roadmap/:id?level=X  # Personalized modules
```

### Start Backend (Optional)
```bash
cd ../backend
npm install
npm start
```

## 📖 Documentation

- **[NAVIGATION_FLOW.md](NAVIGATION_FLOW.md)** - Complete navigation documentation
- **[NAVIGATION_DIAGRAM.md](NAVIGATION_DIAGRAM.md)** - Visual flow diagrams
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was built
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing procedures
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference card

## 🧪 Testing

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for complete testing procedures.

Quick test: Landing → View Careers → Java → Complete Onboarding → Dashboard

## 🌟 Benefits

✅ User intent respected end-to-end  
✅ Deterministic, predictable navigation  
✅ State persists across refreshes  
✅ Direct URL access works  
✅ Dynamic career data (not hardcoded)  
✅ Quick profile access via logos  
✅ Offline-capable  

---

**Developer**: GitHub Copilot | **Date**: January 25, 2026
