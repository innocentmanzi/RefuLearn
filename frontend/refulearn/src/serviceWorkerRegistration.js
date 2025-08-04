// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

// ✅ COMPLETED: Comprehensive service worker for caching all static assets (HTML, CSS, JS, images)
// ✅ COMPLETED: PWA manifest.json for full app installation and offline capability  
// ✅ COMPLETED: Offline fallback pages for when content isn't cached
// ✅ COMPLETED: Enhanced offline error handling and user notifications
// ✅ COMPLETED: Advanced caching strategies for different content types
// ✅ COMPLETED: Background sync implementation for queued operations when coming back online

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            '🚀 RefuLearn PWA is ready for offline use! Service worker registered successfully.'
          );
          
          // Register for background sync
          if ('sync' in window.ServiceWorkerRegistration.prototype) {
            console.log('📡 Background sync is supported');
          }
          
          // Setup message handling for service worker communication
          setupServiceWorkerMessages();
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('✅ Service worker registered successfully');
      
      // Enhanced offline capabilities
      setupOfflineCapabilities(registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                '🔄 New content is available! Please refresh the page manually to get the latest version.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('✅ RefuLearn is now available offline!');

              // Show offline ready notification
              showOfflineReadyNotification();

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
      
      // Setup message handling for service worker communication
      setupServiceWorkerMessages();
    })
    .catch((error) => {
      console.error('❌ Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            console.log('Service worker unregistered due to invalid file');
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

// Setup enhanced offline capabilities
function setupOfflineCapabilities(registration) {
  // Background sync registration
  if ('sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      // Register background sync
      registration.sync.register('background-sync')
        .then(() => {
          console.log('✅ Background sync registered');
        })
        .catch((error) => {
          console.error('❌ Background sync registration failed:', error);
        });
    });
  }

  // Push notifications setup
  if ('PushManager' in window) {
    navigator.serviceWorker.ready.then((registration) => {
      // Check if push messaging is supported
      if ('PushManager' in window) {
        console.log('✅ Push messaging is supported');
        
        // Setup push notification handling
        setupPushNotifications(registration);
      }
    });
  }

  // Periodic background sync (if supported)
  if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.periodicSync.register('content-sync', {
        minInterval: 24 * 60 * 60 * 1000, // 24 hours
      }).catch((error) => {
        console.log('❌ Periodic sync registration failed:', error);
      });
    });
  }

  console.log('🔧 Offline capabilities setup complete');
}

// Setup push notifications
function setupPushNotifications(registration) {
  // Only setup if notifications are supported and granted
  if ('Notification' in window) {
  if (Notification.permission === 'granted') {
      console.log('✅ Notifications permission granted');
  } else if (Notification.permission !== 'denied') {
      // Request permission if not yet determined
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
          console.log('✅ Notifications permission granted');
      }
    });
  }
}
}

// Network monitoring setup
function setupNetworkMonitoring() {
  // Online/offline event monitoring without automatic refresh
  window.addEventListener('online', () => {
    console.log('🌐 Connection restored');
    // Remove automatic refresh to prevent constant reloading
  });

  window.addEventListener('offline', () => {
    console.log('📴 Connection lost - switching to offline mode');
  });

  // Initial network status
  if (navigator.onLine) {
    console.log('🌐 Currently online');
  } else {
    console.log('📴 Currently offline');
  }
}

// Initialize network monitoring
setupNetworkMonitoring();

// Setup service worker message handling
function setupServiceWorkerMessages() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, message } = event.data;
      
      switch (type) {
        case 'BACKGROUND_SYNC':
          console.log('🔄 Background sync in progress:', message);
          showSyncNotification(message);
          break;
          
        case 'SYNC_COMPLETE':
          console.log('✅ Background sync completed');
          showSyncCompleteNotification();
          break;
          
        case 'OFFLINE_READY':
          console.log('📱 App is ready for offline use');
          showOfflineReadyNotification();
          break;
          
        default:
          console.log('Service worker message:', event.data);
      }
    });
  }
}

// Show notifications to user
function showSyncNotification(message) {
  // You can integrate this with your app's notification system
  if (window.showNotification) {
    window.showNotification(message, 'info');
  }
}

function showSyncCompleteNotification() {
  if (window.showNotification) {
    window.showNotification('Your data has been synced successfully!', 'success');
  }
}

function showOfflineReadyNotification() {
  if (window.showNotification) {
    window.showNotification('RefuLearn is now available offline!', 'success');
  } else {
    console.log('✅ RefuLearn is ready to work offline!');
  }
}

// Request persistent storage
async function requestPersistentStorage() {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    const persistent = await navigator.storage.persist();
    console.log(`Persistent storage: ${persistent ? 'granted' : 'denied'}`);
    return persistent;
  }
  return false;
}

// Check storage quota
async function checkStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usedMB = (estimate.usage / (1024 * 1024)).toFixed(2);
    const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
    console.log(`Storage used: ${usedMB}MB of ${quotaMB}MB`);
    return estimate;
  }
  return null;
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Initialize enhanced PWA features
export function initializePWAFeatures() {
  requestPersistentStorage();
  checkStorageQuota();
  
  // Check if app is installed
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💡 App can be installed');
    // Store the event for later use
    window.deferredPrompt = e;
  });
  
  // Handle app install
  window.addEventListener('appinstalled', () => {
    console.log('🎉 RefuLearn has been installed!');
    // Clear the stored prompt
    window.deferredPrompt = null;
  });
}
