# PowerShell script to build Windows executable without signing
Write-Host "Building Windows executable (no signing)..." -ForegroundColor Green

# Set environment variables to disable signing
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = "true"
$env:SKIP_SIGN = "true"
$env:DISABLE_CODE_SIGN = "true"
$env:NO_SIGN = "true"

# Remove any existing signing environment variables
Remove-Item env:CSC_LINK -ErrorAction SilentlyContinue
Remove-Item env:CSC_KEY_PASSWORD -ErrorAction SilentlyContinue
Remove-Item env:WIN_CSC_LINK -ErrorAction SilentlyContinue
Remove-Item env:WIN_CSC_KEY_PASSWORD -ErrorAction SilentlyContinue

try {
    # Clean previous builds
    Write-Host "1. Cleaning previous builds..." -ForegroundColor Yellow
    if (Test-Path "release") {
        Remove-Item -Path "release" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "dist") {
        Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
    }

    # Kill any running processes
    Get-Process "Nextlog Companion" -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process "electron" -ErrorAction SilentlyContinue | Stop-Process -Force

    # Wait for cleanup
    Start-Sleep -Seconds 2

    # Build the project
    Write-Host "2. Building project..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }

    # Package for Windows with no signing
    Write-Host "3. Packaging for Windows..." -ForegroundColor Yellow
    npx electron-builder --win --publish=never --config.win.sign=false
    if ($LASTEXITCODE -ne 0) { throw "Packaging failed" }

    Write-Host "✓ Windows build completed successfully!" -ForegroundColor Green

    # List output files
    if (Test-Path "release\1.0.0") {
        Write-Host "`nGenerated files:" -ForegroundColor Cyan
        Get-ChildItem "release\1.0.0" | ForEach-Object {
            if ($_.PSIsContainer) {
                Write-Host "- $($_.Name)/ (directory)" -ForegroundColor White
            } else {
                $sizeMB = [math]::Round($_.Length / 1MB, 1)
                Write-Host "- $($_.Name) ($sizeMB MB)" -ForegroundColor White
            }
        }

        if (Test-Path "release\1.0.0\win-unpacked\Nextlog Companion.exe") {
            Write-Host "`n✓ Executable ready: release\1.0.0\win-unpacked\Nextlog Companion.exe" -ForegroundColor Green
        }
    }

} catch {
    Write-Host "✗ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}