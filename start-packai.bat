@echo off
REM PackAI - Start all services (Backend + Frontend)
echo ========================================
echo  PackAI Hackathon Startup Script
echo ========================================

set NODEDIR=C:\Users\CHANDAN\Documents\node-v22.14.0-win-x64
set BACKENDDIR=C:\Users\CHANDAN\Documents\Hackathon-2026\packai\backend
set FRONTENDDIR=C:\Users\CHANDAN\Documents\Hackathon-2026\packai\frontend
set PATH=%NODEDIR%;%PATH%

echo [1/2] Starting PackAI Backend (port 5000)...
start "PackAI Backend" /MIN cmd /c "set PATH=%NODEDIR%;%%PATH%% && cd /d %BACKENDDIR% && node_modules\.bin\ts-node-dev --respawn --transpile-only src/server.ts"
timeout /t 3 /nobreak >nul

echo [2/2] Starting PackAI Frontend (port 3000)...
start "PackAI Frontend" /MIN cmd /c "set PATH=%NODEDIR%;%%PATH%% && cd /d %FRONTENDDIR% && node_modules\.bin\next dev -p 3000"

echo.
echo ========================================
echo  PackAI is running!
echo  Frontend:   http://localhost:3000
echo  Backend:    http://localhost:5000
echo  API Health: http://localhost:5000/health
echo ========================================
pause
