@echo off
echo ===================================================
echo Alphonsa Hypermarket - Starting Servers...
echo ===================================================

:: Start Backend
echo [1/2] Starting FastAPI Backend on Port 8080...
cd /d "d:\Hyper Market\alphonsa_hypermarket\backend"
start "Alphonsa Backend" cmd /k ".\venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8080"

:: Start Frontend
echo [2/2] Starting React Frontend on Port 5175...
cd /d "d:\Hyper Market\alphonsa_hypermarket\frontend"
start "Alphonsa Frontend" cmd /k "npm run preview -- --host 0.0.0.0 --port 5175"

echo.
echo Servers are running in separate windows!
echo DO NOT close the newly opened black windows if you want the website to stay online.
echo.
pause
