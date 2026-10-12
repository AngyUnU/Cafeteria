# Ejercicio 4: Cache API y estrategia Cache-First

Durante `install`, el Service Worker precarga el App Shell en una caché con versión. En las peticiones GET del mismo origen, busca primero una respuesta en Cache API y consulta la red si no la encuentra. En `activate`, elimina versiones antiguas de la caché propia sin tocar cachés de otras aplicaciones.

## Recursos precargados

- Página principal: `/`
- Vista alternativa: `/offline.html`
- Manifest, CSS, JavaScript e iconos PNG de 192 y 512 píxeles

La ruta `/csrf-token` se consulta directamente en la red para no reutilizar tokens de sesión almacenados. Las peticiones que no sean GET no se interceptan.

## Archivos

- [`sw.js`](../../public/sw.js): precarga, versionado, limpieza y resolución Cache-First.
- [`cafeteria.css`](../../public/cafeteria.css) y [`cafeteria.js`](../../public/cafeteria.js): recursos de interfaz precargados.

## Comprobación

En DevTools → **Application → Cache Storage**, inspecciona `cafe-de-barrio-v5`. En **Network**, activa modo Offline y recarga la página inicial para confirmar que el App Shell sigue disponible.
