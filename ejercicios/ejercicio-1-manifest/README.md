# Ejercicio 1: Web App Manifest y metadatos de instalación

El HTML principal enlaza el manifest y define metadatos compatibles con instalación en navegadores móviles. El manifest configura nombre, nombre corto, URL de inicio, alcance, modo `standalone`, colores de tema y fondo, orientación e iconos PNG.

## Archivos

- [`manifest.json`](../../public/manifest.json)
- [`welcome.blade.php`](../../resources/views/welcome.blade.php): enlace al manifest, metadatos HTML e iconos de acceso.
- [`icon-192.png`](../../public/pwa-icons/icon-192.png) y [`icon-512.png`](../../public/pwa-icons/icon-512.png)

## Comprobación

En Chrome, abre DevTools → **Application → Manifest**. Revisa las propiedades y que ambos iconos carguen con sus dimensiones declaradas. Al instalar, el modo `standalone` abre la aplicación sin la barra de navegación del navegador.
