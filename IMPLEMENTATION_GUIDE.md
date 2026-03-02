# 🛠️ SKILLFORGE PROJECTS WORKSPACE - IMPLEMENTATION GUIDE

**Production-Grade Refactoring Plan**  
**Estimated Timeline**: 4-6 weeks  
**Risk Level**: Medium (requires data migration)

---

## 📋 PHASE 1: FIX STATE MANAGEMENT (Week 1)

### **Day 1-2: Implement State Manager**

**Files to create/modify**:
1. `roadmap-dashboard/project-state-manager.js` ✅ (CREATED)
2. `roadmap-dashboard/projects-workspace.js` (REFACTOR)
3. `roadmap-dashboard/index.html` (ADD SCRIPT TAG)

**Implementation steps**:

```javascript
// 1. Add state manager script to HTML
<script src="project-state-manager.js"></script>

// 2. Initialize state manager in projects-workspace.js
const stateManager = new ProjectStateManager(
    'http://localhost:5000/api',
    () => localStorage.getItem('authToken')
);

// 3. Replace localStorage calls with state manager
// OLD (REMOVE):
function loadState() {
    state.projects = JSON.parse(localStorage.getItem('skillforge_projects') || '[]');
}

// NEW (USE):
async function loadProject(projectId) {
    await stateManager.loadProject(projectId);
    renderProjectDetail();
}

// 4. Listen to state manager events
stateManager.on('project:loaded', (project) => {
    renderProjectDetail();
    renderFileTree();
    renderCommits Timeline();
});

stateManager.on('commit:created', ({ commit, aiReviewQueued }) => {
    showNotification('Commit created successfully!', 'success');
    if (aiReviewQueued) {
        showNotification('AI review queued...', 'info');
    }
    renderCommitsTimeline();
});

stateManager.on('diff:updated', (diff) => {
    updateCommitButtonState(diff.total > 0);
    updateChangesCounter(diff.total);
});
```

### **Day 3-4: Fix UI Lifecycle**

**Problem**: Cached DOM references become stale after navigation.

**Solution**: Re-cache DOM on every mount.

```javascript
// OLD (BROKEN):
function init() {
    cacheDOMElements(); // Called once
    setupEventListeners();
}

// NEW (FIXED):
class ProjectsWorkspaceView {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.dom = null;
        this.unsubscribers = [];
    }
    
    mount() {
        console.log('[ProjectsView] Mounting...');
        
        // Re-cache DOM (fresh references)
        this.dom = this.cacheDOMElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Subscribe to state changes
        this.unsubscribers.push(
            this.stateManager.on('project:loaded', (p) => this.render())
        );
        
        // Render initial state
        this.render();
    }
    
    unmount() {
        console.log('[ProjectsView] Unmounting...');
        
        // Cleanup event listeners
        this.removeEventListeners();
        
        // Unsubscribe from state
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
        
        // Clear DOM references
        this.dom = null;
    }
    
    cacheDOMElements() {
        return {
            fileTree: document.getElementById('project-file-tree'),
            fileViewer: document.getElementById('project-file-viewer'),
            commitsTimeline: document.getElementById('commits-timeline'),
            // ... all other elements
        };
    }
    
    render() {
        if (!this.dom) {
            console.warn('[ProjectsView] DOM not mounted');
            return;
        }
        
        this.renderFileTree();
        this.renderCommitsTimeline();
        this.renderAIReview();
    }
}

// Global instance
window.projectsView = new ProjectsWorkspaceView(stateManager);

// Navigation handler
function showProjectsPage() {
    // Unmount old views
    if (window.codingArenaView) {
        window.codingArenaView.unmount();
    }
    
    // Mount projects view
    window.projectsView.mount();
}
```

### **Day 5: Integration & Testing**

**Test checklist**:
- [ ] Navigate Projects → Coding Arena → Projects (UI should restore)
- [ ] Refresh page while on project detail (should reload project)
- [ ] Upload files (should show in diff)
- [ ] Commit changes (should persist to backend)
- [ ] Tabs should never be blank

---

## 📋 PHASE 2: IMPLEMENT GIT-STYLE VERSION CONTROL (Week 2)

### **Day 1-2: Database Models**

**Create blob storage models**:

```javascript
// backend/src/models/Blob.js ✅ (ALREADY EXISTS)
// backend/src/models/Tree.js ✅ (ALREADY EXISTS)
// backend/src/models/Commit.js ✅ (NEEDS UPDATE)

// Update Commit model to include tree reference:
const CommitSchema = new mongoose.Schema({
    // ... existing fields
    tree: { type: ObjectId, ref: 'Tree' }, // ADD THIS
    changes: {
        added: [String],
        modified: [String],
        deleted: [String],
        renamed: [{ from: String, to: String }] // ADD THIS
    },
    insertions: Number, // ADD THIS
    deletions: Number   // ADD THIS
});
```

### **Day 3-4: Implement Commit Handler**

**Use the production-grade commit handler**:

```bash
# Replace existing projectsRoutes.js commit handler
# with commitRoutes.js implementation ✅ (CREATED)

# Register in routes/index.js:
const commitRoutes = require('./commitRoutes');
router.use('/commits', commitRoutes);
router.use('/projects/:id/commit', commitRoutes); // Delegate commits
```

### **Day 5-7: Data Migration**

**Migrate existing snapshot-based commits to tree/blob structure**:

```javascript
// backend/scripts/migrateCommits.js

const mongoose = require('mongoose');
const Commit = require('../src/models/Commit');
const Blob = require('../src/models/Blob');
const Tree = require('../src/models/Tree');

async function migrateCommits() {
    const commits = await Commit.find({ snapshot: { $exists: true } });
    
    console.log(`Migrating ${commits.length} commits...`);
    
    for (const commit of commits) {
        // Create blobs from snapshot
        const blobs = [];
        for (const [path, file] of Object.entries(commit.snapshot)) {
            const blob = await createBlob(file.content, commit.projectId);
            blobs.push({ path, blobId: blob._id });
        }
        
        // Create tree
        const tree = await Tree.create({
            projectId: commit.projectId,
            commitId: commit._id,
            entries: blobs.map(b => ({
                path: b.path,
                type: 'file',
                blobId: b.blobId
            }))
        });
        
        // Update commit
        commit.tree = tree._id;
        delete commit.snapshot; // Remove old snapshot
        await commit.save();
    }
    
    console.log('Migration complete!');
}

migrateCommits().catch(console.error);
```

---

## 📋 PHASE 3: ADD JOB QUEUE FOR AI REVIEWS (Week 3)

### **Day 1: Setup Redis & Bull**

```bash
# Install dependencies
npm install bull ioredis

# Install Redis (Windows)
# Download from: https://github.com/microsoftarchive/redis/releases
# Or use Docker:
docker run -d -p 6379:6379 redis:alpine

# Verify Redis
redis-cli ping  # Should return "PONG"
```

### **Day 2-3: Implement Worker Process**

**Create worker file**:

```javascript
// backend/src/workers/aiReviewWorker.js

const Queue = require('bull');
const OpenAI = require('openai');
const Project = require('../models/Project');
const Commit = require('../models/Commit');
const AIReview = require('../models/AIReview');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const aiReviewQueue = new Queue('ai-reviews', {
    redis: { port: 6379, host: '127.0.0.1' }
});

// Process jobs
aiReviewQueue.process(async (job) => {
    const { projectId, commitId, userId } = job.data;
    
    console.log(`[Worker] Processing AI review for commit ${commitId}`);
    
    // Create review record
    const review = new AIReview({
        projectId,
        commitId,
        userId,
        status: 'processing'
    });
    await review.save();
    
    try {
        // Load project and commit
        const project = await Project.findById(projectId);
        const commit = await Commit.findById(commitId).populate('tree');
        
        // Inflate tree to get file contents
        const files = await inflateTree(commit.tree);
        
        // Call OpenAI for code analysis
        const analysis = await analyzeCodeWithAI(files, project, commit);
        
        // Update review
        review.status = 'completed';
        review.overallScore = analysis.overallScore;
        review.sections = analysis.sections;
        review.verdict = analysis.verdict;
        review.aiModel = 'gpt-4';
        review.tokensUsed = analysis.tokensUsed;
        review.processingTime = Date.now() - job.timestamp;
        review.completedAt = new Date();
        
        await review.save();
        
        // Update project
        project.latestReview = review._id;
        project.latestAiScore = analysis.overallScore;
        await project.save();
        
        console.log(`[Worker] AI review completed: ${analysis.overallScore}/100`);
        
        return {
            reviewId: review._id,
            score: analysis.overallScore
        };
        
    } catch (error) {
        console.error('[Worker] AI review failed:', error);
        review.status = 'failed';
        review.errorMessage = error.message;
        await review.save();
        throw error;
    }
});

async function analyzeCodeWithAI(files, project, commit) {
    // Prepare prompt
    const prompt = buildAnalysisPrompt(files, project, commit);
    
    // Call OpenAI
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                role: 'system',
                content: 'You are a senior software architect conducting code reviews. Provide honest, critical feedback.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 4000
    });
    
    // Parse response
    const analysis = parseAIResponse(response.choices[0].message.content);
    
    return {
        ...analysis,
        tokensUsed: response.usage.total_tokens
    };
}

function buildAnalysisPrompt(files, project, commit) {
    const fileList = files.map(f => `${f.path} (${f.size} bytes)`).join('\n');
    
    return `
# Code Review Request

## Project: ${project.name}
${project.description}

## Tech Stack: ${project.techStack.join(', ')}

## Commit: ${commit.hash}
Message: ${commit.message}

## Files (${files.length} total):
${fileList}

## File Contents:
${files.map(f => `
### ${f.path}
\`\`\`
${f.content.substring(0, 2000)} ${f.content.length > 2000 ? '...(truncated)' : ''}
\`\`\`
`).join('\n')}

## Instructions:
Analyze this codebase and provide a detailed review covering:

1. **Code Health** (30% weight):
   - File organization
   - Code complexity
   - Dead code / TODOs
   - Console logs / debug statements

2. **Architecture** (25% weight):
   - Project structure
   - Documentation (README)
   - Dependencies management
   - Test coverage

3. **Security** (25% weight):
   - Hardcoded credentials
   - SQL injection risks
   - eval() usage
   - Environment variables

4. **Scalability** (20% weight):
   - N+1 query patterns
   - Blocking I/O
   - Caching strategy
   - Resource management

For each section, provide:
- Score (0-100)
- List of issues (critical/warning/info)
- Summary

Finally, provide:
- Overall score (weighted average)
- Career-readiness verdict: Production-Ready (85+) | Junior (70-84) | Internship (55-69) | Hobby (<55)
- Justification

Be brutally honest. Don't sugarcoat issues.
`;
}

// Start worker
console.log('[Worker] AI Review worker started');

module.exports = aiReviewQueue;
```

**Run worker**:

```bash
# backend/package.json
{
  "scripts": {
    "start": "node server.js",
    "worker": "node src/workers/aiReviewWorker.js",
    "dev": "concurrently \"npm run start\" \"npm run worker\""
  }
}

# Start both server and worker
npm run dev
```

### **Day 4-5: Frontend Integration**

**Poll for AI review status**:

```javascript
// In stateManager.on('ai:queued', (commitId) => {...})

async function pollAIReview(commitId) {
    const maxAttempts = 60; // 5 minutes (5s interval)
    let attempts = 0;
    
    const interval = setInterval(async () => {
        attempts++;
        
        try {
            const review = await stateManager.pollAIReviewStatus(commitId);
            
            if (review.status === 'completed') {
                clearInterval(interval);
                showNotification('AI review completed!', 'success');
                renderAIReview(review);
            } else if (review.status === 'failed') {
                clearInterval(interval);
                showNotification('AI review failed', 'error');
            }
            
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                showNotification('AI review timeout', 'warning');
            }
        } catch (error) {
            console.error('Poll error:', error);
        }
    }, 5000);
}
```

---

## 📋 PHASE 4: AUTHENTICATION & SECURITY (Week 4)

### **Option A: Remove Guest Mode**

```javascript
// backend/src/routes/projectsRoutes.js

// Change from optionalAuth to auth (require authentication)
router.post('/:id/commit', auth, async (req, res) => {
    // ...
});

// Frontend: redirect to login if not authenticated
if (!localStorage.getItem('authToken')) {
    window.location.href = '/login';
}
```

### **Option B: Use Anonymous Sessions**

```javascript
// backend/src/middleware/anonymousAuth.js

const crypto = require('crypto');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

router.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

function anonymousAuth(req, res, next) {
    if (req.session.userId) {
        req.userId = req.session.userId;
    } else {
        // Generate unique anonymous ID
        req.session.userId = `anon_${crypto.randomUUID()}`;
        req.userId = req.session.userId;
    }
    req.isAnonymous = !req.header('Authorization');
    next();
}
```

### **Authorization Rules**

```javascript
// Projects are private by default
const project = await Project.findOne({
    _id: projectId,
    userId: req.userId // Only owner can access
});

// Optional: Add public projects
const project = await Project.findOne({
    _id: projectId,
    $or: [
        { userId: req.userId },
        { visibility: 'public' }
    ]
});
```

---

## 🚀 DEPLOYMENT CHECKLIST

### **Environment Variables**

```bash
# backend/.env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/skillforge
REDIS_URL=redis://localhost:6379
SESSION_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-...
JWT_SECRET=your-jwt-secret

# Storage quotas
DEFAULT_STORAGE_QUOTA=104857600  # 100MB
MAX_FILE_SIZE=10485760            # 10MB
```

### **Database Indexes**

```javascript
// Ensure indexes exist for performance
db.projects.createIndex({ userId: 1, updatedAt: -1 });
db.commits.createIndex({ projectId: 1, timestamp: -1 });
db.commits.createIndex({ hash: 1 }, { unique: true });
db.blobs.createIndex({ hash: 1 }, { unique: true });
db.aireviews.createIndex({ projectId: 1, createdAt: -1 });
db.aireviews.createIndex({ status: 1, createdAt: 1 });
```

### **Monitoring**

```javascript
// Add Bull Board for queue monitoring
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const serverAdapter = new ExpressAdapter();
createBullBoard({
    queues: [new BullAdapter(aiReviewQueue)],
    serverAdapter
});

app.use('/admin/queues', serverAdapter.getRouter());
// Access at: http://localhost:5000/admin/queues
```

---

## 📊 SUCCESS METRICS

**Week 1 Targets**:
- [ ] Zero blank screens on navigation
- [ ] State persists across page refreshes
- [ ] File changes tracked accurately

**Week 2 Targets**:
- [ ] Commits use blob storage (10x space savings)
- [ ] Diff engine shows accurate changes
- [ ] node_modules ignored automatically

**Week 3 Targets**:
- [ ] AI reviews complete within 30 seconds
- [ ] Queue handles 100+ concurrent reviews
- [ ] No HTTP timeouts

**Week 4 Targets**:
- [ ] All projects require authentication
- [ ] Storage quotas enforced
- [ ] Audit logs for all operations

**Production Readiness**:
- [ ] Load test: 1000 commits/hour
- [ ] Stress test: 100 concurrent users
- [ ] Storage: Handle 10GB+ projects
- [ ] Uptime: 99.9% SLA

---

## 🎯 NEXT STEPS

1. **Implement Phase 1 immediately** (State Manager)
2. **Run migration scripts** (Snapshots → Blobs)
3. **Setup monitoring** (Bull Board, logs)
4. **Load testing** (Artillery, k6)
5. **Security audit** (OWASP Top 10)

**The refactored system will be production-ready for GitHub-scale usage.**
