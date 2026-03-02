# PROJECT WORKSPACE - FULL SYSTEM ARCHITECTURE
## GitHub-like Version Control with AI-Powered Intelligence

## SYSTEM OVERVIEW

This is a production-grade project workspace system that combines:
- GitHub-style version control
- Real-time file management
- 6-layer AI code analysis
- Intelligent evaluation engine
- Temporal code quality tracking

---

## ARCHITECTURE LAYERS

### 1. DATABASE LAYER
**Schema:** `src/database/schema-workspace.sql`

Tables:
- `projects_workspace` - Project metadata
- `project_files` - Version-controlled files
- `project_commits` - Commit history
- `project_ai_reviews` - AI analysis results
- `project_evaluations` - Commit comparisons
- `file_changes` - Diff tracking

### 2. STORAGE LAYER
**Structure:**
```
/uploads/projects/
  /{project_id}/
    /commits/
      /{commit_hash}/
        /files/
          - Actual file content
        /metadata.json
    /snapshots/
      /{commit_hash}.tar.gz
```

### 3. BACKEND SERVICE LAYER

#### Core Services:
1. **FileManager** (`services/projectWorkspace/fileManager.js`)
   - File upload/download
   - Directory tree building
   - Content deduplication (SHA-256)
   - Binary file detection
   - Syntax highlighting preparation

2. **CommitManager** (`services/projectWorkspace/commitManager.js`)
   - Commit creation
   - Parent tracking
   - Snapshot preservation
   - Rollback capability
   - Branch simulation (future)

3. **DiffEngine** (`services/projectWorkspace/diffEngine.js`)
   - Line-by-line diffing
   - Unified diff format
   - Side-by-side comparison
   - Syntax-aware diff colors

4. **AIReviewEngine** (`services/projectWorkspace/aiReviewEngine.js`)
   - 6-layer analysis pipeline
   - Cross-commit comparison
   - Regression detection
   - Industry benchmark matching

5. **EvaluationEngine** (`services/projectWorkspace/evaluationEngine.js`)
   - Commit-to-commit delta calculation
   - Trend analysis
   - Health scoring
   - Visualization data generation

#### Controllers:
- **ProjectWorkspaceController** (`controllers/projectWorkspaceController.js`)
  - REST API endpoints
  - Request validation
  - Response formatting

#### Routes:
- **projectWorkspaceRoutes** (`routes/projectWorkspaceRoutes.js`)
  - API route definitions
  - Middleware attachment

---

## API ENDPOINTS

### Projects
```
POST   /api/workspace/projects          - Create project
GET    /api/workspace/projects          - List user projects
GET    /api/workspace/projects/:id      - Get project details
PUT    /api/workspace/projects/:id      - Update project
DELETE /api/workspace/projects/:id      - Delete project
```

### Files
```
POST   /api/workspace/projects/:id/files     - Upload files
GET    /api/workspace/projects/:id/files     - Get file tree
GET    /api/workspace/projects/:id/files/:path - Get file content
DELETE /api/workspace/projects/:id/files/:path - Delete file
```

### Commits
```
POST   /api/workspace/projects/:id/commits              - Create commit
GET    /api/workspace/projects/:id/commits              - List commits
GET    /api/workspace/projects/:id/commits/:hash        - Get commit details
GET    /api/workspace/projects/:id/commits/:hash/diff   - Get commit diff
POST   /api/workspace/projects/:id/commits/:hash/rollback - Rollback commit
```

### AI Review
```
GET    /api/workspace/projects/:id/ai-review           - Get latest review
GET    /api/workspace/commits/:hash/ai-review          - Get commit review
POST   /api/workspace/commits/:hash/ai-review/trigger  - Trigger AI analysis
```

### Evaluation
```
GET    /api/workspace/projects/:id/evaluate                     - Get latest evaluation
GET    /api/workspace/commits/:hash1/compare/:hash2             - Compare two commits
GET    /api/workspace/projects/:id/trends                       - Get quality trends
```

---

## FRONTEND ARCHITECTURE

### Component Structure
```
/roadmap-dashboard/project-workspace/
  workspace-main.js          - Main container & tab routing
  files-tab.js               - File explorer & preview
  commits-tab.js             - Timeline & diff viewer
  ai-review-tab.js           - Intelligence dashboard
  evaluate-tab.js            - Metrics & charts
  workspace-styles.css       - Elite minimal theme
  
  /components/
    file-tree.js             - Recursive tree builder
    file-preview.js          - Syntax-highlighted viewer
    commit-timeline.js       - Vertical timeline UI
    diff-viewer.js           - Side-by-side diff
    rating-meter.js          - Animated circular gauge
    metric-card.js           - Intelligence cards
    trend-chart.js           - Line/area charts
    comparison-table.js      - Side-by-side metrics
```

### Tab Implementation

#### 1. FILES TAB
**Features:**
- Drag & drop file upload
- Multi-file selection
- Directory tree (collapsible)
- File preview with syntax highlighting
- File metadata (size, modified date)
- Search/filter files
- Download individual files

**UI Elements:**
- Left panel: Tree view (GitHub-style)
- Right panel: File content viewer
- Top bar: Upload button, search, view toggles
- Bottom bar: File stats

#### 2. COMMITS TAB
**Features:**
- Vertical timeline
- Commit metadata display
- Diff visualization
- Rollback capability
- Compare any two commits
- Filter by date/author

**UI Elements:**
- Commit cards with:
  - Hash (short)
  - Message
  - Timestamp
  - Files changed badge
  - +/- lines indicator
- Click to expand for diff
- "Compare" checkbox mode

#### 3. AI REVIEW TAB
**Features:**
- Overall rating (0-10) with animated meter
- Developer level badge
- 6-layer score breakdown
- Detailed findings sections
- Comparison with previous commit
- Download PDF report

**UI Sections:**
- Hero: Large rating meter + level badge
- Grid of 6 layer cards:
  1. Syntax & Lint
  2. Architecture
  3. Performance
  4. Security
  5. Maintainability
  6. Industry Benchmark
- Findings:
  - ✅ Positive aspects
  - ⚠️ Weaknesses
  - 💡 Recommendations
  - 🔒 Security issues
  - 🧹 Code smells
- Delta metrics (vs previous commit)

#### 4. EVALUATE TAB
**Features:**
- Quality trend graph
- Delta metrics visualization
- Health score indicator
- Improvement/regression highlights
- Historical comparison
- Export data

**UI Elements:**
- Top: Overall health score (large)
- Chart: Line graph (quality over time)
- Grid: Delta cards
  - Quality Δ
  - Performance Δ
  - Security Δ
  - Complexity Δ
  - Maintainability Δ
- Comparison table (current vs previous)
- Trend indicators (↗️ ↘️ →)

---

## AI REVIEW ENGINE - 6 LAYERS

### Layer 1: Syntax & Lint Analysis
- Static code analysis
- ESLint/Pylint equivalent
- Unused imports/variables
- Code formatting consistency
- Naming conventions

### Layer 2: Architecture Pattern Analysis
- Design pattern detection
- SOLID principle adherence
- MVC/MVVM structure check
- Separation of concerns
- Modularity score

### Layer 3: Performance & Scalability
- Big-O complexity estimation
- Database query optimization
- Memory leak potential
- Caching strategy analysis
- Load handling prediction

### Layer 4: Security Surface Analysis
- SQL injection risks
- XSS vulnerabilities
- Authentication holes
- Data exposure risks
- Dependency vulnerabilities

### Layer 5: Maintainability & Documentation
- Code readability score
- Documentation coverage
- Comment quality
- Function complexity (cyclomatic)
- Test coverage estimation

### Layer 6: Industry Benchmark Comparison
- Compare against:
  - Google Style Guide
  - Airbnb conventions
  - Microsoft patterns
  - OWASP standards
- Market standard scoring

---

## DATA FLOW

### File Upload Flow:
```
Frontend Upload 
  → Multer Middleware
    → FileManager.processFiles()
      → Store in /uploads/projects/{id}/staging/
        → Generate content hash
          → Check for duplicates
            → Create file records
              → Ready for commit
```

### Commit Creation Flow:
```
User triggers commit
  → CommitManager.createCommit()
    → Generate commit hash
      → Move staging files to /commits/{hash}/
        → Create snapshot
          → Update file records with commit_id
            → Create commit record
              → Trigger AI review (async)
                → Update project stats
```

### AI Review Flow:
```
Commit created
  → AIReviewEngine.analyze()
    → Layer 1: Syntax check
      → Layer 2: Architecture scan
        → Layer 3: Performance analysis
          → Layer 4: Security audit
            → Layer 5: Maintainability check
              → Layer 6: Benchmark comparison
                → Aggregate scores
                  → Compare with previous commit
                    → Save AI review record
                      → Generate evaluation
```

### Evaluation Flow:
```
AI Review complete
  → EvaluationEngine.compare()
    → Fetch previous commit review
      → Calculate deltas
        → Determine trend
          → Generate metrics
            → Save evaluation record
              → Push to frontend
```

---

## DESIGN SYSTEM

### Color Palette:
```css
--bg-primary: #0D0D0D
--bg-secondary: #1A1A1A
--bg-tertiary: #242424
--text-primary: #E8E8E8
--text-secondary: #A0A0A0
--accent-red: #E63946
--accent-green: #2ECC71
--accent-blue: #3498DB
--border: #333333
```

### Typography:
```css
--font-primary: 'Inter', -apple-system, sans-serif
--font-mono: 'Fira Code', monospace
```

### Spacing Scale:
```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
```

---

## SCALABILITY CONSIDERATIONS

### Storage:
- Implement S3/Blob storage for production
- Content-addressable storage (deduplicate by hash)
- Compress snapshots
- Implement garbage collection for orphaned files

### Performance:
- Index commit hashes
- Cache file trees
- Lazy load file content
- Paginate commit history
- Background job queue for AI reviews

### AI Costs:
- Rate limit AI review triggers
- Cache results
- Incremental analysis (only changed files)
- Tiered pricing (free quota → paid)

### Database:
- Archive old commits
- Partition by project_id
- Implement read replicas
- Use connection pooling

---

## FUTURE ENHANCEMENTS

- Real Git integration
- Branch management
- Pull request simulation
- Collaborative editing
- Real-time file sync
- VS Code extension
- Mobile app
- Team workspaces
- Code review workflows
- CI/CD pipeline integration
- Automated testing score
- Docker containerization analysis

---

## IMPLEMENTATION STATUS

✅ Database schema designed
✅ Models created
🔄 Backend services (in progress)
🔄 API endpoints (in progress)
⏳ Frontend components (pending)
⏳ UI styling (pending)
⏳ AI integration (pending)
⏳ Testing (pending)

---

This architecture is designed to scale to millions of projects while maintaining GitHub-level performance and adding AI superpowers. The system is modular, allowing each component to be upgraded independently.
