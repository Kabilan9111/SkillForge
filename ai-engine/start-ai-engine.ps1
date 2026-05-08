# ═══════════════════════════════════════════════════════════
# SkillForge AI Engine — Local Startup Script
# Installs minimal dependencies and starts the standalone engine
# Usage: .\start-ai-engine.ps1
# ═══════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   SkillForge AI Engine — Local Startup       ║" -ForegroundColor Cyan
Write-Host "║   Port 8001 | Zero external dependencies     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Check Python ────────────────────────────────────
Write-Host "► Checking Python..." -ForegroundColor Yellow
try {
    $pyVersion = python --version 2>&1
    Write-Host "  ✓ $pyVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python not found. Install Python 3.10+ from https://python.org" -ForegroundColor Red
    exit 1
}

# ── Step 2: Create venv if missing ─────────────────────────
if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "► Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    Write-Host "  ✓ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "► Virtual environment already exists" -ForegroundColor Green
}

$PythonExe = ".\.venv\Scripts\python.exe"
$PipExe    = ".\.venv\Scripts\pip.exe"

# ── Step 3: Install minimal requirements ────────────────────
Write-Host "► Installing dependencies..." -ForegroundColor Yellow
& $PipExe install -r requirements-local.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ pip install failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Dependencies installed" -ForegroundColor Green

# ── Step 4: Quick import smoke test ─────────────────────────
Write-Host "► Verifying imports..." -ForegroundColor Yellow
$testScript = @"
import fastapi, uvicorn, docx
from pdfminer.high_level import extract_text
print('All imports OK')
"@
$result = & $PythonExe -c $testScript 2>&1
if ($result -match "All imports OK") {
    Write-Host "  ✓ $result" -ForegroundColor Green
} else {
    Write-Host "  ✗ Import check failed: $result" -ForegroundColor Red
    exit 1
}

# ── Step 5: Start the engine ─────────────────────────────────
Write-Host ""
Write-Host "► Starting AI Engine on http://localhost:8001" -ForegroundColor Cyan
Write-Host "  API docs: http://localhost:8001/docs" -ForegroundColor DarkCyan
Write-Host "  Health:   http://localhost:8001/health" -ForegroundColor DarkCyan
Write-Host "  Press Ctrl+C to stop" -ForegroundColor DarkGray
Write-Host ""

& $PythonExe -m uvicorn standalone:app --host 0.0.0.0 --port 8001 --reload
