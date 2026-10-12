# Ejercicio 3: registro y ciclo de vida del Service Worker

El JavaScript principal registra `/sw.js` de forma asíncrona cuando la página termina de cargar. El Service Worker atiende `install`, `activate` y `fetch`; durante la activación toma control de las páginas abiertas.

## Archivos

- [`cafeteria.js`](../../public/cafeteria.js): registro del Service Worker y reporte del error de registro en consola.
- [`sw.js`](../../public/sw.js): escuchadores de los eventos `install`, `activate` y `fetch`.

## Comprobación

En Chrome DevTools → **Application → Service Workers**, confirma que `/sw.js` está activo y controla la página. Usa **Update** o **Unregister** para inspeccionar de nuevo el ciclo de vida durante el desarrollo.
