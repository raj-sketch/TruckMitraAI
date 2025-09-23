@echo off
echo ========================================
echo    TruckMitraAI Backend Server Startup
echo ========================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please make sure you have created the .env file with proper configuration.
    echo.
    pause
    exit /b 1
)

REM Check if serviceAccountKey.json exists
if not exist "serviceAccountKey.json" (
    echo WARNING: serviceAccountKey.json not found!
    echo Please make sure you have placed your Firebase service account key file.
    echo.
)

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then install dependencies: pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting FastAPI server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

pause

