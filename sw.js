/**
 * SERVICE WORKER - StudyQuality System
 * Service Worker para funcionamiento offline y cache
 */

const CACHE_NAME = 'studyquality-v1.0.0';
const CACHE_URLS = [
    './',
    './index.html',
    './css/base.css',
    './css/auth.css',
    './css/dashboard.css',
    './css/users.css',
    './css/modals.css',
    './css/reports.css',
    './css/responsive.css',
    './js/utils/constants.js',
    './js/utils/helpers.js',
    './js/utils/validators.js',
    './js/utils/storage.js',
    './js/utils/api.js',
    './js/modules/auth.js',
    './js/modules/notifications.js',
    './js/app.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('📱 Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📱 Service Worker: Cacheando archivos...');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                console.log('📱 Service Worker: Instalación completada');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('📱 Service Worker: Error en instalación:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('📱 Service Worker: Activando...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('📱 Service Worker: Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('📱 Service Worker: Activación completada');
                return self.clients.claim();
            })
    );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si está en cache, devolverlo
                if (response) {
                    return response;
                }
                
                // Si no está en cache, hacer fetch
                return fetch(event.request)
                    .then((response) => {
                        // Solo cachear requests exitosos
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar la respuesta
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Si falla el fetch y no está en cache, mostrar página offline
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Notificar actualizaciones
self.addEventListener('updatefound', () => {
    console.log('📱 Service Worker: Actualización encontrada');
});

console.log('📱 Service Worker: Script cargado');