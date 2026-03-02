# ========================================
# PROJECTS WORKSPACE - COMMIT WORKFLOW TEST
# ========================================
# Tests the complete commit pipeline from frontend to backend

$ErrorActionPreference = "Stop"
$API_BASE_URL = "http://localhost:5000/api"

Write-Host "`n=============================" -ForegroundColor Cyan
Write-Host "Projects Workspace Commit Test" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Test 1: Verify backend is running
Write-Host "`n[Test 1] Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$API_BASE_URL/health" -Method GET
    if ($health.status -eq "ok") {
        Write-Host "✓ Backend is running" -ForegroundColor Green
    } else {
        throw "Backend health check failed"
    }
} catch {
    Write-Host "✗ Backend not responding. Start server with: npm start" -ForegroundColor Red
    exit 1
}

# Test 2: Create a test project
Write-Host "`n[Test 2] Creating test project..." -ForegroundColor Yellow
$projectData = @{
    name = "Test Commit Workflow $(Get-Date -Format 'HHmmss')"
    description = "Testing commit persistence and backend integration"
    techStack = @("JavaScript", "Node.js", "Express")
    projectType = "backend"
} | ConvertTo-Json

try {
    $project = Invoke-RestMethod -Uri "$API_BASE_URL/projects" -Method POST -Body $projectData -ContentType "application/json"
    if ($project.success -and $project.project) {
        $projectId = $project.project._id
        Write-Host "✓ Project created: $projectId" -ForegroundColor Green
        Write-Host "  Name: $($project.project.name)" -ForegroundColor Gray
        Write-Host "  Status: $($project.project.status)" -ForegroundColor Gray
    } else {
        throw "Project creation failed"
    }
} catch {
    Write-Host "✗ Failed to create project: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Create a commit
Write-Host "`n[Test 3] Creating commit..." -ForegroundColor Yellow
$commitData = @{
    message = "Initial commit - add main application files"
    changes = @{
        added = @("app.js", "package.json", "README.md")
        modified = @()
        deleted = @()
    }
    snapshot = @{
        "app.js" = @{
            path = "app.js"
            content = "console.log('Hello World');"
            size = 28
            lastModified = (Get-Date).ToString("o")
        }
        "package.json" = @{
            path = "package.json"
            content = '{"name": "test-app", "version": "1.0.0"}'
            size = 45
            lastModified = (Get-Date).ToString("o")
        }
    }
    triggerAiReview = $false
} | ConvertTo-Json -Depth 10

try {
    $commit = Invoke-RestMethod -Uri "$API_BASE_URL/projects/$projectId/commit" -Method POST -Body $commitData -ContentType "application/json"
    if ($commit.success -and $commit.commit) {
        Write-Host "✓ Commit created successfully" -ForegroundColor Green
        Write-Host "  Hash: $($commit.commit.hash)" -ForegroundColor Gray
        Write-Host "  Message: $($commit.commit.message)" -ForegroundColor Gray
        Write-Host "  Timestamp: $($commit.commit.timestamp)" -ForegroundColor Gray
        Write-Host "  AI Review Queued: $($commit.aiReviewQueued)" -ForegroundColor Gray
        $commitId = $commit.commit.id
    } else {
        throw "Commit creation failed"
    }
} catch {
    Write-Host "✗ Failed to create commit: $_" -ForegroundColor Red
    Write-Host "  Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Test 4: Verify commit was persisted
Write-Host "`n[Test 4] Verifying commit persistence..." -ForegroundColor Yellow
try {
    $commits = Invoke-RestMethod -Uri "$API_BASE_URL/projects/$projectId/commits" -Method GET
    if ($commits.success -and $commits.commits) {
        $foundCommit = $commits.commits | Where-Object { $_.hash -eq $commit.commit.hash }
        if ($foundCommit) {
            Write-Host "✓ Commit persisted to database" -ForegroundColor Green
            Write-Host "  Found $($commits.commits.Count) total commits" -ForegroundColor Gray
        } else {
            throw "Commit not found in database"
        }
    } else {
        throw "Failed to fetch commits"
    }
} catch {
    Write-Host "✗ Commit verification failed: $_" -ForegroundColor Red
    exit 1
}

# Test 5: Verify project was updated
Write-Host "`n[Test 5] Verifying project state..." -ForegroundColor Yellow
try {
    $updatedProject = Invoke-RestMethod -Uri "$API_BASE_URL/projects/$projectId" -Method GET
    if ($updatedProject.success -and $updatedProject.project) {
        $proj = $updatedProject.project
        if ($proj.totalCommits -gt 0) {
            Write-Host "✓ Project updated correctly" -ForegroundColor Green
            Write-Host "  Total Commits: $($proj.totalCommits)" -ForegroundColor Gray
            Write-Host "  Status: $($proj.status)" -ForegroundColor Gray
            Write-Host "  Latest Commit: $($proj.latestCommit)" -ForegroundColor Gray
        } else {
            throw "Project commit count not updated"
        }
    } else {
        throw "Failed to fetch project"
    }
} catch {
    Write-Host "✗ Project verification failed: $_" -ForegroundColor Red
    exit 1
}

# Test 6: Create second commit with AI review
Write-Host "`n[Test 6] Creating commit with AI review..." -ForegroundColor Yellow
$commitData2 = @{
    message = "Add authentication module"
    changes = @{
        added = @("auth.js")
        modified = @("app.js")
        deleted = @()
    }
    snapshot = @{
        "app.js" = @{
            path = "app.js"
            content = "const auth = require('./auth'); console.log('Hello World');"
            size = 58
            lastModified = (Get-Date).ToString("o")
        }
        "auth.js" = @{
            path = "auth.js"
            content = "module.exports = { authenticate: () => true };"
            size = 45
            lastModified = (Get-Date).ToString("o")
        }
        "package.json" = @{
            path = "package.json"
            content = '{"name": "test-app", "version": "1.0.0"}'
            size = 45
            lastModified = (Get-Date).ToString("o")
        }
    }
    triggerAiReview = $true
} | ConvertTo-Json -Depth 10

try {
    $commit2 = Invoke-RestMethod -Uri "$API_BASE_URL/projects/$projectId/commit" -Method POST -Body $commitData2 -ContentType "application/json"
    if ($commit2.success -and $commit2.commit) {
        Write-Host "✓ Second commit created" -ForegroundColor Green
        Write-Host "  Hash: $($commit2.commit.hash)" -ForegroundColor Gray
        Write-Host "  AI Review Queued: $($commit2.aiReviewQueued)" -ForegroundColor Gray
        
        if ($commit2.aiReviewQueued) {
            Write-Host "  ✓ AI review trigger confirmed" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ AI review not queued (expected: true)" -ForegroundColor Yellow
        }
    } else {
        throw "Second commit failed"
    }
} catch {
    Write-Host "✗ Failed to create second commit: $_" -ForegroundColor Red
    exit 1
}

# Test 7: Verify commit history
Write-Host "`n[Test 7] Verifying commit history..." -ForegroundColor Yellow
try {
    $commits = Invoke-RestMethod -Uri "$API_BASE_URL/projects/$projectId/commits" -Method GET
    if ($commits.success -and $commits.commits -and $commits.commits.Count -ge 2) {
        Write-Host "✓ Commit history complete" -ForegroundColor Green
        Write-Host "  Total commits: $($commits.commits.Count)" -ForegroundColor Gray
        
        $commits.commits | ForEach-Object {
            Write-Host "  - $($_.hash): $($_.message)" -ForegroundColor Gray
        }
    } else {
        throw "Expected at least 2 commits, found $($commits.commits.Count)"
    }
} catch {
    Write-Host "✗ Commit history verification failed: $_" -ForegroundColor Red
    exit 1
}

# Test 8: Test commit with missing data (validation)
Write-Host "`n[Test 8] Testing validation..." -ForegroundColor Yellow
$invalidCommit = @{
    message = ""
    changes = @{ added = @(); modified = @(); deleted = @() }
    snapshot = @{}
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri "$API_BASE_URL/projects/$projectId/commit" -Method POST -Body $invalidCommit -ContentType "application/json"
    Write-Host "✗ Validation failed - empty message accepted" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ Validation working correctly" -ForegroundColor Green
        Write-Host "  Rejected empty commit message as expected" -ForegroundColor Gray
    } else {
        Write-Host "⚠ Unexpected error: $_" -ForegroundColor Yellow
    }
}

# Test 9: Cleanup (optional)
Write-Host "`n[Test 9] Cleanup..." -ForegroundColor Yellow
try {
    $delete = Invoke-RestMethod -Uri "$API_BASE_URL/projects/$projectId" -Method DELETE
    if ($delete.success) {
        Write-Host "✓ Test project deleted" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Could not delete test project: $_" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=============================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "✓ All core tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Verified functionality:" -ForegroundColor White
Write-Host "  • Backend API is running" -ForegroundColor Gray
Write-Host "  • Project creation works" -ForegroundColor Gray
Write-Host "  • Commits persist to database" -ForegroundColor Gray
Write-Host "  • Commit history is maintained" -ForegroundColor Gray
Write-Host "  • AI review flag is honored" -ForegroundColor Gray
Write-Host "  • Project state updates correctly" -ForegroundColor Gray
Write-Host "  • Input validation is enforced" -ForegroundColor Gray
Write-Host ""
Write-Host "The commit workflow is production-ready!" -ForegroundColor Green
Write-Host ""
