@echo off
echo Building Windows executable (no signing)...

REM Set environment variables to disable signing
set CSC_IDENTITY_AUTO_DISCOVERY=false
set ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true
set SKIP_SIGN=true
set DISABLE_CODE_SIGN=true
set NO_SIGN=true

REM Clear any existing signing variables
set CSC_LINK=
set CSC_KEY_PASSWORD=
set WIN_CSC_LINK=
set WIN_CSC_KEY_PASSWORD=

echo 1. Cleaning previous builds...
if exist "release" rmdir /s /q "release" 2>nul
if exist "dist" rmdir /s /q "dist" 2>nul

REM Kill any running processes
taskkill /f /im "Nextlog Companion.exe" 2>nul
taskkill /f /im "electron.exe" 2>nul

echo Waiting for cleanup to complete...
timeout /t 3 /nobreak >nul

echo 2. Building project...
call npm run build
if errorlevel 1 (
    echo Build failed!
    exit /b 1
)

echo 3. Packaging for Windows...
call npx electron-builder --config electron-builder-nosign.json --win --publish=never
if errorlevel 1 (
    echo Packaging failed!
    exit /b 1
)

echo.
echo ✓ Windows build completed successfully!

if exist "release\1.0.0\win-unpacked\Nextlog Companion.exe" (
    echo ✓ Executable ready: release\1.0.0\win-unpacked\Nextlog Companion.exe
) else (
    echo Checking for output files...
    if exist "release\1.0.0" dir "release\1.0.0"
)

pause