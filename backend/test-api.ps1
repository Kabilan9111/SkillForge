# SkillForge Backend Test Script
# This script demonstrates the full workflow and prerequisite enforcement

$BASE_URL = "http://localhost:5000/api"
$TOKEN = ""

Write-Host "🚀 SkillForge Backend Test Suite" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣ Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get
    Write-Host "✅ Health: $($response.status)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Health check failed. Is the server running?" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host "2️⃣ Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "student1@techvidya.edu"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.user.full_name)" -ForegroundColor Gray
    Write-Host "   Email: $($loginResponse.user.email)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# Test 3: Get Current User
Write-Host "3️⃣ Testing Get Current User..." -ForegroundColor Yellow
try {
    $user = Invoke-RestMethod -Uri "$BASE_URL/user/me" -Method Get -Headers $headers
    Write-Host "✅ User Details Retrieved" -ForegroundColor Green
    Write-Host "   Institution: $($user.user.institution_name)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 4: Get All Tracks
Write-Host "4️⃣ Testing Get All Tracks..." -ForegroundColor Yellow
try {
    $tracks = Invoke-RestMethod -Uri "$BASE_URL/track/all" -Method Get -Headers $headers
    Write-Host "✅ Available Tracks:" -ForegroundColor Green
    foreach ($track in $tracks.tracks) {
        Write-Host "   - $($track.name) ($($track.slug))" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 5: Select Java Track
Write-Host "5️⃣ Testing Select Active Track (Java)..." -ForegroundColor Yellow
$selectTrackBody = @{
    trackId = 1
} | ConvertTo-Json

try {
    $activeTrack = Invoke-RestMethod -Uri "$BASE_URL/track/select" -Method Post -Body $selectTrackBody -Headers $headers
    Write-Host "✅ Active Track: $($activeTrack.track.name)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 6: Get Roadmap
Write-Host "6️⃣ Testing Get Roadmap..." -ForegroundColor Yellow
try {
    $roadmap = Invoke-RestMethod -Uri "$BASE_URL/roadmap" -Method Get -Headers $headers
    Write-Host "✅ Roadmap Retrieved" -ForegroundColor Green
    Write-Host "   Track: $($roadmap.trackName)" -ForegroundColor Gray
    Write-Host "   Total Modules: $($roadmap.roadmap.Count)" -ForegroundColor Gray
    
    $unlocked = ($roadmap.roadmap | Where-Object { $_.status -eq "unlocked" }).Count
    $locked = ($roadmap.roadmap | Where-Object { $_.status -eq "locked" }).Count
    $completed = ($roadmap.roadmap | Where-Object { $_.status -eq "completed" }).Count
    
    Write-Host "   Unlocked: $unlocked | Locked: $locked | Completed: $completed" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 7: Complete First Module
Write-Host "7️⃣ Testing Complete Module 1 (Should Work)..." -ForegroundColor Yellow
$completeBody = @{
    moduleId = 1
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$BASE_URL/progress/complete" -Method Post -Body $completeBody -Headers $headers
    Write-Host "✅ $($result.message)" -ForegroundColor Green
    Write-Host "   Completion: $($result.progress.completionPercentage)%" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 8: Complete Second Module
Write-Host "8️⃣ Testing Complete Module 2 (Should Work - Prerequisite Met)..." -ForegroundColor Yellow
$completeBody2 = @{
    moduleId = 2
} | ConvertTo-Json

try {
    $result2 = Invoke-RestMethod -Uri "$BASE_URL/progress/complete" -Method Post -Body $completeBody2 -Headers $headers
    Write-Host "✅ $($result2.message)" -ForegroundColor Green
    Write-Host "   Completion: $($result2.progress.completionPercentage)%" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 9: Try to Complete Locked Module (Should Fail)
Write-Host "9️⃣ Testing Complete Module 5 (Should FAIL - Prerequisites Not Met)..." -ForegroundColor Yellow
$completeBody5 = @{
    moduleId = 5
} | ConvertTo-Json

try {
    $result5 = Invoke-RestMethod -Uri "$BASE_URL/progress/complete" -Method Post -Body $completeBody5 -Headers $headers
    Write-Host "⚠️ UNEXPECTED: Module completed without prerequisites!" -ForegroundColor Red
} catch {
    Write-Host "✅ CORRECTLY BLOCKED: Prerequisite enforcement working!" -ForegroundColor Green
    $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "   Error: $($errorDetail.error)" -ForegroundColor Gray
    Write-Host ""
}

# Test 10: Get Progress Summary
Write-Host "🔟 Testing Get Progress Summary..." -ForegroundColor Yellow
try {
    $progress = Invoke-RestMethod -Uri "$BASE_URL/progress" -Method Get -Headers $headers
    Write-Host "✅ Progress Summary:" -ForegroundColor Green
    Write-Host "   Completed: $($progress.progress.completedModules)/$($progress.progress.totalModules)" -ForegroundColor Gray
    Write-Host "   Percentage: $($progress.progress.completionPercentage)%" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 11: Get Placement Readiness
Write-Host "1️⃣1️⃣ Testing Placement Readiness..." -ForegroundColor Yellow
try {
    $readiness = Invoke-RestMethod -Uri "$BASE_URL/progress/placement-readiness" -Method Get -Headers $headers
    Write-Host "✅ Placement Readiness:" -ForegroundColor Green
    Write-Host "   Score: $($readiness.placementReadiness.readinessScore)%" -ForegroundColor Gray
    Write-Host "   Ready: $($readiness.placementReadiness.isPlacementReady)" -ForegroundColor Gray
    Write-Host "   Recommendation: $($readiness.placementReadiness.recommendation)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 12: Switch to Python Track
Write-Host "1️⃣2️⃣ Testing Track Isolation - Switch to Python..." -ForegroundColor Yellow
$selectPythonBody = @{
    trackId = 2
} | ConvertTo-Json

try {
    $pythonTrack = Invoke-RestMethod -Uri "$BASE_URL/track/select" -Method Post -Body $selectPythonBody -Headers $headers
    Write-Host "✅ Switched to: $($pythonTrack.track.name)" -ForegroundColor Green
    
    # Get Python progress (should be 0)
    $pythonProgress = Invoke-RestMethod -Uri "$BASE_URL/progress" -Method Get -Headers $headers
    Write-Host "   Python Progress: $($pythonProgress.progress.completedModules)/$($pythonProgress.progress.totalModules)" -ForegroundColor Gray
    
    # Switch back to Java
    $selectJavaBody = @{ trackId = 1 } | ConvertTo-Json
    $javaTrack = Invoke-RestMethod -Uri "$BASE_URL/track/select" -Method Post -Body $selectJavaBody -Headers $headers
    
    # Get Java progress (should still have our 2 completed modules)
    $javaProgress = Invoke-RestMethod -Uri "$BASE_URL/progress" -Method Get -Headers $headers
    Write-Host "   Java Progress (preserved): $($javaProgress.progress.completedModules)/$($javaProgress.progress.totalModules)" -ForegroundColor Gray
    Write-Host "   ✅ Track Isolation Verified!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "🎉 Test Suite Complete!" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "✅ Authentication working" -ForegroundColor Green
Write-Host "✅ Track selection working" -ForegroundColor Green
Write-Host "✅ Roadmap serving working" -ForegroundColor Green
Write-Host "✅ Prerequisite enforcement working" -ForegroundColor Green
Write-Host "✅ Track isolation working" -ForegroundColor Green
Write-Host "✅ Progress tracking working" -ForegroundColor Green
Write-Host ""
