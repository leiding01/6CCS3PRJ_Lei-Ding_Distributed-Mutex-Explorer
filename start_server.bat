@echo off
cd /d %~dp0
echo Starting a local server on http://localhost:5500
echo Press Ctrl+C in this window to stop.
where py >nul 2>&1
if %errorlevel%==0 (
  py -m http.server 5500
) else (
  python -m http.server 5500
)
