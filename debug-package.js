const fs = require('fs');
const path = require('path');

console.log('=== Package Debug Information ===');

// Check if this is running in development or production
console.log('Process info:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- process.defaultApp:', process.defaultApp);
console.log('- process.execPath:', process.execPath);
console.log('- __dirname:', __dirname);
console.log('- process.cwd():', process.cwd());

// Check if we're in an Electron environment
if (typeof require !== 'undefined') {
  try {
    const { app } = require('electron');
    if (app) {
      console.log('- app.getAppPath():', app.getAppPath());
      console.log('- app.isPackaged:', app.isPackaged);
    }
  } catch (e) {
    console.log('- Not in Electron environment');
  }
}

// Check for dist files
console.log('\nChecking dist files:');
const distFiles = [
  'dist/main/main.js',
  'dist/main/preload.js',
  'dist/main/utils/dev.js',
  'dist/renderer/index.html'
];

distFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`- ${file}: ${exists ? '✓' : '✗'}`);
  if (exists) {
    const stats = fs.statSync(file);
    console.log(`  Size: ${stats.size} bytes`);
  }
});

console.log('\n=== End Debug Info ===');