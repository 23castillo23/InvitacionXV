// Service Worker — Álbum Jennifer Arlete XV
// Habilita la instalación de la PWA directo al Álbum, 
// pero también guarda la invitación para que funcione sin internet.

// IMPORTANTE: Cambiamos a v2 para forzar la actualización
const CACHE_NAME = 'album-xv-shell-v2'; 

// Lista de archivos que el celular guardará para funcionar sin internet
const SHELL_FILES = [
  './',
  './index.html',
  './css/style.css',
  './js/javascript.js',
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

  // Para los archivos de la app: red primero, caché como respaldo
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});