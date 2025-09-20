const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Cleaning Windows build artifacts...');

function forceRemoveDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory ${dirPath} does not exist, skipping`);
    return;
  }

  try {
    // First try normal removal
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✓ Removed ${dirPath}`);
  } catch (error) {
    console.log(`Normal removal failed, trying force removal: ${error.message}`);

    try {
      // Windows force removal
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'inherit' });
        console.log(`✓ Force removed ${dirPath}`);
      } else {
        execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
        console.log(`✓ Force removed ${dirPath}`);
      }
    } catch (forceError) {
      console.error(`✗ Failed to remove ${dirPath}: ${forceError.message}`);
      console.log('Please manually delete the directory and try again');
    }
  }
}

// Kill any running processes
try {
  if (process.platform === 'win32') {
    execSync('taskkill /f /im "Nextlog Companion.exe" 2>nul', { stdio: 'ignore' });
    execSync('taskkill /f /im "electron.exe" 2>nul', { stdio: 'ignore' });
  }
  console.log('✓ Killed running processes');
} catch (error) {
  // Ignore errors if processes aren't running
}

// Wait a moment for processes to fully close
setTimeout(() => {
  // Remove build directories
  forceRemoveDir('release');
  forceRemoveDir('dist');

  console.log('✓ Cleanup complete');
}, 1000);