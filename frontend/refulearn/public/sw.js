// RefuLearn - Enhanced Service Worker for Offline Functionality
// Version 1.0 - Comprehensive offline support

const CACHE_NAME = 'refulearn-v1.0';
const DATA_CACHE_NAME = 'refulearn-data-v1.0';

// Files to cache for offline use
const FILES_TO_CACHE = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  // Core pages
  '/dashboard',
  '/login',
  '/register',
  '/courses',
  '/jobs',
  '/peer-learning',
  '/certificates',
  '/help',
  '/profile'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/courses/,
  /\/api\/jobs/,
  /\/api\/scholarships/,
  /\/api\/auth\/profile/,
  /\/api\/auth\/me/
];

// Install event - cache core files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching core files for offline use');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static resources
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cacheName = DATA_CACHE_NAME;
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName);
      cache.put(request.url, networkResponse.clone());
      console.log('💾 Cached API response:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('📡 Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('✅ Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline fallback for specific endpoints
    return createOfflineFallback(request);
  }
}

// Handle navigation requests with cache-first strategy
async function handleNavigationRequest(request) {
  try {
    // Try network first for HTML pages
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Network failed, serve cached version or fallback
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to cached index.html for SPA routing
    return caches.match('/');
  }
}

// Handle static resources with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('❌ Failed to fetch resource:', request.url);
    
    // Return fallback for images
    if (request.url.includes('.jpg') || request.url.includes('.png') || request.url.includes('.gif')) {
      return new Response(
        '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Create offline fallbacks for API requests
function createOfflineFallback(request) {
  const url = new URL(request.url);
  
  // Courses fallback
  if (url.pathname.includes('/api/courses')) {
    return new Response(JSON.stringify({
      success: true,
      data: {
        courses: [
          {
            _id: 'offline-course-1',
            title: 'Offline Learning Available',
            description: 'Course content cached for offline viewing',
            level: 'All Levels',
            duration: 'Variable',
            category: 'Offline Content'
          }
        ]
      },
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Jobs fallback
  if (url.pathname.includes('/api/jobs')) {
    return new Response(JSON.stringify({
      success: true,
      data: {
        jobs: [
          {
            _id: 'offline-job-1',
            title: 'Offline Mode Active',
            description: 'Connect to internet to view latest job opportunities',
            company: 'RefuLearn Platform',
            location: 'Available when online',
            salary_range: 'View online for details'
          }
        ]
      },
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Generic offline response
  return new Response(JSON.stringify({
    success: false,
    message: 'This feature requires internet connection',
    offline: true
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle background sync for when connection returns
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Sync any pending data when connection returns
    console.log('📡 Syncing data in background...');
    
    // Here you can add logic to sync offline actions
    // For example: send queued form submissions, sync user progress, etc.
    
  } catch (error) {
    console.log('❌ Background sync failed:', error);
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New content available',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('RefuLearn', options)
  );
});

console.log('🎉 RefuLearn Service Worker loaded successfully!'); 