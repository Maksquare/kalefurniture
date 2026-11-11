// Self-unregistering Service Worker
// Automatically cleans up leftover service workers registered on localhost:3000 or production domains.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => self.clients.matchAll())
      .then((clients) => {
        // Optionally refresh clients to ensure clean state
      })
  );
});
