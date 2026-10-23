# Ejercicio 8

```html
<section class="location-section" id="notificaciones" aria-labelledby="notification-title">
    <div class="section-heading">
        <div><span class="eyebrow">AVISOS DE CAFÉ DE BARRIO</span><h2 id="notification-title">Notificaciones locales</h2></div>
        <p>Recibe un aviso personalizado<br>desde el Service Worker.</p>
    </div>
    <div class="location-card">
        <p class="location-description" id="notification-message" role="status" aria-live="polite">Pulsa el botón para solicitar permiso y mostrar una notificación de prueba.</p>
        <button class="checkout-button location-button" id="notification-button" type="button">Activar notificaciones <span aria-hidden="true">→</span></button>
    </div>
</section>
```

```js
const notificationButton = document.querySelector('#notification-button');
const notificationMessage = document.querySelector('#notification-message');

notificationButton.addEventListener('click', async () => {
    if (!window.isSecureContext) {
        notificationMessage.textContent = 'Las notificaciones requieren HTTPS o localhost.';
        return;
    }

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        notificationMessage.textContent = 'Este navegador no ofrece notificaciones locales con Service Worker.';
        return;
    }

    notificationButton.disabled = true;
    notificationMessage.textContent = 'Solicitando permiso para mostrar notificaciones…';

    try {
        const permission = Notification.permission === 'default'
            ? await Notification.requestPermission()
            : Notification.permission;

        if (permission !== 'granted') {
            notificationMessage.textContent = permission === 'denied'
                ? 'Permiso denegado. Puedes cambiarlo desde la configuración del navegador.'
                : 'No se concedió el permiso para mostrar notificaciones.';
            return;
        }

        const registration = await navigator.serviceWorker.ready;
        const channel = new MessageChannel();
        const notificationResult = new Promise((resolve, reject) => {
            const timeout = window.setTimeout(() => {
                channel.port1.close();
                reject(new Error('El Service Worker no respondió a tiempo.'));
            }, 10000);

            channel.port1.addEventListener('message', (event) => {
                window.clearTimeout(timeout);
                channel.port1.close();

                if (event.data?.success) {
                    resolve();
                } else {
                    reject(new Error(event.data?.error || 'No se pudo mostrar la notificación.'));
                }
            }, { once: true });
        });

        registration.active.postMessage(
            { type: 'SHOW_LOCAL_NOTIFICATION' },
            [channel.port2],
        );
        await notificationResult;
        notificationMessage.textContent = 'Permiso concedido. Se mostró la notificación de Café de Barrio.';
    } catch (error) {
        console.error('No se pudo mostrar la notificación local:', error);
        notificationMessage.textContent = `No se pudo mostrar la notificación: ${error.message}`;
    } finally {
        notificationButton.disabled = false;
    }
});
```

```js
self.addEventListener('message', (event) => {
    if (event.data?.type !== 'SHOW_LOCAL_NOTIFICATION') return;

    const responsePort = event.ports[0];
    event.waitUntil(
        self.registration.showNotification('Café de Barrio', {
            body: 'Tu pausa favorita te espera. ¡Pasa por un cafecito!',
            icon: '/icons/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'cafe-de-barrio-local',
        }).then(() => {
            responsePort?.postMessage({ success: true });
        }).catch((error) => {
            console.error('No se pudo mostrar la notificación local:', error);
            responsePort?.postMessage({ success: false, error: error.message });
        }),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(self.clients.openWindow('/'));
});
```

- [`cafeteria.js`](../../public/cafeteria.js)
- [`sw.js`](../../public/sw.js)
- [`welcome.blade.php`](../../resources/views/welcome.blade.php)
