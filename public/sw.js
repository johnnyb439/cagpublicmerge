// Service Worker for Cleared Advisory Group
const CACHE_NAME = 'cag-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/jobs',
  '/resources',
  '/about',
  '/contact',
  '/offline',
  '/manifest.json',
  '/images/cag-logo.png',
  '/images/hero-bg.jpg',
  '/_next/static/css/app.css',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache dynamic content for Next.js
          if (event.request.url.includes('/_next/') || 
              event.request.url.includes('/api/')) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        }).catch(() => {
          // Offline fallback
          if (event.request.destination === 'document') {
            return caches.match('/offline');
          }
          
          // Return placeholder for images
          if (event.request.destination === 'image') {
            return caches.match('/images/placeholder.jpg');
          }
        });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-applications') {
    event.waitUntil(syncApplications());
  }
});

async function syncApplications() {
  // Get pending applications from IndexedDB
  const pendingApplications = await getPendingApplications();
  
  for (const application of pendingApplications) {
    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(application),
      });
      
      // Remove from pending queue
      await removePendingApplication(application.id);
    } catch (error) {
      console.error('Failed to sync application:', error);
    }
  }
}

// Helper functions for IndexedDB (implementation needed)
async function getPendingApplications() {
  // TODO: Implement IndexedDB retrieval
  return [];
}

async function removePendingApplication(id) {
  // TODO: Implement IndexedDB removal
}