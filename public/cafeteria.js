const cart = new Map();
const cartCount = document.querySelector('#cart-count');
const orderMessage = document.querySelector('#order-message');
const orderTotal = document.querySelector('#order-total');
const checkoutButton = document.querySelector('#checkout-button');
const toast = document.querySelector('#toast');
let toastTimer;

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

        cart.clear();
        updateOrder();
        showToast(`Pedido #${result.id} guardado. ¡Pasa a recogerlo en 15 minutos!`);
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
