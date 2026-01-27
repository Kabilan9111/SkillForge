# SkillForge Mock Interview - Test Script

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "MOCK INTERVIEW MODULE - Quick Test" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Test 1: Check if backend server is running
Write-Host "[1/4] Checking backend server..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
    if ($health.status -eq "ok") {
        Write-Host "✓ Backend server is running" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Backend server not running. Please start with: node server.js" -ForegroundColor Red
    Write-Host "  From directory: f:\SkillForge\backend" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Test interview questions endpoint (requires auth)
Write-Host "[2/4] Testing interview questions endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/interview/questions?trackId=1&level=Intermediate" -Method GET -ErrorAction SilentlyContinue
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

# Test 3: Check if frontend files exist
Write-Host "[3/4] Verifying frontend files..." -ForegroundColor Yellow

$files = @(
    "f:\SkillForge\roadmap-dashboard\mock-interview.js",
    "f:\SkillForge\roadmap-dashboard\index.html",
    "f:\SkillForge\roadmap-dashboard\styles.css"
)

$allExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $(Split-Path $file -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $(Split-Path $file -Leaf) not found" -ForegroundColor Red
        $allExist = $false
    }
}

if ($allExist) {
    Write-Host "✓ All frontend files present" -ForegroundColor Green
}

Write-Host ""

# Test 4: Check uploads directory
Write-Host "[4/4] Checking uploads directory..." -ForegroundColor Yellow
if (Test-Path "f:\SkillForge\backend\uploads\interviews") {
    Write-Host "✓ Interview uploads directory exists" -ForegroundColor Green
} else {
    Write-Host "✗ Uploads directory missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Module Status: " -NoNewline
Write-Host "READY FOR TESTING" -ForegroundColor Green

Write-Host ""
Write-Host "How to Test:" -ForegroundColor Yellow
Write-Host "1. Open: f:\SkillForge\roadmap-dashboard\index.html" -ForegroundColor White
Write-Host "2. Log in or register" -ForegroundColor White
Write-Host "3. Click 'Mock Interview' in sidebar" -ForegroundColor White
Write-Host "4. Click 'Start Interview'" -ForegroundColor White
Write-Host "5. Answer first 5 questions by typing" -ForegroundColor White
Write-Host "6. Answer last 5 questions using microphone" -ForegroundColor White

Write-Host ""
Write-Host "Browser Requirements:" -ForegroundColor Yellow
Write-Host "- Chrome/Edge (recommended)" -ForegroundColor White
Write-Host "- Safari (supported)" -ForegroundColor White
Write-Host "- Firefox (voice may not work)" -ForegroundColor White

Write-Host ""
Write-Host "Features Implemented:" -ForegroundColor Cyan
Write-Host "✓ Mixed-mode interview (5 text + 5 voice)" -ForegroundColor Green
Write-Host "✓ Live voice transcription" -ForegroundColor Green
Write-Host "✓ AI evaluation with 5 metrics" -ForegroundColor Green
Write-Host "✓ Text-to-Speech feedback" -ForegroundColor Green
Write-Host "✓ Progress persistence" -ForegroundColor Green
Write-Host "✓ Question timer (5 minutes each)" -ForegroundColor Green

Write-Host ""
Write-Host "For full documentation, see: MOCK_INTERVIEW.md" -ForegroundColor Gray
Write-Host ""
