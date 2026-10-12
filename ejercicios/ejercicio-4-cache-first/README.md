# Ejercicio 4: Cache API y estrategia Cache-First

El Service Worker de ejemplo precarga el App Shell en una caché versionada, atiende primero desde Cache API y elimina únicamente versiones anteriores de su propia caché. La ruta de token CSRF y las peticiones que no sean GET siempre quedan fuera de la caché.

## Recursos precargados

- Página principal: `/`
- Vista alternativa: `/offline.html`
- Manifest, CSS, JavaScript e iconos PNG de 192 y 512 píxeles

La ruta `/csrf-token` se consulta directamente en la red para no reutilizar tokens de sesión almacenados. Las peticiones que no sean GET no se interceptan.

## Archivos

- [`sw.js`](./sw.js): código completo del ejercicio Cache-First.
- [`cafeteria.css`](../../public/cafeteria.css), [`cafeteria.js`](../../public/cafeteria.js) y [`sw.js`](../../public/sw.js): recursos y estrategia integrados.

## Comprobación

En DevTools → **Application → Cache Storage**, inspecciona `cafe-de-barrio-v7`. En **Network**, activa modo Offline y recarga la página inicial para confirmar que el App Shell sigue disponible.
