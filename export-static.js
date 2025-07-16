const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating static HTML export...\n');

// Remove the dynamic route configuration for static export
const nextConfigPath = path.join(__dirname, 'next.config.js');
const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Disable dynamic routes for static export
  exportPathMap: async function (defaultPathMap) {
    return {
      '/': { page: '/' },
      '/about': { page: '/about' },
      '/services': { page: '/services' },
      '/jobs': { page: '/jobs' },
      '/mock-interview': { page: '/mock-interview' },
      '/resources': { page: '/resources' },
      '/contact': { page: '/contact' },
      '/login': { page: '/login' },
      '/register': { page: '/register' },
      '/dashboard': { page: '/dashboard' },
    }
  },
}

module.exports = nextConfig`;

// Write the temporary config
fs.writeFileSync(nextConfigPath, nextConfigContent);

try {
  // Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Build complete!');
  console.log('\n📁 Static files are in the "out" directory');
  console.log('📤 You can now:');
  console.log('   1. Zip the "out" folder and send it to your colleague');
  console.log('   2. Upload the "out" folder contents to any web server');
  console.log('   3. Open out/index.html directly in a browser\n');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}