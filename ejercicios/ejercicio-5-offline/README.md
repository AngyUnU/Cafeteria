# Ejercicio 5: interceptor de peticiones y modo sin conexión

El interceptor intenta resolver cada petición GET local desde la caché antes de usar la red. Si falla la red al navegar a una URL no almacenada, devuelve la plantilla `offline.html`. La página principal en caché continúa disponible y muestra un aviso cuando el navegador detecta que no hay conexión.

El modo sin conexión no guarda ni sincroniza pedidos: el envío requiere conexión al servidor.

## Archivos

- [`sw.js`](../../public/sw.js): interceptor `fetch` y fallback para navegaciones sin respuesta de red.
- [`offline.html`](../../public/offline.html): plantilla personalizada con opción para volver a intentar.
- [`cafeteria.js`](../../public/cafeteria.js) y [`welcome.blade.php`](../../resources/views/welcome.blade.php): estado de conectividad y aviso offline.

## Comprobación

Con el Service Worker activo, habilita **Network → Offline** e intenta abrir una ruta que no esté en el App Shell. Debe aparecer la vista alternativa. Al volver a la página inicial, el menú guardado y el aviso de desconexión deben permanecer visibles.
