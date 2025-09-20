const { execSync } = require('child_process');
const fs = require('fs');

console.log('Building Windows executable (unsigned)...');

// Set environment variables to disable signing
process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
process.env.ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = 'true';
process.env.SKIP_SIGN = 'true';

try {
  // Clean first
  console.log('Cleaning previous builds...');
  execSync('node clean-windows.js', { stdio: 'inherit' });

  // Wait for cleanup
  setTimeout(() => {
    try {
      // Build the project
      console.log('Building project...');
      execSync('npm run build', { stdio: 'inherit' });

      // Package without signing
      console.log('Packaging for Windows (unsigned)...');
      execSync('npx electron-builder --win --publish=never', {
        stdio: 'inherit',
        env: {
          ...process.env,
          CSC_IDENTITY_AUTO_DISCOVERY: 'false',
          SKIP_SIGN: 'true'
        }
      });

      console.log('✓ Windows build completed successfully!');

      // List the output files
      try {
        const releaseDir = 'release/1.0.0';
        const files = fs.readdirSync(releaseDir);
        console.log('\nGenerated files:');
        files.forEach(file => {
          const stats = fs.statSync(`${releaseDir}/${file}`);
          console.log(`- ${file} (${Math.round(stats.size / 1024 / 1024)}MB)`);
        });
      } catch (e) {
        console.log('Build completed but could not list files');
      }

    } catch (error) {
      console.error('Build failed:', error.message);
      process.exit(1);
    }
  }, 2000);

} catch (error) {
  console.error('Cleanup failed:', error.message);
  process.exit(1);
}