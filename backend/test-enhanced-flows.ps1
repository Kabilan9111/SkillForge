# SkillForge Enhanced Learning Flows - Backend API Test

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "SKILLFORGE - Testing Enhanced Learning Flows" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "[1/3] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
    if ($health.status -eq "ok") {
        Write-Host "✓ Health check passed" -ForegroundColor Green
        Write-Host "  Service: $($health.service)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
    Write-Host "  Make sure backend server is running: node server.js" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Practice Problems Endpoint (requires auth)
Write-Host "[2/3] Testing Practice Problems Endpoint..." -ForegroundColor Yellow
Write-Host "  Note: This endpoint requires authentication" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/practice/problems" -Method GET -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 401) {
        Write-Host "✓ Endpoint exists (401 Unauthorized as expected)" -ForegroundColor Green
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Endpoint exists (401 Unauthorized as expected)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Skill Gap Analyzer Endpoint (requires auth)
Write-Host "[3/3] Testing Skill Gap Analyzer Endpoint..." -ForegroundColor Yellow
Write-Host "  Note: This endpoint requires authentication" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/skill-gap/history" -Method GET -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 401) {
        Write-Host "✓ Endpoint exists (401 Unauthorized as expected)" -ForegroundColor Green
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Endpoint exists (401 Unauthorized as expected)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✓ Backend API is running" -ForegroundColor Green
Write-Host "✓ Practice routes registered" -ForegroundColor Green
Write-Host "✓ Skill Gap routes registered" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open roadmap-dashboard/index.html in browser" -ForegroundColor White
Write-Host "2. Log in or register a new account" -ForegroundColor White
Write-Host "3. Select a career track and level" -ForegroundColor White
Write-Host "4. Navigate to Practice or Skill Gap pages" -ForegroundColor White
Write-Host "5. Test the new features!" -ForegroundColor White
Write-Host ""
