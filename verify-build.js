const fs = require('fs');
const path = require('path');

console.log('Verifying build files...');

const requiredFiles = [
  'dist/main/main.js',
  'dist/main/preload.js',
  'dist/renderer/index.html'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.error(`✗ ${file} missing`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('✓ All required build files exist');
  process.exit(0);
} else {
  console.error('✗ Some build files are missing');
  process.exit(1);
}