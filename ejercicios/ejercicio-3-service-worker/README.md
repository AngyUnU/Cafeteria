# Ejercicio 3: registro y ciclo de vida del Service Worker

El ejemplo registra el Service Worker después de cargar la página y muestra sus eventos de ciclo de vida. El archivo de esta carpeta es autónomo; la aplicación integrada combina estos eventos con el App Shell y la estrategia Cache-First.

## Archivos

- [`register-sw.js`](./register-sw.js): registro asíncrono y manejo explícito de errores.
- [`sw.js`](./sw.js): ciclo de vida `install`, `activate` y `fetch`.
- [`cafeteria.js`](../../public/cafeteria.js) y [`sw.js`](../../public/sw.js): implementación integrada.

## Comprobación

En Chrome DevTools → **Application → Service Workers**, confirma que `/sw.js` está activo y controla la página. Usa **Update** o **Unregister** para inspeccionar de nuevo el ciclo de vida durante el desarrollo.
