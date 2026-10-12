# Portafolio de ejercicios PWA

Aplicación de ejemplo **Café de Barrio**, construida con Laravel, que reúne los cinco ejercicios de infraestructura de una Progressive Web App. Cada subcarpeta de [`ejercicios/`](./ejercicios/) describe un ejercicio y señala los archivos que forman parte de la implementación integrada.

## Ejercicios

1. [Web App Manifest y metadatos de instalación](./ejercicios/ejercicio-1-manifest/README.md)
2. [App Shell y Splash Screen nativa](./ejercicios/ejercicio-2-app-shell/README.md)
3. [Registro y ciclo de vida del Service Worker](./ejercicios/ejercicio-3-service-worker/README.md)
4. [Cache API y estrategia Cache-First](./ejercicios/ejercicio-4-cache-first/README.md)
5. [Interceptor de peticiones y modo sin conexión](./ejercicios/ejercicio-5-offline/README.md)

## Ejecutar localmente

1. Instala las dependencias de PHP con `composer install`.
2. Copia `.env.example` a `.env` si todavía no existe y genera la clave con `php artisan key:generate`.
3. Ejecuta `php artisan migrate`.
4. Inicia Laravel con `php artisan serve` y abre la URL local que indica Artisan.

El Service Worker requiere un contexto seguro: funciona en `localhost` para desarrollo y en HTTPS al publicar la aplicación. Sirve el proyecto desde la raíz del dominio, ya que el manifest y los recursos del App Shell usan rutas absolutas.

## Verificar la PWA en Chrome

- Abre DevTools → **Application → Manifest** para inspeccionar los metadatos y los iconos.
- En **Application → Service Workers**, confirma el registro de `/sw.js`.
- Usa **Application → Storage → Clear site data** antes de repetir una instalación o probar la primera precarga.
- En **Network**, activa **Offline** y recarga la página principal: el menú se sirve desde caché. Visita una URL que no se haya almacenado para comprobar la página alternativa.
- La Splash Screen nativa aparece al instalar la aplicación desde Chrome; su presentación depende del navegador y de la plataforma.

Los pedidos requieren conexión al servidor. El modo sin conexión mantiene disponible la interfaz y muestra el aviso de conectividad, pero no encola pedidos para enviarlos más tarde.
