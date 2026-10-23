const cart = new Map();
const cartCount = document.querySelector('#cart-count');
const orderMessage = document.querySelector('#order-message');
const orderTotal = document.querySelector('#order-total');
const checkoutButton = document.querySelector('#checkout-button');
const toast = document.querySelector('#toast');
const orderHistory = document.querySelector('#order-history');
const historyEmpty = document.querySelector('#history-empty');
let toastTimer;
const ORDER_DATABASE = 'cafe-de-barrio';
const ORDER_STORE = 'orders';

function openOrderDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(ORDER_DATABASE, 1);

        request.addEventListener('upgradeneeded', () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(ORDER_STORE)) {
                database.createObjectStore(ORDER_STORE, { keyPath: 'id' });
            }
        });
        request.addEventListener('success', () => resolve(request.result), { once: true });
        request.addEventListener('error', () => reject(request.error), { once: true });
    });
}

async function saveOrderLocally(order) {
    const database = await openOrderDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(ORDER_STORE, 'readwrite');
        transaction.objectStore(ORDER_STORE).put(order);
        transaction.addEventListener('complete', () => {
            database.close();
            resolve();
        }, { once: true });
        transaction.addEventListener('error', () => {
            database.close();
            reject(transaction.error);
        }, { once: true });
        transaction.addEventListener('abort', () => {
            database.close();
            reject(transaction.error || new Error('La transacción de IndexedDB fue cancelada.'));
        }, { once: true });
    });
}

async function loadOrderHistory() {
    const database = await openOrderDatabase();

    const orders = await new Promise((resolve, reject) => {
        const transaction = database.transaction(ORDER_STORE, 'readonly');
        const request = transaction.objectStore(ORDER_STORE).getAll();
        request.addEventListener('success', () => resolve(request.result), { once: true });
        request.addEventListener('error', () => reject(request.error), { once: true });
        transaction.addEventListener('complete', () => database.close(), { once: true });
        transaction.addEventListener('abort', () => {
            database.close();
            reject(transaction.error || new Error('No se pudo leer el historial de IndexedDB.'));
        }, { once: true });
    });

    orders.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
    orderHistory.replaceChildren();
    historyEmpty.hidden = orders.length > 0;

    orders.forEach((order) => {
        const entry = document.createElement('li');
        entry.className = 'history-card';

        const heading = document.createElement('div');
        heading.className = 'history-card-heading';
        const number = document.createElement('strong');
        number.textContent = `Pedido #${order.id}`;
        const date = document.createElement('time');
        date.dateTime = order.createdAt;
        date.textContent = new Date(order.createdAt).toLocaleString('es-MX');
        heading.append(number, date);

        const items = document.createElement('p');
        items.textContent = order.items.map((item) => `${item.quantity} × ${item.name}`).join(', ');
        const total = document.createElement('strong');
        total.className = 'history-total';
        total.textContent = `$${order.total}`;
        entry.append(heading, items, total);
        orderHistory.append(entry);
    });
}

function updateOrder() {
    const quantity = [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
    const total = [...cart.values()].reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartCount.textContent = quantity;
    orderTotal.textContent = `$${total}`;
    orderMessage.textContent = quantity
        ? `${quantity} ${quantity === 1 ? 'producto agregado' : 'productos agregados'} a tu pedido.`
        : 'Todavía no agregas nada rico. ¡Elige algo del menú!';
    checkoutButton.disabled = quantity === 0 || !navigator.onLine;
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
}

const locationPermission = document.querySelector('#location-permission');
const locationMessage = document.querySelector('#location-message');
const locationButton = document.querySelector('#location-button');
const locationCoordinates = document.querySelector('#location-coordinates');
const locationLatitude = document.querySelector('#location-latitude');
const locationLongitude = document.querySelector('#location-longitude');
const locationMap = document.querySelector('#location-map');
const notificationButton = document.querySelector('#notification-button');
const notificationMessage = document.querySelector('#notification-message');
const GEOLOCATION_ERROR = {
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
};

function showLocationPermission(state) {
    const permissionMessages = {
        granted: 'Permiso concedido',
        prompt: 'Aún no se ha solicitado',
        denied: 'Permiso denegado',
    };

    locationPermission.textContent = permissionMessages[state] || 'Estado no disponible';
}

async function checkLocationPermission() {
    if (!navigator.permissions || typeof navigator.permissions.query !== 'function') {
        locationPermission.textContent = 'Consulta de permisos no disponible en este navegador';
        return;
    }

    try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        showLocationPermission(permission.state);
        permission.addEventListener('change', () => showLocationPermission(permission.state));
    } catch (error) {
        locationPermission.textContent = 'No se pudo consultar el estado del permiso';
        console.error('No se pudo consultar el permiso de geolocalización:', error);
    }
}

locationButton.addEventListener('click', () => {
    if (!window.isSecureContext) {
        locationMessage.textContent = 'La geolocalización necesita una conexión segura (HTTPS o localhost).';
        return;
    }

    if (!navigator.geolocation) {
        locationMessage.textContent = 'Este navegador no ofrece el servicio de geolocalización.';
        return;
    }

    locationButton.disabled = true;
    locationMessage.textContent = 'Si aparece el aviso del navegador, selecciona Permitir. Buscando tu ubicación…';
    locationCoordinates.hidden = true;
    locationMap.hidden = true;

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const latitudeText = latitude.toFixed(6);
        const longitudeText = longitude.toFixed(6);

        locationLatitude.textContent = `${latitudeText}°`;
        locationLongitude.textContent = `${longitudeText}°`;
        locationCoordinates.hidden = false;
        locationMap.href = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
        locationMap.hidden = false;
        locationMessage.textContent = 'Ubicación obtenida correctamente.';
        locationButton.disabled = false;
        showLocationPermission('granted');
    }, (error) => {
        const errorMessages = {
            [GEOLOCATION_ERROR.PERMISSION_DENIED]: 'Se denegó el permiso. Puedes cambiarlo desde la configuración del navegador.',
            [GEOLOCATION_ERROR.POSITION_UNAVAILABLE]: 'El dispositivo no pudo determinar la ubicación.',
            [GEOLOCATION_ERROR.TIMEOUT]: 'La solicitud tardó demasiado. Inténtalo nuevamente.',
        };

        locationMessage.textContent = errorMessages[error.code] || 'Ocurrió un error al obtener la ubicación.';
        locationButton.disabled = false;

        if (error.code === GEOLOCATION_ERROR.PERMISSION_DENIED) {
            showLocationPermission('denied');
        }
    }, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 30000,
    });
});

checkLocationPermission();

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

document.querySelectorAll('.add-button').forEach((button) => {
    button.addEventListener('click', () => {
        const { productId, name, price } = button.dataset;
        const item = cart.get(productId) ?? { name, price: Number(price), quantity: 0 };
        item.quantity += 1;
        cart.set(productId, item);
        updateOrder();
        showToast(`${name} agregado a tu pedido`);
    });
});

document.querySelectorAll('.category-chip').forEach((button) => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        document.querySelectorAll('.category-chip').forEach((chip) => {
            const selected = chip === button;
            chip.classList.toggle('selected', selected);
            chip.setAttribute('aria-pressed', String(selected));
        });
        document.querySelectorAll('.menu-card').forEach((card) => {
            card.hidden = category !== 'todos' && card.dataset.category !== category;
        });
    });
});

checkoutButton.addEventListener('click', async () => {
    if (cart.size === 0 || !navigator.onLine) return;

    const originalText = checkoutButton.innerHTML;
    checkoutButton.disabled = true;
    checkoutButton.textContent = 'Guardando pedido...';

    try {
        const tokenResponse = await fetch('/csrf-token', {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store',
        });
        const { token } = await tokenResponse.json();

        if (!tokenResponse.ok || !token) {
            throw new Error('No se pudo validar la sesión. Recarga la página e inténtalo de nuevo.');
        }

        const response = await fetch('/orders', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
            },
            body: JSON.stringify({
                items: [...cart.entries()].map(([productId, item]) => ({
                    product_id: productId,
                    quantity: item.quantity,
                })),
            }),
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'No se pudo guardar el pedido.');
        }

        const savedOrder = {
            id: result.id,
            total: result.total,
            status: result.status,
            createdAt: new Date().toISOString(),
            items: [...cart.values()].map((item) => ({
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.price,
            })),
        };
        cart.clear();
        updateOrder();

        try {
            await saveOrderLocally(savedOrder);
            await loadOrderHistory();
            showToast(`Pedido #${result.id} guardado. ¡Pasa a recogerlo en 15 minutos!`);
        } catch (error) {
            console.error('El servidor guardó el pedido, pero no se pudo guardar en IndexedDB:', error);
            showToast(`Pedido #${result.id} guardado en el servidor, pero no en el historial local.`);
        }
    } catch (error) {
        showToast(error.message || 'No se pudo guardar el pedido. Inténtalo de nuevo.');
    } finally {
        checkoutButton.innerHTML = originalText;
        updateOrder();
    }
});

const offlineBanner = document.querySelector('#offline-banner');
function updateConnectionStatus() {
    offlineBanner.hidden = navigator.onLine;
    updateOrder();
    loadOrderHistory().catch((error) => {
        console.error('No se pudo cargar el historial de IndexedDB:', error);
        historyEmpty.textContent = 'No se pudo cargar el historial guardado en este navegador.';
    });
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
updateConnectionStatus();

let installPrompt;
const installButton = document.querySelector('#install-button');
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
});

window.addEventListener('appinstalled', () => {
    installButton.hidden = true;
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch((error) => console.error('No se pudo registrar el service worker:', error));
    });
}

updateOrder();
