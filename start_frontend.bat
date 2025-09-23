@echo off
echo ========================================
echo    TruckMitraAI Frontend Startup
echo ========================================
echo.

REM Check if node_modules exists
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
    echo.
)

echo Starting frontend development server...
echo Frontend will be available at http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

cd frontend
npm run dev

pause
