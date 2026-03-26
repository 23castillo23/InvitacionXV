// Service Worker — Álbum Jennifer Arlete XV
// Solo habilita la instalación como PWA.
// Las fotos siempre se cargan en línea desde Cloudinary/Firebase.
// NO se guarda ninguna foto en el dispositivo.

const CACHE_NAME = 'album-xv-shell-v1';

// Solo cacheamos el "esqueleto" de la app (HTML + fuentes del sistema)
// Las imágenes/fotos NUNCA se cachean — siempre se ven en línea
const SHELL_FILES = [
  './album.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Fotos de Cloudinary o Firebase → SIEMPRE desde la red, nunca del caché
  if (
    url.includes('cloudinary.com') ||
    url.includes('firebasestorage') ||
    url.includes('firestore.googleapis.com') ||
    url.includes('googleapis.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para el shell (album.html): red primero, caché como respaldo
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
