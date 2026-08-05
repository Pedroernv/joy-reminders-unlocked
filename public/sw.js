// SmartSchoolPro Service Worker — offline cache + background notifications
const CACHE = 'ssp-v14';
const ASSETS = [
  '/app.html',
  '/manifest.json',
  '/__l5e/assets-v1/8bcbcfa0-40d3-4063-8f8f-92b18eafc1cf/icon.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin && url.pathname === '/app.html') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req).then((res) => {
        if (res && res.status === 200 && (req.url.startsWith(self.location.origin) || req.url.includes('fonts.googleapis') || req.url.includes('cdnjs'))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});

// Receive scheduling request from page
self.addEventListener('message', async (event) => {
  const data = event.data || {};
  if (data.type === 'SCHEDULE_NOTIFICATIONS') {
    const list = data.notifications || [];
    // Try Notification Triggers API (Chrome). If unsupported, just no-op (page-side fallback handles it).
    for (const n of list) {
      try {
        await self.registration.showNotification(n.title, {
          body: n.body,
          tag: n.tag,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          showTrigger: 'TimestampTrigger' in self ? new TimestampTrigger(n.timestamp) : undefined,
          data: { url: '/app.html' },
        });
      } catch (err) {
        // Trigger not supported — silently skip; page handles foreground alerts.
      }
    }
  } else if (data.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification('SmartSchoolPro', { body: 'Notificação de teste em background!', tag: 'test', data: { url: '/app.html' } });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/app.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      for (const c of clientsArr) { if (c.url.includes('/app.html')) return c.focus(); }
      return self.clients.openWindow(url);
    })
  );
});
