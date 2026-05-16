@echo off
chcp 65001 >nul 2>&1
title Yaxiya Business Analytics - Launcher
setlocal enabledelayedexpansion

echo.
echo  ================================================
echo    Yaxiya Business Analytics - Quick Start
echo  ================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found. Please install Node.js 18+
    echo  Download: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo  [INFO] Node.js version:
node -v
echo.

set "BACKEND_PORT=3003"
set "FRONTEND_PORT=3002"

netstat -ano | findstr ":%BACKEND_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo  [WARN] Port %BACKEND_PORT% is in use. Backend may already be running.
    choice /c YN /m "  Start backend anyway? (Y/N)"
    if errorlevel 2 goto skip_backend
)

netstat -ano | findstr ":%FRONTEND_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo  [WARN] Port %FRONTEND_PORT% is in use. Frontend may already be running.
    choice /c YN /m "  Start frontend anyway? (Y/N)"
    if errorlevel 2 goto skip_frontend
)

if not exist "server\node_modules" (
    echo  [INSTALL] Installing backend dependencies...
    cd /d "%~dp0server"
    call npm install
    if %errorlevel% neq 0 (
        echo  [ERROR] Backend dependency install failed
        cd /d "%~dp0"
        pause
        exit /b 1
    )
    cd /d "%~dp0"
    echo  [DONE] Backend dependencies installed
    echo.
)

if not exist "node_modules" (
    echo  [INSTALL] Installing frontend dependencies...
    cd /d "%~dp0"
    call npm install
    if %errorlevel% neq 0 (
        echo  [ERROR] Frontend dependency install failed
        pause
        exit /b 1
    )
    echo  [DONE] Frontend dependencies installed
    echo.
)

:skip_backend
echo  [START] Starting backend server (port %BACKEND_PORT%)...
start "Yaxiya Backend (Port %BACKEND_PORT%)" cmd /c "cd /d %~dp0server && node index.js"
echo  [OK] Backend server started
echo.

:skip_frontend
echo  [START] Starting frontend server (port %FRONTEND_PORT%)...
start "Yaxiya Frontend (Port %FRONTEND_PORT%)" cmd /c "cd /d %~dp0 && npx vite --host"
echo  [OK] Frontend server started
echo.

timeout /t 3 >nul

echo  ================================================
echo   System started! Access in browser:
echo.
echo   Frontend:  http://localhost:%FRONTEND_PORT%
echo   Backend:   http://localhost:%BACKEND_PORT%/api
echo   Health:    http://localhost:%BACKEND_PORT%/api/health
echo.
echo   Closing this window will NOT stop services.
echo   To stop, close the corresponding terminal windows.
echo  ================================================
echo.
pause
