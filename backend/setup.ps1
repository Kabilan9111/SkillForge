# SkillForge Backend - Quick Setup Script

Write-Host "🎓 SkillForge Backend - Quick Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Check if we're in the backend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the backend directory." -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Step 2: Create .env file
Write-Host "⚙️ Step 2: Creating environment file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created from template" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Step 3: Initialize database
Write-Host "🗄️ Step 3: Initializing database..." -ForegroundColor Yellow
if (-not (Test-Path "database.sqlite")) {
    npm run init-db
    Write-Host "✅ Database initialized" -ForegroundColor Green
} else {
    Write-Host "⚠️ Database already exists. Skipping initialization." -ForegroundColor Yellow
    $response = Read-Host "Do you want to reset the database? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Remove-Item "database.sqlite"
        npm run init-db
        Write-Host "✅ Database reset and initialized" -ForegroundColor Green
    }
}
Write-Host ""

# Step 4: Seed data
Write-Host "🌱 Step 4: Seeding sample data..." -ForegroundColor Yellow
$response = Read-Host "Do you want to seed sample data? (Y/n)"
if ($response -ne 'n' -and $response -ne 'N') {
    npm run seed
    Write-Host "✅ Sample data seeded" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sample credentials:" -ForegroundColor Cyan
    Write-Host "  Email: student1@techvidya.edu" -ForegroundColor Gray
    Write-Host "  Password: password123" -ForegroundColor Gray
} else {
    Write-Host "⏭️ Skipping seed data" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Done
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the server, run:" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or for development with auto-reload:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server will run at:" -ForegroundColor White
Write-Host "  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test the API with:" -ForegroundColor White
Write-Host "  .\test-api.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentation:" -ForegroundColor White
Write-Host "  README.md - Quick start guide" -ForegroundColor Gray
Write-Host "  API_DOCUMENTATION.md - Complete API reference" -ForegroundColor Gray
Write-Host "  TESTING.md - Testing guide" -ForegroundColor Gray
Write-Host "  DEPLOYMENT.md - Production deployment" -ForegroundColor Gray
Write-Host "  FRONTEND_INTEGRATION.md - Frontend integration" -ForegroundColor Gray
Write-Host "  OVERVIEW.md - System overview" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Ready to launch!" -ForegroundColor Cyan
Write-Host ""
