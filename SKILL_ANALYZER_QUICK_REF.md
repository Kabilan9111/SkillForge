# Quick Reference: Evidence-Based Skill Analyzer

## 🚀 Quick Start

### Running Tests
```bash
cd backend
node test-skill-analyzer.js
```

### Testing API (requires running server)
```bash
cd backend
.\test-api-skill-analyzer.ps1
```

## 📖 Key Concepts

### Detection Types
- **Explicit** (🟢): Directly mentioned - "Skills: React, Python"
- **Implicit** (🟡): Demonstrated - "Built APIs using Node.js"
- **Inferred** (🔵): Derived - GitHub link → Git, Version Control

### Skill Categories
- **Strong**: Confidence ≥ 80% OR Evidence ≥ 2
- **Weak**: Confidence 50-80% AND Evidence = 1
- **Missing**: Not detected anywhere

### Confidence Scores
- **95-100%**: Explicit mention in skills section
- **85-95%**: Multiple evidence sources or strong inference
- **70-85%**: Implicit demonstration
- **50-70%**: Weak mention or uncertain context

## 🔧 Common Scenarios

### Scenario 1: GitHub Link
**Input**: `GitHub: https://github.com/user`  
**Detected**: Git (95%), GitHub (95%), Version Control (95%)  
**Type**: Inferred  
**Evidence**: "GitHub profile indicates Git knowledge"

### Scenario 2: Project Description
**Input**: `Built RESTful APIs using Node.js and Express`  
**Detected**: Node.js (95%), Express (95%), REST API (95%), JavaScript (95%), Backend (90%)  
**Type**: Explicit + Inferred  
**Evidence**: Multiple lines showing usage

### Scenario 3: Package Manager
**Input**: `Used pip to install Python dependencies`  
**Detected**: pip (95%), Python (98%), Package Management (98%)  
**Type**: Explicit + Inferred  
**Evidence**: pip command implies Python

### Scenario 4: Database Usage
**Input**: `Optimized PostgreSQL queries reducing latency by 40%`  
**Detected**: PostgreSQL (95%), SQL (95%), Database (95%), Backend (90%)  
**Type**: Explicit + Inferred  
**Evidence**: Technical description showing experience

## 🎯 Inference Rules (Top 10)

1. **GitHub** → Git, Version Control (95%)
2. **Django** → Python, Backend, Web Dev (95%)
3. **React** → JavaScript, Frontend, HTML, CSS (90%)
4. **pip install** → Python, pip, Package Mgmt (98%)
5. **Docker** → Containerization, DevOps, Linux (90%)
6. **PostgreSQL** → SQL, Database, Backend (95%)
7. **Express** → Node.js, JavaScript, Backend, REST (95%)
8. **Next.js** → React, JavaScript, Node.js (95%)
9. **TensorFlow** → Python, ML, Deep Learning (95%)
10. **Kubernetes** → Docker, Containerization, DevOps (95%)

## 📊 API Response Structure

```javascript
{
  success: true,
  analysis: {
    // Basic Info
    fileName: "resume.pdf",
    trackName: "Full-Stack Developer",
    level: "Intermediate",
    
    // Scores
    overallScore: 72,          // Job readiness %
    coverageScore: 65,         // Skill coverage %
    readinessLevel: "Nearly Ready",
    estimatedTimeToReady: 8,   // weeks
    
    // Skills
    strong: [{
      skill: "React.js",
      confidence: 0.95,
      evidenceCount: 3,
      evidence: [...]
    }],
    weak: [...],
    missing: [{
      skill: "Docker",
      reason: "Not detected..."
    }],
    
    // Meta
    allDetectedSkills: ["React", "Node.js", ...],
    totalDetected: 25,
    
    // Section Analysis
    sectionAnalysis: {
      hasExperience: true,
      hasProjects: true,
      hasSkills: true,
      hasGithub: true,
      githubLinks: [...]
    }
  }
}
```

## 🔍 Evidence Structure

```javascript
{
  type: "explicit",              // or "implicit", "inferred"
  source: "skills_section",      // or "experience", "projects", etc.
  line: "Frontend: React.js",    // actual resume text
  lineNumber: 15,                // line number in resume
  confidence: 100,               // 0-100
  reason: "Explicitly listed in skills section"
}
```

## 🛠️ Technology Coverage

**80+ technologies detected across:**
- Languages: Python, JavaScript, TypeScript, Java, C++, Go, Ruby, PHP, Swift, Kotlin, Rust
- Frontend: React, Angular, Vue.js, Next.js, Svelte
- Backend: Django, Flask, FastAPI, Express, Node.js, Spring, Laravel, Rails
- Databases: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Cassandra, DynamoDB
- Cloud: AWS, Azure, GCP, Heroku, Netlify, Vercel
- DevOps: Docker, Kubernetes, Jenkins, GitHub Actions, Terraform, Ansible
- Version Control: Git, GitHub, GitLab, Bitbucket, SVN
- Testing: Jest, Mocha, Pytest, JUnit, Selenium, Cypress
- Build Tools: Webpack, Babel, Vite, Rollup, Gradle, Maven
- Package Managers: npm, yarn, pip, conda
- APIs: REST, GraphQL, gRPC, WebSocket
- Data/ML: TensorFlow, PyTorch, Keras, Scikit-learn, Pandas, NumPy, Spark

## 💡 Tips for Best Results

### For Resume Writers
1. ✅ List skills explicitly in a "Skills" section
2. ✅ Include GitHub profile/repositories
3. ✅ Describe projects with technologies used
4. ✅ Mention specific tools and commands (git, pip, npm)
5. ✅ Quantify technical achievements
6. ✅ Use industry-standard terminology

### For Developers
1. Test with `test-skill-analyzer.js` before API testing
2. Check console logs for detection process
3. Review evidence arrays to understand detection
4. Use confidence scores to prioritize skill learning
5. Leverage inference rules for comprehensive analysis

## 🐛 Troubleshooting

### Issue: Low Detection Rate
**Solution**: Check if resume has:
- Clear section headers (Experience, Skills, Projects)
- Specific technology names (not just "programming")
- Technical descriptions (not just job titles)

### Issue: Wrong Categorization
**Solution**: 
- Review evidence to understand why skill was categorized
- Check if skill appears in multiple sections
- Verify inference rules are appropriate

### Issue: Missing Expected Skill
**Solution**:
- Check skill normalization (might be detected under different name)
- Review `allDetectedSkills` array for variations
- Verify skill is in required skills list for track/level

## 📞 Quick Help

**View all detected skills**:
```javascript
response.analysis.allDetectedSkills
```

**Check evidence for specific skill**:
```javascript
response.analysis.strong.find(s => s.skill === "React.js").evidence
```

**Get GitHub detection**:
```javascript
response.analysis.sectionAnalysis.githubLinks
```

**Calculate gap percentage**:
```javascript
100 - response.analysis.coverageScore
```

---

**Need more details?** See `SKILL_ANALYZER_DOCS.md` for comprehensive documentation.
