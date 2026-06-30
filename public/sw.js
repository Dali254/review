// public/sw.js
//
// This service worker is what makes "notifications even when the app
// isn't open" possible. Once registered, the browser/OS keeps it running
// in the background (independent of any open tab) and wakes it whenever
// a push message arrives from our server, or when the user taps a
// notification. This file must live at the site root (not /icons/ or any
// subfolder) so its scope covers the whole app.

const CACHE_NAME = 'reviewke-v1';

// ── Install / activate ──
// Minimal lifecycle handling — this service worker's job is push
// notifications, not offline asset caching, so we skip building an
// offline cache and just take control immediately.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Push event ──
// Fired by the browser when our server sends a push message via the Push
// API, even if no ReviewKE tab is open and the browser itself may not be
// running (the OS wakes the browser's push service for this). The payload
// is whatever JSON our /api/push/send endpoint sent.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'ReviewKE', body: event.data ? event.data.text() : 'New review job available' };
  }

  const title = data.title || 'ReviewKE';
  const options = {
    body: data.body || 'A new review job is available — tap to earn.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    image: data.image || undefined,
    data: { url: data.url || '/businesses' },
    tag: data.tag || 'reviewke-job',
    renotify: true,
    vibrate: [100, 50, 100],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click ──
// Focuses an already-open ReviewKE tab if one exists, otherwise opens a
// new one at the URL the notification was targeting (e.g. a specific
// business review page).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/businesses';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ── Subscription expiry/rotation ──
// Browsers occasionally invalidate and rotate push subscriptions. When
// that happens this fires so we can silently re-subscribe and update our
// server record — without this, a user's notifications would just stop
// working with no visible error.
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription ? event.oldSubscription.options : { userVisibleOnly: true })
      .then((subscription) => {
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription, phone: null }),
        });
      })
      .catch(() => {})
  );
});
