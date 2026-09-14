@echo off
setlocal
cd /d "%~dp0"

set "ISCC="
if exist "%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" set "ISCC=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
if exist "%ProgramFiles%\Inno Setup 6\ISCC.exe" set "ISCC=%ProgramFiles%\Inno Setup 6\ISCC.exe"
if exist "%ProgramFiles(x86)%\Inno Setup 7\ISCC.exe" set "ISCC=%ProgramFiles(x86)%\Inno Setup 7\ISCC.exe"
if exist "%ProgramFiles%\Inno Setup 7\ISCC.exe" set "ISCC=%ProgramFiles%\Inno Setup 7\ISCC.exe"

if not defined ISCC (
  echo Inno Setup was not found on this PC.
  echo.
  echo Please install Inno Setup, then run this file again.
  echo The installer script is: NomadicERP_Setup.iss
  echo.
  pause
  exit /b 1
)

echo Building NomadicERP_Setup.exe...
"%ISCC%" "%~dp0NomadicERP_Setup.iss"
if errorlevel 1 (
  echo.
  echo Build failed. Please check the messages above.
  pause
  exit /b 1
)

echo.
echo Done. NomadicERP_Setup.exe has been created in this folder.
pause
