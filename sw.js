const CACHE_NAME = 'zapfilm-pro-cache-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-icon-zap192.png',
    '/icons/icon-icon-zap512.png',
    // Adicione aqui todos os recursos que deseja cachear
    'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css',
    'https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap',
    // Outros URLs externos que seu app utiliza
];

// Instalando o Service Worker e cacheando os recursos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Interceptando requisições e servindo do cache quando possível
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - retorna a resposta do cache
                if (response) {
                    return response;
                }

                // Clone da requisição pois ela é consumida uma vez
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Verifica se recebemos uma resposta válida
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone da resposta para cachear
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Atualizando o Service Worker e limpando o cache antigo
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
