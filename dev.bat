@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
cd /d "%~dp0"
echo ======================================================
echo Starting Electricity Consumption Dashboard...
echo ======================================================
npm run dev
pause
