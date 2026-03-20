const CACHE_NAME = 'chat-malawi-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './assets/logo.png',
    './assets/image.png',
    './assets/image1.png',
    './assets/image3.png',
    './assets/image4.png',
    './assets/image5.png',
    './Chat Malawi.apk'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed:', error);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch Event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }

                // For APK files, always try network first
                if (event.request.url.includes('.apk')) {
                    return fetch(event.request)
                        .then((response) => {
                            // Check if valid response
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }

                            // Clone the response for caching
                            const responseToCache = response.clone();
                            
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    console.log('Service Worker: Caching new APK file');
                                    cache.put(event.request, responseToCache);
                                });

                            return response;
                        })
                        .catch(() => {
                            console.log('Service Worker: APK fetch failed, checking cache');
                            return caches.match(event.request);
                        });
                }

                // For other files, try network with cache fallback
                return fetch(event.request)
                    .then((response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response for caching
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                console.log('Service Worker: Caching new resource:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.log('Service Worker: Network failed, trying cache for:', event.request.url);
                        
                        // Try to serve from cache as fallback
                        return caches.match(event.request)
                            .then((cachedResponse) => {
                                if (cachedResponse) {
                                    return cachedResponse;
                                }
                                
                                // If it's an HTML request, serve the offline page
                                if (event.request.headers.get('accept').includes('text/html')) {
                                    return caches.match('./index.html');
                                }
                                
                                // Otherwise, return the error
                                throw error;
                            });
                    });
            })
    );
});

// Background Sync for Analytics
self.addEventListener('sync', (event) => {
    if (event.tag === 'analytics-sync') {
        console.log('Service Worker: Syncing analytics data');
        event.waitUntil(syncAnalytics());
    }
});

// Sync analytics data with backend
function syncAnalytics() {
    return new Promise((resolve, reject) => {
        // Get stored analytics data
        const analyticsData = localStorage.getItem('chat_malawi_analytics');
        
        if (analyticsData) {
            try {
                const events = JSON.parse(analyticsData);
                
                // Future: Send to your analytics backend
                // fetch('/api/analytics/sync', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ events: events })
                // })
                // .then(response => {
                //     if (response.ok) {
                //         localStorage.removeItem('chat_malawi_analytics');
                //         console.log('Service Worker: Analytics synced successfully');
                //         resolve();
                //     } else {
                //         reject(new Error('Analytics sync failed'));
                //     }
                // })
                // .catch(reject);
                
                // For now, just resolve
                console.log('Service Worker: Analytics sync completed (mock)');
                resolve();
            } catch (error) {
                console.error('Service Worker: Analytics sync error:', error);
                reject(error);
            }
        } else {
            console.log('Service Worker: No analytics data to sync');
            resolve();
        }
    });
}

// Push Notifications (Future Feature)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New updates available for Chat Malawi!',
        icon: './logo.png',
        badge: './logo.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: './logo.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: './logo.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Chat Malawi', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification click received');
    
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

// Periodic Background Sync (for checking app updates)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'app-update-check') {
        console.log('Service Worker: Checking for app updates');
        event.waitUntil(checkForAppUpdates());
    }
});

// Check for app updates
function checkForAppUpdates() {
    return fetch('./manifest.json')
        .then(response => response.json())
        .then(manifest => {
            console.log('Service Worker: App update check completed');
            // Future: Compare versions and notify user
            return manifest;
        })
        .catch(error => {
            console.error('Service Worker: App update check failed:', error);
        });
}

// Network status monitoring
self.addEventListener('online', () => {
    console.log('Service Worker: Client is online');
    // Trigger any pending sync operations
    self.registration.sync.register('analytics-sync');
});

self.addEventListener('offline', () => {
    console.log('Service Worker: Client is offline');
});

// Cache cleanup on storage quota exceeded
self.addEventListener('quotaexceeded', (event) => {
    console.log('Service Worker: Storage quota exceeded');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting cache to free space:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
});

console.log('Service Worker: Loaded successfully');
