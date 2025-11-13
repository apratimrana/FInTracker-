@echo off
echo ========================================
echo   Personal Finance Manager
echo ========================================
echo.
echo Starting application...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7 or higher
    pause
    exit /b 1
)

REM Install dependencies if requirements.txt exists
if exist requirements.txt (
    echo Installing dependencies...
    pip install -r requirements.txt
    echo.
)

REM Run the application
echo Starting Flask server...
echo Application will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
python run.py

pause
