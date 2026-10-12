# Ejercicio 1: Web App Manifest y metadatos de instalación

El archivo `manifest.json` y el ejemplo HTML de esta carpeta definen nombre, nombre corto, URL de inicio, alcance, modo `standalone`, colores de tema y fondo, orientación e iconos PNG. La aplicación integrada usa los mismos valores.

## Archivos

- [`manifest.json`](./manifest.json): manifest completo del ejercicio.
- [`index.html`](./index.html): ejemplo del enlace al manifest y metadatos de instalación.
- [`manifest.json`](../../public/manifest.json) y [`welcome.blade.php`](../../resources/views/welcome.blade.php): implementación integrada.
- Iconos de la aplicación: [`icon-192.png`](../../public/icons/icon-192.png) y [`icon-512.png`](../../public/icons/icon-512.png).

## Comprobación

En Chrome, abre DevTools → **Application → Manifest**. Revisa las propiedades y que ambos iconos carguen con sus dimensiones declaradas. Al instalar, el modo `standalone` abre la aplicación sin la barra de navegación del navegador.
