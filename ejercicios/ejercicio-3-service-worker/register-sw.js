if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.info('Service Worker registrado:', registration.scope);
        } catch (error) {
            console.error('No se pudo registrar el Service Worker:', error);
        }
    }, { once: true });
}
