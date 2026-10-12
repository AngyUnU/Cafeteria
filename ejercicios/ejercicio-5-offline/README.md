# Ejercicio 5: interceptor de peticiones y modo sin conexión

El interceptor intenta resolver cada petición GET local desde la caché antes de usar la red. Si falla la red al navegar a una URL no almacenada, devuelve `offline.html`. El ejemplo también incluye persistencia del historial confirmado mediante IndexedDB. La aplicación integrada muestra el historial al recargar la página.

## Archivos

- [`sw.js`](./sw.js): interceptor `fetch` y fallback offline.
- [`offline.html`](./offline.html): página alternativa completa.
- [`indexeddb-orders.js`](./indexeddb-orders.js): persistencia local de pedidos confirmados.
- [`cafeteria.js`](../../public/cafeteria.js), [`welcome.blade.php`](../../resources/views/welcome.blade.php) y [`sw.js`](../../public/sw.js): implementación integrada.

## Comprobación

Con el Service Worker activo, habilita **Network → Offline** e intenta abrir una ruta que no esté en el App Shell. Debe aparecer la vista alternativa. Al volver a la página inicial, el menú guardado y el aviso de desconexión deben permanecer visibles.

Los pedidos necesitan conexión para confirmarse y guardarse en SQLite. Después se copian en IndexedDB para mantener visible el historial de este navegador. Inspecciónalo en DevTools → **Application → IndexedDB → cafe-de-barrio → orders**. Esto no encola pedidos sin conexión.
