const CACHE_NAME = 'controlador-financiero-v1.0.0';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './code.js',
    '/sw.js',
    './manifest.json',
    './img/portada.png',
    './img/portada.png',
    './img/portada.png',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Instalar el Service Worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Cache abierto');
            return cache.addAll(urlsToCache);
        })
    );
});

// Activar el Service Worker
self.addEventListener('activate', function(event) {
    event.waitUntil(
    caches.keys().then(function(cacheNames) {
        return Promise.all(
        cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache viejo:', cacheName);
            return caches.delete(cacheName);
            }
        })
        );
    })
    );
});

// Interceptar requests
self.addEventListener('fetch', function(event) {
    event.respondWith(
    caches.match(event.request)
        .then(function(response) {
        // Devuelve la respuesta del cache o haz fetch
        if (response) {
            return response;
        }
        return fetch(event.request);
        }
    )
    );
});