# Ejercicio 2: App Shell y Splash Screen nativa

La interfaz responsive de Café de Barrio proporciona el App Shell: encabezado con marca y acciones, navegación, contenido principal con menú y pedido, y pie de página. Los estilos adaptan la cuadrícula y la navegación a pantallas pequeñas.

## Archivos

- [`welcome.blade.php`](../../resources/views/welcome.blade.php): estructura HTML del encabezado, menú, contenido principal y pie.
- [`cafeteria.css`](../../public/cafeteria.css): estilos y breakpoints responsive.
- [`manifest.json`](../../public/manifest.json): `display`, `background_color` y colores usados por el navegador durante la instalación.

## Comprobación

En Chrome DevTools, revisa **Application → Manifest** y simula distintos tamaños de pantalla con Device Toolbar. Instala la aplicación desde Chrome para comprobar la Splash Screen nativa; su aspecto depende del navegador y del sistema operativo.
