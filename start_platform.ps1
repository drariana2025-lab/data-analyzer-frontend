# Data Platform Startup Script (Frontend + Backend)

Write-Host "--- DATA PLATFORM STARTUP ---" -ForegroundColor Cyan

# 0. Clean Python Cache to avoid "null bytes" or stale code errors
Write-Host "[0/2] Cleaning Python cache..." -ForegroundColor Gray
Get-ChildItem -Path "backend" -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# Use the current directory as PYTHONPATH so 'backend' is recognized
$env:PYTHONPATH = ".;$env:PYTHONPATH"

# 1. Start Backend in a HIDDEN window
Write-Host "[1/2] Launching Backend in background..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

# 2. Start Frontend in a HIDDEN window
Write-Host "[2/2] Launching Frontend in background..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "npm run dev"

Write-Host ""
Write-Host "✅ ВСЕ ПРОЦЕССЫ ЗАПУЩЕНЫ В ФОНОВОМ РЕЖИМЕ" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Откройте сайт: http://localhost:8080/" -ForegroundColor Cyan
Write-Host "🛑 Чтобы выключить: запустите скрипт stop_platform.ps1 из этой папки" -ForegroundColor Red
Write-Host ""

