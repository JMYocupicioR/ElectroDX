// ============================================================================
// ElectoDX Diplomado - Service Worker Custom Listeners (PWA Notifications)
// Handles notification clicks and background push events
// ============================================================================

// Notification click listener: focuses the PWA or opens the dashboard
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard?tab=assignments';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, navigate it to targetUrl and focus
      for (const client of windowClients) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Push notification listener (for future Web Push server messages)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'ElectoDX Diplomado';
    const options = {
      body: data.body || 'Tienes una nueva tarea o evaluación asignada por tu profesor.',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-72x72.png',
      tag: data.tag || 'electrodx-notification',
      data: data.data || { url: '/dashboard?tab=assignments' },
      vibrate: [200, 100, 200],
      requireInteraction: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('ElectoDX Diplomado', {
        body: text,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: { url: '/dashboard?tab=assignments' },
      })
    );
  }
});
