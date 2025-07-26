# Local Testing Guide for Cleared Advisory Group Website

## 🚀 Website is running at: http://localhost:3002

## 1. Security Features Testing

### Authentication Flow
1. **Register Page** - http://localhost:3002/register
   - Test job seeker registration
   - Test employer registration
   - Check form validation (email format, password strength)
   - Verify secure storage initialization

2. **Login Page** - http://localhost:3002/login
   - Test login with dummy credentials
   - Toggle between job seeker/employer
   - Check "Forgot Password" link
   - Verify role-based redirect (job seekers → /dashboard, employers → /employer/dashboard)

3. **Protected Routes**
   - Try accessing /dashboard without login (should redirect)
   - Try accessing /admin without proper role

### API Security
1. Open browser DevTools → Network tab
2. Make multiple rapid requests
3. Check for rate limiting headers in responses

## 2. Performance Optimizations Testing

### Code Splitting
1. Open DevTools → Network tab
2. Navigate to different pages
3. Look for lazy-loaded chunks (e.g., `MockInterview-[hash].js`)

### Service Worker
1. Open DevTools → Application tab
2. Check "Service Workers" section
3. Verify worker is registered and active
4. Check "Cache Storage" for cached assets

### Bundle Optimization
1. In Network tab, check JavaScript file sizes
2. Look for optimized/minified bundles
3. Check load times for initial page load

## 3. Enhanced Features Testing

### Jobs Page - http://localhost:3002/jobs
1. **Advanced Filters**
   - Test clearance level filter
   - Test location filter
   - Test salary range slider
   - Test skills multi-select
   - Verify filters persist in URL

2. **Search Functionality**
   - Test keyword search
   - Test combination of search + filters
   - Check search result highlighting

3. **Job Alerts**
   - Click "Set Alert" on any job
   - Configure alert preferences
   - Test saving alerts (stored in localStorage)

4. **Job Comparison**
   - Select 2-3 jobs for comparison
   - Click "Compare Selected"
   - Review comparison table

### Dashboard - http://localhost:3002/dashboard
1. **Application Tracking**
   - View mock application data
   - Check status badges
   - Test filtering by status

2. **Saved Searches**
   - Create and save a search
   - Verify it appears in dashboard
   - Test loading saved search

## 4. Analytics & Monitoring Testing

### Google Analytics
1. Open DevTools → Network tab
2. Filter by "google" or "gtag"
3. Navigate pages and check for event firing
4. Look for custom events (page_view, cta_click, etc.)

### Hotjar
1. Check Network tab for Hotjar script loading
2. Verify recording initialization

### Sentry Error Monitoring
1. Open browser console
2. Trigger a test error: `window.testSentryError()`
3. Check Network tab for Sentry error submission

### A/B Testing
1. **Hero CTA Test** - Refresh homepage multiple times
   - Check for different CTA button text/colors
   - Verify variant tracking in localStorage

2. **Admin Dashboard** - http://localhost:3002/admin/ab-tests
   - View experiment dashboard
   - Check mock conversion data

## 5. Quick Wins Testing

### Bug Reporter
1. Look for bug icon in bottom-right corner
2. Click to open reporter
3. Test submitting a bug report
4. Check console for GitHub API call (will fail with dummy token)

### Live Chat
1. Check for chat widget in bottom-right
2. Test opening/closing chat
3. Send a test message

### Keyboard Shortcuts
1. Press `Ctrl+K` (or `Cmd+K` on Mac) for command palette
2. Press `?` to show all shortcuts
3. Test navigation shortcuts

## 6. Comprehensive Testing Checklist

### Homepage - http://localhost:3002
- [ ] Hero section loads with animations
- [ ] A/B test variant displays
- [ ] Job categories show correctly
- [ ] Mock interview section visible
- [ ] Resources section loads
- [ ] Footer links work

### Mock Interview - http://localhost:3002/mock-interview
- [ ] Interview tool loads
- [ ] Can start practice session
- [ ] Questions display properly
- [ ] Timer functionality works

### Resources - http://localhost:3002/resources
- [ ] Resource cards display
- [ ] Download buttons work
- [ ] Categories filter correctly

### Mobile Responsiveness
- [ ] Open DevTools → Toggle device toolbar
- [ ] Test on mobile viewport (375px)
- [ ] Check navigation menu collapse
- [ ] Verify touch interactions

## 7. Browser Console Checks

Run these commands in browser console:

```javascript
// Check if analytics is loaded
console.log('GA loaded:', typeof gtag !== 'undefined')

// Check A/B test variant
localStorage.getItem('ab_hero-cta-test')

// Check if service worker is registered
navigator.serviceWorker.getRegistrations().then(regs => console.log('Service Workers:', regs))

// Check cached user data
localStorage.getItem('cag_user')
```

## Notes:
- All integrations use dummy API keys for local testing
- Real functionality activates with proper credentials
- Check browser console for any errors
- Performance metrics visible in DevTools → Performance tab