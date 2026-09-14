@echo off
setlocal
cd /d "%~dp0"
set "APP_URL=http://127.0.0.1:4855"
set "EDGE_EXE="
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -UseBasicParsing '%APP_URL%' -TimeoutSec 2; if ($r.StatusCode -ge 200) { exit 0 } } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 (
  if defined EDGE_EXE (
    start "" "%EDGE_EXE%" "%APP_URL%"
  ) else (
    start "" "%APP_URL%"
  )
  exit /b
)

if exist "%~dp0runtime\node.exe" (
  "%~dp0runtime\node.exe" "%~dp0server.js" --open --managed-lifetime
  exit /b
)

where node >nul 2>nul
if errorlevel 1 (
  if defined EDGE_EXE (
    start "" "%EDGE_EXE%" "%~dp0index.html"
  ) else (
    start "" "%~dp0index.html"
  )
  exit /b
)

node "%~dp0server.js" --open --managed-lifetime
