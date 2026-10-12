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
