// Service Worker for Cleared Advisory Group
const CACHE_NAME = 'cag-v2';
const STATIC_CACHE = 'cag-static-v2';
const DYNAMIC_CACHE = 'cag-dynamic-v2';
const API_CACHE = 'cag-api-v2';

const urlsToCache = [
  '/',
  '/dashboard',
  '/jobs',
  '/resources',
  '/about',
  '/contact',
  '/pricing',
  '/offline',
  '/manifest.json',
  '/images/cag-logo.png',
  '/images/hero-bg.jpg',
  '/favicon.ico',
];

// API endpoints to cache
const apiEndpointsToCache = [
  '/api/jobs',
  '/api/user/profile',
  '/api/search/history',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(urlsToCache);
      }),
      caches.open(API_CACHE).then((cache) => {
        console.log('Preparing API cache');
        return Promise.resolve();
      }),
      initializeIndexedDB()
    ]).then(() => {
      console.log('Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      cleanupExpiredData()
    ]).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests for caching
  if (event.request.method !== 'GET') {
    // Handle POST requests for offline support
    if (event.request.method === 'POST') {
      event.respondWith(handlePostRequest(event.request));
    }
    return;
  }

  // Skip chrome-extension and other external requests
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.origin !== location.origin) return;

  // Route different types of requests to appropriate strategies
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(handleStaticAssets(event.request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    event.respondWith(handleStaticAssets(event.request));
  } else {
    event.respondWith(handlePageRequest(event.request));
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses
      cache.put(request, response.clone());
      
      // Store in IndexedDB for complex data
      if (request.url.includes('/jobs')) {
        const data = await response.clone().json();
        await storeJobsData(data);
      }
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    // Try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try IndexedDB for jobs data
    if (request.url.includes('/jobs')) {
      const offlineData = await getJobsFromIndexedDB();
      if (offlineData) {
        return new Response(JSON.stringify(offlineData), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Return offline response
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'This content is not available offline' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Failed to load static asset:', request.url);
    
    // Return placeholder for images
    if (request.destination === 'image') {
      return caches.match('/images/placeholder.jpg') || 
             new Response('', { status: 404 });
    }
    
    throw error;
  }
}

// Handle page requests with stale-while-revalidate strategy
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  // Get cached version
  const cachedResponse = await cache.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in background
    fetchPromise;
    return cachedResponse;
  }
  
  try {
    // Wait for network if no cache
    const response = await fetchPromise;
    if (response) return response;
    
    // Fallback to offline page
    const offlinePage = await cache.match('/offline');
    if (offlinePage) return offlinePage;
    
    // Ultimate fallback
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>Offline - Cleared Advisory Group</title></head>
        <body>
          <h1>You're Offline</h1>
          <p>Please check your internet connection.</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return await cache.match('/offline') || new Response('Offline', { status: 503 });
  }
}

// Handle POST requests for offline support
async function handlePostRequest(request) {
  try {
    // Try to send the request
    return await fetch(request);
  } catch (error) {
    // Store for background sync
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text()
    };
    
    await storeOfflineAction(requestData);
    
    // Register background sync
    if ('serviceWorker' in self && 'sync' in self.ServiceWorkerRegistration.prototype) {
      await self.registration.sync.register('background-sync');
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Request saved for when you\'re back online' 
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineActions());
  } else if (event.tag === 'sync-applications') {
    event.waitUntil(syncApplications());
  }
});

async function syncOfflineActions() {
  console.log('Syncing offline actions...');
  const pendingActions = await getPendingOfflineActions();
  
  for (const action of pendingActions) {
    try {
      const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
      });
      
      if (response.ok) {
        await markActionAsSynced(action.id);
        console.log('Synced action:', action.id);
      }
    } catch (error) {
      console.error('Failed to sync action:', action.id, error);
    }
  }
}

async function syncApplications() {
  console.log('Syncing applications...');
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
      
      await removePendingApplication(application.id);
    } catch (error) {
      console.error('Failed to sync application:', error);
    }
  }
}

// Initialize IndexedDB
async function initializeIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CAGOfflineDB', 2);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('jobs')) {
        const jobsStore = db.createObjectStore('jobs', { keyPath: 'id' });
        jobsStore.createIndex('title', 'title', { unique: false });
        jobsStore.createIndex('company', 'company', { unique: false });
        jobsStore.createIndex('clearanceLevel', 'clearanceLevel', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('pendingApplications')) {
        db.createObjectStore('pendingApplications', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('offlineActions')) {
        db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('searchHistory')) {
        db.createObjectStore('searchHistory', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('userPreferences')) {
        db.createObjectStore('userPreferences', { keyPath: 'key' });
      }
    };
  });
}

// Helper functions for IndexedDB
function openDB() {
  return initializeIndexedDB();
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

// Store jobs data in IndexedDB
async function storeJobsData(jobsData) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['jobs'], 'readwrite');
    const store = transaction.objectStore('jobs');
    
    // Store each job with expiration
    const jobs = Array.isArray(jobsData) ? jobsData : jobsData.jobs || [];
    
    for (const job of jobs) {
      await new Promise((resolve, reject) => {
        const request = store.put({
          ...job,
          cachedAt: Date.now(),
          expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  } catch (error) {
    console.error('Error storing jobs data:', error);
  }
}

// Get jobs from IndexedDB
async function getJobsFromIndexedDB() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['jobs'], 'readonly');
    const store = transaction.objectStore('jobs');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const jobs = request.result.filter(job => job.expires > Date.now());
        resolve({ jobs, total: jobs.length, cached: true });
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting jobs from IndexedDB:', error);
    return null;
  }
}

// Store offline action
async function storeOfflineAction(actionData) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise((resolve, reject) => {
      const request = store.add({
        ...actionData,
        timestamp: Date.now(),
        synced: false
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error storing offline action:', error);
  }
}

// Get pending offline actions
async function getPendingOfflineActions() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const actions = request.result.filter(action => !action.synced);
        resolve(actions);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
}

// Mark action as synced
async function markActionAsSynced(id) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.synced = true;
          action.syncedAt = Date.now();
          const putRequest = store.put(action);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Error marking action as synced:', error);
  }
}

// Clean up expired data
async function cleanupExpiredData() {
  try {
    const db = await openDB();
    
    // Clean up expired jobs
    const jobsTransaction = db.transaction(['jobs'], 'readwrite');
    const jobsStore = jobsTransaction.objectStore('jobs');
    const jobsRequest = jobsStore.getAll();
    
    jobsRequest.onsuccess = () => {
      const now = Date.now();
      jobsRequest.result.forEach(job => {
        if (job.expires && job.expires < now) {
          jobsStore.delete(job.id);
        }
      });
    };
    
    // Clean up old search history (keep last 50)
    const historyTransaction = db.transaction(['searchHistory'], 'readwrite');
    const historyStore = historyTransaction.objectStore('searchHistory');
    const historyRequest = historyStore.getAll();
    
    historyRequest.onsuccess = () => {
      const searches = historyRequest.result
        .sort((a, b) => b.timestamp - a.timestamp);
      
      if (searches.length > 50) {
        const toDelete = searches.slice(50);
        toDelete.forEach(search => {
          historyStore.delete(search.id);
        });
      }
    };
    
    console.log('Cleaned up expired data');
  } catch (error) {
    console.error('Error cleaning up expired data:', error);
  }
}