# 🔧 Quick Fix Script - Run This First!
# Generates test JWT token and shows setup instructions

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔐 SkillForge Authentication Quick Fix" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Generate test token
Write-Host "📋 Step 1: Generating Test JWT Token...`n" -ForegroundColor Yellow

cd backend
$output = node generateTestToken.js 2>&1
Write-Host $output

# Extract the token for user #1
$tokenLine = $output | Select-String -Pattern "localStorage\.setItem\('authToken', '(.+)'\)" | Select-Object -First 1
if ($tokenLine) {
    $token = $tokenLine.Matches.Groups[1].Value
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "✅ TOKEN GENERATED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "📋 COPY THIS COMMAND AND PASTE IN BROWSER CONSOLE (F12):`n" -ForegroundColor Yellow
    Write-Host "localStorage.setItem('authToken', '$token');" -ForegroundColor White
    Write-Host "`n"
    
    # Save to clipboard if available
    try {
        "localStorage.setItem('authToken', '$token');" | Set-Clipboard
        Write-Host "✅ Command copied to clipboard!`n" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Could not copy to clipboard automatically`n" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ Failed to generate token. Check backend setup.`n" -ForegroundColor Red
}

cd ..

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📝 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1️⃣  Open your browser to: http://localhost:5500/roadmap-dashboard/index.html" -ForegroundColor White
Write-Host "2️⃣  Press F12 to open DevTools" -ForegroundColor White
Write-Host "3️⃣  Go to Console tab" -ForegroundColor White
Write-Host "4️⃣  Paste the command above (or paste from clipboard)" -ForegroundColor White
Write-Host "5️⃣  Press Enter" -ForegroundColor White
Write-Host "6️⃣  Refresh the page (F5)" -ForegroundColor White
Write-Host "7️⃣  Go to Skill Gap page" -ForegroundColor White
Write-Host "8️⃣  Upload a resume and click 'Analyze with AI'`n" -ForegroundColor White

Write-Host "✅ The 401 error should be fixed!`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🐛 DEBUGGING:" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Verify setup in browser console:" -ForegroundColor White
Write-Host "  AuthHelper.isAuthenticated()  // Should return: true" -ForegroundColor Gray
Write-Host "  AuthHelper.getUserInfo()      // Should show user data`n" -ForegroundColor Gray

Write-Host "Check Network tab (F12 → Network):" -ForegroundColor White
Write-Host "  Look for /analyze request" -ForegroundColor Gray
Write-Host "  Check Headers → Authorization: Bearer <token>`n" -ForegroundColor Gray

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📚 For detailed documentation, see:" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "  AUTHENTICATION_GUIDE.md      - Complete auth setup" -ForegroundColor White
Write-Host "  TESTING_AUTHENTICATION.md    - Step-by-step testing`n" -ForegroundColor White

Write-Host "🚀 Happy coding!`n" -ForegroundColor Green
