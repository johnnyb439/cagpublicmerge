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

// Helper functions for IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CAG_DB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('pendingApplications')) {
        const store = db.createObjectStore('pendingApplications', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'key' });
      }
    };
  });
}

async function getPendingApplications() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['pendingApplications'], 'readonly');
    const store = transaction.objectStore('pendingApplications');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting pending applications:', error);
    return [];
  }
}

async function removePendingApplication(id) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['pendingApplications'], 'readwrite');
    const store = transaction.objectStore('pendingApplications');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error removing pending application:', error);
  }
}

async function addPendingApplication(application) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['pendingApplications'], 'readwrite');
    const store = transaction.objectStore('pendingApplications');
    
    const applicationWithTimestamp = {
      ...application,
      timestamp: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(applicationWithTimestamp);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error adding pending application:', error);
  }
}

// Store data for offline use
async function storeOfflineData(key, data) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ key, data, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error storing offline data:', error);
  }
}

// Retrieve offline data
async function getOfflineData(key) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineData'], 'readonly');
    const store = transaction.objectStore('offlineData');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting offline data:', error);
    return null;
  }
}