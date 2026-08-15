@echo off
setlocal
cd /d "%~dp0"

REM KPSS 2026 Ortaogretim - yerel web sunucusu
start "KPSS Server" /min cmd /c "python -m http.server 8000"

timeout /t 2 /nobreak >nul
start "" "http://localhost:8000"

exit
