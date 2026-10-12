# Ejercicio 2: App Shell y Splash Screen nativa

El ejemplo `app-shell.html` y su hoja `app-shell.css` implementan el App Shell responsive: encabezado, navegación, contenido, menú, zona del pedido y pie. La versión completa de Café de Barrio está integrada en Laravel.

## Archivos

- [`app-shell.html`](./app-shell.html) y [`app-shell.css`](./app-shell.css): código completo de ejemplo para este ejercicio.
- [`welcome.blade.php`](../../resources/views/welcome.blade.php) y [`cafeteria.css`](../../public/cafeteria.css): implementación integrada y estilos responsive.
- [`manifest.json`](../../public/manifest.json): `display`, `background_color` y colores usados por el navegador durante la instalación.

## Comprobación

En Chrome DevTools, revisa **Application → Manifest** y simula distintos tamaños de pantalla con Device Toolbar. Instala la aplicación desde Chrome para comprobar la Splash Screen nativa; su aspecto depende del navegador y del sistema operativo.
