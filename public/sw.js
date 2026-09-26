// Nexora Angola PWA Service Worker (Resilient & Vite-Safe)
const CACHE_NAME = 'nexora-news-v3-prod';
const OFFLINE_URL = '/';

const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/app-cover.jpg',
  '/welcome-cover.jpg',
  '/promo-banner.jpg',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA pre-cache notice:', err);
      });
    })
  );
});

// Activate Event - purge all older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('PWA: Removing obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Safe routing
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. NEVER intercept Vite, development modules, TypeScript sources, or query-busted dev bundles
  if (
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@fs/') ||
    url.pathname.includes('/@id/') ||
    url.pathname.includes('/node_modules/') ||
    url.pathname.startsWith('/src/') ||
    url.searchParams.has('v') ||
    url.searchParams.has('t') ||
    url.searchParams.has('import')
  ) {
    return; // Pass through directly to network
  }

  // 2. API calls: Network-first with cache fallback for offline reading
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 3. HTML Navigation requests: Network-First (always fresh page)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 4. Static media / assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Push Event
self.addEventListener('push', (event) => {
  let data = {
    title: 'Nexora Angola',
    body: 'Nova notícia publicada!',
    icon: '/app-cover.jpg',
    badge: '/app-cover.jpg',
    clickUrl: '/'
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (err) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: data.icon || '/app-cover.jpg',
    badge: data.badge || '/app-cover.jpg',
    image: data.imageUrl || data.image,
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || data.id || `nexora-${Date.now()}`,
    renotify: false,
    requireInteraction: data.isBreaking ? true : false,
    data: {
      clickUrl: data.clickUrl || (data.newsSlug ? `/noticia/${data.newsSlug}` : '/'),
      dateOfArrival: Date.now(),
      primaryKey: data.id || '1'
    },
    actions: [
      { action: 'read', title: '📰 Ler Notícia' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const clickUrl = event.notification.data?.clickUrl || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(clickUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(clickUrl);
      }
    })
  );
});
