<<<<<<< HEAD
@echo off
echo Starting Health Tracker Website...
echo.

REM Try to run the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-website.ps1"

if errorlevel 1 (
    echo.
    echo Failed to start website. Please check the error messages above.
    pause
    exit /b 1
)

pause

=======
@echo off
echo Starting Health Tracker Website...
echo.

REM Try to run the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-website.ps1"

if errorlevel 1 (
    echo.
    echo Failed to start website. Please check the error messages above.
    pause
    exit /b 1
)

pause

>>>>>>> 9b13ef4d0212ee86c68046927a4dbe8e6a7fa339
