const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Windows executable (no signing)...');

// Set all possible environment variables to disable signing
const env = {
  ...process.env,
  CSC_IDENTITY_AUTO_DISCOVERY: 'false',
  CSC_LINK: '',
  CSC_KEY_PASSWORD: '',
  ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES: 'true',
  SKIP_SIGN: 'true',
  DISABLE_CODE_SIGN: 'true',
  NO_SIGN: 'true'
};

// Clean the environment of any signing-related variables
delete env.CSC_LINK;
delete env.CSC_KEY_PASSWORD;
delete env.WIN_CSC_LINK;
delete env.WIN_CSC_KEY_PASSWORD;

try {
  // Clean previous builds
  console.log('1. Cleaning previous builds...');
  execSync('node clean-windows.js', { stdio: 'inherit' });

  // Wait for cleanup to complete
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Build the project
  console.log('2. Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Create a minimal electron-builder config for unsigned build
  const minimalConfig = {
    appId: 'com.nextlog.companion',
    productName: 'Nextlog Companion',
    directories: {
      output: 'release/1.0.0'
    },
    files: [
      'dist/**/*',
      'package.json'
    ],
    extraMetadata: {
      main: 'dist/main/main.js'
    },
    win: {
      target: 'dir'
    }
  };

  // Write temporary config
  fs.writeFileSync('electron-builder-temp.json', JSON.stringify(minimalConfig, null, 2));

  // Package with minimal config and no signing
  console.log('3. Packaging for Windows (no signing)...');
  execSync('npx electron-builder --config electron-builder-temp.json --win --publish=never', {
    stdio: 'inherit',
    env: env
  });

  // Clean up temp config
  fs.unlinkSync('electron-builder-temp.json');

  console.log('✓ Windows build completed successfully!');

  // List the output files
  try {
    const releaseDir = 'release/1.0.0';
    const files = fs.readdirSync(releaseDir);
    console.log('\nGenerated files:');
    files.forEach(file => {
      const fullPath = path.join(releaseDir, file);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        console.log(`- ${file}/ (directory)`);
      } else {
        console.log(`- ${file} (${Math.round(stats.size / 1024 / 1024)}MB)`);
      }
    });

    // Check for executable
    const winUnpacked = path.join(releaseDir, 'win-unpacked');
    if (fs.existsSync(winUnpacked)) {
      console.log('\n✓ Executable location: release/1.0.0/win-unpacked/Nextlog Companion.exe');
    }

  } catch (e) {
    console.log('Build completed but could not list files');
  }

} catch (error) {
  console.error('Build failed:', error.message);
  if (fs.existsSync('electron-builder-temp.json')) {
    fs.unlinkSync('electron-builder-temp.json');
  }
  process.exit(1);
}