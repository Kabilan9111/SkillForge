#!/usr/bin/env pwsh
# ============================================================
#  SkillForge — Unified Startup Script
#  Starts both the Node.js backend and the Python AI engine.
# ============================================================
#  Usage:   .\start.ps1
#  Stop:    Ctrl+C in each window, or:   .\start.ps1 -Stop
# ============================================================

param(
    [switch]$Stop
)

Set-StrictMode -Off
$ErrorActionPreference = 'SilentlyContinue'

$ROOT        = $PSScriptRoot
$BACKEND_DIR = Join-Path $ROOT "backend"
$AI_DIR      = Join-Path $ROOT "ai-engine"
$VENV_PY     = Join-Path $AI_DIR ".venv\Scripts\python.exe"

# ── Stop mode ─────────────────────────────────────────────────────────────────
if ($Stop) {
    Write-Host "`n[SkillForge] Stopping services..." -ForegroundColor Yellow
    Get-Process -Name node   -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Name python -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -like '*uvicorn*' } |
        Stop-Process -Force
    Write-Host "[SkillForge] All services stopped.`n" -ForegroundColor Green
    exit 0
}

# ── Pre-flight checks ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "          SkillForge - Starting All Services         " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] node is not in PATH. Install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Python venv
if (-not (Test-Path $VENV_PY)) {
    Write-Host "[WARN] Python venv not found at $VENV_PY" -ForegroundColor Yellow
    Write-Host "       Running ai-engine setup..." -ForegroundColor Yellow
    Push-Location $AI_DIR
    python -m venv .venv
    .\.venv\Scripts\pip install -q fastapi "uvicorn[standard]" python-multipart pdfminer.six python-docx python-dotenv --only-binary=:all:
    Pop-Location
}

# Check ports are free
function Test-PortFree {
    param([int]$Port)
    $conn = netstat -ano 2>$null | Select-String ":$Port "
    return (-not $conn)
}

if (-not (Test-PortFree 3000)) {
    Write-Host "[WARN] Port 3000 already in use - killing existing Node process" -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Milliseconds 600
}
if (-not (Test-PortFree 8001)) {
    Write-Host "[WARN] Port 8001 already in use - AI engine may already be running" -ForegroundColor Yellow
}

# ── Start AI engine (Python FastAPI) ──────────────────────────────────────────
Write-Host "[1/2] Starting Python AI Engine (port 8001)..." -ForegroundColor Cyan
$aiProc = Start-Process powershell -ArgumentList @(
    "-NoProfile", "-Command",
    "cd '$AI_DIR'; & '$VENV_PY' -m uvicorn standalone:app --host 0.0.0.0 --port 8001"
) -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 2

# ── Start Node.js backend ─────────────────────────────────────────────────────
Write-Host "[2/2] Starting Node.js Backend (port 3000)..." -ForegroundColor Cyan
$nodeProc = Start-Process powershell -ArgumentList @(
    "-NoProfile", "-Command",
    "cd '$BACKEND_DIR'; node server.js"
) -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 3

# ── Health checks ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Checking services..." -ForegroundColor DarkGray

$nodeOK = $false
$aiOK   = $false

for ($i = 0; $i -lt 10; $i++) {
    try {
        $null = Invoke-RestMethod "http://localhost:3000/api/health" -TimeoutSec 2
        $nodeOK = $true
    } catch {}
    try {
        $null = Invoke-RestMethod "http://localhost:8001/health" -TimeoutSec 2
        $aiOK = $true
    } catch {}
    if ($nodeOK -and $aiOK) { break }
    Start-Sleep -Seconds 1
}

Write-Host ""
if ($nodeOK) {
    Write-Host "  [OK] Node.js backend  -> http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "  [!!] Node.js backend  -> not responding on port 3000" -ForegroundColor Red
}
if ($aiOK) {
    Write-Host "  [OK] Python AI engine -> http://localhost:8001" -ForegroundColor Green
} else {
    Write-Host "  [!!] Python AI engine -> not responding on port 8001" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "|  App   : http://localhost:3000                    |" -ForegroundColor Cyan
Write-Host "|  Login : http://localhost:3000/login              |" -ForegroundColor Cyan
Write-Host "|  API   : http://localhost:3000/api/health         |" -ForegroundColor Cyan
Write-Host "|  AI    : http://localhost:8001/docs               |" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------" -ForegroundColor DarkGray
Write-Host "|  Demo  : admin@skillforge.dev / SkillForge@2026   |" -ForegroundColor DarkGray
Write-Host "|  Stop  : .\start.ps1 -Stop                        |" -ForegroundColor DarkGray
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
