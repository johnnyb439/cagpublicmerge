const https = require('https');
const http = require('http');

console.log('🚀 Testing Performance Optimizations...\n');

// Test URLs
const BASE_URL = 'http://localhost:3002';
const PROD_URL = 'https://caglive.vercel.app';

// Performance metrics to check
const performanceTests = {
  'Service Worker': async () => {
    console.log('✓ Service Worker: Check browser Application tab for registration');
    console.log('  - Should show active service worker');
    console.log('  - Cache storage should contain assets\n');
  },
  
  'Code Splitting': async () => {
    console.log('✓ Code Splitting: Check Network tab while navigating');
    console.log('  - Look for lazy-loaded chunks (e.g., MockInterview-[hash].js)');
    console.log('  - Components should load on-demand\n');
  },
  
  'Bundle Optimization': async () => {
    console.log('✓ Bundle Optimization: Check Network tab');
    console.log('  - JavaScript files should be minified');
    console.log('  - Look for optimized bundle sizes');
    console.log('  - Check for tree-shaking effectiveness\n');
  },
  
  'Image Optimization': async () => {
    console.log('✓ Image Optimization: Check Network tab');
    console.log('  - Images should load in WebP format');
    console.log('  - Lazy loading for below-fold images');
    console.log('  - Responsive image sizing\n');
  },
  
  'Caching Strategy': async () => {
    console.log('✓ Caching Strategy: Check Network tab');
    console.log('  - Static assets should have cache headers');
    console.log('  - Service worker should cache responses');
    console.log('  - Check localStorage for app data\n');
  }
};

// Run all tests
async function runPerformanceTests() {
  console.log(`Testing on: ${BASE_URL}\n`);
  console.log('====================================\n');
  
  for (const [test, fn] of Object.entries(performanceTests)) {
    await fn();
  }
  
  console.log('====================================\n');
  console.log('📊 Performance Testing Checklist:\n');
  console.log('1. Open DevTools → Network tab');
  console.log('2. Enable "Disable cache" for first load');
  console.log('3. Record performance while navigating');
  console.log('4. Check bundle sizes and load times');
  console.log('5. Verify lazy loading is working');
  console.log('6. Test offline functionality\n');
  
  console.log('🎯 Key Metrics to Monitor:');
  console.log('- First Contentful Paint (FCP) < 1.8s');
  console.log('- Largest Contentful Paint (LCP) < 2.5s');
  console.log('- Time to Interactive (TTI) < 3.8s');
  console.log('- Total bundle size < 500KB (gzipped)');
  console.log('- Code splitting effectiveness');
  
  console.log('\n💡 Test URLs:');
  console.log(`- Local: ${BASE_URL}`);
  console.log(`- Production: ${PROD_URL}`);
}

// Check if server is accessible
http.get(BASE_URL, (res) => {
  if (res.statusCode === 200) {
    runPerformanceTests();
  }
}).on('error', (err) => {
  console.error('❌ Server not accessible. Please ensure dev server is running on port 3002');
});