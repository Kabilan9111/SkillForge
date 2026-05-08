# SkillForge AI Engine — Setup Script
# Run: .\setup.ps1

$ErrorActionPreference = "Stop"
$AiEngineDir = $PSScriptRoot

Write-Host "`n=== SkillForge AI Engine Setup ===" -ForegroundColor Cyan

# 1. Python check
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "ERROR: Python not found. Install Python 3.11+ from python.org" -ForegroundColor Red
    exit 1
}

$pyVersion = & python --version 2>&1
Write-Host "Python: $pyVersion" -ForegroundColor Green

# 2. Create virtual environment
if (-not (Test-Path "$AiEngineDir\.venv")) {
    Write-Host "`nCreating virtual environment..." -ForegroundColor Yellow
    & python -m venv "$AiEngineDir\.venv"
}

$pip = "$AiEngineDir\.venv\Scripts\pip.exe"
$python = "$AiEngineDir\.venv\Scripts\python.exe"

# 3. Install dependencies
Write-Host "`nInstalling Python dependencies..." -ForegroundColor Yellow
& $pip install --upgrade pip --quiet
& $pip install -r "$AiEngineDir\requirements.txt"

# 4. Download spaCy model
Write-Host "`nDownloading spaCy en_core_web_sm model..." -ForegroundColor Yellow
& $python -m spacy download en_core_web_sm

# 5. Create required directories
$dirs = @(
    "$AiEngineDir\uploads",
    "$AiEngineDir\uploads\generated_resumes",
    "$AiEngineDir\data",
    "$AiEngineDir\data\kb",
    "$AiEngineDir\data\vectorstore"
)
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "Created: $dir" -ForegroundColor DarkGray
    }
}

# 6. Copy .env if missing
if (-not (Test-Path "$AiEngineDir\.env")) {
    Copy-Item "$AiEngineDir\.env.example" "$AiEngineDir\.env"
    Write-Host "`n.env created from .env.example" -ForegroundColor Yellow
    Write-Host "ACTION REQUIRED: Edit .env and add your API keys!" -ForegroundColor Red
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "Start server: .\.venv\Scripts\python.exe main.py" -ForegroundColor Cyan
Write-Host "API Docs:     http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host "Health Check: http://localhost:8001/health" -ForegroundColor Cyan
